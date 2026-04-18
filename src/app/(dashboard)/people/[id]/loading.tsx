import { DetailHeaderSkeleton } from "@/components/skeletons";

export default function PersonDetailLoading() {
  return (
    <div>
      <DetailHeaderSkeleton />
      <div className="mt-8 space-y-10">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <div className="relative h-3 w-20 overflow-hidden rounded bg-[#141414] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.03] before:to-transparent" />
            <div className="mt-3 space-y-2">
              <div className="relative h-12 overflow-hidden rounded-xl border border-[#141414] bg-[#0F0F0F] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.03] before:to-transparent" />
              <div className="relative h-12 overflow-hidden rounded-xl border border-[#141414] bg-[#0F0F0F] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.03] before:to-transparent" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
