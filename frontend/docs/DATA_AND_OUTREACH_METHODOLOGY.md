# Northstar data, issue, scoring, and outreach methodology

Last reviewed: 7 September 2026

## Current data status

The records shipped with the application are **illustrative demo data, not real businesses or
verified leads**. They are generated in `frontend/lib/demo-data.ts` and mirrored by the optional
backend seed script.

Indicators that the records are synthetic:

- Business names and performance figures were written for the demo.
- Telephone numbers use the North American `555` fictional-number pattern.
- Email addresses use the reserved `.example` domain.
- Website references use `example.com`, a reserved documentation domain.
- Review counts, scores, dates, addresses, services, and observations are fabricated.

Demo records must never be contacted or used to make a business decision. Setting
`NEXT_PUBLIC_DEMO_MODE=false` only switches the frontend to the backend API; it does not make seeded
records real. The backend seed command also creates illustrative records and must not be run against
a production lead database.

## What the application currently collects

The Research workspace now supports an on-demand live discovery path through xAI Grok Web Search,
in addition to manual, CSV, and JSON entry. Live discovery is active only when the production
frontend is connected to the backend and `XAI_API_KEY` is configured on the backend. The key must
never be exposed through a `NEXT_PUBLIC_*` variable.

The live-search endpoint asks Grok to search the current web for businesses matching the selected
country, region, city, area, industry, and niche. It requires structured results containing source
URLs. Results are displayed as **candidates requiring review**; they are not silently promoted to
verified businesses or contacted.

This repository still does not contain a general-purpose unrestricted crawler. Grok Web Search is
the discovery provider. Google Places, Yelp Fusion, PageSpeed, and dedicated SERP integrations can
be added as stronger sources for their respective fields. Collection must not bypass login walls,
CAPTCHAs, robots controls, rate limits, or provider/site terms.

### Requirements for live Grok discovery

- A funded xAI API account and server-side `XAI_API_KEY`.
- A Grok model with Web Search and structured-output support; `XAI_MODEL=grok-4.6` is the current
  default in this project.
- `NEXT_PUBLIC_DEMO_MODE=false` in the deployed frontend.
- `NEXT_PUBLIC_API_URL` pointing to the deployed backend `/api` URL.
- Working MongoDB, JWT authentication, and the frontend origin in backend CORS.
- A user with Admin or Researcher authorization.
- Network egress from the backend to `https://api.x.ai`.

### Live-search request lifecycle

1. Select or add a market in Settings and choose it from the workspace selector.
2. Open Research, define industry, niche, and area, then choose **Live web**.
3. The frontend sends only the search scope and result limit to the authenticated backend.
4. The backend calls the xAI Responses API with the Web Search tool and a strict business schema.
5. Grok returns current candidate fields and citation URLs. Unknown values must be `null`.
6. The backend validates the JSON and URLs before returning candidates to the browser.
7. The researcher opens each citation and verifies identity/contact facts before importing it.
8. A later audit stage checks the website/profile and calculates opportunity scores from retained
   evidence.

### Daily collection workflow

Daily discovery is implemented as persistent MongoDB schedules and jobs. The Research screen lets
an Admin or Researcher save the current market+niche scope, pause/resume it, delete it, inspect recent
job status, and retry a failed job. The backend Vercel cron runs at 03:00 UTC and is protected by a
server-side `CRON_SECRET` Authorization header.

For every invocation, the worker:

1. Reconciles every due active schedule into a job with a unique schedule-occurrence key.
2. Advances the schedule to its next daily UTC occurrence.
3. Atomically claims queued jobs and recovers locks left stale by interrupted functions.
4. Atomically reserves xAI daily-budget capacity before making a provider request.
5. Runs a bounded number of jobs concurrently and retries failures after a delay.
6. Stores the structured response and counts on the durable job record.
7. Deduplicates candidates by normalized website domain, or by normalized name+city+country when no
   website is known, while merging source URLs and tracking first/last seen times.

Production requires `CRON_SECRET` (at least 16 random characters), `XAI_API_KEY`, MongoDB, and the
normal authentication variables. `XAI_DAILY_SEARCH_BUDGET`, `RESEARCH_JOBS_PER_CRON`, and
`RESEARCH_JOB_MAX_ATTEMPTS` control spend, concurrency, and retries. The included once-daily cron is
compatible with Vercel Hobby. If a paid plan later needs per-schedule run times, the cron can be
changed to hourly while the persisted `timeUtc` field continues to determine when each scope is due.

