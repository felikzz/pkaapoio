import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  CheckCircle2,
  Circle,
  Star,
  Search,
  Filter,
  ArrowUpDown,
  Flame,
  Sparkles,
  RotateCcw,
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ListFilter,
  Compass,
  Layers,
  MapPin,
  Swords,
  Info,
  ExternalLink,
  Target,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import {
  SectionTitle,
  Panel,
  PokemonIcon,
  TierBadge,
  TypeBadge,
  Chip,
  ExternalLinkChip,
} from "@/components/pka/ui";
import {
  POKELOG_ITEMS,
  POKELOGS_RECOMMENDED_ORDER,
  POKELOG_STAGES,
  type PokelogItem,
  type PokelogCategory,
} from "@/lib/pokelog-data";
import { usePokelogs } from "@/lib/pokelog-storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pokelogs")({
  head: () => ({
    meta: [
      {
        title: "Guia & Roteiro de Pokelogs — PokeAlliance (PKA)",
      },
      {
        name: "description",
        content:
          "Guia completo e checklist interativo de Pokelogs do PokeAlliance: organize suas metas, marque pokelogs concluídos, acompanhe seu progresso e siga a melhor rota para level 100+.",
      },
      {
        property: "og:title",
        content: "Guia & Roteiro de Pokelogs — PokeAlliance",
      },
      {
        property: "og:description",
        content:
          "Checklist interativo de Pokelogs com rota recomendada para 100+, hunts e contador de progresso.",
      },
    ],
  }),
  component: PokelogsPage,
});

type StatusFilter = "all" | "pending" | "progress" | "completed" | "priority";
type LevelFilter = "all" | "lvl100" | "starter";
type SortOption = "recommended" | "killsAsc" | "killsDesc" | "nameAsc" | "tier";

