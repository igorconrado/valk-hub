const shimmerClass =
  "relative overflow-hidden rounded bg-[#141414] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.03] before:to-transparent";

export default function DashboardLoading() {
  return (
    <div>
      <div className={`${shimmerClass} h-7 w-48`} />
      <div className={`${shimmerClass} mt-2 h-4 w-56`} />

      <div className="mt-8">
        <div className={`${shimmerClass} h-3 w-24`} />
        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="min-h-[100px] rounded-[10px] border border-[#141414] bg-[#0F0F0F] px-[18px] py-4"
            >
              <div className={`${shimmerClass} h-4 w-20`} />
              <div className={`${shimmerClass} mt-2 h-4 w-14`} />
              <div className={`${shimmerClass} mt-2 h-3 w-24`} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={`${shimmerClass} h-[180px] rounded-[10px] border border-[#141414]`}
          />
        ))}
      </div>
    </div>
  );
}
