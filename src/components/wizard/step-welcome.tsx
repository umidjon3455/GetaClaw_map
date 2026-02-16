"use client";

import { useWizardStore, type SkillLevel } from "@/lib/store/wizard-store";
import { Sparkles, Code, Terminal } from "lucide-react";

const levels: { id: SkillLevel; icon: React.ElementType; title: string; description: string }[] = [
  {
    id: "beginner",
    icon: Sparkles,
    title: "Beginner",
    description: "I've never used a terminal or VPS before. Guide me through everything.",
  },
  {
    id: "intermediate",
    icon: Code,
    title: "Intermediate",
    description: "I know the basics. Keep explanations concise but helpful.",
  },
  {
    id: "advanced",
    icon: Terminal,
    title: "Advanced",
    description: "I'm a developer. Show me the raw details and let me override things.",
  },
];

export function StepWelcome() {
  const { skillLevel, setSkillLevel, nextStep } = useWizardStore();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">
        Welcome to Get a Claw
      </h1>
      <p className="mt-3 text-text-secondary">
        We&apos;ll set up your private OpenClaw AI assistant on your own server.
        The whole process takes about 5 minutes.
      </p>
      <p className="mt-6 text-sm font-medium text-text-primary">
        How comfortable are you with servers and terminals?
      </p>

      <div className="mt-4 space-y-3">
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => setSkillLevel(level.id)}
            className={`flex w-full items-start gap-4 rounded-[var(--radius-lg)] border p-4 text-left transition-colors ${
              skillLevel === level.id
                ? "border-coral bg-coral-light dark:border-coral dark:bg-coral-900/20"
                : "border-border hover:border-border-hover dark:hover:border-dark-border"
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] transition-colors ${
                skillLevel === level.id
                  ? "bg-coral text-white"
                  : "bg-sand/60 text-text-secondary dark:bg-dark-elevated"
              }`}
            >
              <level.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                {level.title}
              </p>
              <p className="mt-0.5 text-sm text-text-secondary">
                {level.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={nextStep}
          disabled={!skillLevel}
          className="rounded-[var(--radius-md)] bg-coral px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-coral-hover disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
