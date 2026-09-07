export type Stage =
  | 'New Lead'
  | 'Researching'
  | 'High Priority'
  | 'Ready to Contact'
  | 'Contacted'
  | 'Follow Up'
  | 'Replied'
  | 'Meeting Booked'
  | 'Qualified'
  | 'Proposal Sent'
  | 'Won'
  | 'Lost';
export interface DemoBusiness {
  id: string;
  name: string;
  initials: string;
  industry: string;
  niche: string;
  area: string;
  city: string;
  address: string;
  website: string;
  phone: string;
  email: string | undefined;
  googleRating: number;
  googleReviews: number;
  yelpReviews: number;
  websiteScore: number;
  seoOpportunity: number;
  gbpOpportunity: number;
  socialOpportunity: number;
  marketingNeed: number;
  clientScore: number;
  priority: 'Excellent' | 'High' | 'Medium' | 'Low';
  status: Stage;
  businessSize: string;
  employees: string;
  years: number;
  services: string[];
  recommendedService: string;
  secondaryService: string;
  mainOpportunity: string;
  nextAction: string;
  tags: string[];
  observed: string[];
  sourceCount: number;
  updatedAt: string;
  color: string;
}

const raw = [
  [
    'Northstar Heating & Air',
    'Home Services',
    'HVAC',
    'North San Jose',
    4.6,
    87,
    4,
    9,
    8,
    6,
    91,
    'Excellent',
    'High Priority',
    'Local SEO',
    'GBP Optimization',
    'Weak local keyword visibility',
  ],
  [
    'Cedar & Stone Remodels',
    'Home Services',
    'Remodeling',
    'West San Jose',
    4.8,
    34,
    5,
    9,
    7,
    8,
    89,
    'Excellent',
    'Ready to Contact',
    'Website Design',
    'Local SEO',
    'Thin service and project pages',
  ],
  [
    'Valley Smile Studio',
    'Healthcare',
    'Cosmetic Dentists',
    'Downtown San Jose',
    4.7,
    126,
    6,
    8,
    7,
    5,
    86,
    'Excellent',
    'Contacted',
    'Local SEO',
    'Content Marketing',
    'Competitors outrank key services',
  ],
  [
    'Brightline Injury Law',
    'Legal & Professional',
    'Personal Injury Lawyers',
    'Downtown San Jose',
    4.5,
    63,
    5,
    9,
    6,
    7,
    84,
    'High',
    'Researching',
    'Technical SEO',
    'Google Ads',
    'Technical and content gaps',
  ],
  [
    'Evergreen Family Dental',
    'Healthcare',
    'Dentists',
    'East San Jose',
    4.4,
    49,
    7,
    8,
    8,
    6,
    82,
    'High',
    'New Lead',
    'GBP Optimization',
    'Reputation Management',
    'Low review velocity',
  ],
  [
    'Summit Flow Plumbing',
    'Home Services',
    'Plumbing',
    'South San Jose',
    4.8,
    212,
    6,
    8,
    5,
    8,
    81,
    'High',
    'Follow Up',
    'Local SEO',
    'Website Optimization',
    'Missing neighborhood landing pages',
  ],
  [
    'Westgate Skin & Wellness',
    'Beauty',
    'Med Spas',
    'West San Jose',
    4.6,
    73,
    5,
    7,
    7,
    9,
    79,
    'High',
    'Replied',
    'Social Media Marketing',
    'Website Design',
    'Inconsistent social content',
  ],
  [
    'Orchard Auto Care',
    'Automotive',
    'Auto Repair',
    'North San Jose',
    4.7,
    158,
    7,
    7,
    6,
    5,
    77,
    'High',
    'Meeting Booked',
    'Local SEO',
    'GBP Optimization',
    'Weak non-branded search reach',
  ],
  [
    'Alta Vista Property Group',
    'Real Estate',
    'Property Management',
    'Downtown San Jose',
    4.2,
    28,
    6,
    8,
    8,
    7,
    76,
    'High',
    'Qualified',
    'Reputation Management',
    'Local SEO',
    'Low review count for category',
  ],
  [
    'Silver Oak Electric',
    'Home Services',
    'Electricians',
    'East San Jose',
    4.9,
    41,
    8,
    7,
    8,
    6,
    74,
    'High',
    'New Lead',
    'GBP Optimization',
    'Content Marketing',
    'Incomplete service coverage',
  ],
  [
    'Juniper Immigration',
    'Legal & Professional',
    'Immigration Lawyers',
    'Downtown San Jose',
    4.6,
    96,
    7,
    7,
    5,
    7,
    72,
    'High',
    'Proposal Sent',
    'Content Marketing',
    'Technical SEO',
    'Limited multilingual content',
  ],
  [
    'Parkside Physical Therapy',
    'Healthcare',
    'Physical Therapists',
    'South San Jose',
    4.8,
    64,
    8,
    6,
    7,
    6,
    69,
    'Medium',
    'Researching',
    'Local SEO',
    'GBP Optimization',
    'Local discovery opportunity',
  ],
  [
    'Willow & Pine Landscaping',
    'Home Services',
    'Landscaping',
    'West San Jose',
    4.5,
    52,
    6,
    7,
    6,
    8,
    67,
    'Medium',
    'New Lead',
    'Website Optimization',
    'Social Media Marketing',
    'Portfolio lacks conversion paths',
  ],
  [
    'Axis Tax Partners',
    'Legal & Professional',
    'Tax Consultants',
    'North San Jose',
    4.7,
    31,
    8,
    6,
    8,
    5,
    64,
    'Medium',
    'Contacted',
    'GBP Optimization',
    'Local SEO',
    'Low Maps prominence',
  ],
  [
    'Fur & Field Pet Care',
    'Other',
    'Pet Grooming',
    'South San Jose',
    4.9,
    184,
    8,
    5,
    4,
    4,
    57,
    'Medium',
    'Won',
    'Social Media Marketing',
    'Content Marketing',
    'Content consistency opportunity',
  ],
  [
    'Market Street Coffee',
    'Other',
    'Cafes',
    'Downtown San Jose',
    4.3,
    302,
    9,
    4,
    3,
    5,
    48,
    'Low',
    'Lost',
    'Social Media Marketing',
    'Reputation Management',
    'Limited social campaigns',
  ],
] as const;

