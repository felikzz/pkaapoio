import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Panel, ExternalLinkChip, Chip, PokemonIcon } from "@/components/pka/ui";
import { pokemonList, norm } from "@/lib/pka";
import {
  Flame,
  Compass,
  CheckCircle2,
  Coins,
  ChevronRight,
  Filter,
  Search,
  X,
  Crosshair,
  Target,
  Trophy,
  MapPin,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/rota-titan")({
  head: () => ({
    meta: [
      { title: "Guia & Rota New Server Titan (1-150+) — PKA Helper" },
      {
        name: "description",
        content:
          "Guia completo de rush e nivelamento do zero para o Novo Servidor Titan do PokeAlliance: passo a passo da 1ª à 6ª hunt com alternativas anti-lotação e dicas exclusivas.",
      },
      { property: "og:title", content: "Guia & Rota New Server Titan — PKA Helper" },
      {
        property: "og:description",
        content:
          "Guia passo a passo de level up no New Server Titan: opções de 1ª hunt, 2ª hunt, 3ª hunt e alternativas para fugir dos respawns lotados.",
      },
    ],
  }),
  component: TitanServerGuide,
});

/* =========================================================================
   TYPES & PRESET DEFINITIONS
   ========================================================================= */

type StepOption = {
  id: string;
  name: string;
  targetMobs: string[];
  location: string;
  mapLink?: string;
  crowdLevel: "high" | "med" | "low";
  crowdLabel: string;
  category: "meta" | "alt_peaceful" | "alt_farm" | "alt_secret";
  categoryLabel: string;
  description: string;
  proTip: string;
  advantages: string[];
  dropsOfInterest?: string[];
  reqs?: string;
};

type ProgressionStep = {
  stepNumber: number;
  levelRange: string;
  title: string;
  subtitle: string;
  keyGoal: string;
  options: StepOption[];
};

type StarterPreset = {
  id: string;
  name: string;
  icon: string;
  element: string;
  elementLabel: string;
  colorClass: string;
  evolutionLine: string;
  overview: string;
  rushPlaystyle: string;
  steps: ProgressionStep[];
};

/* ---------------- PRESETS DE INICIAIS & ROTAS ---------------- */

