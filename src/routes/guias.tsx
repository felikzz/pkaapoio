import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useMemo } from "react";
import { SectionTitle, Panel, EmptyState, ExternalLinkChip, FavoriteButton } from "@/components/pka/ui";
import { guides, guideCategories, norm, expandQuery, slugify } from "@/lib/pka";

const schema = z.object({
  q: fallback(z.string(), "").default(""),
  cat: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/guias")({
  validateSearch: zodValidator(schema),
  head: () => ({
    meta: [
      { title: "Guias e FAQ PKA — Dúvidas do PokeAlliance" },
      { name: "description", content: "Guias, links e respostas rápidas para as dúvidas mais comuns do PokeAlliance." },
      { property: "og:title", content: "Guias e FAQ PKA" },
      { property: "og:description", content: "Guias e respostas rápidas do PokeAlliance." },
    ],
  }),
  component: Guides,
});

function Guides() {
  const { q, cat } = Route.useSearch();
  const navigate = useNavigate({ from: "/guias" });
  const nq = expandQuery(q);

  const results = useMemo(
    () =>
      guides
        .filter((g) => (cat ? g.category === cat : true))
        .filter((g) => !nq || norm(g.key).includes(nq) || norm(g.content).includes(nq)),
    [nq, cat],
  );

  return (
    <div>
      <SectionTitle icon="📚" title="Guias e FAQ" subtitle={`${guides.length} respostas da comunidade PKA`} />
      <div className="mb-6 space-y-3">
        <input
          value={q}
          onChange={(e) => navigate({ search: (p) => ({ ...p, q: e.target.value }) })}
          placeholder="Pesquisar dúvida..."
          aria-label="Pesquisar guia"
          className="h-11 w-full rounded-md border border-input bg-panel px-3 text-sm focus:border-primary focus:outline-none"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate({ search: (p) => ({ ...p, cat: "" }) })}
            className={`rounded-md px-3 py-1 text-xs ${!cat ? "bg-primary text-primary-foreground" : "border border-border"}`}
          >
            Todos
          </button>
          {guideCategories.map((c) => (
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
        <div className="space-y-3">
          {results.map((g) => (
            <Panel key={g.key}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">{g.category}</p>
                  <h2 className="font-semibold capitalize">{g.key}</h2>
                </div>
                <FavoriteButton fav={{ kind: "guide", label: g.key, to: `/guias?q=${slugify(g.key)}` }} />
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{g.content}</p>
              {g.links.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {g.links.map((l, i) => (
                    <ExternalLinkChip key={i} href={l} label="Abrir link" />
                  ))}
                </div>
              ) : null}
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
