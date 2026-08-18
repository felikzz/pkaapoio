import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useMemo } from "react";
import { SectionTitle, Panel, EmptyState, Chip, PokemonIcon } from "@/components/pka/ui";
import { db, norm, expandQuery, slugify } from "@/lib/pka";

const schema = z.object({ q: fallback(z.string(), "").default("") });

export const Route = createFileRoute("/dungeons")({
  validateSearch: zodValidator(schema),
  head: () => ({
    meta: [
      { title: "Dungeons PKA — Mobs, itens e XP" },
      { name: "description", content: "Todas as dungeons do PokeAlliance: mobs, drops, XP por hora e localização." },
      { property: "og:title", content: "Dungeons PKA" },
      { property: "og:description", content: "Mobs, drops e XP das dungeons do PokeAlliance." },
    ],
  }),
  component: Dungeons,
});

function Dungeons() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/dungeons" });
  const nq = expandQuery(q);

  const results = useMemo(
    () =>
      nq
        ? db.dungeons.filter(
            (d) =>
              norm(d.name).includes(nq) ||
              d.hunts.some((h) => norm(h).includes(nq)) ||
              (d.mobList ?? []).some((m) => norm(m).includes(nq)) ||
              d.items.some((i) => norm(i).includes(nq)),
          )
        : db.dungeons,
    [nq],
  );

  return (
    <div>
      <SectionTitle icon="⚔️" title="Dungeons" subtitle={`${db.dungeons.length} dungeons mapeadas`} />
      <input
        value={q}
        onChange={(e) => navigate({ search: { q: e.target.value } })}
        placeholder="Pesquisar dungeon, mob ou item..."
        aria-label="Pesquisar dungeon"
        className="mb-6 h-11 w-full rounded-md border border-input bg-panel px-3 text-sm focus:border-primary focus:outline-none"
      />
      {results.length === 0 ? (
        <EmptyState query={q} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {results.map((d) => (
            <Panel key={d.name}>
              <Link to="/dungeon/$slug" params={{ slug: slugify(d.name) }} className="text-lg font-semibold hover:text-primary">
                {d.name}
              </Link>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {d.city ? <Chip>{d.city}</Chip> : null}
                {d.mobs ? <Chip>{d.mobs} mobs</Chip> : null}
                {d.xp ? <Chip tone="gold">{d.xp.toLocaleString("pt-BR")} XP</Chip> : null}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Hunts: 
                {d.hunts.length > 0 ? (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {d.hunts.map((h, i) => (
                      <span key={i} className="flex items-center gap-1 rounded-md border border-border bg-panel-strong px-2 py-1 text-xs">
                        <PokemonIcon pokemon={h} className="w-4 h-4" />
                        {h}
                      </span>
                    ))}
                  </div>
                ) : (
                  " não informado"
                )}
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
