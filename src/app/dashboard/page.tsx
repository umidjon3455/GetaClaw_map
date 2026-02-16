"use client";

export default function DashboardPage() {
  return (
    <div className="px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-[960px]">
        <h1 className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">
          My Instances
        </h1>
        <p className="mt-3 text-text-secondary">
          Manage your OpenClaw instances. Set up a new one or update existing
          ones.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-border py-16">
          <p className="text-sm text-text-muted">
            No instances yet
          </p>
          <a
            href="/setup"
            className="mt-4 rounded-[var(--radius-md)] bg-coral px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-coral-hover"
          >
            Set Up Your First Instance
          </a>
        </div>
      </div>
    </div>
  );
}
