import redis from '../lib/redis';
import prisma from '../prisma/client'; 
import Redlock from 'redlock';

const DASHBOARD_CACHE_KEY = 'dashboard:summary:v1';
const CACHE_TTL_SECONDS = 60 * 5; 
const LOCK_RESOURCE = 'locks:dashboard:summary';
const LOCK_TTL_MS = 10 * 1000; 

type DashboardPayload = {
  stats: {
    totalProducts: number;
    totalStock: number;
    avgPrice: number;
    avgRating: number;
  };
  topRated: any[];    
  recentReviews: any[]; 
};

const redlock = new Redlock([redis], {
  retryCount: 0,    
  retryDelay: 200,  
});

async function computeDashboardFromDB(): Promise<DashboardPayload> {
  const [
    totalProducts,
    stockAgg,
    priceAgg,
    ratingAgg,
  ] = await prisma.$transaction([
    prisma.product.count(),
    prisma.product.aggregate({ _sum: { stock: true } }),
    prisma.product.aggregate({ _avg: { price: true } }),
    prisma.product.aggregate({ _avg: { rating: true } }),
  ]);

  const topRated = await prisma.product.findMany({
    orderBy: { rating: 'desc' },
    take: 3,
    include: { reviews: true },
  });

  const recentReviews = await prisma.review.findMany({
    orderBy: { date: 'desc' },
    take: 6,
    include: { product: { select: { id: true, title: true, thumbnail: true } } },
  });

  return {
    stats: {
      totalProducts,
      totalStock: stockAgg._sum.stock ?? 0,
      avgPrice: Number(priceAgg._avg.price ?? 0),
      avgRating: Number(ratingAgg._avg.rating ?? 0),
    },
    topRated,
    recentReviews,
  };
}

async function writeCache(payload: DashboardPayload) {
  try {
    await redis.setex(DASHBOARD_CACHE_KEY, CACHE_TTL_SECONDS, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to write dashboard cache:', err);
  }
}

async function readCache(): Promise<DashboardPayload | null> {
  try {
    const raw = await redis.get(DASHBOARD_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DashboardPayload;
  } catch (err) {
    console.warn('Failed to read dashboard cache:', err);
    return null;
  }
}

export async function getDashboardDataCached(): Promise<DashboardPayload> {
  const cached = await readCache();
  if (cached) return cached;
  try {
    const lock = await redlock.acquire([LOCK_RESOURCE], LOCK_TTL_MS);
    try {
      const cachedAfterLock = await readCache();
      if (cachedAfterLock) return cachedAfterLock;
      const payload = await computeDashboardFromDB();
      await writeCache(payload);
      return payload;
    } finally {
      await lock.release().catch((e) => console.warn('Failed to release redlock', e));
    }
  } catch (err) {
    const MAX_RETRIES = 8;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const delay = 200 * (attempt + 1);
      await new Promise((r) => setTimeout(r, delay));
      const cachedRetry = await readCache();
      if (cachedRetry) return cachedRetry;
    }
    const payload = await computeDashboardFromDB();
    await writeCache(payload);
    return payload;
  }
}

export async function invalidateDashboardCache(): Promise<void> {
  try {
    await redis.del(DASHBOARD_CACHE_KEY);
    await redis.publish('cache:invalidate', DASHBOARD_CACHE_KEY);
  } catch (err) {
    console.warn('Failed to invalidate dashboard cache:', err);
  }
}

export default {
  getDashboardDataCached,
  invalidateDashboardCache,
};
