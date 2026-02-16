import type { ClientMessage, AgentMessage } from "./protocol";

type EventCallback = (message: AgentMessage) => void;

export class AgentConnection {
  private ws: WebSocket | null = null;
  private token: string;
  private url: string;
  private listeners: Map<string, EventCallback[]> = new Map();
  private pendingRequests: Map<
    string,
    { resolve: (data: AgentMessage) => void; reject: (err: Error) => void }
  > = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(host: string, port: number, token: string) {
    this.url = `wss://${host}:${port}/ws`;
    this.token = token;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: AgentMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch {
            // Ignore malformed messages
          }
        };

        this.ws.onerror = () => {
          reject(new Error("WebSocket connection failed"));
        };

        this.ws.onclose = () => {
          this.emit("disconnected", {
            type: "event",
            event: "disconnected",
          });
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  private handleMessage(message: AgentMessage) {
    // Response to a specific request
    if (message.id && this.pendingRequests.has(message.id)) {
      const { resolve, reject } = this.pendingRequests.get(message.id)!;
      this.pendingRequests.delete(message.id);
      if (message.status === "error") {
        reject(new Error(message.payload?.error || "Unknown error"));
      } else {
        resolve(message);
      }
      return;
    }

    // Event
    if (message.type === "event" && message.event) {
      this.emit(message.event, message);
    }

    // Broadcast all messages to "message" listeners
    this.emit("message", message);
  }

  async send(
    type: ClientMessage["type"],
    action: string,
    params?: Record<string, unknown>
  ): Promise<AgentMessage> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("Not connected");
    }

    const id = crypto.randomUUID();
    const message: ClientMessage = { id, type, action, params, token: this.token };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.ws!.send(JSON.stringify(message));

      // Timeout after 60 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error("Request timed out"));
        }
      }, 60000);
    });
  }

  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: EventCallback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      this.listeners.set(
        event,
        callbacks.filter((cb) => cb !== callback)
      );
    }
  }

  private emit(event: string, message: AgentMessage) {
    const callbacks = this.listeners.get(event) || [];
    for (const cb of callbacks) {
      try {
        cb(message);
      } catch {
        // Don't let listener errors break the connection
      }
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.pendingRequests.clear();
    this.listeners.clear();
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
