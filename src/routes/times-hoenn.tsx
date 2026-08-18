import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SectionTitle, Panel, Chip, TierBadge, PokemonIcon } from "@/components/pka/ui";
import { slugify } from "@/lib/pka";
import { Sparkles, Users, Shield, Zap, ThumbsUp, ThumbsDown, Info, ArrowUpRight, Flame, Droplets, Leaf, Skull, Moon, Compass, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/times-hoenn")({
  head: () => ({
    meta: [
      { title: "Guia de Times Iniciais para Hoenn — PKA Helper" },
      {
        name: "description",
        content: "Guia completo de rotações e times iniciais por elemento para desbravar Hoenn no PokeAlliance. Créditos: Shaolin Pig Slayer e Lucyaya (moon).",
      },
      { property: "og:title", content: "Guia de Times Iniciais para Hoenn — PKA Helper" },
      {
        property: "og:description",
        content: "Guia completo de rotações e times iniciais por elemento para desbravar Hoenn no PokeAlliance. Créditos: Shaolin Pig Slayer e Lucyaya (moon).",
      },
    ],
  }),
  component: HoennTeamsPage,
});

type PokeSlot = {
  name: string;
  tier: string;
  isOfftank?: boolean;
  stars?: number;
  note?: string;
};

type ElementTeam = {
  element: string;
  icon: string;
  badgeColor: string;
  initialTeam: PokeSlot[];
  upgrades: PokeSlot[];
  pros: string;
  cons: string;
  specialNote?: string;
};