const STARTER_PRESETS: StarterPreset[] = [
  {
    id: "charmander",
    name: "Charmander",
    icon: "Charmander",
    element: "Fire",
    elementLabel: "Fogo",
    colorClass: "from-amber-500/20 to-orange-500/10 border-orange-500/30 text-amber-400",
    evolutionLine: "Charmander ➔ Charmeleon (Lvl 40) ➔ Charizard (Lvl 85)",
    overview:
      "Dano explosivo em área e controle contra Insetos, Plantas, Gelo e Aço. Permite fugir da disputadíssima rota de Terra/Elétrico explorando florestas e cavernas congeladas vazias.",
    rushPlaystyle: "Ofensivo / Queima de Spawns Rápidos / Fuga de Respawns Tradicionais",
    steps: [
      {
        stepNumber: 1,
        levelRange: "Lvl 1 - 15",
        title: "1ª Hunt — Saída do Laboratório & Primeiros Níveis",
        subtitle: "Garanta nível rápido para liberar ataques de dano em área",
        keyGoal: "Pegar Lvl 10-15 rapidamente, desbloquear Ember/Fire Fang e pegar Starter Box na Store.",
        options: [
          {
            id: "ch-s1-meta",
            name: "Bueiro de Saffron & Arredores",
            targetMobs: ["Rattata", "Pidgey", "Zubat"],
            location: "Centro de Saffron (descer pelo bueiro)",
            mapLink: "https://imgur.com/a/ZyszZOZ",
            crowdLevel: "high",
            crowdLabel: "🔴 Hiper Lotada (New Server)",
            category: "meta",
            categoryLabel: "1ª Opção: Meta Principal",
            description: "Respawn clássico com respawn acelerado no bueiro central de Saffron.",
            proTip: "Se tiver mais de 4 pessoas disputando os mesmos Rattatas, NÃO PERCA TEMPO! Mude imediatamente para Viridian Forest.",
            advantages: ["Perto de Saffron PZ", "Respawn rápido"],
            dropsOfInterest: ["Rat Tail", "Feather"],
          },
          {
            id: "ch-s1-alt1",
            name: "Floresta de Viridian (Insetos 2.0x Dano)",
            targetMobs: ["Caterpie", "Weedle", "Metapod", "Kakuna"],
            location: "Entre Viridian e Pewter (Viridian Forest)",
            mapLink: "https://imgur.com/a/8dwCyhm",
            crowdLevel: "low",
            crowdLabel: "🟢 Muito Tranquila (Anti-Muvuca)",
            category: "alt_peaceful",
            categoryLabel: "2ª Opção: Alternativa A (Vazia & 2.0x Dano)",
            description: "Insetos sofrem 2.0x de dano de Fogo do Charmander. Spawns abundantes e quase sem disputa nos primeiros minutos!",
            proTip: "Mate Metapods e Kakunas em 1 ou 2 hits com Ember. O ganho de XP/hora aqui supera o bueiro lotado por 3x.",
            advantages: ["2.0x Dano Super Efetivo", "Spawns espalhados por todo o mapa", "Zero disputa"],
            dropsOfInterest: ["Bug Gosme", "Potions"],
          },
          {
            id: "ch-s1-alt2",
            name: "Grama Oeste de Cerulean & Pewter Sul",
            targetMobs: ["Oddish", "Bellsprout", "Paras"],
            location: "Ao sul de Pewter ou Rota 24 (Acima de Cerulean)",
            crowdLevel: "low",
            crowdLabel: "🟢 Tranquila",
            category: "alt_farm",
            categoryLabel: "3ª Opção: Alternativa B (Farm de Quests)",
            description: "Plantas que dropam folhas e sementes úteis para tasks e entregas de NPCs.",
            proTip: "Capture 1 Bellsprout ou 1 Oddish caso queira suporte com Sleep Powder.",
            advantages: ["2.0x Dano Super Efetivo", "Itens de Task"],
            dropsOfInterest: ["Leaves", "Seed"],
          },
        ],
      },
      {
        stepNumber: 2,
        levelRange: "Lvl 15 - 35",
        title: "2ª Hunt — Transição & Primeiras Capturas Chave",
        subtitle: "Suba de nível derrotando plantas e insetos evoluídos",
        keyGoal: "Alcançar Lvl 35+, capturar Pokémon de suporte e acumular dinheiro com loots.",
        options: [
          {
            id: "ch-s2-meta",
            name: "Digletts de Cerulean / Vermilion",
            targetMobs: ["Diglett"],
            location: "Leste de Vermilion ou Sul de Cerulean",
            mapLink: "https://imgur.com/a/8dwCyhm",
            crowdLevel: "high",
            crowdLabel: "🔴 Hiper Disputada",
            category: "meta",
            categoryLabel: "1ª Opção: Meta Convencional",
            description: "O spot de Diglett tradicional onde 90% do servidor tentará capturar ou upar.",
            proTip: "Apenas passe aqui para capturar 1 Diglett com Pokéball se desejar; para upar Charmander, as florestas abaixo são infinitamente melhores!",
            advantages: ["Captura de Diglett", "Earth Stone chance"],
          },
          {
            id: "ch-s2-alt1",
            name: "Rota 24/25 Cerulean & Floresta de Celadon",
            targetMobs: ["Oddish", "Gloom", "Bellsprout", "Weepinbell", "Venonat"],
            location: "Ponte ao Norte de Cerulean e floresta à esquerda de Celadon",
            crowdLevel: "low",
            crowdLabel: "🟢 Tranquila & 2.0x Dano",
            category: "alt_peaceful",
            categoryLabel: "2ª Opção: Alternativa A (Rush Fogo)",
            description: "Área vasta com múltiplos andares de arbustos. Seu Charmander/Charmeleon derrete Gloom e Weepinbell em segundos.",
            proTip: "Use Fire Spin e Flame Burst para puxar de 3 a 4 monstros juntos.",
            advantages: ["2.0x Dano Super Efetivo", "XP em dobro sem perder tempo com KS", "Drop de Leaf Stones"],
            dropsOfInterest: ["Leaf Stone", "Bag of Pollen"],
          },
          {
            id: "ch-s2-alt2",
            name: "Caverna Mt. Moon Subsolo 1 (Parasect Spot)",
            targetMobs: ["Paras", "Parasect", "Zubat"],
            location: "Interior do Mt. Moon (Entrada Rota 3 / Pewter Leste)",
            crowdLevel: "med",
            crowdLabel: "🟡 Moderada",
            category: "alt_farm",
            categoryLabel: "3ª Opção: Alternativa B (Parasect Farm)",
            description: "Paras e Parasect sofrem 2.0x de dano por serem Inseto/Planta. Ótimo drop de cogumelos.",
            proTip: "Cuidado com o Spore do Parasect, mantenha distância e use ataques de longe.",
            advantages: ["2.0x Dano", "Bom valor em gold dos loots"],
            dropsOfInterest: ["Mushroom", "Big Mushroom"],
          },
        ],
      },
      {
        stepNumber: 3,
        levelRange: "Lvl 35 - 55",
        title: "3ª Hunt — Consolidação & Evolução Charmeleon",
        subtitle: "Evolua para Charmeleon (Lvl 40) e aumente o raio dos ataques em área",
        keyGoal: "Evoluir para Charmeleon, acumular gold para potes/balls e preparar o time mid-game.",
        options: [
          {
            id: "ch-s3-meta",
            name: "Usina de Pikachu de Saffron",
            targetMobs: ["Pikachu", "Voltorb", "Magnemite"],
            location: "Leste de Saffron / Caminho da Usina",
            mapLink: "https://imgur.com/a/eMjPulX",
            crowdLevel: "high",
            crowdLabel: "🔴 Super Lotada",
            category: "meta",
            categoryLabel: "1ª Opção: Meta Principal",
            description: "Usina clássica de Pikachu onde todo o servidor corre.",
            proTip: "Charmeleon sofre dano neutro aqui. Se estiver lotado, as rotas de Tangela e Celadon dão o triplo de XP.",
            advantages: ["Thunder Stone drop", "Perto da cidade"],
          },
          {
            id: "ch-s3-alt1",
            name: "Tangela Spot (Sul de Pallet / Rota 21)",
            targetMobs: ["Tangela"],
            location: "Descendo a costa de Pallet Town",
            crowdLevel: "low",
            crowdLabel: "🟢 Excelente (Vazio & 2.0x)",
            category: "alt_peaceful",
            categoryLabel: "2ª Opção: Alternativa A (Segredo Anti-KS)",
            description: "Respawn denso de Tangela pura. Elas sofrem 2.0x de dano de Fogo, não têm ataques elétricos e dropam ótimos loots.",
            proTip: "Use Fire Blast / Flamethrower para limpar as salas em instantes.",
            advantages: ["2.0x Dano Super Efetivo", "Praticamente ninguém vai no início", "Muitos spawns agrupados"],
            dropsOfInterest: ["Vine", "Leaf Stone"],
          },
          {
            id: "ch-s3-alt2",
            name: "Pokémon Tower de Lavender (Fantasmas)",
            targetMobs: ["Gastly", "Haunter"],
            location: "Torre de Lavender (Andares 2 a 4)",
            crowdLevel: "med",
            crowdLabel: "🟡 Moderada",
            category: "alt_farm",
            categoryLabel: "3ª Opção: Alternativa B (Ghost Farm)",
            description: "Fantasmas com alta taxa de XP e chances de dropar Darkness Stone e itens de talentos.",
            proTip: "Charmeleon bate forte com ataques de fogo que não sofrem redução de tipo Normal.",
            advantages: ["Alta XP base", "Darkness Stone"],
            dropsOfInterest: ["Ghost Essence", "Darkness Stone"],
          },
        ],
      },
      {
        stepNumber: 4,
        levelRange: "Lvl 55 - 80",
        title: "4ª Hunt — Mid-Game Acelerado & Safari Zone",
        subtitle: "Explore áreas de alta densidade sem disputar a Usina Elétrica",
        keyGoal: "Pegar Lvl 80-85 para evoluir seu Charizard e dominar os ares!",
        options: [
          {
            id: "ch-s4-meta",
            name: "Andar 2 e 3 da Usina (Raichu & Jolteon)",
            targetMobs: ["Raichu", "Jolteon"],
            location: "Usina Elétrica (Andares Superiores)",
            mapLink: "https://imgur.com/a/tVt9b2v",
            crowdLevel: "high",
            crowdLabel: "🔴 Muito Concorrida",
            category: "meta",
            categoryLabel: "1ª Opção: Meta Usina",
            description: "Local tradicional de rush com Raichu e Jolteon.",
            proTip: "Charmeleon pode tomar muito dano aqui se não tiver cura rápida.",
            advantages: ["XP Alta", "Thunder Stone"],
          },
          {
            id: "ch-s4-alt1",
            name: "Fuchsia Safari Zone (Exeggcute, Scyther, Pinsir)",
            targetMobs: ["Exeggcute", "Exeggutor", "Scyther", "Pinsir", "Tangela"],
            location: "Norte de Fuchsia City (Safari Zone)",
            crowdLevel: "low",
            crowdLabel: "🟢 Paraíso do Fogo (2.0x Dano)",
            category: "alt_peaceful",
            categoryLabel: "2ª Opção: Alternativa A (Melhor XP/h)",
            description: "Todos os monstros do Safari Zone (Inseto e Planta) sofrem 2.0x de dano massivo de Fogo. A área é gigante e comporta vários jogadores sem KS.",
            proTip: "Com Charmeleon ou Charizard recém-evoluído, você limpa os grupos de Scyther e Pinsir sem gastar potions.",
            advantages: ["2.0x Dano em quase todos os mobs", "Mapa enorme", "Drops caros de Scyther Tail e Pinsir Horn"],
            dropsOfInterest: ["Scyther Tail", "Pinsir Horn", "Leaves", "Bag of Pollen"],
          },
          {
            id: "ch-s4-alt2",
            name: "Seafoam Island 1F/2F (Gelo & Jynx)",
            targetMobs: ["Jynx", "Seel", "Dewgong"],
            location: "Ilhas Seafoam (Entre Fuchsia e Cinnabar)",
            crowdLevel: "low",
            crowdLabel: "🟢 Tranquila (Gelo 2.0x)",
            category: "alt_farm",
            categoryLabel: "3ª Opção: Alternativa B (Gelo Farm)",
            description: "Jynx e Pokémon de Gelo sofrem 2.0x de Fogo. Excelente fonte de Ice Stones e XP limpa.",
            proTip: "Cuidado ao descer nos andares mais profundos para não puxar Dewgong de água pura.",
            advantages: ["2.0x Dano contra Gelo", "Ice Stone drop"],
            dropsOfInterest: ["Ice Stone", "Snowball"],
          },
        ],
      },
      {
        stepNumber: 5,
        levelRange: "Lvl 80 - 110",
        title: "5ª Hunt — Charizard Desperto & High Tier Farm",
        subtitle: "Com Charizard no time, cace monstros de alto nível sem concorrência",
        keyGoal: "Alcançar Lvl 110+, acumular pedras de evolução e iniciar as Daily Missions Hard.",
        options: [
          {
            id: "ch-s5-meta",
            name: "Subsolo da Usina Elétrica (Electabuzz)",
            targetMobs: ["Electabuzz"],
            location: "Subsolo da Usina Elétrica",
            mapLink: "https://imgur.com/a/lx2xnEu",
            crowdLevel: "high",
            crowdLabel: "🔴 O Ponto Mais Lotado do Titan!",
            category: "meta",
            categoryLabel: "1ª Opção: Meta Tradicional",
            description: "Onde 80% dos jogadores estarão amontoados disputando cada Electabuzz que nasce.",
            proTip: "Evite essa hunt nas primeiras 72 horas do servidor novo se não quiser perder horas com KS!",
            advantages: ["Alta XP", "Thunder Stone"],
          },
          {
            id: "ch-s5-alt1",
            name: "Seafoam Deep (Jynx, Piloswine, Articuno Outskirts)",
            targetMobs: ["Jynx", "Piloswine", "Cloyster"],
            location: "Andares inferiores das Ilhas Seafoam",
            crowdLevel: "low",
            crowdLabel: "🟢 2.0x Dano & Quase Vazio",
            category: "alt_peaceful",
            categoryLabel: "2ª Opção: Alternativa A (Rota Suprema de Fogo)",
            description: "Jynx e Piloswine (Gelo/Terra) derretem instantaneamente com Fire Blast e Inferno do Charizard. Spawns rápidos e XP equivalente à Usina sem ninguém atrapalhando.",
            proTip: "Piloswine tem fraqueza dupla e dá XP altíssima!",
            advantages: ["2.0x Dano Super Efetivo", "Zero KS nas primeiras 48h", "Drops de Ice Stone"],
            dropsOfInterest: ["Ice Stone", "Enigma Stone", "Fur"],
          },
          {
            id: "ch-s5-alt2",
            name: "Floresta dos Exeggutors & Vileplumes",
            targetMobs: ["Exeggutor", "Vileplume", "Victreebel"],
            location: "Arredores de Fuchsia e Ilhas Sevii 1",
            crowdLevel: "low",
            crowdLabel: "🟢 Tranquila",
            category: "alt_farm",
            categoryLabel: "3ª Opção: Alternativa B (Drops de Talentos)",
            description: "Monstros tier 3 e tier 2 de Planta que fornecem loots essenciais para talentos e medalhas.",
            proTip: "Use ataques em cone e área do Charizard para solar packs de 4 a 5 monstros.",
            advantages: ["2.0x Dano", "Loots raros para subir talentos"],
            dropsOfInterest: ["Leaf Stone", "Bag of Pollen", "Psychic Herb"],
          },
        ],
      },
      {
        stepNumber: 6,
        levelRange: "Lvl 110 - 150+",
        title: "6ª Hunt — Rumo ao Wildscape & Hoenn",
        subtitle: "Finalize o rush inicial e prepare-se para o conteúdo de endgame (Lvl 150)",
        keyGoal: "Chegar ao Lvl 150, desbloquear o Wildscape e farmar Arcane Shards nas Dungeons Diárias.",
        options: [
          {
            id: "ch-s6-meta",
            name: "Cinnabar Volcano Deep & Magmar Lair",
            targetMobs: ["Magmar", "Typhlosion", "Charizard"],
            location: "Profundezas do Vulcão de Cinnabar",
            crowdLevel: "med",
            crowdLabel: "🟡 Moderada a Alta",
            category: "meta",
            categoryLabel: "1ª Opção: Meta Volcano",
            description: "Hunt pesada de fogo para rush final até o 150.",
            proTip: "Como o Charizard também é Fogo/Voador, o dano recebido é reduzido.",
            advantages: ["XP massiva", "Magmarizers e Fire Stones"],
          },
          {
            id: "ch-s6-alt1",
            name: "Victory Road (Aço & Gelo Spawns)",
            targetMobs: ["Skarmory", "Forretress", "Steelix", "Scizor"],
            location: "Caminho para a Liga Pokémon (Victory Road)",
            crowdLevel: "low",
            crowdLabel: "🟢 Muito Tranquila (2.0x Dano)",
            category: "alt_peaceful",
            categoryLabel: "2ª Opção: Alternativa A (Aço 2.0x Dano)",
            description: "Tipos Aço e Inseto/Aço sofrem dano quadruplicado ou dobrado de Fogo. XP absurda e hunt espaçosa.",
            proTip: "Scizor e Forretress tomam 4.0x de dano de Fogo! Um Fire Blast costuma ser suficiente para abatê-los.",
            advantages: ["2.0x e 4.0x Dano", "Metal Coat chance", "XP rápida de monstro Tier 2/1"],
            dropsOfInterest: ["Metal Coat", "Hard Stone", "Iron Ball"],
          },
          {
            id: "ch-s6-alt2",
            name: "Dungeons Diárias (Easy / Medium / Hard) & Tasks",
            targetMobs: ["Dungeon Bosses", "Daily Task Mobs"],
            location: "Dungeons espalhadas pelo mapa (usar Arcane Shards)",
            crowdLevel: "low",
            crowdLabel: "🟢 Instanciado (Zero KS)",
            category: "alt_farm",
            categoryLabel: "3ª Opção: Alternativa B (Instância Particular)",
            description: "As dungeons são instanciadas! Você ganha centenas de milhares de XP garantida sem nenhum jogador do servidor competindo.",
            proTip: "Guarde todos os seus Arcane Shards das Daily Missions para abrir Dungeons quando o mapa aberto estiver lotado.",
            advantages: ["100% Livre de KS", "XP Burst de 200k a 500k por run", "Recompensas em itens raros"],
            dropsOfInterest: ["Arcane Essence", "Diamonds", "Tokens"],
          },
        ],
      },
    ],
  },

  /* ---------------- SQUIRTLE / ÁGUA & SURF RUSH ---------------- */
  {
    id: "squirtle",
    name: "Squirtle",
    icon: "Squirtle",
    element: "Water",
    elementLabel: "Água & Surf",
    colorClass: "from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400",
    evolutionLine: "Squirtle ➔ Wartortle (Lvl 40) ➔ Blastoise (Lvl 85)",
    overview:
      "Controle de grupo com jatos d'água e vantagem de 2.0x de dano contra Fogo, Terra e Pedra. Ganha mobilidade aquática com Surf e acessa ilhas e cavernas onde jogadores a pé não chegam.",
    rushPlaystyle: "Controle / Exploração Aquática / Domínio de Pedreiras e Vulcões",
    steps: [
      {
        stepNumber: 1,
        levelRange: "Lvl 1 - 15",
        title: "1ª Hunt — Saída de Pallet & Primeira Pedreira",
        subtitle: "Use a vantagem de Água contra os primeiros Pokémon de Pedra e Terra",
        keyGoal: "Chegar ao Lvl 15, aprender Bubble/Water Gun e garantir o Starter Pack.",
        options: [
          {
            id: "sq-s1-meta",
            name: "Bueiro de Saffron",
            targetMobs: ["Rattata", "Zubat"],
            location: "Centro de Saffron",
            mapLink: "https://imgur.com/a/ZyszZOZ",
            crowdLevel: "high",
            crowdLabel: "🔴 Hiper Lotada",
            category: "meta",
            categoryLabel: "1ª Opção: Meta Principal",
            description: "Respawn tradicional rápido de Saffron.",
            proTip: "Se estiver cheio, vá direto para as pedreiras de Pewter ou Rota 4.",
            advantages: ["Perto de Saffron PZ"],
          },
          {
            id: "sq-s1-alt1",
            name: "Pedreira de Pewter & Rota 4 (2.0x Dano)",
            targetMobs: ["Geodude", "Sandshrew"],
            location: "Saída leste de Pewter / Entrada do Mt. Moon",
            crowdLevel: "low",
            crowdLabel: "🟢 Tranquila & 2.0x Dano",
            category: "alt_peaceful",
            categoryLabel: "2ª Opção: Alternativa A (Pedra/Terra 2.0x)",
            description: "Geodudes e Sandshrews tomam 2.0x de dano de Water Gun. Morrem em 1 hit e quase ninguém caça aqui no início!",
            proTip: "Você sobe do 1 ao 15 aqui em menos de 10 minutos sem disputar monstro.",
            advantages: ["2.0x Dano Super Efetivo", "Pouca gente", "Drop de Stone Orb"],
            dropsOfInterest: ["Stone Orb", "Small Stone"],
          },
          {
            id: "sq-s1-alt2",
            name: "Rota 22 & Arredores de Viridian",
            targetMobs: ["Mankey", "Spearow", "Nidoran"],
            location: "À esquerda de Viridian City",
            crowdLevel: "low",
            crowdLabel: "🟢 Tranquila",
            category: "alt_farm",
            categoryLabel: "3ª Opção: Alternativa B",
            description: "Caminho alternativo seguro para farm de XP e pequenas capturas.",
            proTip: "Capture 1 Mankey se quiser um bom Lutador no seu time secundário.",
            advantages: ["XP constante", "Captura de lutador"],
          },
        ],
      },
      {
        stepNumber: 2,
        levelRange: "Lvl 15 - 35",
        title: "2ª Hunt — Cavernas de Pedra & Vulcões Iniciais",
        subtitle: "Dobre o dano em Geodudes, Gravelers e Pokémons de Fogo",
        keyGoal: "Alcançar Lvl 35+, capturar Onix ou Geodude e juntar Earth Stones.",
        options: [
          {
            id: "sq-s2-meta",
            name: "Digletts de Cerulean",
            targetMobs: ["Diglett"],
            location: "Leste de Vermilion / Cerulean Sul",
            crowdLevel: "high",
            crowdLabel: "🔴 Muito Lotada",
            category: "meta",
            categoryLabel: "1ª Opção: Meta Convencional",
            description: "Onde todo mundo tenta rushar.",
            proTip: "Squirtle mata Diglett rápido com Water Gun, mas o KS aqui é brutal no primeiro dia.",
            advantages: ["Earth Stone"],
          },
          {
            id: "sq-s2-alt1",
            name: "Mt. Moon Subsolo 1 & 2 (Geodude, Graveler, Onix)",
            targetMobs: ["Geodude", "Graveler", "Onix"],
            location: "Interior do Mt. Moon",
            crowdLevel: "low",
            crowdLabel: "🟢 Ótima XP (2.0x Dano)",
            category: "alt_peaceful",
            categoryLabel: "2ª Opção: Alternativa A (Caverna Anti-KS)",
            description: "Pedras e Terrestres sofrem 2.0x ou 4.0x de dano de Água. O Mt. Moon tem vários andares vazios.",
            proTip: "Graveler e Onix dão muito mais XP do que Digletts simples.",
            advantages: ["2.0x Dano", "Multi-andares", "Hard Stone & Earth Stone"],
            dropsOfInterest: ["Hard Stone", "Earth Stone", "Horn"],
          },
          {
            id: "sq-s2-alt2",
            name: "Cinnabar Praia & Entrada do Vulcão",
            targetMobs: ["Growlithe", "Vulpix", "Ponyta"],
            location: "Ilha de Cinnabar (Chegar de barco em Pallet)",
            crowdLevel: "low",
            crowdLabel: "🟢 Muito Vazia & 2.0x",
            category: "alt_farm",
            categoryLabel: "3ª Opção: Alternativa B (Fogo 2.0x)",
            description: "Pegue o barco para Cinnabar e cace os monstros de Fogo na entrada. 2.0x de dano com água!",
            proTip: "Excelente para conseguir Fire Stones logo nas primeiras horas.",
            advantages: ["2.0x Dano", "Ilha isolada com poucos novatos", "Fire Stone drop"],
            dropsOfInterest: ["Fire Stone", "Ruby"],
          },
        ],
      },
      {
        stepNumber: 3,
        levelRange: "Lvl 35 - 55",
        title: "3ª Hunt — Wartortle & Invasão do Vulcão",
        subtitle: "Evolua para Wartortle (Lvl 40) e arrase nos andares de Fogo e Rocha",
        keyGoal: "Evoluir para Wartortle, desbloquear Water Pulse/Surf e acumular gold.",
        options: [
          {
            id: "sq-s3-meta",
            name: "Usina de Pikachu",
            targetMobs: ["Pikachu", "Voltorb"],
            location: "Leste de Saffron",
            crowdLevel: "high",
            crowdLabel: "🔴 Perigosa & Lotada",
            category: "meta",
            categoryLabel: "1ª Opção: Meta (Não Recomendada p/ Água)",
            description: "A Usina é elétrica, então seu Wartortle toma 2.0x de dano aqui!",
            proTip: "Como jogador de Squirtle, FUGIR da Usina é a decisão mais inteligente do servidor.",
            advantages: ["Apenas se tiver Pokémon de Terra secundário"],
          },
          {
            id: "sq-s3-alt1",
            name: "Cinnabar Vulcão 1F & 2F (Magmar, Ponyta, Rapidash)",
            targetMobs: ["Magmar", "Growlithe", "Rapidash", "Vulpix"],
            location: "Interior do Vulcão de Cinnabar",
            crowdLevel: "low",
            crowdLabel: "🟢 Perfeito para Água (2.0x Dano)",
            category: "alt_peaceful",
            categoryLabel: "2ª Opção: Alternativa A (Paraíso do Wartortle)",
            description: "Monstros de Fogo sofrem 2.0x de dano de todos os seus golpes. Spawns cheios e respawn rápido.",
            proTip: "Você sobe do 35 ao 55 aqui duas vezes mais rápido do que quem está sofrendo na Usina lotada.",
            advantages: ["2.0x Dano Super Efetivo", "Resistência natural a ataques de Fogo", "Fire Stones"],
            dropsOfInterest: ["Fire Stone", "Magma Box", "Ruby"],
          },
          {
            id: "sq-s3-alt2",
            name: "Rock Tunnel Subsolo (Graveler, Onix, Machoke)",
            targetMobs: ["Graveler", "Onix", "Rhyhorn"],
            location: "Rock Tunnel (Entre Cerulean e Lavender)",
            crowdLevel: "low",
            crowdLabel: "🟢 Tranquila",
            category: "alt_farm",
            categoryLabel: "3ª Opção: Alternativa B (Terra & Rocha)",
            description: "Caverna espaçosa com muitos monstros de Pedra que caem fácil com Water Pulse.",
            proTip: "Excelente para juntar drops de Onix e Rhyhorn.",
            advantages: ["2.0x Dano", "Muitas salas"],
            dropsOfInterest: ["Hard Stone", "Earth Stone"],
          },
        ],
      },
      {
        stepNumber: 4,
        levelRange: "Lvl 55 - 80",
        title: "4ª Hunt — Surf & Vulcões Profundos",
        subtitle: "Use a habilidade Surf para caçar em ilhas secretas e vulcões",
        keyGoal: "Pegar Lvl 80-85 para evoluir seu Blastoise com Hydro Pump!",
        options: [
          {
            id: "sq-s4-meta",
            name: "Usina Andar 2/3",
            targetMobs: ["Raichu", "Jolteon"],
            location: "Usina Elétrica",
            crowdLevel: "high",
            crowdLabel: "🔴 Desvantagem de Tipo & Lotada",
            category: "meta",
            categoryLabel: "1ª Opção: Meta Geral",
            description: "Desvantagem total para time de água.",
            proTip: "Evite.",
            advantages: ["Nenhuma para Squirtle"],
          },
          {
            id: "sq-s4-alt1",
            name: "Cinnabar Vulcão 3F (Magmar & Arcanine)",
            targetMobs: ["Magmar", "Arcanine", "Ninetales", "Rapidash"],
            location: "Andares fundos do Vulcão de Cinnabar",
            crowdLevel: "low",
            crowdLabel: "🟢 2.0x Dano & Quase Vazia",
            category: "alt_peaceful",
            categoryLabel: "2ª Opção: Alternativa A (Melhor Rota)",
            description: "Os monstros de Fogo do vulcão dão XP gigante e morrem facilmente para os golpes de água do Wartortle.",
            proTip: "Use Surf para entrar nas cavernas pelas costas de Cinnabar se o portal principal estiver movimentado.",
            advantages: ["2.0x Dano", "Fire Stones para vender por muito gold no início do server"],
            dropsOfInterest: ["Fire Stone", "Magmarizer Fragment", "Tail"],
          },
          {
            id: "sq-s4-alt2",
            name: "Rhydon & Golem Mountain (Pedra/Terra)",
            targetMobs: ["Rhydon", "Golem", "Sandslash"],
            location: "Montanhas próximas à Rota 10 / Rock Tunnel Leste",
            crowdLevel: "low",
            crowdLabel: "🟢 Muito Tranquila",
            category: "alt_farm",
            categoryLabel: "3ª Opção: Alternativa B",
            description: "Monstros com fraqueza quadruplicada (Pedra + Terra) tomam dano colossal de água!",
            proTip: "Golems e Rhydons são lentos, você pode caçá-los correndo e atirando de longe sem tomar dano.",
            advantages: ["4.0x Dano em mobs Pedra/Terra", "XP pesada", "Hard Stones"],
            dropsOfInterest: ["Hard Stone", "Horn", "Earth Stone"],
          },
        ],
      },
      {
        stepNumber: 5,
        levelRange: "Lvl 80 - 110",
        title: "5ª Hunt — Blastoise Desperto & Charizard Valley",
        subtitle: "Com Blastoise e Hydro Pump / Surf, domine os maiores monstros de Fogo",
        keyGoal: "Alcançar Lvl 110+, solar chefes de fogo e farmar Fire Stones para enriquecer no Titan.",
        options: [
          {
            id: "sq-s5-meta",
            name: "Subsolo da Usina (Electabuzz)",
            targetMobs: ["Electabuzz"],
            location: "Subsolo Usina",
            crowdLevel: "high",
            crowdLabel: "🔴 Impraticável p/ Água & Lotada",
            category: "meta",
            categoryLabel: "1ª Opção: Meta Usina",
            description: "Totalmente desfavorável para Blastoise.",
            proTip: "Deixe a Usina para quem escolheu Diglett e vá reinar nos vulcões vazios!",
            advantages: ["Nenhuma"],
          },
          {
            id: "sq-s5-alt1",
            name: "Charizard Valley & Cinnabar Deep (Fogo Pesado)",
            targetMobs: ["Charizard", "Magmar", "Typhlosion", "Arcanine"],
            location: "Charizard Valley (Acesso Sevii / Cinnabar)",
            crowdLevel: "low",
            crowdLabel: "🟢 2.0x Dano & XP Absurda",
            category: "alt_peaceful",
            categoryLabel: "2ª Opção: Alternativa A (Rush Supremo de Água)",
            description: "A melhor hunt do jogo para Blastoise. Hydro Pump e Surf causam 2.0x de dano e limpam salas inteiras de Charizard e Magmar em 2 rotações de skill.",
            proTip: "Enquanto 50 pessoas disputam Electabuzz, você pega 2x mais XP caçando aqui sozinho!",
            advantages: ["2.0x Dano Super Efetivo", "Zero KS", "Fire Stones valem muito nas primeiras 48h"],
            dropsOfInterest: ["Fire Stone", "Dragon Scale Fragment", "Charizard Tail"],
          },
          {
            id: "sq-s5-alt2",
            name: "Tyranitar Lair & Pupitar Caves",
            targetMobs: ["Pupitar", "Tyranitar", "Rhydon"],
            location: "Cavernas rochosas de Sevii 2 / Rota da Liga",
            crowdLevel: "low",
            crowdLabel: "🟢 Excelente",
            category: "alt_farm",
            categoryLabel: "3ª Opção: Alternativa B",
            description: "Tyranitar e Pupitar sofrem 2.0x de água e dão loots de altíssimo valor de mercado.",
            proTip: "Use Rain Dance para aumentar em 50% o dano de água de todo o time!",
            advantages: ["2.0x Dano", "Loots raríssimos", "XP de monstro Tier 1"],
            dropsOfInterest: ["Darkness Stone", "Hard Stone", "Tyranitar Tail"],
          },
        ],
      },
      {
        stepNumber: 6,
        levelRange: "Lvl 110 - 150+",
        title: "6ª Hunt — Rumo ao 150 & Wildscape",
        subtitle: "Finalize o rush com Dungeons, Victory Road e preparação para o Wildscape",
        keyGoal: "Bater Lvl 150 no servidor Titan, liberar Wildscape e equipar itens de Star.",
        options: [
          {
            id: "sq-s6-meta",
            name: "Magmar Lair Deep & Charizard Spawns",
            targetMobs: ["Magmar", "Charizard", "Typhlosion"],
            location: "Cinnabar Profundo / Ilhas de Fogo",
            crowdLevel: "low",
            crowdLabel: "🟢 Muito Tranquila",
            category: "meta",
            categoryLabel: "1ª Opção: Rota Principal de Água",
            description: "Hunt contínua com Hydro Pump e Surf.",
            proTip: "Mantenha rotação de poções e limpe os spawns em círculo.",
            advantages: ["XP contínua", "Loot limpo"],
          },
          {
            id: "sq-s6-alt1",
            name: "Victory Road (Ground & Rock Spawns)",
            targetMobs: ["Rhydon", "Golem", "Steelix", "Tyranitar"],
            location: "Victory Road (Caminho da Liga Pokémon)",
            crowdLevel: "low",
            crowdLabel: "🟢 2.0x e 4.0x Dano",
            category: "alt_peaceful",
            categoryLabel: "2ª Opção: Alternativa A (Victory Road)",
            description: "Monstros resistentes que caem muito rápido para Blastoise. Spawns amplos.",
            proTip: "Steelix e Tyranitar dão loots de Metal Coat e Darkness Stone.",
            advantages: ["2.0x a 4.0x Dano", "Metal Coat chance"],
            dropsOfInterest: ["Metal Coat", "Hard Stone", "Darkness Stone"],
          },
          {
            id: "sq-s6-alt2",
            name: "Dungeons Diárias & Daily Tasks",
            targetMobs: ["Dungeon Bosses", "Daily Targets"],
            location: "Dungeons com Arcane Shard",
            crowdLevel: "low",
            crowdLabel: "🟢 100% Instanciado (Sem KS)",
            category: "alt_farm",
            categoryLabel: "3ª Opção: Alternativa B (Instância Sem KS)",
            description: "Faça todas as Dungeons disponíveis com seu Blastoise para puxar mobs em área e estourar de XP garantida.",
            proTip: "As dungeons garantem evolução sem risco de disputa com outros players.",
            advantages: ["XP pura sem competição", "Tokens de Dungeon"],
            dropsOfInterest: ["Arcane Essence", "Diamonds", "Tokens"],
          },
        ],
      },
    ],
  },

  /* ---------------- BULBASAUR / PLANTA & SUSTAIN ---------------- */
  {
    id: "bulbasaur",
    name: "Bulbasaur",
    icon: "Bulbasaur",
    element: "Grass",
    elementLabel: "Planta & Status",
    colorClass: "from-emerald-500/20 to-green-500/10 border-emerald-500/30 text-emerald-400",
    evolutionLine: "Bulbasaur ➔ Ivysaur (Lvl 40) ➔ Venusaur (Lvl 85)",
    overview:
      "Sustentação absurda com Leech Seed/Giga Drain e ataques em área devastadores como Razor Leaf e Petal Dance. Causa 2.0x de dano em todos os Pokémon de Água, Terra e Pedra.",
    rushPlaystyle: "Sustentação Infinita / Puxar Vários Monstros Juntos / Farm de Água e Pedra",
    steps: [
      {
        stepNumber: 1,
        levelRange: "Lvl 1 - 15",
        title: "1ª Hunt — Costa de Pallet & Lagos Iniciais",
        subtitle: "Derrote Pokémon de Água e Pedra sem gastar nenhuma poção de vida",
        keyGoal: "Pegar Lvl 15, aprender Vine Whip e Leech Seed, e pegar a Starter Box.",
        options: [
          {
            id: "bu-s1-meta",
            name: "Bueiro de Saffron",
            targetMobs: ["Rattata", "Zubat"],
            location: "Centro de Saffron",
            mapLink: "https://imgur.com/a/ZyszZOZ",
            crowdLevel: "high",
            crowdLabel: "🔴 Hiper Lotada",
            category: "meta",
            categoryLabel: "1ª Opção: Meta Geral",
            description: "Respawn de novatos.",
            proTip: "Se tiver mais de 2 pessoas, vá imediatamente para a água de Pallet ou pedreiras!",
            advantages: ["Perto de Saffron PZ"],
          },
          {
            id: "bu-s1-alt1",
            name: "Lagos de Pallet & Rota 22 (Água 2.0x Dano)",
            targetMobs: ["Poliwag", "Goldeen", "Magikarp"],
            location: "Descendo a costa de Pallet ou lago à esquerda de Viridian",
            crowdLevel: "low",
            crowdLabel: "🟢 Muito Vazio & 2.0x Dano",
            category: "alt_peaceful",
            categoryLabel: "2ª Opção: Alternativa A (Água 2.0x)",
            description: "Poliwags e Goldeens tomam 2.0x de dano de Planta e morrem em 1 Vine Whip. Quase nenhum jogador vai aqui.",
            proTip: "Você não gasta 1 única potion porque o Bulbasaur se cura com Leech Seed.",
            advantages: ["2.0x Dano Super Efetivo", "Zero concorrência", "Economia de potes"],
            dropsOfInterest: ["Water Stone Fragment", "Fish Fin"],
          },
          {
            id: "bu-s1-alt2",
            name: "Pedreiras de Pewter & Rota 4",
            targetMobs: ["Geodude", "Sandshrew"],
            location: "Leste de Pewter",
            crowdLevel: "low",
            crowdLabel: "🟢 Tranquila & 2.0x Dano",
            category: "alt_farm",
            categoryLabel: "3ª Opção: Alternativa B (Pedra 2.0x)",
            description: "Geodudes e Sandshrews tomam 2.0x de dano de Planta e dropam Earth e Hard Stones.",
            proTip: "Ótimo para conseguir a primeira Earth Stone do novo servidor.",
            advantages: ["2.0x Dano", "Earth Stone chance"],
            dropsOfInterest: ["Earth Stone", "Stone Orb"],
          },
        ],
      },
      {
        stepNumber: 2,
        levelRange: "Lvl 15 - 35",
        title: "2ª Hunt — Cais de Vermilion & Cavernas Rochosas",
        subtitle: "Cace Poliwhirls, Tentacools e Geodudes com dano dobrado",
        keyGoal: "Alcançar Lvl 35+, desbloquear Razor Leaf (dano em área) e acumular Water/Earth Stones.",
        options: [
          {
            id: "bu-s2-meta",
            name: "Digletts de Cerulean",
            targetMobs: ["Diglett"],
            location: "Leste de Vermilion",
            crowdLevel: "high",
            crowdLabel: "🔴 Hiper Disputada",
            category: "meta",
            categoryLabel: "1ª Opção: Meta Clássica",
            description: "Diglett toma 2.0x de planta, mas a disputa de respawn no Titan será caótica.",
            proTip: "Dê apenas um pulo para tentar capturar 1 se quiser, e vá para as praias de Vermilion/Fuchsia!",
            advantages: ["Earth Stone"],
          },
          {
            id: "bu-s2-alt1",
            name: "Cais de Vermilion & Costa de Fuchsia (Água 2.0x)",
            targetMobs: ["Poliwhirl", "Tentacool", "Shellder", "Staryu", "Krabby"],
            location: "Cais ao sul de Vermilion ou praias de Fuchsia",
            crowdLevel: "low",
            crowdLabel: "🟢 Excelente & 2.0x Dano",
            category: "alt_peaceful",
            categoryLabel: "2ª Opção: Alternativa A (Praias Vazias)",
            description: "Spawns contínuos de Pokémon aquáticos na beira da praia. Com Razor Leaf você atinge 3 a 4 monstros simultaneamente.",
            proTip: "Shellder e Staryu dropam Water Stones com frequência.",
            advantages: ["2.0x Dano Super Efetivo", "Área muito extensa", "Water Stones aos montes"],
            dropsOfInterest: ["Water Stone", "Shell", "Star Dust"],
          },
          {
            id: "bu-s2-alt2",
            name: "Mt. Moon Subsolo (Graveler & Onix)",
            targetMobs: ["Geodude", "Graveler", "Onix"],
            location: "Interior do Mt. Moon",
            crowdLevel: "low",
            crowdLabel: "🟢 2.0x Dano",
            category: "alt_farm",
            categoryLabel: "3ª Opção: Alternativa B",
            description: "Subsolo do Mt. Moon com mobs de Pedra e Terra.",
            proTip: "Gravelers caem muito rápido para Razor Leaf.",
            advantages: ["2.0x Dano", "Hard Stones"],
            dropsOfInterest: ["Hard Stone", "Earth Stone"],
          },
        ],
      },
      {
        stepNumber: 3,
        levelRange: "Lvl 35 - 55",
        title: "3ª Hunt — Ivysaur & Domínio Aquático",
        subtitle: "Evolua para Ivysaur (Lvl 40), desbloqueie Petal Dance e domine as ilhas",
        keyGoal: "Evoluir para Ivysaur, farmar Water Stones e juntar recursos para o time principal.",
        options: [
          {
            id: "bu-s3-meta",
            name: "Usina de Pikachu",
            targetMobs: ["Pikachu", "Voltorb", "Magnemite"],
            location: "Leste de Saffron",
            crowdLevel: "high",
            crowdLabel: "🔴 Super Lotada",
            category: "meta",
            categoryLabel: "1ª Opção: Meta Usina",
            description: "Ivysaur tem resistência natural a Elétrico, mas a muvuca de players torna a XP lenta.",
            proTip: "Se tiver muita gente, as ilhas aquáticas dão o triplo de XP por minuto.",
            advantages: ["Resistência a choque elétrico"],
          },
          {
            id: "bu-s3-alt1",
            name: "Mar de Vermilion & Ilhas de Poliwhirl / Starmie",
            targetMobs: ["Poliwhirl", "Starmie", "Golduck", "Seaking"],
            location: "Ilhas aquáticas ao sul de Vermilion",
            crowdLevel: "low",
            crowdLabel: "🟢 2.0x Dano & Quase Vazio",
            category: "alt_peaceful",
            categoryLabel: "2ª Opção: Alternativa A (Rush de Planta)",
            description: "Poliwhirl e Starmie tomam 2.0x de dano e dão XP altíssima. Pouquíssimos jogadores vão nas ilhas no dia 1 do server.",
            proTip: "Petal Dance e Solar Beam derretem grupos inteiros de Starmie.",
            advantages: ["2.0x Dano", "Zero KS", "Muitas Water Stones para vender"],
            dropsOfInterest: ["Water Stone", "Star Piece", "Fish Fin"],
          },
          {
            id: "bu-s3-alt2",
            name: "Rock Tunnel Deep (Graveler, Onix, Rhyhorn)",
            targetMobs: ["Graveler", "Onix", "Rhyhorn"],
            location: "Rock Tunnel Subsolo",
            crowdLevel: "low",
            crowdLabel: "🟢 2.0x a 4.0x Dano",
            category: "alt_farm",
            categoryLabel: "3ª Opção: Alternativa B",
            description: "Fraqueza quadruplicada para golpes de Planta em Rhyhorn e Graveler.",
            proTip: "Você mata Rhyhorn em 1 único ataque forte de Planta!",
            advantages: ["4.0x Dano em Rhyhorn/Graveler", "Earth Stone drops"],
            dropsOfInterest: ["Earth Stone", "Hard Stone"],
          },
        ],
      },
      {
        stepNumber: 4,
        levelRange: "Lvl 55 - 80",
        title: "4ª Hunt — Seafoam Islands & Praias Profundas",
        subtitle: "Cace Seel, Dewgong, Cloyster e Golduck com 2.0x de dano",
        keyGoal: "Pegar Lvl 80-85 para evoluir seu Venusaur com Solar Beam e Frenzy Plant!",
        options: [
          {
            id: "bu-s4-meta",
            name: "Usina Andar 2/3 (Raichu & Jolteon)",
            targetMobs: ["Raichu", "Jolteon"],
            location: "Usina Elétrica",
            crowdLevel: "high",
            crowdLabel: "🔴 Muito Lotada",
            category: "meta",
            categoryLabel: "1ª Opção: Meta Usina",
            description: "Boa XP mas super concorrida.",
            proTip: "Ivysaur tanca bem elétrico, mas perde tempo com KS de outros jogadores.",
            advantages: ["Thunder Stone"],
          },
          {
            id: "bu-s4-alt1",
            name: "Seafoam Islands 1F/2F (Seel, Dewgong, Golduck)",
            targetMobs: ["Seel", "Dewgong", "Golduck", "Cloyster", "Slowbro"],
            location: "Ilhas Seafoam",
            crowdLevel: "low",
            crowdLabel: "🟢 Paraíso do Ivysaur (2.0x Dano)",
            category: "alt_peaceful",
            categoryLabel: "2ª Opção: Alternativa A (Melhor XP)",
            description: "Golduck, Slowbro e Cloyster sofrem 2.0x de dano de Planta e dão XP massiva. A caverna é enorme e comporta você caçando sem ninguém por perto.",
            proTip: "Com Leech Seed e Giga Drain, sua vida nunca cai!",
            advantages: ["2.0x Dano", "XP muito alta", "Water & Ice Stones"],
            dropsOfInterest: ["Water Stone", "Ice Stone", "Slowpoke Tail"],
          },
          {
            id: "bu-s4-alt2",
            name: "Rhydon & Golem Mountain (Pedra/Terra 4.0x Dano)",
            targetMobs: ["Rhydon", "Golem", "Sandslash"],
            location: "Montanhas próximas à Rota 10",
            crowdLevel: "low",
            crowdLabel: "🟢 4.0x Dano Massivo",
            category: "alt_farm",
            categoryLabel: "3ª Opção: Alternativa B",
            description: "Dano quadruplicado em Rhydon e Golem. Eles morrem instantaneamente para seus golpes.",
            proTip: "Puxe de 4 a 5 monstros e use Frenzy Plant / Petal Dance.",
            advantages: ["4.0x Dano", "Hard Stones e Earth Stones"],
            dropsOfInterest: ["Hard Stone", "Earth Stone", "Horn"],
          },
        ],
      },
      {
        stepNumber: 5,
        levelRange: "Lvl 80 - 110",
        title: "5ª Hunt — Venusaur Desperto & Seafoam Deep",
        subtitle: "Com Venusaur e Solar Beam, domine as profundezas das Ilhas Seafoam",
        keyGoal: "Alcançar Lvl 110+, solar chefes aquáticos e preparar o time para o endgame.",
        options: [
          {
            id: "bu-s5-meta",
            name: "Subsolo Usina (Electabuzz)",
            targetMobs: ["Electabuzz"],
            location: "Subsolo Usina",
            crowdLevel: "high",
            crowdLabel: "🔴 Hiper Lotada",
            category: "meta",
            categoryLabel: "1ª Opção: Meta Usina",
            description: "Onde todo mundo se espreme no primeiro dia.",
            proTip: "Venusaur é neutro aqui, mas a hunt de Blastoise/Poliwrath em Seafoam dá o dobro de XP por hora.",
            advantages: ["Thunder Stone"],
          },
          {
            id: "bu-s5-alt1",
            name: "Seafoam Deep (Blastoise, Poliwrath, Lapras, Tentacruel)",
            targetMobs: ["Blastoise", "Poliwrath", "Tentacruel", "Kingler", "Lapras"],
            location: "Andares mais profundos de Seafoam",
            crowdLevel: "low",
            crowdLabel: "🟢 2.0x Dano & XP Gigante",
            category: "alt_peaceful",
            categoryLabel: "2ª Opção: Alternativa A (Rota Suprema de Planta)",
            description: "Todos os monstros tier 2 e tier 1 sofrem 2.0x de dano de Planta do Venusaur. Solar Beam limpa as salas e não tem KS!",
            proTip: "Enquanto a Usina tem 20 pessoas brigando, aqui você sobe de level sem interrupções.",
            advantages: ["2.0x Dano Super Efetivo", "Zero KS nas primeiras 48h", "Water & Ice Stones"],
            dropsOfInterest: ["Water Stone", "Ice Stone", "Lapras Shell Fragment"],
          },
          {
            id: "bu-s5-alt2",
            name: "Quagsire & Swampert Swamps (Terra/Água 4.0x Dano)",
            targetMobs: ["Quagsire", "Swampert", "Poliwrath"],
            location: "Pântanos de Sevii 4 / Ilhas do Sul",
            crowdLevel: "low",
            crowdLabel: "🟢 4.0x Dano Devastador",
            category: "alt_farm",
            categoryLabel: "3ª Opção: Alternativa B",
            description: "Quagsire e Swampert têm fraqueza quadruplicada para Planta (Água + Terra). Morrem com 1 hit.",
            proTip: "Melhor relação tempo/XP para quem joga de Bulbasaur.",
            advantages: ["4.0x Dano", "XP ultra rápida"],
            dropsOfInterest: ["Water Stone", "Earth Stone", "Mud Orb"],
          },
        ],
      },
      {
        stepNumber: 6,
        levelRange: "Lvl 110 - 150+",
        title: "6ª Hunt — Rumo ao 150 & Wildscape",
        subtitle: "Finalize o rush no servidor Titan com Dungeons e Victory Road",
        keyGoal: "Alcançar Lvl 150, desbloquear o Wildscape e farmar Arcane Shards nas Dungeons.",
        options: [
          {
            id: "bu-s6-meta",
            name: "Seafoam Deep Blastoise & Kingler Lair",
            targetMobs: ["Blastoise", "Kingler", "Poliwrath", "Gyarados"],
            location: "Profundezas de Seafoam",
            crowdLevel: "low",
            crowdLabel: "🟢 Tranquila",
            category: "meta",
            categoryLabel: "1ª Opção: Rota Principal de Planta",
            description: "Hunt contínua em Seafoam com Solar Beam e Frenzy Plant.",
            proTip: "Puxe os spawns em círculo e use Leech Seed para não parar para curar.",
            advantages: ["XP sustentável", "Sem gastar recursos"],
          },
          {
            id: "bu-s6-alt1",
            name: "Victory Road (Ground & Rock Spawns)",
            targetMobs: ["Rhydon", "Golem", "Tyranitar", "Steelix"],
            location: "Victory Road (Caminho da Liga Pokémon)",
            crowdLevel: "low",
            crowdLabel: "🟢 2.0x a 4.0x Dano",
            category: "alt_peaceful",
            categoryLabel: "2ª Opção: Alternativa A (Victory Road)",
            description: "Monstros pesados de Terra e Pedra que caem como folhas com golpes de Planta.",
            proTip: "Tyranitar e Rhydon garantem loots de alto valor comercial.",
            advantages: ["2.0x a 4.0x Dano", "Hard Stone & Darkness Stone"],
            dropsOfInterest: ["Darkness Stone", "Hard Stone", "Tyranitar Tail"],
          },
          {
            id: "bu-s6-alt2",
            name: "Dungeons Diárias & Daily Tasks",
            targetMobs: ["Dungeon Bosses", "Daily Targets"],
            location: "Dungeons com Arcane Shard",
            crowdLevel: "low",
            crowdLabel: "🟢 100% Instanciado (Sem KS)",
            category: "alt_farm",
            categoryLabel: "3ª Opção: Alternativa B (Dungeon Rush)",
            description: "Faça as Dungeons diárias para garantir XP limpa e subir direto para o 150.",
            proTip: "Guarde todos os seus Arcane Shards para usar nos horários de pico do servidor.",
            advantages: ["Sem KS", "XP massiva garantida"],
            dropsOfInterest: ["Arcane Essence", "Diamonds", "Tokens"],
          },
        ],
      },
    ],
  },

  /* ---------------- DIGLETT / USINA META RUSH ---------------- */
  {
    id: "diglett",
    name: "Diglett / Dugtrio / Steelix",
    icon: "Diglett",
    element: "Ground",
    elementLabel: "Terra / Rush Usina",
    colorClass: "from-amber-600/20 to-yellow-600/10 border-amber-600/30 text-amber-500",
    evolutionLine: "Diglett ➔ Dugtrio (Lvl 50 c/ Earth Stone) ➔ Steelix (Metal Coat)",
    overview:
      "A rota clássica e mais consagrada de rush do PokeAlliance: imunidade completa a dano elétrico e 2.0x de dano constante contra todos os monstros da Usina Elétrica.",
    rushPlaystyle: "Rush Usina / Imunidade Elétrica / Transição para Steelix",
    steps: [
      {
        stepNumber: 1,
        levelRange: "Lvl 1 - 15",
        title: "1ª Hunt — Captura Rápida do Diglett & Nível 15",
        subtitle: "Saia de Saffron e capture seu Diglett imediatamente",
        keyGoal: "Pegar Lvl 10-15 no bueiro e capturar 1 Diglett ao leste de Vermilion.",
        options: [
          {
            id: "dg-s1-meta",
            name: "Bueiro de Saffron ➔ Digletts Vermilion",
            targetMobs: ["Rattata", "Zubat", "Diglett"],
            location: "Bueiro Saffron e caverna leste de Vermilion",
            mapLink: "https://imgur.com/a/ZyszZOZ",
            crowdLevel: "high",
            crowdLabel: "🔴 Muito Lotada",
            category: "meta",
            categoryLabel: "1ª Opção: Meta Principal",
            description: "Pegue Lvl 10 no bueiro e corra para Vermilion capturar seu Diglett.",
            proTip: "Leve 10 Pokéballs normais do Starter Pack para garantir a captura na primeira tentativa.",
            advantages: ["Captura do monstro principal"],
            dropsOfInterest: ["Earth Stone Fragment"],
          },
          {
            id: "dg-s1-alt1",
            name: "Diglett Cave Subsolo (Longe da Entrada)",
            targetMobs: ["Diglett"],
            location: "Desça no subsolo da Diglett Cave",
            crowdLevel: "med",
            crowdLabel: "🟡 Moderada (Andar Fundo)",
            category: "alt_peaceful",
            categoryLabel: "2ª Opção: Alternativa A (Andar Inferior)",
            description: "A maioria dos novatos fica na porta da caverna. Desça a escada para encontrar Digletts livres!",
            proTip: "No andar de baixo há menos aglomeração de novatos.",
            advantages: ["Menos disputa"],
          },
          {
            id: "dg-s1-alt2",
            name: "Pewter Pedreira (Geodude)",
            targetMobs: ["Geodude", "Sandshrew"],
            location: "Leste de Pewter",
            crowdLevel: "low",
            crowdLabel: "🟢 Tranquila",
            category: "alt_farm",
            categoryLabel: "3ª Opção: Alternativa B",
            description: "Se a Diglett Cave estiver impossível de capturar, use Geodude como substituto de Terra temporário.",
            proTip: "Geodude também tem imunidade a elétrico e aprende Mud Shot.",
            advantages: ["Substituto de Terra seguro"],
          },
        ],
      },
      {
        stepNumber: 2,
        levelRange: "Lvl 15 - 35",
        title: "2ª Hunt — Entrada da Usina Elétrica",
        subtitle: "Use a imunidade do Diglett para caçar Voltorb e Magnemite",
        keyGoal: "Alcançar Lvl 35-40 com seu Diglett e acumular gold para a Earth Stone.",
        options: [
          {
            id: "dg-s2-meta",
            name: "Usina Elétrica Entrada (Sul de Cerulean)",
            targetMobs: ["Voltorb", "Magnemite", "Pikachu"],
            location: "Usina ao Sul de Cerulean",
            mapLink: "https://imgur.com/a/8vlhXCv",
            crowdLevel: "high",
            crowdLabel: "🔴 Alta Disputa",
            category: "meta",
            categoryLabel: "1ª Opção: Meta Usina Entrada",
            description: "Caça com imunidade total a choque. Você não toma dano dos golpes elétricos!",
            proTip: "Magnemite também sofre 2.0x de dano de Terra.",
            advantages: ["Imunidade a choques", "2.0x Dano"],
            dropsOfInterest: ["Thunder Stone", "Magnet"],
          },
          {
            id: "dg-s2-alt1",
            name: "Diglett Cave Deep (Digletts & Dugtrios Fracos)",
            targetMobs: ["Diglett", "Dugtrio"],
            location: "Profundezas da Diglett Cave",
            crowdLevel: "low",
            crowdLabel: "🟢 Tranquila",
            category: "alt_peaceful",
            categoryLabel: "2ª Opção: Alternativa A (Fuga da Usina)",
            description: "Se a entrada da Usina estiver entupida de gente, continue na Diglett Cave até o level 35.",
            proTip: "XP limpa sem ninguém dando KS.",
            advantages: ["Sem disputa", "Earth Stones"],
          },
          {
            id: "dg-s2-alt2",
            name: "Rock Tunnel 1F (Geodude & Machop)",
            targetMobs: ["Geodude", "Machop", "Zubat"],
            location: "Rock Tunnel",
            crowdLevel: "low",
            crowdLabel: "🟢 Tranquila",
            category: "alt_farm",
            categoryLabel: "3ª Opção: Alternativa B",
            description: "Caverna espaçosa com muitos spawns para subir até o 40.",
            proTip: "Mud-Slap e Dig matam rápido.",
            advantages: ["Muitos spawns"],
          },
        ],
      },
      {
        stepNumber: 3,
        levelRange: "Lvl 35 - 55",
        title: "3ª Hunt — Evolução para Dugtrio (Lvl 50)",
        subtitle: "Use a Earth Stone no Lvl 50 para transformar seu Diglett em Dugtrio",
        keyGoal: "Bater Lvl 50, usar Earth Stone no Diglett e liberar Earthquake e Mud Bomb.",
        options: [
          {
            id: "dg-s3-meta",
            name: "Usina de Pikachu de Saffron",
            targetMobs: ["Pikachu", "Voltorb", "Electrode"],
            location: "Leste de Saffron",
            mapLink: "https://imgur.com/a/eMjPulX",
            crowdLevel: "high",
            crowdLabel: "🔴 Muito Lotada",
            category: "meta",
            categoryLabel: "1ª Opção: Meta Usina",
            description: "A melhor fonte de XP para Diglett/Dugtrio.",
            proTip: "No Lvl 50 em ponto, evolua para Dugtrio. O dano do Earthquake triplica sua velocidade de caça!",
            advantages: ["2.0x Dano", "Imunidade"],
            dropsOfInterest: ["Thunder Stone"],
          },
          {
            id: "dg-s3-alt1",
            name: "Cinnabar Vulcão 1F (Growlithe & Ponyta)",
            targetMobs: ["Growlithe", "Ponyta", "Vulpix"],
            location: "Entrada do Vulcão Cinnabar",
            crowdLevel: "low",
            crowdLabel: "🟢 2.0x Dano & Quase Vazio",
            category: "alt_peaceful",
            categoryLabel: "2ª Opção: Alternativa A (Fogo 2.0x)",
            description: "Terra também causa 2.0x de dano em Fogo! Se a Usina estiver impossível, vá para Cinnabar.",
            proTip: "Diglett bate 2.0x com Earthquake e Mud Bomb.",
            advantages: ["2.0x Dano", "Fire Stones para vender"],
            dropsOfInterest: ["Fire Stone"],
          },
          {
            id: "dg-s3-alt2",
            name: "Vermilion Leste (Drowzee & Hypno)",
            targetMobs: ["Drowzee", "Hypno"],
            location: "Rota 11 (Leste de Vermilion)",
            crowdLevel: "low",
            crowdLabel: "🟢 Tranquila",
            category: "alt_farm",
            categoryLabel: "3ª Opção: Alternativa B",
            description: "Drowzee e Hypno dão boa XP e dropam Enigma Stones e itens úteis.",
            proTip: "Dugtrio mata rápido e não sofre debuffs elétricos.",
            advantages: ["Enigma Stones"],
          },
        ],
      },
      {
        stepNumber: 4,
        levelRange: "Lvl 55 - 80",
        title: "4ª Hunt — Andares Superiores da Usina",
        subtitle: "Com Dugtrio e Earthquake, derrote Raichu e Jolteon",
        keyGoal: "Alcançar Lvl 80+, capturar 1 Onix e conseguir 1 Metal Coat.",
        options: [
          {
            id: "dg-s4-meta",
            name: "Usina 2º e 3º Andar (Raichu & Jolteon)",
            targetMobs: ["Raichu", "Jolteon"],
            location: "Andares Superiores da Usina",
            mapLink: "https://imgur.com/a/tVt9b2v",
            crowdLevel: "high",
            crowdLabel: "🔴 Disputada",
            category: "meta",
            categoryLabel: "1ª Opção: Meta Principal",
            description: "2º Andar: Raichu | 3º Andar: Jolteon. Dugtrio é o rei absoluto dessa hunt.",
            proTip: "Earthquake atinge a sala inteira. Puxe vários e derrote em área.",
            advantages: ["2.0x Dano", "Imunidade"],
            dropsOfInterest: ["Thunder Stone", "Raichu Tail"],
          },
          {
            id: "dg-s4-alt1",
            name: "Cinnabar Vulcão 2F (Magmar & Rapidash)",
            targetMobs: ["Magmar", "Rapidash", "Ninetales"],
            location: "Vulcão de Cinnabar",
            crowdLevel: "low",
            crowdLabel: "🟢 2.0x Dano & Menos Disputada",
            category: "alt_peaceful",
            categoryLabel: "2ª Opção: Alternativa A (Plano B Anti-KS)",
            description: "Monstros de Fogo sofrem 2.0x de dano de Terra. Excelente caso a Usina esteja lotada.",
            proTip: "Fique atento para não tomar dano massivo de Magmarizers.",
            advantages: ["2.0x Dano", "Fire Stones"],
          },
          {
            id: "dg-s4-alt2",
            name: "Rock Tunnel Deep (Golem & Rhydon)",
            targetMobs: ["Golem", "Rhydon", "Onix"],
            location: "Rock Tunnel Subsolo",
            crowdLevel: "low",
            crowdLabel: "🟢 Tranquila",
            category: "alt_farm",
            categoryLabel: "3ª Opção: Alternativa B (Captura de Onix)",
            description: "Aproveite para caçar e capturar o Onix que você usará para fazer o Steelix!",
            proTip: "Capture Onix com Heavy Ball ou Ultra Ball.",
            advantages: ["Captura do Onix", "Hard Stones"],
            dropsOfInterest: ["Hard Stone", "Metal Coat chance"],
          },
        ],
      },
      {
        stepNumber: 5,
        levelRange: "Lvl 80 - 110",
        title: "5ª Hunt — Subsolo da Usina & Evolução Steelix",
        subtitle: "Cace Electabuzz com Dugtrio ou equipe Metal Coat no Onix para evoluir para Steelix",
        keyGoal: "Pegar Lvl 100-110 e evoluir seu Steelix com Metal Coat equipado no Onix.",
        options: [
          {
            id: "dg-s5-meta",
            name: "Subsolo da Usina Elétrica (Electabuzz)",
            targetMobs: ["Electabuzz"],
            location: "Subsolo da Usina",
            mapLink: "https://imgur.com/a/lx2xnEu",
            crowdLevel: "high",
            crowdLabel: "🔴 O Ponto Mais Concorrido do Titan",
            category: "meta",
            categoryLabel: "1ª Opção: Meta Electabuzz",
            description: "A hunt mais famosa do PKA. Dugtrio e Steelix causam 2.0x de dano e ignoram choques.",
            proTip: "Equipe o Metal Coat no Onix e cace aqui. A cada monstro morto, há chance do Onix evoluir para Steelix automaticamente!",
            advantages: ["2.0x Dano", "Evolução do Steelix", "Thunder Stone"],
            dropsOfInterest: ["Thunder Stone", "Electabuzz Essence"],
          },
          {
            id: "dg-s5-alt1",
            name: "Cinnabar Deep & Charizard Valley (Fogo 2.0x)",
            targetMobs: ["Magmar", "Typhlosion", "Charizard"],
            location: "Profundezas de Cinnabar",
            crowdLevel: "low",
            crowdLabel: "🟢 2.0x Dano & Quase Vazio",
            category: "alt_peaceful",
            categoryLabel: "2ª Opção: Alternativa A (Fuga do Electabuzz)",
            description: "Se tiver 5 pessoas disputando cada Electabuzz no subsolo, venha para Cinnabar. Dugtrio bate 2.0x de dano e a XP é livre de KS.",
            proTip: "Muito mais XP/hora do que ficar parado esperando respawn disputado.",
            advantages: ["2.0x Dano", "Zero KS"],
            dropsOfInterest: ["Fire Stone"],
          },
          {
            id: "dg-s5-alt2",
            name: "Magneton & Electrode Lab",
            targetMobs: ["Magneton", "Electrode"],
            location: "Laboratório abandonado / Usina lateral",
            crowdLevel: "low",
            crowdLabel: "🟢 2.0x Dano",
            category: "alt_farm",
            categoryLabel: "3ª Opção: Alternativa B",
            description: "Magneton é Elétrico/Aço e toma 4.0x de dano de Terra!",
            proTip: "Magneton derrete em 1 Earthquake devido à fraqueza quádrupla.",
            advantages: ["4.0x Dano em Magneton", "Metal Coat drops"],
            dropsOfInterest: ["Metal Coat", "Magnet"],
          },
        ],
      },
      {
        stepNumber: 6,
        levelRange: "Lvl 110 - 150+",
        title: "6ª Hunt — Steelix Rush até o 150 & Wildscape",
        subtitle: "Com Steelix e Iron Tail / Earthquake, finalize o rush até o level 150",
        keyGoal: "Bater Lvl 150, desbloquear o Wildscape e iniciar Hoenn / Dungeons.",
        options: [
          {
            id: "dg-s6-meta",
            name: "Electabuzz Subsolo com Steelix",
            targetMobs: ["Electabuzz"],
            location: "Subsolo Usina",
            crowdLevel: "med",
            crowdLabel: "🟡 Moderada a Alta",
            category: "meta",
            categoryLabel: "1ª Opção: Meta Steelix",
            description: "Com Steelix você solará a sala em segundos.",
            proTip: "Foque em matar em rotação rápida.",
            advantages: ["XP garantida"],
          },
          {
            id: "dg-s6-alt1",
            name: "Victory Road (Rock & Electric Spawns)",
            targetMobs: ["Rhydon", "Golem", "Steelix", "Tyranitar"],
            location: "Victory Road",
            crowdLevel: "low",
            crowdLabel: "🟢 Muito Tranquila",
            category: "alt_peaceful",
            categoryLabel: "2ª Opção: Alternativa A (Victory Road)",
            description: "Monstros tier 1 e tier 2 sem concorrência para pegar o 150 em poucas horas.",
            proTip: "Steelix tem defesa colossal contra todos esses monstros.",
            advantages: ["Defesa máxima", "Drops valiosos"],
            dropsOfInterest: ["Hard Stone", "Metal Coat", "Darkness Stone"],
          },
          {
            id: "dg-s6-alt2",
            name: "Dungeons Diárias & Tasks (Hard)",
            targetMobs: ["Dungeon Bosses"],
            location: "Dungeons com Arcane Shard",
            crowdLevel: "low",
            crowdLabel: "🟢 100% Instanciado",
            category: "alt_farm",
            categoryLabel: "3ª Opção: Alternativa B",
            description: "Instâncias particulares sem risco de KS para garantir os últimos níveis até o 150.",
            proTip: "Use as runs diárias para acumular Arcane Essences.",
            advantages: ["Zero KS", "XP pura"],
            dropsOfInterest: ["Arcane Essence", "Diamonds", "Tokens"],
          },
        ],
      },
    ],
  },

  /* ---------------- ABRA / PSÍQUICO BURST ---------------- */
  {
    id: "abra",
    name: "Abra / Kadabra / Alakazam",
    icon: "Alakazam",
    element: "Psychic",
    elementLabel: "Psíquico Burst",
    colorClass: "from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400",
    evolutionLine: "Abra ➔ Kadabra (Lvl 40 c/ Enigma Stone) ➔ Alakazam (Lvl 80)",
    overview:
      "Dano especial explosivo à distância com Teleport, Psybeam e Psychic. Esmaga tipos Lutador e Veneno com 2.0x de dano e caça em áreas vazias de veneno.",
    rushPlaystyle: "Dano Mágico à Distância / Alta Mobilidade com Teleport / Foco em Veneno e Lutador",
    steps: [
      {
        stepNumber: 1,
        levelRange: "Lvl 1 - 15",
        title: "1ª Hunt — Captura do Abra & Primeiros Níveis",
        subtitle: "Use Teleport e Psywave para subir rapidamente",
        keyGoal: "Pegar Lvl 10-15 e capturar 1 Abra na Rota 24 (Acima de Cerulean).",
        options: [
          {
            id: "ab-s1-meta",
            name: "Bueiro de Saffron ➔ Rota 24 Cerulean",
            targetMobs: ["Rattata", "Abra"],
            location: "Bueiro e Rota 24",
            crowdLevel: "high",
            crowdLabel: "🔴 Alta Disputa",
            category: "meta",
            categoryLabel: "1ª Opção: Meta",
            description: "Suba primeiros níveis e capture seu Abra com Great Ball.",
            proTip: "Jogue a ball imediatamente antes do Abra dar Teleport.",
            advantages: ["Captura do Abra"],
          },
          {
            id: "ab-s1-alt1",
            name: "Viridian Forest (Weedle & Kakuna - Veneno 2.0x)",
            targetMobs: ["Weedle", "Kakuna", "Caterpie"],
            location: "Viridian Forest",
            crowdLevel: "low",
            crowdLabel: "🟢 2.0x Dano & Muito Vazio",
            category: "alt_peaceful",
            categoryLabel: "2ª Opção: Alternativa A (Veneno 2.0x)",
            description: "Weedle e Kakuna são do tipo Veneno e tomam 2.0x de dano de golpes psíquicos!",
            proTip: "Morrem em 1 único Psybeam. XP limpa e muito rápida.",
            advantages: ["2.0x Dano", "Zero KS"],
          },
          {
            id: "ab-s1-alt2",
            name: "Rota 22 (Mankey - Lutador 2.0x)",
            targetMobs: ["Mankey", "Nidoran"],
            location: "Oeste de Viridian",
            crowdLevel: "low",
            crowdLabel: "🟢 2.0x Dano",
            category: "alt_farm",
            categoryLabel: "3ª Opção: Alternativa B",
            description: "Mankey é Lutador e Nidoran é Veneno: ambos sofrem 2.0x de dano psíquico!",
            proTip: "Hunt perfeita para o Abra subir de nível sem gastar vida.",
            advantages: ["2.0x Dano Super Efetivo"],
          },
        ],
      },
      {
        stepNumber: 2,
        levelRange: "Lvl 15 - 35",
        title: "2ª Hunt — Florestas Venenosas & Lutadores",
        subtitle: "Dobre o dano contra Gloom, Weepinbell, Machop e Primeape",
        keyGoal: "Alcançar Lvl 35-40 e juntar Enigma Stone para evoluir para Kadabra.",
        options: [
          {
            id: "ab-s2-meta",
            name: "Celadon Leste & Rota 7 (Gloom & Weepinbell)",
            targetMobs: ["Oddish", "Gloom", "Bellsprout", "Weepinbell"],
            location: "Rota das Flores de Celadon",
            crowdLevel: "low",
            crowdLabel: "🟢 2.0x Dano & Tranquila",
            category: "meta",
            categoryLabel: "1ª Opção: Meta Psíquica",
            description: "Plantas venenosas que caem muito rápido para ataques psíquicos.",
            proTip: "Enquanto todo mundo briga na Usina, a rota de Celadon dá o dobro de XP para o Abra.",
            advantages: ["2.0x Dano", "Leaf Stones"],
            dropsOfInterest: ["Leaf Stone", "Bag of Pollen"],
          },
          {
            id: "ab-s2-alt1",
            name: "Mt. Moon 1F & Rota 3 (Zubat & Machop)",
            targetMobs: ["Zubat", "Golbat fraco", "Machop"],
            location: "Mt. Moon",
            crowdLevel: "low",
            crowdLabel: "🟢 2.0x Dano",
            category: "alt_peaceful",
            categoryLabel: "2ª Opção: Alternativa A",
            description: "Zubat é Veneno/Voador e Machop é Lutador. Ambos tomam 2.0x de dano psíquico!",
            proTip: "Fácil de caçar mantendo distância.",
            advantages: ["2.0x Dano", "Zero KS"],
          },
          {
            id: "ab-s2-alt2",
            name: "Vermilion Leste (Drowzee Cave)",
            targetMobs: ["Drowzee"],
            location: "Rota 11",
            crowdLevel: "low",
            crowdLabel: "🟢 Enigma Stone Farm",
            category: "alt_farm",
            categoryLabel: "3ª Opção: Alternativa B",
            description: "Ótimo para dropar a Enigma Stone necessária para evoluir o Kadabra no Lvl 40.",
            proTip: "Guarde a primeira Enigma Stone que dropar.",
            advantages: ["Enigma Stone garantida"],
            dropsOfInterest: ["Enigma Stone"],
          },
        ],
      },
      {
        stepNumber: 3,
        levelRange: "Lvl 35 - 55",
        title: "3ª Hunt — Kadabra Desperto & Fuchsia Venenosa",
        subtitle: "Evolua para Kadabra no Lvl 40 com Enigma Stone e use Psybeam/Psychic",
        keyGoal: "Evoluir para Kadabra, aprender Teleport avançado e dominar hunts de Veneno.",
        options: [
          {
            id: "ab-s3-meta",
            name: "Fuchsia Arredores (Arbok, Weezing, Gloom)",
            targetMobs: ["Arbok", "Weezing", "Gloom", "Golbat"],
            location: "Ao redor de Fuchsia City",
            crowdLevel: "low",
            crowdLabel: "🟢 2.0x Dano & Quase Vazio",
            category: "meta",
            categoryLabel: "1ª Opção: Meta Psíquica",
            description: "Paraíso dos psíquicos! Todos os monstros de Fuchsia são do tipo Veneno e tomam 2.0x de dano.",
            proTip: "Kadabra limpa grupos de Arbok e Weezing em 2 segundos com Psybeam.",
            advantages: ["2.0x Dano", "Venom Stone & Cocoon Stone", "Zero KS"],
            dropsOfInterest: ["Venom Stone", "Snake Tail"],
          },
          {
            id: "ab-s3-alt1",
            name: "Dojo de Saffron & Lutadores de Rock Tunnel",
            targetMobs: ["Machoke", "Primeape", "Hitmonlee"],
            location: "Dojo de Saffron / Rock Tunnel Deep",
            crowdLevel: "low",
            crowdLabel: "🟢 Lutadores 2.0x Dano",
            category: "alt_peaceful",
            categoryLabel: "2ª Opção: Alternativa A",
            description: "Lutadores tomam 2.0x de dano e não conseguem encostar no Kadabra devido ao Teleport.",
            proTip: "Bata de longe e use Teleport se eles chegarem perto.",
            advantages: ["2.0x Dano", "Punch Stone drop"],
            dropsOfInterest: ["Punch Stone"],
          },
          {
            id: "ab-s3-alt2",
            name: "Pokémon Tower Lavender (Haunter)",
            targetMobs: ["Gastly", "Haunter"],
            location: "Lavender Tower 3F/4F",
            crowdLevel: "med",
            crowdLabel: "🟡 Moderada (2.0x Dano)",
            category: "alt_farm",
            categoryLabel: "3ª Opção: Alternativa B",
            description: "Fantasmas também são do tipo Veneno! Psybeam causa 2.0x de dano neles.",
            proTip: "Cuidado que eles também causam dano alto se te acertarem.",
            advantages: ["2.0x Dano", "Darkness Stone"],
            dropsOfInterest: ["Darkness Stone"],
          },
        ],
      },
      {
        stepNumber: 4,
        levelRange: "Lvl 55 - 80",
        title: "4ª Hunt — Safari Zone & Pântano de Veneno",
        subtitle: "Cace Muk, Weezing, Victreebel e Machamp com 2.0x de dano",
        keyGoal: "Pegar Lvl 80 para evoluir seu Alakazam com Enigma Stone!",
        options: [
          {
            id: "ab-s4-meta",
            name: "Pântano de Fuchsia (Muk, Weezing, Arbok)",
            targetMobs: ["Muk", "Weezing", "Arbok", "Venomoth"],
            location: "Pântano ao sul de Fuchsia",
            crowdLevel: "low",
            crowdLabel: "🟢 2.0x Dano Massivo",
            category: "meta",
            categoryLabel: "1ª Opção: Meta Psíquica",
            description: "Spawns concentrados de Veneno puro. Kadabra destrói Muk e Weezing.",
            proTip: "Puxe 3 a 4 monstros e solte Psychic em área.",
            advantages: ["2.0x Dano Super Efetivo", "Área ampla sem KS", "Venom Stones"],
            dropsOfInterest: ["Venom Stone", "Gosme"],
          },
          {
            id: "ab-s4-alt1",
            name: "Safari Zone (Exeggutor, Victreebel, Vileplume)",
            targetMobs: ["Victreebel", "Vileplume", "Venomoth"],
            location: "Safari Zone de Fuchsia",
            crowdLevel: "low",
            crowdLabel: "🟢 Muito Tranquila",
            category: "alt_peaceful",
            categoryLabel: "2ª Opção: Alternativa A",
            description: "Planta/Veneno sofrem dano dobrado de golpes psíquicos.",
            proTip: "XP gigante por monstro abatido.",
            advantages: ["2.0x Dano", "Leaf & Venom Stones"],
          },
          {
            id: "ab-s4-alt2",
            name: "Lutadores de Mt. Moon Deep (Machamp & Primeape)",
            targetMobs: ["Machamp", "Primeape", "Hitmonchan"],
            location: "Mt. Moon andares fundos",
            crowdLevel: "low",
            crowdLabel: "🟢 2.0x Dano",
            category: "alt_farm",
            categoryLabel: "3ª Opção: Alternativa B",
            description: "Monstros de luta com XP massiva que morrem em 2 rotações de skill.",
            proTip: "Mantenha a distância máxima de conjuração.",
            advantages: ["2.0x Dano", "Punch Stones"],
            dropsOfInterest: ["Punch Stone", "Belt"],
          },
        ],
      },
      {
        stepNumber: 5,
        levelRange: "Lvl 80 - 110",
        title: "5ª Hunt — Alakazam Supremo & Nidoking / Nidoqueen Lair",
        subtitle: "Com Alakazam e Psychic / Psybeam, domine as cavernas venenosas",
        keyGoal: "Alcançar Lvl 110+, solar chefes de veneno e lutar nas Daily Missions Hard.",
        options: [
          {
            id: "ab-s5-meta",
            name: "Nidoking & Nidoqueen Lair (Veneno/Terra 2.0x)",
            targetMobs: ["Nidoking", "Nidoqueen", "Muk", "Weezing"],
            location: "Cavernas venenosas de Sevii / Fuchsia",
            crowdLevel: "low",
            crowdLabel: "🟢 2.0x Dano & Vazio",
            category: "meta",
            categoryLabel: "1ª Opção: Meta Psíquica",
            description: "Nidoking e Nidoqueen são do tipo Veneno e tomam 2.0x de dano psíquico!",
            proTip: "Alakazam limpa a caverna em velocidade recorde com Psychic e Future Sight.",
            advantages: ["2.0x Dano", "Zero KS no servidor novo", "Venom & Earth Stones"],
            dropsOfInterest: ["Venom Stone", "Earth Stone", "King Horn"],
          },
          {
            id: "ab-s5-alt1",
            name: "Machamp Mountain & Primeape Canyon",
            targetMobs: ["Machamp", "Primeape", "Poliwrath"],
            location: "Montanha dos Lutadores (Sevii 3)",
            crowdLevel: "low",
            crowdLabel: "🟢 2.0x Dano",
            category: "alt_peaceful",
            categoryLabel: "2ª Opção: Alternativa A",
            description: "Poliwrath (Água/Lutador) e Machamp sofrem 2.0x de dano psíquico.",
            proTip: "Use Teleport para kitar qualquer monstro que chegue perto.",
            advantages: ["2.0x Dano", "Punch Stones"],
            dropsOfInterest: ["Punch Stone", "Water Stone"],
          },
          {
            id: "ab-s5-alt2",
            name: "Cinnabar Mansion Deep (Hypno & Gengar Spawns)",
            targetMobs: ["Gengar", "Haunter", "Hypno"],
            location: "Mansão de Cinnabar Subsolo",
            crowdLevel: "low",
            crowdLabel: "🟢 2.0x Dano em Gengar",
            category: "alt_farm",
            categoryLabel: "3ª Opção: Alternativa B",
            description: "Gengar é Fantasma/Veneno e toma 2.0x de dano de Psíquico.",
            proTip: "Alta taxa de drops raros e Darkness Stones.",
            advantages: ["Darkness Stones", "XP alta"],
            dropsOfInterest: ["Darkness Stone", "Ghost Essence"],
          },
        ],
      },
      {
        stepNumber: 6,
        levelRange: "Lvl 110 - 150+",
        title: "6ª Hunt — Rumo ao 150 & Wildscape",
        subtitle: "Finalize o rush com Dungeons Diárias e Victory Road Fighting Spots",
        keyGoal: "Bater Lvl 150 no Titan, desbloquear Wildscape e equipar Star Items.",
        options: [
          {
            id: "ab-s6-meta",
            name: "Victory Road Fighting & Poison Halls",
            targetMobs: ["Machamp", "Gengar", "Nidoking", "Crobat"],
            location: "Victory Road",
            crowdLevel: "low",
            crowdLabel: "🟢 2.0x Dano",
            category: "meta",
            categoryLabel: "1ª Opção: Meta Psíquica",
            description: "Spawns densos de Lutadores e Venenosos na Victory Road.",
            proTip: "Alakazam causa dano especial devastador e limpa as salas sem tomar dano físico.",
            advantages: ["2.0x Dano", "XP de monstro Tier 1"],
            dropsOfInterest: ["Punch Stone", "Venom Stone", "Metal Coat chance"],
          },
          {
            id: "ab-s6-alt1",
            name: "Dungeons Diárias (Hard) & Daily Missions",
            targetMobs: ["Dungeon Bosses"],
            location: "Dungeons com Arcane Shard",
            crowdLevel: "low",
            crowdLabel: "🟢 100% Instanciado (Sem KS)",
            category: "alt_peaceful",
            categoryLabel: "2ª Opção: Alternativa A (Dungeon Rush)",
            description: "Faça as Dungeons diárias para burst de 200k a 500k de XP por run.",
            proTip: "Use Future Sight e Psychic de longe nos chefes de dungeon.",
            advantages: ["Sem KS", "XP garantida"],
            dropsOfInterest: ["Arcane Essence", "Diamonds", "Tokens"],
          },
          {
            id: "ab-s6-alt2",
            name: "Gengar & Alakazam Mirror Lair",
            targetMobs: ["Alakazam selvagem", "Gengar selvagem"],
            location: "Profundezas de Sevii 5",
            crowdLevel: "low",
            crowdLabel: "🟢 XP Extrema",
            category: "alt_farm",
            categoryLabel: "3ª Opção: Alternativa B",
            description: "Hunt avançada para rush final dos últimos níveis até o 150.",
            proTip: "Mantenha o Teleport sempre pronto para emergências.",
            advantages: ["XP massiva", "Enigma Stones"],
            dropsOfInterest: ["Enigma Stone", "Darkness Stone"],
          },
        ],
      },
    ],
  },
];

