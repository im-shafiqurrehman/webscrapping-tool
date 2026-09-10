import { createHash, timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';
import { ProviderUsage, ResearchCandidate, ResearchJob, ResearchSchedule } from '../models/index.js';
import { searchBusinessesWithXai, type LiveResearchCandidate } from './xai-search.service.js';

export function isValidCronAuthorization(value: string | undefined, secret: string) {
  const supplied = value ?? '';
  const expected = `Bearer ${secret}`;
  return (
    supplied.length === expected.length &&
    timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))
  );
}

export function nextDailyRun(timeUtc: string, from = new Date()) {
  const [hour, minute] = timeUtc.split(':').map(Number) as [number, number];
  const next = new Date(from);
  next.setUTCSeconds(0, 0);
  next.setUTCHours(hour, minute, 0, 0);
  if (next <= from) next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

export function researchOccurrenceKey(scheduleId: string, scheduledFor: Date) {
  return `${scheduleId}:${scheduledFor.toISOString()}`;
}

function candidateFingerprint(candidate: LiveResearchCandidate, city: string, country: string) {
  let identity: string | undefined;
  if (candidate.website) {
    identity = new URL(candidate.website).hostname.toLowerCase().replace(/^www\./, '');
  }
  if (!identity) identity = `${candidate.name}|${city}|${country}`.toLowerCase().replace(/\s+/g, ' ');
  return createHash('sha256').update(identity).digest('hex');
}

export async function enqueueDueResearchSchedules(now = new Date()) {
  const schedules = await ResearchSchedule.find({ enabled: true, nextRunAt: { $lte: now } })
    .sort({ nextRunAt: 1 })
    .limit(100);
  let enqueued = 0;
  for (const schedule of schedules) {
    const scheduledFor = schedule.nextRunAt;
    const result = await ResearchJob.updateOne(
      { idempotencyKey: researchOccurrenceKey(String(schedule._id), scheduledFor) },
      {
        $setOnInsert: {
          schedule: schedule._id,
          idempotencyKey: researchOccurrenceKey(String(schedule._id), scheduledFor),
          status: 'queued',
          scheduledFor,
          attempts: 0,
          maxAttempts: env.RESEARCH_JOB_MAX_ATTEMPTS,
          createdBy: schedule.createdBy,
        },
      },
      { upsert: true },
    );
    if (result.upsertedCount) enqueued += 1;
    schedule.nextRunAt = nextDailyRun(schedule.timeUtc, now);
    await schedule.save();
  }
  return enqueued;
}

async function reserveProviderCall(now: Date) {
  const utcDay = now.toISOString().slice(0, 10);
  const key = `xai:${utcDay}`;
  const incrementExisting = () =>
    ProviderUsage.findOneAndUpdate(
      { key, used: { $lt: env.XAI_DAILY_SEARCH_BUDGET } },
      { $inc: { used: 1 } },
      { new: true },
    );
  const existing = await incrementExisting();
  if (existing) return existing.used;
  try {
    const usage = await ProviderUsage.create({ key, provider: 'xai', utcDay, used: 1 });
    return usage.used;
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return (await incrementExisting())?.used ?? null;
    }
    throw error;
  }
}

async function claimJob(now: Date) {
  return ResearchJob.findOneAndUpdate(
    {
      scheduledFor: { $lte: now },
      attempts: { $lt: env.RESEARCH_JOB_MAX_ATTEMPTS },
      $or: [
        { status: 'queued' },
        { status: 'running', lockExpiresAt: { $lt: now } },
      ],
    },
    {
      $set: {
        status: 'running',
        lockedAt: now,
        lockExpiresAt: new Date(now.getTime() + 10 * 60_000),
        startedAt: now,
        error: null,
      },
      $inc: { attempts: 1 },
    },
    { new: true, sort: { scheduledFor: 1 } },
  );
}

