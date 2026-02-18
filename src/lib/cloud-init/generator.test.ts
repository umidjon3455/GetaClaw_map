import { describe, expect, it, vi } from "vitest";
import { generateAgentPort, generateGatewayPort } from "./generator";

describe("generateAgentPort", () => {
  it("uses crypto.getRandomValues", () => {
    const spy = vi.spyOn(globalThis.crypto, "getRandomValues");

    generateAgentPort();

    expect(spy).toHaveBeenCalledOnce();
    spy.mockRestore();
  });

  it("returns port in allowed range", () => {
    for (let i = 0; i < 500; i += 1) {
      const port = generateAgentPort();
      expect(port).toBeGreaterThanOrEqual(30000);
      expect(port).toBeLessThanOrEqual(60000);
    }
  });
});

describe("generateGatewayPort", () => {
  it("uses crypto.getRandomValues", () => {
    const spy = vi.spyOn(globalThis.crypto, "getRandomValues");

    generateGatewayPort();

    expect(spy).toHaveBeenCalledOnce();
    spy.mockRestore();
  });

  it("returns port in allowed range", () => {
    for (let i = 0; i < 500; i += 1) {
      const port = generateGatewayPort();
      expect(port).toBeGreaterThanOrEqual(42000);
      expect(port).toBeLessThanOrEqual(55999);
    }
  });
});
