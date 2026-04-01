# DairyDrop — Milk Delivery Calculator

## Project Structure

```
DairyDrop/
├── backend/                        ← Node.js + Express + MongoDB
│   ├── src/
│   │   ├── config/
│   │   │   └── index.ts            ← All env config in one place
│   │   ├── controllers/            ← HTTP layer (req/res only)
│   │   │   ├── auth.controller.ts
│   │   │   ├── delivery.controller.ts
│   │   │   ├── settings.controller.ts
│   │   │   └── user.controller.ts
│   │   ├── middlewares/
│   │   │   └── auth.ts             ← requireAuth / requireAdmin
│   │   ├── models/                 ← Mongoose schemas
│   │   │   ├── Delivery.ts
│   │   │   ├── Session.ts
│   │   │   ├── Settings.ts
│   │   │   └── User.ts
│   │   ├── routes/                 ← Express routers (thin wiring)
│   │   │   ├── index.ts
│   │   │   ├── auth.ts
│   │   │   ├── admin.ts
│   │   │   ├── deliveries.ts
│   │   │   └── settings.ts
│   │   ├── services/               ← Business logic layer
│   │   │   ├── auth.service.ts
│   │   │   ├── delivery.service.ts
│   │   │   ├── settings.service.ts
│   │   │   └── user.service.ts
│   │   ├── types/
│   │   │   └── index.ts            ← Shared TypeScript interfaces
│   │   ├── validators/
│   │   │   └── index.ts            ← Zod schemas for all inputs
│   │   ├── lib/
│   │   │   ├── db.ts               ← MongoDB connection
│   │   │   └── seed.ts             ← Default admin seeder
│   │   ├── app.ts                  ← Express app setup
│   │   └── index.ts                ← Server entry point
│   ├── .env                        ← ⚠️ Set MONGODB_URI here
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                       ← React + Vite + Tailwind
    ├── src/
    │   ├── assets/                 ← Static images / icons
    │   ├── components/
    │   │   ├── ui/
    │   │   │   └── Toaster.tsx
    │   │   ├── Layout.tsx
    │   │   └── MonthPicker.tsx
    │   ├── contexts/
    │   │   └── AuthContext.tsx      ← Re-exports from store
    │   ├── hooks/
    │   │   └── use-toast.ts
    │   ├── lib/
    │   │   ├── http.ts             ← Base fetch client
    │   │   ├── api.ts              ← Re-exports (compat)
    │   │   └── utils.ts            ← cn(), formatCurrency()
    │   ├── pages/
    │   │   ├── Login.tsx
    │   │   ├── Dashboard.tsx
    │   │   ├── AddEntry.tsx
    │   │   ├── History.tsx
    │   │   ├── Settings.tsx
    │   │   └── Admin.tsx
    │   ├── services/               ← API call functions per domain
    │   │   ├── auth.service.ts
    │   │   ├── delivery.service.ts
    │   │   ├── settings.service.ts
    │   │   └── user.service.ts
    │   ├── store/
    │   │   └── auth.store.tsx      ← Auth state (Context + hooks)
    │   ├── types/
    │   │   └── index.ts            ← Shared TypeScript interfaces
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── public/
    ├── index.html
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── tsconfig.json
    └── package.json
```

## Setup

### 1. Configure MongoDB
Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/dairydrop?retryWrites=true&w=majority
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
```

### 2. Run — open two terminals

**Terminal 1 — Backend**
```bash
cd backend
npm run dev
```
→ http://localhost:5000/api/healthz

**Terminal 2 — Frontend**
```bash
cd frontend
npm run dev
```
→ http://localhost:5173

## Default Login
| Username | Password  |
|----------|-----------|
| `admin`  | `admin123`|
