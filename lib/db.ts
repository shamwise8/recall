import { Word, createWord } from "./srs";
import { SEED_WORDS } from "./seed-words";

const DB_NAME = "recall-db";
const DB_VERSION = 1;
const STORE = "words";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" }).createIndex("due", "due", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllWords(): Promise<Word[]> {
  const db = await openDB();
  return new Promise((res, rej) => {
    const r = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

export async function getDueWords(limit = 20): Promise<Word[]> {
  const all = await getAllWords();
  const due = all.filter(w => w.due <= Date.now()).sort((a, b) => a.due - b.due).slice(0, limit);
  // Shuffle
  for (let i = due.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [due[i], due[j]] = [due[j], due[i]];
  }
  return due;
}

export async function putWord(word: Word): Promise<void> {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(word);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

export async function seedWords(): Promise<number> {
  const existing = await getAllWords();
  const keys = new Set(existing.map(w => `${w.spanish.toLowerCase()}|${w.english.toLowerCase()}`));
  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);
  let added = 0;
  for (const [sp, en] of SEED_WORDS) {
    const k = `${sp.toLowerCase()}|${en.toLowerCase()}`;
    if (!keys.has(k)) { store.put(createWord(sp, en)); added++; }
  }
  return new Promise(res => { tx.oncomplete = () => res(added); });
}
