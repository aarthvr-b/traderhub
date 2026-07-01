# Price Alert Bot Development Plan

## Goal

Build V1 with this end-to-end flow:

1. user opens Next.js web app
2. user creates alert
3. alert stored in DB
4. worker fetches Hyperliquid prices
5. worker evaluates alert
6. worker sends Telegram message
7. trigger stored in alert history

This file is implementation-first. Follow it in order.

## Locked Technical Choices

Use these unless strong reason appears:

- web app: Next.js App Router
- language: TypeScript
- ORM: Prisma
- local DB: SQLite
- production DB: Postgres
- validation: Zod
- background runtime: Node.js TypeScript worker
- market source: Hyperliquid
- notifications: Telegram Bot API

Why this stack:

- Next.js gives UI + server routes fast
- Prisma keeps local SQLite and hosted Postgres simple
- worker can stay in same repo without premature microservices

## Phase 0: Bootstrap Project

## Step 1. Create app

Run:

```bash
npx create-next-app@latest . --typescript --eslint --app --src-dir --no-tailwind --import-alias "@/*"
npm install prisma @prisma/client zod @nktkas/hyperliquid
npm install -D tsx
```

Then add scripts in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "worker:dev": "tsx src/worker/index.ts"
  }
}
```

## Step 2. Create base folders

Create this structure first:

```text
src/
  app/
    alerts/
      new/
  components/
    alerts/
  lib/
  domain/
    alerts/
      entities/
      services/
      value-objects/
  server/
    alerts/
  worker/
    services/
  db/
  schemas/
```

## Step 3. Add environment file

Create `.env.example`:

```env
DATABASE_URL="file:./dev.db"
TELEGRAM_BOT_TOKEN=""
APP_URL="http://localhost:3000"
WORKER_POLL_INTERVAL_MS="5000"
```

For local dev, create `.env` from it.

## Phase 1: Database First

## Step 4. Create Prisma schema

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id                  String               @id @default(cuid())
  email               String               @unique
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt
  alerts              Alert[]
  telegramConnection  TelegramConnection?
}

model TelegramConnection {
  id          String   @id @default(cuid())
  userId      String   @unique
  chatId      String   @unique
  username    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Alert {
  id                String       @id @default(cuid())
  userId            String
  symbol            String
  triggerType       TriggerType
  targetPrice       Decimal
  label             String
  note              String?
  priceSource       PriceSource  @default(LAST)
  cooldownMinutes   Int          @default(5)
  repeatMode        RepeatMode   @default(ONCE)
  status            AlertStatus  @default(ACTIVE)
  isArmed           Boolean      @default(true)
  lastPrice         Decimal?
  lastTriggeredAt   DateTime?
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
  user              User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  events            AlertEvent[]
}

model AlertEvent {
  id             String        @id @default(cuid())
  alertId        String
  userId         String
  symbol         String
  triggerType    TriggerType
  targetPrice    Decimal
  actualPrice    Decimal
  delivered      Boolean       @default(false)
  deliveredAt    DateTime?
  createdAt      DateTime      @default(now())
  alert          Alert         @relation(fields: [alertId], references: [id], onDelete: Cascade)
  user           User          @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum TriggerType {
  TOUCH
  ABOVE
  BELOW
}

enum PriceSource {
  LAST
}

enum RepeatMode {
  ONCE
  REPEAT
}

enum AlertStatus {
  ACTIVE
  PAUSED
  TRIGGERED
  DISABLED
}
```

Then run:

```bash
npx prisma migrate dev --name init
```

## Step 5. Add Prisma client

Create `src/lib/db.ts`:

```ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
```

## Phase 2: Domain Logic Before UI

## Step 6. Create domain types

Create `src/domain/alerts/value-objects/AlertTypes.ts`:

```ts
export type TriggerType = 'TOUCH' | 'ABOVE' | 'BELOW';
export type RepeatMode = 'ONCE' | 'REPEAT';
export type AlertStatus = 'ACTIVE' | 'PAUSED' | 'TRIGGERED' | 'DISABLED';
```

Create `src/domain/alerts/entities/Alert.ts`:

```ts
import type { AlertStatus, RepeatMode, TriggerType } from '../value-objects/AlertTypes';

export interface AlertEntity {
  id: string;
  userId: string;
  symbol: string;
  triggerType: TriggerType;
  targetPrice: number;
  label: string;
  note?: string | null;
  cooldownMinutes: number;
  repeatMode: RepeatMode;
  status: AlertStatus;
  isArmed: boolean;
  lastPrice?: number | null;
  lastTriggeredAt?: Date | null;
}
```