function PokelogsPage() {
  const {
    state,
    isCompleted,
    isFavorite,
    getProgress,
    toggleCompleted,
    setKills,
    toggleFavorite,
    markBatch,
    resetAll,
    importState,
  } = usePokelogs();

  // Navigation tabs: 'roadmap' | 'all' | 'guide'
  const [activeTab, setActiveTab] = useState<"roadmap" | "all" | "guide">("roadmap");

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<PokelogCategory | "all">("all");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recommended");

  // Selected stage for roadmap filter (optional)
  const [selectedStage, setSelectedStage] = useState<number | "all">("all");

  // Modals / Dialogs
  const [showImportExport, setShowImportExport] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [killModalItem, setKillModalItem] = useState<PokelogItem | null>(null);
  const [partialKillsInput, setPartialKillsInput] = useState<number>(0);

  // Statistics
  const totalPokelogs = POKELOG_ITEMS.length;
  const completedCount = useMemo(
    () => POKELOG_ITEMS.filter((p) => isCompleted(p.pokemon)).length,
    [isCompleted],
  );
  const completionPercentage = Math.round((completedCount / totalPokelogs) * 100) || 0;

  const lvl100Total = useMemo(
    () => POKELOG_ITEMS.filter((p) => p.isLevel100Plus).length,
    [],
  );
  const lvl100Completed = useMemo(
    () => POKELOG_ITEMS.filter((p) => p.isLevel100Plus && isCompleted(p.pokemon)).length,
    [isCompleted],
  );

  const totalKillsRequired = useMemo(
    () => POKELOG_ITEMS.reduce((acc, p) => acc + p.qtd, 0),
    [],
  );
  const totalKillsDone = useMemo(
    () =>
      POKELOG_ITEMS.reduce((acc, p) => {
        if (isCompleted(p.pokemon)) return acc + p.qtd;
        const prog = getProgress(p.pokemon);
        return acc + Math.min(prog, p.qtd);
      }, 0),
    [isCompleted, getProgress],
  );

  // Next recommended Pokelog
  const nextRecommended = useMemo(() => {
    return POKELOGS_RECOMMENDED_ORDER.find((p) => !isCompleted(p.pokemon)) || null;
  }, [isCompleted]);

  // Filter items
  const filteredItems = useMemo(() => {
    return POKELOG_ITEMS.filter((item) => {
      // Text Search
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = item.pokemon.toLowerCase().includes(q);
        const matchesTier = item.tier.toLowerCase().includes(q);
        const matchesCategory = item.categoryLabel.toLowerCase().includes(q);
        const matchesTypes = item.elementTypes.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesTier && !matchesCategory && !matchesTypes) return false;
      }

      // Status Filter
      const done = isCompleted(item.pokemon);
      const prog = getProgress(item.pokemon);
      const fav = isFavorite(item.pokemon);

      if (statusFilter === "completed" && !done) return false;
      if (statusFilter === "pending" && (done || prog > 0)) return false;
      if (statusFilter === "progress" && (done || prog === 0)) return false;
      if (statusFilter === "priority" && !fav) return false;

      // Category Filter
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;

      // Level Filter
      if (levelFilter === "lvl100" && !item.isLevel100Plus) return false;
      if (levelFilter === "starter" && item.isLevel100Plus) return false;

      // Tier Filter
      if (tierFilter !== "all" && item.tier !== tierFilter) return false;

      // Stage Filter
      if (selectedStage !== "all" && item.stage !== selectedStage) return false;

      return true;
    }).sort((a, b) => {
      // Pinned favorites first unless sorted otherwise
      if (statusFilter !== "priority") {
        const favA = isFavorite(a.pokemon);
        const favB = isFavorite(b.pokemon);
        if (favA && !favB) return -1;
        if (!favA && favB) return 1;
      }

      if (sortBy === "recommended") {
        if (a.stage !== b.stage) return a.stage - b.stage;
        if (a.qtd !== b.qtd) return a.qtd - b.qtd;
        return a.pokemon.localeCompare(b.pokemon);
      }
      if (sortBy === "killsAsc") return a.qtd - b.qtd;
      if (sortBy === "killsDesc") return b.qtd - a.qtd;
      if (sortBy === "nameAsc") return a.pokemon.localeCompare(b.pokemon);
      if (sortBy === "tier") return a.tier.localeCompare(b.tier);
      return 0;
    });
  }, [
    search,
    statusFilter,
    categoryFilter,
    levelFilter,
    tierFilter,
    selectedStage,
    sortBy,
    isCompleted,
    getProgress,
    isFavorite,
  ]);

  // Group items by Stage for the Roadmap View
  const stageGroups = useMemo(() => {
    return POKELOG_STAGES.map((stg) => {
      const items = POKELOG_ITEMS.filter((item) => item.stage === stg.stage);
      const stageDone = items.filter((item) => isCompleted(item.pokemon)).length;
      return {
        ...stg,
        items,
        total: items.length,
        done: stageDone,
        percentage: Math.round((stageDone / items.length) * 100) || 0,
      };
    });
  }, [isCompleted]);

  // Handlers
  const handleToggleComplete = (item: PokelogItem) => {
    const wasDone = isCompleted(item.pokemon);
    toggleCompleted(item.pokemon, item.qtd);
    if (!wasDone) {
      toast.success(`Pokelog de ${item.pokemon} marcado como concluído! 🎉`);
    } else {
      toast.info(`Pokelog de ${item.pokemon} desmarcado.`);
    }
  };

  const handleOpenKillModal = (item: PokelogItem) => {
    setKillModalItem(item);
    setPartialKillsInput(getProgress(item.pokemon));
  };

  const handleSaveKills = () => {
    if (!killModalItem) return;
    setKills(killModalItem.pokemon, partialKillsInput, killModalItem.qtd);
    toast.success(`Progresso de ${killModalItem.pokemon} atualizado para ${partialKillsInput} kills.`);
    setKillModalItem(null);
  };

  const handleExport = () => {
    const jsonStr = JSON.stringify(state, null, 2);
    navigator.clipboard.writeText(jsonStr);
    toast.success("Dados copiados para a área de transferência!");
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importJson);
      importState(parsed);
      toast.success("Progresso importado com sucesso!");
      setShowImportExport(false);
      setImportJson("");
    } catch {
      toast.error("JSON inválido! Verifique o formato do texto copiado.");
    }
  };

  const handleReset = () => {
    if (confirm("Tem certeza que deseja resetar todo o seu progresso de Pokelogs?")) {
      resetAll();
      toast.info("Progresso de Pokelogs resetado.");
    }
  };

  const handleMarkAllFiltered = (done: boolean) => {
    const names = filteredItems.map((p) => p.pokemon);
    markBatch(names, done);
    toast.success(`${names.length} pokelogs marcados como ${done ? "concluídos" : "pendentes"}!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <SectionTitle
          icon="📜"
          title="Pokelogs & Roteiro"
          subtitle="Acompanhe sua lista de pokelogs, marque os concluídos e descubra as melhores hunts para level 100+"
        />

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowImportExport(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-panel px-3 py-1.5 text-xs font-medium text-foreground hover:bg-panel-strong transition-colors"
          >
            <Download className="size-3.5" />
            <span>Backup / Importar</span>
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-danger/30 bg-danger/10 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/20 transition-colors"
          >
            <RotateCcw className="size-3.5" />
            <span>Resetar</span>
          </button>
        </div>
      </div>

      {/* Progress & Quick Stats Dashboard */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Main Progress Bar Card */}
        <Panel className="sm:col-span-2 relative overflow-hidden border-primary/30 bg-gradient-to-br from-panel via-panel to-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="size-5 text-gold animate-pulse" />
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Progresso Geral
              </h2>
            </div>
            <span className="font-mono text-xl font-extrabold text-gradient-gold">
              {completionPercentage}%
            </span>
          </div>

          <div className="mt-3 space-y-1.5">
            <div className="h-3 w-full overflow-hidden rounded-full bg-sidebar border border-border/80 p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-gold transition-all duration-500 shadow-sm"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                <strong className="text-foreground">{completedCount}</strong> de {totalPokelogs} pokelogs feitos
              </span>
              <span>{totalPokelogs - completedCount} pendentes</span>
            </div>
          </div>

          {/* Next Recommended Mini Banner */}
          {nextRecommended && (
            <div className="mt-4 flex items-center justify-between rounded-lg border border-border/60 bg-panel/80 p-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <PokemonIcon pokemon={nextRecommended.pokemon} className="size-7 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Sugerido a Fazer Agora
                  </p>
                  <p className="truncate text-xs font-semibold text-foreground">
                    {nextRecommended.pokemon} ({nextRecommended.qtd.toLocaleString()} kills)
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggleComplete(nextRecommended)}
                className="shrink-0 rounded-md bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Concluir
              </button>
            </div>
          )}
        </Panel>

        {/* Level 100+ Metric */}
        <Panel className="flex flex-col justify-between border-amber-500/20 bg-gradient-to-b from-panel to-amber-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pokelogs Lvl 100+
            </span>
            <Flame className="size-4 text-amber-400" />
          </div>
          <div className="my-2">
            <p className="text-2xl font-black text-amber-400 font-mono">
              {lvl100Completed} <span className="text-sm font-normal text-muted-foreground">/ {lvl100Total}</span>
            </p>
            <p className="text-[11px] text-muted-foreground">
              Meta favorita da comunidade (Wilds 10k & Hoenn)
            </p>
          </div>
          <div className="h-1.5 w-full rounded-full bg-sidebar overflow-hidden">
            <div
              className="h-full bg-amber-400"
              style={{ width: `${Math.round((lvl100Completed / lvl100Total) * 100) || 0}%` }}
            />
          </div>
        </Panel>

        {/* Total Kills Metric */}
        <Panel className="flex flex-col justify-between border-cyan-500/20 bg-gradient-to-b from-panel to-cyan-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total de Kills
            </span>
            <Target className="size-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <p className="text-2xl font-black text-cyan-400 font-mono">
              {totalKillsDone.toLocaleString()}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                / {totalKillsRequired.toLocaleString()}
              </span>
            </p>
            <p className="text-[11px] text-muted-foreground">
              Contagem total de abates da sua jornada
            </p>
          </div>
          <div className="h-1.5 w-full rounded-full bg-sidebar overflow-hidden">
            <div
              className="h-full bg-cyan-400"
              style={{ width: `${Math.round((totalKillsDone / totalKillsRequired) * 100) || 0}%` }}
            />
          </div>
        </Panel>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-border/60 pb-3">
        <button
          onClick={() => setActiveTab("roadmap")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-all",
            activeTab === "roadmap"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
              : "bg-panel text-muted-foreground hover:bg-panel-strong hover:text-foreground",
          )}
        >
          <Compass className="size-4" />
          <span>🗺️ Roteiro de Progressão (100+)</span>
        </button>

        <button
          onClick={() => setActiveTab("all")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-all",
            activeTab === "all"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
              : "bg-panel text-muted-foreground hover:bg-panel-strong hover:text-foreground",
          )}
        >
          <ListFilter className="size-4" />
          <span>📋 Todos os Pokelogs ({totalPokelogs})</span>
        </button>

        <button
          onClick={() => setActiveTab("guide")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-all",
            activeTab === "guide"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
              : "bg-panel text-muted-foreground hover:bg-panel-strong hover:text-foreground",
          )}
        >
          <HelpCircle className="size-4" />
          <span>💡 Como Funciona o Pokelog?</span>
        </button>
      </div>

      {/* TAB 1: ROADMAP VIEW */}
      {activeTab === "roadmap" && (
        <div className="space-y-8">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs sm:text-sm text-foreground space-y-2">
            <p className="font-semibold flex items-center gap-2 text-primary">
              <Sparkles className="size-4 text-gold" />
              Caminho Otimizado de Pokelogs (Nível 100 ao Endgame)
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              No PokeAlliance, fazer pokelogs fora de ordem pode demorar mais tempo.
              Recomendamos seguir esta ordem por fases: comece limpando os pokelogs rápidos pré-100,
              depois ataque os pokelogs Wilds de 10.000 kills para acumular tokens e bônus cruciais,
              prossiga para a rota Hoenn (4.000 kills) e finalize nos Raros e Míticos.
            </p>
          </div>

          {/* Stages List */}
          <div className="space-y-6">
            {stageGroups.map((stg) => (
              <div
                key={stg.stage}
                className="rounded-xl border border-border/80 bg-panel/50 overflow-hidden shadow-sm transition-all"
              >
                {/* Stage Header */}
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 bg-panel">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{stg.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-foreground">{stg.title}</h3>
                        <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          {stg.badge}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{stg.desc}</p>
                    </div>
                  </div>

                  {/* Stage Progress Pill */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs font-semibold text-foreground">
                        {stg.done} / {stg.total} concluídos
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">{stg.percentage}%</p>
                    </div>
                    <div className="h-2.5 w-20 rounded-full bg-sidebar overflow-hidden border border-border/60">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                        style={{ width: `${stg.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Stage Cards Grid */}
                <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                  {stg.items.map((item) => (
                    <PokelogCard
                      key={item.id}
                      item={item}
                      isDone={isCompleted(item.pokemon)}
                      isFav={isFavorite(item.pokemon)}
                      prog={getProgress(item.pokemon)}
                      onToggleComplete={() => handleToggleComplete(item)}
                      onToggleFav={() => toggleFavorite(item.pokemon)}
                      onOpenKillModal={() => handleOpenKillModal(item)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ALL POKELOGS / INTERACTIVE CHECKLIST */}
      {activeTab === "all" && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="rounded-xl border border-border/80 bg-panel p-4 space-y-4">
            {/* Search + Quick Toggles */}
            <div className="grid gap-3 md:grid-cols-3">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Pesquisar por Pokémon, tipo, categoria ou tier..."
                  aria-label="Pesquisar pokelog"
                  className="h-10 w-full rounded-lg border border-input bg-sidebar pl-9 pr-4 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="size-4 text-muted-foreground shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  aria-label="Ordenar pokelogs"
                  className="h-10 w-full rounded-lg border border-input bg-sidebar px-3 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="recommended">Ordem Recomendada (Roadmap)</option>
                  <option value="killsAsc">Menos Kills Primeiro</option>
                  <option value="killsDesc">Mais Kills Primeiro</option>
                  <option value="nameAsc">Nome (A - Z)</option>
                  <option value="tier">Tier</option>
                </select>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              {/* Status Filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-muted-foreground mr-1 uppercase">
                  Status:
                </span>
                {[
                  { id: "all", label: "Todos" },
                  { id: "pending", label: "⏳ Opções a Fazer" },
                  { id: "progress", label: "⚡ Em Progresso" },
                  { id: "completed", label: "✅ Concluídos" },
                  { id: "priority", label: "⭐ Focados" },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStatusFilter(st.id as StatusFilter)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                      statusFilter === st.id
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "bg-panel-strong text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-muted-foreground mr-1 uppercase">
                  Categoria:
                </span>
                {[
                  { id: "all", label: "Todas" },
                  { id: "starter", label: "Pré-100 (30-800)" },
                  { id: "wild", label: "Wilds (10.000)" },
                  { id: "hoenn", label: "Hoenn (4.000)" },
                  { id: "rare", label: "Raros & Tubos" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id as PokelogCategory | "all")}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                      categoryFilter === cat.id
                        ? "bg-gold/20 text-gold border border-gold/40 font-semibold"
                        : "bg-panel-strong text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Batch Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs text-muted-foreground">
              <span>
                Exibindo <strong className="text-foreground">{filteredItems.length}</strong> pokelogs
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMarkAllFiltered(true)}
                  className="text-[11px] font-medium text-primary hover:underline"
                >
                  Marcar visualizados como Concluídos
                </button>
                <span>•</span>
                <button
                  onClick={() => handleMarkAllFiltered(false)}
                  className="text-[11px] font-medium text-danger hover:underline"
                >
                  Desmarcar visualizados
                </button>
              </div>
            </div>
          </div>

          {/* Pokelogs Grid */}
          {filteredItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 bg-panel/40 p-12 text-center">
              <p className="text-lg font-semibold text-foreground">Nenhum Pokelog encontrado</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tente ajustar seus termos de pesquisa ou filtros de status/categoria.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <PokelogCard
                  key={item.id}
                  item={item}
                  isDone={isCompleted(item.pokemon)}
                  isFav={isFavorite(item.pokemon)}
                  prog={getProgress(item.pokemon)}
                  onToggleComplete={() => handleToggleComplete(item)}
                  onToggleFav={() => toggleFavorite(item.pokemon)}
                  onOpenKillModal={() => handleOpenKillModal(item)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FAQ / POKELOG SYSTEM GUIDE */}
      {activeTab === "guide" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Panel className="space-y-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>🎯</span> O que é o Sistema de Pokelog?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                O Pokelog é um dos sistemas de progressão permanente mais importantes do PokeAlliance.
                Ao abater uma quantidade pré-determinada de um Pokémon específico (ex: 30, 800, 4.000 ou 10.000 kills),
                você desbloqueia recompensas como tokens, bônus de conta, slots adicionais e conquistas.
              </p>
              <div className="rounded-lg border border-border bg-sidebar p-3 text-xs space-y-1">
                <p className="font-semibold text-primary">Como abrir o Pokelog no jogo:</p>
                <p className="text-muted-foreground font-mono text-[11px]">
                  Pressione <kbd className="rounded bg-panel px-1.5 py-0.5 text-foreground">Ctrl + T</kbd> → Clique em{" "}
                  <strong>Pokelog</strong> → <strong>Open Tracker</strong>.
                </p>
              </div>
            </Panel>

            <Panel className="space-y-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>⚡</span> Por que a comunidade foca nos de Level 100+?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ao atingir o level 100, o player tem acesso a Pokémons com alto dano em área (AoE) e rotas
                de hunt com alta densidade de spawns.
                Completar os Pokelogs de 10.000 Wilds e 4.000 Hoenn garante uma quantidade massiva de
                recompensas e XP acumulada.
              </p>
              <div className="rounded-lg border border-border bg-sidebar p-3 text-xs space-y-1">
                <p className="font-semibold text-amber-400">Dica de Eficiência:</p>
                <p className="text-muted-foreground text-[11px]">
                  Sempre use Pokémons que causem dano super efetivo (2.0x) no elemento do spawn para limpar as waves em 1 hit.
                </p>
              </div>
            </Panel>

            <Panel className="space-y-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>🧪</span> Buffs e Poções Recomendadas
              </h3>
              <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                <li>
                  <strong>Poção de Spawn / Incenso:</strong> Acelera o renascimento dos mobs na hunt.
                </li>
                <li>
                  <strong>Bônus de Exp & Loot:</strong> Aproveite eventos de 2x ou poções de boost de drop.
                </li>
                <li>
                  <strong>Talentos de Dano AoE:</strong> Reduzem o tempo de cooldown das habilidades em área.
                </li>
              </ul>
            </Panel>

            <Panel className="space-y-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>💾</span> Como salvar meu progresso aqui no Helper?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Seu progresso é gravado automaticamente no seu navegador. Você pode marcar e desmarcar
                pokelogs à vontade. Caso vá trocar de computador ou queira fazer backup, use o botão{" "}
                <strong>Backup / Importar</strong> no topo da página.
              </p>
            </Panel>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR KILLS PARCIAIS */}
      {killModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-panel p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <PokemonIcon pokemon={killModalItem.pokemon} className="size-8" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Registrar Kills — {killModalItem.pokemon}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Meta: {killModalItem.qtd.toLocaleString()} kills
                  </p>
                </div>
              </div>
              <button
                onClick={() => setKillModalItem(null)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕ Fechar
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium text-foreground block">
                Quantidade de Kills Feitas:
              </label>
              <input
                type="number"
                min={0}
                max={killModalItem.qtd}
                value={partialKillsInput}
                onChange={(e) => setPartialKillsInput(Number(e.target.value))}
                aria-label="Quantidade de kills"
                className="h-11 w-full rounded-lg border border-input bg-sidebar px-3 text-lg font-mono font-bold text-foreground focus:border-primary focus:outline-none"
              />

              {/* Progress visual in modal */}
              <div className="space-y-1">
                <div className="h-2 w-full rounded-full bg-sidebar overflow-hidden border border-border">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${Math.min(100, Math.round((partialKillsInput / killModalItem.qtd) * 100))}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{partialKillsInput.toLocaleString()} kills</span>
                  <span>
                    {Math.min(100, Math.round((partialKillsInput / killModalItem.qtd) * 100))}%
                  </span>
                </div>
              </div>

              {/* Quick helper buttons */}
              <div className="flex gap-2">
                {[0.25, 0.5, 0.75, 1].map((frac) => {
                  const val = Math.round(killModalItem.qtd * frac);
                  return (
                    <button
                      key={frac}
                      onClick={() => setPartialKillsInput(val)}
                      className="flex-1 rounded-md border border-border bg-sidebar py-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {frac * 100}%
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <button
                onClick={() => setKillModalItem(null)}
                className="rounded-lg border border-input px-4 py-2 text-xs font-semibold text-foreground hover:bg-panel-strong"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveKills}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Salvar Progresso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BACKUP / EXPORT / IMPORT */}
      {showImportExport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-border bg-panel p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Download className="size-4 text-primary" />
                Backup e Sincronização de Pokelogs
              </h3>
              <button
                onClick={() => setShowImportExport(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕ Fechar
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Exporte seus dados para salvar ou transferir para outro navegador / celular.
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Importar / Exportar JSON:</span>
                <button
                  onClick={handleExport}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <Download className="size-3" /> Copiar Dados Atuais
                </button>
              </div>
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder="Cole aqui o código JSON do seu backup para restaurar..."
                aria-label="Código JSON de backup"
                rows={5}
                className="w-full rounded-lg border border-input bg-sidebar p-3 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <button
                onClick={() => setShowImportExport(false)}
                className="rounded-lg border border-input px-4 py-2 text-xs font-semibold text-foreground hover:bg-panel-strong"
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={!importJson.trim()}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Restaurar Backup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// INDIVIDUAL POKELOG CARD COMPONENT
function PokelogCard({
  item,
  isDone,
  isFav,
  prog,
  onToggleComplete,
  onToggleFav,
  onOpenKillModal,
}: {
  item: PokelogItem;
  isDone: boolean;
  isFav: boolean;
  prog: number;
  onToggleComplete: () => void;
  onToggleFav: () => void;
  onOpenKillModal: () => void;
}) {
  const percentDone = isDone ? 100 : Math.min(100, Math.round((prog / item.qtd) * 100));

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border p-3.5 transition-all",
        isDone
          ? "border-success/40 bg-success/5 shadow-inner"
          : isFav
            ? "border-gold/50 bg-gold/5 shadow-md shadow-gold/5"
            : "border-border/80 bg-panel hover:border-primary/40 hover:bg-panel-strong",
      )}
    >
      {/* Top Header: Checkbox + Name + Star Pin */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onToggleComplete}
            aria-label={isDone ? "Marcar como pendente" : "Marcar como concluído"}
            className="shrink-0 text-muted-foreground hover:text-success transition-colors"
          >
            {isDone ? (
              <CheckCircle2 className="size-6 text-success fill-success/20" />
            ) : (
              <Circle className="size-6 text-muted-foreground/60 hover:text-primary" />
            )}
          </button>

          <PokemonIcon pokemon={item.pokemon} className="size-8 shrink-0" />

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                to="/pokemon/$slug"
                params={{ slug: item.slug }}
                className={cn(
                  "font-bold text-sm hover:text-primary transition-colors truncate",
                  isDone ? "line-through text-muted-foreground" : "text-foreground",
                )}
              >
                {item.pokemon}
              </Link>
              <TierBadge tier={item.tier} />
            </div>

            <p className="text-[11px] text-muted-foreground font-mono">
              <strong className={isDone ? "text-success font-semibold" : "text-foreground font-bold"}>
                {item.qtd.toLocaleString()}
              </strong>{" "}
              kills ({item.categoryLabel.split("(")[0].trim()})
            </p>
          </div>
        </div>

        {/* Pin to top star */}
        <button
          type="button"
          onClick={onToggleFav}
          aria-label={isFav ? "Desafixar" : "Fixar no topo"}
          className={cn(
            "shrink-0 rounded-md p-1 transition-colors",
            isFav ? "text-gold" : "text-muted-foreground/40 hover:text-gold",
          )}
        >
          <Star className={cn("size-4", isFav && "fill-current")} />
        </button>
      </div>

      {/* Middle: Hunt Link / Weaknesses */}
      <div className="my-2.5 space-y-1.5 text-xs">
        {item.hunt ? (
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <ExternalLinkChip href={item.hunt} label="Ver Mapa / Hunt" />
          </div>
        ) : null}

        {/* Counter / 2.0x Weaknesses */}
        {item.weaknesses.length > 0 && !isDone && (
          <div className="flex items-center gap-1.5 pt-1 text-[10px] text-muted-foreground">
            <span className="font-semibold text-foreground/80">2.0x Dano:</span>
            <div className="flex flex-wrap gap-1">
              {item.weaknesses.slice(0, 3).map((w) => (
                <TypeBadge key={w} type={w} size="xs" />
              ))}
            </div>
          </div>
        )}

        {/* Progress Bar (if partial kills exist and not done) */}
        {!isDone && prog > 0 && (
          <div className="pt-1 space-y-0.5">
            <div className="h-1.5 w-full rounded-full bg-sidebar overflow-hidden border border-border/40">
              <div
                className="h-full bg-primary"
                style={{ width: `${percentDone}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{prog.toLocaleString()} / {item.qtd.toLocaleString()}</span>
              <span>{percentDone}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px]">
        <button
          type="button"
          onClick={onOpenKillModal}
          className="text-muted-foreground hover:text-foreground font-medium flex items-center gap-1"
        >
          <span>🎯 Kills parciais</span>
        </button>

        <Link
          to="/qual-pokemon-usar"
          search={{ p: item.pokemon }}
          className="text-primary hover:underline font-medium flex items-center gap-0.5"
        >
          <span>Melhor Counter</span>
          <Swords className="size-3" />
        </Link>
      </div>
    </div>
  );
}
