# Recall — Claude Code Setup Instructions

## What this is
Recall is a Spanish vocabulary flashcard app with SRS scheduling, IndexedDB persistence, and a shared leaderboard. The complete working prototype is in `recall.jsx` — a single React component with everything embedded. Your job is to extract it into a proper Next.js project.

## Start fresh
Create a new Next.js project (App Router, TypeScript, Tailwind optional but not required). Do NOT use the old Codex scaffold — everything needed is in the artifact.

## Project structure to create

```
recall/
├── app/
│   ├── layout.tsx          # Root layout, import Google Fonts (DM Sans, Georgia system)
│   ├── page.tsx            # Home screen (due count, stats, seed button, leaderboard link)
│   ├── review/
│   │   └── page.tsx        # Review session flow
│   ├── complete/
│   │   └── page.tsx        # Session results + leaderboard post
│   └── leaderboard/
│       └── page.tsx        # All-time + weekly leaderboard
├── components/
│   ├── ProgressBar.tsx
│   ├── GradeButton.tsx
│   ├── StreakFire.tsx
│   └── LeaderboardRow.tsx
├── lib/
│   ├── srs.ts              # scheduleReview() and createWord() — SM-2 engine
│   ├── db.ts               # IndexedDB wrapper (openDB, getAllWords, getDueWords, putWord)
│   ├── seed-words.ts       # SEED_WORDS array (264 Latin American Spanish pairs)
│   ├── leaderboard.ts      # loadLeaderboard, saveLeaderboard, postScore (uses localStorage for now)
│   └── stats.ts            # getStats() — total, due, learned, reviewedToday, streak
├── styles/
│   └── theme.ts            # Color tokens (Warm Ink palette) and font constants
└── package.json
```

## Theme — Warm Ink palette
```
bg: "#F8F5EE"
bgDeep: "#EDE8DF"
card: "#FFFFFF"
cardBorder: "#D9D0C2"
dark: "#2C2418"
ink: "#2C2418"
ink2: "#5A4D3C"
ink3: "#8A7D6B"
muted: "#A89880"
accent (terracotta): "#C4592A"
accentBg: "#F2E8E4"
good (olive): "#5B7A4A"
goodBg: "#E4EDDF"
info (slate): "#4A6B7A"
infoBg: "#DFE8ED"
bad (warm red): "#B83A2A"
badBg: "#F2E0DC"
amber: "#9A6A20"
amberBg: "#F0E8D4"
gold: "#B8922A"
goldBg: "#F5EED8"
```
Fonts: Georgia serif for display text (words, scores, labels). DM Sans for UI elements.

## Key behaviors to preserve exactly

### Review flow
1. Space/Enter = reveal answer
2. After reveal, space/Enter = grade as "Hard" (correct, comes back sooner)
3. Keys 1-4 map to Again/Hard/Good/Easy
4. Again = wrong. Shakes card red, re-hides answer for retry. Logged as wrong ONCE (wrong is wrong). Subsequent "Again" on same card doesn't double-count.
5. Hard/Good/Easy after retry = advance (already logged as wrong, just schedules SRS)
6. Hard = correct. Good = correct. Easy = correct. Only Again = wrong.

### SRS engine (SM-2 variant)
- Again: reps=0, interval=1min, ease-0.2
- Hard: reps+1, interval×1.2, ease-0.15
- Good: reps+1, standard progression (10min → 1day → interval×ease)
- Easy: reps+1, accelerated (1day → interval×ease×1.3), ease+0.15

### Leaderboard
- Shared storage — all users see the same board
- No auth. User types a name per session after completing review.
- Ranked by accuracy (correct / graded total)
- Two tabs: This Week (ISO week reset) and All Time
- Top 3 get podium display, rest are rows
- In the artifact this uses `window.storage` API (artifact persistent storage). For the Next.js app, use localStorage initially. Can swap to a backend later.

### IndexedDB
- DB name: "recall-db", version 1
- Object store: "words", keyPath: "id"
- Index on "due" field
- Word shape: { id, spanish, english, reps, lapses, ease, interval, due, lastReviewed, reviewCount, createdAt }

### Seed data
- 264 common Latin American Spanish-English pairs
- Bulk insert in single transaction
- Skip duplicates by normalized spanish|english key
- Uses "carro" not "coche"

## What NOT to do
- Don't add authentication
- Don't add a settings page
- Don't add dark mode (yet)
- Don't use Tailwind classes for the Warm Ink colors — use the theme tokens directly
- Don't change the SRS intervals or grading logic
- Don't add any server-side data fetching — everything is client-side (IndexedDB + localStorage)

## Reference
The complete working code is in `recall.jsx`. Every function, every color, every interaction is in there. Extract, type, and split — don't redesign.
