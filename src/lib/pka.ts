import raw from "@/data/pka.json";

/* ---------------- Types ---------------- */
export type DropRow = { pokemon: string; items: string[] };
export type LocationRow = {
  pokemon: string;
  entries: { area: string; link: string | null; note: string | null }[];
};
export type TaskRow = { pokemon: string; npcs: { npc: string; link: string | null }[] };
export type LinkedTask = {
  qtd: number | null;
  pokemon: string;
  tipo: string | null;
  hunt: string | null;
  killsPerHour: string | null;
};
export type HazardTask = { npc: string; link: string | null; task: string | null };
export type TierRow = { pokemon: string; tier: string; moveset: string | null };
export type MedalRow = { pokemon: string; buff: string; debuff: string | null };
export type Talent = {
  name: string;
  source: string | null;
  quantity: number | null;
  category: string | null;
  slot: string | null;
  buff: string | null;
};
export type Dungeon = {
  name: string;
  location: string | null;
  hunts: string[];
  city: string | null;
  players: number | null;
  mobs: number | null;
  xp: number | null;
  time: string | null;
  xpPerHour: number | null;
  mobList?: string[];
  items: string[];
};
export type DungeonRun = {
  key: string;
  players: number | null;
  mobs: number | null;
  xp: number | null;
  time: string | null;
  mobList: string[];
  xpPerHour: number | null;
  items: string[];
};
export type BoostRow = { type: string; fragment: string | null; stone: string | null; items: string[] };
export type StarLevel = { tier: string; steps: { from: number; to: number; dd: number; kk: number }[] };
export type Gym = { city: string; task1: string | null; task2: string | null; dungeon: string | null };
export type NpcTeam = { npc: string; members: { npcPokemon: string; counter: string }[] };
export type FaqRow = { key: string; content: string };

type Dataset = {
  drops: DropRow[];
  locations: LocationRow[];
  tasks: TaskRow[];
  linkedTasks: LinkedTask[];
  hazardTasks: HazardTask[];
  tiers: TierRow[];
  medals: MedalRow[];
  talents: Talent[];
  dungeons: Dungeon[];
  dungeonRuns: DungeonRun[];
  boost: BoostRow[];
  starLevels: StarLevel[];
  starNote: string;
  brokes: { tier: string; maxBroke: string | number }[];
  brokesNote: string;
  gyms: Gym[];
  gymNote: string;
  damage: { tiers: string[]; roles: { role: string; values: string[] }[] };
  runes: { stat: string; levels: { level: string; points: number | null; bonus: string }[] }[];
  rocket: NpcTeam[];
  police: NpcTeam[];
  npcTeamNote: string;
  shinyRates: { version: string; rates: { tier: string; rate: string }[] }[];
  faq: FaqRow[];
  porygon: { step: string; content: string }[];
  bh: string[];
};

export const db = raw as unknown as Dataset;

/* ---------------- Normalization ---------------- */
export function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(s: string): string {
  return norm(s).replace(/ /g, "-");
}

const ABBR: Record<string, string> = {
  sh: "shiny",
  shiny: "shiny",
  poke: "pokemon",
  pokes: "pokemon",
  dg: "dungeon",
  dgs: "dungeon",
  lvl: "level",
  dex: "pokedex",
  kk: "kk",
  dd: "diamonds",
};

export function expandQuery(q: string): string {
  return norm(q)
    .split(" ")
    .map((w) => ABBR[w] ?? w)
    .join(" ");
}

/** Levenshtein distance (bounded, cheap) */
function lev(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 3) return 99;
  const dp: number[] = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0] ?? 0;
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j] ?? 0;
      dp[j] = Math.min((dp[j] ?? 0) + 1, (dp[j - 1] ?? 0) + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length] ?? 99;
}


/* ---------------- Indexes ---------------- */
const dropsByPokemon = new Map<string, DropRow>();
db.drops.forEach((d) => dropsByPokemon.set(norm(d.pokemon), d));

const dropsByItem = new Map<string, string[]>();
db.drops.forEach((d) =>
  d.items.forEach((i) => {
    const k = norm(i);
    if (!dropsByItem.has(k)) dropsByItem.set(k, []);
    dropsByItem.get(k)!.push(d.pokemon);
  }),
);

const locByPokemon = new Map<string, LocationRow>();
db.locations.forEach((l) => locByPokemon.set(norm(l.pokemon), l));

const tasksByPokemon = new Map<string, TaskRow>();
db.tasks.forEach((t) => tasksByPokemon.set(norm(t.pokemon), t));

