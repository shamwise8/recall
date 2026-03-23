"use client";

import { useState, useEffect, useCallback } from "react";
import { C, FONT, FONT_SERIF } from "@/styles/theme";
import { getDueWords, seedWords } from "@/lib/db";
import { getStats } from "@/lib/stats";
import { postScore } from "@/lib/leaderboard";
import type { Stats } from "@/lib/stats";
import type { Word } from "@/lib/srs";
import type { ReviewResult } from "@/screens/ReviewScreen";
import HomeScreen from "@/screens/HomeScreen";
import ReviewScreen from "@/screens/ReviewScreen";
import CompleteScreen from "@/screens/CompleteScreen";
import LeaderboardScreen from "@/screens/LeaderboardScreen";

type Screen = "loading" | "home" | "review" | "complete" | "leaderboard";

export default function Recall() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [stats, setStats] = useState<Stats>({ total: 0, due: 0, learned: 0, reviewedToday: 0, streak: 0 });
  const [dueWords, setDueWords] = useState<Word[]>([]);
  const [sessionResults, setSessionResults] = useState<ReviewResult[]>([]);
  const [seeding, setSeeding] = useState(false);

  const refreshStats = useCallback(async () => { setStats(await getStats()); }, []);
  const refreshDue = useCallback(async () => { setDueWords(await getDueWords(20)); }, []);

  useEffect(() => { (async () => { await refreshStats(); await refreshDue(); setScreen("home"); })(); }, [refreshStats, refreshDue]);

  const handleSeed = async () => { setSeeding(true); await seedWords(); await refreshStats(); await refreshDue(); setSeeding(false); };
  const handleStartReview = async () => { const due = await getDueWords(20); if (due.length === 0) return; setDueWords(due); setScreen("review"); };
  const handleComplete = async (results: ReviewResult[]) => { setSessionResults(results); await refreshStats(); setScreen("complete"); };
  const handlePostScore = (name: string, accuracy: number, wordsReviewed: number, correct: number, feeling: string) => { postScore(name, accuracy, wordsReviewed, correct, feeling); };
  const handleHome = async () => { await refreshStats(); await refreshDue(); setScreen("home"); };

  if (screen === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_SERIF }}>
        <div style={{ textAlign: "center", color: C.ink3 }}>
          <div style={{ fontSize: 20, fontStyle: "italic" }}>Recall</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT, WebkitFontSmoothing: "antialiased" }}>
      {screen === "home" && <HomeScreen stats={stats} onStartReview={handleStartReview} onSeed={handleSeed} seeding={seeding} onLeaderboard={() => setScreen("leaderboard")} />}
      {screen === "review" && <ReviewScreen words={dueWords} onComplete={handleComplete} />}
      {screen === "complete" && <CompleteScreen results={sessionResults} stats={stats} onHome={handleHome} onPostScore={handlePostScore} onLeaderboard={() => setScreen("leaderboard")} />}
      {screen === "leaderboard" && <LeaderboardScreen onBack={handleHome} />}
    </div>
  );
}
