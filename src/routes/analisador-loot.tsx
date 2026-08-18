import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SectionTitle, Panel, Chip, PokemonIcon } from "@/components/pka/ui";
import { db, norm, slugify, itemUses } from "@/lib/pka";
import { Sparkles, DollarSign, Package, ShieldCheck, AlertCircle, TrendingUp, Clock, Skull, Zap, Copy, Check, UploadCloud } from "lucide-react";

export const Route = createFileRoute("/analisador-loot")({
  head: () => ({
    meta: [
      { title: "Analisador de Loot de Hunt (Autoloot JSON) — PKA Helper" },
      {
        name: "description",
        content: "Cole o JSON da sua bag de hunt e descubra o que guardar para talentos, o que vender no Market e o que vender no NPC no PokeAlliance.",
      },
      { property: "og:title", content: "Analisador de Loot de Hunt — PKA Helper" },
      {
        property: "og:description",
        content: "Cole o JSON da sua bag de hunt e descubra o que guardar para talentos, o que vender no Market e o que vender no NPC no PokeAlliance.",
      },
    ],
  }),
  component: LootAnalyzerPage,
});

const SAMPLE_JSON = `{
  "damage": {
    "totalCreaturesKilled": 7069,
    "totalDamage": 253759753,
    "uniqueCreatureTypes": 2,
    "creatures": [
      {
        "damagePerKill": 34803,
        "creatureName": "Machamp",
        "totalDamage": 241600299,
        "lookType": 69,
        "kills": 6942
      },
      {
        "damagePerKill": 95744,
        "creatureName": "Shiny Machamp",
        "totalDamage": 12159454,
        "lookType": 571,
        "kills": 127
      }
    ]
  },
  "loot": {
    "itemizedValueSum": 546000,
    "totalItemsDropped": 200,
    "totalLootGp": 1407781,
    "uniqueItemTypes": 13,
    "items": [
      {
        "itemClientId": 37860,
        "count": 182,
        "totalValue": 546000,
        "minValue": 3000,
        "maxValue": 3000,
        "avgValue": 3000,
        "itemName": "Punch Stone"
      },
      {
        "itemClientId": 41616,
        "count": 12,
        "totalValue": 0,
        "minValue": 0,
        "maxValue": 0,
        "avgValue": 0,
        "itemName": "Arcane Shard"
      },
      {
        "itemClientId": 29365,
        "count": 2,
        "totalValue": 0,
        "minValue": 0,
        "maxValue": 0,
        "avgValue": 0,
        "itemName": "Kanto toy box"
      },
      {
        "itemClientId": 36825,
        "count": 1,
        "totalValue": 0,
        "minValue": 0,
        "maxValue": 0,
        "avgValue": 0,
        "itemName": "Mythic Fighting Orb"
      },
      {
        "itemClientId": 31201,
        "count": 45,
        "totalValue": 135000,
        "minValue": 3000,
        "maxValue": 3000,
        "avgValue": 3000,
        "itemName": "belt of champion"
      }
    ]
  },
  "summary": {
    "totalExperience": 27516056,
    "balance": 822471,
    "spent": 585310,
    "totalDamage": 253759753,
    "loot": 1407781
  },
  "rates": {
    "lootPerHour": 329348,
    "spentPerHour": 136932,
    "balancePerHour": 192416,
    "damagePerHour": 59366722,
    "xpPerHour": 6437341
  },
  "meta": {
    "duration": "04:16:28",
    "exportedAt": 1786937509,
    "character": "Felikzz",
    "durationSeconds": 15388,
    "sessionStart": 1786922121
  }
}`;

type ParsedLootItem = {
  itemName: string;
  count: number;
  totalValue: number;
  status: "talent" | "market_rare" | "npc_sell";
  talentInfo?: {
    name: string;
    category: string | null;
    slot: string | null;
    buff: string | null;
    quantity: number | null;
    source: string | null;
  } | null;
  usesSummary: string[];
  recommendation: string;
};

