import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api from "../../lib/axios";

export const Route = createFileRoute("/sets/$setNum")({
  component: SetDetailPage,
});

function SetDetailPage() {
  const { setNum } = Route.useParams();
  const [partSearch, setPartSearch] = useState("");
  const [modalImg, setModalImg] = useState<string | null>(null);

  const { data: set, isLoading: setLoading } = useQuery({
    queryKey: ["set", setNum],
    queryFn: () => api.get(`/sets/${setNum}`).then((r) => r.data),
  });

  const { data: parts, isLoading: partsLoading } = useQuery({
    queryKey: ["set", setNum, "parts"],
    queryFn: () => api.get(`/sets/${setNum}/parts`).then((r) => r.data),
  });

  const filteredParts = parts?.filter((item: any) => {
    const search = partSearch.toLowerCase();
    return (
      item.part?.name?.toLowerCase().includes(search) ||
      item.part_num?.toLowerCase().includes(search) ||
      item.color?.name?.toLowerCase().includes(search)
    );
  });

  if (setLoading)
    return <p className="text-center text-gray-500 mt-20">Loading set...</p>;

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
                className="w-full object-contain rounded-xl"
              />
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">
              Click to enlarge
            </p>
          </div>
        )}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
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
      </div>

      {/* Right column */}
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
            <h2 className="font-semibold text-gray-900 shrink-0">
              Parts list
              {parts && (
                <span className="ml-2 text-sm font-normal text-gray-400">
                  {filteredParts?.length ?? 0} items
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

          {partsLoading && (
            <p className="text-center text-gray-500 py-12">
              Loading parts — this may take a moment on first load.
            </p>
          )}

          {filteredParts && filteredParts.length === 0 && !partsLoading && (
            <p className="text-center text-gray-400 py-12 text-sm">
              No parts match your search.
            </p>
          )}

          {filteredParts && (
            <div className="divide-y divide-gray-50">
              {filteredParts.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors"
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

                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900">
                      ×{item.quantity}
                    </p>
                    {item.is_spare && (
                      <p className="text-xs text-gray-400">spare</p>
                    )}
                  </div>

                  <a
                    href={`https://www.bricklink.com/v2/catalog/catalogitem.page?P=${item.part_num}&idColor=${item.color?.bricklink_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:text-blue-700 whitespace-nowrap shrink-0"
                  >
                    Buy →
                  </a>
                </div>
              ))}
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
