import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useMemo } from "react";
import { SectionTitle, EmptyState, PokemonCard, TierBadge } from "@/components/pka/ui";
import { pokemonList, norm, expandQuery, tierOrder } from "@/lib/pka";

const schema = z.object({ q: fallback(z.string(), "").default("") });

export const Route = createFileRoute("/tier-list")({
  validateSearch: zodValidator(schema),
  head: () => ({
    meta: [
      { title: "Tier List PKA — Todos os tiers" },
      { name: "description", content: "Tier list completa do PokeAlliance, de Mythic a T7, com moveset por Pokémon." },
      { property: "og:title", content: "Tier List PKA" },
      { property: "og:description", content: "Tier list completa do PokeAlliance." },
    ],
  }),
  component: TierList,
});

function TierList() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/tier-list" });
  const nq = expandQuery(q);

  const groups = useMemo(() => {
    const filtered = pokemonList.filter((p) => p.tier && (!nq || norm(p.name).includes(nq)));
    const known = tierOrder.map((t) => [t, filtered.filter((p) => p.tier === t)] as const);
    const others = filtered.filter((p) => !tierOrder.includes(p.tier!));
    return [...known, ["Outros", others] as const].filter(([, list]) => list.length > 0);
  }, [nq]);

  return (
    <div>
      <SectionTitle icon="📊" title="Tier List" subtitle="Ordenada de Mythic até T7" />
      <input
        value={q}
        onChange={(e) => navigate({ search: { q: e.target.value } })}
        placeholder="Filtrar Pokémon..."
        aria-label="Filtrar tier list"
        className="mb-6 h-11 w-full rounded-md border border-input bg-panel px-3 text-sm focus:border-primary focus:outline-none"
      />
      {groups.length === 0 ? (
        <EmptyState query={q} />
      ) : (
        <div className="space-y-8">
          {groups.map(([tier, list]) => (
            <section key={tier}>
              <div className="mb-3 flex items-center gap-3">
                <TierBadge tier={tier} />
                <span className="text-sm text-muted-foreground">{list.length} Pokémon</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {list.map((p) => (
                  <PokemonCard key={p.slug} p={p} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
