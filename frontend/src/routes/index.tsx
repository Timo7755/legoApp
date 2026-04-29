import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import api from "../lib/axios";
import { useDebounce } from "../lib/useDebounce";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["sets", "search", debouncedSearch],
    queryFn: () =>
      api.get(`/sets/search?q=${debouncedSearch}`).then((r) => r.data),
    enabled: debouncedSearch.length >= 2,
  });

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

      <div className="max-w-xl mx-auto mb-10">
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

      {isLoading && <p className="text-center text-gray-500">Searching...</p>}

      {isError && (
        <p className="text-center text-red-500">
          Something went wrong. Try again.
        </p>
      )}

      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.results.map((set: any) => (
            <Link
              key={set.set_num}
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
                <p className="text-xs text-gray-400 mt-1">
                  {set.num_parts} parts
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
