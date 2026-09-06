import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import {
  Activity,
  Audit,
  Business,
  Lead,
  Niche,
  Outreach,
  ResearchRun,
  User,
} from '../models/index.js';
import { findBusinesses } from '../repositories/business.repository.js';
import {
  calculateClientScore,
  mainOpportunity,
  recommendServices,
} from '../services/scoring.service.js';
import { AppError } from '../utils/errors.js';
import { businessInput, businessPatch, businessQuery } from '../validators/business.validator.js';
import type { AuthRequest } from '../middlewares/auth.js';

const id = (req: Request) => req.params.id as string;
const logActivity = (req: AuthRequest, action: string, entityType: string, entityId?: unknown) =>
  Activity.create({ actor: req.user?.id, action, entityType, entityId, ip: req.ip }).catch(
    () => undefined,
  );

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) throw new AppError(422, 'Email and password are required');
  const user = await User.findOne({ email: email.toLowerCase(), active: true }).select(
    '+passwordHash',
  );
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    throw new AppError(401, 'Invalid credentials');
  const token = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}

export async function listBusinesses(req: Request, res: Response) {
  res.json(await findBusinesses(businessQuery.parse(req.query)));
}

export async function getBusiness(req: Request, res: Response) {
  const business = await Business.findById(id(req)).populate('industry niche tags').lean();
  if (!business) throw new AppError(404, 'Business not found');
  const [audits, lead, outreach] = await Promise.all([
    Audit.find({ business: business._id }).lean(),
    Lead.findOne({ business: business._id }).lean(),
    Outreach.find({ business: business._id }).sort({ createdAt: -1 }).lean(),
  ]);
  res.json({ ...business, audits, lead, outreach });
}

function derivedFields(payload: ReturnType<typeof businessInput.parse>) {
  const scores = payload.scores ?? {
    website: 0,
    seo: 0,
    googleBusiness: 0,
    social: 0,
    marketingNeed: 0,
    revenuePotential: 0,
    contactability: 0,
    competition: 0,
  };
  const { score, priority } = calculateClientScore({
    revenuePotential: scores.revenuePotential,
    seoOpportunity: scores.seo * 2,
    websiteOpportunity: (10 - scores.website) * 1.5,
    gbpOpportunity: scores.googleBusiness * 1.5,
    marketingNeed: scores.marketingNeed,
    contactability: scores.contactability,
    competitionOpportunity: scores.competition,
  });
  return {
    scores: { ...scores, clientScore: score },
    priority,
    recommendedServices: recommendServices(scores),
    mainOpportunity: mainOpportunity(scores),
    researchedAt: new Date(),
  };
}

export async function createBusiness(req: AuthRequest, res: Response) {
  const payload = businessInput.parse(req.body);
  const business = await Business.create({
    ...payload,
    ...derivedFields(payload),
    lastUpdatedBy: req.user?.id,
  });
  await Lead.create({ business: business._id, status: 'New Lead' });
  void logActivity(req, 'business.created', 'Business', business._id);
  res.status(201).json(business);
}

export async function updateBusiness(req: AuthRequest, res: Response) {
  const payload = businessPatch.parse(req.body);
  const full = businessInput.safeParse({
    ...(await Business.findById(id(req)).lean()),
    ...payload,
  });
  const derived = full.success ? derivedFields(full.data) : {};
  const business = await Business.findByIdAndUpdate(
    id(req),
    { ...payload, ...derived, lastUpdatedBy: req.user?.id },
    { new: true, runValidators: true },
  );
  if (!business) throw new AppError(404, 'Business not found');
  void logActivity(req, 'business.updated', 'Business', business._id);
  res.json(business);
}

export async function deleteBusiness(req: AuthRequest, res: Response) {
  const business = await Business.findByIdAndDelete(id(req));
  if (!business) throw new AppError(404, 'Business not found');
  await Promise.all([
    Audit.deleteMany({ business: business._id }),
    Lead.deleteMany({ business: business._id }),
    Outreach.deleteMany({ business: business._id }),
  ]);
  void logActivity(req, 'business.deleted', 'Business', business._id);
  res.status(204).end();
}

export async function importBusinesses(req: AuthRequest, res: Response) {
  if (!Array.isArray(req.body) || req.body.length > 1000)
    throw new AppError(422, 'Import must contain 1–1,000 records');
  const records = req.body.map((row) => businessInput.parse(row));
  const operations = records.map((payload) => ({
    insertOne: { document: { ...payload, ...derivedFields(payload), lastUpdatedBy: req.user?.id } },
  }));
  const result = await Business.bulkWrite(operations, { ordered: false });
  void logActivity(req, 'business.imported', 'Business');
  res.status(201).json({ imported: result.insertedCount });
}

