import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SectionTitle, Panel, ExternalLinkChip, Chip, PokemonIcon } from "@/components/pka/ui";
import { slugify } from "@/lib/pka";

export const Route = createFileRoute("/iniciantes")({
  head: () => ({
    meta: [
      { title: "Guia para Iniciantes (Level 1-150) — PKA Helper" },
      {
        name: "description",
        content: "Guia completo de Level Up do 1 ao 150 no PokeAlliance: rotas rápidas, linked tasks, exploração e dicas essenciais.",
      },
      { property: "og:title", content: "Guia para Iniciantes (Level 1-150) — PKA Helper" },
      {
        property: "og:description",
        content: "Guia completo de Level Up do 1 ao 150 no PokeAlliance: rotas rápidas, linked tasks, exploração e dicas essenciais.",
      },
    ],
  }),
  component: BeginnersGuide,
});

type TabType = "all" | "start" | "op1" | "op2" | "op3" | "tips";

function BeginnersGuide() {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  return (
    <div className="space-y-8">
      <div>
        <SectionTitle
          icon="🚀"
          title="Guia de Level Up (1-150)"
          subtitle="Tudo o que você precisa saber desde Pallet Town até o level 150 no PokeAlliance"
        />

        {/* Quick Tabs */}
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeTab === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border bg-panel hover:bg-panel-strong"
            }`}
          >
            📋 Todos os Tópicos
          </button>
          <button
            onClick={() => setActiveTab("start")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeTab === "start"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border bg-panel hover:bg-panel-strong"
            }`}
          >
            🏡 Antes de Iniciar
          </button>
          <button
            onClick={() => setActiveTab("op1")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeTab === "op1"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border bg-panel hover:bg-panel-strong"
            }`}
          >
            🎯 Opção 1: Linked Tasks
          </button>
          <button
            onClick={() => setActiveTab("op2")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeTab === "op2"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border bg-panel hover:bg-panel-strong"
            }`}
          >
            ⚡ Opção 2: Rápida & Eficiente (Rush)
          </button>
          <button
            onClick={() => setActiveTab("op3")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeTab === "op3"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border bg-panel hover:bg-panel-strong"
            }`}
          >
            🗺️ Opção 3: Exploração & Aventura
          </button>
          <button
            onClick={() => setActiveTab("tips")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeTab === "tips"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border bg-panel hover:bg-panel-strong"
            }`}
          >
            💡 Dicas Finais
          </button>
        </div>
      </div>

      {/* SEÇÃO: ANTES DE INICIAR */}
      {(activeTab === "all" || activeTab === "start") && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/70 pb-2">
            <span className="text-xl">🏡</span>
            <h2 className="text-xl font-bold">Antes de Iniciar (Pallet Town)</h2>
          </div>

          <Panel className="border-primary/20 bg-panel/80">
            <div className="space-y-4">
              <div className="rounded-md border border-primary/30 bg-primary/10 p-3 text-sm">
                <span className="font-semibold text-primary">🌍 Dica de Ouro:</span> É altamente recomendado baixar o mapa completo para conseguir se localizar no jogo pelo minimap (<kbd className="rounded bg-background px-1.5 py-0.5 text-xs font-mono">Ctrl + Tab</kbd>).
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span>👴 1. Fale com o Professor Carvalho</span>
                  <Chip tone="gold">Local: Pallet Town</Chip>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Clique com o botão direito nele e digite <code className="rounded bg-panel-strong px-1.5 py-0.5 text-xs font-mono text-primary">pokemon</code>. Escolha seu Pokémon inicial:
                </p>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { name: "Charmander", type: "Fogo", desc: "Excelente dano e foco ofensivo" },
                    { name: "Squirtle", type: "Água", desc: "Resistente e com bom controle" },
                    { name: "Bulbasaur", type: "Planta / Veneno", desc: "Ótimo dano em área e status" },
                  ].map((p) => (
                    <div key={p.name} className="flex items-center gap-3 rounded-lg border border-border bg-panel-strong p-3">
                      <PokemonIcon pokemon={p.name} className="w-10 h-10 shrink-0" />
                      <div>
                        <Link to="/pokemon/$slug" params={{ slug: slugify(p.name) }} className="font-semibold hover:text-primary">
                          {p.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{p.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="font-semibold text-sm">🎁 Itens recebidos ao escolher o inicial:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-gold">●</span>
                    <div>
                      <strong className="text-foreground">Mysterious Egg:</strong> No lvl 25 ele choca, e ao clicar você ganha um <span className="inline-flex items-center gap-1 text-foreground font-medium"><PokemonIcon pokemon="Togepi" className="w-4 h-4 inline" /> Togepi</span>.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold">●</span>
                    <div>
                      <strong className="text-foreground">Moving Ticket:</strong> Use para selecionar qual cidade será seu respawn padrão. Ao utilizar, ele é consumido.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold">●</span>
                    <div>
                      <strong className="text-foreground">Starter Pack:</strong> Diversos itens utilitários para auxiliar na jornada inicial.
                    </div>
                  </li>
                </ul>
              </div>

              <div className="grid gap-3 pt-2 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-panel-strong p-3.5 space-y-2">
                  <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                    <span>🛍️ Starter Box FREE na Store:</span>
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Abra a <strong>Store</strong> no menu superior do cliente, selecione a aba <strong>Character</strong> e resgate a <strong>Starter Box</strong> gratuita.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-panel-strong p-3.5 space-y-2">
                  <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                    <span>🔬 Fale com Dr. Oliveira (Norte do laboratório):</span>
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Clique com o botão direito e digite <code className="rounded bg-background px-1 text-primary">mission</code> e depois <code className="rounded bg-background px-1 text-primary">yes</code>.
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground pt-1">
                    <span>Task de matar 50</span>
                    <span className="inline-flex items-center gap-1 font-medium text-foreground"><PokemonIcon pokemon="Ditto" className="w-4 h-4 inline" /> Dittos</span>
                    <span>(essencial para criar um</span>
                    <span className="inline-flex items-center gap-1 font-medium text-gold"><PokemonIcon pokemon="Shiny Ditto" className="w-4 h-4 inline" /> Shiny Ditto</span>
                    <span>no futuro).</span>
                  </div>
                  <div className="pt-1">
                    <ExternalLinkChip href="https://discord.com/channels/1159230367803392022/1308285144943034398/1459997755568292053" label="Tutorial Shiny Ditto" />
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </section>
      )}

      {/* SEÇÃO: OPÇÃO 1 - LINKED TASKS */}
      {(activeTab === "all" || activeTab === "op1") && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/70 pb-2">
            <span className="text-xl">🎯</span>
            <h2 className="text-xl font-bold">Opção 1 — Linked Tasks (Progresso Guiado)</h2>
          </div>

          <Panel className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Chip tone="gold">Recomendado para iniciantes</Chip>
              <Chip tone="success">Recompensas contínuas</Chip>
            </div>

            <div className="space-y-3 text-sm">
              <div className="rounded-md border border-border bg-panel-strong p-3 space-y-1.5">
                <p className="font-semibold text-foreground">1. Use o Moving Ticket para Saffron City:</p>
                <p className="text-muted-foreground text-xs">
                  Dentro do laboratório em Pallet (área PZ), utilize o seu <strong>Moving Ticket</strong> e escolha a primeira opção (Saffron).
                </p>
              </div>

              <div className="rounded-md border border-border bg-panel-strong p-3 space-y-2">
                <p className="font-semibold text-foreground flex items-center gap-2">
                  <span>2. Abra a interface de Linked Tasks (<kbd className="rounded bg-background px-1.5 py-0.5 text-xs font-mono">Ctrl + L</kbd>):</span>
                </p>
                <p className="text-muted-foreground text-xs">
                  Inicie com a task de <span className="inline-flex items-center gap-1 font-semibold text-foreground"><PokemonIcon pokemon="Rattata" className="w-5 h-5 inline" /> Rattata</span>. Conforme você completa uma, a próxima é liberada automaticamente com recompensas de XP e itens!
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <ExternalLinkChip href="https://imgur.com/a/ZyszZOZ" label="Ver Local da Task de Rattata" />
                  <ExternalLinkChip href="https://docs.google.com/spreadsheets/d/1GCH3PmFKQrBj7AA51hgqfg6Q2SrvNgrNlxgIidVeTMU/edit?pru=AAABnrkR91Y*dw1GJ8ivaBmMhBb0NbLuFw&gid=141737918#gid=141737918" label="Planilha Guia de Linked Tasks" />
                  <Link to="/tasks" className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20">
                    🎯 Consultar Tasks no App
                  </Link>
                </div>
              </div>
            </div>
          </Panel>
        </section>
      )}

      {/* SEÇÃO: OPÇÃO 2 - RÁPIDA E EFICIENTE */}
      {(activeTab === "all" || activeTab === "op2") && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/70 pb-2">
            <span className="text-xl">⚡</span>
            <h2 className="text-xl font-bold">Opção 2 — Rápida e Eficiente (Rota de Rush 1-150)</h2>
          </div>

          <Panel className="space-y-5">
            <div className="rounded-md border border-primary/30 bg-primary/10 p-3 text-xs text-primary font-medium">
              💡 Use o Moving Ticket dentro do laboratório de Pallet para ir até Saffron City antes de começar a rota.
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {/* Nível 1-10 */}
              <div className="rounded-lg border border-border bg-panel-strong p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Chip tone="gold">Nível 1 - 10</Chip>
                  <span className="text-xs text-muted-foreground">Saffron</span>
                </div>
                <h4 className="font-semibold text-sm">Bueiro de Saffron</h4>
                <p className="text-xs text-muted-foreground">
                  Desça no bueiro da cidade e derrote os Pokémon iniciais para subir rapidamente aos primeiros níveis.
                </p>
                <div className="pt-1">
                  <ExternalLinkChip href="https://imgur.com/a/ZyszZOZ" label="Local do Bueiro" />
                </div>
              </div>

              {/* Nível 10-40 */}
              <div className="rounded-lg border border-border bg-panel-strong p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Chip tone="gold">Nível 10 - 40</Chip>
                  <span className="text-xs text-muted-foreground">Cerulean</span>
                </div>
                <h4 className="font-semibold text-sm flex items-center gap-1.5">
                  <span>Hunt de</span>
                  <PokemonIcon pokemon="Diglett" className="w-5 h-5" />
                  <span>Diglett & Usina</span>
                </h4>
                <p className="text-xs text-muted-foreground">
                  Siga para Cerulean derrotando tudo pelo caminho. Vá à direita na hunt de Diglett e capture um. Use o Diglett para caçar na Usina Elétrica ao Sul de Cerulean até o nível 40.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <ExternalLinkChip href="https://imgur.com/a/8dwCyhm" label="Caminho Cerulean" />
                  <ExternalLinkChip href="https://imgur.com/a/8vlhXCv" label="Usina Sul Cerulean" />
                </div>
              </div>

              {/* Nível 40-50 */}
              <div className="rounded-lg border border-border bg-panel-strong p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Chip tone="gold">Nível 40 - 50</Chip>
                  <span className="text-xs text-muted-foreground">Saffron</span>
                </div>
                <h4 className="font-semibold text-sm flex items-center gap-1.5">
                  <span>Usina de</span>
                  <PokemonIcon pokemon="Pikachu" className="w-5 h-5" />
                  <span>Pikachu</span>
                </h4>
                <p className="text-xs text-muted-foreground">
                  Upe na Usina de Pikachu localizada à direita de Saffron. No nível 50, use uma <strong>Earth Stone</strong> no seu Diglett para evoluí-lo para <span className="inline-flex items-center gap-1 text-foreground font-medium"><PokemonIcon pokemon="Dugtrio" className="w-4 h-4 inline" /> Dugtrio</span>!
                </p>
                <div className="pt-1">
                  <ExternalLinkChip href="https://imgur.com/a/eMjPulX" label="Usina Pikachu Saffron" />
                </div>
              </div>

              {/* Nível 50-80 */}
              <div className="rounded-lg border border-border bg-panel-strong p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Chip tone="gold">Nível 50 - 80</Chip>
                  <span className="text-xs text-muted-foreground">Usina Elétrica</span>
                </div>
                <h4 className="font-semibold text-sm">Andares Superiores da Usina</h4>
                <p className="text-xs text-muted-foreground">
                  Com seu Dugtrio, escolha um dos andares da Usina Elétrica:
                </p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li className="flex items-center gap-1.5">
                    <PokemonIcon pokemon="Raichu" className="w-4 h-4" />
                    <strong>2º Andar:</strong> Raichu
                  </li>
                  <li className="flex items-center gap-1.5">
                    <PokemonIcon pokemon="Jolteon" className="w-4 h-4" />
                    <strong>3º Andar:</strong> Jolteon
                  </li>
                </ul>
                <div className="pt-1">
                  <ExternalLinkChip href="https://imgur.com/a/tVt9b2v" label="Andares da Usina" />
                </div>
              </div>

              {/* Nível 80-100 */}
              <div className="rounded-lg border border-border bg-panel-strong p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Chip tone="gold">Nível 80 - 100</Chip>
                  <span className="text-xs text-muted-foreground">Subsolo Usina</span>
                </div>
                <h4 className="font-semibold text-sm flex items-center gap-1.5">
                  <span>Hunt de</span>
                  <PokemonIcon pokemon="Electabuzz" className="w-5 h-5" />
                  <span>Electabuzz</span>
                </h4>
                <p className="text-xs text-muted-foreground">
                  Desça no subsolo da Usina Elétrica e cace Electabuzz para ganhar grandes quantidades de XP por hora.
                </p>
                <div className="pt-1">
                  <ExternalLinkChip href="https://imgur.com/a/lx2xnEu" label="Subsolo Electabuzz" />
                </div>
              </div>

              {/* Nível 100-150 */}
              <div className="rounded-lg border border-border bg-panel-strong p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Chip tone="gold">Nível 100 - 150</Chip>
                  <span className="text-xs text-muted-foreground">Final Rush</span>
                </div>
                <h4 className="font-semibold text-sm flex items-center gap-1.5">
                  <PokemonIcon pokemon="Steelix" className="w-5 h-5" />
                  <span>Dugtrio ou Steelix</span>
                </h4>
                <p className="text-xs text-muted-foreground">
                  Continue caçando Electabuzz com seu Dugtrio até o 150, ou faça a evolução de Steelix para caçar ainda mais rápido!
                </p>
              </div>
            </div>

            {/* Destaque: Evolução Steelix */}
            <div className="rounded-lg border border-gold/40 bg-gold/5 p-4 space-y-2">
              <h4 className="font-semibold text-sm text-gold flex items-center gap-2">
                <PokemonIcon pokemon="Steelix" className="w-6 h-6" />
                <span>Como obter e evoluir o Steelix com Metal Coat (Opcional):</span>
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Capture um <span className="text-foreground font-semibold inline-flex items-center gap-1"><PokemonIcon pokemon="Onix" className="w-4 h-4 inline" /> Onix</span> e equipe nele um <strong>Metal Coat</strong>. 
                Para evoluir, basta caçar monstros com ele equipado: a cada criatura derrotada, há uma chance do Onix evoluir automaticamente para <span className="text-foreground font-semibold inline-flex items-center gap-1"><PokemonIcon pokemon="Steelix" className="w-4 h-4 inline" /> Steelix</span>.
              </p>
              <div className="rounded bg-panel p-2.5 text-xs text-muted-foreground border border-border">
                ⚠️ <strong>Verificação:</strong> Dê o comando <code className="text-primary font-mono">'look'</code> no seu Onix. Precisa aparecer a mensagem <span className="text-foreground font-semibold">"holding Metal Coat"</span>. Se estiver aparecendo, tudo certo para caçar!
              </div>
            </div>
          </Panel>
        </section>
      )}

      {/* SEÇÃO: OPÇÃO 3 - EXPLORAÇÃO E AVENTURA */}
      {(activeTab === "all" || activeTab === "op3") && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/70 pb-2">
            <span className="text-xl">🗺️</span>
            <h2 className="text-xl font-bold">Opção 3 — Exploração e Aventura (Imersivo)</h2>
          </div>

          <Panel className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ideal para jogadores que preferem desfrutar da jornada, conhecer o mapa, realizar quests e explorar o mundo sem focar puramente em rush.
            </p>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-panel-strong p-3.5 space-y-2">
                <h4 className="font-semibold text-sm">🚶 Rota de Pallet → Viridian → Pewter → Cerulean:</h4>
                <ul className="text-xs space-y-1.5 text-muted-foreground list-disc list-inside">
                  <li>Saia pela esquerda do laboratório e siga para o norte derrotando criaturas e explorando florestas.</li>
                  <li>Caminhe para Viridian e siga direto para Pewter (cure no Centro Pokémon).</li>
                  <li>Vá para a direita enfrentando Pokémon mais fortes e descobrindo segredos até Cerulean.</li>
                  <li>Em Cerulean, você pode seguir para a Usina ou caçar livremente em hunts da região.</li>
                </ul>
              </div>

              <div className="rounded-lg border border-border bg-panel-strong p-3.5 space-y-2">
                <h4 className="font-semibold text-sm">📅 Daily Missions (Kill & Catch) e Recompensas:</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between border-b border-border/50 py-1">
                    <span className="text-muted-foreground">🟢 Easy:</span>
                    <span className="font-semibold text-foreground">10k XP + Arcane Shard</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 py-1">
                    <span className="text-muted-foreground">🟡 Medium:</span>
                    <span className="font-semibold text-foreground">50k XP + Arcane Shard + 3 Pontos</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 py-1">
                    <span className="text-muted-foreground">🔴 Hard:</span>
                    <span className="font-semibold text-foreground">200k XP + Arcane Shard + 3 Pontos</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground pt-1">
                  💎 <strong>Arcane Shard:</strong> Item essencial para acessar as dungeons espalhadas pelo mapa!
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <ExternalLinkChip href="https://imgur.com/a/XiAgCx1" label="Daily Kill / Catch" />
                  <ExternalLinkChip href="https://discord.com/channels/1159230367803392022/1159230368940032096" label="Mapa das Dungeons" />
                  <ExternalLinkChip href="https://docs.google.com/spreadsheets/d/1GCH3PmFKQrBj7AA51hgqfg6Q2SrvNgrNlxgIidVeTMU/edit?pli=1&gid=1684775291#gid=1684775291" label="Recompensas das Dungeons" />
                </div>
              </div>
            </div>
          </Panel>
        </section>
      )}

      {/* SEÇÃO: DICAS FINAIS */}
      {(activeTab === "all" || activeTab === "tips") && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/70 pb-2">
            <span className="text-xl">💡</span>
            <h2 className="text-xl font-bold">Dicas Finais Importantes</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Panel className="space-y-2">
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                <span>⚡ Buffs são essenciais</span>
              </h4>
              <p className="text-xs text-muted-foreground">
                Consulte medalhas, talentos e elixires para aumentar seu dano e velocidade de caça.
              </p>
            </Panel>

            <Panel className="space-y-2">
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                <span>📺 Twitch Drops & Pontos</span>
              </h4>
              <p className="text-xs text-muted-foreground">
                Vincule sua conta da Twitch no site oficial do PKA e assista às lives para resgatar recompensas valiosas.
              </p>
            </Panel>

            <Panel className="space-y-2">
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                <span>🎒 Economize Recursos</span>
              </h4>
              <p className="text-xs text-muted-foreground">
                Evite gastar potions, revives e supplies à toa nos níveis baixos para guardar para o mid/late game.
              </p>
            </Panel>

            <Panel className="space-y-2">
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                <span>💬 Game Chat & Fuga</span>
              </h4>
              <p className="text-xs text-muted-foreground">
                Tire dúvidas com jogadores pelo chat do jogo e sempre mantenha um caminho de fuga em hunts perigosas.
              </p>
            </Panel>
          </div>
        </section>
      )}
    </div>
  );
}