## Step 7. Implement alert evaluation

Create `src/domain/alerts/services/AlertEvaluator.ts`:

```ts
import type { AlertEntity } from '../entities/Alert';

export interface AlertEvaluationInput {
  alert: AlertEntity;
  currentPrice: number;
  now: Date;
}

export interface AlertEvaluationResult {
  shouldTrigger: boolean;
  shouldArm: boolean;
  nextStatus: AlertEntity['status'];
  reason: string;
}

function minutesSince(date: Date, now: Date): number {
  return (now.getTime() - date.getTime()) / 1000 / 60;
}

function crossedAbove(previous: number, current: number, target: number): boolean {
  return previous < target && current >= target;
}

function crossedBelow(previous: number, current: number, target: number): boolean {
  return previous > target && current <= target;
}

export class AlertEvaluator {
  evaluate({ alert, currentPrice, now }: AlertEvaluationInput): AlertEvaluationResult {
    if (alert.status !== 'ACTIVE') {
      return {
        shouldTrigger: false,
        shouldArm: alert.isArmed,
        nextStatus: alert.status,
        reason: 'alert_not_active',
      };
    }

    if (alert.lastTriggeredAt) {
      const elapsed = minutesSince(alert.lastTriggeredAt, now);
      if (elapsed < alert.cooldownMinutes) {
        return {
          shouldTrigger: false,
          shouldArm: alert.isArmed,
          nextStatus: alert.status,
          reason: 'cooldown_active',
        };
      }
    }

    const previousPrice = alert.lastPrice ?? currentPrice;
    const target = alert.targetPrice;

    if (!alert.isArmed) {
      if (alert.triggerType === 'ABOVE' && currentPrice < target) {
        return {
          shouldTrigger: false,
          shouldArm: true,
          nextStatus: 'ACTIVE',
          reason: 'rearmed_above',
        };
      }

      if (alert.triggerType === 'BELOW' && currentPrice > target) {
        return {
          shouldTrigger: false,
          shouldArm: true,
          nextStatus: 'ACTIVE',
          reason: 'rearmed_below',
        };
      }

      return {
        shouldTrigger: false,
        shouldArm: false,
        nextStatus: 'ACTIVE',
        reason: 'waiting_rearm',
      };
    }

    if (alert.triggerType === 'TOUCH') {
      const touched =
        (previousPrice < target && currentPrice >= target) ||
        (previousPrice > target && currentPrice <= target);

      if (touched) {
        return {
          shouldTrigger: true,
          shouldArm: alert.repeatMode === 'REPEAT',
          nextStatus: alert.repeatMode === 'ONCE' ? 'TRIGGERED' : 'ACTIVE',
          reason: 'touch_triggered',
        };
      }
    }

    if (alert.triggerType === 'ABOVE' && crossedAbove(previousPrice, currentPrice, target)) {
      return {
        shouldTrigger: true,
        shouldArm: false,
        nextStatus: alert.repeatMode === 'ONCE' ? 'TRIGGERED' : 'ACTIVE',
        reason: 'above_triggered',
      };
    }

    if (alert.triggerType === 'BELOW' && crossedBelow(previousPrice, currentPrice, target)) {
      return {
        shouldTrigger: true,
        shouldArm: false,
        nextStatus: alert.repeatMode === 'ONCE' ? 'TRIGGERED' : 'ACTIVE',
        reason: 'below_triggered',
      };
    }

    return {
      shouldTrigger: false,
      shouldArm: alert.isArmed,
      nextStatus: 'ACTIVE',
      reason: 'no_trigger',
    };
  }
}
```

Important:

- `lastPrice` stored on alert
- `isArmed` prevents immediate retrigger spam
- one-shot alerts become `TRIGGERED`
- repeat alerts can re-arm after price moves back across invalid side

## Step 8. Add validation schema

Create `src/schemas/alertSchema.ts`:

