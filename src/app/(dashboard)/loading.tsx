export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-7 w-48 rounded bg-[#141414]" />
      <div className="mt-2 h-4 w-56 rounded bg-[#0F0F0F]" />

      <div className="mt-8">
        <div className="h-3 w-24 rounded bg-[#0F0F0F]" />
        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="min-h-[100px] rounded-[10px] border border-[#141414] bg-[#0A0A0A] px-[18px] py-4"
            >
              <div className="flex items-center gap-1.5">
                <div className="h-[7px] w-[7px] rounded-full bg-[#141414]" />
                <div className="h-4 w-20 rounded bg-[#141414]" />
              </div>
              <div className="mt-2 h-4 w-14 rounded bg-[#0F0F0F]" />
              <div className="mt-2 h-3 w-24 rounded bg-[#0F0F0F]" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-[180px] rounded-[10px] border border-[#141414] bg-[#0A0A0A]"
          />
        ))}
      </div>
    </div>
  );
}
