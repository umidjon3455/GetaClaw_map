"use client";

import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/lib/store/theme-store";

export function ThemeToggle() {
  const { resolved, setTheme } = useThemeStore();

  return (
    <button
      onClick={() => setTheme(resolved === "light" ? "dark" : "light")}
      className="relative flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
      aria-label={`Switch to ${resolved === "light" ? "dark" : "light"} mode`}
    >
      <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
    </button>
  );
}
