export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-[calc(100vh-64px)]">{children}</div>;
}
