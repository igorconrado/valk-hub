"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/page-header";
import { MeetingCardSkeleton } from "@/components/skeletons";

export default function MeetingsLoading() {
  const t = useTranslations("nav");
  return (
    <div>
      <PageHeader title={t("meetings")} />
      <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <MeetingCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