function LootAnalyzerPage() {
  const [jsonInput, setJsonInput] = useState<string>("");
  const [parsedData, setParsedData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleAnalyze = (textToParse?: string) => {
    setErrorMsg(null);
    const content = textToParse !== undefined ? textToParse : jsonInput;
    if (!content.trim()) {
      setParsedData(null);
      return;
    }

    try {
      const parsed = JSON.parse(content);
      if (!parsed.loot || !parsed.loot.items) {
        throw new Error("O JSON precisa conter a seção 'loot' com a lista de 'items'.");
      }
      setParsedData(parsed);
    } catch (err: any) {
      setErrorMsg("Erro ao ler JSON: " + (err?.message ?? "Formato inválido."));
      setParsedData(null);
    }
  };

  const handleLoadSample = () => {
    setJsonInput(SAMPLE_JSON);
    handleAnalyze(SAMPLE_JSON);
  };

  const handleCopySummary = () => {
    if (!parsedData) return;
    const summaryText = `📊 Resumo da Hunt (${parsedData.meta?.character ?? "Jogador"})\n⏱️ Duração: ${parsedData.meta?.duration ?? "n/d"}\n📈 XP Total: ${parsedData.summary?.totalExperience?.toLocaleString("pt-BR") ?? 0} (${parsedData.rates?.xpPerHour?.toLocaleString("pt-BR") ?? 0}/h)\n💰 Balanço: ${parsedData.summary?.balance?.toLocaleString("pt-BR") ?? 0} Dol\n💀 Monstros: ${parsedData.damage?.totalCreaturesKilled?.toLocaleString("pt-BR") ?? 0}`;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Group and analyze items against database
  const analyzedItems = useMemo(() => {
    if (!parsedData?.loot?.items) return [];

    // Consolidate duplicate items by itemName
    const consolidatedMap = new Map<string, { count: number; totalValue: number; itemName: string }>();

    for (const rawItem of parsedData.loot.items) {
      const name = rawItem.itemName ?? "Item Desconhecido";
      const key = norm(name);
      const existing = consolidatedMap.get(key);
      if (existing) {
        existing.count += rawItem.count ?? 1;
        existing.totalValue += rawItem.totalValue ?? 0;
      } else {
        consolidatedMap.set(key, {
          itemName: name,
          count: rawItem.count ?? 1,
          totalValue: rawItem.totalValue ?? 0,
        });
      }
    }

    const results: ParsedLootItem[] = [];

    for (const item of consolidatedMap.values()) {
      const k = norm(item.itemName);
      const talent = db.talents.find((t) => norm(t.name) === k);
      const isOrb = /orb/i.test(item.itemName);
      const isShard = /shard/i.test(item.itemName);
      const isToyBox = /toy box/i.test(item.itemName);
      const isRareStone = /ancient|boost|metal coat|king's rock/i.test(item.itemName);

      const uses = itemUses(item.itemName);
      const usesSummary: string[] = [];
      if (talent) usesSummary.push(`Talento: ${talent.category ?? "Geral"} (${talent.slot ?? "Slot"})`);
      if (uses.boost.length) usesSummary.push(`Boost: ${uses.boost.map((b) => b.type).join(", ")}`);
      if (uses.dungeons.length) usesSummary.push(`Dungeons: ${uses.dungeons.map((d) => d.name).join(", ")}`);

      let status: ParsedLootItem["status"] = "npc_sell";
      let recommendation = "Pode vender no NPC para fazer KKs / Dol rapidamente.";

      if (talent) {
        status = "talent";
        recommendation = `GUARDE OU VENDA NO MARKET! É material essencial para o talento "${talent.name}" (${talent.buff ?? "Buff"}).`;
      } else if (isShard || isOrb || isToyBox || isRareStone) {
        status = "market_rare";
        if (isShard) recommendation = "NÃO VENDA NO NPC! Shards são chaves para entrar nas Dungeons ou trocar no Market.";
        else if (isOrb) recommendation = "VALIOSO! Orbs são usados em evoluções Shiny e valem muito no Market.";
        else if (isToyBox) recommendation = "ITEM RARO! Toy Box vale muito no Market de colecionadores.";
        else recommendation = "ITEM RARO! Guarde ou anuncie no Market para outros jogadores.";
      }

      results.push({
        itemName: item.itemName,
        count: item.count,
        totalValue: item.totalValue,
        status,
        talentInfo: talent
          ? {
              name: talent.name,
              category: talent.category,
              slot: talent.slot,
              buff: talent.buff,
              quantity: talent.quantity,
              source: talent.source,
            }
          : null,
        usesSummary,
        recommendation,
      });
    }

    // Sort: Talents first, then Rare Market, then NPC Sell
    return results.sort((a, b) => {
      const order = { talent: 0, market_rare: 1, npc_sell: 2 };
      return order[a.status] - order[b.status];
    });
  }, [parsedData]);

  // Summary buckets
  const talentItemsCount = analyzedItems.filter((i) => i.status === "talent").length;
  const marketItemsCount = analyzedItems.filter((i) => i.status === "market_rare").length;
  const npcSellItemsCount = analyzedItems.filter((i) => i.status === "npc_sell").length;

  return (
    <div className="space-y-8">
      <div>
        <SectionTitle
          icon="🎒"
          title="Analisador de Bag & Loot de Hunt"
          subtitle="Cole o JSON exportado do seu client/autoloot para conferir o que guardar para talentos, o que vender no Market e o que vender no NPC."
        />
      </div>

      {/* ÁREA DE INPUT JSON */}
      <Panel className="space-y-3 border-primary/30 bg-panel/90">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="loot-json" className="text-sm font-bold flex items-center gap-2">
            <UploadCloud className="size-4 text-primary" />
            <span>Cole o .json da sua Hunt / Autoloot:</span>
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleLoadSample}
              className="rounded-md border border-border bg-panel-strong px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
            >
              📄 Carregar Exemplo de Teste
            </button>
            {jsonInput && (
              <button
                onClick={() => {
                  setJsonInput("");
                  setParsedData(null);
                  setErrorMsg(null);
                }}
                className="rounded-md border border-border bg-panel-strong px-2 py-1 text-xs text-muted-foreground hover:text-danger"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        <textarea
          id="loot-json"
          rows={6}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='Cole aqui o JSON gerado pelo seu tracker/autoloot (ex: { "damage": ..., "loot": { "items": [...] }, "summary": ... })'
          className="w-full rounded-lg border border-input bg-background p-3 font-mono text-xs focus:border-primary focus:outline-none"
        />

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => handleAnalyze()}
            disabled={!jsonInput.trim()}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
          >
            🔍 Analisar Loot da Bag
          </button>
          {errorMsg && <span className="text-xs font-semibold text-danger">{errorMsg}</span>}
        </div>
      </Panel>

      {/* RESULTADOS DA ANÁLISE */}
      {parsedData && (
        <div className="space-y-6">
          {/* STATS DA SESSÃO */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="panel p-4 space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="size-3.5" />
                <span>Duração & Personagem:</span>
              </p>
              <p className="font-display text-lg font-bold text-foreground">
                {parsedData.meta?.duration ?? "n/d"}
              </p>
              <p className="text-xs text-primary font-medium">
                {parsedData.meta?.character ? `Personagem: ${parsedData.meta.character}` : "Sessão Concluída"}
              </p>
            </div>

            <div className="panel p-4 space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="size-3.5 text-success" />
                <span>Experiência Total (XP):</span>
              </p>
              <p className="font-display text-lg font-bold text-success">
                {parsedData.summary?.totalExperience?.toLocaleString("pt-BR") ?? 0} XP
              </p>
              <p className="text-xs text-muted-foreground">
                {parsedData.rates?.xpPerHour?.toLocaleString("pt-BR") ?? 0} XP/hora
              </p>
            </div>

            <div className="panel p-4 space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <DollarSign className="size-3.5 text-gold" />
                <span>Balanço / Lucro Líquido:</span>
              </p>
              <p className="font-display text-lg font-bold text-gold">
                {parsedData.summary?.balance?.toLocaleString("pt-BR") ?? 0} Dol
              </p>
              <p className="text-xs text-muted-foreground">
                {parsedData.rates?.balancePerHour?.toLocaleString("pt-BR") ?? 0} Dol/hora
              </p>
            </div>

            <div className="panel p-4 space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Skull className="size-3.5 text-danger" />
                <span>Monstros Derrotados:</span>
              </p>
              <p className="font-display text-lg font-bold text-foreground">
                {parsedData.damage?.totalCreaturesKilled?.toLocaleString("pt-BR") ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">
                {parsedData.damage?.uniqueCreatureTypes ?? 0} espécies diferentes
              </p>
            </div>
          </div>

          {/* MONSTROS DERROTADOS DETALHADOS COM ÍCONES */}
          {parsedData.damage?.creatures?.length > 0 && (
            <Panel className="space-y-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Skull className="size-4 text-primary" />
                <span>Monstros Derrotados na Hunt:</span>
              </h3>
              <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3">
                {parsedData.damage.creatures.map((c: any) => (
                  <div
                    key={c.creatureName}
                    className="flex items-center justify-between rounded-lg border border-border bg-panel-strong p-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <PokemonIcon pokemon={c.creatureName} className="size-8 shrink-0" />
                      <div className="min-w-0">
                        <Link
                          to="/pokemon/$slug"
                          params={{ slug: slugify(c.creatureName) }}
                          className="font-semibold text-xs truncate hover:text-primary block"
                        >
                          {c.creatureName}
                        </Link>
                        <p className="text-[11px] text-muted-foreground">
                          {c.damagePerKill?.toLocaleString("pt-BR") ?? 0} dmg/kill
                        </p>
                      </div>
                    </div>
                    <span className="rounded bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                      {c.kills?.toLocaleString("pt-BR")}x
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* RESUMO DE CLASSIFICAÇÃO */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold">Classificação dos {analyzedItems.length} Itens:</span>
              <Chip tone="gold">🧬 {talentItemsCount} Talentos</Chip>
              <Chip tone="danger">💎 {marketItemsCount} Raros / Market</Chip>
              <Chip tone="success">💰 {npcSellItemsCount} Venda em NPC</Chip>
            </div>

            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-panel px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
            >
              {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
              <span>{copied ? "Copiado!" : "Copiar Resumo da Hunt"}</span>
            </button>
          </div>

          {/* LISTA CLASSIFICADA DOS ITENS */}
          <div className="space-y-3">
            {analyzedItems.map((item, index) => {
              const isTalent = item.status === "talent";
              const isMarket = item.status === "market_rare";

              return (
                <div
                  key={item.itemName + index}
                  className={`panel p-4 transition-all border ${
                    isTalent
                      ? "border-gold/50 bg-gold/5"
                      : isMarket
                      ? "border-primary/50 bg-primary/5"
                      : "border-border bg-panel"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    {/* Lado Esquerdo: Nome & Quantidade */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-foreground capitalize">
                          {item.count}x {item.itemName}
                        </span>

                        {isTalent && (
                          <span className="rounded-md border border-gold/40 bg-gold/15 px-2 py-0.5 text-xs font-bold text-gold flex items-center gap-1">
                            <Sparkles className="size-3" />
                            <span>MATERIAL DE TALENTO</span>
                          </span>
                        )}

                        {isMarket && (
                          <span className="rounded-md border border-primary/40 bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary flex items-center gap-1">
                            <Zap className="size-3" />
                            <span>VENDER NO MARKET / DUNGEONS</span>
                          </span>
                        )}

                        {!isTalent && !isMarket && (
                          <span className="rounded-md border border-success/40 bg-success/15 px-2 py-0.5 text-xs font-bold text-success flex items-center gap-1">
                            <DollarSign className="size-3" />
                            <span>VENDA AO NPC</span>
                          </span>
                        )}
                      </div>

                      {/* Informações de Talento se houver */}
                      {item.talentInfo && (
                        <div className="text-xs text-muted-foreground space-y-0.5 pt-1">
                          <p>
                            🎯 <strong>Talento:</strong> {item.talentInfo.category} ({item.talentInfo.slot}) —{" "}
                            <span className="text-success">{item.talentInfo.buff ?? "Sem buff informado"}</span>
                          </p>
                          <p className="text-[11px]">
                            Necessário para forjar: <strong>{item.talentInfo.quantity ?? "Variável"}x</strong> (Origem: {item.talentInfo.source ?? "Drop"})
                          </p>
                        </div>
                      )}

                      {/* Usos gerais */}
                      {item.usesSummary.length > 0 && !item.talentInfo && (
                        <p className="text-xs text-muted-foreground pt-0.5">
                          Usos: {item.usesSummary.join(" | ")}
                        </p>
                      )}
                    </div>

                    {/* Lado Direito: Recomendação e Valor */}
                    <div className="text-right space-y-1 shrink-0">
                      {item.totalValue > 0 && (
                        <p className="text-xs text-muted-foreground font-mono">
                          Valor Estimado: <strong className="text-foreground">{item.totalValue.toLocaleString("pt-BR")} Dol</strong>
                        </p>
                      )}
                      <Link
                        to="/item/$slug"
                        params={{ slug: slugify(item.itemName) }}
                        className="inline-block text-xs text-primary underline hover:text-primary/80"
                      >
                        Ver quem mais dropa esse item
                      </Link>
                    </div>
                  </div>

                  {/* Banner de Recomendação */}
                  <div
                    className={`mt-3 rounded-lg p-2.5 text-xs flex items-start gap-2 ${
                      isTalent
                        ? "bg-gold/10 text-gold-foreground border border-gold/20"
                        : isMarket
                        ? "bg-primary/10 text-foreground border border-primary/20"
                        : "bg-panel-strong text-muted-foreground border border-border"
                    }`}
                  >
                    {isTalent || isMarket ? (
                      <AlertCircle className="size-4 shrink-0 text-gold mt-0.5" />
                    ) : (
                      <ShieldCheck className="size-4 shrink-0 text-success mt-0.5" />
                    )}
                    <span>
                      <strong>Recomendação:</strong> {item.recommendation}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
