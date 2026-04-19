"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/page-header";
import { ProjectCardSkeleton } from "@/components/skeletons";

export default function ProjectsLoading() {
  const t = useTranslations("nav");
  return (
    <div>
      <PageHeader title={t("projects")} />
      <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
