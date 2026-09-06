import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { Business, Industry, Lead, Location, Niche, Service, Tag, User } from '../models/index.js';
import {
  calculateClientScore,
  mainOpportunity,
  recommendServices,
} from '../services/scoring.service.js';

const catalog: Record<string, string[]> = {
  'Home Services': [
    'HVAC',
    'Air Conditioning',
    'Heating',
    'Plumbing',
    'Electricians',
    'Roofing',
    'Landscaping',
    'Pest Control',
    'Garage Door Repair',
    'Remodeling',
    'Painting',
    'Flooring',
    'Solar',
    'Cleaning',
    'Locksmith',
    'Water Damage Restoration',
  ],
  Healthcare: [
    'Dentists',
    'Orthodontists',
    'Cosmetic Dentists',
    'Chiropractors',
    'Physical Therapists',
    'Dermatologists',
    'Med Spas',
    'Medical Clinics',
    'Urgent Care',
    'Optometrists',
    'Wellness Clinics',
  ],
  'Legal & Professional': [
    'Personal Injury Lawyers',
    'Immigration Lawyers',
    'Family Lawyers',
    'Criminal Defense',
    'Business Lawyers',
    'Accountants',
    'Tax Consultants',
    'Financial Advisors',
    'Insurance',
    'Mortgage Brokers',
    'Business Consultants',
  ],
  'Real Estate': [
    'Real Estate Agents',
    'Real Estate Agencies',
    'Property Management',
    'Mortgage Brokers',
    'Home Inspection',
    'Commercial Real Estate',
  ],
  Automotive: [
    'Auto Repair',
    'Car Detailing',
    'Auto Body',
    'Tire Shops',
    'Car Dealerships',
    'Mobile Mechanics',
  ],
  Beauty: [
    'Hair Salons',
    'Barbers',
    'Beauty Salons',
    'Med Spas',
    'Cosmetic Clinics',
    'Skin Clinics',
    'Laser Clinics',
    'Gyms',
    'Fitness Studios',
  ],
  Other: [
    'Moving Companies',
    'Childcare',
    'Tutoring',
    'Pet Grooming',
    'Pet Boarding',
    'Restaurants',
    'Cafes',
    'Catering',
    'Events',
    'Photography',
  ],
};

const demoRows = [
  [
    'Demo — Northstar Heating & Air',
    'Home Services',
    'HVAC',
    'North San Jose',
    4.6,
    87,
    4,
    9,
    8,
    6,
    18,
    14,
    5,
    8,
  ],
  [
    'Demo — Cedar & Stone Remodels',
    'Home Services',
    'Remodeling',
    'West San Jose',
    4.8,
    34,
    5,
    9,
    7,
    8,
    19,
    14,
    4,
    8,
  ],
  [
    'Demo — Valley Smile Studio',
    'Healthcare',
    'Cosmetic Dentists',
    'Downtown San Jose',
    4.7,
    126,
    6,
    8,
    7,
    5,
    18,
    13,
    5,
    7,
  ],
  [
    'Demo — Brightline Injury Law',
    'Legal & Professional',
    'Personal Injury Lawyers',
    'Downtown San Jose',
    4.5,
    63,
    5,
    9,
    6,
    7,
    20,
    14,
    5,
    9,
  ],
  [
    'Demo — Summit Flow Plumbing',
    'Home Services',
    'Plumbing',
    'South San Jose',
    4.8,
    212,
    6,
    8,
    5,
    8,
    18,
    12,
    5,
    8,
  ],
] as const;

async function seed() {
  await connectDatabase();
  const passwordHash = await bcrypt.hash('Northstar123!', 12);
  await User.findOneAndUpdate(
    { email: 'admin@northstar.local' },
    {
      name: 'Northstar Admin',
      email: 'admin@northstar.local',
      passwordHash,
      role: 'admin',
      active: true,
    },
    { upsert: true },
  );
  const industries = new Map<string, string>();
  for (const [name, niches] of Object.entries(catalog)) {
    const industry = await Industry.findOneAndUpdate(
      { name },
      { name, active: true },
      { upsert: true, new: true },
    );
    industries.set(name, industry.id);
    for (const nicheName of niches)
      await Niche.findOneAndUpdate(
        { name: nicheName, industry: industry._id },
        { name: nicheName, industry: industry._id, active: true },
        { upsert: true },
      );
  }
  await Location.findOneAndUpdate(
    { city: 'San Jose', state: 'California' },
    {
      country: 'United States',
      state: 'California',
      city: 'San Jose',
      areas: [
        'Downtown San Jose',
        'North San Jose',
        'South San Jose',
        'East San Jose',
        'West San Jose',
      ],
      active: true,
    },
    { upsert: true },
  );
  const tag = await Tag.findOneAndUpdate(
    { name: 'Demo data' },
    { name: 'Demo data', color: '#64748b' },
    { upsert: true, new: true },
  );
  for (const name of [
    'Local SEO',
    'SEO',
    'Google Business Profile Optimization',
    'Website Design',
    'Website Optimization',
    'Technical SEO',
    'Content Marketing',
    'Google Ads',
    'Reputation Management',
    'Social Media Marketing',
  ]) {
    await Service.findOneAndUpdate(
      { name },
      {
        name,
        demand: 7,
        competition: 6,
        deliveryDifficulty: 6,
        clientValue: 8,
        profitability: 8,
        active: true,
      },
      { upsert: true },
    );
  }
  for (const [index, row] of demoRows.entries()) {
    const niche = await Niche.findOne({ name: row[2], industry: industries.get(row[1]) });
    if (!niche) continue;
    const scores = {
      website: row[6],
      seo: row[7],
      googleBusiness: row[8],
      social: row[9],
      revenuePotential: row[10],
      marketingNeed: row[11],
      contactability: row[12],
      competition: row[13],
    };
    const calculated = calculateClientScore({
      revenuePotential: scores.revenuePotential,
      seoOpportunity: scores.seo * 2,
      websiteOpportunity: (10 - scores.website) * 1.5,
      gbpOpportunity: scores.googleBusiness * 1.5,
      marketingNeed: scores.marketingNeed,
      contactability: scores.contactability,
      competitionOpportunity: scores.competition,
    });
    const business = await Business.findOneAndUpdate(
      { name: row[0] },
      {
        name: row[0],
        industry: industries.get(row[1]),
        niche: niche._id,
        country: 'United States',
        state: 'California',
        city: 'San Jose',
        area: row[3],
        website: `https://example.com/demo/${index + 1}`,
        phone: `(408) 555-${1400 + index}`,
        googleRating: row[4],
        googleReviews: row[5],
        socialLinks: {},
        estimatedBusinessSize: 'Small',
        estimatedEmployees: 12,
        yearsInBusiness: 8,
        services: [row[2]],
        tags: [tag._id],
        sources: [
          { url: 'https://example.com', label: 'Illustrative seed source', observedAt: new Date() },
        ],
        scores: { ...scores, clientScore: calculated.score },
        priority: calculated.priority,
        status: 'New Lead',
        recommendedServices: recommendServices(scores),
        mainOpportunity: mainOpportunity(scores),
        researchedAt: new Date(),
      },
      { upsert: true, new: true, runValidators: true },
    );
    await Lead.findOneAndUpdate(
      { business: business._id },
      { business: business._id, status: 'New Lead' },
      { upsert: true },
    );
  }
  console.log(
    'Seed complete. Demo records are clearly prefixed and must not be treated as real businesses.',
  );
}

seed()
  .then(disconnectDatabase)
  .catch(async (error) => {
    console.error(error);
    await disconnectDatabase();
    process.exit(1);
  });
