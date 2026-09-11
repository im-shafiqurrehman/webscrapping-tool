# Data, privacy, and readiness

## Is the data real?

The platform does not include fake or sample business records. It searches current public web
sources through the configured provider and can also accept user-supplied records. Unknown values
remain empty instead of being invented.

Search results are real-time discovery candidates, not guaranteed facts. A source link proves where
the information was found, but it does not guarantee that a business is still active or that every
phone number, email, rating, and address is current. Users must review the sources before importing,
scoring, or contacting a candidate.

## User data

Accounts and saved workspace records are stored in MongoDB. Passwords are hashed, sessions use
time-limited tokens, and provider/database secrets stay on the backend. Each user can access only
the business and research records belonging to that account.

Operators remain responsible for retention, deletion, consent, provider terms, privacy law, and
anti-spam compliance. The platform must not be used to collect private data or bypass access
controls.

## Current readiness

The following functions are operational:

- Authenticated signup and login.
- On-demand public-web business discovery with retained source links.
- Scheduled daily searches, persistent jobs, retries, deduplication, and daily provider budgets.
- User-scoped business records, dashboards, audits, pipeline updates, reports, and outreach drafts.
- Rejection of malformed search responses and candidates without inspectable source evidence.

This is currently a **review-assisted research system**, not a fully autonomous, continuous,
failure-free scraping service. It can support controlled research and testing, but it is not yet
ready to promise complete daily market coverage or fully verified sales leads without human review.

## Current challenges

- Free search-provider limits can delay or reject searches, and provider availability is outside the
  platform's control.
- The production cron runs once daily. With the free Groq provider, only one queued search is
  processed per invocation, so multiple schedules can create a backlog.
- On-demand results are displayed for review but are not automatically saved as business records.
  Scheduled results remain candidates until a user reviews and promotes them.
- Source validation rejects unsupported links, but there is no independent service confirming that
  every contact detail is accurate, deliverable, or recently updated.
- Deduplication reduces repeats but can merge businesses that share a domain or fail to recognize
  the same business when its name or website changes.
- There is no complete website crawler, Google Places integration, PageSpeed audit, email verifier,
  or automated broken-link monitor.
- Failed jobs are recorded and retried, but there is no external alerting dashboard for persistent
  failures or growing queue backlogs.
- Vercel execution limits and provider response time can interrupt larger searches. Higher-volume
  collection needs a recurring worker or more frequent queue consumer.
- Gmail currently opens a pre-filled compose screen. It does not automatically send mail through a
  connected Gmail OAuth account.

## Business-need assessment

The platform currently fulfills the need to discover source-backed candidates, review them, and
manage approved records through a sales workflow. It does **not yet fully fulfill** the need for
unattended daily lead generation with guaranteed accuracy, broad market coverage, automatic audits,
and direct email delivery.

Production readiness requires a candidate review/import workflow, stronger first-party data
providers, contact and link verification, a higher-throughput worker schedule, monitoring and
alerts, and an end-to-end production test using real provider and deployment credentials.
