import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Search, Star } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { GlobalSearch } from "@/components/pka/GlobalSearch";
import { DB_UPDATED_AT } from "@/lib/pka";

import { PkaLogo } from "@/components/pka/ui";

export const NAV = [
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

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen lg:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 border-r border-sidebar-border bg-sidebar p-4 lg:flex">
        <Brand />
        <div className="flex-1 overflow-y-auto">
          <NavList />
        </div>
        <p className="text-[11px] text-muted-foreground">Base atualizada em: {DB_UPDATED_AT}</p>
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
            <SheetContent side="left" className="w-72 bg-sidebar p-4">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="mb-6">
                <Brand />
              </div>
              <NavList onNavigate={() => setOpen(false)} />
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

        <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-6 pb-24 sm:px-6 lg:pb-10">{children}</main>

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
