export interface LeaderboardEntry {
  name: string;
  accuracy: number;
  wordsReviewed: number;
  correct: number;
  feeling?: string;
  pack?: string;
  timestamp: number;
  week: string;
}

export function getWeekKey(): string {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((now.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem("leaderboard-scores");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLeaderboard(entries: LeaderboardEntry[]): void {
  try {
    localStorage.setItem("leaderboard-scores", JSON.stringify(entries));
  } catch (err) {
    console.error(err);
  }
}

export function postScore(name: string, accuracy: number, wordsReviewed: number, correct: number, feeling?: string, pack?: string): LeaderboardEntry[] {
  const entries = loadLeaderboard();
  entries.push({ name: name.trim(), accuracy, wordsReviewed, correct, feeling, pack, timestamp: Date.now(), week: getWeekKey() });
  const trimmed = entries.slice(-500);
  saveLeaderboard(trimmed);
  return trimmed;
}
