import { render, screen } from "@testing-library/react";
import { Navbar } from "../navbar";
import { vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Navbar", () => {
  it("renders core navigation links", () => {
    render(<Navbar />);

    expect(screen.getByRole("link", { name: /get a claw/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /how it works/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /faq/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /github/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /get started/i })).toBeInTheDocument();
  });
});
