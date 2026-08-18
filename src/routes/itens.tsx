import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useMemo } from "react";
import { SectionTitle, EmptyState, ItemCard } from "@/components/pka/ui";
import { itemList, norm, expandQuery, whoDropsItem } from "@/lib/pka";

const schema = z.object({ q: fallback(z.string(), "").default("") });

export const Route = createFileRoute("/itens")({
  validateSearch: zodValidator(schema),
  head: () => ({
    meta: [
      { title: "Itens PKA — Quem dropa cada item" },
      { name: "description", content: "Pesquise itens do PokeAlliance e descubra quais Pokémon podem dropá-los." },
      { property: "og:title", content: "Itens PKA" },
      { property: "og:description", content: "Pesquise itens do PokeAlliance e descubra quem dropa." },
    ],
  }),
  component: Items,
});

function Items() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/itens" });
  const nq = expandQuery(q);

  const results = useMemo(
    () => (nq ? itemList.filter((i) => norm(i).includes(nq)) : itemList).slice(0, 200),
    [nq],
  );

  return (
    <div>
      <SectionTitle icon="💎" title="Itens" subtitle={`${itemList.length} itens encontrados na base do PKA`} />
      <input
        value={q}
        onChange={(e) => navigate({ search: { q: e.target.value } })}
        placeholder="Pesquisar item..."
        aria-label="Pesquisar item"
        className="mb-6 h-11 w-full rounded-md border border-input bg-panel px-3 text-sm focus:border-primary focus:outline-none"
      />
      {results.length === 0 ? (
        <EmptyState query={q} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((i) => (
            <ItemCard key={i} item={i} count={whoDropsItem(i).length} />
          ))}
        </div>
      )}
    </div>
  );
}
