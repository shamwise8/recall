"use client";

import { C, FONT_SERIF } from "@/styles/theme";

export default function StreakFire({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", background: C.amberBg, borderRadius: 100, border: `1px solid ${C.amber}33` }}>
      <span style={{ fontSize: 14, lineHeight: 1 }}>🔥</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: C.amber, fontFamily: FONT_SERIF }}>{count}</span>
    </div>
  );
}