const tierByPokemon = new Map<string, TierRow>();
db.tiers.forEach((t) => tierByPokemon.set(norm(t.pokemon), t));

const medalByPokemon = new Map<string, MedalRow>();
db.medals.forEach((m) => medalByPokemon.set(norm(m.pokemon), m));

/** Canonical pokemon list assembled from every sheet. */
export type PokemonEntry = {
  name: string;
  slug: string;
  tier: string | null;
  type: string | null;
  shiny: boolean;
};

const pokemonMap = new Map<string, PokemonEntry>();
function addPokemon(name: string) {
  const key = norm(name);
  if (!key || pokemonMap.has(key)) return;
  const t = tierByPokemon.get(key);
  pokemonMap.set(key, {
    name,
    slug: slugify(name),
    tier: t?.tier ?? null,
    type: t?.moveset ?? null,
    shiny: key.startsWith("shiny "),
  });
}
db.tiers.forEach((t) => addPokemon(t.pokemon));
db.drops.forEach((d) => addPokemon(d.pokemon));
db.locations.forEach((l) => addPokemon(l.pokemon));
db.tasks.forEach((t) => addPokemon(t.pokemon));
db.medals.forEach((m) => addPokemon(m.pokemon));

export const pokemonList: PokemonEntry[] = [...pokemonMap.values()].sort((a, b) =>
  a.name.localeCompare(b.name),
);
const pokemonBySlug = new Map(pokemonList.map((p) => [p.slug, p]));

export const itemList: string[] = [...dropsByItem.keys()].sort();
const itemBySlug = new Map(itemList.map((i) => [slugify(i), i]));

export const dungeonBySlug = new Map(db.dungeons.map((d) => [slugify(d.name), d]));

export const tierOrder = ["Mythic", "Legendary", "Ultra Rare", "Super Rare", "T1", "T2", "T3", "T4", "T5", "T6", "T7"];

/* ---------------- Lookups ---------------- */
export function findPokemon(name: string): PokemonEntry | null {
  const k = norm(expandQuery(name));
  return pokemonMap.get(k) ?? pokemonMap.get(norm(name)) ?? null;
}

export function getPokemonBySlug(slug: string): PokemonEntry | null {
  return pokemonBySlug.get(slug) ?? null;
}

export function getItemBySlug(slug: string): string | null {
  return itemBySlug.get(slug) ?? null;
}

export type PokemonProfile = {
  entry: PokemonEntry;
  drops: string[];
  locations: LocationRow["entries"];
  tasks: TaskRow["npcs"];
  linkedTasks: LinkedTask[];
  medal: MedalRow | null;
  talents: Talent[];
  dungeons: Dungeon[];
  boostTypes: BoostRow[];
};

export function getProfile(entry: PokemonEntry): PokemonProfile {
  const k = norm(entry.name);
  return {
    entry,
    drops: dropsByPokemon.get(k)?.items ?? [],
    locations: locByPokemon.get(k)?.entries ?? [],
    tasks: tasksByPokemon.get(k)?.npcs ?? [],
    linkedTasks: db.linkedTasks.filter((t) => norm(t.pokemon) === k),
    medal: medalByPokemon.get(k) ?? null,
    talents: db.talents.filter((t) => t.source && norm(t.source) === k),
    dungeons: db.dungeons.filter(
      (d) => d.hunts.some((h) => norm(h) === k) || (d.mobList ?? []).some((m) => norm(m) === k),
    ),
    boostTypes: db.boost.filter((b) => b.items.some((i) => norm(i).includes(k))),
  };
}

export function whoDropsItem(item: string): string[] {
  return dropsByItem.get(norm(item)) ?? [];
}

export function itemUses(item: string) {
  const k = norm(item);
  return {
    boost: db.boost.filter((b) => norm(b.fragment ?? "") === k || norm(b.stone ?? "") === k || b.items.some((i) => norm(i) === k)),
    dungeons: db.dungeons.filter((d) => d.items.some((i) => norm(i) === k)),
    talents: db.talents.filter((t) => norm(t.name) === k),
  };
}

/* ---------------- Search ---------------- */
export type SearchHit = {
  kind: "pokemon" | "item" | "dungeon" | "talent" | "npc" | "guide" | "location" | "task";
  label: string;
  sub?: string | undefined;
  to: string;
  score: number;
};

