import { PageHeader } from "@/components/page-header";
import { TaskRowSkeleton } from "@/components/skeletons";

export default function TasksLoading() {
  return (
    <div>
      <PageHeader title="Tasks" />
      <div className="mt-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <TaskRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
