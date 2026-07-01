# Trading Hub Project Spec

## 1. Overview

This project starts as two related tools:

1. `cryptotradehelper`
   Position sizing and trade planning.
2. `price-alert-bot`
   Crypto price alerts delivered through Telegram.

The long-term goal is to merge both into one web-based trading hub for retail crypto traders. The hub should help users prepare trades, track trades, and stay aware of important price movements without paying for alert features locked behind platforms like TradingView.

V1 should stay small, cheap, and practical, but decisions made now should not block future unification into one product.

## 2. Product Vision

Build a trader hub where users can:

- calculate position size before entering a trade
- track trades and trading progress over time
- create and manage price alerts
- receive timely Telegram notifications when price levels matter

Core product value:

- better trade preparation
- better timing awareness
- fewer missed market moves
- one central place for trading utilities

## 3. Problem Statement

Current pain point:

- useful price alerts are often hidden behind paywalls
- missing a watched level can mean missing a trading opportunity
- traders often use fragmented tools for position sizing, journaling, and alerts

This product should solve that by offering a simple web app with alerting and trade-planning tools under one roof.

## 4. V1 Scope

V1 focus:

- small private tool for the creator and a few trusted users
- public GitHub repo with clean project structure
- Next.js web app
- web UI is essential
- Telegram is the only notification channel for now
- crypto first, stocks later if useful
- Hyperliquid first, multi-exchange later
- perpetual futures first

V1 success metric after 1-2 weeks of usage:

- users can autonomously create, edit, and delete alerts in the web app
- alerts trigger correctly and send Telegram messages
- the system is useful enough for daily trading use

## 5. Product Modules

### 5.1 Module A: Trade Planner and Tracker

Initial base already exists in `cryptotradehelper`.

Current visible intent:

- calculate risk amount from account size and risk percent
- calculate quantity / position size
- calculate order value
- calculate required leverage
- estimate maker and taker fees

V1 for this module inside the future hub:

- position size calculator
- simple trade creation form
- basic saved trade records
- notes per trade

Future expansion:

- full trade journal
- PnL and progression tracking
- performance breakdowns
- dashboards and statistics

### 5.2 Module B: Price Alert System

This is the immediate focus of `price-alert-bot`.

V1 capabilities:

- create alert from simple web UI
- read list of alerts
- update alert
- delete alert
- send Telegram notification when trigger condition happens
- keep trigger history

Supported V1 trigger types:

- price touched exact level
- price goes above level
- price goes below level

Not in V1:

- range alerts
- percentage-move alerts
- indicator alerts
- time reminders

Future alert roadmap:

- candle close above/below
- candle wick above/below
- candle open above/below
- support for 5m, 15m, 1h, 4h timeframes

## 6. Target Users

Primary users:

- project owner
- small number of trusted users
- retail crypto traders

User profile:

- semi-technical
- comfortable with simple web UI
- likely to use alerts a few times per day or throughout the day

## 7. Detailed Alert Requirements

### 7.1 Market scope

- asset class: crypto first
- exchange data source: Hyperliquid first
- instrument type: perpetual futures
- symbol input format: exchange-native format like `BTCUSDT`

### 7.2 Trigger semantics

Alert types:

- `touch`
- `cross_above`
- `cross_below`

Touch-price definition:

- currently unspecified by user
- product should keep this abstract in design
- implementation should choose one source explicitly later, likely last traded price or mark price

Recommended implementation note:

- define `price_source` in domain model even if UI hides it in V1
- default source can be selected in implementation
- keep market-data adapter exchange-agnostic so Hyperliquid is current provider, not hard-coded architecture

Above/below behavior:

- depends on alert type
- if condition is already true at creation time, user should be informed
- if user still confirms creation, alert should wait for reset behavior before triggering again
- desired behavior from notes suggests crossing-based logic, not immediate fire spam

Suggested V1 rule:

- if current price already satisfies `above` or `below`, show warning in UI
- allow creation after confirmation
- do not fire immediately
- arm alert only after price moves back across invalid side, then trigger on next valid crossing

