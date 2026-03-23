import { getAllWords } from "./db";

export interface Stats {
  total: number;
  due: number;
  learned: number;
  reviewedToday: number;
  streak: number;
}

export async function getStats(): Promise<Stats> {
  const all = await getAllWords();
  const now = Date.now();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  let streak = 0;
  for (let d = 0; d < 365; d++) {
    const ds = todayMs - d * 86400000;
    const de = ds + 86400000;
    if (all.some(w => w.lastReviewed && w.lastReviewed >= ds && w.lastReviewed < de)) streak++;
    else if (d === 0) continue;
    else break;
  }

  return {
    total: all.length,
    due: all.filter(w => w.due <= now).length,
    learned: all.filter(w => w.reps >= 2).length,
    reviewedToday: all.filter(w => w.lastReviewed && w.lastReviewed >= todayMs).length,
    streak,
  };
}