export async function listNiches(_req: Request, res: Response) {
  const niches = await Niche.aggregate([
    {
      $lookup: {
        from: 'industries',
        localField: 'industry',
        foreignField: '_id',
        as: 'industryDoc',
      },
    },
    { $lookup: { from: 'businesses', localField: '_id', foreignField: 'niche', as: 'businesses' } },
    {
      $addFields: {
        industryName: { $first: '$industryDoc.name' },
        businessesFound: { $size: '$businesses' },
        averageClientScore: { $ifNull: [{ $avg: '$businesses.scores.clientScore' }, 0] },
        averageDigitalScore: { $ifNull: [{ $avg: '$businesses.scores.website' }, 0] },
        seoOpportunity: { $ifNull: [{ $avg: '$businesses.scores.seo' }, 0] },
      },
    },
    { $project: { industryDoc: 0, businesses: 0 } },
    { $sort: { averageClientScore: -1 } },
  ]);
  res.json({ data: niches });
}

export async function createNiche(req: Request, res: Response) {
  const { name, industry, description } = req.body as {
    name?: string;
    industry?: string;
    description?: string;
  };
  if (!name || !industry) throw new AppError(422, 'Name and industry are required');
  res.status(201).json(await Niche.create({ name, industry, description }));
}

export async function nicheStats(req: Request, res: Response) {
  const stats = await Business.aggregate([
    { $match: { niche: new (await import('mongoose')).Types.ObjectId(id(req)) } },
    {
      $group: {
        _id: '$niche',
        businesses: { $sum: 1 },
        averageClientScore: { $avg: '$scores.clientScore' },
        averageWebsiteQuality: { $avg: '$scores.website' },
        averageSEOOpportunity: { $avg: '$scores.seo' },
        averageGBPOpportunity: { $avg: '$scores.googleBusiness' },
        weakWebsites: { $sum: { $cond: [{ $lte: ['$scores.website', 5] }, 1, 0] } },
        weakSEO: { $sum: { $cond: [{ $gte: ['$scores.seo', 6] }, 1, 0] } },
      },
    },
  ]);
  const row = stats[0];
  if (!row)
    return res.json({
      sampleSize: 0,
      message: 'Not enough researched records to calculate statistics',
    });
  // Gap percentages require a defensible minimum sample.
  res.json({
    ...row,
    sampleSize: row.businesses,
    gaps:
      row.businesses >= 5
        ? {
            weakWebsites: Math.round((row.weakWebsites / row.businesses) * 100),
            weakSEO: Math.round((row.weakSEO / row.businesses) * 100),
          }
        : null,
  });
}

export async function saveAudit(req: AuthRequest, res: Response) {
  const { business, type, score, checks, notes, evidenceUrls } = req.body as Record<
    string,
    unknown
  >;
  if (
    !business ||
    !['website', 'seo', 'gbp', 'social'].includes(String(type)) ||
    Number(score) < 0 ||
    Number(score) > 10
  )
    throw new AppError(422, 'Valid business, type, and score are required');
  const audit = await Audit.findOneAndUpdate(
    { business, type },
    { score, checks, notes, evidenceUrls, observedAt: new Date(), observedBy: req.user?.id },
    { upsert: true, new: true, runValidators: true },
  );
  const scoreKey = type === 'gbp' ? 'googleBusiness' : type;
  await Business.findByIdAndUpdate(business, { [`scores.${scoreKey}`]: score });
  void logActivity(req, 'audit.saved', 'Audit', audit._id);
  res.status(201).json(audit);
}

export async function recalculateScores(req: AuthRequest, res: Response) {
  const businesses = await Business.find(
    req.body?.businessIds ? { _id: { $in: req.body.businessIds } } : {},
  );
  for (const business of businesses) {
    const scores = business.scores as unknown as {
      website: number;
      seo: number;
      googleBusiness: number;
      social: number;
      marketingNeed: number;
      revenuePotential: number;
      contactability: number;
      competition: number;
      clientScore: number;
    };
    const { score, priority } = calculateClientScore({
      revenuePotential: scores.revenuePotential,
      seoOpportunity: scores.seo * 2,
      websiteOpportunity: (10 - scores.website) * 1.5,
      gbpOpportunity: scores.googleBusiness * 1.5,
      marketingNeed: scores.marketingNeed,
      contactability: scores.contactability,
      competitionOpportunity: scores.competition,
    });
    scores.clientScore = score;
    business.priority = priority;
    business.recommendedServices = recommendServices(scores);
    business.mainOpportunity = mainOpportunity(scores);
    await business.save();
  }
  void logActivity(req, 'scores.recalculated', 'Business');
  res.json({ updated: businesses.length });
}

export async function topProspects(req: Request, res: Response) {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  res.json({
    data: await Business.find()
      .populate('industry niche', 'name')
      .sort({ 'scores.clientScore': -1 })
      .limit(limit)
      .lean(),
  });
}

