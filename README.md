# Restaurant Demand Forecasting + Labor Optimization

A predictive operations platform for restaurants that forecasts hourly demand by location and recommends staffing levels to reduce wait times, labor waste, and service bottlenecks.

## Core Features (Current State)

### 1. Advanced Data Ingestion
- **Idempotent API**: Ingest demand events (arrivals, orders, seating) with validation.
- **Seed Generator**: Quickly populate your environment with 60 days of synthetic historical data.
- **CSV Support**: UI stubs ready for historical data uploads.

### 2. Intelligent Engines
- **Prisma 7 Integration**: Powered by Prisma 7 and `@prisma/adapter-better-sqlite3` for high-performance local SQLite operations.
- **Deterministic Forecast Engine**: Calculates hourly demand using trailing 4-week averages by day-of-week and hour.
- **Labor Recommendation Engine**: Translates guest and order forecasts into specific server, host, and kitchen staffing needs based on configurable location-level ratios.

### 3. Operational Dashboard
- **Demand Visualization**: Hourly demand projections for next 24 hours.
- **Staffing Plan**: Hourly labor recommendations with confidence scores.
- **Interactive Management**: Real-time insights into peak hours and projected guest counts.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd restaurant-forecasting
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Initialize the database:
   ```bash
   npx prisma generate
   ```

### Running the Project

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Important**: Navigate to `/ingestion` first to generate the seed data so you can see live charts on the dashboard.

## Technical Stack
- **Framework**: Next.js (App Router) + TypeScript
- **ORM**: Prisma 7 (with Driver Adapters)
- **Database**: SQLite (Local)
- **Styling**: Tailwind CSS
- **Visualization**: Recharts

## API Endpoints (Highlights)
- `POST /api/demand/events`: Ingest live demand data.
- `POST /api/demand/seed`: Generate 60 days of test data.
- `GET /api/forecast`: Retrieve demand predictions.
- `GET /api/staffing`: Retrieve labor recommendations.
