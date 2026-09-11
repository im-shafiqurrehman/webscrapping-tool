import 'dotenv/config';
import mongoose from 'mongoose';
import { Activity, Audit, Business, Lead, Outreach, Tag, User } from '../models/index.js';
import { env } from '../config/env.js';

const apply = process.argv.includes('--apply');
const sampleBusinessFilter = {
  $or: [
    { name: /^Demo\s*[—-]/i },
    { website: /(^|\.)example\.(com|org|net)(\/|$)/i },
    { publicEmail: /@[^@]*\.example$/i },
  ],
};
const sampleUserFilter = { email: 'admin@northstar.local' };

await mongoose.connect(env.MONGODB_URI);
try {
  const businessIds = await Business.find(sampleBusinessFilter).distinct('_id');
  const userIds = await User.find(sampleUserFilter).distinct('_id');
  const counts = {
    totalBusinesses: await Business.countDocuments(),
    unownedBusinesses: await Business.countDocuments({ createdBy: { $exists: false } }),
    businesses: businessIds.length,
    audits: await Audit.countDocuments({ business: { $in: businessIds } }),
    leads: await Lead.countDocuments({ business: { $in: businessIds } }),
    outreach: await Outreach.countDocuments({ business: { $in: businessIds } }),
    users: userIds.length,
    activities: await Activity.countDocuments({ actor: { $in: userIds } }),
    sampleTags: await Tag.countDocuments({ name: 'Demo data' }),
  };

  if (!apply) {
    console.log(JSON.stringify({ mode: 'dry-run', counts }, null, 2));
  } else {
    await Promise.all([
      Audit.deleteMany({ business: { $in: businessIds } }),
      Lead.deleteMany({ business: { $in: businessIds } }),
      Outreach.deleteMany({ business: { $in: businessIds } }),
      Activity.deleteMany({ actor: { $in: userIds } }),
      Tag.deleteMany({ name: 'Demo data' }),
    ]);
    await Business.deleteMany({ _id: { $in: businessIds } });
    await User.deleteMany({ _id: { $in: userIds } });
    console.log(JSON.stringify({ mode: 'applied', deleted: counts }, null, 2));
  }
} finally {
  await mongoose.disconnect();
}
