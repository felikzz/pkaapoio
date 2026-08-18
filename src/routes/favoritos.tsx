import { createFileRoute } from "@tanstack/react-router";
import { SectionTitle, Panel } from "@/components/pka/ui";
import { useFavorites, useHistory } from "@/lib/storage";

export const Route = createFileRoute("/favoritos")({
  head: () => ({
    meta: [
      { title: "Favoritos PKA — Seus atalhos salvos" },
      { name: "description", content: "Pokémon, itens, dungeons e guias que você salvou no PKA Helper." },
      { property: "og:title", content: "Favoritos PKA" },
      { property: "og:description", content: "Seus atalhos salvos no PKA Helper." },
    ],
  }),
  component: Favorites,
});

const KIND_LABEL: Record<string, string> = {
  pokemon: "🐾 Pokémon",
  item: "💎 Item",
  dungeon: "⚔️ Dungeon",
  guide: "📚 Guia",
};

function Favorites() {
  const { favorites, toggle } = useFavorites();
  const { history } = useHistory();

  return (
    <div className="space-y-8">
      <SectionTitle icon="⭐" title="Favoritos" subtitle="Salvos localmente no seu navegador" />

      {favorites.length === 0 ? (
        <Panel>
          <p className="text-sm text-muted-foreground">
            Você ainda não salvou nada. Use o botão ⭐ nas páginas de Pokémon, itens e dungeons.
          </p>
        </Panel>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((f) => (
            <Panel key={f.to}>
              <p className="text-xs text-muted-foreground">{KIND_LABEL[f.kind] ?? f.kind}</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <a href={f.to} className="font-semibold capitalize hover:text-primary">
                  {f.label}
                </a>
                <button onClick={() => toggle(f)} className="text-xs text-danger hover:underline">
                  remover
                </button>
              </div>
            </Panel>
          ))}
        </div>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">🕘 Histórico de buscas</h2>
        {history.length === 0 ? (
          <Panel>
            <p className="text-sm text-muted-foreground">Nenhuma busca recente.</p>
          </Panel>
        ) : (
          <div className="flex flex-wrap gap-2">
            {history.map((h, i) => (
              <a
                key={i}
                href={h.to}
                className="rounded-md border border-border bg-panel-strong px-3 py-1.5 text-sm capitalize hover:border-primary/50 hover:text-primary"
              >
                {h.query}
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
