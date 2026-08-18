import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useMemo } from "react";
import { SectionTitle, Panel, EmptyState, ItemCard, PokemonIcon } from "@/components/pka/ui";
import { db, norm, expandQuery, slugify, whoDropsItem, itemList } from "@/lib/pka";

const schema = z.object({
  q: fallback(z.string(), "").default(""),
  mode: fallback(z.string(), "pokemon").default("pokemon"),
});

export const Route = createFileRoute("/drops")({
  validateSearch: zodValidator(schema),
  head: () => ({
    meta: [
      { title: "Drops PKA — O que cada Pokémon dropa" },
      { name: "description", content: "Consulte drops por Pokémon ou faça a busca reversa: quem dropa determinado item." },
      { property: "og:title", content: "Drops PKA" },
      { property: "og:description", content: "Consulte drops por Pokémon ou descubra quem dropa um item." },
    ],
  }),
  component: Drops,
});

function Drops() {
  const { q, mode } = Route.useSearch();
  const navigate = useNavigate({ from: "/drops" });
  const nq = expandQuery(q);

  const pokemonResults = useMemo(
    () => (nq ? db.drops.filter((d) => norm(d.pokemon).includes(nq)).slice(0, 40) : []),
    [nq],
  );
  const itemResults = useMemo(
    () => (nq ? itemList.filter((i) => norm(i).includes(nq)).slice(0, 40) : []),
    [nq],
  );

  const set = (patch: Partial<{ q: string; mode: string }>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) });

  const reverse = mode === "item";

  return (
    <div>
      <SectionTitle icon="🎒" title="Drops" subtitle="Pokémon → Item ou Item → Pokémon (busca reversa)" />

      <div className="panel mb-6 space-y-3 p-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => set({ mode: "pokemon" })}
            className={`flex-1 rounded-md px-3 py-2 text-sm ${!reverse ? "bg-primary text-primary-foreground" : "border border-border bg-panel-strong"}`}
          >
            🐾 O que esse Pokémon dropa?
          </button>
          <button
            type="button"
            onClick={() => set({ mode: "item" })}
            className={`flex-1 rounded-md px-3 py-2 text-sm ${reverse ? "bg-gold text-gold-foreground" : "border border-border bg-panel-strong"}`}
          >
            💎 Quem dropa esse item?
          </button>
        </div>
        <input
          value={q}
          onChange={(e) => set({ q: e.target.value })}
          placeholder={reverse ? "Pesquisar item... (ex: arcane ground orb)" : "Pesquisar Pokémon... (ex: gengar)"}
          aria-label="Pesquisar drops"
          className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {!nq ? (
        <Panel>
          <p className="text-sm text-muted-foreground">
            Digite acima para pesquisar. A base tem {db.drops.length} Pokémon com drops e {itemList.length} itens.
          </p>
        </Panel>
      ) : reverse ? (
        itemResults.length === 0 ? (
          <EmptyState query={q} />
        ) : (
          <div className="space-y-4">
            {itemResults.map((item) => {
              const list = whoDropsItem(item);
              return (
                <Panel key={item}>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h2 className="text-lg font-semibold capitalize text-gold">💎 {item}</h2>
                    <Link to="/item/$slug" params={{ slug: slugify(item) }} className="text-xs text-primary underline">
                      Abrir item
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {list.map((p) => (
                      <Link
                        key={p}
                        to="/pokemon/$slug"
                        params={{ slug: slugify(p) }}
                        className="rounded-md border border-border bg-panel-strong px-2.5 py-1 text-xs hover:border-primary/50 hover:text-primary flex items-center gap-1"
                      >
                        <PokemonIcon pokemon={p} className="w-5 h-5" />
                        {p}
                      </Link>
                    ))}
                  </div>
                </Panel>
              );
            })}
          </div>
        )
      ) : pokemonResults.length === 0 ? (
        <EmptyState query={q} />
      ) : (
        <div className="space-y-4">
          {pokemonResults.map((d) => (
            <Panel key={d.pokemon}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <PokemonIcon pokemon={d.pokemon} className="w-6 h-6" />
                  {d.pokemon}
                </h2>
                <Link to="/pokemon/$slug" params={{ slug: slugify(d.pokemon) }} className="text-xs text-primary underline">
                  Ver Pokémon
                </Link>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {d.items.map((i) => (
                  <ItemCard key={i} item={i} count={whoDropsItem(i).length} />
                ))}
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
