import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Search, Star, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { GlobalSearch } from "@/components/pka/GlobalSearch";
import { DB_UPDATED_AT } from "@/lib/pka";

import { PkaLogo } from "@/components/pka/ui";

export const NAV_GROUPS = [
  {
    title: "DESTAQUES",
    items: [
      { to: "/rota-titan", label: "🔥 Rota Server Titan", icon: "⚔️" },
      { to: "/iniciantes", label: "Guia 1-150", icon: "🚀" },
      { to: "/times-hoenn", label: "Times Hoenn", icon: "🌋" },
      { to: "/onde-cacar", label: "Onde Caçar? (2.0x)", icon: "🗺️" },
      { to: "/analisador-loot", label: "Analisador de Loot", icon: "💰" },
      { to: "/assistente", label: "Assistente IA", icon: "🤖" },
    ],
  },
  {
    title: "SISTEMAS",
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
    title: "BANCO DE DADOS",
    items: [
      { to: "/pokedex", label: "Pokédex", icon: "🔎" },
      { to: "/drops", label: "Drops", icon: "🎒" },
      { to: "/itens", label: "Itens", icon: "💎" },
      { to: "/localizacoes", label: "Localizações", icon: "📍" },
      { to: "/tier-list", label: "Tier List", icon: "📈" },
      { to: "/npcs", label: "NPCs & Ginásios", icon: "🥊" },
    ],
  },
  {
    title: "GUIAS & RECURSOS",
    items: [
      { to: "/estrategia", label: "Estratégia & Up", icon: "🧬" },
      { to: "/guias", label: "Guias Gerais", icon: "📚" },
      { to: "/favoritos", label: "Favoritos", icon: "💛" },
    ],
  },
] as const;

export const NAV = NAV_GROUPS.flatMap((g) => g.items);

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-4">
      {NAV_GROUPS.map((group) => (
        <div key={group.title} className="space-y-1">
          <p className="px-2.5 text-[10px] font-bold tracking-wider text-muted-foreground/70 uppercase">
            {group.title}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all",
                    active
                      ? "bg-primary/15 text-primary shadow-[inset_2px_0_0_0_var(--primary)] font-semibold"
                      : "text-muted-foreground/90 hover:bg-sidebar-accent hover:text-foreground",
                  )}
                >
                  <span aria-hidden className="text-sm shrink-0">
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3 group px-1">
      <PkaLogo size="md" className="shrink-0" />
      <div className="min-w-0">
        <p className="font-display text-lg font-bold tracking-wide leading-tight group-hover:text-primary transition-colors">
          PKA <span className="text-gradient-gold">Helper</span>
        </p>
        <p className="text-[10px] text-muted-foreground truncate font-medium">Wiki & Guia Completo</p>
      </div>
    </Link>
  );
}

function SidebarCredits() {
  return (
    <div className="rounded-xl border border-primary/25 bg-primary/5 p-3 text-xs shadow-inner backdrop-blur-sm space-y-2">
      <div className="flex items-center gap-1.5 font-semibold text-primary">
        <Sparkles className="size-3.5 text-gold animate-pulse" />
        <span className="text-[11px] font-display font-bold tracking-wider uppercase">Créditos</span>
      </div>

      <div className="space-y-1.5">
        <div className="rounded-lg border border-border/70 bg-panel/70 px-2.5 py-1.5">
          <span className="text-muted-foreground block text-[10px]">Fonte das informações:</span>
          <span className="font-bold text-xs text-gradient-gold">VitorMonticelli <span className="text-muted-foreground font-normal">&</span> WikiPKA</span>
        </div>

        <div className="rounded-lg border border-border/70 bg-panel/70 px-2.5 py-1.5">
          <span className="text-muted-foreground block text-[10px]">Autor da ferramenta:</span>
          <a
            href="https://wa.me/5519993149294"
            target="_blank"
            rel="noopener noreferrer"
            title="Conversar com Felikzz no WhatsApp"
            className="font-bold text-xs text-primary hover:underline hover:text-primary/80 transition-colors inline-flex items-center gap-1"
          >
            Felikzz
          </a>
        </div>
      </div>

      <div className="border-t border-border/40 pt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Base atualizada:</span>
        <span className="font-mono font-medium text-foreground/80">{DB_UPDATED_AT}</span>
      </div>
    </div>
  );
}

