"use client";

import { useState } from "react";
import { C, FONT, FONT_SERIF } from "@/styles/theme";
import type { Stats } from "@/lib/stats";
import type { ReviewResult } from "./ReviewScreen";
import StreakFire from "@/components/StreakFire";

interface CompleteScreenProps {
  results: ReviewResult[];
  stats: Stats;
  onHome: () => void;
  onPostScore: (name: string, accuracy: number, wordsReviewed: number, correct: number, feeling: string) => Promise<void>;
  onLeaderboard: () => void;
}

export default function CompleteScreen({ results, stats, onHome, onPostScore, onLeaderboard }: CompleteScreenProps) {
  const graded = results.filter(r => r.isCorrect !== null);
  const skipped = results.filter(r => r.isCorrect === null);
  const correct = graded.filter(r => r.isCorrect === true).length;
  const wrong = graded.filter(r => r.isCorrect === false).length;
  const gradedTotal = graded.length;
  const pct = gradedTotal > 0 ? Math.round((correct / gradedTotal) * 100) : 0;
  const [name, setName] = useState("");
  const [posted, setPosted] = useState(false);
  const [posting, setPosting] = useState(false);
  const [feeling, setFeeling] = useState("");

  let message: string;
  if (gradedTotal === 0) message = "All skipped.";
  else if (pct === 100) message = "Perfect session.";
  else if (pct >= 80) message = "Well done.";
  else if (pct >= 60) message = "Getting there.";
  else if (pct >= 40) message = "Practice makes perfect.";
  else message = "Every session counts.";

  const handlePost = async () => {
    if (!name.trim() || posting || gradedTotal === 0) return;
    setPosting(true);
    await onPostScore(name.trim(), pct, gradedTotal, correct, feeling);
    setPosted(true);
    setPosting(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, padding: "44px 20px", maxWidth: 420, margin: "0 auto", width: "100%", animation: "fadeInUp 0.5s ease" }}>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 56, fontWeight: 400, color: C.accent, fontFamily: FONT_SERIF, lineHeight: 1, animation: "fadeInUp 0.6s ease" }}>{gradedTotal > 0 ? `${pct}%` : "—"}</div>
        <div style={{ fontSize: 16, fontWeight: 400, color: C.ink2, marginTop: 8, fontFamily: FONT_SERIF, fontStyle: "italic" }}>{message}</div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{results.length} words reviewed</div>
      </div>

      <div style={{ width: "100%", display: "grid", gridTemplateColumns: skipped.length > 0 ? "1fr 1fr 1fr" : "1fr 1fr", gap: 10 }}>
        <div style={{ background: C.goodBg, borderRadius: 12, padding: "18px", textAlign: "center" }}>
          <div style={{ fontSize: 26, fontWeight: 400, color: C.good, fontFamily: FONT_SERIF }}>{correct}</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: C.goodDark, textTransform: "uppercase", letterSpacing: "0.06em" }}>Correct</div>
        </div>
        <div style={{ background: C.badBg, borderRadius: 12, padding: "18px", textAlign: "center" }}>
          <div style={{ fontSize: 26, fontWeight: 400, color: C.bad, fontFamily: FONT_SERIF }}>{wrong}</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: C.bad, textTransform: "uppercase", letterSpacing: "0.06em" }}>Wrong</div>
        </div>
        {skipped.length > 0 && (
          <div style={{ background: C.bgDeep, borderRadius: 12, padding: "18px", textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 400, color: C.ink3, fontFamily: FONT_SERIF }}>{skipped.length}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Skipped</div>
          </div>
        )}
      </div>

      {stats.streak > 0 && <StreakFire count={stats.streak} />}

      <button onClick={onHome} style={{
        width: "100%", padding: "14px", borderRadius: 10,
        background: C.dark, border: "none", color: "#F8F5EE",
        fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: FONT,
      }}>
        Continue
      </button>

      {gradedTotal > 0 && !posted ? (
        <div style={{ width: "100%", padding: "18px", borderRadius: 12, background: C.goldBg, border: `1.5px solid ${C.gold}44` }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.gold, marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
            🏆 Post your score
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handlePost(); } }}
              style={{
                flex: 1, padding: "10px 14px", borderRadius: 8,
                border: `1.5px solid ${C.border}`, background: "#FFFFFF",
                fontSize: 14, fontWeight: 500, fontFamily: FONT,
                color: "#2C2418", caretColor: "#2C2418",
                outline: "none",
              }}
            />
            <button onClick={handlePost} disabled={!name.trim() || posting} style={{
              padding: "10px 18px", borderRadius: 8,
              background: name.trim() ? C.accent : C.border,
              border: "none", color: "#FFF", fontSize: 13, fontWeight: 700,
              cursor: name.trim() ? "pointer" : "default", fontFamily: FONT,
              flexShrink: 0,
            }}>
              {posting ? "..." : "Post"}
            </button>
          </div>
        </div>
      ) : posted ? (
        <div style={{
          width: "100%", padding: "14px 18px", borderRadius: 12,
          background: C.goodBg, border: `1.5px solid ${C.good}44`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.goodDark }}>✓ Posted as {name}</span>
          <button onClick={onLeaderboard} style={{
            background: C.gold, border: "none", borderRadius: 6,
            padding: "5px 12px", fontSize: 11, fontWeight: 700, color: "#FFF",
            cursor: "pointer", fontFamily: FONT,
          }}>
            View Board →
          </button>
        </div>
      ) : null}

      {results.length > 0 && (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Session Results</div>
          {results.map((r, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
              background: r.isCorrect ? C.goodBg : C.badBg, borderRadius: 8, fontSize: 13,
            }}>
              <span style={{ fontSize: 14, color: r.isCorrect ? C.good : C.bad }}>{r.isCorrect ? "✓" : "✗"}</span>
              <span style={{ fontWeight: 600, color: C.ink, fontFamily: FONT_SERIF }}>{r.word}</span>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                {!r.isCorrect && (
                  <div style={{ fontSize: 11, color: C.bad, textDecoration: "line-through" }}>{r.typed}</div>
                )}
                <div style={{ fontSize: 11, fontWeight: 500, color: r.isCorrect ? C.good : C.goodDark }}>{r.correct}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {gradedTotal > 0 && !feeling && (
        <div style={{ width: "100%", padding: "18px", borderRadius: 12, background: C.bgDeep, border: `1.5px solid ${C.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.ink2, marginBottom: 12, textAlign: "center", fontFamily: FONT_SERIF, fontStyle: "italic" }}>How did that feel?</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { label: "Easy", color: C.info, bg: C.infoBg },
              { label: "Good", color: C.good, bg: C.goodBg },
              { label: "Hard", color: C.amber, bg: C.amberBg },
            ].map(opt => (
              <button key={opt.label} onClick={() => setFeeling(opt.label)} style={{
                flex: 1, padding: "12px 8px", borderRadius: 10,
                background: opt.bg, border: `1.5px solid ${opt.color}`,
                color: opt.color, fontSize: 14, fontWeight: 600, fontFamily: FONT,
                cursor: "pointer",
              }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {feeling && (
        <div style={{ fontSize: 13, color: C.ink3, fontFamily: FONT_SERIF, fontStyle: "italic" }}>
          Rated: {feeling}
        </div>
      )}
    </div>
  );
}
