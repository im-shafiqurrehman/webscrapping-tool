import { Schema, model } from 'mongoose';

const options = { timestamps: true, strict: true } as const;
const urlField = { type: String, trim: true, maxlength: 2048 };

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'researcher', 'sales'], default: 'researcher' },
    active: { type: Boolean, default: true },
  },
  options,
);

const industrySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    active: { type: Boolean, default: true },
  },
  options,
);

const nicheSchema = new Schema(
  {
    name: { type: String, required: true },
    industry: { type: Schema.Types.ObjectId, ref: 'Industry', required: true, index: true },
    description: String,
    active: { type: Boolean, default: true },
    scoring: {
      averageCustomerValue: { type: Number, min: 0, max: 15, default: 8 },
      customerLifetimeValue: { type: Number, min: 0, max: 10, default: 5 },
      retainerAbility: { type: Number, min: 0, max: 15, default: 8 },
      localSearchDemand: { type: Number, min: 0, max: 15, default: 8 },
      competition: { type: Number, min: 0, max: 5, default: 3 },
      leadAvailability: { type: Number, min: 0, max: 5, default: 3 },
    },
  },
  options,
);
nicheSchema.index({ name: 1, industry: 1 }, { unique: true });

const scoreSchema = new Schema(
  {
    website: { type: Number, min: 0, max: 10, default: 0 },
    seo: { type: Number, min: 0, max: 10, default: 0 },
    googleBusiness: { type: Number, min: 0, max: 10, default: 0 },
    social: { type: Number, min: 0, max: 10, default: 0 },
    marketingNeed: { type: Number, min: 0, max: 15, default: 0 },
    revenuePotential: { type: Number, min: 0, max: 20, default: 0 },
    contactability: { type: Number, min: 0, max: 5, default: 0 },
    competition: { type: Number, min: 0, max: 10, default: 0 },
    clientScore: { type: Number, min: 0, max: 100, default: 0, index: true },
  },
  { _id: false },
);

const businessSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    industry: { type: Schema.Types.ObjectId, ref: 'Industry', required: true, index: true },
    niche: { type: Schema.Types.ObjectId, ref: 'Niche', required: true, index: true },
    country: { type: String, default: 'United States' },
    state: { type: String, default: 'California', index: true },
    city: { type: String, default: 'San Jose', index: true },
    area: { type: String, index: true },
    address: String,
    website: urlField,
    googleBusinessUrl: urlField,
    phone: String,
    publicEmail: { type: String, lowercase: true },
    googleRating: { type: Number, min: 0, max: 5 },
    googleReviews: { type: Number, min: 0 },
    yelpUrl: urlField,
    yelpReviews: { type: Number, min: 0 },
    socialLinks: { facebook: urlField, instagram: urlField, linkedin: urlField, youtube: urlField },
    estimatedBusinessSize: { type: String, enum: ['Solo', 'Small', 'Medium', 'Large'] },
    estimatedEmployees: { type: Number, min: 1 },
    yearsInBusiness: { type: Number, min: 0 },
    services: [{ type: String }],
    notes: String,
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    sources: [{ url: urlField, label: String, observedAt: Date }],
    scores: { type: scoreSchema, default: () => ({}) },
    priority: { type: String, enum: ['Excellent', 'High', 'Medium', 'Low'], index: true },
    status: { type: String, default: 'New Lead', index: true },
    recommendedServices: [{ type: String }],
    mainOpportunity: String,
    researchedAt: Date,
    lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  options,
);
businessSchema.index({ name: 'text', city: 'text', area: 'text', notes: 'text' });
businessSchema.index({ 'scores.clientScore': -1, priority: 1 });
businessSchema.index({ niche: 1, city: 1, 'scores.clientScore': -1 });

const auditSchema = new Schema(
  {
    business: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    type: { type: String, enum: ['website', 'seo', 'gbp', 'social'], required: true },
    score: { type: Number, min: 0, max: 10, required: true },
    checks: { type: Schema.Types.Mixed, default: {} },
    notes: String,
    evidenceUrls: [urlField],
    observedAt: { type: Date, default: Date.now },
    observedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  options,
);
auditSchema.index({ business: 1, type: 1 }, { unique: true });

const researchRunSchema = new Schema(
  {
    name: { type: String, required: true },
    location: { country: String, state: String, city: String, areas: [String] },
    industry: { type: Schema.Types.ObjectId, ref: 'Industry' },
    niche: { type: Schema.Types.ObjectId, ref: 'Niche' },
    status: {
      type: String,
      enum: ['Pending', 'Running', 'Completed', 'Failed'],
      default: 'Pending',
      index: true,
    },
    businessesDiscovered: { type: Number, default: 0 },
    businessesAnalyzed: { type: Number, default: 0 },
    averageClientScore: { type: Number, default: 0 },
    dataSources: [{ type: String }],
    errorMessages: [{ type: String }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  options,
);

const leadSchema = new Schema(
  {
    business: { type: Schema.Types.ObjectId, ref: 'Business', required: true, unique: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, default: 'New Lead', index: true },
    nextAction: String,
    nextFollowUpAt: Date,
    outreachMethod: String,
    notes: String,
  },
  options,
);

const outreachSchema = new Schema(
  {
    business: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['email', 'linkedin', 'dm', 'follow-up', 'call'] },
    subject: String,
    body: String,
    status: { type: String, default: 'Draft' },
    sentAt: Date,
  },
  options,
);

const activitySchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    entityType: String,
    entityId: Schema.Types.ObjectId,
    metadata: Schema.Types.Mixed,
    ip: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
activitySchema.index({ createdAt: -1 });

const reportSchema = new Schema(
  {
    type: { type: String, required: true },
    title: String,
    filters: Schema.Types.Mixed,
    snapshot: Schema.Types.Mixed,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  options,
);

const serviceSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    demand: Number,
    competition: Number,
    deliveryDifficulty: Number,
    clientValue: Number,
    profitability: Number,
    active: { type: Boolean, default: true },
  },
  options,
);

const tagSchema = new Schema(
  { name: { type: String, required: true, unique: true }, color: String },
  options,
);
const locationSchema = new Schema(
  {
    country: String,
    state: String,
    city: String,
    areas: [String],
    active: { type: Boolean, default: true },
  },
  options,
);
const nicheScoreSchema = new Schema(
  {
    niche: { type: Schema.Types.ObjectId, ref: 'Niche', unique: true },
    score: Number,
    breakdown: Schema.Types.Mixed,
    sampleSize: Number,
    calculatedAt: Date,
  },
  options,
);

export const User = model('User', userSchema);
export const Industry = model('Industry', industrySchema);
export const Niche = model('Niche', nicheSchema);
export const Business = model('Business', businessSchema);
export const Audit = model('Audit', auditSchema);
// Named exports retain the domain model vocabulary while audits share one indexed collection.
export const WebsiteAudit = Audit;
export const SEOAudit = Audit;
export const GBPAudit = Audit;
export const SocialAudit = Audit;
export const ClientScore = Business;
export const NicheScore = model('NicheScore', nicheScoreSchema);
export const ResearchRun = model('ResearchRun', researchRunSchema);
export const Lead = model('Lead', leadSchema);
export const Outreach = model('Outreach', outreachSchema);
export const Activity = model('Activity', activitySchema);
export const Report = model('Report', reportSchema);
export const Service = model('Service', serviceSchema);
export const Tag = model('Tag', tagSchema);
export const Location = model('Location', locationSchema);
