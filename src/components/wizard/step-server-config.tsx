"use client";

import { useWizardStore } from "@/lib/store/wizard-store";
import { MapPin, Cpu } from "lucide-react";

const HETZNER_REGIONS = [
  { id: "nbg1", name: "Nuremberg", flag: "DE", location: "Germany" },
  { id: "fsn1", name: "Falkenstein", flag: "DE", location: "Germany" },
  { id: "hel1", name: "Helsinki", flag: "FI", location: "Finland" },
  { id: "ash", name: "Ashburn", flag: "US", location: "Virginia, US" },
  { id: "hil", name: "Hillsboro", flag: "US", location: "Oregon, US" },
  { id: "sin", name: "Singapore", flag: "SG", location: "Singapore" },
];

const DO_REGIONS = [
  { id: "nyc1", name: "New York 1", flag: "US", location: "New York, US" },
  { id: "sfo3", name: "San Francisco 3", flag: "US", location: "San Francisco, US" },
  { id: "ams3", name: "Amsterdam 3", flag: "NL", location: "Netherlands" },
  { id: "sgp1", name: "Singapore 1", flag: "SG", location: "Singapore" },
  { id: "lon1", name: "London 1", flag: "GB", location: "United Kingdom" },
  { id: "fra1", name: "Frankfurt 1", flag: "DE", location: "Germany" },
];

const HETZNER_SIZES = [
  { id: "cx23", name: "CX23", specs: "2 vCPU, 4 GB RAM", price: "€3.59/mo", recommended: true },
  { id: "cx33", name: "CX33", specs: "4 vCPU, 8 GB RAM", price: "€5.99/mo" },
  { id: "cx43", name: "CX43", specs: "8 vCPU, 16 GB RAM", price: "€10.79/mo" },
];

const DO_SIZES = [
  { id: "s-1vcpu-2gb", name: "Basic", specs: "1 vCPU, 2 GB RAM", price: "$12/mo" },
  { id: "s-2vcpu-4gb", name: "Regular", specs: "2 vCPU, 4 GB RAM", price: "$24/mo", recommended: true },
  { id: "s-2vcpu-4gb-amd", name: "Regular AMD", specs: "2 vCPU, 4 GB RAM", price: "$21/mo" },
];

export function StepServerConfig() {
  const {
    vpsProvider,
    serverRegion,
    setServerRegion,
    serverSize,
    setServerSize,
    serverName,
    setServerName,
    nextStep,
    prevStep,
    skillLevel,
  } = useWizardStore();

  const regions = vpsProvider === "hetzner" ? HETZNER_REGIONS : DO_REGIONS;
  const sizes = vpsProvider === "hetzner" ? HETZNER_SIZES : DO_SIZES;
  const canContinue = serverRegion && serverSize && serverName.trim();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">
        Configure your server
      </h1>
      <p className="mt-3 text-text-secondary">
        Choose where and how powerful your server should be.
      </p>

      {/* Server name */}
      <div className="mt-8">
        <label className="block text-sm font-medium text-text-primary">
          Server name
        </label>
        {skillLevel === "beginner" && (
          <p className="mt-1 text-sm text-text-secondary">
            A friendly name so you can identify this server later.
          </p>
        )}
        <input
          type="text"
          value={serverName}
          onChange={(e) => setServerName(e.target.value.replace(/[^a-zA-Z0-9-]/g, ""))}
          placeholder="my-ai-assistant"
          maxLength={40}
          className="mt-2 w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20 dark:bg-dark-surface"
        />
      </div>

      {/* Region */}
      <div className="mt-8">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-text-muted" />
          <label className="text-sm font-medium text-text-primary">
            Server location
          </label>
        </div>
        {skillLevel === "beginner" && (
          <p className="mt-1 text-sm text-text-secondary">
            Choose a location closest to you for the best speed.
          </p>
        )}
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {regions.map((region) => (
            <button
              key={region.id}
              onClick={() => setServerRegion(region.id)}
              className={`rounded-[var(--radius-md)] border px-3 py-2.5 text-left text-sm transition-colors ${
                serverRegion === region.id
                  ? "border-coral bg-coral-light dark:border-coral dark:bg-coral-900/20"
                  : "border-border hover:border-border-hover dark:hover:border-dark-border"
              }`}
            >
              <p className="font-medium text-text-primary">{region.name}</p>
              <p className="text-xs text-text-muted">{region.location}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Server size */}
      <div className="mt-8">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-text-muted" />
          <label className="text-sm font-medium text-text-primary">
            Server size
          </label>
        </div>
        <div className="mt-3 space-y-2">
          {sizes.map((size) => (
            <button
              key={size.id}
              onClick={() => setServerSize(size.id)}
              className={`flex w-full items-center justify-between rounded-[var(--radius-md)] border px-4 py-3 text-left transition-colors ${
                serverSize === size.id
                  ? "border-coral bg-coral-light dark:border-coral dark:bg-coral-900/20"
                  : "border-border hover:border-border-hover dark:hover:border-dark-border"
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-text-primary">
                    {size.name}
                  </p>
                  {size.recommended && (
                    <span className="rounded-full bg-sea-green/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sea-green">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-secondary">{size.specs}</p>
              </div>
              <p className="text-sm font-medium text-coral">{size.price}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={prevStep}
          className="rounded-[var(--radius-md)] border border-border px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-sand/40 dark:hover:bg-dark-elevated"
        >
          Back
        </button>
        <button
          onClick={nextStep}
          disabled={!canContinue}
          className="rounded-[var(--radius-md)] bg-coral px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-coral-hover disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
