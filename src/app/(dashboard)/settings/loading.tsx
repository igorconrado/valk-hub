import { PageHeader } from "@/components/page-header";
import { SettingsSectionSkeleton } from "@/components/skeletons";

export default function SettingsLoading() {
  return (
    <div>
      <PageHeader title="Configurações" />
      <div className="mx-auto mt-6 max-w-[640px] space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SettingsSectionSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
