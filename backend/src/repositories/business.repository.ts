import { Types } from 'mongoose';
import { Business } from '../models/index.js';

export interface BusinessQuery {
  page: number;
  limit: number;
  search?: string | undefined;
  industry?: string | undefined;
  niche?: string | undefined;
  city?: string | undefined;
  area?: string | undefined;
  priority?: string | undefined;
  status?: string | undefined;
  minScore?: number | undefined;
  maxScore?: number | undefined;
  sort?: string | undefined;
}

export async function findBusinesses(query: BusinessQuery, createdBy: string) {
  const filter: Record<string, unknown> = { createdBy };
  if (query.search) filter.$text = { $search: query.search };
  if (query.industry && Types.ObjectId.isValid(query.industry)) filter.industry = query.industry;
  if (query.niche && Types.ObjectId.isValid(query.niche)) filter.niche = query.niche;
  if (query.city) filter.city = query.city;
  if (query.area) filter.area = query.area;
  if (query.priority) filter.priority = query.priority;
  if (query.status) filter.status = query.status;
  if (query.minScore !== undefined || query.maxScore !== undefined) {
    filter['scores.clientScore'] = {
      ...(query.minScore !== undefined ? { $gte: query.minScore } : {}),
      ...(query.maxScore !== undefined ? { $lte: query.maxScore } : {}),
    };
  }
  const allowedSorts: Record<string, Record<string, 1 | -1>> = {
    score: { 'scores.clientScore': -1 },
    newest: { createdAt: -1 },
    reviews: { googleReviews: -1 },
    name: { name: 1 },
  };
  const sort = allowedSorts[query.sort ?? 'score'] ?? allowedSorts.score!;
  const [data, total] = await Promise.all([
    Business.find(filter)
      .populate('industry', 'name')
      .populate('niche', 'name')
      .sort(sort)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean(),
    Business.countDocuments(filter),
  ]);
  return {
    data,
    meta: { page: query.page, pageSize: query.limit, total, pages: Math.ceil(total / query.limit) },
  };
}
