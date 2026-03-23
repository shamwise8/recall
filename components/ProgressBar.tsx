"use client";

import { C } from "@/styles/theme";

export default function ProgressBar({ current, total, color = C.accent }: { current: number; total: number; color?: string }) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div style={{ width: "100%", height: 6, background: C.bgDeep, borderRadius: 3, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }} />
    </div>
  );
}
