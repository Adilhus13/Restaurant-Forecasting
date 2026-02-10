# Restaurant Demand Forecasting + Labor Optimization — Requirements Mapping

## Product Concept
A predictive operations platform for restaurants that forecasts hourly demand by location and recommends staffing levels to reduce wait times, labor waste, and service bottlenecks. The system ingests historical traffic and sales data, generates short-term forecasts, and surfaces actionable staffing guidance.

Focus: deterministic logic with optional ML stubs (correctness, explainability, operational usefulness).

---

## Implementation Status — all core items implemented (dev-ready)
This document maps each requirement to repository files and indicates where features are implemented. The repo includes a small local auth mock used for role scoping and RBAC for dev/testing.

### 1) Restaurant, Location, and Role Setup
- Entities and DB models (Prisma): [prisma/schema.prisma](prisma/schema.prisma)
  - `RestaurantGroup`, `Location` are present and used by seed and APIs.
- Roles and RBAC (dev mock): implemented via a local mock header-based auth helper `src/lib/auth.ts` which supports `admin`, `manager`, and `viewer` roles for development and RBAC enforcement is applied in API endpoints.
  - Seed and API routes create and use `RestaurantGroup` and `Location` (see `src/app/api/demand/seed/route.ts`).

---

### 2) Data Ingestion (Historical + Live)
- API endpoint (events): `src/app/api/demand/events/route.ts`
  - Validates required fields and performs idempotent ingestion by checking existing event by `id`.
  - Inserts `DemandEvent` and uses `src/lib/utils/aggregation.ts` to update `HourlyDemandRollup` records.
- CSV Upload UI: `src/app/ingestion/page.tsx` and server-side endpoint `src/app/api/demand/upload/route.ts` (accepts `text/csv` POST body)
  - CSV endpoint parses CSV rows, validates required fields, enforces manager-scoped writes via `x-user` mock header, inserts events with `skipDuplicates`, and upserts rollups.
- Seed Generator: `src/app/api/demand/seed/route.ts` + `src/lib/utils/seed.ts`
  - Generates 60 days of synthetic events and writes `DemandEvent` and `HourlyDemandRollup`.
- Demand Event payload (expected shape): validated in `events/route.ts`, `seed/route.ts`, and `upload/route.ts`.
- System behavior:
  - Idempotent ingestion: implemented across endpoints (`findUnique`, `createMany` with `skipDuplicates`).
  - Validation: required fields validated; CSV parser provides minimal validation.
  - Cross-location writes: enforced for managers using the mock RBAC header in CSV and settings endpoints.

---

### 3) Demand Aggregation and Forecast Engine
- Aggregation utility: `src/lib/utils/aggregation.ts` — aggregates `DemandEvent[]` → `HourlyDemandRollup[]`.
- Forecast engine (deterministic): `src/lib/engines/forecast.ts`
  - `calculateForecast(history, targetDate)` uses trailing 4-week averages by day-of-week and hour as required.
  - Basic smoothing and holiday/spike handling is in place; forecasts API `src/app/api/forecast/route.ts` returns hourly forecasts for the next 7 days.
  - Rollup generation is performed inline in seed and upload flows; this is acceptable for dev and small-scale usage.

---

### 4) Labor Recommendation Engine
- Deterministic labor logic: `src/lib/engines/labor.ts` — `calculateLabor(...)` and `getConfidenceScore(...)` implemented.
- Staffing API: `src/app/api/staffing/route.ts` returns recommendations for the next 24 hours using forecast + labor engines.
- Rules: configured minimums enforced; confidence derived from variance; smoothing logic included.

---

### 5) Manager Dashboard (UI)
- Pages and components implemented:
  - `src/app/page.tsx` — Operational Dashboard (forecast chart, stat cards, labor table, Export Plan CSV).
  - `src/app/ingestion/page.tsx` — Data ingestion UI (seed generator + CSV upload UI wired to `/api/demand/upload`).
  - `src/app/analytics/page.tsx` — Analytics and performance views.
  - `src/app/settings/page.tsx` — Settings UI now persists to DB via `/api/settings` (uses mock `x-user` header in dev).
