import { db, globalSearch, getProfile, findPokemon, whoDropsItem, itemUses, guides, norm, expandQuery, starCost } from "./pka";
import { BROKES_MAX } from "./brokes";

export const SYSTEM_PROMPT = `Você é o PKA Helper, o assistente oficial de inteligência artificial do PokeAlliance (PKA), treinado com base na Wiki oficial do PokeAlliance e na planilha da comunidade.

Diretrizes e Regras Absolutas:
1. Responda sempre em português do Brasil (pt-BR), de forma amigável, prestativa, direta e bem formatada.
2. Utilize Markdown rico:
   - Use títulos e tópicos em lista (-) para facilitar a leitura.
   - Destaque termos importantes em negrito (**termo**).
   - Use crases (\`comando\`) para comandos e atalhos in-game (ex: \`!up\`, \`!pokestop\`, \`h city\`, \`!buyhouse\`, \`!pokeball "poke\`, \`Ctrl + Tab\`).
   - Use listas estruturadas ou tabelas quando apresentar itens, custos, rotas ou pokémons.
3. Responda com base no CONTEXTO fornecido (que reúne a base da Wiki PKA, tabelas de dados, guias e rotas).
4. Conhecimentos especializados que você domina:
   - Guia de Level Up 1-150 (Pallet Town, Dr. Oliveira 50 Dittos, Saffron sewer 5-10, Cerulean Diglett 10-40, Usina Pikachu 40-50, Dugtrio Earth Stone 50, Usina Raichu/Jolteon 50-80, Electabuzz/Steelix 80-150).
   - Todos os Comandos (Atalhos, Fly, House, Teleport, Combate offensive/defensive, Brokes, Servidor).
   - Sistema de Star Ascension (Cálculo de KK/DD e cópias necessárias por tier).
   - Brokes Máximas por Tier e Taxas de Shiny.
   - Drops de Pokémon, Itens, Localizações e Spawns de Hunt.
   - Counters de NPCs da Rocket e Polícia.
   - Dungeons (requisitos de players, XP, mobs e drops).
   - Times e rotações de Hoenn.
5. Se uma informação específica não estiver no contexto e você não tiver certeza absoluta, diga claramente: "Não encontrei essa informação específica na base atual do PKA." Nunca invente números ou dados fictícios.`;

const STOP = new Set([
  "que", "qual", "quais", "quem", "onde", "como", "quanto", "quantos", "para", "pra", "com", "dos", "das", "uma", "meu",
  "the", "dropa", "dropam", "drop", "drops", "tem", "fica", "faz", "posso", "pega", "pegar", "pego", "sobre", "melhor",
  "diga", "fale", "mostre", "lista", "tudo",
]);

/** Extracts keywords from question */
function extractWords(question: string): string[] {
  return question
    .split(/[^\p{L}\p{N}]+/u)
    .map((w) => norm(w))
    .filter((w) => w.length >= 2 && !STOP.has(w));
}

