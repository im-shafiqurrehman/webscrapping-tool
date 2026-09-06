# Northstar Backend

Independent Express.js REST API for Northstar, backed by MongoDB.

## Setup

```bash
npm ci
cp .env.example .env
npm run seed
npm run dev
```

Required production values:

- `MONGODB_URI`: private MongoDB connection URI.
- `JWT_SECRET`: at least 32 random characters.
- `CORS_ORIGIN`: exact public frontend origin; comma-separated origins are supported.
- `PORT`: defaults to `4000`.

## Verification and production

```bash
npm run lint
npm test
npm run typecheck
npm run build
npm start
```

The folder includes a standalone multi-stage Dockerfile. See [API.md](API.md) for routes and role permissions.

## Deploy on Vercel

The API includes `src/index.ts`, which default-exports the Express application for Vercel’s Express runtime. MongoDB is connected lazily and the connection pool is reused by warm function instances. `src/server.ts` remains the local and Docker entry point.

1. Import the same Git repository as a second Vercel project.
2. Set **Root Directory** to `backend`.
3. Let Vercel detect **Express**; no output directory is required.
4. Add these environment variables for Production and Preview:
   - `MONGODB_URI`
   - `JWT_SECRET` with at least 32 random characters
   - `CORS_ORIGIN=https://your-frontend-project.vercel.app`
   - `NODE_ENV=production`
5. Deploy and verify `https://your-backend-project.vercel.app/api/health`.

Deploy the backend first, place its URL in the frontend project, then deploy the frontend. If you use preview deployments, add the permitted preview frontend origins to `CORS_ORIGIN` as a comma-separated list.
