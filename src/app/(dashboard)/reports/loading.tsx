"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/page-header";
import { ReportCardSkeleton } from "@/components/skeletons";

export default function ReportsLoading() {
  const t = useTranslations("nav");
  return (
    <div>
      <PageHeader title={t("reports")} />
      <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <ReportCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
