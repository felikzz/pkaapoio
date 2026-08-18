import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useMemo } from "react";
import { SectionTitle, Panel, EmptyState, ExternalLinkChip, PokemonIcon } from "@/components/pka/ui";
import { db, norm, expandQuery } from "@/lib/pka";

const schema = z.object({ q: fallback(z.string(), "").default("") });

export const Route = createFileRoute("/npcs")({
  validateSearch: zodValidator(schema),
  head: () => ({
    meta: [
      { title: "NPCs e Ginásios PKA — Times e counters" },
      { name: "description", content: "Times de Rocket e Police com counters recomendados, além das tasks de cada ginásio." },
      { property: "og:title", content: "NPCs e Ginásios PKA" },
      { property: "og:description", content: "Counters de Rocket/Police e tasks de ginásio." },
    ],
  }),
  component: Npcs,
});

function Npcs() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/npcs" });
  const nq = expandQuery(q);

  const teams = useMemo(() => {
    const all = [
      ...db.rocket.map((t) => ({ ...t, group: "🚀 Team Rocket" })),
      ...db.police.map((t) => ({ ...t, group: "👮 Police" })),
    ];
    return all.filter(
      (t) => !nq || norm(t.npc).includes(nq) || t.members.some((m) => norm(m.npcPokemon).includes(nq) || norm(m.counter).includes(nq)),
    );
  }, [nq]);

  const gyms = useMemo(
    () => db.gyms.filter((g) => !nq || norm(g.city).includes(nq) || norm(`${g.task1} ${g.task2}`).includes(nq)),
    [nq],
  );

  return (
    <div className="space-y-8">
      <SectionTitle icon="🥊" title="NPCs e Ginásios" subtitle="Counters de Rocket/Police e tasks de ginásio" />
      <input
        value={q}
        onChange={(e) => navigate({ search: { q: e.target.value } })}
        placeholder="Pesquisar NPC, cidade ou Pokémon..."
        aria-label="Pesquisar NPC"
        className="h-11 w-full rounded-md border border-input bg-panel px-3 text-sm focus:border-primary focus:outline-none"
      />

      {teams.length === 0 && gyms.length === 0 ? (
        <EmptyState query={q} />
      ) : (
        <>
          {teams.length ? (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Times de NPC</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {teams.map((t, i) => (
                  <Panel key={i}>
                    <p className="text-xs text-muted-foreground">{t.group}</p>
                    <h3 className="font-semibold">{t.npc}</h3>
                    <ul className="mt-2 space-y-1 text-sm">
                      {t.members.map((m, j) => (
                        <li key={j} className="flex justify-between gap-2 border-b border-border/50 py-1 items-center">
                          <span className="flex items-center gap-1"><PokemonIcon pokemon={m.npcPokemon} className="w-5 h-5" /> {m.npcPokemon}</span>
                          <span className="text-success flex items-center gap-1 text-right">{m.counter} <PokemonIcon pokemon={m.counter} className="w-5 h-5" /></span>
                        </li>
                      ))}
                    </ul>
                  </Panel>
                ))}
              </div>
              {db.npcTeamNote ? <p className="mt-3 text-xs text-muted-foreground">{db.npcTeamNote}</p> : null}
            </section>
          ) : null}

          {gyms.length ? (
            <section>
              <h2 className="mb-3 text-lg font-semibold">🏟️ Ginásios</h2>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {gyms.map((g, gi) => (
                  <Panel key={`${g.city}-${gi}`}>
                    <h3 className="font-semibold">{g.city}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{g.task1 ?? "Task não informada"}</p>
                    {g.task2 ? <p className="text-sm text-muted-foreground">{g.task2}</p> : null}
                    {g.dungeon ? (
                      <div className="mt-2">
                        <ExternalLinkChip href={g.dungeon} label="Dungeon do ginásio" />
                      </div>
                    ) : null}
                  </Panel>
                ))}
              </div>
              {db.gymNote ? (
                <p className="mt-3 whitespace-pre-line text-xs text-muted-foreground">{db.gymNote}</p>
              ) : null}
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
