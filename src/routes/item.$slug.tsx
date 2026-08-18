import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { SectionTitle, Panel, FavoriteButton, Chip } from "@/components/pka/ui";
import { getItemBySlug, whoDropsItem, itemUses, slugify } from "@/lib/pka";
import { pushHistory } from "@/lib/storage";

export const Route = createFileRoute("/item/$slug")({
  loader: ({ params }) => {
    const item = getItemBySlug(params.slug);
    if (!item) throw notFound();
    return { item, droppedBy: whoDropsItem(item), uses: itemUses(item) };
  },
  head: ({ loaderData }) => {
    const item = loaderData?.item ?? "Item";
    return {
      meta: [
        { title: `${item} — Quem dropa | PKA Helper` },
        { name: "description", content: `Pokémon que dropam ${item} e usos do item no PokeAlliance.` },
        { property: "og:title", content: `${item} — PKA Helper` },
        { property: "og:description", content: `Pokémon que dropam ${item} no PokeAlliance.` },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="panel p-8 text-center">
      <p>Item não encontrado na base atual do PKA.</p>
      <Link to="/itens" className="mt-4 inline-block text-primary underline">
        Ver todos os itens
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => <div role="alert" className="panel p-6">{error.message}</div>,
  component: ItemPage,
});

function ItemPage() {
  const { item, droppedBy, uses } = Route.useLoaderData();

  useEffect(() => {
    pushHistory({ query: item, to: `/item/${slugify(item)}` });
  }, [item]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <SectionTitle icon="💎" title={item.toUpperCase()} subtitle={`${droppedBy.length} Pokémon dropam este item`} />
        <FavoriteButton fav={{ kind: "item", label: item, to: `/item/${slugify(item)}` }} />
      </div>

      <Panel>
        <h2 className="mb-3 text-lg font-semibold">🎒 Dropado por</h2>
        {droppedBy.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum Pokémon com esse drop na base atual do PKA.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {droppedBy.map((p) => (
              <Link
                key={p}
                to="/pokemon/$slug"
                params={{ slug: slugify(p) }}
                className="rounded-md border border-border bg-panel-strong px-3 py-2 text-sm hover:border-primary/50 hover:text-primary"
              >
                {p} <span className="text-xs text-muted-foreground">→ Ver Pokémon</span>
              </Link>
            ))}
          </div>
        )}
      </Panel>

      {uses.boost.length ? (
        <Panel>
          <h2 className="mb-3 text-lg font-semibold">⚡ Usado em Boost</h2>
          <div className="flex flex-wrap gap-2">
            {uses.boost.map((b) => (
              <Chip key={b.type} tone="gold">
                {b.type}
              </Chip>
            ))}
          </div>
        </Panel>
      ) : null}

      {uses.dungeons.length ? (
        <Panel>
          <h2 className="mb-3 text-lg font-semibold">⚔️ Aparece em Dungeons</h2>
          <div className="flex flex-wrap gap-2">
            {uses.dungeons.map((d) => (
              <Link
                key={d.name}
                to="/dungeon/$slug"
                params={{ slug: slugify(d.name) }}
                className="rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs text-primary"
              >
                {d.name}
              </Link>
            ))}
          </div>
        </Panel>
      ) : null}

      {uses.talents.length ? (
        <Panel>
          <h2 className="mb-3 text-lg font-semibold">🧬 Talento relacionado</h2>
          {uses.talents.map((t, i) => (
            <p key={i} className="text-sm">
              <span className="capitalize">{t.name}</span> — {t.buff ?? "sem descrição na base"}
            </p>
          ))}
        </Panel>
      ) : null}
    </div>
  );
}
