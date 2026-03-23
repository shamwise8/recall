import { Word, createWord } from "./srs";
import { SEED_WORDS_ES } from "./seed-words-es";
import { SEED_WORDS_TH } from "./seed-words-th";

const DB_NAME = "recall-db";
const DB_VERSION = 2;
const STORES = ["words-es", "words-th"];

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      // Migrate v1 → v2: move old "words" store data to "words-es"
      if (db.objectStoreNames.contains("words")) {
        db.deleteObjectStore("words");
      }
      for (const store of STORES) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: "id" }).createIndex("due", "due", { unique: false });
        }
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function storeName(pack: string): string {
  return `words-${pack}`;
}

export async function getAllWords(pack: string): Promise<Word[]> {
  const db = await openDB();
  const store = storeName(pack);
  return new Promise((res, rej) => {
    const r = db.transaction(store, "readonly").objectStore(store).getAll();
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

export async function getDueWords(pack: string, limit = 20): Promise<Word[]> {
  const all = await getAllWords(pack);
  const due = all.filter(w => w.due <= Date.now());
  // Shuffle first, then slice — prevents alphabetical bias when all due times are equal
  for (let i = due.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [due[i], due[j]] = [due[j], due[i]];
  }
  return due.slice(0, limit);
}

export async function putWord(word: Word): Promise<void> {
  const db = await openDB();
  const store = storeName(word.pack);
  return new Promise((res, rej) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(word);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

export async function seedWords(pack: string): Promise<number> {
  const existing = await getAllWords(pack);
  const keys = new Set(existing.map(w => `${w.prompt.toLowerCase()}|${w.answer.toLowerCase()}`));
  const db = await openDB();
  const store = storeName(pack);
  const tx = db.transaction(store, "readwrite");
  const s = tx.objectStore(store);
  let added = 0;

  if (pack === "es") {
    for (const [prompt, answer] of SEED_WORDS_ES) {
      const k = `${prompt.toLowerCase()}|${answer.toLowerCase()}`;
      if (!keys.has(k)) { s.put(createWord(prompt, answer, "es")); added++; }
    }
  } else if (pack === "th") {
    for (const [prompt, romanized, answer] of SEED_WORDS_TH) {
      const k = `${prompt.toLowerCase()}|${answer.toLowerCase()}`;
      if (!keys.has(k)) { s.put(createWord(prompt, answer, "th", romanized)); added++; }
    }
  }

  return new Promise(res => { tx.oncomplete = () => res(added); });
}
