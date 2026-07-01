# Price Alert Bot Initial Folder Structure

## Goal

Start `price-alert-bot` as focused alert product.
Keep structure easy to merge later into unified trading hub.

Core rule:

- separate domain logic from framework code
- separate web app from background alert execution
- keep shared types and schemas reusable

## Recommended Initial Structure

```text
price-alert-bot/
  PROJECT_QUESTIONS.md
  PROJECT_SPEC.md
  PROJECT_STRUCTURE.md
  package.json
  tsconfig.json
  .env.example
  .gitignore

  src/
    app/
      layout.tsx
      page.tsx
      alerts/
        page.tsx
        new/
          page.tsx
        [alertId]/
          page.tsx
      settings/
        page.tsx
      api/
        alerts/
          route.ts
        telegram/
          connect/
            route.ts
        health/
          route.ts

    components/
      alerts/
        AlertForm.tsx
        AlertList.tsx
        AlertCard.tsx
      layout/
        AppShell.tsx
        Sidebar.tsx
        Header.tsx
      ui/
        ...

    lib/
      env.ts
      db.ts
      auth.ts
      telegram.ts
      hyperliquid.ts
      chart-links.ts
      utils.ts

    domain/
      alerts/
        entities/
          Alert.ts
          AlertEvent.ts
        value-objects/
          AlertCondition.ts
          AlertStatus.ts
          PriceSource.ts
        services/
          AlertEvaluator.ts
          AlertCooldown.ts
        repositories/
          AlertRepository.ts
      users/
        entities/
          User.ts
      notifications/
        services/
          NotificationFormatter.ts

    server/
      alerts/
        create-alert.ts
        update-alert.ts
        delete-alert.ts
        list-alerts.ts
      telegram/
        register-chat.ts

    worker/
      index.ts
      jobs/
        process-alerts.ts
      services/
        market-data.ts
        alert-runner.ts
        delivery.ts

    db/
      schema/
        users.ts
        alerts.ts
        alert-events.ts
        telegram-connections.ts
      migrations/
      seed.ts

    schemas/
      alertSchema.ts
      settingsSchema.ts

    types/
      alert.ts
      telegram.ts

    config/
      alert-defaults.ts
      app.ts
```

## Why This Structure

### `src/app`

Next.js app router layer.
Only UI pages, route handlers, layout concerns.
Should not hold core trading or alert business logic.

### `src/components`

Reusable UI pieces.
Keep feature components grouped by domain.

### `src/lib`

Framework and infrastructure helpers:

- env loading
- DB client
- auth client
- Telegram client
- Hyperliquid client

Rule:

- `lib` for adapters and utilities
- not for core business rules

### `src/domain`

Most important folder.
Put alert logic here:

- trigger semantics
- cooldown rules
- crossing logic
- price evaluation

This is what you want to keep portable later when moving into shared package in monorepo.

### `src/server`

Application use cases.
Connect UI/API requests to domain + DB.

Examples:

- create alert
- update alert
- delete alert
- list alerts

Think:

- `domain` = business rules
- `server` = orchestration

### `src/worker`

Background runtime.
Separate from request/response web app.

This will later become `apps/worker` in monorepo.

Responsibilities:

- fetch market prices
- evaluate active alerts
- write alert events
- send Telegram notifications

### `src/db`

Database schema and migrations.
Keep close to app for now.
Later can move into shared `packages/db`.

### `src/schemas`

Validation schemas for forms and API input.
Good place for Zod.

### `src/types`

Only lightweight shared types.
Avoid duplicating domain concepts here if richer versions already exist in `domain`.

## Practical Architectural Rules

Use these rules from day one:

1. UI never computes alert trigger logic directly.
2. Worker never imports UI components.
3. Route handlers call server use-cases, not raw DB queries everywhere.
4. Domain services stay framework-agnostic.
5. Telegram and Hyperliquid integrations stay behind adapters in `lib` or worker services.

## How This Migrates Later

When unified trading hub starts:

Current:

- `price-alert-bot/src/app` -> future `apps/web`
- `price-alert-bot/src/worker` -> future `apps/worker`
- `price-alert-bot/src/domain` -> future `packages/domain`
- `price-alert-bot/src/db` -> future `packages/db`
- `price-alert-bot/src/schemas` and `src/types` -> future shared packages

This means work done now is not wasted.

## Recommended V1 Build Order

1. `src/domain/alerts`
   - define alert model and evaluation logic first
2. `src/db/schema`
   - define users, alerts, alert events, telegram connection
3. `src/lib`
   - env, db, telegram, hyperliquid
4. `src/server/alerts`
   - CRUD use-cases
5. `src/app/alerts`
   - basic UI
6. `src/worker`
   - polling or streaming loop and delivery

## Minimal First Milestone

If you want very first usable version fast, start with:

```text
price-alert-bot/
  src/
    app/
      alerts/
      api/
    components/
      alerts/
    lib/
      db.ts
      telegram.ts
      hyperliquid.ts
    domain/
      alerts/
    server/
      alerts/
    worker/
      index.ts
    db/
      schema/
    schemas/
```

This is enough for:

- create alert
- save alert
- run worker
- trigger Telegram message

## Recommendation

Do not optimize for many services now.
Optimize for:

- clean boundaries
- cheap deployment
- easy future extraction

Best immediate direction:

- one `price-alert-bot` codebase
- one web runtime
- one worker runtime
- one database
- one clear domain layer