export async function dashboard(_req: Request, res: Response) {
  const [totals, topProspects, leadsByNiche, pipeline, distribution, added] = await Promise.all([
    Business.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          average: { $avg: '$scores.clientScore' },
          excellent: { $sum: { $cond: [{ $gte: ['$scores.clientScore', 85] }, 1, 0] } },
          high: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$scores.clientScore', 70] },
                    { $lt: ['$scores.clientScore', 85] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
    Business.find()
      .populate('industry niche', 'name')
      .sort({ 'scores.clientScore': -1 })
      .limit(10)
      .lean(),
    Business.aggregate([
      { $group: { _id: '$niche', leads: { $sum: 1 }, score: { $avg: '$scores.clientScore' } } },
      { $sort: { leads: -1 } },
      { $limit: 8 },
      { $lookup: { from: 'niches', localField: '_id', foreignField: '_id', as: 'niche' } },
      { $project: { name: { $first: '$niche.name' }, leads: 1, score: { $round: ['$score', 0] } } },
    ]),
    Business.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { stage: '$_id', count: 1, _id: 0 } },
    ]),
    Business.aggregate([
      {
        $bucket: {
          groupBy: '$scores.clientScore',
          boundaries: [0, 55, 70, 85, 101],
          default: 'Unknown',
          output: { count: { $sum: 1 } },
        },
      },
    ]),
    Business.aggregate([
      {
        $group: {
          _id: { $dateToString: { date: '$createdAt', format: '%Y-%m' } },
          leads: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]),
  ]);
  const t = totals[0] ?? { total: 0, average: 0, excellent: 0, high: 0 };
  res.json({
    metrics: {
      totalBusinesses: t.total,
      excellentProspects: t.excellent,
      highPriority: t.high,
      averageClientScore: Math.round(t.average || 0),
    },
    topProspects,
    leadsByNiche,
    pipeline,
    scoreDistribution: distribution,
    addedOverTime: added,
  });
}

export async function createResearch(req: AuthRequest, res: Response) {
  const run = await ResearchRun.create({ ...req.body, status: 'Pending', createdBy: req.user?.id });
  void logActivity(req, 'research.created', 'ResearchRun', run._id);
  res.status(201).json(run);
}

export async function getResearch(req: Request, res: Response) {
  const run = await ResearchRun.findById(id(req)).populate('industry niche', 'name').lean();
  if (!run) throw new AppError(404, 'Research run not found');
  res.json(run);
}

export async function generateOutreach(req: AuthRequest, res: Response) {
  const business = await Business.findById(req.body.businessId).populate('niche', 'name').lean();
  if (!business) throw new AppError(404, 'Business not found');
  const scores = business.scores as unknown as {
    website: number;
    seo: number;
    googleBusiness: number;
  };
  const observations: string[] = [];
  if (scores.seo >= 8)
    observations.push('an opportunity to improve your visibility for local searches');
  if (scores.googleBusiness >= 8) observations.push('room to strengthen your Google Maps presence');
  if (scores.website <= 5)
    observations.push(
      'a few website conversion improvements that could turn more visits into enquiries',
    );
  if (!observations.length)
    throw new AppError(422, 'The stored audit does not support a specific outreach claim yet');
  const body = `Hi ${business.name} team — while reviewing businesses in San Jose, I noticed ${observations.join(' and ')}. I put together a short, no-obligation audit with three practical fixes. Would it be useful if I sent it over?`;
  const outreach = await Outreach.create({
    business: business._id,
    user: req.user?.id,
    type: req.body.type ?? 'email',
    subject: `A quick idea for ${business.name}`,
    body,
    status: 'Draft',
  });
  res.status(201).json(outreach);
}

export async function updateLead(req: AuthRequest, res: Response) {
  const lead = await Lead.findOneAndUpdate({ business: id(req) }, req.body, {
    new: true,
    upsert: true,
    runValidators: true,
  });
  await Business.findByIdAndUpdate(id(req), { status: req.body.status });
  void logActivity(req, 'lead.updated', 'Lead', lead._id);
  res.json(lead);
}

export async function marketReport(_req: Request, res: Response) {
  const [niches, top] = await Promise.all([
    Business.aggregate([
      {
        $group: {
          _id: '$niche',
          businesses: { $sum: 1 },
          averageClientScore: { $avg: '$scores.clientScore' },
          seoOpportunity: { $avg: '$scores.seo' },
          gbpOpportunity: { $avg: '$scores.googleBusiness' },
        },
      },
      { $match: { businesses: { $gte: 3 } } },
      { $sort: { averageClientScore: -1 } },
      { $lookup: { from: 'niches', localField: '_id', foreignField: '_id', as: 'niche' } },
      {
        $project: {
          name: { $first: '$niche.name' },
          businesses: 1,
          averageClientScore: { $round: ['$averageClientScore', 0] },
          seoOpportunity: { $round: ['$seoOpportunity', 1] },
          gbpOpportunity: { $round: ['$gbpOpportunity', 1] },
        },
      },
    ]),
    Business.find().populate('niche', 'name').sort({ 'scores.clientScore': -1 }).limit(20).lean(),
  ]);
  res.json({
    generatedAt: new Date(),
    methodology: 'Only niches with at least three researched businesses are ranked.',
    niches,
    topProspects: top,
  });
}
