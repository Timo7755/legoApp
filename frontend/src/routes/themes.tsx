import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api from "../lib/axios";
import { useDebounce } from "../lib/useDebounce";

export const Route = createFileRoute("/themes")({
  component: ThemesPage,
});

function ThemesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data: themes, isLoading } = useQuery({
    queryKey: ["themes", "all", debouncedSearch],
    queryFn: () => api.get(`/themes?q=${debouncedSearch}`).then((r) => r.data),
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Themes</h1>
        <p className="text-gray-500 text-sm">Browse all LEGO themes</p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter themes..."
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 w-72"
        />
      </div>

      {isLoading && (
        <p className="text-center text-gray-500 py-12">Loading themes...</p>
      )}

      {themes && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {themes.map((t: any) => (
            <button
              key={t.id}
              onClick={() =>
                navigate({
                  to: "/",
                  search: { q: "", theme_id: t.id, theme_name: t.name },
                })
              }
              className="bg-white border border-gray-200 hover:border-yellow-400 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition-colors"
            >
              {t.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
