import { db, globalSearch, getProfile, findPokemon, whoDropsItem, itemUses, guides, norm } from "./pka";

/** Builds a compact, factual context block from the PKA dataset for a user question. */
const STOP = new Set([
  "que","qual","quais","quem","onde","como","quanto","quantos","para","pra","com","dos","das","uma","meu",
  "the","dropa","dropam","drop","drops","tem","fica","faz","posso","pega","pegar","pego","sobre","melhor",
]);

/** Searches the dataset per meaningful word, so full sentences still match. */
function searchTokens(question: string) {
  const words = question.split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 2 && !STOP.has(norm(w)));
  const all = [...globalSearch(question, 8)];
  words.forEach((w) => all.push(...globalSearch(w, 6)));
  const seen = new Set<string>();
  return all
    .sort((a, b) => b.score - a.score)
    .filter((h) => (seen.has(h.to) ? false : (seen.add(h.to), true)))
    .slice(0, 14);
}

export function buildContext(question: string): string {
  const parts: string[] = [];
  const hits = searchTokens(question);

  const poke = hits.find((h) => h.kind === "pokemon");
  if (poke) {
    const entry = findPokemon(poke.label);
    if (entry) {
      const p = getProfile(entry);
      parts.push(
        [
          `POKEMON: ${entry.name}`,
          `tier: ${entry.tier ?? "n/d"} | tipo/moveset: ${entry.type ?? "n/d"}`,
          `drops: ${p.drops.join(", ") || "n/d"}`,
          `locais: ${p.locations.map((l) => `${l.area ?? "?"}${l.link ? ` (${l.link})` : ""}`).join(" | ") || "n/d"}`,
          `tasks (NPCs): ${p.tasks.map((t) => t.npc).join(", ") || "n/d"}`,
          `quantidade de task: ${p.linkedTasks.map((t) => `${t.qtd} (${t.tipo})`).join(", ") || "n/d"}`,
          `medalha: ${p.medal ? `${p.medal.buff}${p.medal.debuff ? ` / debuff ${p.medal.debuff}` : ""}` : "n/d"}`,
          `talentos: ${p.talents.map((t) => `${t.name} - ${t.buff ?? ""}`).join(" | ") || "n/d"}`,
          `dungeons: ${p.dungeons.map((d) => d.name).join(", ") || "n/d"}`,
        ].join("\n"),
      );
    }
  }

  const item = hits.find((h) => h.kind === "item");
  if (item) {
    const uses = itemUses(item.label);
    parts.push(
      [
        `ITEM: ${item.label}`,
        `dropado por: ${whoDropsItem(item.label).join(", ") || "n/d"}`,
        `usado em boost: ${uses.boost.map((b) => b.type).join(", ") || "n/d"}`,
        `dungeons: ${uses.dungeons.map((d) => d.name).join(", ") || "n/d"}`,
      ].join("\n"),
    );
  }

  const dg = hits.find((h) => h.kind === "dungeon");
  if (dg) {
    const d = db.dungeons.find((x) => x.name === dg.label);
    if (d) {
      parts.push(
        [
          `DUNGEON: ${d.name}`,
          `cidade: ${d.city ?? "n/d"} | mobs: ${d.mobs ?? "n/d"} | xp: ${d.xp ?? "n/d"} | players: ${d.players ?? "n/d"}`,
          `hunts: ${d.hunts.join(", ")}`,
          `itens: ${d.items.join(", ") || "n/d"}`,
          `local: ${d.location ?? "n/d"}`,
        ].join("\n"),
      );
    }
  }

  const nq = norm(question);
  const words = nq.split(" ").filter((w) => w.length >= 3 && !STOP.has(w));
  const scoredGuides = guides
    .map((g) => {
      const keyNorm = norm(g.key);
      const contentNorm = norm(g.content);
      let s = 0;
      if (keyNorm.includes(nq)) s += 50;
      if (contentNorm.includes(nq)) s += 40;
      for (const w of words) {
        if (keyNorm.includes(w)) s += 15;
        if (contentNorm.includes(w)) s += 10;
      }
      return { guide: g, score: s };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  scoredGuides.forEach((x) => parts.push(`GUIA / FAQ (${x.guide.key}): ${x.guide.content}`));

  const talents = hits.filter((h) => h.kind === "talent").slice(0, 5);
  talents.forEach((t) => {
    const row = db.talents.find((x) => x.name === t.label);
    if (row) parts.push(`TALENTO: ${row.name} | origem: ${row.source ?? "n/d"} | qtd: ${row.quantity ?? "n/d"} | buff: ${row.buff ?? "n/d"}`);
  });

  const npc = hits.find((h) => h.kind === "npc");
  if (npc) {
    const team = [...db.rocket, ...db.police].find((x) => norm(x.npc) === norm(npc.label));
    if (team) parts.push(`NPC ${team.npc}: ${team.members.map((m) => `${m.npcPokemon} -> counter ${m.counter}`).join(" | ")}`);
    const withNpc = db.tasks.filter((t) => t.npcs.some((n) => norm(n.npc) === norm(npc.label))).map((t) => t.pokemon);
    if (withNpc.length) parts.push(`NPC ${npc.label} pede tasks de: ${withNpc.join(", ")}`);
  }

  return parts.slice(0, 12).join("\n\n") || "NENHUM DADO RELACIONADO ENCONTRADO NA BASE.";
}

export const SYSTEM_PROMPT = `Você é o PKA Helper, assistente do jogo PokeAlliance (PKA).
Regras absolutas:
- Responda SOMENTE com base no CONTEXTO fornecido, que vem da planilha oficial da comunidade.
- Se a informação não estiver no contexto, diga claramente: "Não encontrei essa informação na base atual do PKA."
- Nunca invente drops, locais, tasks, custos ou nomes.
- Responda em português do Brasil, de forma curta, direta e organizada (listas quando fizer sentido).
- Inclua links do contexto quando existirem.`;
