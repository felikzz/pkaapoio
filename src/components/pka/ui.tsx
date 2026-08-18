import { Link } from "@tanstack/react-router";
import { Star, ExternalLink, SearchX } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavorites, type Favorite } from "@/lib/storage";
import { slugify, type PokemonEntry } from "@/lib/pka";

export function PkaLogo({
  className,
  size = "md",
  withAura = true,
}: {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  withAura?: boolean;
}) {
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-11 h-11",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
    hero: "w-44 h-44 sm:w-56 sm:h-56",
  };

  const auraSizeMap = {
    sm: "inset-[-6px]",
    md: "inset-[-10px]",
    lg: "inset-[-16px]",
    xl: "inset-[-24px]",
    hero: "inset-[-36px]",
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center select-none group", sizeMap[size], className)}>
      {withAura && (
        <>
          {/* Radial Blue Glow Pulsing */}
          <div
            className={cn(
              "absolute rounded-full bg-gradient-to-r from-blue-600/40 via-cyan-400/50 to-indigo-600/40 blur-xl animate-pulse-glow pointer-events-none",
              auraSizeMap[size]
            )}
          />

          {/* Rotating Cosmic Blue Aura Ring 1 */}
          <div
            className={cn(
              "absolute rounded-full opacity-75 blur-md animate-spin-slow pointer-events-none",
              "bg-[conic-gradient(from_0deg,transparent_0_70deg,#38bdf8_130deg,transparent_180deg,#2563eb_260deg,transparent_360deg)]",
              auraSizeMap[size]
            )}
          />

          {/* Counter-Rotating Cosmic Blue Aura Ring 2 */}
          <div
            className={cn(
              "absolute rounded-full opacity-60 blur-sm animate-spin-reverse pointer-events-none",
              "bg-[conic-gradient(from_180deg,transparent_0_60deg,#60a5fa_140deg,transparent_200deg,#0ea5e9_300deg,transparent_360deg)]",
              auraSizeMap[size]
            )}
          />
        </>
      )}

      {/* Main Clean Logo Image */}
      <img
        src="/pka-logo.png"
        alt="PKA - Site de Apoio"
        className="relative z-10 w-full h-full object-contain drop-shadow-[0_4px_16px_rgba(37,99,235,0.45)] transition-transform duration-300 group-hover:scale-105"
        loading="eager"
      />
    </div>
  );
}

