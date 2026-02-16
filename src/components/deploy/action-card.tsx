"use client";

import { Check, X, AlertTriangle, Loader2, Circle } from "lucide-react";
import { useState } from "react";
import type { ActionStep } from "./action-feed";

const statusConfig = {
  pending: {
    icon: Circle,
    iconClass: "text-text-muted",
    bgClass: "border-border",
  },
  running: {
    icon: Loader2,
    iconClass: "text-coral animate-spin",
    bgClass: "border-coral/30 bg-coral-light/30 dark:bg-coral-900/10",
  },
  success: {
    icon: Check,
    iconClass: "text-white",
    bgClass: "border-border",
    dotClass: "bg-sea-green text-white",
  },
  error: {
    icon: X,
    iconClass: "text-white",
    bgClass: "border-soft-red/30 bg-soft-red/5",
    dotClass: "bg-soft-red text-white",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-white",
    bgClass: "border-amber/30 bg-amber/5",
    dotClass: "bg-amber text-white",
  },
};

interface ActionCardProps {
  step: ActionStep;
}

export function ActionCard({ step }: ActionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[step.status];
  const Icon = config.icon;

  return (
    <div
      className={`relative ml-8 rounded-[var(--radius-md)] border p-4 transition-colors ${config.bgClass}`}
    >
      {/* Status dot on the timeline */}
      <div className="absolute -left-[25px] top-4">
        <div
          className={`flex h-[18px] w-[18px] items-center justify-center rounded-full ${
            step.status === "pending"
              ? "border-2 border-border bg-background dark:bg-dark-bg"
              : step.status === "running"
                ? "bg-coral"
                : (config as { dotClass?: string }).dotClass || "bg-sea-green"
          }`}
        >
          {step.status !== "pending" && (
            <Icon className={`h-2.5 w-2.5 ${step.status === "running" ? "text-white animate-spin" : "text-white"}`} strokeWidth={3} />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text-primary">
            {step.title}
          </p>
          <p className="mt-0.5 text-xs text-text-secondary">
            {step.description}
          </p>

          {/* Progress bar */}
          {step.status === "running" && step.progress !== undefined && (
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-sand dark:bg-dark-elevated">
              <div
                className="h-full rounded-full bg-coral transition-all duration-500 ease-out"
                style={{ width: `${step.progress}%` }}
              />
            </div>
          )}

          {/* Error message */}
          {step.status === "error" && step.error && (
            <div className="mt-2 rounded-[var(--radius-sm)] bg-soft-red/10 p-2">
              <p className="font-mono text-xs text-soft-red">{step.error}</p>
            </div>
          )}

          {/* Expandable logs */}
          {step.logs && step.logs.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-xs font-medium text-text-muted hover:text-text-secondary"
            >
              {expanded ? "Hide details" : "Show details"}
            </button>
          )}
          {expanded && step.logs && (
            <div className="mt-2 max-h-40 overflow-auto rounded-[var(--radius-sm)] bg-charcoal p-3 font-mono text-xs leading-relaxed text-sand">
              {step.logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          )}
        </div>

        {/* Duration */}
        {step.duration && (
          <span className="shrink-0 text-xs text-text-muted">
            {step.duration}s
          </span>
        )}
      </div>
    </div>
  );
}
