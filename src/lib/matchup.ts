import { db, norm, pokemonList, type PokemonEntry } from "./pka";

export type PokeType =
  | "Normal"
  | "Fire"
  | "Water"
  | "Grass"
  | "Electric"
  | "Ice"
  | "Fighting"
  | "Poison"
  | "Ground"
  | "Flying"
  | "Psychic"
  | "Bug"
  | "Rock"
  | "Ghost"
  | "Dragon"
  | "Dark"
  | "Steel"
  | "Fairy";

export const TYPE_ADVANTAGES: Record<string, string[]> = {
  Fire: ["Grass", "Ice", "Bug", "Steel"],
  Water: ["Fire", "Ground", "Rock"],
  Grass: ["Water", "Ground", "Rock"],
  Electric: ["Water", "Flying"],
  Ice: ["Grass", "Ground", "Flying", "Dragon"],
  Fighting: ["Normal", "Ice", "Rock", "Dark", "Steel"],
  Poison: ["Grass", "Fairy"],
  Ground: ["Fire", "Electric", "Poison", "Rock", "Steel"],
  Flying: ["Grass", "Fighting", "Bug"],
  Psychic: ["Fighting", "Poison"],
  Bug: ["Grass", "Psychic", "Dark"],
  Rock: ["Fire", "Ice", "Flying", "Bug"],
  Ghost: ["Psychic", "Ghost"],
  Dragon: ["Dragon"],
  Dark: ["Psychic", "Ghost"],
  Steel: ["Ice", "Rock", "Fairy"],
  Fairy: ["Fighting", "Dragon", "Dark"],
  Normal: [],
};

export const TYPE_RESISTANCES: Record<string, string[]> = {
  Fire: ["Fire", "Grass", "Ice", "Bug", "Steel", "Fairy"],
  Water: ["Fire", "Water", "Ice", "Steel"],
  Grass: ["Water", "Electric", "Grass", "Ground"],
  Electric: ["Electric", "Flying", "Steel"],
  Ice: ["Ice"],
  Fighting: ["Bug", "Rock", "Dark"],
  Poison: ["Grass", "Fighting", "Poison", "Bug", "Fairy"],
  Ground: ["Electric", "Poison", "Rock"],
  Flying: ["Grass", "Fighting", "Bug", "Ground"],
  Psychic: ["Fighting", "Psychic"],
  Bug: ["Grass", "Fighting", "Ground"],
  Rock: ["Normal", "Fire", "Poison", "Flying"],
  Ghost: ["Normal", "Fighting", "Poison", "Bug"],
  Dragon: ["Fire", "Water", "Grass", "Electric"],
  Dark: ["Ghost", "Dark", "Psychic"],
  Steel: ["Normal", "Grass", "Ice", "Flying", "Psychic", "Bug", "Rock", "Dragon", "Steel", "Fairy", "Poison"],
  Fairy: ["Fighting", "Bug", "Dark", "Dragon"],
  Normal: ["Ghost"],
};

/** Calculates effectiveness of an attacking type against a defending type */
export function getEffectiveness(attackerType: string | null, defenderType: string | null): number {
  if (!attackerType || !defenderType) return 1.0;
  const atk = attackerType.trim();
  const def = defenderType.trim();

  if (TYPE_ADVANTAGES[atk]?.some((t) => t.toLowerCase() === def.toLowerCase())) {
    return 2.0;
  }
  if (TYPE_RESISTANCES[def]?.some((t) => t.toLowerCase() === atk.toLowerCase())) {
    return 0.5;
  }
  return 1.0;
}

export type HuntAreaInfo = {
  rawArea: string;
  link: string | null;
  note: string | null;
  kind: "normal" | "wildscape" | "hoenn_tubos";
  label: string;
  minLevel: number;
};

export type HuntRecommendation = {
  pokemon: string;
  tier: string | null;
  type: string | null;
  areas: HuntAreaInfo[];
  counterPokemon: string;
  counterType: string;
  multiplier: number;
  estimatedLevel: string;
  hasNormal: boolean;
  hasWildscape: boolean;
  hasHoennTubos: boolean;
  valuableDrops: string[];
};

