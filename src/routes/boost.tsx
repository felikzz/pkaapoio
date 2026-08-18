import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useMemo } from "react";
import { SectionTitle, Panel, EmptyState, Chip } from "@/components/pka/ui";
import { db, norm, expandQuery, slugify } from "@/lib/pka";

const schema = z.object({ q: fallback(z.string(), "").default("") });

export const Route = createFileRoute("/boost")({
  validateSearch: zodValidator(schema),
  head: () => ({
    meta: [
      { title: "Boost PKA — Fragmentos, pedras e itens" },
      { name: "description", content: "Materiais de boost por tipo no PokeAlliance: fragmento, pedra e itens necessários." },
      { property: "og:title", content: "Boost PKA" },
      { property: "og:description", content: "Materiais de boost por tipo no PokeAlliance." },
    ],
  }),
  component: Boost,
});

function Boost() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/boost" });
  const nq = expandQuery(q);
  const results = useMemo(
    () =>
      db.boost.filter(
        (b) =>
          !nq ||
          norm(b.type).includes(nq) ||
          norm(b.fragment ?? "").includes(nq) ||
          norm(b.stone ?? "").includes(nq) ||
          b.items.some((i) => norm(i).includes(nq)),
      ),
    [nq],
  );

  return (
    <div>
      <SectionTitle icon="⚡" title="Boost" subtitle={`${db.boost.length} tipos com materiais mapeados`} />
      <input
        value={q}
        onChange={(e) => navigate({ search: { q: e.target.value } })}
        placeholder="Pesquisar tipo ou item..."
        aria-label="Pesquisar boost"
        className="mb-6 h-11 w-full rounded-md border border-input bg-panel px-3 text-sm focus:border-primary focus:outline-none"
      />
      {results.length === 0 ? (
        <EmptyState query={q} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {results.map((b) => (
            <Panel key={b.type}>
              <h2 className="text-lg font-semibold text-gold">{b.type}</h2>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {b.fragment ? <Chip>Fragmento: {b.fragment}</Chip> : null}
                {b.stone ? <Chip tone="gold">Pedra: {b.stone}</Chip> : null}
              </div>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {b.items.map((i) => (
                  <li key={i}>
                    <Link to="/item/$slug" params={{ slug: slugify(i.replace(/\s*\(.*\)$/, "")) }} className="hover:text-primary">
                      • {i}
                    </Link>
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
