# Northstar Frontend

Independent Next.js frontend for the Northstar agency intelligence platform.

## Setup

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Environment variables:

- `NEXT_PUBLIC_API_URL`: public backend API URL, including `/api`.
- `NEXT_PUBLIC_DEMO_MODE`: `true` for browser-local demo accounts; `false` for MongoDB/JWT authentication and API data.

The demo administrator is `admin@northstar.local` with password `Northstar123!`. Accounts created
in demo mode are stored only in that browser. In API mode, signup creates a researcher account in
MongoDB and login issues an eight-hour JWT.

## Production

Public Next.js environment variables are embedded at build time. Set them before running:

```bash
npm run lint
npm run typecheck
npm run build
npm start
```

With the production server running on port `3010`, the browser suite can be run with
`npm run test:e2e`.

The folder can be deployed directly to Vercel or built with its standalone `Dockerfile`.

## Deploy on Vercel

1. Import the Git repository as a new Vercel project.
2. Set **Root Directory** to `frontend`.
3. Keep the detected **Next.js** framework preset and default build/output settings.
4. Add these environment variables for Production and Preview:
   - `NEXT_PUBLIC_API_URL=https://your-backend-project.vercel.app/api`
   - `NEXT_PUBLIC_DEMO_MODE=false`
5. Deploy after the backend URL is available.

`NEXT_PUBLIC_*` values are compiled into the browser bundle, so redeploy after changing the backend URL.