```ts
import { z } from 'zod';

export const alertSchema = z.object({
  symbol: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[A-Z0-9]+$/, 'Use exchange-native symbol like BTC or ETH'),
  triggerType: z.enum(['TOUCH', 'ABOVE', 'BELOW']),
  targetPrice: z.coerce.number().positive(),
  label: z.string().min(1).max(80),
  note: z.string().max(300).optional().or(z.literal('')),
  cooldownMinutes: z.coerce.number().int().min(0).max(1440),
  repeatMode: z.enum(['ONCE', 'REPEAT']),
});

export type AlertFormInput = z.infer<typeof alertSchema>;
```

## Phase 3: Server Use Cases

## Step 9. Create alert actions

Create `src/server/alerts/create-alert.ts`:

```ts
import { db } from '@/lib/db';
import { alertSchema, type AlertFormInput } from '@/schemas/alertSchema';

export async function createAlert(userId: string, input: AlertFormInput) {
  const parsed = alertSchema.parse(input);

  return db.alert.create({
    data: {
      userId,
      symbol: parsed.symbol,
      triggerType: parsed.triggerType,
      targetPrice: parsed.targetPrice,
      label: parsed.label,
      note: parsed.note || null,
      cooldownMinutes: parsed.cooldownMinutes,
      repeatMode: parsed.repeatMode,
    },
  });
}
```

Create `src/server/alerts/list-alerts.ts`:

```ts
import { db } from '@/lib/db';

export async function listAlerts(userId: string) {
  return db.alert.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}
```

Create `src/server/alerts/update-alert.ts`:

```ts
import { db } from '@/lib/db';
import { alertSchema, type AlertFormInput } from '@/schemas/alertSchema';

export async function updateAlert(alertId: string, userId: string, input: AlertFormInput) {
  const parsed = alertSchema.parse(input);

  return db.alert.update({
    where: { id: alertId, userId },
    data: {
      symbol: parsed.symbol,
      triggerType: parsed.triggerType,
      targetPrice: parsed.targetPrice,
      label: parsed.label,
      note: parsed.note || null,
      cooldownMinutes: parsed.cooldownMinutes,
      repeatMode: parsed.repeatMode,
      status: 'ACTIVE',
      isArmed: true,
    },
  });
}
```

Create `src/server/alerts/delete-alert.ts`:

```ts
import { db } from '@/lib/db';

export async function deleteAlert(alertId: string, userId: string) {
  return db.alert.delete({
    where: { id: alertId, userId },
  });
}
```

Note:

- Prisma `delete` and `update` with `{ id, userId }` requires compound unique key
- easier first version: use `deleteMany` and `updateMany`

Safer first version for delete:

```ts
export async function deleteAlert(alertId: string, userId: string) {
  return db.alert.deleteMany({
    where: { id: alertId, userId },
  });
}
```

## Step 10. Create API route

Create `src/app/api/alerts/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createAlert } from '@/server/alerts/create-alert';
import { listAlerts } from '@/server/alerts/list-alerts';

const DEMO_USER_ID = 'demo-user-id';

export async function GET() {
  const alerts = await listAlerts(DEMO_USER_ID);
  return NextResponse.json(alerts);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const alert = await createAlert(DEMO_USER_ID, body);
  return NextResponse.json(alert, { status: 201 });
}
```

For now use fake user until auth exists.
Later replace with real session user.

## Phase 4: UI

## Step 11. Build alert form

Create `src/components/alerts/AlertForm.tsx`:

