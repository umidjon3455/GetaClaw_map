"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ActionCard } from "./action-card";

export interface ActionStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "running" | "success" | "error" | "warning";
  progress?: number;
  duration?: number;
  estimatedDuration?: number;
  logs?: string[];
  error?: string;
}

interface ActionFeedProps {
  steps: ActionStep[];
}

export function ActionFeed({ steps }: ActionFeedProps) {
  return (
    <div className="relative">
      {/* Timeline connector line */}
      <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-border dark:bg-dark-border" />

      <div className="space-y-3">
        <AnimatePresence>
          {steps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <ActionCard step={step} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
