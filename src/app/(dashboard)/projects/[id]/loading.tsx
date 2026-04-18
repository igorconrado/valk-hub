import { DetailHeaderSkeleton } from "@/components/skeletons";

const shimmerClass =
  "relative overflow-hidden rounded bg-[#141414] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.03] before:to-transparent";

export default function ProjectDetailLoading() {
  return (
    <div>
      <DetailHeaderSkeleton />
      <div className="mt-7 h-px bg-[#141414]" />
      <div className="mt-5 flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`${shimmerClass} h-8 w-20 rounded-lg`} />
        ))}
      </div>
      <div className="mt-8 flex flex-col items-center py-12">
        <div className={`${shimmerClass} h-7 w-7`} />
        <div className={`${shimmerClass} mt-3 h-4 w-40`} />
      </div>
    </div>
  );
}
