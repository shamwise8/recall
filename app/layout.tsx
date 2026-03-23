import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { C } from "@/styles/theme";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Recall",
  description: "Spanish vocabulary trainer with spaced repetition",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={dmSans.className} style={{ margin: 0, background: C.bg }}>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: ${C.bg}; }
          input:focus { border-color: ${C.accent} !important; box-shadow: 0 0 0 3px ${C.accentBg} !important; }
          input::placeholder { color: ${C.muted} !important; opacity: 1 !important; -webkit-text-fill-color: ${C.muted} !important; }
          input[type="text"] { color: #2C2418 !important; -webkit-text-fill-color: #2C2418 !important; caret-color: #2C2418 !important; opacity: 1 !important; font-size: 14px !important; }
          [contenteditable]:empty:before { content: attr(data-placeholder); color: ${C.muted}; pointer-events: none; }
          [contenteditable]:focus { border-color: ${C.accent} !important; box-shadow: 0 0 0 3px ${C.accentBg} !important; }
          @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
          button:active { transform: scale(0.97) !important; }
        `}</style>
        {children}
      </body>
    </html>
  );
}
