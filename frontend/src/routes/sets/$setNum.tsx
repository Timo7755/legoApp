import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "../../lib/axios";
import { SetDetailSkeleton } from "../../components/Skeleton";

export const Route = createFileRoute("/sets/$setNum")({
  component: SetDetailPage,
});

type OwnedMap = Record<string, { quantity_owned: number }>;
type FilterType = "all" | "missing" | "complete";

function SetDetailPage() {
  const { setNum } = Route.useParams();
  const queryClient = useQueryClient();
  const [partSearch, setPartSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [modalImg, setModalImg] = useState<string | null>(null);
  const isLoggedIn = !!localStorage.getItem("token");

  const { data: set, isLoading: setLoading } = useQuery({
    queryKey: ["set", setNum],
    queryFn: () => api.get(`/sets/${setNum}`).then((r) => r.data),
  });

  const { data: parts, isLoading: partsLoading } = useQuery({
    queryKey: ["set", setNum, "parts"],
    queryFn: () => api.get(`/sets/${setNum}/parts`).then((r) => r.data),
  });

  const { data: ownedMap } = useQuery<OwnedMap>({
    queryKey: ["user-parts", setNum],
    queryFn: () => api.get(`/user-parts/${setNum}`).then((r) => r.data),
    enabled: isLoggedIn,
  });

  const upsertMutation = useMutation({
    mutationFn: (data: {
      part_num: string;
      color_id: number;
      quantity_owned: number;
    }) => api.post("/user-parts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-parts", setNum] });
    },
  });

  const getOwned = (partNum: string, colorId: number) => {
    const key = `${partNum}_${colorId}`;
    return ownedMap?.[key]?.quantity_owned ?? 0;
  };

  const getStatus = (owned: number, needed: number) => {
    if (owned === 0) return "none";
    if (owned >= needed) return "complete";
    return "partial";
  };

  const filteredParts = parts?.filter((item: any) => {
    const search = partSearch.toLowerCase();
    const matchesSearch =
      item.part?.name?.toLowerCase().includes(search) ||
      item.part_num?.toLowerCase().includes(search) ||
      item.color?.name?.toLowerCase().includes(search);

    if (!matchesSearch) return false;

    if (filter === "all") return true;
    const owned = getOwned(item.part_num, item.color_id);
    if (filter === "missing") return owned < item.quantity;
    if (filter === "complete") return owned >= item.quantity;
    return true;
  });

  const stats = parts
    ? {
        total: parts.length,
        complete: parts.filter(
          (item: any) =>
            getOwned(item.part_num, item.color_id) >= item.quantity,
        ).length,
        missing: parts.filter(
          (item: any) => getOwned(item.part_num, item.color_id) < item.quantity,
        ).length,
      }
    : null;

  if (setLoading) return <SetDetailSkeleton />;

  if (!set)
    return <p className="text-center text-red-500 mt-20">Set not found.</p>;

  const totalParts =
    parts?.reduce((sum: number, item: any) => sum + item.quantity, 0) ?? 0;
  const spareParts = parts?.filter((item: any) => item.is_spare).length ?? 0;

  return (
    <div className="flex gap-8 items-start">
      {/* Left column */}
      <div className="w-72 shrink-0 sticky top-8">
        {set.img_url && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
            <button
              onClick={() => setModalImg(set.img_url)}
              className="w-full hover:ring-2 hover:ring-yellow-400 rounded-xl transition-all"
            >
              <img
                src={set.img_url}
                alt={set.name}
                title={set.name}
                className="w-full object-contain rounded-xl cursor-pointer"
              />
            </button>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
          <p className="text-xs text-gray-400 mb-1">{set.set_num}</p>
          <h1 className="text-xl font-bold text-gray-900 mb-1 leading-tight">
            {set.name}
          </h1>
          <p className="text-sm text-gray-500 mb-4">{set.year}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-gray-900">
                {set.num_parts}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">unique parts</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-gray-900">{totalParts}</p>
              <p className="text-xs text-gray-400 mt-0.5">total pieces</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 col-span-2">
              <p className="text-2xl font-bold text-gray-900">{spareParts}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                spare parts included
              </p>
            </div>
          </div>
        </div>

        {isLoggedIn && stats && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-sm font-semibold text-gray-900 mb-3">
              Your progress
            </p>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
              <div
                className="bg-green-400 h-2 rounded-full transition-all"
                style={{ width: `${(stats.complete / stats.total) * 100}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xl font-bold text-green-700">
                  {stats.complete}
                </p>
                <p className="text-xs text-green-600 mt-0.5">complete</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3">
                <p className="text-xl font-bold text-red-700">
                  {stats.missing}
                </p>
                <p className="text-xs text-red-600 mt-0.5">missing</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right column */}
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between gap-4 mb-3">
              <h2 className="font-semibold text-gray-900 shrink-0">
                Parts list
                {filteredParts && (
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    {filteredParts.length} items
                  </span>
                )}
              </h2>
              <input
                type="text"
                value={partSearch}
                onChange={(e) => setPartSearch(e.target.value)}
                placeholder="Search parts..."
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 w-48"
              />
            </div>

            <div className="flex gap-2">
              {(["all", "missing", "complete"] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-colors ${
                    filter === f
                      ? "bg-yellow-400 text-gray-900"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {partsLoading && (
            <p className="text-center text-gray-500 py-12">
              Loading parts — this may take a moment on first load.
            </p>
          )}

          {filteredParts?.length === 0 && !partsLoading && (
            <p className="text-center text-gray-400 py-12 text-sm">
              No parts match your search.
            </p>
          )}

          {filteredParts && (
            <div className="divide-y divide-gray-50 overflow-y-auto max-h-[calc(100vh-280px)]">
              {filteredParts.map((item: any) => {
                const owned = getOwned(item.part_num, item.color_id);
                const status = getStatus(owned, item.quantity);

                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors ${
                      status === "complete" ? "opacity-60" : ""
                    }`}
                  >
                    <button
                      onClick={() =>
                        item.part?.img_url && setModalImg(item.part.img_url)
                      }
                      className="shrink-0 w-12 h-12 bg-gray-50 rounded-lg overflow-hidden hover:ring-2 hover:ring-yellow-400 transition-all"
                    >
                      {item.part?.img_url ? (
                        <img
                          src={item.part.img_url}
                          alt={item.part.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded-lg" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.part?.name ?? "Unknown part"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {item.part_num}
                        <span className="mx-1">·</span>
                        <span
                          className="inline-block w-2 h-2 rounded-full mr-1 align-middle"
                          style={{
                            backgroundColor: item.color?.rgb
                              ? `#${item.color.rgb}`
                              : "#ccc",
                          }}
                        />
                        {item.color?.name ?? "Unknown color"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {isLoggedIn && (
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              status === "complete"
                                ? "bg-green-400"
                                : status === "partial"
                                  ? "bg-yellow-400"
                                  : "bg-gray-200"
                            }`}
                          />
                          <input
                            type="number"
                            min={0}
                            defaultValue={owned}
                            key={`${item.part_num}_${item.color_id}_${owned}`}
                            onBlur={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              if (val !== owned) {
                                upsertMutation.mutate({
                                  part_num: item.part_num,
                                  color_id: item.color_id,
                                  quantity_owned: val,
                                });
                              }
                            }}
                            className="w-14 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          />
                          <span className="text-xs text-gray-400">
                            / {item.quantity}
                          </span>
                        </div>
                      )}

                      <div className="text-right">
                        {item.is_spare && (
                          <p className="text-xs text-gray-400">spare</p>
                        )}
                      </div>

                      <a
                        href={`https://www.bricklink.com/v2/catalog/catalogitem.page?P=${item.part_num}&idColor=${item.color?.bricklink_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:text-blue-700 whitespace-nowrap"
                      >
                        Buy →
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Image modal */}
      {modalImg && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-8"
          onClick={() => setModalImg(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={modalImg}
              alt="Part"
              className="w-full object-contain rounded-xl"
            />
            <button
              onClick={() => setModalImg(null)}
              className="mt-4 w-full text-sm text-gray-500 hover:text-gray-900"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