```tsx
'use client';

import { useState } from 'react';

type AlertFormValues = {
  symbol: string;
  triggerType: 'TOUCH' | 'ABOVE' | 'BELOW';
  targetPrice: string;
  label: string;
  note: string;
  cooldownMinutes: string;
  repeatMode: 'ONCE' | 'REPEAT';
};

const initialState: AlertFormValues = {
  symbol: '',
  triggerType: 'TOUCH',
  targetPrice: '',
  label: '',
  note: '',
  cooldownMinutes: '5',
  repeatMode: 'ONCE',
};

export function AlertForm() {
  const [values, setValues] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...values,
        symbol: values.symbol.toUpperCase(),
        targetPrice: Number(values.targetPrice),
        cooldownMinutes: Number(values.cooldownMinutes),
      }),
    });

    setSubmitting(false);
    setValues(initialState);
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        value={values.symbol}
        onChange={(e) => setValues({ ...values, symbol: e.target.value })}
        placeholder="BTC"
      />
      <select
        value={values.triggerType}
        onChange={(e) =>
          setValues({ ...values, triggerType: e.target.value as AlertFormValues['triggerType'] })
        }
      >
        <option value="TOUCH">Touch</option>
        <option value="ABOVE">Above</option>
        <option value="BELOW">Below</option>
      </select>
      <input
        value={values.targetPrice}
        onChange={(e) => setValues({ ...values, targetPrice: e.target.value })}
        placeholder="110000"
      />
      <input
        value={values.label}
        onChange={(e) => setValues({ ...values, label: e.target.value })}
        placeholder="BTC key level"
      />
      <textarea
        value={values.note}
        onChange={(e) => setValues({ ...values, note: e.target.value })}
        placeholder="Optional note"
      />
      <input
        value={values.cooldownMinutes}
        onChange={(e) => setValues({ ...values, cooldownMinutes: e.target.value })}
        placeholder="5"
      />
      <select
        value={values.repeatMode}
        onChange={(e) =>
          setValues({ ...values, repeatMode: e.target.value as AlertFormValues['repeatMode'] })
        }
      >
        <option value="ONCE">Once</option>
        <option value="REPEAT">Repeat</option>
      </select>
      <button disabled={submitting} type="submit">
        {submitting ? 'Creating...' : 'Create alert'}
      </button>
    </form>
  );
}
```

## Step 12. Build alerts page

Create `src/app/alerts/page.tsx`:

```tsx
import { listAlerts } from '@/server/alerts/list-alerts';

const DEMO_USER_ID = 'demo-user-id';

export default async function AlertsPage() {
  const alerts = await listAlerts(DEMO_USER_ID);

  return (
    <main>
      <h1>Alerts</h1>
      <ul>
        {alerts.map((alert) => (
          <li key={alert.id}>
            {alert.symbol} - {alert.triggerType} - {alert.targetPrice.toString()}
          </li>
        ))}
      </ul>
    </main>
  );
}
```

Create `src/app/alerts/new/page.tsx`:

```tsx
import { AlertForm } from '@/components/alerts/AlertForm';

export default function NewAlertPage() {
  return (
    <main>
      <h1>Create Alert</h1>
      <AlertForm />
    </main>
  );
}
```

## Phase 5: Telegram

## Step 13. Create Telegram helper

Create `src/lib/telegram.ts`:

```ts
export async function sendTelegramMessage(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error('Missing TELEGRAM_BOT_TOKEN');
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram send failed: ${body}`);
  }

  return response.json();
}
```

## Step 14. Add notification formatter

Create `src/worker/services/format-alert-message.ts`:

```ts
type AlertMessageInput = {
  symbol: string;
  triggerType: string;
  targetPrice: number;
  currentPrice: number;
  label: string;
  triggeredAt: Date;
};

export function formatAlertMessage(input: AlertMessageInput) {
  return [
    `Alert: ${input.label}`,
    `Symbol: ${input.symbol}`,
    `Trigger: ${input.triggerType}`,
    `Target: ${input.targetPrice}`,
    `Current: ${input.currentPrice}`,
    `Time: ${input.triggeredAt.toISOString()}`,
  ].join('\n');
}
```

## Phase 6: Hyperliquid Integration

## Step 15. Create Hyperliquid client

Create `src/lib/hyperliquid.ts`:

```ts
import { HttpTransport, InfoClient } from '@nktkas/hyperliquid';

const transport = new HttpTransport();
const infoClient = new InfoClient({ transport });

type AllMidsResponse = Record<string, string>;

export async function fetchAllMids(): Promise<AllMidsResponse> {
  return infoClient.allMids();
}

export async function fetchPriceForSymbol(symbol: string): Promise<number | null> {
  const mids = await fetchAllMids();
  const raw = mids[symbol];

  if (!raw) {
    return null;
  }

  return Number(raw);
}
```

Important:

- confirm exact Hyperliquid symbol names during real integration
- if symbols differ from your UI naming, add normalization layer early
- keep this file as adapter boundary so SDK can be swapped later without touching worker logic
- start with `InfoClient` + `HttpTransport`; add `SubscriptionClient` + `WebSocketTransport` later if polling becomes too slow or expensive

## Phase 7: Worker

## Step 16. Create worker loop

Create `src/worker/index.ts`:

```ts
import { db } from '@/lib/db';
import { fetchPriceForSymbol } from '@/lib/hyperliquid';
import { sendTelegramMessage } from '@/lib/telegram';
import { AlertEvaluator } from '@/domain/alerts/services/AlertEvaluator';
import { formatAlertMessage } from './services/format-alert-message';

