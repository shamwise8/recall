"use client";

import { useState, useEffect } from "react";
import { C, FONT, FONT_SERIF } from "@/styles/theme";
import { loadLeaderboard, getWeekKey } from "@/lib/leaderboard";
import LeaderboardRow, { MEDAL } from "@/components/LeaderboardRow";
import type { LeaderboardEntry } from "@/lib/leaderboard";

interface LeaderboardScreenProps {
  onBack: () => void;
}

export default function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const [tab, setTab] = useState("alltime");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setEntries(loadLeaderboard());
    setLoading(false);
  }, []);

  const weekKey = getWeekKey();
  const display = tab === "week" ? entries.filter(e => e.week === weekKey) : entries;
  const sorted = [...display].sort((a, b) => b.accuracy - a.accuracy || b.wordsReviewed - a.wordsReviewed);
  const showPodium = sorted.length >= 3;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, padding: "32px 20px", maxWidth: 420, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.muted, padding: 4, fontFamily: FONT_SERIF }}>←</button>
        <h2 style={{ fontSize: 22, fontWeight: 400, color: C.ink, fontFamily: FONT_SERIF, margin: 0, flex: 1 }}>Leaderboard</h2>
      </div>

      <div style={{ display: "flex", width: "100%", background: C.bgDeep, borderRadius: 10, padding: 3 }}>
        {[{ key: "week", label: "This Week" }, { key: "alltime", label: "All Time" }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: "9px", borderRadius: 8, border: "none",
            background: tab === t.key ? C.card : "transparent",
            color: tab === t.key ? C.ink : C.ink3,
            fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT,
            boxShadow: tab === t.key ? C.shadow : "none", transition: "all 0.2s",
          }}>{t.label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: C.ink3, fontSize: 14, fontFamily: FONT_SERIF, fontStyle: "italic" }}>Loading...</div>
      ) : sorted.length === 0 ? (
        <div style={{ padding: "44px 24px", textAlign: "center", width: "100%", background: C.card, borderRadius: 14, border: `1.5px solid ${C.border}` }}>
          <div style={{ fontSize: 15, fontWeight: 400, color: C.ink2, fontFamily: FONT_SERIF, fontStyle: "italic", marginBottom: 4 }}>
            {tab === "week" ? "No scores this week yet" : "No scores yet"}
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>Complete a review to be the first.</div>
        </div>
      ) : (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
          {showPodium && (
            <div style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-end", justifyContent: "center" }}>
              {[1, 0, 2].map(pi => {
                const e = sorted[pi]; if (!e) return null;
                const isFirst = pi === 0;
                return (
                  <div key={pi} style={{
                    flex: 1, textAlign: "center",
                    padding: isFirst ? "18px 8px 14px" : "12px 8px 10px",
                    background: isFirst ? C.goldBg : C.card,
                    borderRadius: 14, border: `1.5px solid ${isFirst ? C.gold + "44" : C.border}`,
                    transform: isFirst ? "translateY(-6px)" : "none",
                  }}>
                    <div style={{ fontSize: isFirst ? 24 : 18 }}>{MEDAL[pi]}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.ink, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.pack === "th" ? "🇹🇭" : e.pack === "es" ? "🇪🇸" : ""} {e.name}</div>
                    <div style={{ fontSize: isFirst ? 20 : 16, fontWeight: 400, fontFamily: FONT_SERIF, marginTop: 2, color: e.accuracy === 100 ? C.good : e.accuracy >= 80 ? C.info : C.amber }}>{e.accuracy}%</div>
                    <div style={{ fontSize: 9, color: C.muted }}>{e.correct}/{e.wordsReviewed}</div>
                  </div>
                );
              })}
            </div>
          )}
          {(showPodium ? sorted.slice(3) : sorted).map((entry, i) => (
            <LeaderboardRow key={`${entry.timestamp}-${i}`} entry={entry} rank={showPodium ? i + 4 : i + 1} />
          ))}
        </div>
      )}

      <div style={{ fontSize: 10, color: C.muted, textAlign: "center", fontStyle: "italic", fontFamily: FONT_SERIF }}>
        Ranked by accuracy · {tab === "week" ? "resets every Monday" : "all sessions"}
      </div>
    </div>
  );
}
