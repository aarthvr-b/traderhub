import Link from "next/link";

const cards = [
  {
    href: "/trades/new",
    title: "Trade Planner",
    description:
      "Reuse the helper’s position sizing flow inside the new unified traderhub app.",
  },
  {
    href: "/alerts",
    title: "Alert Module",
    description:
      "The alert feature is scaffolded in this repo and backed by shared docs and Prisma models.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(29,78,216,0.10),transparent_40%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-12">
        <div className="grid gap-5 rounded-[2rem] border border-slate-200/70 bg-white/85 p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">
            Traderhub
          </p>
          <div className="grid gap-4 md:max-w-3xl">
            <h1 className="text-5xl font-semibold tracking-tight text-slate-950">
              One clean repo for trade planning and crypto alerts.
            </h1>
            <p className="text-lg text-slate-600">
              This fresh workspace keeps the existing trade helper logic, adds shared
              alert architecture, and leaves room for a worker and persistent data
              without carrying forward old git history.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="grid gap-3 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1"
            >
              <span className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
                Module
              </span>
              <h2 className="text-2xl font-semibold text-slate-950">{card.title}</h2>
              <p className="text-slate-600">{card.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
