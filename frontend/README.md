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
The frontend always uses MongoDB/JWT authentication through the backend API. Signup creates a
researcher account in MongoDB; no browser-local sample accounts or business records are bundled.

## Production

Public Next.js environment variables are embedded at build time. Set them before running:

```bash
npm run lint
npm run typecheck
npm run build
npm start
```

The folder can be deployed directly to Vercel or built with its standalone `Dockerfile`.

## Deploy on Vercel

1. Import the Git repository as a new Vercel project.
2. Set **Root Directory** to `frontend`.
3. Keep the detected **Next.js** framework preset and default build/output settings.
4. Add `NEXT_PUBLIC_API_URL=https://your-backend-project.vercel.app/api` for Production and Preview.
5. Deploy after the backend URL is available.

`NEXT_PUBLIC_*` values are compiled into the browser bundle, so redeploy after changing the backend URL.
