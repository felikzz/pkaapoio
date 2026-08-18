import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { BROKES_MAX } from "@/lib/brokes";
import { SectionTitle, Panel, TierBadge } from "@/components/pka/ui";
import { db } from "@/lib/pka";
import { Copy, Check, Sparkles, Terminal, Info, Search } from "lucide-react";

export const Route = createFileRoute("/brokes-maximas")({
  component: BrokesMaximas,
  head: () => ({
    title: "Brokes Máximas & Taxas — PKA Helper",
    meta: [
      {
        name: "description",
        content: "Tabela completa com valores máximos de brokes por tier e taxas de captura de Shiny no PokéAlliance.",
      },
    ],
  }),
});

export function BrokesMaximas() {
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);

  const filteredBrokes = useMemo(() => {
    if (!search.trim()) return BROKES_MAX;
    const q = search.toLowerCase();
    return BROKES_MAX.filter((b) => b.tier.toLowerCase().includes(q) || String(b.max).toLowerCase().includes(q));
  }, [search]);

  const copyCommand = () => {
    navigator.clipboard.writeText('!pokeball "Shiny Charizard');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <SectionTitle
        icon="📊"
        title="Brokes Máximas & Taxas de Catch"
        subtitle="Valores máximos de pokébolas (brokes) por tier e dados estatísticos da comunidade do PokéAlliance"
      />

      {/* DICA DE COMANDO IN-GAME */}
      <Panel className="border-primary/30 bg-primary/5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="rounded-md bg-primary/15 p-2 text-primary">
              <Terminal className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Como consultar suas brokes no jogo?</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Use o comando <code className="rounded bg-panel-strong px-1.5 py-0.5 font-mono text-primary">!pokeball &quot;Nome do Pokemon</code> ou abra a janela <kbd className="rounded bg-background px-1 py-0.5 text-xs">Ctrl + T</kbd> &gt; <strong>Pokemon Brokes</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={copyCommand}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-primary/40 bg-panel px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/10"
          >
            {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
            <span>{copied ? "Copiado!" : "Copiar Exemplo"}</span>
          </button>
        </div>
      </Panel>

      {/* BUSCA E TABELA DE BROKES */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <span>Tabela de Brokes por Tier</span>
            <span className="text-xs font-normal text-muted-foreground">({filteredBrokes.length} tiers)</span>
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar por tier..."
              className="h-9 w-full rounded-lg border border-input bg-panel pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBrokes.map((b) => (
            <div
              key={b.tier}
              className="rounded-xl border border-border bg-panel p-4 space-y-2 transition-all hover:border-primary/40"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">{b.tier}</span>
                <TierBadge tier={b.tier} />
              </div>
              <div className="flex items-baseline justify-between border-t border-border/60 pt-2 text-sm">
                <span className="text-xs text-muted-foreground">Broke Máxima:</span>
                <span className="font-mono text-base font-bold text-primary">
                  {typeof b.max === "number" ? b.max.toLocaleString("pt-BR") : b.max}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TAXAS DE SHINY */}
      {db.shinyRates && db.shinyRates.length > 0 && (
        <Panel className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-gold" />
            <h2 className="text-base font-bold text-foreground">Taxas Estimadas de Shiny (PKA)</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {db.shinyRates.map((sr, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-panel-strong p-4 space-y-3">
                <h4 className="text-xs font-bold text-gold uppercase tracking-wider">{sr.version}</h4>
                <div className="space-y-1.5">
                  {sr.rates.map((r, ri) => (
                    <div key={ri} className="flex items-center justify-between text-xs py-1 border-b border-border/40 last:border-0">
                      <span className="text-muted-foreground">{r.tier}:</span>
                      <span className="font-mono font-semibold text-foreground">{r.rate}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* NOTAS COMPLEMENTARES */}
      <Panel className="border-border bg-panel space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 font-bold text-foreground">
          <Info className="size-4 text-primary" />
          <span>Informações Importantes:</span>
        </div>
        <ul className="space-y-1 pl-5 list-disc">
          <li>As brokes representam o teto de bolas falhadas necessárias até garantir o catch de acordo com as métricas comunitárias.</li>
          <li>Em eventos especiais (como Carnaval), buffs de <strong>Shiny Charm (+20%)</strong> e <strong>Drop Rate (+20%)</strong> aceleram a captura e o progresso.</li>
          <li>Utilize balls adequadas para cada tier para maximizar suas chances antes de atingir o limite.</li>
        </ul>
      </Panel>
    </div>
  );
}
