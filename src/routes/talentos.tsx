import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useMemo } from "react";
import { SectionTitle, Panel, EmptyState, Chip, PokemonIcon } from "@/components/pka/ui";
import { db, norm, expandQuery, slugify } from "@/lib/pka";

const schema = z.object({
  q: fallback(z.string(), "").default(""),
  cat: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/talentos")({
  validateSearch: zodValidator(schema),
  head: () => ({
    meta: [
      { title: "PokeTalents PKA — Buffs e materiais" },
      { name: "description", content: "Todos os PokeTalents do PokeAlliance: buff, slot, quantidade e Pokémon de origem." },
      { property: "og:title", content: "PokeTalents PKA" },
      { property: "og:description", content: "Buffs, slots e materiais dos PokeTalents." },
    ],
  }),
  component: Talents,
});

function Talents() {
  const { q, cat } = Route.useSearch();
  const navigate = useNavigate({ from: "/talentos" });
  const nq = expandQuery(q);
  const categories = useMemo(() => [...new Set(db.talents.map((t) => t.category).filter(Boolean))] as string[], []);

  const results = useMemo(
    () =>
      db.talents
        .filter((t) => (cat ? t.category === cat : true))
        .filter(
          (t) =>
            !nq ||
            norm(t.name).includes(nq) ||
            norm(t.source ?? "").includes(nq) ||
            norm(t.buff ?? "").includes(nq),
        )
        .slice(0, 200),
    [nq, cat],
  );

  return (
    <div>
      <SectionTitle icon="🧬" title="PokeTalents" subtitle={`${db.talents.length} talentos na base`} />
      <div className="mb-6 space-y-3">
        <input
          value={q}
          onChange={(e) => navigate({ search: (p) => ({ ...p, q: e.target.value }) })}
          placeholder="Pesquisar talento, buff ou Pokémon..."
          aria-label="Pesquisar talento"
          className="h-11 w-full rounded-md border border-input bg-panel px-3 text-sm focus:border-primary focus:outline-none"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate({ search: (p) => ({ ...p, cat: "" }) })}
            className={`rounded-md px-3 py-1 text-xs ${!cat ? "bg-primary text-primary-foreground" : "border border-border"}`}
          >
            Todos
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => navigate({ search: (p) => ({ ...p, cat: c }) })}
              className={`rounded-md px-3 py-1 text-xs ${cat === c ? "bg-primary text-primary-foreground" : "border border-border"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {results.length === 0 ? (
        <EmptyState query={q} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {results.map((t, i) => (
            <Panel key={i}>
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold capitalize">{t.name}</h2>
                {t.slot ? <Chip>{t.slot}</Chip> : null}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t.buff ?? "Buff não informado na base"}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {t.quantity ? <Chip tone="gold">{t.quantity}x material</Chip> : null}
                {t.source ? (
                  <Link
                    to="/pokemon/$slug"
                    params={{ slug: slugify(t.source) }}
                    className="rounded-md border border-border px-2.5 py-1 hover:text-primary flex items-center gap-1"
                  >
                    Vem de {t.source} <PokemonIcon pokemon={t.source} className="w-5 h-5 ml-1" />
                  </Link>
                ) : null}
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
