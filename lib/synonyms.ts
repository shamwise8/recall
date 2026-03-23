// Synonym groups — any word in the same group is an acceptable answer
// All entries should be lowercase
const SYNONYM_GROUPS: string[][] = [
  // Greetings
  ["hello", "hi", "hey"],
  ["goodbye", "bye", "see you", "later"],
  ["good morning", "morning"],
  ["good night", "night", "goodnight"],
  // Common
  ["thank you", "thanks"],
  ["please", "pls"],
  ["sorry", "excuse me", "pardon"],
  ["yes", "yeah", "yep", "yea"],
  ["no", "nope", "nah"],
  // People
  ["man", "guy"],
  ["woman", "lady"],
  ["child", "kid", "boy", "girl"],
  ["friend", "buddy", "pal"],
  // Actions
  ["speak", "talk"],
  ["walk", "stroll"],
  ["run", "sprint", "jog"],
  ["eat", "have food"],
  ["drink", "have a drink"],
  ["sleep", "rest", "nap"],
  ["read", "study"],
  ["write", "type"],
  ["buy", "purchase", "get"],
  ["sell", "trade"],
  ["open", "unlock"],
  ["close", "shut"],
  ["think", "consider"],
  ["know", "understand"],
  ["want", "desire", "wish"],
  ["have", "own", "possess"],
  ["go", "leave", "head"],
  ["come", "arrive"],
  ["give", "hand", "offer"],
  ["see", "look", "watch"],
  ["hear", "listen"],
  ["feel", "sense"],
  ["find", "discover", "locate"],
  ["put", "place", "set"],
  ["leave", "go", "depart", "exit"],
  ["enter", "go in", "come in"],
  ["wait", "hold on"],
  ["call", "phone", "ring"],
  ["ask", "question", "inquire"],
  ["answer", "reply", "respond"],
  ["help", "assist", "aid"],
  ["need", "require"],
  ["work", "labor"],
  ["live", "reside", "dwell"],
  ["die", "pass away"],
  ["believe", "trust", "faith"],
  ["play", "game"],
  ["cook", "prepare food"],
  ["clean", "tidy", "wash up"],
  ["wash", "rinse", "clean"],
  ["dress", "wear", "put on"],
  ["cross", "go across"],
  // Adjectives
  ["big", "large", "huge"],
  ["small", "little", "tiny"],
  ["good", "fine", "great", "nice", "well"],
  ["bad", "poor", "terrible"],
  ["new", "brand new", "fresh"],
  ["old", "aged", "ancient"],
  ["pretty", "beautiful", "attractive", "lovely", "cute"],
  ["ugly", "unattractive"],
  ["fast", "quick", "rapid", "speedy"],
  ["slow", "sluggish"],
  ["hot", "warm", "burning"],
  ["cold", "cool", "chilly", "freezing"],
  ["happy", "glad", "joyful", "cheerful"],
  ["sad", "unhappy", "upset"],
  ["angry", "mad", "furious"],
  ["tired", "exhausted", "sleepy", "fatigued"],
  ["sick", "ill", "unwell"],
  ["strong", "powerful", "tough"],
  ["weak", "feeble"],
  ["important", "significant", "essential"],
  ["necessary", "needed", "required", "essential"],
  ["possible", "feasible", "doable"],
  ["difficult", "hard", "tough", "challenging"],
  ["easy", "simple", "effortless"],
  ["dangerous", "risky", "hazardous", "unsafe"],
  ["safe", "secure", "protected"],
  ["full", "filled", "stuffed"],
  ["empty", "vacant", "bare"],
  ["rich", "wealthy", "well-off"],
  ["poor", "broke", "needy"],
  ["young", "youthful"],
  ["cheap", "inexpensive", "affordable"],
  ["expensive", "pricey", "costly"],
  ["free", "no charge", "complimentary"],
  ["near", "close", "nearby"],
  ["far", "distant", "remote"],
  ["early", "ahead of time"],
  ["late", "tardy", "behind"],
  ["delicious", "yummy", "tasty"],
  ["spicy", "hot"],
  ["beautiful", "gorgeous", "stunning", "pretty"],
  // Nouns
  ["house", "home"],
  ["car", "auto", "vehicle", "automobile"],
  ["street", "road"],
  ["money", "cash", "funds"],
  ["store", "shop"],
  ["food", "meal"],
  ["phone", "telephone", "cellphone", "mobile"],
  ["computer", "pc", "laptop"],
  ["movie", "film"],
  ["party", "celebration", "event"],
  ["vacation", "holiday", "trip"],
  ["trip", "journey", "travel", "vacation"],
  ["luggage", "baggage", "bags"],
  ["ticket", "pass"],
  ["bathroom", "restroom", "toilet", "wc"],
  ["bedroom", "room"],
  ["doctor", "physician", "doc"],
  ["teacher", "professor", "instructor"],
  ["student", "pupil", "learner"],
  ["lawyer", "attorney"],
  ["police", "cops", "officer"],
  ["market", "bazaar"],
  ["library", "book place"],
  ["you're welcome", "welcome", "congratulations", "glad"],
  ["this", "here", "this one"],
  ["that", "there", "that one"],
  // Thai-specific
  ["not spicy", "no spice", "mild"],
  ["check please", "bill please", "check", "bill"],
  ["i want this one", "this one", "i'll have this"],
  ["i don't want", "no thanks", "don't want"],
  ["more", "add", "extra"],
  ["put in bag", "bag please", "bag it"],
  ["go straight", "straight", "straight ahead"],
  ["go back", "return", "turn back"],
  ["go to", "take me to", "head to"],
  ["stop here", "here please", "right here"],
  ["how much", "what price", "how much is it", "price"],
  ["can you reduce the price", "discount", "cheaper please", "lower price"],
  ["is it far", "far?"],
  ["i don't understand", "don't understand", "no understand"],
  ["i understand", "understand", "got it"],
  ["i can't speak thai", "no thai", "don't speak thai"],
  ["speak slowly", "slow please", "slower"],
  ["help me", "help", "i need help"],
  ["yes (male polite)", "yes", "krap"],
  ["yes (female polite)", "yes", "ka"],
  ["no / not", "no", "not"],
  ["not good / bad", "not good", "bad"],
  ["i (male)", "i", "me"],
  ["i (female)", "i", "me"],
  ["he / she / they", "he", "she", "they", "him", "her", "them"],
  ["foreigner / westerner", "foreigner", "westerner", "farang"],
  ["thai person", "thai"],
  ["bts / skytrain", "bts", "skytrain", "sky train"],
  ["bts station", "station", "bts"],
  ["road / street", "road", "street"],
  ["alley / soi", "alley", "soi", "lane"],
  ["boiled / soup", "boiled", "soup"],
  ["cold / cool", "cold", "cool"],
  ["can/to be able", "can", "able", "be able"],
  ["no problem / never mind", "no problem", "never mind", "no worries", "it's ok"],
  ["one hundred", "hundred", "100"],
];