/* =========================================================================
   MAIN COMPONENT
   ========================================================================= */

function TitanServerGuide() {
  const [selectedStarterId, setSelectedStarterId] = useState<string>("charmander");
  const [customPokemon, setCustomPokemon] = useState<string | null>(null);
  const [crowdFilter, setCrowdFilter] = useState<"all" | "peaceful" | "meta">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeStepTab, setActiveStepTab] = useState<number>(0);

  // Active Starter Preset
  const currentPreset = useMemo(() => {
    return STARTER_PRESETS.find((p) => p.id === selectedStarterId) ?? STARTER_PRESETS[0];
  }, [selectedStarterId]);

  // Selected Pokemon details (either starter or custom)
  const activePokemonEntry = useMemo(() => {
    const targetName = customPokemon || currentPreset.name;
    return pokemonList.find((p) => norm(p.name) === norm(targetName));
  }, [customPokemon, currentPreset]);

  // Filtered suggestions for custom pokemon search
  const pokemonSearchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const nq = norm(searchQuery);
    return pokemonList.filter((p) => norm(p.name).includes(nq)).slice(0, 6);
  }, [searchQuery]);

  // Handler for selecting a starter preset
  const handleSelectStarter = (presetId: string) => {
    setSelectedStarterId(presetId);
    setCustomPokemon(null);
  };

  // Handler for selecting custom pokemon from search
  const handleSelectCustomPokemon = (pokeName: string) => {
    setCustomPokemon(pokeName);
    setSearchQuery("");
    // Find closest preset archetype
    const entry = pokemonList.find((p) => norm(p.name) === norm(pokeName));
    const pType = entry?.type?.toLowerCase() ?? "";
    if (pType.includes("fire")) setSelectedStarterId("charmander");
    else if (pType.includes("water")) setSelectedStarterId("squirtle");
    else if (pType.includes("grass")) setSelectedStarterId("bulbasaur");
    else if (pType.includes("ground") || pType.includes("rock")) setSelectedStarterId("diglett");
    else if (pType.includes("psychic") || pType.includes("ghost")) setSelectedStarterId("abra");
  };

  return (
    <div className="space-y-8">
      {/* =========================================================================
          HERO & INTRO BANNER
          ========================================================================= */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-br from-panel via-panel-strong to-primary/10 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 rounded-full bg-gold/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 animate-pulse">
                <Flame className="size-3.5 text-amber-400" />
                LANÇAMENTO NEW SERVER TITAN
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs text-primary font-medium">
                <Trophy className="size-3 text-primary" /> Rota de Rush do Zero 1-150
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <span>Guia do Zero & Rota Anti-Lotação</span>
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              No primeiro dia de um novo servidor como o <strong>Titan</strong>, as hunts tradicionais (Bueiro de Saffron, Diglett e Usina Elétrica) ficam <strong>extremamente lotadas com centenas de jogadores disputando os mesmos monstros</strong>. Este guia traça uma <strong>rota linear passo a passo da 1ª à 6ª hunt</strong>, dando sempre opções alternativas com <strong>2.0x de dano e respawns vazios</strong> para você subir de nível muito mais rápido!
            </p>
          </div>

          <div className="flex sm:flex-col gap-2 shrink-0">
            <Link
              to="/onde-cacar"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-panel px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-panel-strong transition-all"
            >
              <Compass className="size-4 text-primary" />
              <span>Onde Caçar (2.0x Dano)</span>
            </Link>
            <Link
              to="/iniciantes"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-panel px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-panel-strong transition-all"
            >
              <Sparkles className="size-4 text-gold" />
              <span>Guia Básico 1-150</span>
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SELETOR DE POKÉMON INICIAL / ESCOLHIDO
          ========================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-3">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Crosshair className="size-5 text-primary" />
              <span>1. Escolha o seu Pokémon de Caça ou Inicial:</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              A rota de caça e as alternativas anti-lotação serão adaptadas automaticamente de acordo com as fraquezas elementais dos monstros.
            </p>
          </div>

          {/* Quick Search for any Pokemon */}
          <div className="relative w-full sm:w-64">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar outro Pokémon..."
                className="w-full h-9 rounded-lg border border-border bg-panel px-3 pl-8 text-xs focus:border-primary focus:outline-none placeholder:text-muted-foreground/60"
              />
              <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-3 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Suggestions dropdown */}
            {pokemonSearchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 z-30 rounded-lg border border-border bg-panel-strong shadow-xl p-1.5 space-y-1">
                {pokemonSearchSuggestions.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => handleSelectCustomPokemon(p.name)}
                    className="w-full flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-xs text-left hover:bg-primary/20 text-foreground transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <PokemonIcon pokemon={p.name} className="size-5" />
                      <span className="font-semibold">{p.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">({p.type ?? "Normal"})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Starter Presets Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {STARTER_PRESETS.map((preset) => {
            const isSelected = !customPokemon && selectedStarterId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectStarter(preset.id)}
                className={`relative flex flex-col items-center text-center p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? "border-primary bg-primary/15 shadow-[0_0_20px_rgba(59,130,246,0.25)] ring-1 ring-primary"
                    : "border-border/80 bg-panel hover:bg-panel-strong hover:border-border"
                }`}
              >
                <div className="relative mb-2">
                  <PokemonIcon pokemon={preset.icon} className="size-12 drop-shadow-md" />
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      ✓
                    </span>
                  )}
                </div>

                <p className="font-bold text-xs sm:text-sm text-foreground">{preset.name}</p>
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{preset.elementLabel}</p>

                <span className="mt-2 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-background/80 border border-border/60 text-foreground">
                  {preset.rushPlaystyle.split("/")[0]?.trim()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom Pokemon Selected Badge (if searching outside presets) */}
        {customPokemon && activePokemonEntry && (
          <div className="flex items-center justify-between rounded-xl border border-gold/40 bg-gold/10 p-3 text-xs">
            <div className="flex items-center gap-3">
              <PokemonIcon pokemon={activePokemonEntry.name} className="size-8" />
              <div>
                <p className="font-bold text-foreground flex items-center gap-1.5">
                  <span>Pokémon Personalizado Selecionado: {activePokemonEntry.name}</span>
                  <Chip tone="gold">{activePokemonEntry.type ?? "Normal"}</Chip>
                </p>
                <p className="text-muted-foreground text-[11px]">
                  Adaptamos a progressão usando o arquétipo mais próximo ({currentPreset.elementLabel}) com cálculos de 2.0x de dano.
                </p>
              </div>
            </div>
            <button
              onClick={() => setCustomPokemon(null)}
              className="rounded-lg border border-border bg-panel px-2.5 py-1 text-xs hover:bg-panel-strong text-foreground font-medium"
            >
              Voltar aos Iniciais
            </button>
          </div>
        )}

        {/* Selected Starter Overview Card */}
        <Panel className={`border border-border/80 bg-panel/90 p-4 space-y-2`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-2">
            <div className="flex items-center gap-2.5">
              <PokemonIcon pokemon={activePokemonEntry?.name ?? currentPreset.icon} className="size-7" />
              <div>
                <h3 className="font-bold text-sm text-foreground">
                  Linha de Evolução: {currentPreset.evolutionLine}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Estilo de Jogo: <span className="text-primary font-medium">{currentPreset.rushPlaystyle}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Chip tone="gold">Titan Rush</Chip>
              <Chip tone="success">100% Anti-KS</Chip>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed pt-1">
            {currentPreset.overview}
          </p>
        </Panel>
      </section>

      {/* =========================================================================
          CONTROLES DE FILTRO DE LOTAÇÃO & NAVEGAÇÃO ENTRE FASES
          ========================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-primary" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Filtro de Lotação do Servidor:
            </h2>
          </div>

          {/* Buttons for Crowding Filter */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setCrowdFilter("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                crowdFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-sm font-bold"
                  : "border border-border bg-panel text-muted-foreground hover:bg-panel-strong hover:text-foreground"
              }`}
            >
              🌐 Mostrar Todas (Principal + Alternativas)
            </button>
            <button
              onClick={() => setCrowdFilter("peaceful")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                crowdFilter === "peaceful"
                  ? "bg-emerald-600 text-white shadow-sm font-bold"
                  : "border border-border bg-panel text-emerald-400 hover:bg-panel-strong"
              }`}
            >
              🟢 Apenas Alternativas Menos Disputadas (Recomendado)
            </button>
            <button
              onClick={() => setCrowdFilter("meta")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                crowdFilter === "meta"
                  ? "bg-amber-600 text-white shadow-sm font-bold"
                  : "border border-border bg-panel text-amber-400 hover:bg-panel-strong"
              }`}
            >
              🔴 Apenas Hunts Meta Tradicionais
            </button>
          </div>
        </div>

        {/* Step Quick Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {currentPreset.steps.map((step, idx) => (
            <button
              key={step.stepNumber}
              onClick={() => setActiveStepTab(idx)}
              className={`flex flex-col p-2.5 rounded-xl border text-left transition-all ${
                activeStepTab === idx
                  ? "border-primary bg-primary/20 shadow-md ring-1 ring-primary"
                  : "border-border/70 bg-panel hover:bg-panel-strong hover:border-border"
              }`}
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-primary">{step.stepNumber}ª Hunt</span>
                <span className="text-muted-foreground font-mono">{step.levelRange}</span>
              </div>
              <p className="text-[11px] font-semibold text-foreground truncate mt-1">
                {step.title.split("—")[1]?.trim() || step.title}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* =========================================================================
          PROGRESSÃO PASSO A PASSO (1ª HUNT ➔ 2ª HUNT ➔ 3ª HUNT...)
          ========================================================================= */}
      <section className="space-y-8">
        {currentPreset.steps.map((step, stepIdx) => {
          const isCurrentTab = activeStepTab === stepIdx;

          // Filter options inside this step based on crowdFilter
          const visibleOptions = step.options.filter((opt) => {
            if (crowdFilter === "peaceful") return opt.crowdLevel === "low";
            if (crowdFilter === "meta") return opt.category === "meta";
            return true;
          });

          return (
            <div
              key={step.stepNumber}
              className={`space-y-4 rounded-2xl border p-5 sm:p-6 transition-all ${
                isCurrentTab
                  ? "border-primary/50 bg-panel/90 shadow-xl ring-1 ring-primary/30"
                  : "border-border/70 bg-panel/50 opacity-90 hover:opacity-100"
              }`}
            >
              {/* Step Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center rounded-lg bg-primary px-2.5 py-1 text-xs font-extrabold text-primary-foreground">
                      PASSO {step.stepNumber}
                    </span>
                    <span className="font-mono text-xs font-bold text-gold bg-gold/10 px-2.5 py-0.5 rounded-full border border-gold/30">
                      {step.levelRange}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {step.subtitle}
                  </p>
                </div>

                <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs space-y-0.5 max-w-sm">
                  <span className="font-bold text-primary flex items-center gap-1">
                    <Target className="size-3.5" /> Meta desta Fase:
                  </span>
                  <p className="text-[11px] text-muted-foreground">{step.keyGoal}</p>
                </div>
              </div>

              {/* Options Grid (Principal + Alternativas) */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-2">
                {visibleOptions.map((opt) => {
                  const isMeta = opt.category === "meta";
                  const isPeaceful = opt.crowdLevel === "low";

                  return (
                    <div
                      key={opt.id}
                      className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${
                        isMeta
                          ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/70"
                          : isPeaceful
                          ? "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/70"
                          : "border-border bg-panel-strong hover:border-border/80"
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Option Category & Crowd Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              isMeta
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : isPeaceful
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-panel text-muted-foreground border border-border"
                            }`}
                          >
                            {opt.categoryLabel}
                          </span>

                          <span className="text-[10px] font-semibold">{opt.crowdLabel}</span>
                        </div>

                        {/* Option Title & Target Mobs */}
                        <div>
                          <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                            <MapPin className="size-4 text-primary shrink-0" />
                            <span>{opt.name}</span>
                          </h4>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            📍 {opt.location}
                          </p>
                        </div>

                        {/* Target Pokemon Icons */}
                        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border/60 bg-background/60 p-2">
                          <span className="text-[10px] font-bold text-muted-foreground mr-1">Criaturas:</span>
                          {opt.targetMobs.map((mob) => (
                            <span
                              key={mob}
                              className="inline-flex items-center gap-1 rounded bg-panel px-1.5 py-0.5 text-[11px] font-medium text-foreground border border-border/50"
                            >
                              <PokemonIcon pokemon={mob} className="size-4 inline" />
                              <span>{mob}</span>
                            </span>
                          ))}
                        </div>

                        {/* Description */}
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {opt.description}
                        </p>

                        {/* Pro Tip Callout */}
                        <div className="rounded-lg border border-primary/25 bg-primary/10 p-2.5 text-[11px] text-foreground space-y-1">
                          <span className="font-bold text-primary flex items-center gap-1">
                            💡 Dica de Ouro Titan:
                          </span>
                          <p className="text-muted-foreground leading-tight">{opt.proTip}</p>
                        </div>
                      </div>

                      {/* Bottom Advantages & Map Link */}
                      <div className="pt-3 mt-3 border-t border-border/50 space-y-2">
                        {/* Advantages tags */}
                        <div className="flex flex-wrap gap-1">
                          {opt.advantages.map((adv, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 rounded bg-background px-2 py-0.5 text-[10px] text-muted-foreground border border-border/40 font-medium"
                            >
                              <CheckCircle2 className="size-2.5 text-emerald-400" />
                              {adv}
                            </span>
                          ))}
                        </div>

                        {/* Drops of Interest */}
                        {opt.dropsOfInterest && opt.dropsOfInterest.length > 0 && (
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <Coins className="size-3 text-gold" />
                            <span>Drops valiosos:</span>
                            <span className="font-semibold text-foreground">
                              {opt.dropsOfInterest.join(", ")}
                            </span>
                          </div>
                        )}

                        {/* External Map Link if any */}
                        {opt.mapLink && (
                          <div className="pt-1">
                            <ExternalLinkChip href={opt.mapLink} label="Ver Local no Mapa / Imagem" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* =========================================================================
          CHECKLIST & ESTRATÉGIAS EXCLUSIVAS DE ABERTURA DO NEW SERVER TITAN
          ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border/70 pb-2">
          <Sparkles className="size-5 text-gold" />
          <h2 className="text-xl font-bold text-foreground">
            Guia de Sobrevivência & Rush nas Primeiras 24 Horas do Titan
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Starter Box Free */}
          <Panel className="space-y-2 border-primary/30">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <span>🎁 1. Starter Box FREE na Store</span>
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ao entrar no servidor, abra a <strong>Store</strong> no menu superior do jogo, clique na aba <strong>Character</strong> e resgate a sua <strong>Starter Box gratuita</strong> com itens e poções.
            </p>
          </Panel>

          {/* Card 2: Moving Ticket */}
          <Panel className="space-y-2 border-primary/30">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <span>🎫 2. Moving Ticket para Saffron</span>
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dentro do laboratório em Pallet (área segura PZ), use o <strong>Moving Ticket</strong> do seu inventário e selecione <strong>Saffron</strong> como seu ponto de respawn principal.
            </p>
          </Panel>

          {/* Card 3: Anti-KS Strategy */}
          <Panel className="space-y-2 border-emerald-500/30">
            <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
              <span>⚡ 3. A Regra do KS (Kill Steal)</span>
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Disputar 1 monstro com 4 jogadores reduz sua XP em 75%. Mudar para uma <strong>hunt alternativa com 2.0x de dano</strong> garante até <strong>3x mais XP por hora</strong> no início.
            </p>
          </Panel>

          {/* Card 4: Economia de Stones */}
          <Panel className="space-y-2 border-gold/30">
            <h4 className="font-bold text-sm text-gold flex items-center gap-1.5">
              <span>💎 4. Economia de Pedras</span>
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Nas primeiras 72 horas do servidor, pedras de evolução (Fire, Water, Leaf, Thunder, Earth) valem muito. Guarde as do seu Pokémon e venda as outras por bom gold no game chat!
            </p>
          </Panel>
        </div>

        {/* Big Pro Tip Alert */}
        <div className="rounded-xl border border-primary/40 bg-gradient-to-r from-primary/10 via-panel to-gold/10 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
              <Flame className="size-4 text-amber-400" />
              <span>Deseja calcular dano super efetivo contra qualquer criatura do jogo?</span>
            </h4>
            <p className="text-xs text-muted-foreground">
              Utilize nossa ferramenta "Onde Caçar?" para cruzar o time inteiro e encontrar fraquezas de todos os monstros do mapa.
            </p>
          </div>

          <Link
            to="/onde-cacar"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shrink-0 shadow-md"
          >
            <span>Abrir Onde Caçar (2.0x)</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