function AppFooter() {
  return (
    <footer className="border-t border-border/60 bg-sidebar/60 py-8 px-4 sm:px-8 text-muted-foreground">
      <div className="mx-auto max-w-6xl flex flex-col items-center justify-between gap-6 md:flex-row md:text-left">
        {/* Identidade */}
        <div className="flex items-center gap-3">
          <PkaLogo size="sm" className="shrink-0" />
          <div>
            <p className="font-display text-base font-bold text-foreground">
              PKA <span className="text-gradient-gold">Helper</span>
            </p>
            <p className="text-xs text-muted-foreground">Site de Apoio da Comunidade PokeAlliance</p>
          </div>
        </div>

        {/* Caixa de Créditos em Destaque */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 rounded-xl border border-primary/25 bg-panel/80 px-5 py-2.5 shadow-md">
          <div className="flex items-center gap-2 text-left">
            <span className="text-sm">📖</span>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Fonte das informações</p>
              <p className="text-xs font-bold text-gradient-gold">
                VitorMonticelli <span className="text-foreground/70 font-normal">e</span> WikiPKA
              </p>
            </div>
          </div>

          <div className="hidden sm:block h-7 w-px bg-border" />

          <div className="flex items-center gap-2 text-left">
            <span className="text-sm">💻</span>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Autor da ferramenta</p>
              <a
                href="https://wa.me/5519993149294"
                target="_blank"
                rel="noopener noreferrer"
                title="Conversar com Felikzz no WhatsApp"
                className="text-xs font-bold text-primary hover:underline hover:text-primary/80 transition-colors inline-block"
              >
                Felikzz
              </a>
            </div>
          </div>
        </div>

        {/* Info da Base */}
        <div className="text-center md:text-right text-[11px] text-muted-foreground">
          <p>
            Base de dados: <span className="font-mono text-foreground/80">{DB_UPDATED_AT}</span>
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground/70">
            Dedicado à comunidade do PokeAlliance
          </p>
        </div>
      </div>
    </footer>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen lg:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-4 border-r border-sidebar-border bg-sidebar p-4 lg:flex">
        <Brand />
        <div className="flex-1 overflow-y-auto pr-1">
          <NavList />
        </div>
        <SidebarCredits />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border/80 bg-background/90 px-3 py-2.5 backdrop-blur-md sm:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-panel lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-4 flex flex-col justify-between overflow-y-auto">
              <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
              <div className="space-y-6">
                <Brand />
                <NavList onNavigate={() => setOpen(false)} />
              </div>
              <div className="pt-4 mt-4 border-t border-border/40">
                <SidebarCredits />
              </div>
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1 max-w-2xl">
            <GlobalSearch placeholder="Pesquise por Pokémon, itens, dungeons, tasks... (Ctrl + K)" />
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            <a
              href="https://wa.me/5519993149294"
              target="_blank"
              rel="noopener noreferrer"
              title="Falar no WhatsApp com Felikzz"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-panel text-muted-foreground hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
            >
              <span className="text-base leading-none">💬</span>
            </a>
            <Link
              to="/favoritos"
              aria-label="Meus favoritos"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-panel text-muted-foreground hover:text-gold hover:border-gold/40 transition-colors"
            >
              <Star className="size-4" />
            </Link>
            <Link
              to="/assistente"
              className="hidden items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 sm:inline-flex shadow-sm shadow-primary/25 transition-all"
            >
              <span>🤖</span>
              <span>Assistente IA</span>
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-6 pb-24 sm:px-6 lg:pb-12">{children}</main>

        <AppFooter />

        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-sidebar/95 backdrop-blur lg:hidden">
          {[
            { to: "/", label: "Home", icon: "🏠" },
            { to: "/pokedex", label: "Pokédex", icon: "🔎" },
            { to: "/assistente", label: "IA", icon: "🤖" },
            { to: "/drops", label: "Drops", icon: "🎒" },
            { to: "/guias", label: "Guias", icon: "📚" },
          ].map((i) => (
            <Link
              key={i.to}
              to={i.to}
              className="flex flex-col items-center gap-0.5 py-2 text-[11px] text-muted-foreground [&.active]:text-primary"
              activeOptions={{ exact: i.to === "/" }}
            >
              <span aria-hidden className="text-base">
                {i.icon}
              </span>
              {i.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

export { Search };
