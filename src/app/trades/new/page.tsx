import  CreateTradeForm  from '@/components/trades/CreateTradeForm';

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <div className="grid gap-2">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
          Traderhub
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Open a new trade</h1>
        <p className="max-w-2xl text-muted-foreground">
          The migrated helper flow now lives inside the shared hub app. This keeps
          position sizing reusable while alerts are built alongside it.
        </p>
      </div>
      <CreateTradeForm />
    </div>
  );
}
