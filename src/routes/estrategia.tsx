import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SectionTitle, Panel, ExternalLinkChip, Chip, TierBadge, PokemonIcon } from "@/components/pka/ui";
import { db, norm, pokemonList, slugify, type PokemonEntry } from "@/lib/pka";
import { getEffectiveness, TIER_LEVEL_MAP } from "@/lib/matchup";
import { Sparkles, Target, Shield, Sword, MapPin, CheckCircle2, ChevronRight, Plus, X } from "lucide-react";

export const Route = createFileRoute("/estrategia")({
  head: () => ({
    meta: [
      { title: "Estratégia de Talentos & Rota de Level Up — PKA Helper" },
      {
        name: "description",
        content: "Planeje sua rota de up e farm de talentos no PokeAlliance: escolha o elemento, monte sua árvore e veja os melhores counters para cada hunt.",
      },
      { property: "og:title", content: "Estratégia de Talentos & Rota de Level Up — PKA Helper" },
      {
        property: "og:description",
        content: "Planeje sua rota de up e farm de talentos no PokeAlliance: escolha o elemento, monte sua árvore e veja os melhores counters para cada hunt.",
      },
    ],
  }),
  component: StrategyPage,
});

const ELEMENT_CATEGORIES = [
  { id: "Fire", label: "Fogo", icon: "🔥", color: "from-amber-500/20 to-orange-500/10 border-orange-500/30" },
  { id: "Water", label: "Água", icon: "💧", color: "from-blue-500/20 to-cyan-500/10 border-blue-500/30" },
  { id: "Grass", label: "Planta", icon: "🌿", color: "from-emerald-500/20 to-green-500/10 border-emerald-500/30" },
  { id: "Electric", label: "Elétrico", icon: "⚡", color: "from-yellow-500/20 to-amber-500/10 border-yellow-500/30" },
  { id: "Fighting", label: "Lutador", icon: "🥊", color: "from-red-500/20 to-rose-500/10 border-red-500/30" },
  { id: "Psychic", label: "Psíquico", icon: "🔮", color: "from-purple-500/20 to-pink-500/10 border-purple-500/30" },
  { id: "Ghost", label: "Fantasma", icon: "👻", color: "from-indigo-500/20 to-violet-500/10 border-indigo-500/30" },
  { id: "Dark", label: "Sombrio", icon: "🌑", color: "from-zinc-500/20 to-slate-500/10 border-zinc-500/30" },
  { id: "Dragon", label: "Dragão", icon: "🐉", color: "from-teal-500/20 to-cyan-500/10 border-teal-500/30" },
  { id: "Normal", label: "Normal", icon: "⭐", color: "from-stone-500/20 to-neutral-500/10 border-stone-500/30" },
  { id: "Ground", label: "Terra", icon: "🏜️", color: "from-amber-600/20 to-yellow-600/10 border-amber-600/30" },
  { id: "Rock", label: "Pedra", icon: "🪨", color: "from-stone-600/20 to-zinc-600/10 border-stone-600/30" },
  { id: "Ice", label: "Gelo", icon: "❄️", color: "from-sky-500/20 to-blue-500/10 border-sky-500/30" },
  { id: "Poison", label: "Veneno", icon: "🧪", color: "from-fuchsia-500/20 to-purple-500/10 border-fuchsia-500/30" },
  { id: "Flying", label: "Voador", icon: "🦅", color: "from-cyan-500/20 to-sky-500/10 border-cyan-500/30" },
  { id: "Bug", label: "Inseto", icon: "🐛", color: "from-lime-500/20 to-green-500/10 border-lime-500/30" },
  { id: "Steel", label: "Aço", icon: "🛡️", color: "from-slate-400/20 to-zinc-400/10 border-slate-400/30" },
  { id: "Fairy", label: "Fada", icon: "✨", color: "from-pink-400/20 to-rose-400/10 border-pink-400/30" },
  { id: "Character", label: "Personagem", icon: "👤", color: "from-gold/20 to-yellow-500/10 border-gold/40" },
  { id: "Pokemon", label: "Geral Pokémon", icon: "🐾", color: "from-primary/20 to-blue-500/10 border-primary/30" },
];

const POPULAR_STARTERS = ["Charmander", "Squirtle", "Bulbasaur", "Diglett", "Dugtrio", "Steelix", "Pikachu", "Raichu", "Gyarados", "Alakazam", "Gengar", "Machamp"];

