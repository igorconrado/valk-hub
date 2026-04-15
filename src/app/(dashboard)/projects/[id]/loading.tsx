export default function ProjectDetailLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-5 h-3 w-32 rounded bg-[#141414]" />
      <div className="h-7 w-48 rounded bg-[#141414]" />
      <div className="mt-3 flex gap-2">
        <div className="h-5 w-16 rounded bg-[#141414]" />
        <div className="h-5 w-10 rounded bg-[#141414]" />
        <div className="h-5 w-24 rounded bg-[#141414]" />
      </div>
      <div className="mt-7 h-px bg-[#141414]" />
      <div className="mt-12 flex flex-col items-center">
        <div className="h-7 w-7 rounded bg-[#141414]" />
        <div className="mt-3 h-4 w-40 rounded bg-[#141414]" />
      </div>
    </div>
  );
}
