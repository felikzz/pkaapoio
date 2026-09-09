import { db, norm, slugify, type LinkedTask } from "./pka";
import { TYPE_ADVANTAGES, POKEMON_TYPES_INFO } from "./matchup";

export type PokelogCategory = "starter" | "wild" | "hoenn" | "rare";

export interface PokelogItem {
  id: string;
  pokemon: string;
  slug: string;
  qtd: number;
  rawQtd: number | null;
  tipo: string | null;
  category: PokelogCategory;
  categoryLabel: string;
  isLevel100Plus: boolean;
  tier: string;
  elementTypes: string[];
  weaknesses: string[];
  hunt: string | null;
  drops: string[];
  stage: number;
  stageTitle: string;
  stageDesc: string;
  difficulty: "Fácil" | "Médio" | "Demorado" | "Desafiador";
  tips: string;
}

// Helper to determine weaknesses based on Pokemon types
function getWeaknesses(types: string[]): string[] {
  const weakSet = new Set<string>();
  
  // Find which attacking types are effective against any of this pokemon's defensive types
  Object.entries(TYPE_ADVANTAGES).forEach(([attackType, strongAgainst]) => {
    if (types.some((defType) => strongAgainst.includes(defType))) {
      weakSet.add(attackType);
    }
  });

  return Array.from(weakSet);
}

// Build tier lookup
const tierMap = new Map<string, { tier: string; moveset: string | null }>();
db.tiers.forEach((t) => tierMap.set(norm(t.pokemon), t));

// Build drops lookup
const dropsMap = new Map<string, string[]>();
db.drops.forEach((d) => dropsMap.set(norm(d.pokemon), d.items));

// Filter out invalid/header entries
const rawTasks = db.linkedTasks.filter(
  (t) =>
    t.pokemon &&
    !t.pokemon.startsWith("Restantes") &&
    !t.pokemon.includes("(Wild)") &&
    !t.pokemon.includes("(Hoenn)") &&
    !t.pokemon.includes("(Tubos)"),
);

