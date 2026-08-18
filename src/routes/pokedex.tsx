import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useMemo } from "react";
import { SectionTitle, PokemonCard, EmptyState } from "@/components/pka/ui";
import { pokemonList, norm, expandQuery, tierOrder } from "@/lib/pka";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  tier: fallback(z.string(), "").default(""),
  shiny: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/pokedex")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Pokédex PKA — Todos os Pokémon do PokeAlliance" },
      { name: "description", content: "Pesquise Pokémon do PokeAlliance por nome, tier, tipo e shiny." },
      { property: "og:title", content: "Pokédex PKA" },
      { property: "og:description", content: "Pesquise Pokémon do PokeAlliance por nome, tier, tipo e shiny." },
    ],
  }),
  component: Pokedex,
});

function Pokedex() {
  const { q, tier, shiny } = Route.useSearch();
  const navigate = useNavigate({ from: "/pokedex" });

  const tiers = useMemo(() => {
    const present = new Set(pokemonList.map((p) => p.tier).filter(Boolean) as string[]);
    return [...present].sort((a, b) => {
      const ia = tierOrder.indexOf(a);
      const ib = tierOrder.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
  }, []);

  const results = useMemo(() => {
    const nq = expandQuery(q);
    return pokemonList.filter((p) => {
      if (nq && !norm(p.name).includes(nq)) return false;
      if (tier && p.tier !== tier) return false;
      if (shiny === "sim" && !p.shiny) return false;
      if (shiny === "nao" && p.shiny) return false;
      return true;
    });
  }, [q, tier, shiny]);

  const set = (patch: Partial<{ q: string; tier: string; shiny: string }>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) });

  return (
    <div>
      <SectionTitle icon="🔎" title="Pokédex" subtitle={`${pokemonList.length} Pokémon na base do PKA`} />

      <div className="panel mb-6 grid gap-3 p-4 sm:grid-cols-3">
        <input
          value={q}
          onChange={(e) => set({ q: e.target.value })}
          placeholder="Pesquisar Pokémon..."
          aria-label="Pesquisar Pokémon"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none sm:col-span-1"
        />
        <select
          value={tier}
          onChange={(e) => set({ tier: e.target.value })}
          aria-label="Filtrar por tier"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Todos os tiers</option>
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
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Normais e Shiny</option>
          <option value="sim">Somente Shiny</option>
          <option value="nao">Somente normais</option>
        </select>
      </div>

      {results.length === 0 ? (
        <EmptyState query={q} />
      ) : (
        <>
          <p className="mb-3 text-sm text-muted-foreground">{results.length} resultados</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.slice(0, 300).map((p) => (
              <PokemonCard key={p.slug} p={p} />
            ))}
          </div>
          {results.length > 300 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Mostrando os 300 primeiros. Refine a busca para ver mais.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
