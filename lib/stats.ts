import { getAllWords } from "./db";
import { loadLeaderboard } from "./leaderboard";
import type { LeaderboardEntry } from "./leaderboard";

export interface Stats {
  total: number;
  due: number;
  learned: number;
  reviewedToday: number;
  streak: number;
}

// Cache leaderboard data — fetch once, reuse across pack switches
let cachedEntries: LeaderboardEntry[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 60_000; // 1 minute

async function getCachedLeaderboard(): Promise<LeaderboardEntry[]> {
  if (cachedEntries && Date.now() - cacheTime < CACHE_TTL) return cachedEntries;
  cachedEntries = await loadLeaderboard();
  cacheTime = Date.now();
  return cachedEntries;
}

// Call this after posting a score to bust the cache
export function invalidateStatsCache() {
  cachedEntries = null;
  cacheTime = 0;
}

export async function getStats(pack: string): Promise<Stats> {
  const all = await getAllWords(pack);
  const now = Date.now();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  // Local streak from IndexedDB
  let streak = 0;
  for (let d = 0; d < 365; d++) {
    const ds = todayMs - d * 86400000;
    const de = ds + 86400000;
    if (all.some(w => w.lastReviewed && w.lastReviewed >= ds && w.lastReviewed < de)) streak++;
    else if (d === 0) continue;
    else break;
  }

  // TODAY + LEARNED from cached Redis leaderboard (cross-device)
  let reviewedToday = 0;
  let learned = 0;
  try {
    const entries = await getCachedLeaderboard();
    const packEntries = entries.filter(e => !e.pack || e.pack === pack);
    for (const e of packEntries) {
      if (e.timestamp >= todayMs) {
        reviewedToday += e.wordsReviewed || 0;
      }
      learned += e.correct || 0;
    }
  } catch {
    reviewedToday = all.filter(w => w.lastReviewed && w.lastReviewed >= todayMs).length;
    learned = all.filter(w => w.reps >= 2).length;
  }

  return {
    total: all.length,
    due: all.filter(w => w.due <= now).length,
    learned,
    reviewedToday,
    streak,
  };
}
