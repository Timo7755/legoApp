import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";
import { useDebounce } from "../lib/useDebounce";
import { SetCardSkeleton } from "../components/Skeleton";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) ?? "",
    theme_id: search.theme_id ? Number(search.theme_id) : null,
    theme_name: (search.theme_name as string) ?? "",
  }),
  component: HomePage,
});

const CAROUSEL_SETS = [
  {
    set_num: "75192-1",
    name: "Millennium Falcon",
    desc: "The most iconic Star Wars set ever made",
    theme: "Star Wars",
  },
  {
    set_num: "10307-1",
    name: "Eiffel Tower",
    desc: "10,001 pieces of Parisian elegance",
    theme: "Icons",
  },
  {
    set_num: "10294-1",
    name: "Titanic",
    desc: "The legendary ship in stunning detail",
    theme: "Icons",
  },
  {
    set_num: "10305-1",
    name: "Lion Knights' Castle",
    desc: "A medieval fortress to rule them all",
    theme: "Icons",
  },
  {
    set_num: "42158-1",
    name: "NASA Mars Rover Perseverance",
    desc: "Explore the red planet brick by brick",
    theme: "Technic",
  },
];

const RECENT_KEY = "legoapp_recent_searches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function addRecentSearch(query: string) {
  const recent = getRecentSearches().filter((q) => q !== query);
  recent.unshift(query);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

function SetCard({ set }: { set: any }) {
  const imgUrl = set.set_img_url ?? set.img_url;
  return (
    <Link
      to="/sets/$setNum"
      params={{ setNum: set.set_num }}
      className="bg-white rounded-2xl border border-gray-200 hover:border-yellow-400 hover:shadow-lg transition-all overflow-hidden group"
    >
      <div className="aspect-square bg-gray-50 p-4 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={set.name}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse" />
        )}
      </div>
      <div className="p-4">
        <p className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">
          {set.name}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {set.set_num} · {set.year}
          </p>
          {set.num_parts > 0 && (
            <p className="text-xs font-medium text-gray-500">
              {set.num_parts} parts
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

function Pagination({
  current,
  total,
  pageSize,
  onChange,
}: {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  const delta = 2;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= current - delta && i <= current + delta)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ←
      </button>

      {pages.map((page, i) =>
        page === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="px-2 py-2 text-sm text-gray-400"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onChange(page as number)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
              current === page
                ? "bg-yellow-400 text-gray-900"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        ),
      )}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === totalPages}
        className="px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        →
      </button>
    </div>
  );
}

