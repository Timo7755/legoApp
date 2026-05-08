import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";

function SkeletonBox({ className }: { className?: string }) {
  return (
    <div
      className={`bg-gray-200 rounded-lg animate-pulse ${className ?? ""}`}
    />
  );
}

export function SetCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="aspect-square bg-gray-100 animate-pulse" />
      <div className="p-4 flex flex-col gap-2">
        <SkeletonBox className="h-4 w-3/4" />
        <SkeletonBox className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function SetDetailSkeleton() {
  return (
    <div className="flex gap-8 items-start">
      <div className="w-72 shrink-0">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
          <div className="aspect-square bg-gray-100 animate-pulse rounded-xl" />
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3">
          <SkeletonBox className="h-3 w-1/3" />
          <SkeletonBox className="h-5 w-full" />
          <SkeletonBox className="h-4 w-1/4" />
          <div className="grid grid-cols-2 gap-3 mt-2">
            <SkeletonBox className="h-16 rounded-xl" />
            <SkeletonBox className="h-16 rounded-xl" />
            <SkeletonBox className="h-16 rounded-xl col-span-2" />
          </div>
        </div>
      </div>
      <div className="flex-1">
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <SkeletonBox className="h-5 w-32" />
          </div>
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-3">
                <SkeletonBox className="w-12 h-12 shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <SkeletonBox className="h-4 w-2/3" />
                  <SkeletonBox className="h-3 w-1/3" />
                </div>
                <SkeletonBox className="h-4 w-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CollectionSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200 rounded-2xl p-4"
        >
          <div className="flex gap-3 mb-3">
            <SkeletonBox className="w-16 h-16 shrink-0 rounded-lg" />
            <div className="flex-1 flex flex-col gap-2">
              <SkeletonBox className="h-4 w-3/4" />
              <SkeletonBox className="h-3 w-1/2" />
              <SkeletonBox className="h-3 w-1/3" />
            </div>
          </div>
          <div className="flex gap-2">
            <SkeletonBox className="h-8 flex-1 rounded-lg" />
            <SkeletonBox className="h-8 flex-1 rounded-lg" />
            <SkeletonBox className="h-8 w-10 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
export function SetProgress({ setNum }: { setNum: string }) {
  const { data } = useQuery({
    queryKey: ["set-progress", setNum],
    queryFn: () => api.get(`/user-sets/${setNum}/progress`).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

  if (!data || data.total === 0) return null;

  return (
    <div className="px-4 py-2">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>
          {data.complete}/{data.total} parts
        </span>
        <span>{data.percent}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all ${
            data.percent === 100 ? "bg-green-400" : "bg-yellow-400"
          }`}
          style={{ width: `${data.percent}%` }}
        />
      </div>
    </div>
  );
}