### 7.3 Re-triggering and spam protection

Requirements:

- retrigger behavior should be configurable
- cooldown should be configurable
- duplicates are acceptable if needed to avoid missed alerts

Suggested V1 options:

- one-shot
- repeating with cooldown

Suggested cooldown default:

- 5 minutes

### 7.4 Price precision

- comparisons should respect exchange tick size

## 8. Telegram Requirements

V1 channel strategy:

- Telegram only for now
- other channels later, such as email or push

Interaction model:

- web app for creation and management
- Telegram bot for receiving alerts
- no need for full bot-command management in V1

Alert message should include:

- symbol
- trigger price
- current price
- trigger time
- alert label/name
- exchange/source
- chart link

Formatting:

- minimal text
- no emoji
- no decorative formatting requirement

Scope:

- single chat in earliest version
- architecture should not block multi-user delivery later

## 9. Data and Persistence

Persistence answers were not fully specified, but future multi-user support requires durable storage.

Broad requirement:

- alerts, users, Telegram mapping, and trigger history must be persistable

Recommended V1 choice:

- relational database
- simplest path is SQLite for local/dev and easy upgrade path to Postgres for hosted deployment

Recommended web stack:

- Next.js for frontend and server-side application layer
- TypeScript across app and worker

Data that should exist from start:

- users
- alerts
- alert delivery targets
- alert events / trigger history
- audit timestamps

Trade-hub compatibility requirement:

- trade data and alert data should live under one shared application data model later

## 10. Authentication and Access

Important product requirement:

- multiple users should have separate accounts from start

Implications:

- alert ownership must be user-scoped
- trade records must be user-scoped
- Telegram destination must map to specific user

V1 access model:

- authenticated web app
- approved user accounts only
- Telegram delivery bound to each authenticated user

Unresolved detail:

- exact auth provider not specified

Recommended direction:

- choose simple auth compatible with low-cost hosting and future unified hub

## 11. Reliability and Operations

User preference:

- near-zero cost
- missed alerts are more painful than duplicates
- missed historical catch-up after downtime is not required
- minimal logs are acceptable in V1

Operational expectations:

- service should run continuously enough for practical daily use
- alert latency should be as fast as reasonably possible within low-cost constraints

Recommended interpretation:

- prefer always-on deploy over laptop-only runtime
- prioritize reliability of live monitoring over complex recovery features

Monitoring V1:

- basic logs
- basic error visibility for developer

Future improvements:

- health endpoint
- structured logging
- failure notifications

## 12. Architecture Direction

Because final goal is one merged hub, architecture should separate product modules but keep shared foundations.

Recommended high-level structure:

- web app frontend
- backend/API layer
- alert evaluation worker
- shared database
- Telegram notification service

Recommended design principles:

- one user model across whole platform
- one auth system across whole platform
- one shared database
- separate domain modules for trades and alerts
- background jobs isolated from UI request lifecycle

Likely final hub sections:

- Dashboard
- Trade Planner
- Trade Journal
- Price Alerts
- Settings / Telegram Connection

## 12.1 Repository and Deployment Strategy

Recommended decision:

- do not build two permanently separate fullstack apps
- do not start with true microservices
- start with one product codebase organized as a modular monolith
- allow separate runtime deployments where useful

Why this is the best fit now:

- final product is one trading hub, not two unrelated tools
- trades and alerts will share users, auth, settings, and database records
- early microservices would add deployment, CI/CD, secrets, monitoring, and local-dev complexity too soon
- current scale is small, so fast iteration matters more than service isolation

Best target structure:

```text
trading-hub/
  apps/
    web/
    worker/
  packages/
    db/
    domain/
    shared/
  infra/
  docs/
```

Meaning of each part:

