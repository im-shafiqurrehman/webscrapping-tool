# Northstar REST API

Base URL: `/api`. Responses are JSON. Except for health and login, pass `Authorization: Bearer <token>`.

## Authentication and roles

`POST /auth/login` accepts `{ "email": "…", "password": "…" }`.

- Admin: full access, delete businesses, create niches.
- Researcher: create/edit businesses, imports, audits, research runs, rescoring.
- Sales: view prospects, generate outreach, update the pipeline.

## Routes

| Method           | Route                        | Purpose                                     |
| ---------------- | ---------------------------- | ------------------------------------------- |
| GET              | `/health`                    | Liveness check                              |
| GET/POST         | `/businesses`                | Paginated list or create                    |
| GET/PATCH/DELETE | `/businesses/:id`            | Business profile operations                 |
| POST             | `/businesses/import`         | Validated JSON batch, maximum 1,000 records |
| GET/POST         | `/niches`                    | Niche rankings or create a niche            |
| GET              | `/niches/:id/stats`          | Evidence-gated niche gap statistics         |
| POST/PATCH       | `/audits`, `/audits/:id`     | Create or update a typed audit              |
| POST             | `/scoring/recalculate`       | Recalculate one set or all businesses       |
| GET              | `/prospects/top?limit=20`    | Top prospects (maximum 100)                 |
| POST/GET         | `/research`, `/research/:id` | Create/read a research run                  |
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