export const TIER_LEVEL_MAP: Record<string, string> = {
  T7: "1 - 25",
  T6: "20 - 40",
  T5: "40 - 65",
  T4: "65 - 90",
  T3: "80 - 110",
  T2: "100 - 130",
  T1: "120 - 150",
  SR: "130 - 150",
  UR: "140 - 150+",
  Legendary: "150+",
  Mythic: "150+",
};

export function parseAreaInfo(area: string, link: string | null, note: string | null, tier: string): HuntAreaInfo {
  const normArea = norm(area);
  if (normArea.includes("350") || normArea.includes("hoenn") || normArea.includes("tubos")) {
    return {
      rawArea: area,
      link,
      note,
      kind: "hoenn_tubos",
      label: "Hoenn / Tubos (Lvl 350+)",
      minLevel: 350,
    };
  }
  if (normArea.includes("wildscape") || normArea.includes("150")) {
    return {
      rawArea: area,
      link,
      note,
      kind: "wildscape",
      label: "Wildscape (Lvl 150+)",
      minLevel: 150,
    };
  }
  return {
    rawArea: area,
    link,
    note,
    kind: "normal",
    label: "Hunt Normal (Mapa Aberto)",
    minLevel: 1,
  };
}

export function findBestHuntsForTeam(teamPokemonNames: string[]): HuntRecommendation[] {
  if (!teamPokemonNames.length) return [];

  const teamEntries = teamPokemonNames
    .map((name) => pokemonList.find((p) => norm(p.name) === norm(name)))
    .filter(Boolean) as PokemonEntry[];

  if (!teamEntries.length) return [];

  const recommendations: HuntRecommendation[] = [];
  const seenTargets = new Set<string>();

  // Scan all locations in database
  for (const loc of db.locations) {
    const targetKey = norm(loc.pokemon);
    if (seenTargets.has(targetKey)) continue;

    const targetEntry = pokemonList.find((p) => norm(p.name) === targetKey);
    const targetType = targetEntry?.type ?? null;
    const targetTier = targetEntry?.tier ?? "T4";

    let bestMultiplier = 1.0;
    let bestCounter: PokemonEntry | null = null;

    for (const playerPoke of teamEntries) {
      const pType = playerPoke.type ?? "Normal";
      const eff = getEffectiveness(pType, targetType);
      if (eff > bestMultiplier) {
        bestMultiplier = eff;
        bestCounter = playerPoke;
      }
    }

    if (bestMultiplier >= 1.5 && bestCounter && loc.entries.length > 0) {
      seenTargets.add(targetKey);
      const drops = db.drops.find((d) => norm(d.pokemon) === targetKey)?.items ?? [];
      const valuableDrops = drops.filter((i) => /stone|orb|shard|tail|feather|horn|claw|gosme/i.test(i)).slice(0, 3);

      const parsedAreas = loc.entries.map((e) => parseAreaInfo(e.area, e.link, e.note, targetTier));
      const hasNormal = parsedAreas.some((a) => a.kind === "normal");
      const hasWildscape = parsedAreas.some((a) => a.kind === "wildscape");
      const hasHoennTubos = parsedAreas.some((a) => a.kind === "hoenn_tubos");

      // Accurate Level Estimation based on actual available hunt areas
      let estimatedLevel = TIER_LEVEL_MAP[targetTier] ?? "Lvl 50+";
      if (!hasNormal && hasHoennTubos && !hasWildscape) {
        estimatedLevel = "350+ (Hoenn/Tubos)";
      } else if (!hasNormal && hasWildscape) {
        estimatedLevel = "150+ (Wildscape)";
      } else if (hasNormal && (hasWildscape || hasHoennTubos)) {
        estimatedLevel = `${TIER_LEVEL_MAP[targetTier] ?? "Lvl 50+"} (Normal)`;
      }

      recommendations.push({
        pokemon: loc.pokemon,
        tier: targetTier,
        type: targetType,
        areas: parsedAreas,
        counterPokemon: bestCounter.name,
        counterType: bestCounter.type ?? "Normal",
        multiplier: bestMultiplier,
        estimatedLevel,
        hasNormal,
        hasWildscape,
        hasHoennTubos,
        valuableDrops,
      });
    }
  }

  // Sort by highest multiplier, then by pokemon name
  return recommendations.sort((a, b) => {
    if (b.multiplier !== a.multiplier) return b.multiplier - a.multiplier;
    return a.pokemon.localeCompare(b.pokemon);
  });
}
