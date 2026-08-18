import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Search, Star, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { GlobalSearch } from "@/components/pka/GlobalSearch";
import { DB_UPDATED_AT } from "@/lib/pka";

import { PkaLogo } from "@/components/pka/ui";

export const NAV = [
  { to: "/brokes-maximas", label: "Brokes Maximas", icon: "📊" },
  { to: "/iniciantes", label: "Iniciantes (1-150)", icon: "🚀" },
  { to: "/times-hoenn", label: "Times Hoenn", icon: "🌋" },
  { to: "/estrategia", label: "Estratégia & Up", icon: "🧬" },
  { to: "/onde-cacar", label: "Onde Caçar?", icon: "🗺️" },
  { to: "/analisador-loot", label: "Analisador de Loot", icon: "💰" },
  { to: "/assistente", label: "Assistente", icon: "🤖" },
  { to: "/pokedex", label: "Pokédex", icon: "🔎" },
  { to: "/drops", label: "Drops", icon: "🎒" },
  { to: "/itens", label: "Itens", icon: "💎" },
  { to: "/localizacoes", label: "Localizações", icon: "📍" },
  { to: "/tasks", label: "Tasks", icon: "🎯" },
  { to: "/dungeons", label: "Dungeons", icon: "⚔️" },
  { to: "/talentos", label: "Talentos", icon: "🧬" },
  { to: "/medalhas", label: "Medalhas", icon: "🏅" },
  { to: "/star", label: "Star", icon: "⭐" },
  { to: "/boost", label: "Boost", icon: "⚡" },
  { to: "/tier-list", label: "Tier List", icon: "📊" },
  { to: "/npcs", label: "NPCs e Ginásios", icon: "🥊" },
  { to: "/sistemas", label: "Sistemas", icon: "🧩" },
  { to: "/guias", label: "Guias", icon: "📚" },
  { to: "/favoritos", label: "Favoritos", icon: "💛" },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/15 text-primary shadow-[inset_2px_0_0_0_var(--primary)]"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
            )}
          >
            <span aria-hidden className="text-base">
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3 group">
      <PkaLogo size="md" className="shrink-0" />
      <div className="min-w-0">
        <p className="font-display text-lg font-bold tracking-wide leading-tight group-hover:text-primary transition-colors">
          PKA <span className="text-gradient-gold">Helper</span>
        </p>
        <p className="text-[11px] text-muted-foreground truncate">Site de Apoio PokeAlliance</p>
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
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-background/85 px-3 py-3 backdrop-blur sm:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-panel lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-4 flex flex-col justify-between overflow-y-auto">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="space-y-6">
                <Brand />
                <NavList onNavigate={() => setOpen(false)} />
              </div>
              <div className="pt-4 mt-4 border-t border-border/40">
                <SidebarCredits />
              </div>
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <GlobalSearch placeholder="Buscar Pokémon, itens, dungeons, tasks..." />
          </div>

          <Link
            to="/favoritos"
            aria-label="Meus favoritos"
            className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-panel text-muted-foreground hover:text-gold"
          >
            <Star className="size-4" />
          </Link>
          <Link
            to="/assistente"
            className="hidden items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:inline-flex"
          >
            🤖 Assistente
          </Link>
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
