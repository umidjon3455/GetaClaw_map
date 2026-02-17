import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-5 text-center">
      <p className="font-mono text-sm font-semibold text-coral">404</p>
      <h1 className="mt-3 font-heading text-3xl font-bold text-text-primary sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="rounded-[var(--radius-md)] bg-coral px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-coral-hover"
        >
          Go home
        </Link>
        <Link
          href="/setup"
          className="rounded-[var(--radius-md)] border border-border px-6 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface"
        >
          Start setup
        </Link>
      </div>
    </div>
  );
}
