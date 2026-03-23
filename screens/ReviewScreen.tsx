"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { C, FONT, FONT_SERIF } from "@/styles/theme";
import { scheduleReview, type Word } from "@/lib/srs";
import { putWord } from "@/lib/db";
import ProgressBar from "@/components/ProgressBar";
import GradeButton from "@/components/GradeButton";

export interface ReviewResult {
  word: string;
  typed: string;
  correct: string;
  grade: string;
  isCorrect: boolean | null;
}

interface ReviewScreenProps {
  words: Word[];
  onComplete: (results: ReviewResult[]) => void;
}

export default function ReviewScreen({ words, onComplete }: ReviewScreenProps) {
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<ReviewResult[]>([]);
  const [animDir, setAnimDir] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(true);
  const [grading, setGrading] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [autoGrading, setAutoGrading] = useState(false);
  const [waitingAfterWrong, setWaitingAfterWrong] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleGradeRef = useRef<(grade: string) => void>(() => {});
  const handleRevealRef = useRef<() => void>(() => {});
  const continueAfterWrongRef = useRef<() => void>(() => {});
  const waitingAfterWrongRef = useRef(false);
  const revealedRef = useRef(false);
  const gradingRef = useRef(false);
  const resultsRef = useRef<ReviewResult[]>([]);
  const idxRef = useRef(0);
  const retryingRef = useRef(false);

  useEffect(() => { revealedRef.current = revealed; }, [revealed]);
  useEffect(() => { gradingRef.current = grading; }, [grading]);
  useEffect(() => { resultsRef.current = results; }, [results]);
  useEffect(() => { idxRef.current = idx; }, [idx]);
  useEffect(() => { retryingRef.current = retrying; }, [retrying]);

  const word = words[idx];
  const total = words.length;

  function normalize(s: string): string {
    return s.trim().toLowerCase().replace(/^to\s+/, "");
  }

  function handleReveal() {
    if (revealedRef.current || gradingRef.current) return;
    // Read directly from DOM — React state may be stale in same event tick
    const rawInput = inputRef.current?.value ?? "";
    const typed = normalize(rawInput);
    const correct = normalize(words[idx].english);
    console.log("[RECALL] handleReveal:", { rawInput, typed, correct, match: typed === correct, idx });
    // Must type an answer — don't reveal if blank
    if (typed.length === 0) {
      inputRef.current?.focus();
      return;
    }
    setUserAnswer(rawInput);
    revealedRef.current = true;
    setRevealed(true);
    setShowHint(false);
    if (typed.length > 0) {
      setAutoGrading(true);
      if (typed === correct) {
        // Correct — auto-grade and advance after 1s
        setTimeout(() => handleGradeRef.current("good"), 1000);
      } else {
        // Wrong — record it now, but stay on card so user can study
        const currentWord = words[idx];
        const updated = scheduleReview(currentWord, "again");
        putWord(updated);
        const newResults = [...resultsRef.current, { word: currentWord.spanish, typed: rawInput, correct: currentWord.english, grade: "again", isCorrect: false }];
        setResults(newResults);
        resultsRef.current = newResults;
        setAnimDir("wrong");
        setWaitingAfterWrong(true);
      }
    }
  }
  function handleContinueAfterWrong() {
    if (!waitingAfterWrong) return;
    setWaitingAfterWrong(false);
    setAutoGrading(false);
    setAnimDir(null);
    // Advance to next card
    const isLast = idxRef.current >= total - 1;
    const currentResults = resultsRef.current;
    setRevealed(false); setGrading(false); setRetrying(false); setUserAnswer("");
    gradingRef.current = false; revealedRef.current = false; retryingRef.current = false;
    if (isLast) onComplete(currentResults); else { setIdx(i => i + 1); setTimeout(() => inputRef.current?.focus(), 50); }
  }
  continueAfterWrongRef.current = handleContinueAfterWrong;
  waitingAfterWrongRef.current = waitingAfterWrong;
  handleRevealRef.current = handleReveal;

  const advance = useCallback(() => {
    const isLast = idxRef.current >= total - 1;
    const currentResults = resultsRef.current;
    setAnimDir(null); setRevealed(false); setGrading(false); setRetrying(false); setUserAnswer(""); setAutoGrading(false);
    gradingRef.current = false; revealedRef.current = false; retryingRef.current = false;
    if (isLast) onComplete(currentResults); else { setIdx(i => i + 1); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [total, onComplete]);

  const handleGrade = useCallback((grade: string) => {
    if (!revealedRef.current || gradingRef.current) return;
    gradingRef.current = true;
    setGrading(true);
    const currentWord = words[idxRef.current];

    if (grade === "again") {
      if (!retryingRef.current) {
        const updated = scheduleReview(currentWord, "again");
        putWord(updated);
        const typedVal = inputRef.current?.value ?? "";
        const newResults = [...resultsRef.current, { word: currentWord.spanish, typed: typedVal, correct: currentWord.english, grade: "again", isCorrect: false }];
        setResults(newResults);
      }
      setAnimDir("wrong");
      setGrading(true);
      setTimeout(() => {
        setAnimDir(null); setRevealed(false); setGrading(false); setRetrying(true); setUserAnswer(""); setAutoGrading(false);
        gradingRef.current = false; revealedRef.current = false; retryingRef.current = true;
        setTimeout(() => inputRef.current?.focus(), 50);
      }, 400);
      return;
    }

    setGrading(true);
    if (!retryingRef.current) {
      const updated = scheduleReview(currentWord, grade as "hard" | "good" | "easy");
      putWord(updated);
      const isCorrect = grade !== "again";
      const typedVal = inputRef.current?.value ?? userAnswer;
      const newResults = [...resultsRef.current, { word: currentWord.spanish, typed: typedVal, correct: currentWord.english, grade, isCorrect }];
      setResults(newResults);
      setAnimDir(isCorrect ? "correct" : "wrong");
    } else {
      const updated = scheduleReview(currentWord, grade as "hard" | "good" | "easy");
      putWord(updated);
      setAnimDir("correct");
    }
    setTimeout(advance, 350);
  }, [words, advance]);
  handleGradeRef.current = handleGrade;

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const inInput = document.activeElement === inputRef.current;
      // Space or Enter while waiting after wrong → advance
      if ((e.key === " " || e.key === "Enter") && waitingAfterWrongRef.current) {
        e.preventDefault();
        continueAfterWrongRef.current();
        return;
      }
      if (e.key === "Enter") {
        if (inInput) return;
        e.preventDefault();
        if (!revealedRef.current && !gradingRef.current) {
          handleRevealRef.current();
        } else if (revealedRef.current && !gradingRef.current) {
          handleGrade("hard");
        }
        return;
      }
      if (e.key === " " && !inInput) {
        e.preventDefault();
        if (!revealedRef.current && !gradingRef.current) {
          handleRevealRef.current();
        } else if (revealedRef.current && !gradingRef.current) {
          handleGrade("hard");
        }
        return;
      }
      if (revealedRef.current && !gradingRef.current && !inInput) {
        if (e.key === "1") handleGrade("again");
        if (e.key === "2") handleGrade("hard");
        if (e.key === "3") handleGrade("good");
        if (e.key === "4") handleGrade("easy");
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [handleGrade]);

  if (!word) return null;
  const correctCount = results.filter(r => r.isCorrect === true).length;
  const wrongCount = results.filter(r => r.isCorrect === false).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, padding: "24px 20px", maxWidth: 420, margin: "0 auto", width: "100%", minHeight: "100vh" }}>
      <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => onComplete(results)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: C.muted, padding: 4, fontFamily: FONT_SERIF }}>✕</button>
        <div style={{ flex: 1 }}><ProgressBar current={idx} total={total} /></div>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.muted, fontFamily: FONT_SERIF }}>{idx + 1}/{total}</span>
      </div>

      <div onClick={waitingAfterWrong ? handleContinueAfterWrong : handleReveal} style={{
        width: "100%", minHeight: 280, borderRadius: 16, padding: "44px 28px",
        background: animDir === "correct" ? C.goodBg : animDir === "wrong" ? C.badBg : C.card,
        border: `1.5px solid ${animDir === "correct" ? C.good : animDir === "wrong" ? C.bad : C.cardBorder}`,
        boxShadow: revealed ? C.shadowLift : C.shadow,
        cursor: revealed ? "default" : "pointer",
        transition: "all 0.25s ease",
        transform: animDir === "correct" ? "translateX(4px)" : "translateX(0)",
        animation: animDir === "wrong" ? "shake 0.4s ease" : "none",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 20, userSelect: "none", position: "relative",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>🇪🇸 Spanish</div>
          <div style={{ fontSize: 32, fontWeight: 400, color: C.ink, fontFamily: FONT_SERIF, lineHeight: 1.15 }}>{word.spanish}</div>
        </div>
        <div style={{ width: 48, height: 1, background: C.border }} />
        {revealed ? (
          <div style={{ textAlign: "center", animation: "fadeInUp 0.3s ease" }}>
            {waitingAfterWrong && userAnswer.trim() && (
              <div style={{ fontSize: 16, fontWeight: 600, color: C.bad, fontFamily: FONT_SERIF, marginBottom: 8, textDecoration: "line-through" }}>
                {userAnswer}
              </div>
            )}
            {!waitingAfterWrong && userAnswer.trim() && normalize(userAnswer) === normalize(word.english) && (
              <div style={{ fontSize: 14, fontWeight: 500, color: C.good, fontFamily: FONT_SERIF, marginBottom: 12 }}>
                ✓ correct
              </div>
            )}
            <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>🇬🇧 English</div>
            <div style={{ fontSize: 28, fontWeight: 400, color: waitingAfterWrong ? C.good : C.accent, fontFamily: FONT_SERIF }}>{word.english}</div>
          </div>
        ) : (
          <form onSubmit={e => { e.preventDefault(); e.stopPropagation(); handleReveal(); }} onClick={e => e.stopPropagation()} style={{ textAlign: "center", width: "100%" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>🇬🇧 Your answer</div>
            <input
              ref={inputRef}
              type="text"
              placeholder="type translation..."
              value={userAnswer}
              onChange={e => { setUserAnswer(e.target.value); setShowHint(false); }}
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
              style={{
                width: "80%", padding: "8px 14px", borderRadius: 8,
                border: `1.5px solid ${C.border}`, background: C.bgDeep,
                fontSize: 20, fontWeight: 400, fontFamily: FONT_SERIF,
                color: C.ink, caretColor: C.accent, textAlign: "center",
                outline: "none",
              }}
            />
          </form>
        )}
        {word.reviewCount > 0 && !retrying && (
          <div style={{ position: "absolute", top: 14, right: 16, fontSize: 10, color: C.muted, fontFamily: FONT_SERIF, fontStyle: "italic" }}>×{word.reviewCount}</div>
        )}
        {retrying && (
          <div style={{ position: "absolute", top: 14, right: 16, fontSize: 10, color: C.bad, fontWeight: 600, fontFamily: FONT_SERIF, fontStyle: "italic" }}>retry</div>
        )}
      </div>

      {revealed && !grading && !autoGrading && (
        <div style={{ width: "100%", display: "flex", gap: 8, animation: "fadeInUp 0.25s ease" }}>
          <GradeButton label="Again" color={C.bad} bg={C.badBg} hotkey="1" onClick={() => handleGrade("again")} />
          <GradeButton label="Hard" color={C.amber} bg={C.amberBg} hotkey="2" onClick={() => handleGrade("hard")} />
          <GradeButton label="Good" color={C.good} bg={C.goodBg} hotkey="3" onClick={() => handleGrade("good")} />
          <GradeButton label="Easy" color={C.info} bg={C.infoBg} hotkey="4" onClick={() => handleGrade("easy")} />
        </div>
      )}

      {!revealed && !grading && (
        <div style={{ fontSize: 11, color: C.muted, display: "flex", alignItems: "center", gap: 6 }}>
          <kbd style={{ padding: "2px 7px", background: C.bgDeep, borderRadius: 4, border: `1px solid ${C.border}`, fontSize: 10, fontFamily: "monospace" }}>enter</kbd>
          <span style={{ fontFamily: FONT_SERIF, fontStyle: "italic" }}>to submit</span>
        </div>
      )}
      {waitingAfterWrong && (
        <div style={{ fontSize: 11, color: C.muted, display: "flex", alignItems: "center", gap: 6 }}>
          <kbd style={{ padding: "2px 7px", background: C.bgDeep, borderRadius: 4, border: `1px solid ${C.border}`, fontSize: 10, fontFamily: "monospace" }}>space</kbd>
          <span style={{ fontFamily: FONT_SERIF, fontStyle: "italic" }}>to continue</span>
        </div>
      )}
      {revealed && !grading && !autoGrading && !waitingAfterWrong && (
        <div style={{ fontSize: 11, color: C.muted, display: "flex", alignItems: "center", gap: 6 }}>
          <kbd style={{ padding: "2px 7px", background: C.bgDeep, borderRadius: 4, border: `1px solid ${C.border}`, fontSize: 10, fontFamily: "monospace" }}>space</kbd>
          <span style={{ fontFamily: FONT_SERIF, fontStyle: "italic" }}>= hard</span>
          <span style={{ color: C.border }}>·</span>
          <span style={{ fontFamily: FONT_SERIF, fontStyle: "italic" }}>1-4 to grade</span>
        </div>
      )}

      <div style={{ display: "flex", gap: 14, fontSize: 13, fontWeight: 600, fontFamily: FONT_SERIF }}>
        <span style={{ color: C.good }}>✓ {correctCount}</span>
        <span style={{ color: C.bad }}>✗ {wrongCount}</span>
      </div>
    </div>
  );
}
