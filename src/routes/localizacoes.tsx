import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useMemo } from "react";
import { SectionTitle, Panel, EmptyState, ExternalLinkChip, PokemonIcon } from "@/components/pka/ui";
import { db, norm, expandQuery, slugify } from "@/lib/pka";

const schema = z.object({ q: fallback(z.string(), "").default("") });

export const Route = createFileRoute("/localizacoes")({
  validateSearch: zodValidator(schema),
  head: () => ({
    meta: [
      { title: "Localizações PKA — Onde encontrar cada Pokémon" },
      { name: "description", content: "Descubra onde caçar cada Pokémon do PokeAlliance, com mapas e áreas." },
      { property: "og:title", content: "Localizações PKA" },
      { property: "og:description", content: "Onde encontrar cada Pokémon no PokeAlliance." },
    ],
  }),
  component: Locations,
});

function Locations() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/localizacoes" });
  const nq = expandQuery(q);

  const results = useMemo(() => {
    const base = nq
      ? db.locations.filter(
          (l) =>
            norm(l.pokemon).includes(nq) ||
            l.entries.some((e) => norm(e.area ?? "").includes(nq) || norm(e.note ?? "").includes(nq)),
        )
      : db.locations;
    return base.slice(0, 100);
  }, [nq]);

  return (
    <div>
      <SectionTitle icon="🗺️" title="Localizações" subtitle={`${db.locations.length} Pokémon com local de caça mapeado`} />
      <input
        value={q}
        onChange={(e) => navigate({ search: { q: e.target.value } })}
        placeholder="Pesquisar Pokémon ou área..."
        aria-label="Pesquisar localização"
        className="mb-6 h-11 w-full rounded-md border border-input bg-panel px-3 text-sm focus:border-primary focus:outline-none"
      />
      {results.length === 0 ? (
        <EmptyState query={q} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {results.map((l) => (
            <Panel key={l.pokemon}>
              <div className="mb-2 flex items-center justify-between">
                <Link to="/pokemon/$slug" params={{ slug: slugify(l.pokemon) }} className="font-semibold hover:text-primary flex items-center gap-2">
                  <PokemonIcon pokemon={l.pokemon} className="w-6 h-6" />
                  {l.pokemon}
                </Link>
              </div>
              <ul className="space-y-2">
                {l.entries.map((e, i) => (
                  <li key={i} className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-foreground">{e.area ?? "Área não informada"}</span>
                    {e.note ? <span className="text-xs">({e.note})</span> : null}
                    {e.link ? <ExternalLinkChip href={e.link} label="Ver mapa" /> : null}
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
