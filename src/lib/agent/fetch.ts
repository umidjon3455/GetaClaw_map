import https from "node:https";

export interface AgentFetchResult {
  ok: boolean;
  status: number;
  data: unknown;
}

export async function fetchAgent(
  host: string,
  port: number,
  path: string,
  timeoutMs = 10000
): Promise<AgentFetchResult> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      {
        hostname: host,
        port,
        path,
        rejectUnauthorized: false,
        timeout: timeoutMs,
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            const data = JSON.parse(body);
            resolve({ ok: res.statusCode === 200, status: res.statusCode ?? 0, data });
          } catch {
            resolve({ ok: false, status: res.statusCode ?? 0, data: body });
          }
        });
      }
    );

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Agent request timed out"));
    });

    req.on("error", (err) => {
      reject(err);
    });
  });
}