export function PokemonIcon({ pokemon, className }: { pokemon: string; className?: string }) {
  const isShiny = pokemon.toLowerCase().startsWith("shiny ");
  let baseName = pokemon.toLowerCase().replace("shiny ", "").trim();
  
  // Clean up name for Showdown format
  baseName = baseName.replace(/ /g, "");
  baseName = baseName.replace(/\./g, "");
  baseName = baseName.replace(/'/g, "");
  baseName = baseName.replace("♀", "f");
  baseName = baseName.replace("♂", "m");

  if (baseName === "nidoranfemale") baseName = "nidoranf";
  if (baseName === "nidoranmale") baseName = "nidoranm";
  if (baseName === "mrmime") baseName = "mrmime";
  if (baseName === "ho-oh") baseName = "hooh";
  
  const folder = isShiny ? "gen5-shiny" : "gen5";
  const url = `https://play.pokemonshowdown.com/sprites/${folder}/${baseName}.png`;
  
  return (
    <img 
      src={url} 
      alt={pokemon} 
      title={pokemon}
      className={cn("w-10 h-10 object-contain pixelated inline-block", className)} 
      loading="lazy"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

export function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string | undefined;
}) {
  return (
    <div className="mb-6">
      <h1 className="flex items-center gap-3 text-2xl font-bold sm:text-3xl">
        <span aria-hidden>{icon}</span>
        <span>{title}</span>
      </h1>
      {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("panel p-4 sm:p-5", className)}>{children}</div>;
}

export function TierBadge({ tier }: { tier: string }) {
  const isMythicOrLD = /^(mythic|ld|legendary)$/i.test(tier.trim());
  const isUR = /^(ur|ultra\s*rare)$/i.test(tier.trim());
  const isSR = /^(sr|super\s*rare)$/i.test(tier.trim());
  
  if (isMythicOrLD) {
    return (
      <span className="rounded-md border border-purple-500/40 bg-purple-500/15 px-2 py-0.5 text-xs font-bold text-purple-300 shadow-sm">
        {tier}
      </span>
    );
  }
  if (isUR) {
    return (
      <span className="rounded-md border border-red-500/40 bg-red-500/15 px-2 py-0.5 text-xs font-bold text-red-400 shadow-sm">
        {tier}
      </span>
    );
  }
  if (isSR) {
    return (
      <span className="rounded-md border border-gold/40 bg-gold/15 px-2 py-0.5 text-xs font-bold text-gold shadow-sm">
        {tier}
      </span>
    );
  }

  return (
    <span className="rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
      {tier}
    </span>
  );
}

export function Chip({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: "default" | "gold" | "success" | "danger";
  className?: string;
}) {
  const tones = {
    default: "border-border bg-panel-strong text-foreground",
    gold: "border-gold/40 bg-gold/10 text-gold",
    success: "border-success/40 bg-success/10 text-success",
    danger: "border-danger/40 bg-danger/10 text-danger",
  } as const;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs", tones[tone], className)}>
      {children}
    </span>
  );
}

export function ExternalLinkChip({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
    >
      {label}
      <ExternalLink className="size-3" />
    </a>
  );
}

export function FavoriteButton({ fav }: { fav: Favorite }) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(fav.to);
  return (
    <button
      type="button"
      aria-label={active ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      onClick={() => toggle(fav)}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-md border transition-colors",
        active ? "border-gold/50 bg-gold/15 text-gold" : "border-border bg-panel-strong text-muted-foreground hover:text-gold",
      )}
    >
      <Star className={cn("size-4", active && "fill-current")} />
    </button>
  );
}

export function PokemonCard({ p }: { p: PokemonEntry }) {
  return (
    <Link
      to="/pokemon/$slug"
      params={{ slug: p.slug }}
      className="panel group flex items-center justify-between gap-3 p-3 transition-colors hover:border-primary/50 hover:bg-panel-strong"
    >
      <div className="flex items-center gap-3 min-w-0">
        <PokemonIcon pokemon={p.name} className="shrink-0" />
        <div className="min-w-0">
          <p className="truncate font-display text-base font-semibold group-hover:text-primary">{p.name}</p>
          <p className="truncate text-xs text-muted-foreground">{p.type ?? "Tipo não informado"}</p>
        </div>
      </div>
      {p.tier ? <TierBadge tier={p.tier} /> : null}
    </Link>
  );
}

export function ItemCard({ item, count }: { item: string; count: number }) {
  return (
    <Link
      to="/item/$slug"
      params={{ slug: slugify(item) }}
      className="panel group flex items-center justify-between gap-3 p-3 transition-colors hover:border-gold/50 hover:bg-panel-strong"
    >
      <span className="truncate text-sm capitalize group-hover:text-gold">{item}</span>
      <span className="shrink-0 text-xs text-muted-foreground">{count} 🐾</span>
    </Link>
  );
}

export function EmptyState({ query }: { query?: string }) {
  return (
    <div className="panel flex flex-col items-center gap-3 p-10 text-center">
      <SearchX className="size-8 text-muted-foreground" />
      <h3 className="font-display text-lg font-semibold">🔎 Nada encontrado</h3>
      <p className="max-w-md text-sm text-muted-foreground">
        Não encontramos {query ? <span className="text-foreground">“{query}”</span> : "essa informação"} na base atual do
        PKA.
      </p>
      <ul className="text-xs text-muted-foreground">
        <li>• Confira a escrita</li>
        <li>• Tente pesquisar somente parte do nome</li>
        <li>• Faça a pergunta ao Assistente</li>
      </ul>
      <Link
        to="/assistente"
        className="mt-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        🤖 Perguntar ao Assistente
      </Link>
    </div>
  );
}

export function CardsSkeleton({ count = 6, label }: { count?: number; label?: string }) {
  return (
    <div className="space-y-3">
      {label ? <p className="text-sm text-muted-foreground">{label}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
