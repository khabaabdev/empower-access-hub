import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookmarkSimple,
  CaretDown,
  CheckCircle,
  Clock,
  Funnel,
  GridFour,
  List,
  MagnifyingGlass,
  MapPin,
  MapTrifold,
  ShieldCheck,
  SpeakerHigh,
  Wheelchair,
  X,
} from "@phosphor-icons/react";
import {
  ACCESSIBILITY_TAGS,
  CATEGORIES,
  categoryLabel,
  NEED_WIZARD,
  SORT_OPTIONS,
  speakText,
  tagLabel,
  type AccessibilityTagId,
  type CategoryType,
  type ResourceListing,
  type SortKey,
  type ViewMode,
} from "../data/mockData";

interface DiscoveryDashboardProps {
  listings: ResourceListing[];
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onSelect: (listing: ResourceListing) => void;
  voiceReader: boolean;
}

const MAX_VISIBLE_TAGS = 3;

export default function DiscoveryDashboard({
  listings,
  savedIds,
  onToggleSave,
  onSelect,
  voiceReader,
}: DiscoveryDashboardProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryType | "all">("all");
  const [activeTags, setActiveTags] = useState<AccessibilityTagId[]>([]);
  const [sort, setSort] = useState<SortKey>("nearest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    listings.forEach((item) => map.set(item.category, (map.get(item.category) ?? 0) + 1));
    return map;
  }, [listings]);

  const tagCounts = useMemo(() => {
    const map = new Map<string, number>();
    listings.forEach((item) =>
      item.accessibilityTags.forEach((tag) => map.set(tag, (map.get(tag) ?? 0) + 1)),
    );
    return map;
  }, [listings]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = listings.filter((item) => {
      if (activeCategory !== "all" && item.category !== activeCategory) return false;
      if (activeTags.length > 0 && !activeTags.every((tag) => item.accessibilityTags.includes(tag))) {
        return false;
      }
      if (!needle) return true;
      const haystack = [
        item.title,
        item.organization,
        item.neighborhood,
        item.description,
        item.plainSummary,
        ...item.accessibilityTags.map((tag) => tagLabel(tag)),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sort === "alpha") return a.title.localeCompare(b.title);
      if (sort === "value") {
        const av = a.compensation ? 1 : 0;
        const bv = b.compensation ? 1 : 0;
        if (av !== bv) return bv - av;
        return a.distanceMiles - b.distanceMiles;
      }
      if (sort === "recent") return b.verifiedDate.localeCompare(a.verifiedDate);
      return a.distanceMiles - b.distanceMiles;
    });
    return sorted;
  }, [listings, activeCategory, activeTags, query, sort]);

  const toggleTag = (tag: AccessibilityTagId) => {
    setActiveTags((prev) => (prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]));
  };

  const resetFilters = () => {
    setQuery("");
    setActiveCategory("all");
    setActiveTags([]);
    setSort("nearest");
  };

  const applyWizard = (needId: string) => {
    const need = NEED_WIZARD.find((item) => item.id === needId);
    if (!need) return;
    setActiveCategory(need.category ?? "all");
    setActiveTags([...need.tags]);
    setQuery("");
  };

  const activeFilterCount = activeTags.length + (activeCategory === "all" ? 0 : 1) + (query ? 1 : 0);

  return (
    <section aria-labelledby="directory-heading" className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="directory-heading" className="text-app text-2xl font-extrabold tracking-tight sm:text-3xl">
            Discovery dashboard
          </h2>
          <motion.p
            key={results.length}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="text-muted-app mt-1 text-sm"
            aria-live="polite"
          >
            {results.length} of {listings.length} verified listings match what you asked for.
          </motion.p>
        </div>
        <div className="flex items-center gap-2">
          <div
            role="group"
            aria-label="View style"
            className="card-a11y flex items-center gap-1 p-1"
          >
            <ViewButton mode="grid" current={viewMode} onSelect={setViewMode} label="Card grid">
              <GridFour size={18} weight="bold" aria-hidden="true" />
            </ViewButton>
            <ViewButton mode="list" current={viewMode} onSelect={setViewMode} label="Compact list">
              <List size={18} weight="bold" aria-hidden="true" />
            </ViewButton>
            <ViewButton mode="map" current={viewMode} onSelect={setViewMode} label="Neighborhood map">
              <MapTrifold size={18} weight="bold" aria-hidden="true" />
            </ViewButton>
          </div>
        </div>
      </div>

      {/* Need-based shortcuts */}
      <div className="card-a11y mb-4 p-4">
        <p className="text-app mb-2 text-xs font-extrabold uppercase tracking-wider">
          Skip the filters, tell us what you need
        </p>
        <div className="flex flex-wrap gap-2">
          {NEED_WIZARD.map((need) => (
            <button
              key={need.id}
              type="button"
              onClick={() => applyWizard(need.id)}
              className="soft-accent min-h-11 rounded-full px-4 text-sm font-bold"
            >
              {need.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search + sort */}
      <div className="card-a11y mb-4 p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search listings</span>
            <MagnifyingGlass
              size={20}
              weight="bold"
              aria-hidden="true"
              className="text-muted-app pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search meal programs, clinics, gigs, workshops..."
              className="text-app surface-muted h-12 w-full rounded-xl border border-app pl-10 pr-3 text-sm placeholder:text-[var(--app-muted)]"
            />
          </label>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2">
              <span className="sr-only">Sort listings</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
                className="text-app surface-muted h-12 rounded-xl border border-app px-3 text-sm font-semibold"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              className="card-a11y text-app flex h-12 items-center gap-2 px-3 text-sm font-bold lg:hidden"
            >
              <Funnel size={18} weight="bold" aria-hidden="true" />
              Filters
              {activeFilterCount > 0 ? (
                <span className="bg-accent-app rounded-full px-1.5 py-0.5 text-[11px] font-extrabold">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        {/* Filter rail */}
        <aside
          aria-label="Filter listings"
          className={`${filtersOpen ? "block" : "hidden"} lg:block`}
        >
          <div className="card-a11y space-y-5 p-4 lg:sticky lg:top-32">
            <div>
              <p className="text-app mb-2 text-xs font-extrabold uppercase tracking-wider">Category</p>
              <ul className="space-y-1">
                <FilterRow
                  label="All categories"
                  count={listings.length}
                  active={activeCategory === "all"}
                  onClick={() => setActiveCategory("all")}
                />
                {CATEGORIES.map((category) => (
                  <FilterRow
                    key={category.id}
                    label={category.label}
                    count={categoryCounts.get(category.id) ?? 0}
                    active={activeCategory === category.id}
                    onClick={() => setActiveCategory(category.id)}
                  />
                ))}
              </ul>
            </div>

            <div className="border-t border-app pt-4">
              <p className="text-app mb-2 text-xs font-extrabold uppercase tracking-wider">
                Accessibility needs
              </p>
              <div className="flex flex-wrap gap-2">
                {ACCESSIBILITY_TAGS.map((tag) => {
                  const active = activeTags.includes(tag.id);
                  const count = tagCounts.get(tag.id) ?? 0;
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleTag(tag.id)}
                      className={`flex min-h-11 items-center gap-1.5 rounded-full border px-3 text-xs font-bold ${
                        active
                          ? "border-[var(--app-accent)] soft-accent"
                          : "border-app text-app surface"
                      }`}
                    >
                      {active ? <X size={13} weight="bold" aria-hidden="true" /> : null}
                      {tag.label}
                      <span className="text-muted-app font-extrabold">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="text-muted-app min-h-11 w-full rounded-xl border border-app text-sm font-bold"
            >
              Reset all filters
            </button>
          </div>
        </aside>

        {/* Results */}
        <div>
          {results.length === 0 ? (
            <div className="card-a11y p-8 text-center">
              <Wheelchair size={40} weight="bold" aria-hidden="true" className="text-accent-app mx-auto" />
              <h3 className="text-app mt-3 text-lg font-extrabold">No listings match that yet</h3>
              <p className="text-muted-app mx-auto mt-1 max-w-sm text-sm">
                Try removing one accessibility filter. If something is missing entirely, add it so a
                coordinator can verify it.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="bg-accent-app mt-4 min-h-11 rounded-xl px-4 text-sm font-bold"
              >
                Reset filters
              </button>
            </div>
          ) : viewMode === "map" ? (
            <MapPanel listings={results} onSelect={onSelect} />
          ) : (
            <ul className={`grid gap-4 ${viewMode === "grid" ? "sm:grid-cols-2" : ""}`}>
              {results.map((listing) => (
                <li key={listing.id}>
                  <ListingCard
                    listing={listing}
                    saved={savedIds.includes(listing.id)}
                    onToggleSave={onToggleSave}
                    onSelect={onSelect}
                    voiceReader={voiceReader}
                    compact={viewMode === "list"}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function ViewButton({
  mode,
  current,
  onSelect,
  label,
  children,
}: {
  mode: ViewMode;
  current: ViewMode;
  onSelect: (mode: ViewMode) => void;
  label: string;
  children: React.ReactNode;
}) {
  const active = current === mode;
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      title={label}
      onClick={() => onSelect(mode)}
      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
        active ? "soft-accent" : "text-muted-app hover:surface-muted"
      }`}
    >
      {children}
    </button>
  );
}

function FilterRow({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-2 text-left text-sm font-bold ${
          active ? "soft-accent" : "text-app hover:surface-muted"
        }`}
      >
        <span className="min-w-0 truncate">{label}</span>
        <span className="text-muted-app shrink-0 text-xs font-extrabold">{count}</span>
      </button>
    </li>
  );
}

interface ListingCardProps {
  listing: ResourceListing;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onSelect: (listing: ResourceListing) => void;
  voiceReader: boolean;
  compact?: boolean;
}

function ListingCard({ listing, saved, onToggleSave, onSelect, voiceReader, compact }: ListingCardProps) {
  const extraTags = listing.accessibilityTags.length - MAX_VISIBLE_TAGS;

  return (
    <article className="card-a11y flex h-full flex-col p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="soft-accent rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide">
          {categoryLabel(listing.category)}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide ${
            listing.isOpenNow ? "soft-accent" : "warn-accent"
          }`}
        >
          {listing.isOpenNow ? "Open now" : "By appointment"}
        </span>
        <span className="text-muted-app ml-auto flex items-center gap-1 text-xs font-bold">
          <MapPin size={13} weight="bold" aria-hidden="true" />
          {listing.distanceMiles === 0 ? "Remote" : `${listing.distanceMiles} mi`}
        </span>
      </div>

      <h3 className="text-app text-base font-extrabold leading-snug">{listing.title}</h3>
      <p className="text-muted-app text-xs font-semibold">{listing.organization}</p>

      <p className={`text-muted-app mt-2 text-sm leading-relaxed ${compact ? "line-clamp-2" : "line-clamp-3"}`}>
        {listing.plainSummary}
      </p>

      {listing.compensation ? (
        <p className="text-accent-app mt-2 text-sm font-extrabold">{listing.compensation}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {listing.accessibilityTags.slice(0, MAX_VISIBLE_TAGS).map((tag) => (
          <span
            key={tag}
            className="surface-muted text-app rounded-md px-2 py-1 text-[11px] font-bold"
          >
            {tagLabel(tag)}
          </span>
        ))}
        {extraTags > 0 ? (
          <span className="surface-muted text-muted-app rounded-md px-2 py-1 text-[11px] font-bold">
            +{extraTags} more
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold">
        <ShieldCheck size={15} weight="bold" aria-hidden="true" className="text-accent-app" />
        <span className="text-muted-app">
          Verified {listing.verifiedDate} by {listing.verifiedBy}
        </span>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
        <button
          type="button"
          onClick={() => onSelect(listing)}
          className="bg-accent-app flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-bold"
        >
          View access details
          <ArrowRight size={16} weight="bold" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onToggleSave(listing.id)}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${listing.title} from saved` : `Save ${listing.title}`}
          className={`flex h-11 w-11 items-center justify-center rounded-xl border border-app ${
            saved ? "soft-accent" : "text-muted-app surface"
          }`}
        >
          <BookmarkSimple size={19} weight={saved ? "fill" : "bold"} aria-hidden="true" />
        </button>
        {voiceReader ? (
          <button
            type="button"
            onClick={() => speakText(`${listing.title}. ${listing.plainSummary}`)}
            aria-label={`Listen to ${listing.title}`}
            className="card-a11y text-app flex h-11 w-11 items-center justify-center rounded-xl"
          >
            <SpeakerHigh size={19} weight="bold" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </article>
  );
}

function MapPanel({
  listings,
  onSelect,
}: {
  listings: ResourceListing[];
  onSelect: (listing: ResourceListing) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="card-a11y relative aspect-4/3 w-full overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "linear-gradient(var(--app-border) 1px, transparent 1px), linear-gradient(90deg, var(--app-border) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            backgroundColor: "var(--app-surface-2)",
          }}
        />
        <p className="text-muted-app absolute left-3 top-2 z-10 text-[11px] font-extrabold uppercase tracking-wider">
          Neighborhood access map
        </p>
        {listings.map((listing) => (
          <button
            key={listing.id}
            type="button"
            onClick={() => onSelect(listing)}
            aria-label={`${listing.title} in ${listing.neighborhood}`}
            style={{ left: `${listing.mapX}%`, top: `${listing.mapY}%` }}
            className="absolute z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[var(--app-surface)] bg-[var(--app-accent)] text-white shadow-md"
          >
            <MapPin size={16} weight="fill" aria-hidden="true" />
          </button>
        ))}
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {listings.slice(0, 6).map((listing) => (
          <li key={listing.id}>
            <button
              type="button"
              onClick={() => onSelect(listing)}
              className="card-a11y flex w-full items-center gap-3 p-3 text-left"
            >
              <span className="soft-accent flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                <MapPin size={17} weight="bold" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="text-app block truncate text-sm font-bold">{listing.title}</span>
                <span className="text-muted-app block truncate text-xs">
                  {listing.neighborhood} · {listing.distanceMiles === 0 ? "Remote" : `${listing.distanceMiles} mi`} ·{" "}
                  {listing.isOpenNow ? "open now" : "by appointment"}
                </span>
              </span>
              <CaretDown size={16} weight="bold" aria-hidden="true" className="ml-auto -rotate-90 text-[var(--app-muted)]" />
            </button>
          </li>
        ))}
      </ul>

      <p className="text-muted-app flex items-start gap-2 text-xs">
        <CheckCircle size={15} weight="bold" aria-hidden="true" className="mt-0.5 shrink-0" />
        Distances are walking distances from the Riverside transit hub. Every pin has a step-free route on file
        where the accessibility tag says so.
        <Clock size={15} weight="bold" aria-hidden="true" className="mt-0.5 shrink-0" />
      </p>
    </div>
  );
}