This MongoDB queue survives serverless restarts and makes each provider call recoverable. Very large
or long-running crawls should still move to a dedicated queue/worker platform rather than increasing
one function's duration indefinitely.

## Recommended real-data pipeline

1. The operator selects a configured country, city, and service area.
2. An approved provider returns public business records for that location and niche.
3. Northstar stores the provider/source URL, provider record ID, collection time, and raw observed
   values. Missing values remain unknown.
4. Duplicate records are merged using provider ID first, then normalized website/domain and public
   phone as secondary signals.
5. Website and profile checks run only against public URLs and retain evidence for every finding.
6. A researcher reviews the record before it becomes eligible for outreach.
7. Calculated scores and generated recommendations are kept separate from observed facts.

Suggested provider roles:

| Need | Preferred source |
| --- | --- |
| Business identity, address, phone, rating | Google Places API or another licensed directory API |
| Additional public listing evidence | Yelp Fusion API where its terms permit the intended use |
| Website performance | Google PageSpeed Insights API |
| Search visibility | A licensed SERP API |
| Website facts | The business's public website, fetched respectfully and rate-limited |

## How an issue should be defined

An issue is valid only when a recorded observation and source support it. `Unknown` is not the same
as `Weak`.

### Website audit

Checks include whether a website exists, mobile usability, design condition, speed, HTTPS, calls to
action, lead forms, booking capability, service/contact/location pages, local optimization, and
conversion quality.

- **Good:** the criterion was observed and meets the documented standard.
- **Weak:** the criterion was observed and does not meet the standard.
- **Unknown:** it was not checked or the available evidence is insufficient.

### SEO audit

Checks include local keyword targeting, titles, service and location pages, useful content, internal
links, technical SEO, structured data, indexing health, and relative competitor visibility.

### Google Business Profile audit

Checks include recent review activity, description, photos, posts, primary category, services,
profile completeness, and local visibility. A weak finding must record the profile URL and the date
observed.

### Social audit

Checks include posting recency/frequency, visible engagement, brand consistency, content quality,
cross-channel consistency, and observable audience trend. Private analytics must not be inferred
from public pages.

## Score basis

The potential-client score is an opportunity score, not a statement about business quality. The
backend caps each component at its configured weight and totals the components to 100.

| Component | Maximum points | Meaning |
| --- | ---: | --- |
| Revenue and budget potential | 20 | Evidence-backed commercial fit |
| SEO opportunity | 20 | Observable local/search visibility gap |
| Website improvement opportunity | 15 | Inverse of recorded website quality |
| Google Business Profile opportunity | 15 | Observable profile/local visibility gap |
| Marketing need | 15 | Supported need across audited channels |
| Ease of contact | 5 | Valid public business contact route |
| Competition opportunity | 10 | Evidence that improvement is realistically attainable |

Priority boundaries:

- Excellent: 85–100
- High: 70–84
- Medium: 55–69
- Low: below 55

Service recommendations compare recorded website, SEO, Google Business Profile, and social scores.
For example, weak website quality increases website-conversion opportunity, while a high SEO-gap
score increases Local SEO or Technical SEO priority. A recommendation must never introduce a claim
that is absent from the stored audit evidence.

## Source-link behavior

For real records, source cards should open the exact retained source URL in a new tab. Demo source
cards are explicitly labelled illustrative. Their links demonstrate navigation only and do not
constitute evidence. “View all” opens the Research tab for the record.

## Gmail and cold-email behavior

The current safe integration opens a new Gmail compose window with recipient, subject, and body
pre-filled. Gmail requires the signed-in user to review and press **Send**. The application does not
silently send messages.

True direct sending requires a separate production integration:

1. Create a Google Cloud OAuth application and enable the Gmail API.
2. Configure an authorized redirect URI for the deployed backend.
3. Request the minimum Gmail send scope and obtain explicit user consent.
4. Store refresh tokens encrypted at rest and isolate them per Northstar user/workspace.
5. Add a backend send endpoint with authentication, authorization, validation, idempotency, rate
   limits, audit logging, unsubscribe/suppression checks, and provider error handling.
6. Require a deliberate confirmation for each send or an explicitly reviewed campaign batch.
7. Follow Gmail policies and applicable anti-spam/privacy law, including CAN-SPAM, UK GDPR/PECR, and
   local requirements for the recipient market.

OAuth client credentials and a sending account are not present in this repository, so direct Gmail
API sending cannot be enabled safely merely by adding frontend code. Never place a Gmail password,
OAuth client secret, or refresh token in a `NEXT_PUBLIC_*` variable.
