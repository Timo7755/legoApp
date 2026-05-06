import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";
import { useDebounce } from "../lib/useDebounce";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const FEATURED_SETS = [
  {
    set_num: "75192-1",
    name: "Millennium Falcon",
    year: 2017,
    num_parts: 7541,
    set_img_url: "https://cdn.rebrickable.com/media/sets/75192-1/30881.jpg",
  },
  {
    set_num: "10294-1",
    name: "Titanic",
    year: 2021,
    num_parts: 9090,
    set_img_url: "https://cdn.rebrickable.com/media/sets/10294-1/105073.jpg",
  },
  {
    set_num: "42158-1",
    name: "NASA Mars Rover Perseverance",
    year: 2023,
    num_parts: 1132,
    set_img_url: "https://cdn.rebrickable.com/media/sets/42158-1/130948.jpg",
  },
  {
    set_num: "10305-1",
    name: "Lion Knights' Castle",
    year: 2022,
    num_parts: 4514,
    set_img_url: "https://cdn.rebrickable.com/media/sets/10305-1/117580.jpg",
  },
  {
    set_num: "21325-1",
    name: "Medieval Blacksmith",
    year: 2021,
    num_parts: 2164,
    set_img_url: "https://cdn.rebrickable.com/media/sets/21325-1/108734.jpg",
  },
  {
    set_num: "10307-1",
    name: "Eiffel Tower",
    year: 2022,
    num_parts: 10001,
    set_img_url: "https://cdn.rebrickable.com/media/sets/10307-1/121461.jpg",
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
  return (
    <Link
      to="/sets/$setNum"
      params={{ setNum: set.set_num }}
      className="bg-white rounded-xl border border-gray-200 hover:border-yellow-400 hover:shadow-md transition-all p-4 flex gap-4"
    >
      {set.set_img_url && (
        <img
          src={set.set_img_url}
          alt={set.name}
          className="w-20 h-20 object-contain rounded-lg bg-gray-50"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm leading-tight mb-1 truncate">
          {set.name}
        </p>
        <p className="text-xs text-gray-500">{set.set_num}</p>
        <p className="text-xs text-gray-500">{set.year}</p>
        <p className="text-xs text-gray-400 mt-1">{set.num_parts} parts</p>
      </div>
    </Link>
  );
}

function HomePage() {
  const [search, setSearch] = useState("");
  const [recentSearches, setRecentSearches] =
    useState<string[]>(getRecentSearches());
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["sets", "search", debouncedSearch],
    queryFn: () => {
      addRecentSearch(debouncedSearch);
      setRecentSearches(getRecentSearches());
      return api.get(`/sets/search?q=${debouncedSearch}`).then((r) => r.data);
    },
    enabled: debouncedSearch.length >= 2,
  });

  const showResults = debouncedSearch.length >= 2;
  const showEmpty = !showResults;

  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Find your LEGO set
        </h1>
        <p className="text-gray-500">
          Search any set, track your parts, find what you're missing
        </p>
      </div>

      <div className="max-w-xl mx-auto mb-8">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sets... e.g. Millennium Falcon"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        {search.length > 0 && search.length < 2 && (
          <p className="text-xs text-gray-400 mt-1 ml-1">Keep typing...</p>
        )}
      </div>

      {/* Recent searches */}
      {showEmpty && recentSearches.length > 0 && (
        <div className="max-w-xl mx-auto mb-8">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            Recent searches
          </p>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((q) => (
              <button
                key={q}
                onClick={() => setSearch(q)}
                className="text-sm bg-white border border-gray-200 hover:border-yellow-400 text-gray-600 px-3 py-1.5 rounded-lg transition-colors"
              >
                {q}
              </button>
            ))}
            <button
              onClick={() => {
                localStorage.removeItem(RECENT_KEY);
                setRecentSearches([]);
              }}
              className="text-xs text-gray-300 hover:text-gray-500 px-2 py-1.5"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Featured sets */}
      {showEmpty && (
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
            {recentSearches.length > 0
              ? "Featured sets"
              : "Popular sets to get started"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURED_SETS.map((set) => (
              <SetCard key={set.set_num} set={set} />
            ))}
          </div>
        </div>
      )}

      {/* Search results */}
      {showResults && (
        <div>
          {isLoading && (
            <p className="text-center text-gray-500">Searching...</p>
          )}
          {isError && (
            <p className="text-center text-red-500">
              Something went wrong. Try again.
            </p>
          )}
          {data && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                {data.count} results for "{debouncedSearch}"
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.results.map((set: any) => (
                  <SetCard key={set.set_num} set={set} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