- `apps/web`: main web app, UI, auth, trade flows, alert management
- `apps/worker`: background alert engine, market-data consumption, trigger evaluation, Telegram delivery
- `packages/db`: database schema and client setup
- `packages/domain`: shared business rules for trades and alerts
- `packages/shared`: shared types, validation schemas, constants, utilities

Important clarification:

- one repo does not mean one deployment
- one product can still have multiple deployed services

Recommended runtime split:

1. Web app deployment
   - frontend
   - auth
   - trade calculator and trade tracking UI
   - alert CRUD
   - settings pages
2. Worker deployment
   - pulls or streams Hyperliquid market data
   - evaluates active alerts
   - sends Telegram messages

Shared foundation for both:

- one database
- one auth model
- one user model
- one shared codebase

Recommended CI/CD model:

- one repository
- one CI pipeline
- multiple build and deploy jobs

Example flow:

1. pull request
   - lint
   - typecheck
   - test
   - build `apps/web`
   - build `apps/worker`
2. merge to `main`
   - deploy `apps/web`
   - deploy `apps/worker`

Recommended development path from current state:

1. keep `price-alert-bot` focused on alert functionality for now
2. design it so data models and domain logic can later move into shared packages
3. when alert flow becomes stable, create unified `trading-hub` repository
4. move current `cryptotradehelper` into web application area
5. add alert UI into same product shell
6. run alert engine as separate worker inside same repo

What to avoid:

- two isolated repos long term if product is meant to become one app
- duplicating auth, user management, and database logic in separate projects
- treating “separate deployment” as reason for “separate product”

When true microservices may make sense later:

- different teams own different subsystems
- very different scaling needs emerge
- worker becomes large and operationally independent
- security or compliance boundaries require stronger isolation

Current recommendation:

- build toward a monorepo
- keep modular boundaries clean
- deploy web and worker separately if needed
- postpone real microservice split until operational pain proves it is necessary

## 13. Proposed V1 Functional Specification

### 13.1 User flows

User can:

1. sign in
2. connect or register Telegram destination
3. create alert with symbol, condition, target price, label, and cooldown/retrigger settings
4. see active alerts list
5. edit alert
6. disable or delete alert
7. receive Telegram message when triggered
8. view recent trigger history

### 13.2 Alert creation fields

Required:

- symbol
- trigger type
- target price
- label/name

Optional or advanced:

- note
- cooldown
- repeat mode
- enabled/disabled flag

System-managed:

- owner user id
- created at
- updated at
- last triggered at
- internal state for armed/disarmed logic

### 13.3 Trigger history fields

- alert id
- user id
- symbol
- trigger type
- target price
- actual price at trigger
- triggered at
- delivery status

## 14. Future Unified Hub Roadmap

Phase 1:

- working price alerts web app
- Telegram delivery
- simple trade planner UI

Phase 2:

- merge alerts and trade helper into one shared application shell
- unified auth, navigation, and database
- save trades, not only calculate them

Phase 3:

- trade journal and progression tracking
- richer analytics
- multi-exchange support
- more notification channels
- candle-based and more advanced alerts

## 15. Non-Goals for Early Version

Keep out of earliest version unless needed:

- advanced charting
- range and indicator alerts
- bulk alert import
- mobile app
- complex analytics dashboards
- catch-up replay for missed downtime events
- broad exchange support from day one

## 16. Open Decisions and Assumptions

These points were not fully answered and need explicit product or technical decisions later:

- exact hosting approach
- exact database choice
- exact Hyperliquid data ingestion method: polling vs websocket
- exact price source for triggers: last, mark, index, bid/ask
- exact auth provider
- exact persistence guarantees for alerts across restarts

Working assumptions for implementation planning:

- keep hosting cheap
- build for small scale first
- use durable storage from start because multi-user accounts are required
- use architecture that can merge with `cryptotradehelper` without rewrite

## 17. Product Positioning

This project is not just a bot. It is the first part of a broader trader operating hub:

- plan trade
- size trade
- track trade
- monitor price
- get notified

That framing should guide repository structure, naming, UX decisions, and technical architecture from the beginning.
