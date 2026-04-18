import { DetailHeaderSkeleton, EditorSkeleton } from "@/components/skeletons";

export default function ReportDetailLoading() {
  return (
    <div>
      <DetailHeaderSkeleton />
      <EditorSkeleton />
    </div>
  );
}
