/**
 * Shared skeleton components with shimmer animation.
 * Shimmer: gradient sweep left→right, 1.5s infinite.
 */

const shimmer =
  "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.03] before:to-transparent";

function Bone({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded bg-[#141414] ${shimmer} ${className ?? ""}`}
      style={style}
    />
  );
}

// ── Project ────────────────────────────────────────────

export function ProjectCardSkeleton() {
  return (
    <div className="flex gap-3.5 rounded-xl border border-[#141414] bg-[#0F0F0F] p-5">
      <Bone className="h-10 w-10 shrink-0 rounded-lg" />
      <div className="flex-1">
        <Bone className="h-4 w-32" />
        <div className="mt-2.5 flex gap-1.5">
          <Bone className="h-5 w-16" />
          <Bone className="h-5 w-10" />
        </div>
        <div className="mt-3.5 flex items-center gap-1.5">
          <Bone className="h-5 w-5 rounded-full" />
          <Bone className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

// ── Task ───────────────────────────────────────────────

export function TaskRowSkeleton() {
  return (
    <div className="flex items-center gap-3 border-b border-[#0F0F0F] px-1 py-3">
      <Bone className="h-4 w-4 rounded" />
      <Bone className="h-[7px] w-[7px] rounded-full" />
      <Bone className="h-4 flex-1" />
      <Bone className="h-4 w-[56px]" />
      <Bone className="h-4 w-[100px]" />
      <Bone className="h-5 w-5 rounded-full" />
      <Bone className="h-3 w-[60px]" />
      <Bone className="h-5 w-[72px] rounded-full" />
    </div>
  );
}

// ── Document ───────────────────────────────────────────

export function DocumentRowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-[#0F0F0F] py-3.5">
      <Bone className="h-9 w-9 rounded-lg" />
      <div className="flex-1">
        <Bone className="h-4 w-48" />
        <Bone className="mt-1.5 h-3 w-32" />
      </div>
      <Bone className="h-3 w-8" />
    </div>
  );
}

// ── Meeting ────────────────────────────────────────────

export function MeetingCardSkeleton() {
  return (
    <div className="rounded-xl border border-[#141414] bg-[#0F0F0F] p-5">
      <div className="flex items-center gap-2.5">
        <Bone className="h-5 w-12 rounded" />
        <Bone className="h-4 w-40" />
      </div>
      <div className="mt-2.5 flex items-center gap-2.5">
        <Bone className="h-3 w-44" />
        <Bone className="h-5 w-16 rounded" />
      </div>
      <div className="mt-3 flex items-center gap-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <Bone
            key={i}
            className="h-6 w-6 rounded-full"
            style={{ marginLeft: i > 0 ? -8 : 0 }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Report ─────────────────────────────────────────────

export function ReportCardSkeleton() {
  return (
    <div className="rounded-xl border border-[#141414] bg-[#0F0F0F] p-5">
      <div className="flex items-center gap-2.5">
        <Bone className="h-5 w-14 rounded" />
        <Bone className="h-4 w-36" />
      </div>
      <div className="mt-2.5 flex items-center gap-2">
        <Bone className="h-4 w-16 rounded" />
        <Bone className="h-3 w-32" />
        <Bone className="h-5 w-16 rounded" />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Bone className="h-3 w-20" />
        <Bone className="h-3 w-16" />
      </div>
    </div>
  );
}

// ── Person ─────────────────────────────────────────────

export function PersonCardSkeleton() {
  return (
    <div className="rounded-xl border border-[#141414] bg-[#0F0F0F] p-6 text-center">
      <Bone className="mx-auto h-16 w-16 rounded-full" />
      <Bone className="mx-auto mt-3 h-5 w-28" />
      <Bone className="mx-auto mt-2 h-3 w-20" />
      <div className="mx-auto mt-3 flex justify-center gap-1.5">
        <Bone className="h-5 w-14 rounded" />
        <Bone className="h-5 w-16 rounded" />
      </div>
      <div className="my-4 h-px bg-[#141414]" />
      <div className="flex justify-around">
        <div className="flex flex-col items-center gap-1">
          <Bone className="h-4 w-6" />
          <Bone className="h-3 w-10" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <Bone className="h-4 w-6" />
          <Bone className="h-3 w-14" />
        </div>
      </div>
    </div>
  );
}

// ── Detail page skeletons ──────────────────────────────

export function DetailHeaderSkeleton() {
  return (
    <div>
      <Bone className="mb-4 h-3 w-32" />
      <Bone className="h-7 w-56" />
      <div className="mt-2 flex gap-2">
        <Bone className="h-5 w-16 rounded" />
        <Bone className="h-5 w-24" />
      </div>
    </div>
  );
}

export function EditorSkeleton() {
  return (
    <div className="mx-auto mt-8 max-w-[720px]">
      <Bone className="h-8 w-64" />
      <div className="mt-4 rounded-xl border border-[#1A1A1A]">
        <Bone className="h-10 rounded-t-xl rounded-b-none" />
        <div className="space-y-3 p-5">
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-4/5" />
          <Bone className="h-4 w-3/5" />
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function SettingsSectionSkeleton() {
  return (
    <div className="rounded-xl border border-[#141414] bg-[#0F0F0F] p-6">
      <Bone className="h-3 w-20" />
      <div className="mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <Bone className="h-4 w-32" />
          <Bone className="h-5 w-9 rounded-full" />
        </div>
        <div className="flex items-center justify-between">
          <Bone className="h-4 w-28" />
          <Bone className="h-5 w-9 rounded-full" />
        </div>
        <div className="flex items-center justify-between">
          <Bone className="h-4 w-36" />
          <Bone className="h-5 w-9 rounded-full" />
        </div>
      </div>
    </div>
  );
}
