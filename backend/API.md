# Northstar REST API

Base URL: `/api`. Responses are JSON. Except for health, signup, and login, pass `Authorization: Bearer <token>`.

## Authentication and roles

- `POST /auth/signup` accepts `{ "name": "…", "email": "…", "password": "…" }` and creates a researcher account.
- `POST /auth/login` accepts `{ "email": "…", "password": "…" }`.
- `GET /auth/me` returns the authenticated user.

- Admin: full access, delete businesses, create niches.
- Researcher: create/edit businesses, imports, audits, research runs, rescoring.
- Sales: view prospects, generate outreach, update the pipeline.

## Routes

| Method           | Route                        | Purpose                                     |
| ---------------- | ---------------------------- | ------------------------------------------- |
| GET              | `/health`                    | Liveness check                              |
| POST             | `/auth/signup`               | Create an account and return an access token |
| POST             | `/auth/login`                | Authenticate and return an access token      |
| GET              | `/auth/me`                   | Return the authenticated user                |
| GET/POST         | `/businesses`                | Paginated list or create                    |
| GET/PATCH/DELETE | `/businesses/:id`            | Business profile operations                 |
| POST             | `/businesses/import`         | Validated JSON batch, maximum 1,000 records |
| GET/POST         | `/niches`                    | Niche rankings or create a niche            |
| GET              | `/niches/:id/stats`          | Evidence-gated niche gap statistics         |
| POST/PATCH       | `/audits`, `/audits/:id`     | Create or update a typed audit              |
| POST             | `/scoring/recalculate`       | Recalculate one set or all businesses       |
| GET              | `/prospects/top?limit=20`    | Top prospects (maximum 100)                 |
| POST/GET         | `/research`, `/research/:id` | Create/read a research run                  |
| POST             | `/research/live-search`      | Discover cited live candidates with the configured provider |
| GET/POST         | `/research/schedules`        | List or create persistent daily searches   |
| PATCH/DELETE     | `/research/schedules/:id`    | Pause, resume, edit, or remove a schedule   |
| GET              | `/research/jobs`             | Inspect the latest 50 durable jobs          |
| POST             | `/research/jobs/:id/retry`   | Requeue a failed job                        |
| GET              | `/research/candidates`       | List deduplicated discovered candidates     |
| GET              | `/cron/daily-research`       | Secret-protected Vercel cron worker         |
| PATCH            | `/pipeline/:businessId`      | Update pipeline status and next action      |
| POST             | `/outreach/generate`         | Generate a message from stored findings     |
| GET              | `/reports/market`            | Market report using supported samples       |
| GET              | `/dashboard`                 | Dashboard aggregates and top ten            |

## Business filters

`GET /businesses` supports `page`, `limit` (max 100), `search`, `industry`, `niche`, `city`, `area`, `priority`, `status`, `minScore`, `maxScore`, and `sort=score|newest|reviews|name`.

List responses follow:

```json
{
  "data": [],
  "meta": { "page": 1, "pageSize": 25, "total": 0, "pages": 0 }
}
```

Errors follow `{ "error": { "message": "…", "details": {} } }`. Missing information is omitted or null; it is never fabricated.

## Live business discovery

`POST /research/live-search` requires an Admin or Researcher token and a server-side provider key.
`SEARCH_PROVIDER=groq` uses `GROQ_API_KEY` and Groq Compound by default. `SEARCH_PROVIDER=xai`
remains available as an optional fallback. Example request:

```json
{
  "market": {
    "city": "London",
    "region": "Greater London",
    "country": "United Kingdom",
    "area": "Westminster"
  },
  "industry": "Home Services",
  "niche": "Plumbing",
  "limit": 10
}
```

The response includes `provider`, `model`, `searchedAt`, `businesses`, and `citations`. Each
business must contain at least one `sourceUrls` entry. These are discovery candidates and must be
reviewed before import, scoring, or outreach.

## Daily research automation

`POST /research/schedules` accepts the same market, industry, niche, and limit fields as live
search, plus `name`, `timeUtc`, and `enabled`. The deployed backend invokes
`GET /cron/daily-research` at 03:00 UTC through `backend/vercel.json`. Vercel supplies
`Authorization: Bearer <CRON_SECRET>`; the endpoint rejects missing or invalid credentials.

The worker reconciles due schedules into MongoDB-backed jobs. A unique schedule-occurrence key
prevents duplicate enqueueing. Jobs use atomic claims with expiring locks, retry transient failures,
and retain status/results for the Research screen. Candidate records are deduplicated by normalized
website domain, falling back to normalized business name plus city and country. Existing candidates
are updated with the latest observation and their source URLs are merged.

Required production variables are `CRON_SECRET`, `SEARCH_PROVIDER`, the selected provider key,
`MONGODB_URI`, and `JWT_SECRET`. Groq uses `GROQ_API_KEY`, `GROQ_MODEL`, and
`GROQ_DAILY_SEARCH_BUDGET`. Optional worker controls are `RESEARCH_JOBS_PER_CRON` and
`RESEARCH_JOB_MAX_ATTEMPTS`. The selected provider's budget is reserved atomically per UTC day,
including retries.

Groq responses are schema-validated and passed through an evidence gate. A candidate is retained
only when at least one claimed source URL matches a URL in Groq's executed web-search or
visit-website output. Results are still candidates requiring human review; the gate proves that a
page was returned by the provider, not that every statement on that page is accurate or current.
