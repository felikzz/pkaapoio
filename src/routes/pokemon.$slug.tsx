import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { SectionTitle, Panel, TierBadge, ExternalLinkChip, FavoriteButton, Chip, PokemonIcon } from "@/components/pka/ui";
import { getPokemonBySlug, getProfile, slugify } from "@/lib/pka";
import { pushHistory } from "@/lib/storage";

export const Route = createFileRoute("/pokemon/$slug")({
  loader: ({ params }) => {
    const entry = getPokemonBySlug(params.slug);
    if (!entry) throw notFound();
    return { profile: getProfile(entry) };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.profile.entry.name ?? "Pokémon";
    return {
      meta: [
        { title: `${name} — PKA Helper` },
        { name: "description", content: `Drops, localizações, tasks, tier e medalhas de ${name} no PokeAlliance.` },
        { property: "og:title", content: `${name} — PKA Helper` },
        { property: "og:description", content: `Drops, localizações, tasks, tier e medalhas de ${name} no PokeAlliance.` },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="panel p-8 text-center">
      <p className="text-lg font-semibold">Pokémon não encontrado na base atual do PKA.</p>
      <Link to="/pokedex" className="mt-4 inline-block text-primary underline">
        Abrir Pokédex
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => <div role="alert" className="panel p-6">{error.message}</div>,
  component: PokemonPage,
});

function PokemonPage() {
  const { profile } = Route.useLoaderData();
  const p = profile.entry;

  useEffect(() => {
    pushHistory({ query: p.name, to: `/pokemon/${p.slug}` });
  }, [p.name, p.slug]);

  const has =
    profile.drops.length ||
    profile.locations.length ||
    profile.tasks.length ||
    profile.medal ||
    profile.talents.length ||
    profile.dungeons.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <SectionTitle icon={<PokemonIcon pokemon={p.name} className="w-8 h-8" />} title={p.name} subtitle={p.type ? `Moveset: ${p.type}` : undefined} />
          <div className="flex flex-wrap gap-2">
            {p.tier ? <TierBadge tier={p.tier} /> : null}
            {p.shiny ? <Chip tone="gold">Shiny</Chip> : null}
          </div>
        </div>
        <FavoriteButton fav={{ kind: "pokemon", label: p.name, to: `/pokemon/${p.slug}` }} />
      </div>

      {!has ? (
        <Panel>
          <p className="text-sm text-muted-foreground">
            Não encontramos mais informações sobre {p.name} na base atual do PKA.
          </p>
        </Panel>
      ) : null}

      {profile.locations.length ? (
        <Panel>
          <h2 className="mb-3 text-lg font-semibold">📍 Localizações</h2>
          <div className="flex flex-wrap gap-2">
            {profile.locations.map((l) => (
              <span key={l.area} className="flex items-center gap-2">
                <Chip>{l.area}</Chip>
                {l.link ? <ExternalLinkChip href={l.link} label="Ver mapa" /> : null}
                {l.note ? <span className="text-xs text-muted-foreground">{l.note}</span> : null}
              </span>
            ))}
          </div>
        </Panel>
      ) : null}

      {profile.drops.length ? (
        <Panel>
          <h2 className="mb-3 text-lg font-semibold">🎒 Drops ({profile.drops.length})</h2>
          <div className="flex flex-wrap gap-2">
            {profile.drops.map((d) => (
              <Link
                key={d}
                to="/item/$slug"
                params={{ slug: slugify(d) }}
                className="rounded-md border border-gold/30 bg-gold/10 px-2.5 py-1 text-xs capitalize text-gold hover:bg-gold/20"
              >
                {d}
              </Link>
            ))}
          </div>
        </Panel>
      ) : null}

      {profile.tasks.length || profile.linkedTasks.length ? (
        <Panel>
          <h2 className="mb-3 text-lg font-semibold">🎯 Tasks</h2>
          <div className="space-y-2">
            {profile.tasks.map((t) => (
              <div key={t.npc} className="flex flex-wrap items-center gap-2 text-sm">
                <Chip tone="success">NPC: {t.npc}</Chip>
                {t.link ? <ExternalLinkChip href={t.link} label="Localização do NPC" /> : null}
              </div>
            ))}
            {profile.linkedTasks.map((t, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 text-sm">
                <Chip>Linked Task: {t.qtd ?? "?"}x {t.tipo ?? ""}</Chip>
                {t.hunt ? <ExternalLinkChip href={t.hunt} label="Hunt" /> : null}
                {t.killsPerHour ? <span className="text-xs text-muted-foreground">{t.killsPerHour} kills/h</span> : null}
              </div>
            ))}
          </div>
        </Panel>
      ) : null}

      {profile.medal ? (
        <Panel>
          <h2 className="mb-3 text-lg font-semibold">🏅 Medalha</h2>
          <div className="flex flex-wrap gap-2">
            <Chip tone="success">Buff: {profile.medal.buff}</Chip>
            {profile.medal.debuff ? <Chip tone="danger">Debuff: {profile.medal.debuff}</Chip> : null}
          </div>
        </Panel>
      ) : null}

      {profile.talents.length ? (
        <Panel>
          <h2 className="mb-3 text-lg font-semibold">🧬 Talentos</h2>
          <div className="space-y-2">
            {profile.talents.map((t, i) => (
              <div key={i} className="rounded-md border border-border bg-panel-strong p-3">
                <p className="font-medium capitalize">{t.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t.category} {t.slot ? `• ${t.slot}` : ""} {t.quantity ? `• Quantidade: ${t.quantity}` : ""}
                </p>
                {t.buff ? <p className="mt-1 text-sm">{t.buff}</p> : null}
              </div>
            ))}
          </div>
        </Panel>
      ) : null}

      {profile.dungeons.length ? (
        <Panel>
          <h2 className="mb-3 text-lg font-semibold">⚔️ Dungeons</h2>
          <div className="flex flex-wrap gap-2">
            {profile.dungeons.map((d) => (
              <Link
                key={d.name}
                to="/dungeon/$slug"
                params={{ slug: slugify(d.name) }}
                className="rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs text-primary hover:bg-primary/20"
              >
                {d.name}
              </Link>
            ))}
          </div>
        </Panel>
      ) : null}

      {profile.boostTypes.length ? (
        <Panel>
          <h2 className="mb-3 text-lg font-semibold">⚡ Usado em Boost</h2>
          <div className="flex flex-wrap gap-2">
            {profile.boostTypes.map((b) => (
              <Link key={b.type} to="/boost" search={{ q: b.type }} className="rounded-md border border-border bg-panel-strong px-2.5 py-1 text-xs hover:border-primary/50">
                {b.type}
              </Link>
            ))}
          </div>
        </Panel>
      ) : null}

      <Panel>
        <h2 className="mb-3 text-lg font-semibold">Você também pode querer saber</h2>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link to="/drops" search={{ q: p.name, mode: "pokemon" }} className="rounded-md border border-border bg-panel-strong px-3 py-2 hover:border-primary/50">
            🎒 Drops do {p.name}
          </Link>
          <Link to="/localizacoes" search={{ q: p.name }} className="rounded-md border border-border bg-panel-strong px-3 py-2 hover:border-primary/50">
            📍 Onde encontrar
          </Link>
          <Link to="/tier-list" search={{ q: p.name }} className="rounded-md border border-border bg-panel-strong px-3 py-2 hover:border-primary/50">
            📊 Tier
          </Link>
          <Link to="/tasks" search={{ q: p.name }} className="rounded-md border border-border bg-panel-strong px-3 py-2 hover:border-primary/50">
            🎯 Tasks
          </Link>
          <Link to="/medalhas" search={{ q: p.name }} className="rounded-md border border-border bg-panel-strong px-3 py-2 hover:border-primary/50">
            🏅 Medalhas
          </Link>
        </div>
      </Panel>
    </div>
  );
}