function StrategyPage() {
  const [selectedElement, setSelectedElement] = useState<string>("Fire");
  const [myTeam, setMyTeam] = useState<string[]>(["Charmander"]);
  const [searchPokemon, setSearchPokemon] = useState<string>("");

  // Filter talents by selected category
  const categoryTalents = useMemo(() => {
    return db.talents.filter((t) => norm(t.category ?? "") === norm(selectedElement));
  }, [selectedElement]);

  // Group into progression tree steps based on source pokemon tiers
  const treeNodes = useMemo(() => {
    return categoryTalents.map((talent) => {
      const sourceEntry = talent.source ? pokemonList.find((p) => norm(p.name) === norm(talent.source!)) : null;
      const tier = sourceEntry?.tier ?? "T4";
      const sourceLoc = talent.source ? db.locations.find((l) => norm(l.pokemon) === norm(talent.source!)) : null;

      // Find best counter in user's team
      let bestCounter: { name: string; multiplier: number; type: string } | null = null;
      if (myTeam.length && sourceEntry) {
        for (const myPokeName of myTeam) {
          const myEntry = pokemonList.find((p) => norm(p.name) === norm(myPokeName));
          if (myEntry) {
            const eff = getEffectiveness(myEntry.type, sourceEntry.type);
            if (!bestCounter || eff > bestCounter.multiplier) {
              bestCounter = { name: myEntry.name, multiplier: eff, type: myEntry.type ?? "Normal" };
            }
          }
        }
      }

      return {
        talent,
        source: sourceEntry,
        tier,
        estimatedLvl: TIER_LEVEL_MAP[tier] ?? "Lvl 50+",
        locations: sourceLoc?.entries ?? [],
        bestCounter,
      };
    }).sort((a, b) => {
      const tierRank = ["T7", "T6", "T5", "T4", "T3", "T2", "T1", "SR", "UR", "Legendary", "Mythic"];
      const rA = tierRank.indexOf(a.tier) !== -1 ? tierRank.indexOf(a.tier) : 4;
      const rB = tierRank.indexOf(b.tier) !== -1 ? tierRank.indexOf(b.tier) : 4;
      return rA - rB;
    });
  }, [categoryTalents, myTeam]);

  // Search filtered suggestions for team input
  const filteredSuggestions = useMemo(() => {
    if (!searchPokemon.trim()) return [];
    const nq = norm(searchPokemon);
    return pokemonList
      .filter((p) => norm(p.name).includes(nq) && !myTeam.includes(p.name))
      .slice(0, 6);
  }, [searchPokemon, myTeam]);

  const togglePokemonInTeam = (name: string) => {
    if (myTeam.includes(name)) {
      setMyTeam((prev) => prev.filter((p) => p !== name));
    } else {
      setMyTeam((prev) => [...prev, name]);
      setSearchPokemon("");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <SectionTitle
          icon="🧬"
          title="Estratégia de Talentos & Level Up"
          subtitle="Planeje o seu caminho de caça para subir de nível e farmar os materiais dos seus talentos ao mesmo tempo."
        />
      </div>

      {/* PASSO 1: SELECIONE O ELEMENTO */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
            1
          </span>
          <h2 className="text-lg font-bold">Qual elemento de talento você quer focar primeiro?</h2>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
          {ELEMENT_CATEGORIES.map((cat) => {
            const active = selectedElement === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedElement(cat.id)}
                className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
                  active
                    ? "border-primary bg-primary/20 text-foreground ring-2 ring-primary/40 shadow-md"
                    : "border-border bg-panel hover:border-primary/40 hover:bg-panel-strong text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">{cat.label}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* PASSO 2: SEUS POKÉMON DISPONÍVEIS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
              2
            </span>
            <h2 className="text-lg font-bold">Quais Pokémon você tem para caçar? (Opcional)</h2>
          </div>
          <span className="text-xs text-muted-foreground">{myTeam.length} selecionado(s)</span>
        </div>

        <Panel className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Seu Time Atual:</span>
            {myTeam.map((pokeName) => (
              <span
                key={pokeName}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary shadow-sm"
              >
                <PokemonIcon pokemon={pokeName} className="size-5 inline" />
                {pokeName}
                <button
                  onClick={() => togglePokemonInTeam(pokeName)}
                  className="ml-1 rounded-full p-0.5 hover:bg-primary/20 text-muted-foreground hover:text-foreground"
                  aria-label={`Remover ${pokeName}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
            {myTeam.length === 0 && (
              <span className="text-xs text-muted-foreground italic">Nenhum Pokémon selecionado (clique abaixo para adicionar)</span>
            )}
          </div>

          <div className="space-y-2 border-t border-border/50 pt-3">
            <p className="text-xs text-muted-foreground">Atalhos rápidos para adicionar ao time:</p>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_STARTERS.map((p) => {
                const inTeam = myTeam.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => togglePokemonInTeam(p)}
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors ${
                      inTeam
                        ? "border-primary/50 bg-primary/20 text-primary font-semibold"
                        : "border-border bg-panel-strong text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    <PokemonIcon pokemon={p} className="size-4" />
                    {p}
                    {inTeam ? <CheckCircle2 className="size-3 ml-0.5 text-primary" /> : <Plus className="size-3 ml-0.5 opacity-60" />}
                  </button>
                );
              })}
            </div>

            <div className="relative pt-2">
              <input
                type="text"
                value={searchPokemon}
                onChange={(e) => setSearchPokemon(e.target.value)}
                placeholder="Digitar outro Pokémon para adicionar ao seu time..."
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none"
              />
              {filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 z-20 mt-1 w-full rounded-lg border border-border bg-panel p-2 shadow-xl grid gap-1 sm:grid-cols-2">
                  {filteredSuggestions.map((p) => (
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

      {/* PASSO 3: ÁRVORE DE PROGRESSÃO E HUNT ROADMAP */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
              3
            </span>
            <h2 className="text-lg font-bold">
              Árvore de Progressão: Talentos de {selectedElement} ({treeNodes.length} Talentos)
            </h2>
          </div>
        </div>

        {treeNodes.length === 0 ? (
          <Panel>
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhum talento encontrado para este elemento na base atual do PKA.
            </p>
          </Panel>
        ) : (
          <div className="space-y-4">
            {treeNodes.map((node, index) => {
              const isCounterSuper = node.bestCounter && node.bestCounter.multiplier >= 2.0;

              return (
                <div
                  key={node.talent.name + index}
                  className="panel relative overflow-hidden p-4 sm:p-5 border-border transition-all hover:border-primary/40"
                >
                  {/* Step Ribbon */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                        {index + 1}
                      </span>
                      <h3 className="font-display text-base font-bold capitalize text-foreground flex items-center gap-2">
                        {node.talent.name}
                      </h3>
                      {node.talent.slot ? <Chip tone="gold">{node.talent.slot}</Chip> : null}
                    </div>

                    <div className="flex items-center gap-2">
                      <Chip>Foco: Lvl {node.estimatedLvl}</Chip>
                      {node.tier ? <TierBadge tier={node.tier} /> : null}
                    </div>
                  </div>

                  {/* Main Grid Content */}
                  <div className="grid gap-4 pt-3.5 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Coluna 1: O Que Dropar & Quantidade */}
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <Sparkles className="size-3.5 text-gold" />
                        <span>Material Necessário:</span>
                      </p>
                      <div className="rounded-lg border border-border bg-panel-strong p-3">
                        <p className="text-sm font-semibold text-gold capitalize">{node.talent.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Quantidade: <strong className="text-foreground">{node.talent.quantity ?? "Variável"}x</strong>
                        </p>
                        {node.talent.buff && (
                          <p className="mt-2 text-xs text-success border-t border-border/50 pt-1.5">
                            ✨ {node.talent.buff}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Coluna 2: Onde Caçar (Origem do Drop) */}
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <Target className="size-3.5 text-primary" />
                        <span>Monstro que Dropa:</span>
                      </p>
                      {node.source ? (
                        <div className="rounded-lg border border-border bg-panel-strong p-3 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <Link
                              to="/pokemon/$slug"
                              params={{ slug: slugify(node.source.name) }}
                              className="font-semibold text-sm hover:text-primary flex items-center gap-2"
                            >
                              <PokemonIcon pokemon={node.source.name} className="size-7" />
                              <span>{node.source.name}</span>
                            </Link>
                            <span className="text-xs text-muted-foreground">{node.source.type ?? "Tipo n/d"}</span>
                          </div>

                          {node.locations.length > 0 ? (
                            <div className="space-y-1 text-xs pt-1 border-t border-border/50">
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <MapPin className="size-3" />
                                <span>Locais de Hunt:</span>
                              </p>
                              {node.locations.slice(0, 2).map((loc, li) => (
                                <div key={li} className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                                  <span className="text-foreground">{loc.area}</span>
                                  {loc.link ? <ExternalLinkChip href={loc.link} label="Mapa" /> : null}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-muted-foreground italic pt-1">
                              Consulte a Pokédex para dungeons ou respawns específicos.
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-border bg-panel-strong p-3 text-xs text-muted-foreground">
                          Item especial de quest / drop global.
                        </div>
                      )}
                    </div>

                    {/* Coluna 3: Seu Counter & Dano Recomendado */}
                    <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                      <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <Sword className="size-3.5 text-danger" />
                        <span>Recomendação de Batalha:</span>
                      </p>
                      {node.bestCounter ? (
                        <div
                          className={`rounded-lg border p-3 space-y-1.5 ${
                            isCounterSuper
                              ? "border-success/40 bg-success/10"
                              : "border-border bg-panel-strong"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">Use do seu time:</span>
                            <span
                              className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                isCounterSuper ? "bg-success text-success-foreground" : "bg-panel text-foreground"
                              }`}
                            >
                              {node.bestCounter.multiplier}x Dano
                            </span>
                          </div>
                          <div className="flex items-center gap-2 pt-0.5">
                            <PokemonIcon pokemon={node.bestCounter.name} className="size-6" />
                            <span className="text-sm font-semibold">{node.bestCounter.name}</span>
                            <span className="text-xs text-muted-foreground">({node.bestCounter.type})</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {isCounterSuper
                              ? "🔥 Vantagem máxima! Esse Pokémon derreterá a hunt com dano dobrado."
                              : "Dano neutro. Monte seu time acima para descobrir counters mais efetivos."}
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-border bg-panel-strong p-3 text-xs text-muted-foreground">
                          Adicione seus Pokémon no Passo 2 para receber recomendações personalizadas de counters!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
