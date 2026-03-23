"use client";

import { useState } from "react";
import { FONT } from "@/styles/theme";

interface GradeButtonProps {
  label: string;
  color: string;
  bg: string;
  hotkey: string;
  onClick: () => void;
}

export default function GradeButton({ label, color, bg, hotkey, onClick }: GradeButtonProps) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={() => { setPressed(true); onClick(); setTimeout(() => setPressed(false), 200); }}
      style={{
        flex: 1, padding: "13px 6px", borderRadius: 10,
        background: pressed ? color : bg, border: `1.5px solid ${color}`,
        color: pressed ? "#FFF" : color, fontSize: 13, fontWeight: 600, fontFamily: FONT,
        cursor: "pointer", transition: "all 0.15s ease",
        transform: pressed ? "scale(0.95)" : "scale(1)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
      }}
    >
      {label}
      <span style={{ fontSize: 9, opacity: 0.45, fontWeight: 500 }}>{hotkey}</span>
    </button>
  );
}
