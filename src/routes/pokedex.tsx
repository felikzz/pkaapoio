import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useMemo } from "react";
import { SectionTitle, PokemonCard, EmptyState, TypeBadge } from "@/components/pka/ui";
import { pokemonList, norm, expandQuery, tierOrder } from "@/lib/pka";
import { POKEMON_TYPES_INFO } from "@/lib/matchup";
import { X, Filter, Sparkles, Layers } from "lucide-react";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  tier: fallback(z.string(), "").default(""),
  type: fallback(z.string(), "").default(""),
  shiny: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/pokedex")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Pokédex PKA — Todos os Pokémon do PokeAlliance" },
      { name: "description", content: "Pesquise Pokémon do PokeAlliance por nome, tipo elemental, tier e shiny." },
      { property: "og:title", content: "Pokédex PKA" },
      { property: "og:description", content: "Pesquise Pokémon do PokeAlliance por nome, tipo elemental, tier e shiny." },
    ],
  }),
  component: Pokedex,
});

function Pokedex() {
  const { q, tier, type, shiny } = Route.useSearch();
  const navigate = useNavigate({ from: "/pokedex" });

  const tiers = useMemo(() => {
    const present = new Set(pokemonList.map((p) => p.tier).filter(Boolean) as string[]);
    return [...present].sort((a, b) => {
      const ia = tierOrder.indexOf(a);
      const ib = tierOrder.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
  }, []);

  const typesWithCount = useMemo(() => {
    const counts = new Map<string, number>();
    pokemonList.forEach((p) => {
      if (p.type && p.type !== "?") {
        const key = p.type.toLowerCase();
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    });

    return POKEMON_TYPES_INFO.map((t) => ({
      ...t,
      count: counts.get(t.id.toLowerCase()) ?? 0,
    })).filter((t) => t.count > 0);
  }, []);

  const results = useMemo(() => {
    const nq = expandQuery(q);
    return pokemonList.filter((p) => {
      if (nq && !norm(p.name).includes(nq)) return false;
      if (tier && p.tier !== tier) return false;
      if (type && p.type?.toLowerCase() !== type.toLowerCase()) return false;
      if (shiny === "sim" && !p.shiny) return false;
      if (shiny === "nao" && p.shiny) return false;
      return true;
    });
  }, [q, tier, type, shiny]);

  const set = (patch: Partial<{ q: string; tier: string; type: string; shiny: string }>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) });

  const clearAllFilters = () => {
    navigate({ search: () => ({ q: "", tier: "", type: "", shiny: "" }) });
  };

  const hasActiveFilters = Boolean(q || tier || type || shiny);
  const activeTypeInfo = POKEMON_TYPES_INFO.find((t) => t.id.toLowerCase() === type.toLowerCase());

  return (
    <div className="space-y-6">
      <SectionTitle
        icon="🔎"
        title="Pokédex"
        subtitle={`${pokemonList.length} Pokémon catalogados • Filtre por tipo para planejar e montar seu time ideal`}
      />

      {/* Main Filter Controls */}
      <div className="panel space-y-4 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => set({ q: e.target.value })}
              placeholder="Pesquisar por nome..."
              aria-label="Pesquisar Pokémon"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none"
            />
            {q && (
              <button
                onClick={() => set({ q: "" })}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                aria-label="Limpar pesquisa"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <select
            value={type}
            onChange={(e) => set({ type: e.target.value })}
            aria-label="Filtrar por tipo"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none"
          >
            <option value="">Todos os Tipos ({pokemonList.length})</option>
            {typesWithCount.map((t) => (
              <option key={t.id} value={t.id}>
                {t.icon} {t.label} ({t.count})
              </option>
            ))}
          </select>

          <select
            value={tier}
            onChange={(e) => set({ tier: e.target.value })}
            aria-label="Filtrar por tier"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none"
          >
            <option value="">Todos os Tiers</option>
            {tiers.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={shiny}
            onChange={(e) => set({ shiny: e.target.value })}
            aria-label="Filtrar shiny"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none"
          >
            <option value="">Normais e Shiny</option>
            <option value="sim">Somente Shiny ✨</option>
            <option value="nao">Somente Normais</option>
          </select>
        </div>

        {/* Quick Type Selection Pills */}
        <div className="space-y-2 border-t border-border/50 pt-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Layers className="size-3.5 text-primary" />
              <span>Atalhos Rápidos por Tipo Elemental:</span>
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-danger transition-colors"
              >
                <X className="size-3" />
                <span>Limpar filtros</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              onClick={() => set({ type: "" })}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                !type
                  ? "border-primary bg-primary/20 text-primary ring-1 ring-primary/40 shadow-xs"
                  : "border-border bg-panel-strong text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              <span>🌐</span>
              <span>Todos</span>
            </button>

            {typesWithCount.map((t) => {
              const isSelected = type.toLowerCase() === t.id.toLowerCase();
              return (
                <button
                  key={t.id}
                  onClick={() => set({ type: isSelected ? "" : t.id })}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                    isSelected
                      ? `ring-2 ring-primary/40 shadow-sm ${t.badgeClass} font-bold scale-[1.03]`
                      : "border-border bg-panel-strong text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                  title={`${t.label} (${t.count} Pokémon)`}
                >
                  <span aria-hidden>{t.icon}</span>
                  <span>{t.label}</span>
                  <span className={`text-[10px] opacity-70 ${isSelected ? "opacity-100 font-bold" : ""}`}>
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filter Indicators */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 border-t border-border/40 pt-3 text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <Filter className="size-3" />
              <span>Filtros ativos:</span>
            </span>

            {type && activeTypeInfo && (
              <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 ${activeTypeInfo.badgeClass}`}>
                <span>{activeTypeInfo.icon} Tipo: {activeTypeInfo.label}</span>
                <button onClick={() => set({ type: "" })} className="ml-1 hover:opacity-80">
                  <X className="size-3" />
                </button>
              </span>
            )}

            {tier && (
              <span className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-primary">
                <span>Tier: {tier}</span>
                <button onClick={() => set({ tier: "" })} className="ml-1 hover:opacity-80">
                  <X className="size-3" />
                </button>
              </span>
            )}

            {shiny && (
              <span className="inline-flex items-center gap-1 rounded-md border border-gold/30 bg-gold/10 px-2 py-0.5 text-gold">
                <span>{shiny === "sim" ? "Somente Shiny" : "Somente Normais"}</span>
                <button onClick={() => set({ shiny: "" })} className="ml-1 hover:opacity-80">
                  <X className="size-3" />
                </button>
              </span>
            )}

            {q && (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-panel-strong px-2 py-0.5 text-foreground">
                <span>Busca: “{q}”</span>
                <button onClick={() => set({ q: "" })} className="ml-1 hover:opacity-80">
                  <X className="size-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results Section */}
      {results.length === 0 ? (
        <EmptyState query={q || (activeTypeInfo ? activeTypeInfo.label : undefined)} />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-muted-foreground">
              Mostrando <strong className="text-foreground">{results.length}</strong> {results.length === 1 ? "Pokémon" : "Pokémon"}
              {activeTypeInfo ? (
                <span> do tipo <strong className="text-foreground">{activeTypeInfo.icon} {activeTypeInfo.label}</strong></span>
              ) : null}
            </p>

            {activeTypeInfo && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Sparkles className="size-3.5 text-primary" />
                <span>Excelente para montar composições mono-tipo ou cobrir fraquezas</span>
              </span>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.slice(0, 300).map((p) => (
              <PokemonCard key={p.slug} p={p} />
            ))}
          </div>

          {results.length > 300 ? (
            <div className="panel p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Mostrando os 300 primeiros Pokémon de {results.length}. Use os filtros acima para refinar.
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
