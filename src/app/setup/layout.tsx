import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Setup Wizard - GetaClaw",
  description:
    "Step-by-step wizard to deploy your private OpenClaw AI assistant on your own VPS.",
  robots: { index: false, follow: false },
};

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-[calc(100vh-64px)]">{children}</div>;
}