// Build a lookup: normalized answer → set of acceptable alternatives
const lookupMap = new Map<string, Set<string>>();

for (const group of SYNONYM_GROUPS) {
  const normalized = group.map(s => s.toLowerCase().trim());
  const allSet = new Set(normalized);
  for (const word of normalized) {
    const existing = lookupMap.get(word);
    if (existing) {
      for (const s of allSet) existing.add(s);
    } else {
      lookupMap.set(word, new Set(allSet));
    }
  }
}

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/^to\s+/, "");
}

function checkMatch(typed: string, correct: string): boolean {
  if (typed === correct) return true;
  const synonyms = lookupMap.get(correct);
  if (synonyms && synonyms.has(typed)) return true;
  const typedSynonyms = lookupMap.get(typed);
  if (typedSynonyms && typedSynonyms.has(correct)) return true;
  return false;
}

export function isAnswerCorrect(typed: string, correct: string): boolean {
  const t = norm(typed);
  const c = norm(correct);
  if (checkMatch(t, c)) return true;
  // If correct answer has "/" or "(" alternatives, accept any part
  // e.g. "sorry / excuse me" → accept "sorry" or "excuse me"
  // e.g. "yes (male polite)" → accept "yes"
  const parts = c.split(/\s*[\/]\s*|\s*\(.*?\)\s*/).map(p => norm(p)).filter(p => p.length > 0);
  for (const part of parts) {
    if (checkMatch(t, part)) return true;
  }
  return false;
}
