import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { globalSearch, type SearchHit } from "@/lib/pka";
import { pushHistory } from "@/lib/storage";

const KIND_ICON: Record<SearchHit["kind"], string> = {
  pokemon: "🐾",
  item: "💎",
  dungeon: "⚔️",
  talent: "🧬",
  npc: "🎯",
  guide: "📚",
  location: "📍",
  task: "🎯",
};

const KIND_LABEL: Record<SearchHit["kind"], string> = {
  pokemon: "Pokémon",
  item: "Itens",
  dungeon: "Dungeons",
  talent: "Talentos",
  npc: "NPCs / Tasks",
  guide: "Guias",
  location: "Localizações",
  task: "Tasks",
};

export function GlobalSearch({
  placeholder = "O que você quer descobrir?",
  size = "sm",
}: {
  placeholder?: string;
  size?: "sm" | "lg";
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  const hits = useMemo(() => (q.trim().length >= 2 ? globalSearch(q, 24) : []), [q]);

  const grouped = useMemo(() => {
    const g = new Map<SearchHit["kind"], SearchHit[]>();
    hits.forEach((h) => {
      if (!g.has(h.kind)) g.set(h.kind, []);
      const arr = g.get(h.kind)!;
      if (arr.length < 5) arr.push(h);
    });
    return [...g.entries()];
  }, [hits]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const go = (hit: SearchHit) => {
    pushHistory({ query: hit.label, to: hit.to });
    setOpen(false);
    setQ("");
    navigate({ to: hit.to });
  };

  return (
    <div ref={ref} className="relative w-full">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && hits[0]) go(hits[0]);
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder={placeholder}
          aria-label="Busca global"
          className={cn(
            "w-full rounded-lg border border-input bg-panel pl-9 pr-14 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors",
            size === "lg" ? "h-13 text-base" : "h-9 text-sm",
          )}
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border/80 bg-background/80 px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground hidden sm:inline-block shadow-sm">
          Ctrl K
        </kbd>
      </div>

      {open && q.trim().length >= 2 ? (
        <div className="panel absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto p-2">
          {grouped.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              Nada encontrado para “{q}”. Tente o Assistente 🤖
            </p>
          ) : (
            grouped.map(([kind, list]) => (
              <div key={kind} className="mb-2 last:mb-0">
                <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {KIND_LABEL[kind]}
                </p>
                {list.map((h) => (
                  <button
                    key={`${h.kind}-${h.to}-${h.label}`}
                    type="button"
                    onClick={() => go(h)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-panel-strong"
                  >
                    <span aria-hidden>{KIND_ICON[h.kind]}</span>
                    <span className="min-w-0 flex-1 truncate capitalize">{h.label}</span>
                    {h.sub ? <span className="shrink-0 text-xs text-muted-foreground">{h.sub}</span> : null}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
