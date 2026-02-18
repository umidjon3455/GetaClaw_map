import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface px-5 py-12 sm:px-8">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-6">
          <span className="font-heading text-sm font-bold text-text-primary">
            Get a <span className="text-coral">Claw</span>
          </span>
          <span className="text-xs text-text-muted">
            Open source &middot; MIT License
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://openclaw.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-text-secondary hover:text-text-primary"
          >
            OpenClaw Docs
          </a>
          <a
            href="https://github.com/hristo2612/getaclaw"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary"
          >
            <Github className="h-3.5 w-3.5" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