function Carousel() {
  const [current, setCurrent] = useState(0);
  const [images, setImages] = useState<Record<string, string>>({});

  useEffect(() => {
    CAROUSEL_SETS.forEach((s) => {
      api
        .get(`/sets/${s.set_num}`)
        .then((r) => {
          setImages((prev) => ({ ...prev, [s.set_num]: r.data.img_url }));
        })
        .catch(() => {});
    });
  }, []);

  const prev = useCallback(
    () =>
      setCurrent((c) => (c - 1 + CAROUSEL_SETS.length) % CAROUSEL_SETS.length),
    [],
  );
  const next = useCallback(
    () => setCurrent((c) => (c + 1) % CAROUSEL_SETS.length),
    [],
  );

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const set = CAROUSEL_SETS[current];

  return (
    <div className="relative bg-gray-900 rounded-3xl overflow-hidden mb-12 h-80 flex items-center">
      {images[set.set_num] && (
        <div className="absolute inset-0">
          <img
            src={images[set.set_num]}
            alt={set.name}
            className="w-full h-full object-contain opacity-20 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent" />
        </div>
      )}

      <div className="relative z-10 flex items-center justify-between w-full px-10">
        <div className="max-w-md">
          <p className="text-yellow-400 text-xs font-medium uppercase tracking-widest mb-2">
            {set.theme}
          </p>
          <h2 className="text-3xl font-bold text-white mb-2">{set.name}</h2>
          <p className="text-gray-400 text-sm mb-6">{set.desc}</p>
          <Link
            to="/sets/$setNum"
            params={{ setNum: set.set_num }}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium px-6 py-2.5 rounded-xl text-sm inline-block transition-colors"
          >
            View set →
          </Link>
        </div>

        {images[set.set_num] && (
          <img
            src={images[set.set_num]}
            alt={set.name}
            className="h-56 w-56 object-contain hidden lg:block"
          />
        )}
      </div>

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors z-10"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors z-10"
      >
        ›
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {CAROUSEL_SETS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${
              i === current ? "bg-yellow-400 w-5" : "bg-white/40 w-2"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function BrowseSection({
  onThemeSelect,
  activeTheme,
  onSortSelect,
  activeSort,
}: {
  onThemeSelect: (id: number | null, name: string) => void;
  activeTheme: number | null;
  onSortSelect: (sort: string | null) => void;
  activeSort: string | null;
}) {
  const [themeSearch, setThemeSearch] = useState("");
  const debouncedThemeSearch = useDebounce(themeSearch, 300);

  const { data: featuredThemes } = useQuery({
    queryKey: ["themes", "featured"],
    queryFn: () => api.get("/themes/featured").then((r) => r.data),
    staleTime: Infinity,
  });

  const { data: searchedThemes } = useQuery({
    queryKey: ["themes", "search", debouncedThemeSearch],
    queryFn: () =>
      api.get(`/themes?q=${debouncedThemeSearch}`).then((r) => r.data),
    enabled: debouncedThemeSearch.length >= 2,
  });

  const isSearchingThemes = debouncedThemeSearch.length >= 2;

  return (
    <div className="mb-10">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Browse by theme</h2>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() =>
            onSortSelect(activeSort === "newest" ? null : "newest")
          }
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
            activeSort === "newest"
              ? "bg-gray-900 text-white"
              : "bg-white border border-gray-200 text-gray-700 hover:border-gray-400"
          }`}
        >
          🆕 Newest
        </button>
        <button
          onClick={() =>
            onSortSelect(activeSort === "largest" ? null : "largest")
          }
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
            activeSort === "largest"
              ? "bg-gray-900 text-white"
              : "bg-white border border-gray-200 text-gray-700 hover:border-gray-400"
          }`}
        >
          🏆 Largest
        </button>
      </div>

      {/* Featured theme cards with images */}
      {!isSearchingThemes && featuredThemes && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
          {featuredThemes.map((t: any) => (
            <button
              key={t.id}
              onClick={() =>
                onThemeSelect(activeTheme === t.id ? null : t.id, t.name)
              }
              className={`relative rounded-2xl overflow-hidden aspect-square flex items-end transition-all cursor-pointer ${
                activeTheme === t.id
                  ? "ring-2 ring-yellow-400"
                  : "hover:ring-2 hover:ring-yellow-400"
              }`}
            >
              {t.img_url ? (
                <img
                  src={t.img_url}
                  alt={t.name}
                  className="absolute inset-0 w-full h-full object-contain bg-gray-100 p-2"
                />
              ) : (
                <div className="absolute inset-0 bg-gray-100" />
              )}
              <div className="relative w-full bg-gradient-to-t from-gray-900/80 to-transparent p-3">
                <p className="text-white text-xs font-semibold text-left leading-tight">
                  {t.name}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Text chips when searching themes */}
      {isSearchingThemes && searchedThemes && (
        <div className="flex flex-wrap gap-2 mb-4">
          {searchedThemes.map((t: any) => (
            <button
              key={t.id}
              onClick={() =>
                onThemeSelect(activeTheme === t.id ? null : t.id, t.name)
              }
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                activeTheme === t.id
                  ? "bg-yellow-400 text-gray-900"
                  : "bg-white border border-gray-200 text-gray-700 hover:border-yellow-400"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      <input
        type="text"
        value={themeSearch}
        onChange={(e) => setThemeSearch(e.target.value)}
        placeholder="Search all themes... e.g. Ninjago, Avatar, Technic"
        className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 w-72"
      />
    </div>
  );
}

function HomePage() {
  const { q, theme_id, theme_name } = Route.useSearch();
  const navigate = useNavigate();
  const search = q;
  const [recentSearches, setRecentSearches] =
    useState<string[]>(getRecentSearches());
  const [activeSort, setActiveSort] = useState<string | null>(null);
  const [searchPage, setSearchPage] = useState(1);
  const [browsePage, setBrowsePage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);
  const [activeTheme, setActiveTheme] = useState<number | null>(theme_id);
  const [activeThemeName, setActiveThemeName] = useState(theme_name);
  const isSearching = debouncedSearch.length >= 2;
  const isBrowsing =
    !isSearching && (activeTheme !== null || activeSort !== null);
  const showHome = !isSearching && !isBrowsing;

  useEffect(() => {
    setSearchPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    setBrowsePage(1);
  }, [activeTheme, activeSort]);

  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ["sets", "search", debouncedSearch, searchPage],
    queryFn: () => {
      if (searchPage === 1) {
        addRecentSearch(debouncedSearch);
        setRecentSearches(getRecentSearches());
      }
      return api
        .get(`/sets/search?q=${debouncedSearch}&page=${searchPage}`)
        .then((r) => r.data);
    },
    enabled: isSearching,
  });

  const { data: themeSearchData } = useQuery({
    queryKey: ["themes", "search", debouncedSearch],
    queryFn: () => api.get(`/themes?q=${debouncedSearch}`).then((r) => r.data),
    enabled: isSearching,
  });

  const { data: themeSetResults } = useQuery({
    queryKey: ["sets", "by-themes", themeSearchData?.map((t: any) => t.id)],
    queryFn: async () => {
      const results = await Promise.all(
        themeSearchData.map((t: any) =>
          api
            .get(`/sets/search?theme_id=${t.id}&sort=newest`)
            .then((r) => r.data.results ?? []),
        ),
      );
      return results.flat();
    },
    enabled: isSearching && !!themeSearchData && themeSearchData.length > 0,
  });

  const { data: browseData, isLoading: browseLoading } = useQuery({
    queryKey: ["sets", "browse", activeTheme, activeSort, browsePage],
    queryFn: () => {
      const params = new URLSearchParams();
      if (activeTheme) {
        params.set("theme_id", String(activeTheme));
        params.set("sort", "newest");
      }
      if (activeSort) params.set("sort", activeSort);
      params.set("page", String(browsePage));
      return api.get(`/sets/search?${params}`).then((r) => r.data);
    },
    enabled: isBrowsing,
  });

  const { data: featuredSets } = useQuery({
    queryKey: ["featured-sets"],
    queryFn: async () => {
      const nums = [
        "75192-1",
        "10307-1",
        "10294-1",
        "10305-1",
        "42158-1",
        "21325-1",
      ];
      const responses = await Promise.all(
        nums.map((n) => api.get(`/sets/${n}`).then((r) => r.data)),
      );
      return responses;
    },
    staleTime: Infinity,
  });

  const handleThemeSelect = (id: number | null, name: string) => {
    setActiveTheme(id);
    setActiveThemeName(name);
    setActiveSort(null);
    navigate({
      to: "/",
      search: { q: "", theme_id: id, theme_name: name },
      replace: true,
    });
  };

  const handleSortSelect = (sort: string | null) => {
    setActiveSort(sort);
    setActiveTheme(null);
  };
  const mergedSearchResults = (() => {
    if (!isSearching) return [];
    if (searchPage > 1) {
      return searchData?.results ?? [];
    }
    const themeResults = (themeSetResults ?? []).filter(
      (s: any) => s.num_parts > 0,
    );
    const seen = new Set<string>();
    const merged: any[] = [];
    for (const s of [...themeResults, ...(searchData?.results ?? [])]) {
      if (!seen.has(s.set_num)) {
        seen.add(s.set_num);
        merged.push(s);
      }
    }
    return merged;
  })();

  const browseResults = browseData?.results?.filter(
    (s: any) => s.num_parts > 0,
  );

  return (
    <div>
      {showHome && <Carousel />}

      {showHome && recentSearches.length > 0 && (
        <div className="max-w-xl mx-auto mb-8">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            Recent searches
          </p>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((q) => (
              <button
                key={q}
                onClick={() =>
                  navigate({
                    to: "/",
                    search: { q, theme_id: null, theme_name: "" },
                    replace: true,
                  })
                }
                className="text-sm bg-white border border-gray-200 hover:border-yellow-400 text-gray-600 px-3 py-1.5 rounded-lg transition-colors"
              >
                {q}
              </button>
            ))}
            <button
              onClick={() => {
                localStorage.removeItem(RECENT_KEY);
                setRecentSearches([]);
                navigate({
                  to: "/",
                  search: { q: "", theme_id: null, theme_name: "" },
                  replace: true,
                });
              }}
              className="text-xs text-gray-300 hover:text-gray-500 px-2 py-1.5"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {showHome && (
        <BrowseSection
          onThemeSelect={handleThemeSelect}
          activeTheme={activeTheme}
          onSortSelect={handleSortSelect}
          activeSort={activeSort}
        />
      )}

      {isBrowsing && (
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
            {browseLoading
              ? "Loading..."
              : `${browseData?.count ?? 0} sets${
                  activeThemeName ? ` in ${activeThemeName}` : ""
                }`}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {browseResults?.map((set: any) => (
              <SetCard key={set.set_num} set={set} />
            ))}
          </div>
          <Pagination
            current={browsePage}
            total={browseData?.count ?? 0}
            pageSize={20}
            onChange={(page) => {
              setBrowsePage(page);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      )}

      {isSearching && (
        <div>
          {searchLoading && (
            <p className="text-center text-gray-500">Searching...</p>
          )}

          {themeSearchData && themeSearchData.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <p className="text-xs text-gray-400">Browse full theme:</p>
              {themeSearchData.map((t: any) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTheme(t.id);
                    setActiveThemeName(t.name);
                    navigate({
                      to: "/",
                      search: { q: "", theme_id: t.id, theme_name: t.name },
                      replace: true,
                    });
                  }}
                  className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                  {t.name} →
                </button>
              ))}
            </div>
          )}

          {mergedSearchResults.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                {searchData?.count ?? mergedSearchResults.length} results for "
                {debouncedSearch}"
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {mergedSearchResults.map((set: any) => (
                  <SetCard key={set.set_num} set={set} />
                ))}
              </div>
              <Pagination
                current={searchPage}
                total={searchData?.count ?? 0}
                pageSize={20}
                onChange={(page) => {
                  setSearchPage(page);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          )}

          {!searchLoading && mergedSearchResults.length === 0 && (
            <p className="text-center text-gray-400 py-12">
              No results found for "{debouncedSearch}"
            </p>
          )}
        </div>
      )}

      {showHome && !featuredSets && (
        <div className="mt-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Featured sets
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SetCardSkeleton key={i} />
            ))}
          </div>
        </div>
      )}

      {showHome && featuredSets && (
        <div className="mt-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Featured sets
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {featuredSets.map((set: any) => (
              <SetCard key={set.set_num} set={set} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
