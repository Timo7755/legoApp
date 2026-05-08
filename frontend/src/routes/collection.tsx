import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "../lib/axios";
import { CollectionSkeleton } from "../components/Skeleton";

export const Route = createFileRoute("/collection")({
  beforeLoad: () => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw redirect({ to: "/login" });
    }
  },
  component: CollectionPage,
});

function MissingPartsModal({
  setNum,
  setName,
  onClose,
}: {
  setNum: string;
  setName: string;
  onClose: () => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["missing", setNum],
    queryFn: () => api.get(`/user-sets/${setNum}/missing`).then((r) => r.data),
  });

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">{setName}</h2>
            <p className="text-sm text-gray-400">
              {isLoading
                ? "Loading..."
                : `${data?.missing_count ?? 0} parts still needed`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {isLoading && (
            <p className="text-center text-gray-500 py-12">
              Loading missing parts...
            </p>
          )}

          {data?.results?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-green-600 font-medium">
                You have all parts for this set!
              </p>
            </div>
          )}

          {data?.results && data.results.length > 0 && (
            <div className="divide-y divide-gray-50">
              {data.results.map((item: any) => (
                <div
                  key={`${item.part_num}_${item.color}`}
                  className="flex items-center gap-4 px-6 py-3"
                >
                  {item.img_url && (
                    <img
                      src={item.img_url}
                      alt={item.name}
                      className="w-10 h-10 object-contain rounded bg-gray-50 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.part_num}
                      <span className="mx-1">·</span>
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-1 align-middle"
                        style={{
                          backgroundColor: item.color_rgb
                            ? `#${item.color_rgb}`
                            : "#ccc",
                        }}
                      />
                      {item.color}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-gray-900">
                      {item.quantity_owned} / {item.quantity_needed}
                    </p>
                    <p className="text-xs text-red-400">
                      need {item.still_needed} more
                    </p>
                  </div>
                  <a
                    href={item.bricklink_url}
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
    </div>
  );
}

function CollectionPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [addingSet, setAddingSet] = useState("");
  const [addError, setAddError] = useState("");
  const [missingModal, setMissingModal] = useState<{
    setNum: string;
    setName: string;
  } | null>(null);

  const { data: userSets, isLoading } = useQuery({
    queryKey: ["user-sets"],
    queryFn: () => api.get("/user-sets").then((r) => r.data),
  });

  const addMutation = useMutation({
    mutationFn: (setNum: string) => api.post("/user-sets", { set_num: setNum }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-sets"] });
      setAddingSet("");
      setAddError("");
    },
    onError: (err: any) => {
      setAddError(err.response?.data?.message ?? "Could not add set");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/user-sets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-sets"] });
    },
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingSet.trim()) return;
    addMutation.mutate(addingSet.trim());
  };

  const filteredSets = userSets?.filter(
    (us: any) =>
      us.set?.name?.toLowerCase().includes(search.toLowerCase()) ||
      us.set_num?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Collection</h1>
          <p className="text-gray-500 text-sm mt-1">
            {userSets?.length ?? 0} sets tracked
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Add a set</h2>
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            value={addingSet}
            onChange={(e) => setAddingSet(e.target.value)}
            placeholder="Enter set number e.g. 75192-1"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <button
            type="submit"
            disabled={addMutation.isPending}
            className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-gray-900 font-medium px-6 py-2 rounded-lg text-sm"
          >
            {addMutation.isPending ? "Adding..." : "Add"}
          </button>
        </form>
        {addError && <p className="text-red-500 text-sm mt-2">{addError}</p>}
        <p className="text-xs text-gray-400 mt-2">
          Tip: find the set number by searching on the home page first.
        </p>
      </div>

      {userSets?.length > 0 && (
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter your sets..."
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 w-64"
          />
        </div>
      )}

      {isLoading && <CollectionSkeleton />}

      {filteredSets?.length === 0 && !isLoading && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium mb-1">No sets yet</p>
          <p className="text-sm">Add a set number above to start tracking</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSets?.map((us: any) => (
          <div
            key={us.id}
            className="bg-white border border-gray-200 rounded-2xl hover:border-yellow-400 transition-all overflow-hidden"
          >
            <Link
              to="/sets/$setNum"
              params={{ setNum: us.set_num }}
              className="flex gap-3 p-4 transition-colors"
            >
              {us.set?.img_url && (
                <img
                  src={us.set.img_url}
                  alt={us.set.name}
                  className="w-16 h-16 object-contain rounded-lg bg-gray-50"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm leading-tight truncate">
                  {us.set?.name ?? us.set_num}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{us.set_num}</p>
                <p className="text-xs text-gray-400">{us.set?.year}</p>
                <p className="text-xs text-gray-400">
                  {us.set?.num_parts} parts
                </p>
              </div>
            </Link>

            <div className="flex gap-2 px-4 pb-4">
              <button
                onClick={() =>
                  setMissingModal({
                    setNum: us.set_num,
                    setName: us.set?.name ?? us.set_num,
                  })
                }
                className="flex-1 text-center bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium py-2 rounded-lg transition-colors cursor-pointer"
              >
                Missing parts
              </button>
              <button
                onClick={() => removeMutation.mutate(us.id)}
                disabled={removeMutation.isPending}
                className="text-xs text-gray-400 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {missingModal && (
        <MissingPartsModal
          setNum={missingModal.setNum}
          setName={missingModal.setName}
          onClose={() => setMissingModal(null)}
        />
      )}
    </div>
  );
}
