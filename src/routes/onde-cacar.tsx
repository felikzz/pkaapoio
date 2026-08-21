import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SectionTitle, Panel, ExternalLinkChip, Chip, TierBadge, PokemonIcon } from "@/components/pka/ui";
import { pokemonList, norm, slugify, type PokemonEntry } from "@/lib/pka";
import { findBestHuntsForTeam, HuntRecommendation } from "@/lib/matchup";
import { Sword, MapPin, Sparkles, Filter, Plus, X, CheckCircle2, ShieldAlert, Compass } from "lucide-react";

export const Route = createFileRoute("/onde-cacar")({
  head: () => ({
    meta: [
      { title: "Onde Caçar? — Localizador de Hunts e Counters (2.0x Dano) — PKA Helper" },
      {
        name: "description",
        content: "Descubra os melhores locais para caçar no PokeAlliance com base no seu time: encontre matchups com 2.0x de dano e suba de nível mais rápido.",
      },
      { property: "og:title", content: "Onde Caçar? — Localizador de Hunts e Counters — PKA Helper" },
      {
        property: "og:description",
        content: "Descubra os melhores locais para caçar no PokeAlliance com base no seu time: encontre matchups com 2.0x de dano e suba de nível mais rápido.",
      },
    ],
  }),
  component: WhereToHuntPage,
});

const POPULAR_PRESETS = [
  { label: "🔥 Iniciais de Kanto", team: ["Charmander", "Squirtle", "Bulbasaur"] },
  { label: "⚡ Rush Usina", team: ["Diglett", "Dugtrio", "Steelix"] },
  { label: "🌊 Água / Surf", team: ["Squirtle", "Gyarados", "Blastoise", "Vaporeon"] },
  { label: "⚡ Elétrico", team: ["Pikachu", "Raichu", "Jolteon", "Electabuzz"] },
  { label: "🔮 Psíquico", team: ["Abra", "Kadabra", "Alakazam", "Hypno"] },
  { label: "🥊 Lutadores", team: ["Machop", "Machamp", "Primeape", "Hitmonchan"] },
];

