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

export async function loadLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const res = await fetch("/api/leaderboard");
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function postScore(name: string, accuracy: number, wordsReviewed: number, correct: number, feeling?: string, pack?: string): Promise<void> {
  try {
    await fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        accuracy,
        wordsReviewed,
        correct,
        feeling,
        pack,
        timestamp: Date.now(),
        week: getWeekKey(),
      }),
    });
  } catch (err) {
    console.error("Failed to post score:", err);
  }
}
