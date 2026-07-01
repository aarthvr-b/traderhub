export default function AlertsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-12">
      <div className="grid gap-2">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
          Alerts
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Alert module scaffold</h1>
        <p className="max-w-2xl text-muted-foreground">
          Product docs have been migrated into <code>docs/alerts</code> and the
          shared Prisma schema now includes users, alerts, alert events, and
          Telegram connections.
        </p>
      </div>
    </main>
  );
}