async function storeCandidates(
  jobId: unknown,
  schedule: {
    market: { city: string; region: string; country: string; area?: string };
    industry: string;
    niche: string;
  },
  businesses: LiveResearchCandidate[],
) {
  let newCandidates = 0;
  const now = new Date();
  for (const candidate of businesses) {
    const { sourceUrls, ...fields } = candidate;
    const result = await ResearchCandidate.updateOne(
      { fingerprint: candidateFingerprint(candidate, schedule.market.city, schedule.market.country) },
      {
        $set: {
          ...fields,
          market: schedule.market,
          industry: schedule.industry,
          niche: schedule.niche,
          lastSeenAt: now,
          lastJob: jobId,
        },
        $setOnInsert: { firstSeenAt: now },
        $inc: { seenCount: 1 },
        $addToSet: { sourceUrls: { $each: sourceUrls } },
      },
      { upsert: true, setDefaultsOnInsert: false },
    );
    if (result.upsertedCount) newCandidates += 1;
  }
  return newCandidates;
}

async function processOneJob(now: Date) {
  const job = await claimJob(now);
  if (!job) return null;
  const reservedUsage = await reserveProviderCall(now);
  if (reservedUsage === null) {
    await ResearchJob.updateOne(
      { _id: job._id },
      {
        $set: { status: 'queued', scheduledFor: new Date(now.getTime() + 60 * 60_000) },
        $unset: { lockedAt: 1, lockExpiresAt: 1, startedAt: 1 },
        $inc: { attempts: -1 },
      },
    );
    return { id: String(job._id), status: 'budget_exhausted' as const };
  }
  try {
    const schedule = await ResearchSchedule.findById(job.schedule).lean();
    if (!schedule) throw new Error('Research schedule no longer exists');
    if (!schedule.market) throw new Error('Research schedule has no market');
    const scope = {
      market: {
        city: schedule.market.city,
        region: schedule.market.region,
        country: schedule.market.country,
        ...(schedule.market.area ? { area: schedule.market.area } : {}),
      },
      industry: schedule.industry,
      niche: schedule.niche,
    };
    const result = await searchBusinessesWithXai({
      ...scope,
      limit: schedule.limit,
    });
    const newCandidateCount = await storeCandidates(job._id, scope, result.businesses);
    await ResearchJob.updateOne(
      { _id: job._id, status: 'running' },
      {
        $set: {
          status: 'completed',
          completedAt: new Date(),
          result,
          discoveredCount: result.businesses.length,
          newCandidateCount,
        },
        $unset: { lockedAt: 1, lockExpiresAt: 1 },
      },
    );
    await ResearchSchedule.updateOne({ _id: schedule._id }, { $set: { lastRunAt: new Date() } });
    return { id: String(job._id), status: 'completed' as const };
  } catch (error) {
    const retry = job.attempts < job.maxAttempts;
    await ResearchJob.updateOne(
      { _id: job._id },
      {
        $set: {
          status: retry ? 'queued' : 'failed',
          scheduledFor: retry ? new Date(Date.now() + 15 * 60_000) : job.scheduledFor,
          error: error instanceof Error ? error.message.slice(0, 1000) : 'Unknown job error',
          completedAt: retry ? null : new Date(),
        },
        $unset: { lockedAt: 1, lockExpiresAt: 1 },
      },
    );
    return { id: String(job._id), status: retry ? ('retrying' as const) : ('failed' as const) };
  }
}

export async function runDailyResearchCron(now = new Date()) {
  const enqueued = await enqueueDueResearchSchedules(now);
  const processed = (await Promise.all(
    Array.from({ length: env.RESEARCH_JOBS_PER_CRON }, () => processOneJob(new Date())),
  )).filter((result) => result !== null);
  const utcDay = now.toISOString().slice(0, 10);
  const usage = await ProviderUsage.findOne({ key: `xai:${utcDay}` }).lean();
  const used = usage?.used ?? 0;
  return {
    enqueued,
    processed,
    budget: {
      limit: env.XAI_DAILY_SEARCH_BUDGET,
      used,
      remaining: Math.max(0, env.XAI_DAILY_SEARCH_BUDGET - used),
    },
  };
}