/** Builds a rich, factual context block from the PKA dataset and wiki for any question. */
export function buildContext(question: string): string {
  const parts: string[] = [];
  const nq = norm(question);
  const words = extractWords(question);

  // 1. LEVEL UP & GUIA DE INICIANTE
  if (
    /level|upar|iniciante|iniciar|comecar|comeco|rota|pallet|usina|diglett|dugtrio|electabuzz|steelix|150|1 a 150/i.test(
      question,
    )
  ) {
    parts.push(
      `GUIA DE LEVEL UP (1-150 WIKI PKA):
- Nível 1-5 (Pallet Town):
  * Fale com Prof. Carvalho (escolha Charmander, Squirtle ou Bulbasaur). Ganhe Mysterious Egg (choca Togepi no lvl 25), Moving Ticket e Starter Pack.
  * Resgate a Starter Box FREE na Store/Market.
  * Fale com Dr. Oliveira no norte do laboratório ('mission' e 'yes') para pegar a task de 50 Dittos (essencial para o futuro Shiny Ditto).
- Opção 1: Rota Rápida & Eficiente:
  * Nível 5-10: Use o Moving Ticket para Saffron City e upe no Bueiro de Saffron.
  * Nível 10-40: Vá para Cerulean, capture um Diglett e cace na Usina Elétrica (sul de Cerulean).
  * Nível 40-50: Cace na Usina de Pikachu (à direita de Saffron).
  * Nível 50: Evolua o Diglett para Dugtrio com 1 Earth Stone.
  * Nível 50-80: Usina Elétrica no 2º andar (Raichu) ou 3º andar (Jolteon).
  * Nível 80-100/150: Subsolo da Usina caçando Electabuzz.
  * Opcional: Equipe Metal Coat no Onix (look: holding Metal Coat) e cace até evoluir automaticamente para Steelix para continuar até o 150.
- Opção 2: Exploração & Tasks:
  * Explore florestas, siga para Pewter, cure no CP e upe com Tasks e Dailys (Daily Kill e Catch são ilimitadas).`,
    );
  }

  // 2. COMANDOS & ATALHOS
  if (
    /comando|atalho|fly|voar|teleport|tp|house|casa|porta|invite|door|buyhouse|houseinfo|pokestop|banco|wallet|walk|uptime|buff|offensive|defensive|revert|tecla|hotkey/i.test(
      question,
    )
  ) {
    parts.push(
      `GUIA DE COMANDOS E ATALHOS (WIKI PKA):
- Atalhos Essenciais:
  * Abrir Mapa Full: Ctrl + Tab
  * Classic View: Ctrl + .
  * Abrir Banco / Wallet: Ctrl + T
  * Poké Stop: !pokestop (ou Ctrl K -> Player Actions -> Pokestop)
  * Andar Automático: !walk
- Mobilidade e Viagem:
  * Subir no Fly: !up (ou hotkey no Ctrl K -> Movements -> Fly Up)
  * Descer no Fly: !down (ou hotkey no Ctrl K -> Movements -> Fly Down)
  * Montar no Fly: Use Order no seu próprio pé (ou configure '#s !up' e '#s !down' na action bar)
  * Teleport para Cidade: h <cidade> (ex: h saffron, h pewter) ou Ctrl + Tab (requer VIP e ter falado com Joy na cidade, CD 30m)
  * Teleport para Casa: h house (ou h house, <nick> para casa de amigo)
- Comandos de Casa (House):
  * Comprar Casa: !buyhouse (Requisitos: Level 200+, VIP ativo e valor do aluguel na carteira em frente à porta)
  * Info e Vencimento do Aluguel: !houseinfo
  * Convidar Membro: !invite <nick>
  * Permissão de Portas: !door
  * Sub-dono (acesso total): !viceowner <nick>
  * Abandonar Casa: !leavehouse
  * Vender Casa: !sellhouse "<nick>
- Combate & Modos:
  * Full Attack: !offensive (ou Ctrl K -> Pokemon -> Offensive)
  * Full Defense: !defensive (ou Ctrl K -> Pokemon -> Defensive)
- Brokes, Ditto & Servidor:
  * Consultar Brokes: !pokeball "<nome do poke>
  * Reverter Transformação do Ditto: !revert
  * Tempo Online: !uptime
  * Buffs Ativos: !buffs`,
    );
  }

  // 3. BROKES MÁXIMAS E SHINY RATES
  if (/broke|brokes|catch|taxa|rate|shiny rate|chance/i.test(question)) {
    parts.push(
      `TABELA DE BROKES MÁXIMAS POR TIER:
${BROKES_MAX.map((b) => `- ${b.tier}: ${b.max} brokes`).join("\n")}
Nota: Consulte a quantidade de brokes do seu pokémon no jogo com o comando \`!pokeball "Nome do Pokemon\` ou em \`Ctrl + T -> Pokemon Brokes\`.

TAXAS DE SHINY (PKA):
- Versão 1: ${db.shinyRates[0]?.rates.map((r) => `${r.tier}: ${r.rate}`).join(" | ") || "n/d"}
- Versão 2: ${db.shinyRates[1]?.rates.map((r) => `${r.tier}: ${r.rate}`).join(" | ") || "n/d"}`,
    );
  }

  // 4. STAR ASCENSION (ESTRELAS)
  if (/star|estrela|estrelar|ascension|subir estrela|custo star|star machine/i.test(question)) {
    const tierMatch = question.match(/t[1-6]|mythic|legendary|ultra rare|super rare/i);
    const targetTier = tierMatch ? tierMatch[0].toUpperCase() : null;

    let starDetails = "";
    if (targetTier) {
      const calc0to5 = starCost(targetTier, 0, 5);
      if (calc0to5) {
        starDetails = `\nCusto para ${targetTier} de 0 a 5 estrelas: ${calc0to5.kk} KK, ${calc0to5.dd} DD e ${calc0to5.pokes} Pokémons extras de sacrifício.`;
      }
    }

    parts.push(
      `SISTEMA DE STAR ASCENSION (ESTRELAS):
- Realizado na Star Machine.
- Exige Pokémon do mesmo Tier como sacrifício + taxas em Diamonds (DD) e KKs.
- Cada nível de estrela dobra a quantidade de pokémons necessários (ex: 5 estrelas = 31 pokémons de sacrifício).${starDetails}
- Tiers disponíveis: Mythic, Legendary, Ultra Rare, Super Rare, T1, T2, T3, T4, T5, T6.`,
    );
  }

  // 5. BOOST RECIPES
  if (/boost|stone|fragment|pedra/i.test(question)) {
    const boostHits = db.boost.slice(0, 8);
    parts.push(
      `SISTEMA DE BOOST:
${boostHits.map((b) => `- Tipo ${b.type}: Fragmento (${b.fragment ?? "n/d"}), Stone (${b.stone ?? "n/d"}), Itens: ${b.items.slice(0, 4).join(", ")}`).join("\n")}`,
    );
  }

  // 6. TIMES DE HOENN
  if (/hoenn|time|rotacao|times/i.test(question)) {
    parts.push(
      `TIMES DE HOENN RECOMENDADOS:
- Metal/Steel: T1 (Shiny Mawile, Shiny Metang, Shiny Smeargle Steel) | Upgrades: SR (Shiny Skarmory, Shiny Aggron), UR (Shiny Metagross), LD (Shiny Scizor).
- Dark/Ghost: T2/T1 (Mightyena, Shiny Persian, Gengar, Shiny Umbreon, Shiny Hitmonchan, Dusknoir) | Upgrades: Shiny Houndoom, Shiny Hydreigon, Shiny Misdreavus, Shiny Dusknoir.
- Fire: T2/T1 (Arcanine, Shiny Typhlosion, Infernape, Shiny Charizard, Shiny Ninetales, Shiny Flareon) | Upgrades: Shiny Infernape, Shiny Arcanine.
- Water: T1/T2 (Shiny Blastoise, Shiny Feraligatr, Shiny Vaporeon, Shiny Politoed, Milotic) | Upgrades: Shiny Sharpedo, Shiny Kingdra.
- Grass: T1/T2 (Tangrowth, Shiny Venusaur, Gogoat, Shiny Meganium, Shiny Victreebel) | Upgrades: Shiny Tangrowth, Shiny Gogoat.
- Electric: T1/T2 (Luxray, Electabuzz, Pachirisu, Shiny Ampharos, Shiny Raichu, Shiny Jolteon) | Upgrades: Shiny Luxray, Shiny Pachirisu.`,
    );
  }

  // 7. POKÉMON MULTIPLOS / ESPECÍFICOS
  const allPokeHits = globalSearch(question, 15).filter((h) => h.kind === "pokemon");
  // Also check direct words
  words.forEach((w) => {
    const found = findPokemon(w);
    if (found && !allPokeHits.some((h) => norm(h.label) === norm(found.name))) {
      allPokeHits.push({ kind: "pokemon", label: found.name, to: `/pokemon/${found.slug}`, score: 80 });
    }
  });

  allPokeHits.slice(0, 3).forEach((poke) => {
    const entry = findPokemon(poke.label);
    if (entry) {
      const p = getProfile(entry);
      parts.push(
        [
          `POKEMON: ${entry.name}`,
          `tier: ${entry.tier ?? "n/d"} | tipo/moveset: ${entry.type ?? "n/d"}`,
          `drops: ${p.drops.join(", ") || "n/d"}`,
          `locais/hunts: ${p.locations.map((l) => `${l.area ?? "?"}${l.link ? ` (${l.link})` : ""}`).join(" | ") || "n/d"}`,
          `tasks (NPCs): ${p.tasks.map((t) => t.npc).join(", ") || "n/d"}`,
          `quantidade de task: ${p.linkedTasks.map((t) => `${t.qtd} (${t.tipo})`).join(", ") || "n/d"}`,
          `medalha: ${p.medal ? `${p.medal.buff}${p.medal.debuff ? ` / debuff ${p.medal.debuff}` : ""}` : "n/d"}`,
          `talentos: ${p.talents.map((t) => `${t.name} - ${t.buff ?? ""}`).join(" | ") || "n/d"}`,
          `dungeons: ${p.dungeons.map((d) => d.name).join(", ") || "n/d"}`,
        ].join("\n"),
      );
    }
  });

  // 8. ITENS
  const itemHits = globalSearch(question, 10).filter((h) => h.kind === "item");
  itemHits.slice(0, 2).forEach((item) => {
    const uses = itemUses(item.label);
    parts.push(
      [
        `ITEM: ${item.label}`,
        `dropado por: ${whoDropsItem(item.label).slice(0, 8).join(", ") || "n/d"}`,
        `usado em boost: ${uses.boost.map((b) => b.type).join(", ") || "n/d"}`,
        `dungeons: ${uses.dungeons.map((d) => d.name).join(", ") || "n/d"}`,
      ].join("\n"),
    );
  });

  // 9. DUNGEONS
  const dgHits = globalSearch(question, 5).filter((h) => h.kind === "dungeon");
  dgHits.slice(0, 2).forEach((dg) => {
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
  });

  // 10. NPCS & COUNTERS
  if (/rocket|policia|police|counter|giovanni|jesse|james|npc/i.test(question)) {
    const npcs = [...db.rocket, ...db.police];
    const matchNpc = npcs.find((n) => nq.includes(norm(n.npc)));
    if (matchNpc) {
      parts.push(`NPC ${matchNpc.npc}: ${matchNpc.members.map((m) => `${m.npcPokemon} -> Counter: ${m.counter}`).join(" | ")}`);
    } else {
      parts.push(`EQUIPES ROCKET & POLÍCIA (COUNTERS):
${npcs.slice(0, 4).map((n) => `NPC ${n.npc}: ${n.members.map((m) => `${m.npcPokemon} -> ${m.counter}`).join(", ")}`).join("\n")}`);
    }
  }

  // 11. FAQ / GUIDES MATCHING
  const scoredGuides = guides
    .map((g) => {
      const keyNorm = norm(g.key);
      const contentNorm = norm(g.content);
      let s = 0;
      if (keyNorm.includes(nq)) s += 60;
      if (contentNorm.includes(nq)) s += 40;
      for (const w of words) {
        if (keyNorm.includes(w)) s += 18;
        if (contentNorm.includes(w)) s += 12;
      }
      return { guide: g, score: s };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  scoredGuides.forEach((x) => parts.push(`GUIA / FAQ (${x.guide.key}):\n${x.guide.content}`));

  return parts.slice(0, 10).join("\n\n---\n\n") || "NENHUM DADO ESPECÍFICO ENCONTRADO NA BASE.";
}

/**
 * Intelligent direct answer generator (works standalone / offline or as high-precision fallback).
 */
export function generateDirectAnswer(question: string): string {
  const q = question.trim();
  const nq = norm(q);

  // Level Up
  if (/level|upar|iniciante|150|rota|pallet|usina|electabuzz|dugtrio/i.test(q)) {
    return `### 🚀 Guia de Level Up (1 ao 150) — PokeAlliance

**1. Nível 1 a 5 (Pallet Town):**
- Fale com o **Professor Carvalho**, digite \`pokemon\` e escolha seu inicial (*Charmander*, *Squirtle* ou *Bulbasaur*).
- Você recebe:
  - 🥚 **Mysterious Egg** (choca um *Togepi* no nível 25);
  - 🎫 **Moving Ticket** (para escolher a cidade de respawn);
  - 🎁 **Starter Pack**.
- Abra a **Store** no topo, vá na aba **Character/Market** e resgate a **Starter Box FREE**.
- Ao norte do laboratório, fale com o **Dr. Oliveira** (\`mission\` e \`yes\`) para pegar a task de **50 Dittos**.

**2. Rota Rápida (Opção 1):**
- **Nível 5-10:** Use o *Moving Ticket* para **Saffron City** e cace no **Bueiro de Saffron**.
- **Nível 10-40:** Vá para **Cerulean**, capture um **Diglett** e cace na **Usina Elétrica** (ao sul de Cerulean).
- **Nível 40-50:** Upe na **Usina de Pikachu** (à direita de Saffron).
- **Nível 50:** Evolua seu Diglett para **Dugtrio** com 1 *Earth Stone*.
- **Nível 50-80:** Cace no **2º andar** (*Raichu*) ou **3º andar** (*Jolteon*) da Usina Elétrica.
- **Nível 80-100/150:** Cace no **subsolo da Usina** enfrentando *Electabuzz*.
- *(Opcional)*: Capture um **Onix**, equipe um **Metal Coat** nele (verifique \`holding Metal Coat\` no comando look) e cace com ele até evoluir automaticamente para **Steelix** para terminar até o 150.`;
  }

  // Comandos
  if (/comando|atalho|fly|house|casa|porta|teleport|tp|pokestop|banco|uptime|buff/i.test(q)) {
    return `### ⌨️ Principais Comandos e Atalhos do PokeAlliance

**🗺️ Navegação e Interface:**
- \`Ctrl + Tab\`: Abrir o **Mapa Full**
- \`Ctrl + .\`: Alternar **Classic View**
- \`Ctrl + T\`: Abrir **Banco / Carteira**
- \`!pokestop\`: Acessar Poké Stop (ou no menu de hotkeys)
- \`!walk\`: Ativar caminhada/voo automático

**🪽 Mobilidade e Teleport:**
- \`!up\` / \`!down\`: Subir e descer no **Fly** (monte usando *Order* no seu próprio pé)
- \`h <cidade>\`: Teleportar para cidade (ex: \`h saffron\`, \`h pewter\`) — *Requer VIP e ter falado com a Joy*
- \`h house\`: Teleportar para sua casa
- \`h house, <nick>\`: Teleportar para a casa de um amigo

**🏘️ Comandos de House (Casa):**
- \`!buyhouse\`: Comprar casa (requer Lv 200+, VIP e dinheiro do aluguel na carteira)
- \`!houseinfo\`: Consultar data de pagamento do aluguel
- \`!invite <nick>\`: Convidar jogador para a casa
- \`!door\`: Habilitar controle de portas
- \`!viceowner <nick>\`: Conceder acesso de sub-dono
- \`!leavehouse\`: Abandonar casa

**⚔️ Combate e Utilidades:**
- \`!offensive\`: Modo Full Attack
- \`!defensive\`: Modo Full Defense
- \`!pokeball "<nome>\`: Consultar histórico de brokes do Pokémon
- \`!revert\`: Reverter a transformação do Ditto
- \`!uptime\`: Tempo de atividade do servidor
- \`!buffs\`: Lista de buffs ativos no personagem`;
  }

  // Brokes
  if (/broke|brokes/i.test(q)) {
    return `### 📊 Tabela de Brokes Máximas por Tier

| Tier | Brokes Máximas |
| :--- | :--- |
| **Mythic** | *Desconhecido* |
| **Legendary** | **22.535** |
| **Ultra Rare** | **9.400** |
| **Super Rare** | **3.500** |
| **T1** | **1.280** |
| **T2** | ~**900** |
| **T3** | ~**700** |
| **T4** | ~**600** |
| **T5** | ~**400** |
| **T6** | ~**200** |

💡 *Dica:* Para consultar as brokes de qualquer Pokémon no jogo, use o comando \`!pokeball "Nome do Poke\` (ex: \`!pokeball "Shiny Charizard\`) ou acesse \`Ctrl + T -> Pokemon Brokes\`.`;
  }

  // Star Ascension
  if (/star|estrela|estrelar|ascension/i.test(q)) {
    return `### ⭐ Sistema de Star Ascension (Estrelas)

A **Star Machine** permite elevar o nível de estrelas (de 1★ a 5★) de um Pokémon para aumentar significativamente seus atributos.

**Como funciona:**
- É necessário sacrificar **Pokémon do mesmo Tier** e pagar taxas em **Diamonds (DD)** e **KKs**.
- A cada nível de estrela, a quantidade necessária de Pokémon de sacrifício dobra:
  - 1★: 1 Pokémon extra
  - 2★: 3 Pokémons extras
  - 3★: 7 Pokémons extras
  - 4★: 15 Pokémons extras
  - 5★: 31 Pokémons extras

*Você pode simular os custos exatos por tier na aba **Star** do PKA Helper!*`;
  }

  // Pokemon Search
  const pokeMatch = globalSearch(q, 5).find((h) => h.kind === "pokemon");
  if (pokeMatch) {
    const entry = findPokemon(pokeMatch.label);
    if (entry) {
      const p = getProfile(entry);
      return `### 🐾 ${entry.name} (${entry.tier ?? "Tier não informado"})

- **Tipo / Moveset:** ${entry.type ?? "Não informado"}
- **Drops:** ${p.drops.length ? p.drops.join(", ") : "Nenhum drop cadastrado"}
- **Locais / Hunts:** ${p.locations.length ? p.locations.map((l) => `${l.area ?? "Área Desconhecida"}`).join(" • ") : "Sem localização registrada"}
- **Tasks:** ${p.tasks.length ? p.tasks.map((t) => t.npc).join(", ") : "Nenhuma task direta"}
- **Medalha:** ${p.medal ? `${p.medal.buff}${p.medal.debuff ? ` (Debuff: ${p.medal.debuff})` : ""}` : "Sem medalha registrada"}
- **Dungeons:** ${p.dungeons.length ? p.dungeons.map((d) => d.name).join(", ") : "Nenhuma dungeon vinculada"}`;
    }
  }

  // Fallback Guide Search
  const guideMatch = guides.find((g) => nq.includes(norm(g.key)) || norm(g.key).includes(nq));
  if (guideMatch) {
    return `### 📚 ${guideMatch.key.toUpperCase()}

${guideMatch.content}

${guideMatch.links.length ? `🔗 **Links úteis:**\n${guideMatch.links.map((l) => `- [${l}](${l})`).join("\n")}` : ""}`;
  }

  return `Não encontrei informações exatas sobre essa dúvida na base atual do PokeAlliance. Experimente perguntar sobre:
- **Level Up:** *"Como upar do 1 ao 100?"*
- **Comandos:** *"Quais os comandos de fly e house?"*
- **Brokes:** *"Qual a broke máxima de T1 ou Lendário?"*
- **Pokémon:** *"O que o Gengar dropa?"* ou *"Onde acho Dratini?"*`;
}