const POLL_INTERVAL_MS = Number(process.env.WORKER_POLL_INTERVAL_MS ?? 5000);
const evaluator = new AlertEvaluator();

async function processAlerts() {
  const alerts = await db.alert.findMany({
    where: { status: 'ACTIVE' },
    include: {
      user: {
        include: {
          telegramConnection: true,
        },
      },
    },
  });

  for (const alert of alerts) {
    const currentPrice = await fetchPriceForSymbol(alert.symbol);

    if (currentPrice === null) {
      continue;
    }

    const result = evaluator.evaluate({
      alert: {
        id: alert.id,
        userId: alert.userId,
        symbol: alert.symbol,
        triggerType: alert.triggerType,
        targetPrice: Number(alert.targetPrice),
        label: alert.label,
        note: alert.note,
        cooldownMinutes: alert.cooldownMinutes,
        repeatMode: alert.repeatMode,
        status: alert.status,
        isArmed: alert.isArmed,
        lastPrice: alert.lastPrice ? Number(alert.lastPrice) : null,
        lastTriggeredAt: alert.lastTriggeredAt,
      },
      currentPrice,
      now: new Date(),
    });

    if (result.shouldTrigger && alert.user.telegramConnection?.chatId) {
      const text = formatAlertMessage({
        symbol: alert.symbol,
        triggerType: alert.triggerType,
        targetPrice: Number(alert.targetPrice),
        currentPrice,
        label: alert.label,
        triggeredAt: new Date(),
      });

      await sendTelegramMessage(alert.user.telegramConnection.chatId, text);

      await db.alertEvent.create({
        data: {
          alertId: alert.id,
          userId: alert.userId,
          symbol: alert.symbol,
          triggerType: alert.triggerType,
          targetPrice: alert.targetPrice,
          actualPrice: currentPrice,
          delivered: true,
          deliveredAt: new Date(),
        },
      });
    }

    await db.alert.update({
      where: { id: alert.id },
      data: {
        lastPrice: currentPrice,
        isArmed: result.shouldArm,
        status: result.nextStatus,
        lastTriggeredAt: result.shouldTrigger ? new Date() : alert.lastTriggeredAt,
      },
    });
  }
}

async function main() {
  while (true) {
    try {
      await processAlerts();
    } catch (error) {
      console.error('worker_cycle_failed', error);
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

main().catch((error) => {
  console.error('worker_boot_failed', error);
  process.exit(1);
});
```

## Step 17. Add Telegram connection seed

Until auth exists, easiest path:

1. create one fake user
2. manually insert Telegram chat ID
3. use same user for all local tests

Create `prisma/seed.ts`:

```ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: { email: 'demo@example.com' },
  });

  await prisma.telegramConnection.upsert({
    where: { userId: user.id },
    update: { chatId: 'REPLACE_ME' },
    create: {
      userId: user.id,
      chatId: 'REPLACE_ME',
    },
  });

  console.log({ userId: user.id });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add script:

```json
{
  "scripts": {
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

## Phase 8: Immediate TODO List

Implement in this order:

1. bootstrap Next.js app
2. install Prisma, Zod, tsx
3. add `.env.example`
4. create Prisma schema
5. run migration
6. create `src/lib/db.ts`
7. create `AlertEvaluator`
8. create `alertSchema`
9. create `createAlert` and `listAlerts`
10. create `/api/alerts`
11. create `/alerts` and `/alerts/new`
12. create `telegram.ts`
13. create `hyperliquid.ts`
14. create worker
15. seed demo user and Telegram chat
16. run worker and trigger real alert

## Local Run Commands

After first implementation:

```bash
npm install
npm run db:migrate
npm run db:generate
npm run dev
```

In second terminal:

```bash
npm run worker:dev
```

## What Not To Do Yet

Do not build yet:

- real auth
- polished UI system
- websocket market feed
- multi-exchange support
- advanced alert rules
- microservices split

## First Real Success Check

You are done with first vertical slice when:

1. `/alerts/new` creates alert
2. alert appears in `/alerts`
3. worker sees active alert
4. Hyperliquid price crosses target
5. Telegram message arrives
6. `alert_events` row exists

## Next After This File

Best next action:

- scaffold actual Next.js app files now
- then implement Phase 1 exactly as written
