"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Github } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const navLinks = [
  { href: "/#how-it-works", label: "How it Works" },
  { href: "/#faq", label: "FAQ" },
  { href: "https://github.com/getaclaw/getaclaw", label: "GitHub", external: true },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 sm:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="font-heading text-xl font-bold tracking-tight text-text-primary"
        >
          Get a <span className="text-coral">Claw</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              {...(link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="flex items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
            >
              {link.label === "GitHub" && <Github className="h-4 w-4" />}
              {link.label}
            </a>
          ))}
          <div className="ml-2 h-5 w-px bg-border" />
          <ThemeToggle />
          <Link
            href="/setup"
            className="ml-3 rounded-[var(--radius-md)] bg-coral px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-coral/20 transition-all hover:bg-coral-hover hover:shadow-md hover:shadow-coral/25 active:bg-coral-active"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-text-secondary hover:bg-surface hover:text-text-primary"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-5 pb-4 pt-2 md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              {...(link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
            >
              {link.label === "GitHub" && <Github className="h-4 w-4" />}
              {link.label}
            </a>
          ))}
          <Link
            href="/setup"
            onClick={() => setMobileOpen(false)}
            className="mt-2 flex w-full items-center justify-center rounded-[var(--radius-md)] bg-coral px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-coral/20 transition-all hover:bg-coral-hover hover:shadow-md hover:shadow-coral/25"
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}
