import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useMemo } from "react";
import { SectionTitle, Panel } from "@/components/pka/ui";
import { db, starCost } from "@/lib/pka";

const schema = z.object({
  tier: fallback(z.string(), "").default(""),
  from: fallback(z.number(), 0).default(0),
  to: fallback(z.number(), 5).default(5),
});

export const Route = createFileRoute("/star")({
  validateSearch: zodValidator(schema),
  head: () => ({
    meta: [
      { title: "Calculadora Star PKA — Custo de estrelar" },
      { name: "description", content: "Calcule quantos Pokémon, DD e KK são necessários para estrelar no PokeAlliance." },
      { property: "og:title", content: "Calculadora Star PKA" },
      { property: "og:description", content: "Custo de estrelar por tier no PokeAlliance." },
    ],
  }),
  component: Star,
});

function Star() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/star" });
  const tiers = db.starLevels.map((s) => s.tier);
  const tier = tiers.includes(search.tier) ? search.tier : (tiers[0] ?? "");
  const from = Math.max(0, Math.min(5, search.from));
  const to = Math.max(from, Math.min(5, search.to));

  const result = useMemo(() => starCost(tier, from, to), [tier, from, to]);

  return (
    <div className="space-y-6">
      <SectionTitle icon="⭐" title="Calculadora Star" subtitle="Custo total para subir de estrela, por tier" />

      <Panel>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Tier</span>
            <select
              value={tier}
              onChange={(e) => navigate({ search: (p) => ({ ...p, tier: e.target.value }) })}
              className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              {tiers.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">De (estrelas)</span>
            <select
              value={from}
              onChange={(e) => navigate({ search: (p) => ({ ...p, from: Number(e.target.value) }) })}
              className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              {[0, 1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n}★
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Até (estrelas)</span>
            <select
              value={to}
              onChange={(e) => navigate({ search: (p) => ({ ...p, to: Number(e.target.value) }) })}
              className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}★
                </option>
              ))}
            </select>
          </label>
        </div>
      </Panel>

      {!result ? (
        <Panel>
          <p className="text-sm text-muted-foreground">Essa combinação não foi encontrada na base do PKA.</p>
        </Panel>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Panel>
              <p className="text-xs uppercase text-muted-foreground">Pokémon necessários</p>
              <p className="mt-1 text-3xl font-bold text-gold">{result.pokes}</p>
            </Panel>
            <Panel>
              <p className="text-xs uppercase text-muted-foreground">Dust (DD)</p>
              <p className="mt-1 text-3xl font-bold">{result.dd.toLocaleString("pt-BR")}</p>
            </Panel>
            <Panel>
              <p className="text-xs uppercase text-muted-foreground">KK</p>
              <p className="mt-1 text-3xl font-bold">{result.kk.toLocaleString("pt-BR")}</p>
            </Panel>
          </div>

          <Panel>
            <h2 className="mb-3 text-lg font-semibold">Passo a passo</h2>
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-2">Etapa</th>
                  <th>DD por passo</th>
                  <th>KK por passo</th>
                </tr>
              </thead>
              <tbody>
                {result.steps.map((s, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="py-2">
                      {s.from}★ → {s.to}★
                    </td>
                    <td>{s.dd}</td>
                    <td>{s.kk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </>
      )}

      {db.starNote ? (
        <Panel>
          <h2 className="mb-2 text-sm font-semibold uppercase text-muted-foreground">Observações da planilha</h2>
          <p className="whitespace-pre-line text-sm text-muted-foreground">{db.starNote}</p>
        </Panel>
      ) : null}
    </div>
  );
}
