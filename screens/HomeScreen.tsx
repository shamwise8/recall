"use client";

import { C, FONT, FONT_SERIF } from "@/styles/theme";
import type { Stats } from "@/lib/stats";
import StreakFire from "@/components/StreakFire";

const PACK_INFO: Record<string, { flag: string; label: string; sub: string }> = {
  es: { flag: "🇪🇸", label: "Spanish", sub: "Spanish vocabulary" },
  th: { flag: "🇹🇭", label: "Thai", sub: "Thai vocabulary" },
};

interface HomeScreenProps {
  stats: Stats;
  pack: string;
  onSwitchPack: (pack: "es" | "th") => void;
  onStartReview: () => void;
  onLeaderboard: () => void;
}

export default function HomeScreen({ stats, pack, onSwitchPack, onStartReview, onLeaderboard }: HomeScreenProps) {
  const hasDue = stats.due > 0;
  const info = PACK_INFO[pack] || PACK_INFO.es;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, padding: "32px 20px", maxWidth: 420, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 400, color: C.ink, margin: 0, fontFamily: FONT_SERIF, letterSpacing: "-0.02em" }}>Recall</h1>
          <p style={{ fontSize: 12, color: C.muted, margin: "2px 0 0", letterSpacing: "0.06em" }}>{info.sub}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StreakFire count={stats.streak} />
          <button onClick={onLeaderboard} style={{
            background: C.goldBg, border: `1.5px solid ${C.gold}44`, borderRadius: 10,
            padding: "7px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
            fontSize: 12, fontWeight: 600, color: C.gold, fontFamily: FONT,
          }}>
            🏆 Board
          </button>
        </div>
      </div>

      {/* Pack switcher */}
      <div style={{ display: "flex", width: "100%", background: C.bgDeep, borderRadius: 10, padding: 3 }}>
        {(["es", "th"] as const).map(p => (
          <button key={p} onClick={() => onSwitchPack(p)} style={{
            flex: 1, padding: "9px", borderRadius: 8, border: "none",
            background: pack === p ? C.card : "transparent",
            color: pack === p ? C.ink : C.ink3,
            fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT,
            boxShadow: pack === p ? C.shadow : "none", transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            {PACK_INFO[p].flag} {PACK_INFO[p].label}
          </button>
        ))}
      </div>

      <div style={{
        width: "100%", padding: "28px 24px", borderRadius: 16,
        background: hasDue ? C.dark : C.card,
        border: hasDue ? "none" : `1.5px solid ${C.border}`,
        boxShadow: hasDue ? "0 8px 32px rgba(44,36,24,0.20)" : C.shadow,
        color: hasDue ? "#F8F5EE" : C.ink, textAlign: "center",
      }}>
        <div style={{ fontSize: 48, fontWeight: 400, lineHeight: 1, fontFamily: FONT_SERIF }}>
          {hasDue ? stats.due : "✓"}
        </div>
        <div style={{ fontSize: 14, fontWeight: 400, marginTop: 6, opacity: 0.75, fontFamily: FONT_SERIF, fontStyle: "italic" }}>
          {hasDue ? "words ready to review" : "all caught up"}
        </div>
        {hasDue && (
          <button onClick={onStartReview} style={{
            marginTop: 18, padding: "12px 40px", borderRadius: 10,
            background: C.accent, border: "none", color: "#F8F5EE",
            fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT,
            boxShadow: "0 4px 16px rgba(196,89,42,0.35)",
          }}>
            Play Recall →
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, width: "100%" }}>
        {[
          { label: "Total", value: stats.total, bg: C.bgDeep, color: C.ink2 },
          { label: "Learned", value: stats.learned, bg: C.goodBg, color: C.good },
          { label: "Today", value: stats.reviewedToday, bg: C.accentBg, color: C.accent },
        ].map(s => (
          <div key={s.label} style={{
            background: s.bg, borderRadius: 12, padding: "16px 12px", textAlign: "center",
          }}>
            <div style={{ fontSize: 22, fontWeight: 400, color: s.color, fontFamily: FONT_SERIF }}>{s.value}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: s.color, opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {!hasDue && (
        <div style={{ textAlign: "center", color: C.ink3, fontSize: 13, lineHeight: 1.6, fontStyle: "italic", fontFamily: FONT_SERIF }}>
          Come back later — your next<br/>reviews will be ready soon.
        </div>
      )}
    </div>
  );
}
