import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useMemo } from "react";
import { SectionTitle, Panel, EmptyState, ExternalLinkChip, Chip, PokemonIcon } from "@/components/pka/ui";
import { db, norm, expandQuery, slugify } from "@/lib/pka";

const schema = z.object({ q: fallback(z.string(), "").default("") });

export const Route = createFileRoute("/tasks")({
  validateSearch: zodValidator(schema),
  head: () => ({
    meta: [
      { title: "Tasks e NPCs PKA — Quem pede cada Pokémon" },
      { name: "description", content: "Consulte tasks do PokeAlliance por Pokémon ou NPC, incluindo hazard tasks." },
      { property: "og:title", content: "Tasks e NPCs PKA" },
      { property: "og:description", content: "Tasks do PokeAlliance por Pokémon ou NPC." },
    ],
  }),
  component: Tasks,
});

function Tasks() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/tasks" });
  const nq = expandQuery(q);

  const tasks = useMemo(
    () =>
      (nq
        ? db.tasks.filter((t) => norm(t.pokemon).includes(nq) || t.npcs.some((n) => norm(n.npc).includes(nq)))
        : db.tasks
      ).slice(0, 100),
    [nq],
  );
  const hazard = useMemo(
    () =>
      (nq
        ? db.hazardTasks.filter((h) => norm(h.npc).includes(nq) || norm(h.task ?? "").includes(nq))
        : db.hazardTasks
      ).slice(0, 40),
    [nq],
  );
  const linked = useMemo(
    () => (nq ? db.linkedTasks.filter((t) => norm(t.pokemon).includes(nq)).slice(0, 30) : []),
    [nq],
  );

  return (
    <div>
      <SectionTitle icon="🎯" title="Tasks e NPCs" subtitle={`${db.tasks.length} tasks e ${db.hazardTasks.length} hazard tasks`} />
      <input
        value={q}
        onChange={(e) => navigate({ search: { q: e.target.value } })}
        placeholder="Pesquisar Pokémon ou NPC..."
        aria-label="Pesquisar task"
        className="mb-6 h-11 w-full rounded-md border border-input bg-panel px-3 text-sm focus:border-primary focus:outline-none"
      />

      {tasks.length === 0 && hazard.length === 0 ? (
        <EmptyState query={q} />
      ) : (
        <div className="space-y-8">
          {linked.length ? (
            <section>
              <h2 className="mb-3 text-lg font-semibold">🔗 Quantidade da task</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {linked.map((t, i) => (
                  <Panel key={i}>
                    <p className="font-semibold flex items-center gap-2">
                      {t.qtd}x <PokemonIcon pokemon={t.pokemon} className="w-6 h-6" /> {t.pokemon} <span className="text-xs text-muted-foreground">({t.tipo})</span>
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {t.hunt ? <ExternalLinkChip href={t.hunt} label="Local de hunt" /> : null}
                      {t.killsPerHour ? <Chip>{t.killsPerHour} kills/h</Chip> : null}
                    </div>
                  </Panel>
                ))}
              </div>
            </section>
          ) : null}

          {tasks.length ? (
            <section>
              <h2 className="mb-3 text-lg font-semibold">🧑 Tasks por Pokémon</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {tasks.map((t) => (
                  <Panel key={t.pokemon}>
                    <Link to="/pokemon/$slug" params={{ slug: slugify(t.pokemon) }} className="font-semibold hover:text-primary flex items-center gap-2">
                      <PokemonIcon pokemon={t.pokemon} className="w-6 h-6" />
                      {t.pokemon}
                    </Link>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {t.npcs.map((n, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <Chip tone="gold">{n.npc}</Chip>
                          {n.link ? <ExternalLinkChip href={n.link} label="Local do NPC" /> : null}
                        </span>
                      ))}
                    </div>
                  </Panel>
                ))}
              </div>
            </section>
          ) : null}

          {hazard.length ? (
            <section>
              <h2 className="mb-3 text-lg font-semibold">☣️ Hazard Tasks</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {hazard.map((h, i) => (
                  <Panel key={i}>
                    <p className="font-semibold text-danger">{h.npc}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{h.task ?? "Task não informada na base"}</p>
                    {h.link ? (
                      <div className="mt-2">
                        <ExternalLinkChip href={h.link} label="Local do NPC" />
                      </div>
                    ) : null}
                  </Panel>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
