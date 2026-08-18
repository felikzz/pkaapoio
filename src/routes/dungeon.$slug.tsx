import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SectionTitle, Panel, Chip, FavoriteButton, ExternalLinkChip, ItemCard } from "@/components/pka/ui";
import { db, dungeonBySlug, norm, slugify, whoDropsItem } from "@/lib/pka";

export const Route = createFileRoute("/dungeon/$slug")({
  loader: ({ params }) => {
    const dungeon = dungeonBySlug.get(params.slug);
    if (!dungeon) throw notFound();
    const runs = db.dungeonRuns
      .filter((r) => dungeon.hunts.some((h) => norm(h) === norm(r.key)) || norm(r.key) === norm(dungeon.name))
      .sort((a, b) => (a.players ?? 0) - (b.players ?? 0));
    return { dungeon, runs };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.dungeon.name ?? "Dungeon";
    return {
      meta: [
        { title: `${name} — Dungeon | PKA Helper` },
        { name: "description", content: `Mobs, drops, XP e tempo da dungeon ${name} no PokeAlliance.` },
        { property: "og:title", content: `${name} — PKA Helper` },
        { property: "og:description", content: `Mobs, drops e XP da dungeon ${name}.` },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="panel p-8 text-center">
      <p>Dungeon não encontrada na base atual do PKA.</p>
      <Link to="/dungeons" className="mt-4 inline-block text-primary underline">
        Ver todas as dungeons
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => <div role="alert" className="panel p-6">{error.message}</div>,
  component: DungeonPage,
});

function DungeonPage() {
  const { dungeon, runs } = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <SectionTitle icon="⚔️" title={dungeon.name} subtitle={dungeon.city ?? "Cidade não informada"} />
        <FavoriteButton fav={{ kind: "dungeon", label: dungeon.name, to: `/dungeon/${slugify(dungeon.name)}` }} />
      </div>

      <Panel>
        <div className="flex flex-wrap gap-2">
          {dungeon.mobs ? <Chip>{dungeon.mobs} mobs</Chip> : null}
          {dungeon.players ? <Chip>{dungeon.players} player(s)</Chip> : null}
          {dungeon.xp ? <Chip tone="gold">{dungeon.xp.toLocaleString("pt-BR")} XP</Chip> : null}
          {dungeon.time ? <Chip>{dungeon.time}</Chip> : null}
          {dungeon.xpPerHour ? <Chip tone="success">{dungeon.xpPerHour.toLocaleString("pt-BR")} XP/h</Chip> : null}
          {dungeon.location ? <ExternalLinkChip href={dungeon.location} label="Localização" /> : null}
        </div>
      </Panel>

      <Panel>
        <h2 className="mb-3 text-lg font-semibold">🐾 Pokémon da dungeon</h2>
        <div className="flex flex-wrap gap-2">
          {[...new Set([...dungeon.hunts, ...(dungeon.mobList ?? [])])].map((p) => (
            <Link
              key={p}
              to="/pokemon/$slug"
              params={{ slug: slugify(p) }}
              className="rounded-md border border-border bg-panel-strong px-2.5 py-1 text-xs hover:border-primary/50 hover:text-primary"
            >
              {p}
            </Link>
          ))}
        </div>
      </Panel>

      {dungeon.items.length ? (
        <Panel>
          <h2 className="mb-3 text-lg font-semibold">💎 Itens da dungeon</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {dungeon.items.map((i) => (
              <ItemCard key={i} item={i} count={whoDropsItem(i).length} />
            ))}
          </div>
        </Panel>
      ) : null}

      {runs.length ? (
        <Panel>
          <h2 className="mb-3 text-lg font-semibold">📊 Runs registradas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-2">Players</th>
                  <th>Mobs</th>
                  <th>XP</th>
                  <th>Tempo</th>
                  <th>XP/h</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="py-2">{r.players ?? "-"}</td>
                    <td>{r.mobs ?? "-"}</td>
                    <td>{r.xp ? r.xp.toLocaleString("pt-BR") : "-"}</td>
                    <td>{r.time ?? "-"}</td>
                    <td>{r.xpPerHour ? r.xpPerHour.toLocaleString("pt-BR") : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