const colors = ['#147D64', '#B56D31', '#426B8A', '#745EA8', '#B85D55', '#397A78'];
export const businesses: DemoBusiness[] = raw.map((b, index) => ({
  id: `prospect-${index + 1}`,
  name: b[0],
  initials: b[0]
    .split(' ')
    .map((v) => v[0])
    .join('')
    .slice(0, 2),
  industry: b[1],
  niche: b[2],
  area: b[3],
  city: 'San Jose',
  address: `${140 + index * 37} ${['N 1st St', 'Santa Clara St', 'Almaden Expy', 'Story Rd'][index % 4]}, San Jose, CA`,
  website: `https://example.com/demo/${index + 1}`,
  phone: `(408) 555-${String(1400 + index).slice(-4)}`,
  email: index % 3 === 0 ? undefined : `hello@demo-${index + 1}.example`,
  googleRating: b[4],
  googleReviews: b[5],
  yelpReviews: Math.round(b[5] * 0.55),
  websiteScore: b[6],
  seoOpportunity: b[7],
  gbpOpportunity: b[8],
  socialOpportunity: b[9],
  marketingNeed: Math.round((b[7] + b[8] + b[9]) / 2),
  clientScore: b[10],
  priority: b[11],
  status: b[12],
  businessSize: index % 4 === 0 ? 'Medium' : 'Small',
  employees: index % 4 === 0 ? '25–50' : '5–20',
  years: 4 + (index % 18),
  services: [b[2], 'Consultations', 'San Jose service area'],
  recommendedService: b[13],
  secondaryService: b[14],
  mainOpportunity: b[15],
  nextAction:
    b[12] === 'Contacted'
      ? 'Send follow-up'
      : b[12] === 'Meeting Booked'
        ? 'Prepare discovery notes'
        : 'Review audit and personalize outreach',
  tags: index < 3 ? ['Top 20', 'San Jose'] : ['San Jose'],
  observed: [
    b[15],
    `Google profile has ${b[5]} public reviews`,
    `Website quality audited at ${b[6]}/10`,
  ],
  sourceCount: 2 + (index % 3),
  updatedAt: `${index + 1}d ago`,
  color: colors[index % colors.length]!,
}));

