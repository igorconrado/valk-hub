import { DetailHeaderSkeleton, EditorSkeleton } from "@/components/skeletons";

export default function MeetingDetailLoading() {
  return (
    <div>
      <DetailHeaderSkeleton />
      <EditorSkeleton />
    </div>
  );
}
