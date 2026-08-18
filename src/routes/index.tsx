import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { GlobalSearch } from "@/components/pka/GlobalSearch";
import { PkaLogo } from "@/components/pka/ui";
import { useHistory } from "@/lib/storage";
import { BROKES_MAX } from "@/lib/brokes";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PKA Helper Wiki — Guia Completo & Banco de Dados do PokeAlliance" },
      {
        name: "description",
        content:
          "Wiki completa do PokeAlliance: Pokédex, drops, localizações, tasks, dungeons, talentos, Star e assistente inteligente.",
      },
      { property: "og:title", content: "PKA Helper Wiki — Guia Completo do PokeAlliance" },
      {
        property: "og:description",
        content: "Pokédex, drops, localizações, tasks, dungeons, talentos, Star e assistente inteligente do PokeAlliance.",
      },
    ],
  }),
  component: Home,
});

const HIGHLIGHTS = [
  {
    icon: "🚀",
    title: "Guia 1-150",
    desc: "Rotas de up e tasks rápidas",
    to: "/iniciantes",
    tag: "Level Up",
  },
  {
    icon: "🌋",
    title: "Times Hoenn",
    desc: "Composições por elemento",
    to: "/times-hoenn",
    tag: "Metagame",
  },
  {
    icon: "🗺️",
    title: "Onde Caçar?",
    desc: "Hunts com 2.0x de dano",
    to: "/onde-cacar",
    tag: "Efetividade",
  },
  {
    icon: "💰",
    title: "Analisador Loot",
    desc: "O que guardar para talentos",
    to: "/analisador-loot",
    tag: "Utilitário",
  },
] as const;

const CATEGORIES = [
  {
    title: "Sistemas",
    icon: "⚙️",
    count: 8,
    items: [
      { to: "/brokes-maximas", label: "Brokes Máximas", icon: "📊" },
      { to: "/star", label: "Star Ascension", icon: "⭐" },
      { to: "/boost", label: "Boost Recipes", icon: "⚡" },
      { to: "/talentos", label: "Talentos", icon: "🧬" },
      { to: "/medalhas", label: "Medalhas", icon: "🏅" },
      { to: "/dungeons", label: "Dungeons", icon: "⚔️" },
      { to: "/tasks", label: "Tasks", icon: "🎯" },
      { to: "/sistemas", label: "Sistemas Gerais", icon: "🧩" },
    ],
  },
  {
    title: "Banco de Dados",
    icon: "💎",
    count: 6,
    items: [
      { to: "/pokedex", label: "Pokédex", icon: "🔎" },
      { to: "/drops", label: "Consultar Drops", icon: "🎒" },
      { to: "/itens", label: "Quem dropa o Item?", icon: "💎" },
      { to: "/localizacoes", label: "Localizações / Spawns", icon: "📍" },
      { to: "/tier-list", label: "Tier List", icon: "📈" },
      { to: "/npcs", label: "NPCs & Ginásios", icon: "🥊" },
    ],
  },
  {
    title: "Guias & Estratégias",
    icon: "🗺️",
    count: 4,
    items: [
      { to: "/iniciantes", label: "Guia 1 ao 150", icon: "🚀" },
      { to: "/times-hoenn", label: "Times de Hoenn", icon: "🌋" },
      { to: "/onde-cacar", label: "Onde Caçar? (2.0x)", icon: "🗺️" },
      { to: "/estrategia", label: "Estratégia de Up", icon: "🧬" },
    ],
  },
  {
    title: "Utilitários & Suporte",
    icon: "🛠️",
    count: 4,
    items: [
      { to: "/analisador-loot", label: "Analisador de Bag", icon: "💰" },
      { to: "/assistente", label: "Assistente IA", icon: "🤖" },
      { to: "/favoritos", label: "Meus Favoritos", icon: "💛" },
      { to: "/guias", label: "Guias Gerais", icon: "📚" },
    ],
  },
] as const;

