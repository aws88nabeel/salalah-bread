# Salalah Bread 🥖

A fresh bread ordering web application for Salalah, Oman. Customers can browse a daily menu, select delivery time slots, and place orders for home delivery. Admins can manage orders through a dashboard workflow.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL + PostGIS |
| ORM | Drizzle ORM |
| State | Zustand (client), React Query (server) |
| Maps | Google Maps API (Places, Geocoding, Geometry) |

## Features

- **Menu browsing** — categorized bread items (Traditional Omani, European, Healthy, Pastries)
- **Cart management** — add/remove items, adjust quantities
- **Delivery location** — manual address entry for Salalah area
- **Delivery time slots** — capacity-limited slots, disabled when full
- **Order placement** — full checkout flow with confirmation page
- **Customer dashboard** — view order history and status
- **Admin dashboard** — real-time order list, status workflow (pending → confirmed → baking → out for delivery → delivered), cancel option, stats
- **Geofencing** — client & server-side Salalah boundary validation (PostGIS)
- **Authentication** — JWT-based register/login, admin role guard

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL with PostGIS (or a cloud DB like Neon/Supabase)

### 1. Database Setup

```bash
# Option A: Local PostGIS via Docker
docker compose up -d

# Option B: Use Neon.tech (free PostgreSQL with PostGIS)
# Sign up at https://neon.tech, create a project, copy the connection string
```

### 2. Environment Variables

```bash
cp .env.example packages/backend/.env
# Edit packages/backend/.env with your DATABASE_URL and JWT_SECRET

cp packages/frontend/.env.example packages/frontend/.env
# Set VITE_GOOGLE_MAPS_API_KEY (optional — location picker works without it)
```

### 3. Install & Setup

```bash
# Install dependencies
cd packages/backend && npm install
cd ../frontend && npm install
cd ../..

# Generate migration files
cd packages/backend
npx drizzle-kit generate

# Run migration (creates all tables)
npx tsx src/db/migrate.ts

# Seed the database (menu items, time slots, admin user)
npx tsx src/db/seed.ts
```

### 4. Run

Open two terminals:

```bash
# Terminal 1 — Backend (http://localhost:3001)
cd packages/backend
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd packages/frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

## Default Login Credentials

| Role | Phone | Password |
|---|---|---|
| **Admin** | `96899990000` | `admin123` |
| Customer | Register via the app | (your choice) |

### Admin Access

After logging in as admin, navigate to:
- **`/admin`** — Dashboard with order stats
- **`/admin/orders`** — Full order management (filter by status, advance orders, cancel)

## Admin Order Workflow

```
Pending → Confirmed → Baking → Out for Delivery → Delivered
                                   ↓
                              Cancelled (from Pending only)
```

Each status change is one click from the admin orders page.

## Project Structure

```
salalah-bread/
├── .env.example                 # Environment template
├── docker-compose.yml           # Local PostGIS
├── docker-compose.prod.yml      # Full production stack
│
├── packages/backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts        # Drizzle ORM schema (8 tables)
│   │   │   ├── seed.ts          # Initial data
│   │   │   └── migrate.ts       # Migration runner
│   │   ├── routes/
│   │   │   ├── auth.ts          # Register / Login / Me
│   │   │   ├── menu.ts          # Bread categories & items
│   │   │   ├── location.ts      # Geofence validation
│   │   │   ├── slots.ts         # Delivery time slots
│   │   │   ├── orders.ts        # Order CRUD
│   │   │   └── admin.ts         # Admin dashboard & stats
│   │   ├── middleware/auth.ts    # JWT verification
│   │   └── utils/geofence.ts    # PostGIS ST_Contains
│   └── Dockerfile
│
└── packages/frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.tsx            # RTL navbar + cart badge
    │   │   ├── LocationPicker.tsx    # Manual address input
    │   │   └── ErrorBoundary.tsx     # Error catch-all
    │   ├── pages/
    │   │   ├── MenuPage.tsx          # Bread listing
    │   │   ├── CartPage.tsx          # Shopping cart
    │   │   ├── CheckoutPage.tsx      # Address + slot + submit
    │   │   ├── OrderConfirmationPage.tsx
    │   │   ├── MyOrdersPage.tsx
    │   │   ├── AdminDashboard.tsx    # Stats cards
    │   │   └── AdminOrders.tsx       # Order management table
    │   ├── stores/                   # Zustand (auth, cart)
    │   └── lib/api.ts                # Axios client + types
    └── Dockerfile + nginx.conf
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/menu` | — | Get bread menu |
| POST | `/api/location/validate` | — | Check if coordinates are in Salalah |
| GET | `/api/slots?date=YYYY-MM-DD` | — | Available time slots |
| POST | `/api/orders` | JWT | Place an order |
| GET | `/api/orders` | JWT | My orders |
| GET | `/api/orders/:id` | JWT | Order details |
| GET | `/api/admin/orders` | Admin | All orders |
| GET | `/api/admin/orders/:id` | Admin | Order details |
| PATCH | `/api/admin/orders/:id/status` | Admin | Update order status |
| GET | `/api/admin/stats` | Admin | Dashboard statistics |

## Deployment (Docker)

```bash
# Build and run full stack
docker compose -f docker-compose.prod.yml up -d

# Requires environment variables:
#   DB_PASSWORD, JWT_SECRET, DOMAIN, GOOGLE_MAPS_API_KEY
```

## Database Schema

- **users** — customers and admins
- **categories** — bread categories (Arabic/English names)
- **menu_items** — individual bread products with prices
- **delivery_zones** — PostGIS polygon for Salalah geofencing
- **time_slots** — delivery windows with max capacity
- **orders** — customer orders with delivery location & status
- **order_items** — line items within each order

## License

MIT
