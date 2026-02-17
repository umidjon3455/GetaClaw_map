import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - GetaClaw",
  description: "Manage your OpenClaw instances.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