function Home() {
  const { history } = useHistory();

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Header no estilo RubinOT */}
      <section className="rounded-xl border border-border/80 bg-gradient-to-r from-card via-panel to-card p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <PkaLogo size="md" className="shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl sm:text-2xl font-bold tracking-wide text-foreground">
                  Bem-vindo ao <span className="text-gradient-gold">PKA Helper Wiki</span>!
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Encontre informações completas sobre Pokémon, sistemas, drops, dungeons, talentos e mecânicas do servidor.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <Link
              to="/pokedex"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary/15 border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/25 transition-all"
            >
              <span>🔎</span>
              <span>Abrir Pokédex</span>
            </Link>
            <Link
              to="/assistente"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gold/15 border border-gold/30 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/25 transition-all"
            >
              <span>🤖</span>
              <span>Perguntar à IA</span>
            </Link>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50">
          <GlobalSearch size="lg" placeholder="Pesquise por páginas, Pokémon, itens, dungeons, tasks... (Ctrl + K)" />
        </div>
      </section>

      {/* Destaques (4 Horizontal Cards como no RubinOT) */}
      <section className="space-y-2.5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 px-1">
          DESTAQUES
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {HIGHLIGHTS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex items-center justify-between rounded-xl border border-border/80 bg-panel px-4 py-3.5 shadow-sm transition-all hover:border-primary/50 hover:bg-panel-strong hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl shrink-0 transition-transform group-hover:scale-110">
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {item.desc}
                  </p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 ml-2" />
            </Link>
          ))}
        </div>
      </section>

      {/* Grid Principal: Categorias (2 cols) + Tabela de Tiers/Status à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Lado Esquerdo / Central: Cards de Categorias (8 colunas no LG) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.title}
                className="rounded-xl border border-border/80 bg-panel p-4 shadow-sm space-y-3"
              >
                {/* Header do Card com Título e Badge de contagem */}
                <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{cat.icon}</span>
                    <h2 className="font-display text-sm font-bold text-foreground">
                      {cat.title}
                    </h2>
                  </div>
                  <span className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground border border-border/50">
                    {cat.count}
                  </span>
                </div>

                {/* Grid interno de links em 2 colunas com ícones */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  {cat.items.map((sub) => (
                    <Link
                      key={sub.to}
                      to={sub.to}
                      className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-panel-strong transition-colors"
                    >
                      <span className="text-sm shrink-0">{sub.icon}</span>
                      <span className="truncate group-hover:text-primary transition-colors font-medium">
                        {sub.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Histórico Recente se houver */}
          {history.length > 0 && (
            <div className="rounded-xl border border-border/80 bg-panel/70 p-3.5 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Pesquisas Recentes
              </p>
              <div className="flex flex-wrap gap-1.5">
                {history.map((h) => (
                  <Link
                    key={h.to + h.query}
                    to={h.to}
                    className="rounded-lg border border-border/70 bg-background/80 px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-all"
                  >
                    {h.query}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Lado Direito: Tabela de Resumo / Brokes & Tiers PKA (4 colunas no LG) */}
        <div className="lg:col-span-4 rounded-xl border border-border/80 bg-panel p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-base">📊</span>
              <h2 className="font-display text-sm font-bold text-foreground">
                Tiers & Brokes Máximas
              </h2>
            </div>
            <Link
              to="/brokes-maximas"
              className="text-[11px] font-semibold text-primary hover:underline"
            >
              Ver tudo
            </Link>
          </div>

          {/* Tabela estilizada como no RubinOT */}
          <div className="overflow-hidden rounded-lg border border-border/50 bg-background/60">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-panel-strong/60 text-[10px] uppercase font-bold text-muted-foreground">
                  <th className="py-2 px-3">Tier</th>
                  <th className="py-2 px-2 text-center">Shiny Rate</th>
                  <th className="py-2 px-3 text-right">Broke Máx</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                {[
                  { tier: "Legendary", rate: "1/1.000", max: "22.535", color: "text-amber-400" },
                  { tier: "Ultra Rare", rate: "1/500", max: "9.400", color: "text-purple-400" },
                  { tier: "Super Rare", rate: "1/250", max: "3.500", color: "text-blue-400" },
                  { tier: "T1", rate: "1/150", max: "1.280", color: "text-emerald-400" },
                  { tier: "T2", rate: "1/100", max: "~900", color: "text-foreground" },
                  { tier: "T3", rate: "1/80", max: "~700", color: "text-foreground" },
                  { tier: "T4", rate: "1/50", max: "~600", color: "text-foreground" },
                  { tier: "T5", rate: "1/30", max: "~400", color: "text-foreground" },
                  { tier: "T6", rate: "1/20", max: "~200", color: "text-foreground" },
                ].map((row) => (
                  <tr key={row.tier} className="hover:bg-panel-strong/50 transition-colors">
                    <td className={`py-1.5 px-3 font-semibold ${row.color}`}>
                      {row.tier}
                    </td>
                    <td className="py-1.5 px-2 text-center text-muted-foreground font-mono text-[11px]">
                      {row.rate}
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono font-bold text-foreground">
                      {row.max}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Comando no jogo:</span>
            <code className="rounded bg-background/80 px-1.5 py-0.5 font-mono text-primary font-bold">
              !pokeball "nome
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
