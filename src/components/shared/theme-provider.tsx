"use client";

import { useEffect } from "react";
import { initializeTheme } from "@/lib/store/theme-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializeTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const { theme, setTheme } = require("@/lib/store/theme-store").useThemeStore.getState();
      if (theme === "system") {
        setTheme("system");
      }
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return <>{children}</>;
}
