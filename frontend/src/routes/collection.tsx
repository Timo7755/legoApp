import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "../lib/axios";

export const Route = createFileRoute("/collection")({
  beforeLoad: () => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw redirect({ to: "/login" });
    }
  },
  component: CollectionPage,
});

function CollectionPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [addingSet, setAddingSet] = useState("");
  const [addError, setAddError] = useState("");

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

      {isLoading && (
        <p className="text-center text-gray-500 py-12">
          Loading your collection...
        </p>
      )}

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
            className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-yellow-400 transition-all"
          >
            <div className="flex gap-3 mb-3">
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
            </div>

            <div className="flex gap-2">
              <Link
                to="/sets/$setNum"
                params={{ setNum: us.set_num }}
                className="flex-1 text-center bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium py-2 rounded-lg transition-colors"
              >
                View parts
              </Link>
              <button
                onClick={() => removeMutation.mutate(us.id)}
                disabled={removeMutation.isPending}
                className="text-xs text-red-400 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