const HOENN_TEAMS: ElementTeam[] = [
  {
    element: "Dark / Ghost",
    icon: "🌑",
    badgeColor: "from-zinc-600/30 to-purple-900/30 border-purple-500/40 text-purple-300",
    initialTeam: [
      { name: "Mightyena", tier: "T2", isOfftank: true, stars: 2 },
      { name: "Shiny Persian", tier: "T2", isOfftank: true, stars: 2 },
      { name: "Gengar", tier: "T2" },
      { name: "Shiny Umbreon", tier: "T1" },
      { name: "Shiny Hitmonchan", tier: "T1" },
      { name: "Dusknoir", tier: "T1" },
    ],
    upgrades: [
      { name: "Shiny Houndoom", tier: "SR" },
      { name: "Shiny Hydreigon", tier: "SR" },
      { name: "Shiny Misdreavus", tier: "SR" },
      { name: "Shiny Tauros", tier: "SR" },
      { name: "Shiny Dusknoir", tier: "SR" },
    ],
    pros: "Time muito forte com várias opções de upgrades para SR.",
    cons: "Offtanks iniciais são medianos e o time tende a ser caro no mercado.",
  },
  {
    element: "Electric",
    icon: "⚡",
    badgeColor: "from-yellow-500/30 to-amber-600/30 border-yellow-500/40 text-yellow-300",
    initialTeam: [
      { name: "Luxray", tier: "T1", isOfftank: true },
      { name: "Electabuzz", tier: "T2", isOfftank: true, stars: 2 },
      { name: "Pachirisu", tier: "T2", isOfftank: true, stars: 2 },
      { name: "Shiny Ampharos", tier: "T1" },
      { name: "Shiny Raichu", tier: "T1" },
      { name: "Shiny Jolteon", tier: "T1" },
    ],
    upgrades: [
      { name: "Shiny Luxray", tier: "SR", isOfftank: true },
      { name: "Shiny Pachirisu", tier: "SR", isOfftank: true },
    ],
    pros: "Time forte, muito bem balanceado e relativamente barato de montar.",
    cons: "Hunts subaquáticas (underwater) exigem cuidados.",
  },
  {
    element: "Fairy",
    icon: "✨",
    badgeColor: "from-pink-500/30 to-rose-600/30 border-pink-500/40 text-pink-300",
    initialTeam: [
      { name: "Mega Clefable", tier: "T1", isOfftank: true },
      { name: "Shiny Granbull", tier: "T2", isOfftank: true, stars: 2 },
      { name: "Mimikyu", tier: "T2", isOfftank: true, stars: 2 },
      { name: "Sylveon", tier: "T2", isOfftank: true, stars: 2 },
      { name: "Shiny Wigglytuff", tier: "T2", stars: 2 },
      { name: "Florges", tier: "T2", isOfftank: true, stars: 2 },
    ],
    upgrades: [
      { name: "Shiny Mimikyu", tier: "SR", isOfftank: true },
      { name: "Togetic", tier: "T4", note: "Bagulho é uma arma!" },
      { name: "Shiny Florges", tier: "SR", isOfftank: true },
    ],
    pros: "Muitos Pokémon T2, tornando o time muito acessível para iniciantes.",
    cons: "Nenhum ponto negativo muito relevante.",
  },
  {
    element: "Fighting",
    icon: "🥊",
    badgeColor: "from-red-600/30 to-rose-700/30 border-red-500/40 text-red-300",
    initialTeam: [
      { name: "Shiny Hitmontop", tier: "T1", isOfftank: true },
      { name: "Shiny Poliwrath", tier: "T1", isOfftank: true },
      { name: "Shiny Hitmonlee", tier: "T1" },
      { name: "Shiny Heracross", tier: "T2", isOfftank: true, stars: 2 },
      { name: "Shiny Hitmonchan", tier: "T1" },
      { name: "Shiny Ledian", tier: "T3", stars: 3 },
    ],
    upgrades: [
      { name: "Shiny Machamp", tier: "SR", isOfftank: true },
      { name: "Shiny Kangaskhan", tier: "SR" },
      { name: "Shiny Hariyama", tier: "T1", isOfftank: true },
    ],
    pros: "Time forte, bem balanceado e com ampla variedade de opções de hunt.",
    cons: "Stuns em área pequena e muitos ataques frontais; exige maior habilidade e posicionamento do jogador.",
  },
  {
    element: "Fire",
    icon: "🔥",
    badgeColor: "from-orange-500/30 to-amber-600/30 border-orange-500/40 text-orange-300",
    initialTeam: [
      { name: "Arcanine", tier: "T2", isOfftank: true, stars: 2 },
      { name: "Shiny Typhlosion", tier: "T1", isOfftank: true },
      { name: "Infernape", tier: "T1" },
      { name: "Shiny Charizard", tier: "T1" },
      { name: "Shiny Ninetales", tier: "T1" },
      { name: "Shiny Flareon", tier: "T1" },
      { name: "Shiny Rapidash", tier: "T1", isOfftank: true },
    ],
    upgrades: [
      { name: "Shiny Infernape", tier: "SR" },
      { name: "Shiny Arcanine", tier: "SR", isOfftank: true },
    ],
    pros: "Hunts excelentes e muitas opções de Pokémon para encaixar nas rotações.",
    cons: "Tende a ser caro no mercado mesmo sem grande pico de demanda.",
  },
  {
    element: "Flying",
    icon: "🦅",
    badgeColor: "from-cyan-500/30 to-sky-600/30 border-cyan-500/40 text-cyan-300",
    initialTeam: [
      { name: "Shiny Pidgeot", tier: "T1", isOfftank: true },
      { name: "Shiny Mantine", tier: "T1", isOfftank: true },
      { name: "Shiny Farfetch'd", tier: "T1" },
      { name: "Shiny Dodrio", tier: "T1" },
      { name: "Shiny Gliscor", tier: "SR", isOfftank: true },
      { name: "Gliscor", tier: "T1", isOfftank: true },
    ],
    upgrades: [
      { name: "Shiny Swellow", tier: "SR" },
      { name: "Shiny Beautifly", tier: "T1", isOfftank: true, note: "Puxão em área + s.geot" },
    ],
    pros: "Time muito forte, combos rápidos e dano em grande área; exige pouca habilidade mecânica.",
    cons: "Caro e pouco acessível; geralmente você precisará projetar seus próprios Pokémon ou pagar caro.",
  },
  {
    element: "Grass",
    icon: "🌿",
    badgeColor: "from-emerald-500/30 to-green-600/30 border-emerald-500/40 text-emerald-300",
    initialTeam: [
      { name: "Tangrowth", tier: "T1", isOfftank: true },
      { name: "Shiny Venusaur", tier: "T1", isOfftank: true },
      { name: "Gogoat", tier: "T1", isOfftank: true },
      { name: "Shiny Meganium", tier: "T1", isOfftank: true },
      { name: "Shiny Victreebel", tier: "T3", stars: 3 },
      { name: "Shiny Bellossom", tier: "T3", stars: 3 },
      { name: "Shiny Tangela", tier: "T2", stars: 2 },
      { name: "Shiny Exeggutor", tier: "T2", stars: 2 },
    ],
    upgrades: [
      { name: "Shiny Tangrowth", tier: "SR", isOfftank: true },
      { name: "Shiny Gogoat", tier: "SR", isOfftank: true },
      { name: "Tropius", tier: "T2", stars: 2 },
    ],
    pros: "Provavelmente o time mais forte e ao mesmo tempo mais barato! O primeiro a fechar 2x2x2 com T2 e T3 absurdamente fortes.",
    cons: "Por ser tão acessível e forte, as melhores hunts costumam ser bem disputadas; hunts underwater.",
  },
  {
    element: "Ground",
    icon: "🏜️",
    badgeColor: "from-amber-600/30 to-yellow-700/30 border-amber-500/40 text-amber-300",
    initialTeam: [
      { name: "Shiny Steelix", tier: "T1", isOfftank: true },
      { name: "Shiny Nidoqueen", tier: "T1", isOfftank: true },
      { name: "Torterra", tier: "T1" },
      { name: "Shiny Rhydon", tier: "T2", isOfftank: true, stars: 2 },
      { name: "Shiny Piloswine", tier: "T2", stars: 2 },
      { name: "Shiny Marowak", tier: "T1" },
    ],
    upgrades: [
      { name: "Shiny Torterra", tier: "SR" },
      { name: "Shiny Camerupt", tier: "T1" },
      { name: "Shiny Pupitar", tier: "SR" },
      { name: "Shiny Whiscash", tier: "T1" },
    ],
    pros: "Time forte, equilibrado, com vastas opções de hunt e jogabilidade tranquila.",
    cons: "Por ser muito visado e eficiente, a alta procura encarece os Pokémon no market.",
  },
  {
    element: "Ice",
    icon: "❄️",
    badgeColor: "from-sky-400/30 to-blue-500/30 border-sky-400/40 text-sky-200",
    initialTeam: [
      { name: "Shiny Lapras", tier: "T1", isOfftank: true },
      { name: "Glaceon", tier: "T2", isOfftank: true, stars: 2 },
      { name: "Shiny Jynx", tier: "T1" },
      { name: "Shiny Hitmonchan", tier: "T1" },
      { name: "Abomasnow", tier: "T2", stars: 2 },
      { name: "Shiny Smeargle Ice", tier: "T1", note: "Cooldown de SR" },
      { name: "Castform Snow", tier: "T2", note: "Opção para teste" },
      { name: "Shiny Castform Snow", tier: "T1", note: "Opção para teste" },
    ],
    upgrades: [
      { name: "Shiny Walrein", tier: "SR" },
    ],
    pros: "Muitas hunts exclusivas de gelo, incluindo acesso a 2 respawns UR.",
    cons: "Não possui defesas naturais contra praticamente nada e é difícil de montar. Compensa mesclar offtanks de outros elementos e usar os Ice como burst damage.",
  },
  {
    element: "Poison",
    icon: "🧪",
    badgeColor: "from-purple-600/30 to-fuchsia-700/30 border-purple-500/40 text-purple-300",
    initialTeam: [
      { name: "Shiny Muk", tier: "T1", isOfftank: true },
      { name: "Shiny Tentacruel", tier: "T1", isOfftank: true },
      { name: "Shiny Nidoking", tier: "T1" },
      { name: "Shiny Arbok", tier: "T3", stars: 3 },
      { name: "Shiny Qwilfish", tier: "T3", isOfftank: true, stars: 3 },
      { name: "Toxicroak", tier: "T2", stars: 2 },
      { name: "Swalot", tier: "T2", stars: 2 },
    ],
    upgrades: [
      { name: "Shiny Toxicroak", tier: "SR" },
      { name: "Shiny Seviper", tier: "SR" },
    ],
    pros: "Time barato e razoavelmente fácil de montar.",
    cons: "Caça poucos elementos com eficiência total; o ideal é mesclar com outros tipos.",
  },
  {
    element: "Psychic",
    icon: "🔮",
    badgeColor: "from-pink-600/30 to-purple-700/30 border-pink-500/40 text-pink-300",
    initialTeam: [
      { name: "Shiny Espeon", tier: "T1", isOfftank: true },
      { name: "Shiny Slowking", tier: "T1", isOfftank: true },
      { name: "Shiny Smeargle Psy", tier: "T1", note: "Cooldown de SR" },
      { name: "Alakazam", tier: "T2", isOfftank: true, stars: 2 },
      { name: "Shiny Wobbuffet", tier: "SR" },
      { name: "Shiny Mr. Mime", tier: "SR" },
      { name: "Wobbuffet", tier: "T2", note: "Opção para teste" },
    ],
    upgrades: [],
    pros: "Poucos pontos fortes de destaque no momento.",
    cons: "Poucas opções de Pokémon e caça poucas hunts com vantagem.",
  },
  {
    element: "Rock",
    icon: "🪨",
    badgeColor: "from-amber-700/30 to-stone-700/30 border-amber-600/40 text-amber-200",
    initialTeam: [
      { name: "Rhyperior", tier: "T1", isOfftank: true },
      { name: "Shiny Magcargo", tier: "T1", isOfftank: true },
      { name: "Shiny Golem", tier: "T1" },
      { name: "Shiny Miltank", tier: "T1" },
      { name: "Rampardos", tier: "T1", isOfftank: true },
      { name: "Tyranitar", tier: "T2", stars: 2 },
      { name: "Shiny Lunatone", tier: "T1" },
      { name: "Shiny Solrock", tier: "T1" },
    ],
    upgrades: [
      { name: "Shiny Armaldo", tier: "SR" },
    ],
    pros: "Rotação fortíssima de dano/defesa com excelentes offtanks, custo baixo para estrelar e caça o próprio SR de Hoenn.",
    cons: "Sem muitas opções de variação além das peças-chave.",
  },
  {
    element: "Steel",
    icon: "🛡️",
    badgeColor: "from-slate-500/30 to-zinc-600/30 border-slate-400/40 text-slate-200",
    initialTeam: [
      { name: "Shiny Metang", tier: "T1", isOfftank: true },
      { name: "Shiny Mawile", tier: "T1" },
      { name: "Shiny Smeargle Steel", tier: "T1", note: "Cooldown de SR" },
    ],
    upgrades: [
      { name: "Shiny Skarmory", tier: "SR" },
      { name: "Shiny Aggron", tier: "SR", isOfftank: true },
      { name: "Shiny Metagross", tier: "UR" },
      { name: "Shiny Scizor", tier: "LD" },
    ],
    pros: "Pokémon com cooldowns rápidos, altíssima durabilidade e grande potencial de escalonamento até LD.",
    cons: "Exige Pokémon específicos de Hoenn que você mesmo terá que projetar; recomendado mesclar com outros elementos.",
  },
  {
    element: "Water",
    icon: "🌊",
    badgeColor: "from-blue-600/30 to-cyan-600/30 border-blue-500/40 text-blue-300",
    initialTeam: [
      { name: "Shiny Blastoise", tier: "T1", isOfftank: true },
      { name: "Shiny Feraligatr", tier: "T1", isOfftank: true },
      { name: "Shiny Vaporeon", tier: "T1", isOfftank: true },
      { name: "Shiny Politoed", tier: "T1" },
      { name: "Milotic", tier: "T2", stars: 2 },
      { name: "Shiny Starmie", tier: "T2", stars: 2 },
    ],
    upgrades: [
      { name: "Shiny Sharpedo", tier: "SR" },
      { name: "Shiny Kingdra", tier: "SR" },
    ],
    pros: "Time forte, extremamente balanceado e barato de montar.",
    cons: "Poucas desvantagens notáveis.",
  },
];

