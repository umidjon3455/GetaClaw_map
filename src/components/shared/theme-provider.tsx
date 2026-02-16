"use client";

import { useEffect } from "react";
import { initializeTheme, useThemeStore } from "@/lib/store/theme-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializeTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const { theme, setTheme } = useThemeStore.getState();
      if (theme === "system") {
        setTheme("system");
      }
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return <>{children}</>;
}
