import { getAllWords } from "./db";
import { loadLeaderboard } from "./leaderboard";

export interface Stats {
  total: number;
  due: number;
  learned: number;
  reviewedToday: number;
  streak: number;
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

  // TODAY + LEARNED from Redis leaderboard (cross-device)
  let reviewedToday = 0;
  let learned = 0;
  try {
    const entries = await loadLeaderboard();
    const packFlag = pack === "th" ? "🇹🇭" : "🇪🇸";
    const packEntries = entries.filter(e => !e.pack || e.pack === pack || e.pack === packFlag);
    for (const e of packEntries) {
      if (e.timestamp >= todayMs) {
        reviewedToday += e.wordsReviewed || 0;
      }
      learned += e.correct || 0;
    }
  } catch {
    // Fall back to local stats if Redis is unavailable
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