const INCOMPLETE_ROUTINES = [
  {
    element: "Bug 🐛",
    desc: "Peças-chave: Shiny Pinsir (SR), Shiny Scyther (SR), Scolipede (T2), Shiny Cacturne (T1). Rotação incompleta no momento.",
  },
  {
    element: "Dragon 🐉",
    desc: '"Loucura, nem inventa." — Poucas opções viáveis para montar time fechado inicial em Hoenn.',
  },
];

function HoennTeamsPage() {
  const [selectedElement, setSelectedElement] = useState<string>("all");

  const filteredTeams = useMemo(() => {
    if (selectedElement === "all") return HOENN_TEAMS;
    return HOENN_TEAMS.filter((t) => t.element.toLowerCase().includes(selectedElement.toLowerCase()));
  }, [selectedElement]);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <SectionTitle
          icon="🗺️"
          title="Guia de Times Iniciais para Hoenn"
          subtitle="Sugestões de composições e rotações por elemento para começar a desbravar a região de Hoenn no PKA."
        />
      </div>

      {/* DISCLAIMER IMPORTANTE */}
      <div className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-4 sm:p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2.5 text-amber-400">
          <AlertTriangle className="size-5 shrink-0" />
          <h2 className="text-sm sm:text-base font-bold text-amber-300">
            ⚠️ Disclaimer Importante: Pesquise Antes de Investir Alto!
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed pl-7">
          Antes de gastar grandes quantias de <strong>KKs, Diamonds (DD), Star Ascension ou Boost Stones</strong> em qualquer time ou elemento, <strong>pesquise a fundo</strong>: analise a disponibilidade e disputa das hunts no seu servidor, confira os preços do market e tire dúvidas com jogadores mais experientes. As composições aqui listadas são <strong>sugestões e referências da comunidade</strong> e o meta pode variar de acordo com o seu estilo de jogo e objetivos.
        </p>
      </div>

      {/* CRÉDITOS E NOTAS IMPORTANTES */}
      <Panel className="border-primary/40 bg-primary/5 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-gold shrink-0" />
          <h2 className="text-sm font-bold text-foreground">
            Créditos do Guia: <span className="text-gold">Shaolin Pig Slayer (moon)</span> &amp; <span className="text-gold">Lucyaya (moon)</span>
          </h2>
        </div>

        <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3 border-t border-border/50 pt-2.5">
          <div className="flex items-start gap-2">
            <span className="font-bold text-primary">1.</span>
            <span>A divisão de rotações são <strong>sugestões</strong>. O ideal é testar por si mesmo e ver o que se adapta melhor ao seu estilo.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-primary">2.</span>
            <span>Em todas as rotações você pode encaixar <strong>Shiny Smeargle</strong> do elemento da rotação (T1 com bom dano e CDs de SR, mas frágil).</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-primary">3.</span>
            <span><strong>Shiny Hitmonchan</strong> é um coringa com <em>Elemental Hands</em> e entra em 5 rotações: Lutador, Fogo, Elétrico, Gelo e Fantasma.</span>
          </div>
        </div>
      </Panel>

      {/* FILTRO DE ELEMENTOS */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground mr-1">Filtrar Elemento:</span>
        <button
          onClick={() => setSelectedElement("all")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            selectedElement === "all"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "border border-border bg-panel text-muted-foreground hover:text-foreground"
          }`}
        >
          🌐 Todos ({HOENN_TEAMS.length})
        </button>
        {HOENN_TEAMS.map((t) => (
          <button
            key={t.element}
            onClick={() => setSelectedElement(t.element)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              selectedElement === t.element
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border bg-panel text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.element}</span>
          </button>
        ))}
      </div>

      {/* CARDS DOS TIMES */}
      <div className="grid gap-6">
        {filteredTeams.map((team) => (
          <div
            key={team.element}
            className="panel overflow-hidden border-border transition-all hover:border-primary/40 space-y-4 p-5 sm:p-6"
          >
            {/* Header do Time */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{team.icon}</span>
                <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                  Time de {team.element}
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">
                {team.initialTeam.length} Iniciais • {team.upgrades.length} Upgrades
              </span>
            </div>

            {/* Grid de Conteúdo */}
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Coluna 1: Time Inicial (7 colunas) */}
              <div className="space-y-3 lg:col-span-7">
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Users className="size-4 text-primary" />
                  <span>Composição Inicial Recomendada:</span>
                </p>

                <div className="grid gap-2 sm:grid-cols-2">
                  {team.initialTeam.map((poke, pi) => (
                    <div
                      key={pi}
                      className="flex items-center justify-between rounded-lg border border-border bg-panel-strong p-2.5"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <PokemonIcon pokemon={poke.name} className="size-7 shrink-0" />
                        <div className="min-w-0">
                          <Link
                            to="/pokemon/$slug"
                            params={{ slug: slugify(poke.name) }}
                            className="text-xs font-semibold hover:text-primary truncate block"
                          >
                            {poke.name}
                          </Link>
                          <div className="flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground">
                            {poke.isOfftank && <span className="text-gold font-medium">Offtank</span>}
                            {poke.stars && <span>• {poke.stars}★</span>}
                            {poke.note && <span className="italic text-primary/80">({poke.note})</span>}
                          </div>
                        </div>
                      </div>
                      <TierBadge tier={poke.tier} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Coluna 2: Upgrades SR & Futuros (5 colunas) */}
              <div className="space-y-3 lg:col-span-5">
                <p className="text-xs font-bold text-gold flex items-center gap-1.5">
                  <ArrowUpRight className="size-4 text-gold" />
                  <span>O que pode melhorar (Upgrades / SR):</span>
                </p>

                {team.upgrades.length === 0 ? (
                  <div className="rounded-lg border border-border bg-panel-strong p-3 text-xs text-muted-foreground italic">
                    Sem upgrades diretos essenciais no momento.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {team.upgrades.map((up, ui) => (
                      <div
                        key={ui}
                        className="flex items-center justify-between rounded-lg border border-gold/30 bg-gold/5 p-2.5"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <PokemonIcon pokemon={up.name} className="size-6 shrink-0" />
                          <div className="min-w-0">
                            <Link
                              to="/pokemon/$slug"
                              params={{ slug: slugify(up.name) }}
                              className="text-xs font-semibold text-foreground hover:text-primary truncate block"
                            >
                              {up.name}
                            </Link>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              {up.isOfftank && <span className="text-gold">Offtank</span>}
                              {up.note && <span className="text-primary italic">({up.note})</span>}
                            </div>
                          </div>
                        </div>
                        <TierBadge tier={up.tier} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Prós e Contras */}
            <div className="grid gap-3 pt-2 sm:grid-cols-2 border-t border-border/50">
              <div className="rounded-lg border border-success/30 bg-success/10 p-3 space-y-1">
                <p className="text-xs font-bold text-success flex items-center gap-1">
                  <ThumbsUp className="size-3.5" />
                  <span>Prós:</span>
                </p>
                <p className="text-xs text-foreground/90">{team.pros}</p>
              </div>

              <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 space-y-1">
                <p className="text-xs font-bold text-danger flex items-center gap-1">
                  <ThumbsDown className="size-3.5" />
                  <span>Contras:</span>
                </p>
                <p className="text-xs text-foreground/90">{team.cons || "Nenhum ponto negativo relevante."}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ROTAÇÕES INCOMPLETAS */}
      <Panel className="space-y-3 border-border/80">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Info className="size-4 text-gold" />
          <span>Rotações Incompletas ou Não Recomendadas:</span>
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {INCOMPLETE_ROUTINES.map((inc, i) => (
            <div key={i} className="rounded-lg border border-border bg-panel-strong p-3 space-y-1">
              <p className="text-xs font-bold text-foreground">{inc.element}</p>
              <p className="text-xs text-muted-foreground">{inc.desc}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
