// THE SCRAMBLE FOR AFRICA — game engine
// Parses the single events.csv and runs a non-linear "web" of events.

export type StatKey = "territory" | "gold" | "military" | "humanity" | "infamy";

export type Stats = Record<StatKey, number>;

export const STAT_META: Record<StatKey, { label: string; max: number; tone: string; describe: string }> = {
  territory: { label: "Territory",  max: 100, tone: "var(--accent)",   describe: "% of African land you control" },
  gold:      { label: "Coffers",    max: 200, tone: "#b8860b",        describe: "Gold and ivory in the Company vaults" },
  military:  { label: "Military",   max: 100, tone: "#5a6b3f",        describe: "Soldiers, rifles, gunboats" },
  humanity:  { label: "Humanity",   max: 100, tone: "#3d5a4a",        describe: "Your remaining moral standing" },
  infamy:    { label: "Infamy",     max: 100, tone: "var(--blood, #7a1a14)", describe: "How notorious you are in Europe" },
};

export const INITIAL_STATS: Stats = { territory: 5, gold: 60, military: 40, humanity: 70, infamy: 10 };

export type Choice = { label: string; effects: Partial<Stats>; next: string };
export type Event = {
  id: string;
  title: string;
  description: string;
  image: string;       // one of: brussels | coast | river | inner | title
  pullquote?: string;  // optional Conrad quote
  choices: Choice[];
};

// ---------- CSV PARSING ----------
function parseCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (q && line[i + 1] === '"') { cur += '"'; i++; } else { q = !q; }
    } else if (c === "," && !q) {
      out.push(cur); cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}

function parseEffects(s: string): Partial<Stats> {
  const eff: Partial<Stats> = {};
  if (!s) return eff;
  // tokens like "territory+10 gold-20 humanity+5"
  const re = /([a-zA-Z]+)\s*([+-])\s*(\d+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    const key = m[1].toLowerCase() as StatKey;
    if (key in STAT_META) {
      const val = parseInt(m[3], 10) * (m[2] === "-" ? -1 : 1);
      eff[key] = (eff[key] ?? 0) + val;
    }
  }
  return eff;
}

export function parseEventsCSV(csv: string): Record<string, Event> {
  const events: Record<string, Event> = {};
  const lines = csv.split(/\r?\n/);
  if (lines.length === 0) return events;
  const headers = parseCSVLine(lines[0]).map((h) => h.trim());

  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i];
    const cells = parseCSVLine(raw);
    const firstCell = (cells[0] ?? "").trim().replace(/^\uFEFF/, "");
    if (!raw.trim() || firstCell.startsWith("#")) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => (row[h] = (cells[idx] ?? "").trim()));
    const id = row.id;
    if (!id || id.startsWith("#")) continue;

    const choices: Choice[] = [];
    for (let n = 1; n <= 4; n++) {
      const label = (row[`choice${n}`] ?? "").trim();
      if (!label) continue;
      choices.push({
        label: label.replace(/\\n/g, "\n"),
        effects: parseEffects(row[`effects${n}`] ?? ""),
        next: (row[`next${n}`] ?? "").trim(),
      });
    }

    events[id] = {
      id,
      title: row.title || id,
      description: (row.description || "").replace(/\\n/g, "\n\n"),
      image: (row.image || "river").trim().toLowerCase(),
      pullquote: (row.pullquote || "").trim() || undefined,
      choices,
    };
  }
  return events;
}

// ---------- ENGINE ----------
export function clampStats(s: Stats): Stats {
  const out = { ...s };
  (Object.keys(out) as StatKey[]).forEach((k) => {
    out[k] = Math.max(0, Math.min(STAT_META[k].max, out[k]));
  });
  return out;
}

export function applyEffects(s: Stats, eff: Partial<Stats>): Stats {
  const out = { ...s };
  (Object.keys(eff) as StatKey[]).forEach((k) => {
    out[k] = (out[k] ?? 0) + (eff[k] ?? 0);
  });
  return clampStats(out);
}

export function pickNextEvent(
  spec: string,
  events: Record<string, Event>,
  recent: string[],
  currentId: string
): string {
  const allIds = Object.keys(events);
  const trimmed = spec.trim();
  let pool: string[];
  if (!trimmed || trimmed === "*" || trimmed.toLowerCase() === "random") {
    pool = allIds.filter((id) => id !== currentId);
  } else if (trimmed.includes("|")) {
    pool = trimmed.split("|").map((s) => s.trim()).filter((s) => s in events);
    if (pool.length === 0) pool = allIds;
  } else if (trimmed in events) {
    return trimmed;
  } else {
    pool = allIds.filter((id) => id !== currentId);
  }
  // prefer events not in recent history
  const fresh = pool.filter((id) => !recent.includes(id));
  const finalPool = fresh.length > 0 ? fresh : pool;
  return finalPool[Math.floor(Math.random() * finalPool.length)] ?? currentId;
}

export type EndGame = { kind: "victory" | "defeat"; title: string; coda: string } | null;

export function checkEndgame(s: Stats, turn: number): EndGame {
  if (s.territory >= 100)
    return { kind: "victory", title: "Champion of the Scramble", coda: "All of Africa, on paper at least, is yours. Brussels raises a statue. The continent does not consent to it." };
  if (s.infamy >= 100)
    return { kind: "defeat", title: "Recalled in Disgrace", coda: "The London papers print your atrocities in serial. Even the Company will not be seen with you." };
  if (s.humanity <= 0)
    return { kind: "defeat", title: "What Remains of You", coda: "There is no record of cruelty you have not signed. Sleep does not come. The mirror is empty." };
  if (s.military <= 0)
    return { kind: "defeat", title: "Overrun", coda: "The villages you burned remembered. Your stations fall in a single week." };
  if (s.gold <= 0)
    return { kind: "defeat", title: "Bankrupt", coda: "The Company calls in its loans. Your concession is sold at auction to a Belgian banker who has never left Antwerp." };
  if (turn >= 25 && s.territory >= 60 && s.humanity >= 50)
    return { kind: "victory", title: "The Reformer's Compromise", coda: "You hold a great concession but governed it like a man and not a ledger. History will be unsure what to make of you." };
  return null;
}