import { create } from "zustand";

type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") return getSystemTheme();
  return theme;
}

function applyTheme(resolved: "light" | "dark") {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "light",
  resolved: "light",
  setTheme: (theme) => {
    const resolved = resolveTheme(theme);
    applyTheme(resolved);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("getaclaw-theme", theme);
    }
    set({ theme, resolved });
  },
}));

export function initializeTheme() {
  const stored =
    typeof localStorage !== "undefined"
      ? (localStorage.getItem("getaclaw-theme") as Theme | null)
      : null;
  const theme = stored || "light";
  const resolved = resolveTheme(theme);
  applyTheme(resolved);
  useThemeStore.setState({ theme, resolved });
}