export const POKELOG_ITEMS: PokelogItem[] = rawTasks.map((t: LinkedTask) => {
  const name = t.pokemon.trim();
  const nName = norm(name);
  const tierInfo = tierMap.get(nName);
  const tier = tierInfo?.tier || "T3";
  
  // Parse moveset/types if available
  let elementTypes: string[] = [];
  if (tierInfo?.moveset) {
    elementTypes = tierInfo.moveset
      .split("/")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // Determine category & default quantity
  let category: PokelogCategory = "wild";
  let defaultQtd = 10000;
  const isRareType = ["super rare", "ultra rare", "legendary", "mythic"].includes(
    (t.tipo || "").toLowerCase(),
  );

  if (t.qtd && t.qtd <= 800) {
    category = "starter";
    defaultQtd = t.qtd;
  } else if (
    t.tipo === "Hoenn" ||
    t.hunt === "Hoenn" ||
    (t.killsPerHour && t.killsPerHour.includes("Hoenn"))
  ) {
    category = "hoenn";
    defaultQtd = t.qtd || 4000;
  } else if (isRareType || t.hunt === "Tubos" || (t.killsPerHour && t.killsPerHour.includes("Tubos"))) {
    category = "rare";
    defaultQtd = t.qtd || 4000;
  } else {
    category = "wild";
    defaultQtd = t.qtd || 10000;
  }

  const qtd = t.qtd || defaultQtd;
  const isLevel100Plus = category !== "starter" || qtd >= 400;

  // Category labels
  const categoryLabels: Record<PokelogCategory, string> = {
    starter: "Pré-100 (Iniciante / Rápido)",
    wild: "Wild (10.000 Kills)",
    hoenn: "Hoenn (4.000 Kills)",
    rare: "Raro / Lendário / Tubos",
  };

  // Weaknesses
  const weaknesses = getWeaknesses(elementTypes);

  // Assign Stage for Recommended Progression Path
  let stage = 2;
  let stageTitle = "Fase 2: Wilds de Kanto & Johto (10.000 Kills)";
  let stageDesc = "Farm clássico de 10.000 kills para liberar slots e bônus cruciais.";
  let difficulty: "Fácil" | "Médio" | "Demorado" | "Desafiador" = "Demorado";

  if (category === "starter") {
    stage = 1;
    stageTitle = "Fase 1: Aquecimento & Pré-100";
    stageDesc = "Pokelogs rápidos (30 a 800 kills). Faça primeiro para pegar recompensas iniciais.";
    difficulty = "Fácil";
  } else if (category === "wild") {
    stage = 2;
    stageTitle = "Fase 2: Wilds de Kanto & Johto (10.000 Kills)";
    stageDesc = "Farm clássico de 10.000 kills para liberar slots e bônus cruciais.";
    difficulty = "Demorado";
  } else if (category === "hoenn") {
    stage = 3;
    stageTitle = "Fase 3: Pokelogs de Hoenn (4k)";
    stageDesc = "Pokémons da região de Hoenn com meta de 4.000 kills.";
    difficulty = "Médio";
  } else if (category === "rare") {
    stage = 4;
    stageTitle = "Fase 4: Endgame, Tubos & Raros";
    stageDesc = "Pokelogs de pokémons raros, lendários e míticos.";
    difficulty = "Desafiador";
  }

  // Generate tactical tip
  let tips = "";
  if (weaknesses.length > 0) {
    const primaryWeak = weaknesses.slice(0, 2).join(" ou ");
    tips = `Use pokémons do elemento ${primaryWeak} para causar 2.0x de dano.`;
  } else {
    tips = "Foque em dano em área (AoE) para limpar os spawns mais rápido.";
  }

  return {
    id: slugify(name),
    pokemon: name,
    slug: slugify(name),
    qtd,
    rawQtd: t.qtd,
    tipo: t.tipo,
    category,
    categoryLabel: categoryLabels[category],
    isLevel100Plus,
    tier,
    elementTypes,
    weaknesses,
    hunt: t.hunt && t.hunt.startsWith("http") ? t.hunt : null,
    drops: dropsMap.get(nName) || [],
    stage,
    stageTitle,
    stageDesc,
    difficulty,
    tips,
  };
});

// Sort Pokelogs in recommended progression order
export const POKELOGS_RECOMMENDED_ORDER = [...POKELOG_ITEMS].sort((a, b) => {
  if (a.stage !== b.stage) return a.stage - b.stage;
  if (a.qtd !== b.qtd) return a.qtd - b.qtd;
  return a.pokemon.localeCompare(b.pokemon);
});

export const POKELOG_STAGES = [
  {
    stage: 1,
    title: "Fase 1: Aquecimento & Pré-100 (30 a 800 kills)",
    badge: "Iniciante",
    desc: "Pokelogs rápidos com metas pequenas (30, 60, 100, 250, 400, 800). Ideal para quem está começando ou quer liberar primeiros tokens sem esforço.",
    icon: "🚀",
    color: "from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400",
  },
  {
    stage: 2,
    title: "Fase 2: Wilds de Kanto & Johto (10.000 kills)",
    badge: "Wild 10k",
    desc: "A espinha dorsal dos Pokelogs de 10.000 kills. Recompensas fundamentais para fortalecer a conta, acumular tokens e obter bônus permanentes.",
    icon: "🌲",
    color: "from-emerald-500/20 to-green-500/10 border-emerald-500/30 text-emerald-400",
  },
  {
    stage: 3,
    title: "Fase 3: Rota Hoenn (4.000 kills)",
    badge: "Hoenn 4k",
    desc: "Pokémons da região Hoenn. Meta mais acessível de 4.000 kills com ótimos drops de pedras e itens de evolução.",
    icon: "🌋",
    color: "from-orange-500/20 to-red-500/10 border-orange-500/30 text-orange-400",
  },
  {
    stage: 4,
    title: "Fase 4: Endgame, Tubos & Raros",
    badge: "Endgame",
    desc: "Pokelogs de Pokémons Super Raros, Ultra Raros, Lendários e Míticos. O auge da progressão para colecionadores e top players.",
    icon: "👑",
    color: "from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400",
  },
];
