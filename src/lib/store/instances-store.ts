import { create } from "zustand";
import type { Channel, SecurityMode, VpsProvider } from "./wizard-store";

export interface Instance {
  id: string;
  name: string;
  createdAt: string;
  vpsProvider: VpsProvider;
  vpsId: string;
  serverIp: string;
  serverRegion: string;
  agentPort: number;
  gatewayPort?: number;
  agentToken: string;
  gatewayToken: string;
  securityMode: SecurityMode;
  tailscaleHostname?: string;
  openclawVersion?: string;
  status:
    | "provisioning"
    | "setting_up"
    | "online"
    | "offline"
    | "error";
  lastHealthCheck?: string;
  channels: Channel[];
}

interface InstancesState {
  instances: Instance[];
  loaded: boolean;
  loadInstances: () => void;
  addInstance: (instance: Instance) => void;
  updateInstance: (id: string, updates: Partial<Instance>) => void;
  removeInstance: (id: string) => void;
}

const STORAGE_KEY = "getaclaw-instances";

function saveToStorage(instances: Instance[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(instances));
  } catch {
    // Storage full or unavailable
  }
}

function loadFromStorage(): Instance[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export const useInstancesStore = create<InstancesState>((set, get) => ({
  instances: [],
  loaded: false,

  loadInstances: () => {
    if (typeof window === "undefined") return;
    const instances = loadFromStorage();
    set({ instances, loaded: true });
  },

  addInstance: (instance) => {
    const instances = [...get().instances, instance];
    saveToStorage(instances);
    set({ instances });
  },

  updateInstance: (id, updates) => {
    const instances = get().instances.map((inst) =>
      inst.id === id ? { ...inst, ...updates } : inst
    );
    saveToStorage(instances);
    set({ instances });
  },

  removeInstance: (id) => {
    const instances = get().instances.filter((inst) => inst.id !== id);
    saveToStorage(instances);
    set({ instances });
  },
}));
