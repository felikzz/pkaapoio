import { createFileRoute, Link } from "@tanstack/react-router";
import { GlobalSearch } from "@/components/pka/GlobalSearch";
import { PkaLogo } from "@/components/pka/ui";
import { useHistory } from "@/lib/storage";
import { db, pokemonList, itemList, DB_UPDATED_AT } from "@/lib/pka";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PKA Helper — Central de informações do PokeAlliance" },
      {
        name: "description",
        content:
          "Pokédex, drops, localizações, tasks, dungeons, talentos, Star e assistente inteligente do PokeAlliance em um só lugar.",
      },
      { property: "og:title", content: "PKA Helper — Central de informações do PokeAlliance" },
      {
        property: "og:description",
        content: "Pokédex, drops, localizações, tasks, dungeons, talentos, Star e assistente inteligente do PokeAlliance em um só lugar.",
      },
    ],
  }),
  component: Home,
});

const SHORTCUTS = [
  { icon: "🚀", title: "Guia de Level Up (1-150)", desc: "Rotas rápidas, linked tasks e dicas essenciais.", to: "/iniciantes" },
  { icon: "🌋", title: "Times Iniciais de Hoenn", desc: "Composições e rotações por elemento (por Shaolin & Lucyaya).", to: "/times-hoenn" },
  { icon: "🧬", title: "Estratégia de Talentos & Up", desc: "Escolha seu elemento e monte sua rota com counters.", to: "/estrategia" },
  { icon: "🗺️", title: "Onde Caçar? (2.0x Dano)", desc: "Descubra hunts onde seus Pokémon causam dano dobrado.", to: "/onde-cacar" },
  { icon: "💰", title: "Analisador de Bag & Loot", desc: "Cole o JSON da hunt e descubra o que guardar para talentos.", to: "/analisador-loot" },
  { icon: "🔎", title: "Encontrar Pokémon", desc: "Onde encontrar determinado Pokémon.", to: "/localizacoes" },
  { icon: "🎒", title: "Consultar Drops", desc: "Veja tudo que determinado Pokémon pode dropar.", to: "/drops" },
  { icon: "💎", title: "Quem dropa este item?", desc: "Pesquise um item e descubra quem dropa.", to: "/itens" },
  { icon: "🎯", title: "Encontrar Task", desc: "Pesquise Pokémon, NPC ou task.", to: "/tasks" },
  { icon: "⚔️", title: "Dungeons", desc: "Informações, mobs, itens e requisitos.", to: "/dungeons" },
  { icon: "⭐", title: "Calculadora de Star", desc: "Calcule custos de evolução.", to: "/star" },
  { icon: "🤖", title: "Perguntar ao Assistente", desc: "Faça uma pergunta em linguagem natural.", to: "/assistente" },
] as const;

function Home() {
  const { history } = useHistory();

  const stats = [
    { label: "Pokémon", value: pokemonList.length },
    { label: "Itens", value: itemList.length },
    { label: "Drops", value: db.drops.length },
    { label: "Tasks", value: db.tasks.length },
    { label: "Dungeons", value: db.dungeons.length },
    { label: "Talentos", value: db.talents.length },
  ];

  return (
    <div className="space-y-10">
      <section className="hero-surface panel relative overflow-hidden p-6 sm:p-10 border-primary/30">
        <div className="flex flex-col-reverse items-center justify-between gap-8 lg:flex-row">
          {/* Lado Esquerdo: Textos & Busca */}
          <div className="max-w-2xl flex-1 space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
              <span>✨</span>
              <span>Site Oficial de Apoio da Comunidade</span>
            </div>

            <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Tudo sobre o <span className="text-gradient-gold">PKA</span> em um só lugar.
            </h1>

            <p className="text-sm text-muted-foreground sm:text-base">
              Pesquise Pokémon, drops, localizações, tasks, dungeons, talentos e guias de caça super efetiva.
            </p>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <div className="flex-1">
                <GlobalSearch size="lg" placeholder="O que você quer descobrir no PKA?" />
              </div>
              <Link
                to="/pokedex"
                className="inline-flex h-14 items-center justify-center rounded-lg bg-primary px-6 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 shadow-md shadow-primary/20"
              >
                🔎 Pokédex
              </Link>
            </div>
          </div>

          {/* Lado Direito: Logo Oficial com Aura Azul Giratória */}
          <div className="flex shrink-0 items-center justify-center py-4 lg:py-0">
            <PkaLogo size="hero" />
          </div>
        </div>

        {/* Barra de Estatísticas */}
        <div className="mt-10 grid grid-cols-3 gap-3 border-t border-border/60 pt-6 sm:grid-cols-6">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-panel/70 p-3 text-center transition-transform hover:scale-105">
              <p className="font-display text-xl font-bold text-primary">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">Atalhos rápidos</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SHORTCUTS.map((s) => (
            <Link
              key={s.to + s.title}
              to={s.to}
              className="panel group p-4 transition-colors hover:border-primary/50 hover:bg-panel-strong"
            >
              <p className="font-display text-lg font-semibold group-hover:text-primary">
                <span aria-hidden className="mr-2">
                  {s.icon}
                </span>
                {s.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {history.length > 0 ? (
        <section>
          <h2 className="mb-4 text-xl font-bold">Pesquisas recentes</h2>
          <div className="flex flex-wrap gap-2">
            {history.map((h) => (
              <Link
                key={h.to + h.query}
                to={h.to}
                className="rounded-md border border-border bg-panel px-3 py-1.5 text-sm capitalize text-muted-foreground hover:border-primary/50 hover:text-foreground"
              >
                {h.query}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <p className="text-xs text-muted-foreground">Base atualizada em: {DB_UPDATED_AT}</p>
    </div>
  );
}
