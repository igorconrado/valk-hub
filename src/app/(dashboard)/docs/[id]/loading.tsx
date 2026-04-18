import { DetailHeaderSkeleton, EditorSkeleton } from "@/components/skeletons";

export default function DocDetailLoading() {
  return (
    <div>
      <DetailHeaderSkeleton />
      <EditorSkeleton />
    </div>
  );
}
