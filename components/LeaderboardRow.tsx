"use client";

import { C, FONT_SERIF } from "@/styles/theme";
import type { LeaderboardEntry } from "@/lib/leaderboard";

const MEDAL = ["🥇", "🥈", "🥉"];
const PACK_FLAG: Record<string, string> = { es: "🇪🇸", th: "🇹🇭" };

export { MEDAL };

export default function LeaderboardRow({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const isMedal = rank <= 3;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
      background: rank % 2 === 0 ? C.bgDeep : C.card, borderRadius: 10,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: isMedal ? 16 : 12, fontWeight: 700, fontFamily: FONT_SERIF,
        background: isMedal ? "transparent" : C.bgDeep, color: isMedal ? undefined : C.ink3,
      }}>
        {isMedal ? MEDAL[rank - 1] : rank}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5 }}>
          {entry.pack && <span style={{ fontSize: 12 }}>{PACK_FLAG[entry.pack] || ""}</span>}
          {entry.name}
        </div>
        <div style={{ fontSize: 11, color: C.muted }}>{entry.correct}/{entry.wordsReviewed} words</div>
      </div>
      <div style={{
        fontSize: 18, fontWeight: 700, fontFamily: FONT_SERIF,
        color: entry.accuracy === 100 ? C.good : entry.accuracy >= 80 ? C.info : entry.accuracy >= 60 ? C.amber : C.bad,
      }}>
        {entry.accuracy}%
      </div>
    </div>
  );
}
