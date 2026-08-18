import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useMemo } from "react";
import { SectionTitle, Panel, EmptyState, PokemonIcon } from "@/components/pka/ui";
import { db, norm, expandQuery, slugify } from "@/lib/pka";

const schema = z.object({ q: fallback(z.string(), "").default("") });

export const Route = createFileRoute("/medalhas")({
  validateSearch: zodValidator(schema),
  head: () => ({
    meta: [
      { title: "Medalhas PKA — Buffs e debuffs" },
      { name: "description", content: "Efeitos das medalhas do PokeAlliance: buff e debuff por Pokémon." },
      { property: "og:title", content: "Medalhas PKA" },
      { property: "og:description", content: "Buffs e debuffs das medalhas do PokeAlliance." },
    ],
  }),
  component: Medals,
});

function Medals() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/medalhas" });
  const nq = expandQuery(q);
  const results = useMemo(
    () =>
      db.medals.filter(
        (m) => !nq || norm(m.pokemon).includes(nq) || norm(m.buff).includes(nq) || norm(m.debuff ?? "").includes(nq),
      ),
    [nq],
  );

  return (
    <div>
      <SectionTitle icon="🏅" title="Medalhas" subtitle={`${db.medals.length} medalhas na base`} />
      <input
        value={q}
        onChange={(e) => navigate({ search: { q: e.target.value } })}
        placeholder="Pesquisar Pokémon ou efeito..."
        aria-label="Pesquisar medalha"
        className="mb-6 h-11 w-full rounded-md border border-input bg-panel px-3 text-sm focus:border-primary focus:outline-none"
      />
      {results.length === 0 ? (
        <EmptyState query={q} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {results.map((m) => (
            <Panel key={m.pokemon}>
              <Link to="/pokemon/$slug" params={{ slug: slugify(m.pokemon) }} className="font-semibold hover:text-primary flex items-center gap-2">
                <PokemonIcon pokemon={m.pokemon} className="w-6 h-6" />
                {m.pokemon}
              </Link>
              <p className="mt-2 text-sm text-success">▲ {m.buff}</p>
              {m.debuff ? <p className="mt-1 text-sm text-danger">▼ {m.debuff}</p> : null}
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
