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
type Pack = "es" | "th";

export default function Recall() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [pack, setPack] = useState<Pack>("th");
  const [stats, setStats] = useState<Stats>({ total: 0, due: 0, learned: 0, reviewedToday: 0, streak: 0 });
  const [dueWords, setDueWords] = useState<Word[]>([]);
  const [sessionResults, setSessionResults] = useState<ReviewResult[]>([]);

  // Read saved pack preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("recall-pack") as Pack | null;
    if (saved === "es" || saved === "th") setPack(saved);
  }, []);

  const refreshStats = useCallback(async (p: Pack) => { setStats(await getStats(p)); }, []);
  const refreshDue = useCallback(async (p: Pack) => { setDueWords(await getDueWords(p, 20)); }, []);

  // Load data when pack changes
  useEffect(() => {
    (async () => {
      setScreen("loading");
      const s = await getStats(pack);
      if (s.total === 0) await seedWords(pack);
      await refreshStats(pack);
      await refreshDue(pack);
      setScreen("home");
    })();
  }, [pack, refreshStats, refreshDue]);

  const handleSwitchPack = (p: Pack) => {
    localStorage.setItem("recall-pack", p);
    setPack(p);
  };

  const handleStartReview = async () => { const due = await getDueWords(pack, 20); if (due.length === 0) return; setDueWords(due); setScreen("review"); };
  const handleComplete = async (results: ReviewResult[]) => { setSessionResults(results); await refreshStats(pack); setScreen("complete"); };
  const handlePostScore = (name: string, accuracy: number, wordsReviewed: number, correct: number, feeling: string) => { postScore(name, accuracy, wordsReviewed, correct, feeling, pack); };
  const handleHome = async () => { await refreshStats(pack); await refreshDue(pack); setScreen("home"); };

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
      {screen === "home" && <HomeScreen stats={stats} pack={pack} onSwitchPack={handleSwitchPack} onStartReview={handleStartReview} onLeaderboard={() => setScreen("leaderboard")} />}
      {screen === "review" && <ReviewScreen words={dueWords} pack={pack} onComplete={handleComplete} />}
      {screen === "complete" && <CompleteScreen results={sessionResults} stats={stats} onHome={handleHome} onPostScore={handlePostScore} onLeaderboard={() => setScreen("leaderboard")} />}
      {screen === "leaderboard" && <LeaderboardScreen onBack={handleHome} />}
    </div>
  );
}
