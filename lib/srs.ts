export interface Word {
  id: string;
  prompt: string;
  answer: string;
  romanized?: string;
  pack: string;
  reps: number;
  lapses: number;
  ease: number;
  interval: number;
  due: number;
  lastReviewed: number | null;
  reviewCount: number;
  createdAt: number;
  // Legacy compat
  spanish?: string;
  english?: string;
}

export type Grade = "again" | "hard" | "good" | "easy";

export function scheduleReview(word: Word, grade: Grade): Word {
  const now = Date.now();
  let { reps, lapses, ease, interval } = word;
  const g = { again: 0, hard: 1, good: 2, easy: 3 }[grade];

  if (g === 0) { reps = 0; lapses += 1; interval = 60000; ease = Math.max(1.3, ease - 0.2); }
  else if (g === 1) { reps += 1; interval = reps === 1 ? 360000 : interval * 1.2; ease = Math.max(1.3, ease - 0.15); }
  else if (g === 2) { reps += 1; if (reps === 1) interval = 600000; else if (reps === 2) interval = 86400000; else interval = interval * ease; }
  else { reps += 1; if (reps === 1) interval = 86400000; else interval = interval * ease * 1.3; ease += 0.15; }

  return { ...word, reps, lapses, ease: Math.round(ease * 100) / 100, interval: Math.round(interval), due: now + Math.round(interval), lastReviewed: now, reviewCount: (word.reviewCount || 0) + 1 };
}

export function createWord(prompt: string, answer: string, pack: string, romanized?: string): Word {
  return {
    id: `${pack}_${prompt.toLowerCase().trim()}_${answer.toLowerCase().trim()}_${Date.now()}`,
    prompt: prompt.trim(),
    answer: answer.trim(),
    romanized: romanized?.trim(),
    pack,
    reps: 0,
    lapses: 0,
    ease: 2.5,
    interval: 0,
    due: Date.now(),
    lastReviewed: null,
    reviewCount: 0,
    createdAt: Date.now(),
  };
}
