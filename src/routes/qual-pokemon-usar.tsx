import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  SectionTitle,
  Panel,
  ExternalLinkChip,
  Chip,
  TierBadge,
  PokemonIcon,
} from "@/components/pka/ui";
import { pokemonList, norm, slugify, type PokemonEntry } from "@/lib/pka";
import {
  analyzeTargetPokemon,
  POKEMON_TYPES_INFO,
  type CounterOption,
} from "@/lib/matchup";
import {
  Target,
  Sword,
  Shield,
  Sparkles,
  MapPin,
  Flame,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  Zap,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

export const Route = createFileRoute("/qual-pokemon-usar")({
  head: () => ({
    meta: [
      { title: "Qual Pokémon Usar? — Calculadora de Counters & Caça — PKA Helper" },
      {
        name: "description",
        content:
          "Descubra qual Pokémon usar para caçar qualquer alvo no PokeAlliance: matchups perfeitos com 2.0x de dano, defesa resistente, faixas de nível e dicas de caça.",
      },
      { property: "og:title", content: "Qual Pokémon Usar? — Calculadora de Counters — PKA Helper" },
      {
        property: "og:description",
        content:
          "Descubra qual Pokémon usar para caçar qualquer alvo no PokeAlliance: matchups perfeitos com 2.0x de dano, defesa resistente e faixas de nível.",
      },
    ],
  }),
  component: WhichPokemonToUsePage,
});

const POPULAR_TARGETS = [
  "Gyarados",
  "Charizard",
  "Gengar",
  "Dragonite",
  "Alakazam",
  "Tyranitar",
  "Snorlax",
  "Scizor",
  "Electabuzz",
  "Magmar",
  "Steelix",
  "Blastoise",
  "Venusaur",
  "Lapras",
  "Kingdra",
];

function WhichPokemonToUsePage() {
  const [selectedTargetName, setSelectedTargetName] = useState<string>("Gyarados");
  const [searchTargetInput, setSearchTargetInput] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"perfect" | "all" | "byLevel" | "tanks">("perfect");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [hideShinies, setHideShinies] = useState<boolean>(false);
  const [counterSearchText, setCounterSearchText] = useState<string>("");

  // Analysis of current target
  const targetAnalysis = useMemo(() => {
    return analyzeTargetPokemon(selectedTargetName);
  }, [selectedTargetName]);

  // Target search suggestions
  const targetSuggestions = useMemo(() => {
    if (!searchTargetInput.trim()) return [];
    const nq = norm(searchTargetInput);
    return pokemonList
      .filter((p) => norm(p.name).includes(nq))
      .slice(0, 8);
  }, [searchTargetInput]);

  // Filtered counter list
  const filteredCounters = useMemo(() => {
    if (!targetAnalysis) return [];

    let list: CounterOption[] = [];
    if (activeTab === "perfect") {
      list = targetAnalysis.perfectCounters.length > 0 ? targetAnalysis.perfectCounters : targetAnalysis.allCounters;
    } else if (activeTab === "all") {
      list = targetAnalysis.allCounters;
    } else if (activeTab === "tanks") {
      list = targetAnalysis.tankCounters.length > 0 ? targetAnalysis.tankCounters : targetAnalysis.allCounters;
    } else if (activeTab === "byLevel") {
      list = targetAnalysis.allCounters;
    }

    return list.filter((c) => {
      if (hideShinies && c.isShiny) return false;
      if (tierFilter !== "all" && c.tier !== tierFilter) return false;
      if (typeFilter !== "all" && norm(c.type) !== norm(typeFilter)) return false;
      if (counterSearchText.trim()) {
        const nq = norm(counterSearchText);
        if (!norm(c.pokemon.name).includes(nq) && !norm(c.type).includes(nq)) {
          return false;
        }
      }
      return true;
    });
  }, [targetAnalysis, activeTab, hideShinies, tierFilter, typeFilter, counterSearchText]);

  const selectTarget = (name: string) => {
    setSelectedTargetName(name);
    setSearchTargetInput("");
  };

  const targetTypeInfo = useMemo(() => {
    if (!targetAnalysis?.entry.type) return null;
    return POKEMON_TYPES_INFO.find((t) => norm(t.id) === norm(targetAnalysis.entry.type ?? "")) ?? null;
  }, [targetAnalysis]);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card/80 to-primary/5 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/20">
              <Target className="w-3.5 h-3.5" />
              <span>Calculadora de Caça & Counters</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              Qual Pokémon Usar para Caçar?
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
              Escolha o Pokémon que você quer caçar e descubra instantaneamente as melhores opções para
              derrotá-lo com <strong>2.0x de dano super efetivo</strong>, resistência defensiva e economia de recursos.
            </p>
          </div>

          {/* Quick links banner */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/onde-cacar"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-secondary hover:bg-secondary/80 text-foreground transition-all border border-border"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              Ver Mapa Onde Caçar
            </Link>
            <Link
              to="/pokedex"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-secondary hover:bg-secondary/80 text-foreground transition-all border border-border"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              Consultar Pokédex
            </Link>
          </div>
        </div>
      </div>

      {/* Target Selector & Search */}
      <div className="space-y-4">
        <Panel className="p-5 border-border/80 bg-card/60 backdrop-blur-sm shadow-md">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Selecione o Pokémon que você deseja caçar (Alvo):
              </label>
              <span className="text-xs text-muted-foreground">
                Alvo Atual: <strong className="text-primary">{selectedTargetName}</strong>
              </span>
            </div>

            {/* Target search input */}
            <div className="relative">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Digite o nome do Pokémon alvo (ex: Gyarados, Charizard, Gengar, Dragonite...)"
                  value={searchTargetInput}
                  onChange={(e) => setSearchTargetInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>

              {/* Suggestions dropdown */}
              {targetSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md shadow-2xl p-2 max-h-72 overflow-y-auto">
                  <p className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Resultados ({targetSuggestions.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-1.5 mt-1">
                    {targetSuggestions.map((p) => (
                      <button
                        key={p.name}
                        onClick={() => selectTarget(p.name)}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs font-medium hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20"
                      >
                        <PokemonIcon pokemon={p.name} className="w-7 h-7 object-contain shrink-0" />
                        <div className="truncate">
                          <p className="font-semibold truncate">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.type ?? "Normal"} • {p.tier ?? "T4"}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Popular target buttons */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>Alvos Populares Mais Procurados:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_TARGETS.map((name) => {
                  const isSelected = norm(name) === norm(selectedTargetName);
                  return (
                    <button
                      key={name}
                      onClick={() => selectTarget(name)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                          : "bg-secondary/70 hover:bg-secondary text-foreground hover:text-primary border border-border/50"
                      }`}
                    >
                      <PokemonIcon pokemon={name} className="w-4 h-4 object-contain" />
                      <span>{name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* Target Analysis Details Card */}
      {targetAnalysis ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Target Overview Banner */}
          <div className="lg:col-span-4 space-y-4">
            <Panel className="p-5 border-border/80 bg-gradient-to-b from-card to-card/70 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                    Pokémon Alvo
                  </h2>
                </div>
                {targetAnalysis.entry.tier && (
                  <TierBadge tier={targetAnalysis.entry.tier} />
                )}
              </div>

              {/* Target presentation */}
              <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-secondary/30 border border-border/40 text-center relative overflow-hidden">
                <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center relative my-1">
                  <PokemonIcon
                    pokemon={targetAnalysis.entry.name}
                    className="w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] transition-transform hover:scale-110"
                  />
                </div>
                <h3 className="text-xl font-extrabold text-foreground mt-2">
                  {targetAnalysis.entry.name}
                </h3>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                  {targetTypeInfo && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${targetTypeInfo.badgeClass}`}>
                      {targetTypeInfo.icon} {targetTypeInfo.label}
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                    {targetAnalysis.areas.length > 0 ? "Spawns no Mapa" : "Spawns Especiais"}
                  </span>
                </div>
                <Link
                  to={`/pokemon/${targetAnalysis.entry.slug}`}
                  className="mt-3 text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                >
                  Ver perfil completo na Pokédex <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Weaknesses (Take 2.0x) */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Fraquezas do Alvo (Causa 2.0x de Dano):
                </p>
                {targetAnalysis.weakAgainstTypes.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {targetAnalysis.weakAgainstTypes.map((tId) => {
                      const info = POKEMON_TYPES_INFO.find((item) => item.id === tId);
                      return (
                        <span
                          key={tId}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        >
                          <span>{info?.icon ?? "⚡"}</span>
                          <span>{info?.label ?? tId}</span>
                          <span className="text-[10px] opacity-80">(2.0x)</span>
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Nenhuma fraqueza direta identificada.</p>
                )}
              </div>

              {/* Resistances (Take 0.5x - Avoid using) */}
              {targetAnalysis.resistsTypes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Evite Usar (O Alvo Resiste - Dano 0.5x):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {targetAnalysis.resistsTypes.map((tId) => {
                      const info = POKEMON_TYPES_INFO.find((item) => item.id === tId);
                      return (
                        <span
                          key={tId}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 line-through decoration-rose-500/50"
                        >
                          <span>{info?.icon ?? "🛡️"}</span>
                          <span>{info?.label ?? tId}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Where target spawns */}
              <div className="space-y-2 pt-2 border-t border-border/50">
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  Onde Encontrar {targetAnalysis.entry.name}:
                </p>
                {targetAnalysis.areas.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {targetAnalysis.areas.map((area, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-secondary/40 border border-border/40 text-xs flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground truncate">{area.rawArea}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              area.kind === "hoenn_tubos"
                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                : area.kind === "wildscape"
                                  ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                                  : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                            }`}
                          >
                            {area.label}
                          </span>
                        </div>
                        {area.note && <p className="text-[11px] text-muted-foreground">{area.note}</p>}
                        {area.link && <ExternalLinkChip link={area.link} label="Abrir Posição no Mapa" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Sem localização registrada no mapa aberto (possível Dungeon, Boss ou Evento).
                  </p>
                )}
              </div>

              {/* Drops */}
              {targetAnalysis.allDrops.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    Drops Notáveis de {targetAnalysis.entry.name}:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {targetAnalysis.allDrops.map((drop, idx) => {
                      const isValuable = targetAnalysis.valuableDrops.includes(drop);
                      return (
                        <span
                          key={idx}
                          className={`text-xs px-2 py-0.5 rounded-md border font-medium ${
                            isValuable
                              ? "bg-amber-500/15 text-amber-400 border-amber-500/30 font-semibold"
                              : "bg-secondary/60 text-muted-foreground border-border/50"
                          }`}
                        >
                          {drop}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </Panel>
          </div>

          {/* Right: Counter Recommendations Grid */}
          <div className="lg:col-span-8 space-y-4">
            {/* Strategy Highlights & Tabs */}
            <div className="space-y-3">
              {/* Category tabs */}
              <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
                <button
                  onClick={() => setActiveTab("perfect")}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "perfect"
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                      : "bg-secondary/70 hover:bg-secondary text-foreground hover:text-emerald-400"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>⭐ Matchup Perfeito (2.0x + Defesa)</span>
                  <span className="px-1.5 py-0.2 rounded bg-black/20 text-[11px]">
                    {targetAnalysis.perfectCounters.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("all")}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "all"
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "bg-secondary/70 hover:bg-secondary text-foreground hover:text-primary"
                  }`}
                >
                  <Sword className="w-3.5 h-3.5" />
                  <span>⚡ Todos com Super Efetivo</span>
                  <span className="px-1.5 py-0.2 rounded bg-black/20 text-[11px]">
                    {targetAnalysis.allCounters.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("byLevel")}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "byLevel"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "bg-secondary/70 hover:bg-secondary text-foreground hover:text-indigo-400"
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>🔰 Por Faixa de Nível</span>
                </button>

                <button
                  onClick={() => setActiveTab("tanks")}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "tanks"
                      ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
                      : "bg-secondary/70 hover:bg-secondary text-foreground hover:text-sky-400"
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>🛡️ Tanks & Defensores</span>
                  <span className="px-1.5 py-0.2 rounded bg-black/20 text-[11px]">
                    {targetAnalysis.tankCounters.length}
                  </span>
                </button>
              </div>

              {/* Filters bar */}
              <Panel className="p-3.5 border-border/70 bg-card/40 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filtrar:</span>
                  </div>

                  {/* Tier filter */}
                  <select
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-background border border-border text-foreground font-medium outline-none focus:border-primary"
                  >
                    <option value="all">Todos os Tiers</option>
                    <option value="T1">Tier 1 (High End)</option>
                    <option value="T2">Tier 2</option>
                    <option value="T3">Tier 3</option>
                    <option value="T4">Tier 4</option>
                    <option value="T5">Tier 5</option>
                    <option value="T6">Tier 6 (Iniciante)</option>
                    <option value="SR">Super Rare (SR)</option>
                    <option value="UR">Ultra Rare (UR)</option>
                  </select>

                  {/* Type filter */}
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-background border border-border text-foreground font-medium outline-none focus:border-primary"
                  >
                    <option value="all">Todos os Elementos</option>
                    {POKEMON_TYPES_INFO.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.icon} {t.label}
                      </option>
                    ))}
                  </select>

                  {/* Hide Shinies Toggle */}
                  <button
                    onClick={() => setHideShinies(!hideShinies)}
                    className={`px-2.5 py-1 rounded-lg border font-medium transition-all ${
                      hideShinies
                        ? "bg-primary/20 border-primary text-primary font-semibold"
                        : "bg-background border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {hideShinies ? "✓ Apenas Normais" : "Mostrar Shinies"}
                  </button>
                </div>

                {/* Counter text search */}
                <div className="relative min-w-[180px]">
                  <input
                    type="text"
                    placeholder="Buscar nos counters..."
                    value={counterSearchText}
                    onChange={(e) => setCounterSearchText(e.target.value)}
                    className="w-full px-2.5 py-1 pl-7 rounded-lg bg-background border border-border text-xs text-foreground outline-none focus:border-primary"
                  />
                  <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2" />
                </div>
              </Panel>
            </div>

            {/* Level Tier View Mode */}
            {activeTab === "byLevel" ? (
              <div className="space-y-6">
                {/* Budget Tier (Iniciantes) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <h3 className="text-sm font-bold text-foreground">
                      🔰 Opções para Iniciantes & Custo-Benefício (Tiers T5 - T6 • Nível 20 ao 65)
                    </h3>
                  </div>
                  {targetAnalysis.budgetCounters.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {targetAnalysis.budgetCounters
                        .filter((c) => (!hideShinies || !c.isShiny))
                        .slice(0, 6)
                        .map((counter, idx) => (
                          <CounterCard key={idx} counter={counter} targetName={selectedTargetName} />
                        ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Nenhum counter iniciante direto encontrado.</p>
                  )}
                </div>

                {/* Mid Tier (Intermediários) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <h3 className="text-sm font-bold text-foreground">
                      ⚔️ Opções Intermediárias / Metagame (Tiers T3 - T4 • Nível 65 ao 110)
                    </h3>
                  </div>
                  {targetAnalysis.midCounters.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {targetAnalysis.midCounters
                        .filter((c) => (!hideShinies || !c.isShiny))
                        .slice(0, 6)
                        .map((counter, idx) => (
                          <CounterCard key={idx} counter={counter} targetName={selectedTargetName} />
                        ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Nenhum counter intermediário direto encontrado.</p>
                  )}
                </div>

                {/* High End Tier (Avançados) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    <h3 className="text-sm font-bold text-foreground">
                      👑 Opções High-End & Endgame (Tiers T1 - T2 / SR / UR • Nível 110 ao 150+)
                    </h3>
                  </div>
                  {targetAnalysis.topTierCounters.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {targetAnalysis.topTierCounters
                        .filter((c) => (!hideShinies || !c.isShiny))
                        .slice(0, 6)
                        .map((counter, idx) => (
                          <CounterCard key={idx} counter={counter} targetName={selectedTargetName} />
                        ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Nenhum counter high-end direto encontrado.</p>
                  )}
                </div>
              </div>
            ) : (
              /* Standard Filtered Grid */
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Exibindo <strong>{filteredCounters.length}</strong> opções recomendadas:
                  </span>
                  {activeTab === "perfect" && (
                    <span className="text-emerald-400 font-medium">
                      ✓ Causam 2.0x e recebem dano reduzido (0.5x)
                    </span>
                  )}
                </div>

                {filteredCounters.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredCounters.map((counter, idx) => (
                      <CounterCard key={idx} counter={counter} targetName={selectedTargetName} />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-xl border border-dashed border-border/80 bg-card/30">
                    <p className="text-sm font-semibold text-muted-foreground">
                      Nenhum Pokémon encontrado com os filtros selecionados.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tente alterar a aba de exibição ou limpar os filtros de Tier/Elemento.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tactical Tips & Helds Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/60">
              {/* Helds Recommendation */}
              <Panel className="p-4 border-border/80 bg-card/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Held Itens Recomendados
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                    Regra Oficial
                  </span>
                </div>

                {/* Golden Rule Callout */}
                <div className="p-2.5 rounded-lg bg-gradient-to-r from-amber-500/10 via-primary/5 to-transparent border border-amber-500/30 text-xs space-y-1">
                  <p className="font-bold text-amber-400 flex items-center gap-1.5">
                    <span>⚡</span>
                    <span>Regra Fundamental de Helds:</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Sempre utilize <strong className="text-foreground font-semibold">X-Boost</strong> até ir para Hoenn! Ao caçar em <strong className="text-foreground font-semibold">Hoenn nas hunts de rotação</strong>, mude para <strong className="text-foreground font-semibold">X-Attack</strong>.
                  </p>
                </div>

                <div className="space-y-2">
                  {targetAnalysis.recommendedHelds.map((h, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-secondary/40 border border-border/40 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <span>{h.icon}</span>
                        <span>{h.name}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">{h.reason}</p>
                    </div>
                  ))}
                </div>
              </Panel>

              {/* Combat Tips */}
              <Panel className="p-4 border-border/80 bg-card/40 space-y-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Dicas Estratégicas de Caça
                  </h3>
                </div>
                <div className="space-y-2">
                  {targetAnalysis.huntTips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/40">
          <Target className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-lg font-bold text-foreground">Nenhum Pokémon selecionado</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Selecione ou busque um Pokémon acima para calcular os melhores caçadores.
          </p>
        </div>
      )}
    </div>
  );
}

function CounterCard({ counter, targetName }: { counter: CounterOption; targetName: string }) {
  const typeInfo = POKEMON_TYPES_INFO.find((t) => norm(t.id) === norm(counter.type));

  const isPerfect = counter.matchupQuality === "perfect";
  const isOffensive = counter.matchupQuality === "offensive";
  const isGlassCannon = counter.matchupQuality === "glass_cannon";
  const isTank = counter.matchupQuality === "tank";

  return (
    <div
      className={`relative p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between gap-3 group hover:shadow-lg ${
        isPerfect
          ? "bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60"
          : isOffensive
            ? "bg-card/70 border-border/80 hover:border-primary/50"
            : isGlassCannon
              ? "bg-amber-950/20 border-amber-500/30 hover:border-amber-500/60"
              : "bg-sky-950/20 border-sky-500/30 hover:border-sky-500/60"
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center p-1 shrink-0 group-hover:scale-105 transition-transform">
            <PokemonIcon pokemon={counter.pokemon.name} className="w-full h-full object-contain" />
          </div>
          <div className="truncate">
            <h4 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
              {counter.pokemon.name}
            </h4>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <span>{counter.estimatedLevel}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <TierBadge tier={counter.tier} />
        </div>
      </div>

      {/* Badges & Stats */}
      <div className="space-y-1.5 text-xs">
        {/* Matchup Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Offensive Multiplier */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[11px] border ${
              counter.offensiveMultiplier >= 2.0
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                : "bg-secondary text-muted-foreground border-border"
            }`}
          >
            <Sword className="w-3 h-3" />
            <span>{counter.offensiveMultiplier.toFixed(1)}x Dano</span>
          </span>

          {/* Defensive Multiplier */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[11px] border ${
              counter.defensiveMultiplier <= 0.5
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                : counter.defensiveMultiplier >= 2.0
                  ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                  : "bg-blue-500/15 text-blue-400 border-blue-500/30"
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>
              {counter.defensiveMultiplier <= 0.5
                ? "0.5x Recebido"
                : counter.defensiveMultiplier >= 2.0
                  ? "2.0x Recebido"
                  : "1.0x Neutro"}
            </span>
          </span>

          {/* Type Badge */}
          {typeInfo && (
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${typeInfo.badgeClass}`}>
              {typeInfo.icon} {typeInfo.label}
            </span>
          )}
        </div>

        {/* Quality status tag */}
        <p className="text-[11px] text-muted-foreground leading-tight pt-1">
          {counter.summary}
        </p>
      </div>

      {/* Footer Action */}
      <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {isPerfect ? "⭐ Ideal" : isGlassCannon ? "⚡ Alto Dano" : isTank ? "🛡️ Tanque" : "⚔️ Ofensivo"}
        </span>

        <Link
          to={`/pokemon/${counter.pokemon.slug}`}
          className="text-primary hover:underline font-medium inline-flex items-center gap-1 text-xs"
        >
          Ver na Pokédex <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
