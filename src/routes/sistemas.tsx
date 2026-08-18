import { createFileRoute } from "@tanstack/react-router";
import { SectionTitle, Panel } from "@/components/pka/ui";
import { db } from "@/lib/pka";

export const Route = createFileRoute("/sistemas")({
  head: () => ({
    meta: [
      { title: "Sistemas PKA — Runas, brokes, shiny rate e mais" },
      { name: "description", content: "Runas, brokes máximos, shiny rate, dano por role, Porygon e Bounty Hunter do PokeAlliance." },
      { property: "og:title", content: "Sistemas PKA" },
      { property: "og:description", content: "Runas, brokes, shiny rate e dano recomendado no PokeAlliance." },
    ],
  }),
  component: Systems,
});

function Systems() {
  const shiny = db.shinyRates[0];

  return (
    <div className="space-y-8">
      <SectionTitle icon="🧩" title="Sistemas" subtitle="Runas, brokes, shiny rate, dano, Porygon e BH" />

      <section>
        <h2 className="mb-3 text-lg font-semibold">🔮 Runas</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {db.runes.map((r) => (
            <Panel key={r.stat}>
              <h3 className="font-semibold">{r.stat}</h3>
              <table className="mt-2 w-full text-left text-sm">
                <tbody>
                  {r.levels.map((l, i) => (
                    <tr key={i} className="border-t border-border/60">
                      <td className="py-1">{l.level}</td>
                      <td>{l.points} pts</td>
                      <td className="text-success">{l.bonus || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">🎯 Brokes máximos</h2>
        <Panel>
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-2">Tier</th>
                <th>Max broke</th>
              </tr>
            </thead>
            <tbody>
              {db.brokes.map((b) => (
                <tr key={b.tier} className="border-t border-border">
                  <td className="py-2">{b.tier}</td>
                  <td>{b.maxBroke}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {db.brokesNote ? (
            <p className="mt-3 whitespace-pre-line text-xs text-muted-foreground">{db.brokesNote}</p>
          ) : null}
        </Panel>
      </section>

      {shiny ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold">✨ Shiny Rate (versão {shiny.version})</h2>
          <Panel>
            <table className="w-full text-left text-sm">
              <tbody>
                {shiny.rates.map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="py-2 break-all">{r.tier}</td>
                    <td>{r.rate || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 text-lg font-semibold">💥 Dano recomendado por role</h2>
        <Panel>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-2">Role</th>
                  {db.damage.tiers.map((t) => (
                    <th key={t}>{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {db.damage.roles.map((r) => (
                  <tr key={r.role} className="border-t border-border">
                    <td className="py-2">{r.role}</td>
                    {r.values.map((v, i) => (
                      <td key={i}>{v === "-" ? "-" : Number(v).toLocaleString("pt-BR")}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">🖥️ Porygon</h2>
        <div className="space-y-3">
          {db.porygon.map((p, i) => (
            <Panel key={i}>
              <h3 className="font-semibold">{p.step}</h3>
              <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{p.content}</p>
            </Panel>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">🏹 Bounty Hunter</h2>
        {db.bh.map((t, i) => (
          <Panel key={i}>
            <p className="whitespace-pre-line text-sm text-muted-foreground">{t}</p>
          </Panel>
        ))}
      </section>
    </div>
  );
}