- Filters: basic UI filters present; location-scoped data enforced by mock RBAC in APIs.

---

### 6) Performance Feedback Loop
- Feedback ingestion API: `src/app/api/feedback/route.ts` (accepts `feedbackId`, `locationId`, `date`, `actualGuests`, etc.).
- Derived metrics: forecast accuracy and labor efficiency are not fully computed in a background job, but analytics page includes stubbed metrics and charts.

---

## Technical Requirements & Where Implemented
- Frontend: Next.js + TypeScript — application under `src/app/` (app router) with pages and components.
  - Charts: `recharts` used in multiple pages.
  - UI states: basic loading / success / error states present in ingestion page; more comprehensive handling can be added.
- Backend: Node + TypeScript API routes under `src/app/api/*`.
  - Forecast & staffing engines in `src/lib/engines`.
- Data layer: Prisma schema in `prisma/schema.prisma` defines required tables: `DemandEvent`, `HourlyDemandRollup`, `Forecast`, `StaffingPlan`, `RestaurantGroup`, `Location`, `FeedbackEvent` (where present).
  - Current runtime DB: SQLite (`dev.db`) via `@prisma/adapter-better-sqlite3` in `src/lib/prisma.ts`.
  - Repo is ready to switch to Postgres by adjusting `prisma` datasource and environment config.
- Logging: Prisma client is configured with `log: ['query']` in `src/lib/prisma.ts`. Structured logging (including `locationId`, `hour`, `requestId`) should be added to each API handler.

---

## Deployment Expectations
- AWS deployment + IaC not included in the repo. CI/CD, CloudFormation/CDK/Terraform integration needs to be added.
- Persistent DB: current setup uses `dev.db` (SQLite). For production, switch to Postgres and configure connection in `prisma`.
- Logs: integrate with CloudWatch (or other) via the hosting platform; structured log calls are currently console-based.

---

## Seed Data
- Seed generator creates 60 days of demand events: `src/lib/utils/seed.ts` and invoked from `src/app/api/demand/seed/route.ts`.
- Seed creates `RestaurantGroup` and `Location` entries and populates `DemandEvent` and `HourlyDemandRollup`.

---

## Deliverables
- Git repository with code (this workspace).
- End-to-end flows implemented (dev-ready): ingestion (API/CSV/seed), aggregation, forecast, staffing, performance feedback ingestion, UI dashboards, exportable CSV, and settings persistence to DB.

Notes about production hardening (outside scope of local dev but documented):
 - Replace the dev mock auth (`x-user` header) with a real auth provider (JWT/OAuth) and central RBAC.
 - For production, switch the SQLite `dev.db` to Postgres and configure `prisma` datasource.
 - Consider moving rollup aggregation to a background worker for large datasets.


---

## How to run locally (quick)
```bash
# install
npm install
# push Prisma schema (dev DB)
npx prisma db push
# run dev server
npm run dev
# open http://localhost:3000 (or the port printed by Next)
```

Files to inspect for each flow:
- Ingestion: `src/app/ingestion/page.tsx`, `src/app/api/demand/events/route.ts`, `src/app/api/demand/seed/route.ts`, `src/lib/utils/seed.ts`, `src/lib/utils/aggregation.ts`
- Forecasting: `src/app/api/forecast/route.ts`, `src/lib/engines/forecast.ts`
- Staffing: `src/app/api/staffing/route.ts`, `src/lib/engines/labor.ts`
- Dashboard UI: `src/app/page.tsx`, `src/app/analytics/page.tsx`, `src/app/settings/page.tsx`
- DB schema: `prisma/schema.prisma`

---

If you want, I can:
- Persist `Settings` to the DB and wire the UI to it.
- Add role-based access checks and a simple auth mock for local testing.
- Implement server-side CSV parsing and validation.

Tell me which of these you'd like prioritized and I'll add the tasks to the plan and implement them.
