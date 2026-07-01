# traderhub

`traderhub` is the new canonical repository for a unified crypto trading utility app. It starts with the migrated trade helper flow from `cryptotradehelper` and the alert product planning from `price-alert-bot`, but it uses a fresh repo structure and fresh git history.

## Modules

- `src/app`: the single Next.js web app
- `src/domain/trades`: reusable trade planning logic such as `PositionCalculator`
- `src/domain/alerts`: reusable alert entities and value objects
- `src/server`: application use-cases for alert and trade workflows
- `src/worker`: future alert evaluation runtime
- `prisma`: shared database schema and seed entry point
- `docs/alerts`: migrated alert product and architecture docs

## Key routes

- `/`: landing page for the shared hub
- `/trades/new`: migrated trade entry and position sizing form

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:push`
- `npm run db:seed`
- `npm run worker:dev`

## Docs

- [Alert questions](docs/alerts/PROJECT_QUESTIONS.md)
- [Alert spec](docs/alerts/PROJECT_SPEC.md)
- [Alert structure](docs/alerts/PROJECT_STRUCTURE.md)
- [Alert development plan](docs/alerts/DEVELOPMENT_PLAN.md)