function score(target: string, q: string): number {
  const t = norm(target);
  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  if (t.includes(q)) return 60;
  const d = lev(t, q);
  if (d <= 2 && q.length >= 4) return 40 - d * 5;
  return 0;
}

export function globalSearch(query: string, limit = 40): SearchHit[] {
  const q = expandQuery(query);
  if (q.length < 2) return [];
  const hits: SearchHit[] = [];

  pokemonList.forEach((p) => {
    const s = score(p.name, q);
    if (s) hits.push({ kind: "pokemon", label: p.name, sub: p.tier ?? undefined, to: `/pokemon/${p.slug}`, score: s + 10 });
  });
  itemList.forEach((i) => {
    const s = score(i, q);
    if (s) hits.push({ kind: "item", label: i, sub: `${whoDropsItem(i).length} Pokémon dropam`, to: `/item/${slugify(i)}`, score: s + 5 });
  });
  db.dungeons.forEach((d) => {
    const s = score(d.name, q);
    if (s) hits.push({ kind: "dungeon", label: d.name, sub: d.city ?? undefined, to: `/dungeon/${slugify(d.name)}`, score: s });
  });
  db.talents.forEach((t) => {
    const s = Math.max(score(t.name, q), t.buff ? score(t.buff, q) * 0.6 : 0);
    if (s) hits.push({ kind: "talent", label: t.name, sub: t.source ?? undefined, to: `/talentos?q=${encodeURIComponent(t.name)}`, score: s - 5 });
  });
  const npcs = new Set<string>();
  db.tasks.forEach((t) => t.npcs.forEach((n) => npcs.add(n.npc)));
  db.hazardTasks.forEach((h) => npcs.add(h.npc));
  npcs.forEach((n) => {
    const s = score(n, q);
    if (s) hits.push({ kind: "npc", label: n, sub: "NPC de task", to: `/tasks?q=${encodeURIComponent(n)}`, score: s });
  });
  db.faq.forEach((f) => {
    const s = Math.max(score(f.key, q), score(f.content.slice(0, 120), q) * 0.5);
    if (s) hits.push({ kind: "guide", label: f.key, sub: "Guia", to: `/guias?q=${encodeURIComponent(f.key)}`, score: s - 5 });
  });

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function suggest(query: string, limit = 8): SearchHit[] {
  return globalSearch(query, limit);
}

/* ---------------- Star calculator (derived from the sheet) ---------------- */
export function starCost(tier: string, from: number, to: number) {
  const row = db.starLevels.find((s) => norm(s.tier) === norm(tier));
  if (!row) return null;
  const cum = (n: number) => {
    let dd = 0;
    let kk = 0;
    for (let i = 0; i < n; i++) {
      const step = row.steps.find((s) => s.to === i + 1);
      if (!step) return null;
      dd = 2 * dd + step.dd;
      kk = 2 * kk + step.kk;
    }
    return { dd, kk, pokes: Math.pow(2, n) };
  };
  const a = cum(from);
  const b = cum(to);
  if (!a || !b) return null;
  return {
    dd: Math.round((b.dd - a.dd) * 100) / 100,
    kk: Math.round((b.kk - a.kk) * 100) / 100,
    pokes: b.pokes - a.pokes,
    steps: row.steps.filter((s) => s.to > from && s.to <= to),
  };
}

/* ---------------- Guides ---------------- */
export type Guide = { key: string; content: string; category: string; links: string[] };

const CATEGORY_RULES: [RegExp, string][] = [
  [/(star|estrel)/i, "⭐ Star"],
  [/boost/i, "⚡ Boost"],
  [/(task|hazard)/i, "🎯 Tasks"],
  [/(dg|dungeon|raid)/i, "⚔️ Dungeons"],
  [/(mapa|ilha|local|cidade|fly)/i, "🗺️ Mapa"],
  [/(up|iniciante|começ|primeiros|level|lvl)/i, "🚀 Começando"],
  [/(shiny|catch|broke|ball|poke|dex)/i, "🐾 Pokémon"],
  [/(clan|guild|torneio|sistema|merit|rank|market|leil)/i, "🏆 Sistemas"],
];

export const guides: Guide[] = db.faq.map((f) => {
  const cat = CATEGORY_RULES.find(([re]) => re.test(f.key) || re.test(f.content))?.[1] ?? "📚 Outros";
  const links = f.content.match(/https?:\/\/[^\s,]+/g) ?? [];
  return { ...f, category: cat, links };
});

export const guideCategories = [...new Set(guides.map((g) => g.category))];

export const DB_UPDATED_AT = "16/08/2026";