const byNiche = new Map<string, DemoBusiness[]>();
businesses.forEach((business) =>
  byNiche.set(business.niche, [...(byNiche.get(business.niche) ?? []), business]),
);
export const nicheRows = Array.from(byNiche, ([name, rows]) => ({
  name,
  industry: rows[0]!.industry,
  businesses: rows.length,
  averageScore: Math.round(rows.reduce((sum, row) => sum + row.clientScore, 0) / rows.length),
  digitalScore: +(rows.reduce((sum, row) => sum + row.websiteScore, 0) / rows.length).toFixed(1),
  seo: +(rows.reduce((sum, row) => sum + row.seoOpportunity, 0) / rows.length).toFixed(1),
  budget:
    rows[0]!.industry === 'Home Services' || rows[0]!.industry === 'Legal & Professional' ? 9 : 7,
  competition: 5 + (rows.length % 4),
  score: Math.min(
    94,
    Math.round(rows.reduce((sum, row) => sum + row.clientScore, 0) / rows.length) + 5,
  ),
})).sort((a, b) => b.score - a.score);

export function nicheSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const dashboardData = {
  metrics: {
    total: businesses.length,
    excellent: businesses.filter((b) => b.priority === 'Excellent').length,
    high: businesses.filter((b) => b.priority === 'High').length,
    average: Math.round(businesses.reduce((s, b) => s + b.clientScore, 0) / businesses.length),
    contacted: businesses.filter(
      (b) => !['New Lead', 'Researching', 'High Priority', 'Ready to Contact'].includes(b.status),
    ).length,
    replies: businesses.filter((b) =>
      ['Replied', 'Meeting Booked', 'Qualified', 'Proposal Sent', 'Won'].includes(b.status),
    ).length,
    qualified: businesses.filter((b) => ['Qualified', 'Proposal Sent', 'Won'].includes(b.status))
      .length,
    won: businesses.filter((b) => b.status === 'Won').length,
  },
  byNiche: nicheRows
    .slice(0, 7)
    .map((n) => ({
      name: n.name.replace('Personal Injury Lawyers', 'Injury Law'),
      leads: n.businesses,
      score: n.averageScore,
    })),
  distribution: [
    { range: 'Low', count: businesses.filter((b) => b.clientScore < 55).length },
    {
      range: 'Medium',
      count: businesses.filter((b) => b.clientScore >= 55 && b.clientScore < 70).length,
    },
    {
      range: 'High',
      count: businesses.filter((b) => b.clientScore >= 70 && b.clientScore < 85).length,
    },
    { range: 'Excellent', count: businesses.filter((b) => b.clientScore >= 85).length },
  ],
  overTime: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((month, i) => ({
    month,
    leads: [1, 3, 5, 8, 11, 16][i],
  })),
};

export const activities = [
  { title: 'Valley Smile Studio replied', detail: 'Email outreach · 24 min ago', tone: 'emerald' },
  {
    title: 'Orchard Auto Care moved to Meeting Booked',
    detail: 'Pipeline update · 1h ago',
    tone: 'blue',
  },
  { title: 'HVAC research completed', detail: '4 businesses analyzed · 3h ago', tone: 'amber' },
  {
    title: 'Cedar & Stone audit updated',
    detail: 'Website evidence added · Yesterday',
    tone: 'slate',
  },
];