function WhereToHuntPage() {
  const [team, setTeam] = useState<string[]>(["Dugtrio", "Charmander"]);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [searchAddPokemon, setSearchAddPokemon] = useState<string>("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [onlySuperEffective, setOnlySuperEffective] = useState<boolean>(true);

  const [huntKindFilter, setHuntKindFilter] = useState<string>("all");

  // Recommendations calculated from player's team
  const recommendations = useMemo(() => {
    return findBestHuntsForTeam(team);
  }, [team]);

  // Filtered by UI filters
  const filteredHunts = useMemo(() => {
    return recommendations.filter((hunt) => {
      if (onlySuperEffective && hunt.multiplier < 2.0) return false;

      // Filter by Hunt Kind
      if (huntKindFilter === "normal" && !hunt.hasNormal) return false;
      if (huntKindFilter === "wildscape" && !hunt.hasWildscape) return false;
      if (huntKindFilter === "hoenn_tubos" && !hunt.hasHoennTubos) return false;

      // Filter by Level Tier
      if (tierFilter !== "all") {
        if (tierFilter === "low" && !["T7", "T6", "T5"].includes(hunt.tier ?? "")) return false;
        if (tierFilter === "mid" && !["T4", "T3"].includes(hunt.tier ?? "")) return false;
        if (tierFilter === "high" && !["T2", "T1"].includes(hunt.tier ?? "")) return false;
        if (tierFilter === "wildscape" && !hunt.hasWildscape) return false;
        if (tierFilter === "endgame" && !hunt.hasHoennTubos) return false;
      }

      // Filter by Text Search
      if (searchFilter.trim()) {
        const nq = norm(searchFilter);
        const matchName = norm(hunt.pokemon).includes(nq);
        const matchArea = hunt.areas.some((a) => norm(a.label).includes(nq) || norm(a.rawArea).includes(nq));
        const matchCounter = norm(hunt.counterPokemon).includes(nq);
        if (!matchName && !matchArea && !matchCounter) return false;
      }
      return true;
    });
  }, [recommendations, onlySuperEffective, huntKindFilter, tierFilter, searchFilter]);

  // Search suggestions for adding pokemon to team
  const addSuggestions = useMemo(() => {
    if (!searchAddPokemon.trim()) return [];
    const nq = norm(searchAddPokemon);
    return pokemonList.filter((p) => norm(p.name).includes(nq) && !team.includes(p.name)).slice(0, 6);
  }, [searchAddPokemon, team]);

  const togglePokemonInTeam = (name: string) => {
    if (team.includes(name)) {
      setTeam((prev) => prev.filter((p) => p !== name));
    } else {
      setTeam((prev) => [...prev, name]);
      setSearchAddPokemon("");
    }
  };

  const applyPreset = (presetTeam: string[]) => {
    setTeam(presetTeam);
  };

  return (
    <div className="space-y-8">
      <div>
        <SectionTitle
          icon="🗺️"
          title="Onde Caçar? (Hunt Matchup Finder)"
          subtitle="Selecione seus Pokémon para encontrar hunts onde você causa 2.0x de dano super efetivo."
        />
      </div>

      {/* BANNER NEW SERVER TITAN */}
      <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-panel to-primary/10 p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl shrink-0">⚔️</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 uppercase">
                New Server Titan
              </span>
              <p className="text-xs font-bold text-foreground">Procurando rota do zero para rushar no novo servidor?</p>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Consulte nosso <strong>Guia Passo a Passo com Alternativas Anti-Lotação</strong> da 1ª à 6ª hunt!
            </p>
          </div>
        </div>

        <Link
          to="/rota-titan"
          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-black hover:bg-amber-400 transition-all shrink-0 shadow-sm"
        >
          <span>Abrir Rota Titan</span>
          <Compass className="size-3.5" />
        </Link>
      </div>

      {/* SELEÇÃO DO TIME */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sword className="size-5 text-primary" />
            <span>Seus Pokémon de Caça</span>
          </h2>
          <span className="text-xs text-muted-foreground">{team.length} no time</span>
        </div>

        <Panel className="space-y-4 border-primary/30 bg-panel/90">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Time Selecionado:</span>
            {team.map((pokeName) => {
              const entry = pokemonList.find((p) => norm(p.name) === norm(pokeName));
              return (
                <span
                  key={pokeName}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary shadow-sm"
                >
                  <PokemonIcon pokemon={pokeName} className="size-5 inline" />
                  <span>{pokeName}</span>
                  <span className="text-[10px] opacity-75">({entry?.type ?? "Tipo n/d"})</span>
                  <button
                    onClick={() => togglePokemonInTeam(pokeName)}
                    className="ml-1 rounded-full p-0.5 hover:bg-primary/20 text-muted-foreground hover:text-foreground"
                    aria-label={`Remover ${pokeName}`}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              );
            })}
            {team.length === 0 && (
              <span className="text-xs text-muted-foreground italic">Nenhum Pokémon no time. Escolha um abaixo:</span>
            )}
          </div>

          {/* Presets Rápidos */}
          <div className="space-y-2 border-t border-border/50 pt-3">
            <p className="text-xs text-muted-foreground">Ou escolha um pacote rápido:</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset.team)}
                  className="rounded-md border border-border bg-panel-strong px-2.5 py-1 text-xs hover:border-primary/50 hover:text-primary transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Input de Busca de Pokémon */}
            <div className="relative pt-2">
              <input
                type="text"
                value={searchAddPokemon}
                onChange={(e) => setSearchAddPokemon(e.target.value)}
                placeholder="Digitar nome de outro Pokémon para adicionar..."
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none"
              />
              {addSuggestions.length > 0 && (
                <div className="absolute top-full left-0 z-20 mt-1 w-full rounded-lg border border-border bg-panel p-2 shadow-xl grid gap-1 sm:grid-cols-2">
                  {addSuggestions.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => togglePokemonInTeam(p.name)}
                      className="flex items-center gap-2 rounded-md p-2 text-left text-xs hover:bg-panel-strong hover:text-primary transition-colors"
                    >
                      <PokemonIcon pokemon={p.name} className="size-6 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">{p.type ?? "Tipo n/d"}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Panel>
      </section>

      {/* FILTROS E RESULTADOS */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Compass className="size-5 text-gold" />
            <h2 className="text-lg font-bold">
              Hunts Recomendadas ({filteredHunts.length})
            </h2>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setOnlySuperEffective(!onlySuperEffective)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                onlySuperEffective
                  ? "border border-success/40 bg-success/15 text-success"
                  : "border border-border bg-panel text-muted-foreground"
              }`}
            >
              💥 Apenas 2.0x Dano
            </button>

            {/* Tipo de Hunt */}
            <select
              value={huntKindFilter}
              onChange={(e) => setHuntKindFilter(e.target.value)}
              aria-label="Filtrar por tipo de hunt"
              className="h-8 rounded-lg border border-border bg-panel px-2 text-xs focus:border-primary focus:outline-none"
            >
              <option value="all">🌐 Todos os Tipos de Hunt</option>
              <option value="normal">🌲 Apenas Hunts Normais (Mapa Aberto)</option>
              <option value="wildscape">🌌 Apenas Wildscapes (Lvl 150+)</option>
              <option value="hoenn_tubos">⚡ Apenas Hoenn/Tubos (Lvl 350+)</option>
            </select>

            {/* Faixa de Level */}
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              aria-label="Filtrar por faixa de nível"
              className="h-8 rounded-lg border border-border bg-panel px-2 text-xs focus:border-primary focus:outline-none"
            >
              <option value="all">Todas as Faixas de Level</option>
              <option value="low">Iniciante (Lvl 1 - 50)</option>
              <option value="mid">Intermediário (Lvl 50 - 100)</option>
              <option value="high">Avançado (Lvl 100 - 150)</option>
              <option value="wildscape">Wildscape (Lvl 150+)</option>
              <option value="endgame">Endgame / Tubos (Lvl 350+)</option>
            </select>
          </div>
        </div>

        {/* Input de filtro de texto */}
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Filtrar por cidade, área, wildscape ou monstro da hunt..."
          className="h-10 w-full rounded-md border border-input bg-panel px-3 text-sm focus:border-primary focus:outline-none"
        />

        {/* Grid de Hunts */}
        {filteredHunts.length === 0 ? (
          <Panel className="text-center py-10 space-y-2">
            <ShieldAlert className="size-8 text-muted-foreground mx-auto" />
            <h3 className="font-semibold text-base">Nenhuma hunt encontrada com esses filtros</h3>
            <p className="text-xs text-muted-foreground">
              Tente selecionar outro tipo de hunt ou adicionar mais Pokémon de tipos diferentes ao seu time.
            </p>
          </Panel>
        ) : (
          <div className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-3">
            {filteredHunts.map((hunt) => {
              const isSuper = hunt.multiplier >= 2.0;

              return (
                <div
                  key={hunt.pokemon}
                  className="panel group flex flex-col justify-between p-4 border-border hover:border-primary/50 transition-all hover:bg-panel-strong space-y-3"
                >
                  {/* Topo: Monstro Alvo & Vantagem */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to="/pokemon/$slug"
                        params={{ slug: slugify(hunt.pokemon) }}
                        className="font-bold text-base hover:text-primary flex items-center gap-2 min-w-0"
                      >
                        <PokemonIcon pokemon={hunt.pokemon} className="size-8 shrink-0" />
                        <div className="min-w-0">
                          <p className="truncate">{hunt.pokemon}</p>
                          <p className="text-xs text-muted-foreground font-normal">{hunt.type ?? "Tipo n/d"}</p>
                        </div>
                      </Link>

                      <span
                        className={`rounded px-2 py-0.5 text-xs font-bold shrink-0 ${
                          isSuper ? "bg-success/20 text-success border border-success/30" : "bg-primary/15 text-primary"
                        }`}
                      >
                        {hunt.multiplier}x Dano
                      </span>
                    </div>

                    {/* Level & Tier */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      <Chip tone="gold">Foco: {hunt.estimatedLevel}</Chip>
                      {hunt.tier ? <TierBadge tier={hunt.tier} /> : null}
                    </div>
                  </div>

                  {/* Counter Indicado */}
                  <div className="rounded-lg border border-border bg-panel p-2.5 space-y-1">
                    <p className="text-[11px] text-muted-foreground font-medium">Use seu Counter:</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <PokemonIcon pokemon={hunt.counterPokemon} className="size-5" />
                        <span className="font-semibold text-xs text-foreground">{hunt.counterPokemon}</span>
                      </div>
                      <span className="text-[11px] text-success font-medium">Golpes {hunt.counterType}</span>
                    </div>
                  </div>

                  {/* Locais de Hunt com Identificação de Wildscape / Normal / Tubos */}
                  <div className="space-y-1.5 text-xs border-t border-border/50 pt-2">
                    <p className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                      <MapPin className="size-3 text-primary" />
                      <span>Áreas de Hunt Mapeadas:</span>
                    </p>
                    <div className="space-y-1.5">
                      {hunt.areas.map((a, i) => (
                        <div
                          key={i}
                          className="flex flex-wrap items-center justify-between gap-1.5 rounded-md border border-border/60 bg-panel px-2 py-1.5"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            {a.kind === "wildscape" ? (
                              <span className="inline-flex items-center rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/30">
                                🌌 Wildscape
                              </span>
                            ) : a.kind === "hoenn_tubos" ? (
                              <span className="inline-flex items-center rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                                ⚡ Tubos (350+)
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                                🌲 Normal
                              </span>
                            )}
                            <span className="truncate text-xs text-foreground">{a.rawArea}</span>
                          </div>
                          {a.link ? <ExternalLinkChip href={a.link} label="Mapa" /> : null}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Drops Notáveis */}
                  {hunt.valuableDrops.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 pt-1 text-[10px]">
                      <span className="text-muted-foreground">Drops:</span>
                      {hunt.valuableDrops.map((d, i) => (
                        <Link
                          key={i}
                          to="/item/$slug"
                          params={{ slug: slugify(d) }}
                          className="rounded bg-panel px-1.5 py-0.5 border border-border text-gold capitalize hover:underline"
                        >
                          {d}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
