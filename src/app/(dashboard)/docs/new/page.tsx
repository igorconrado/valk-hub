"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createDocument } from "../actions";

export default function NewDocPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const creating = useRef(false);

  useEffect(() => {
    if (creating.current) return;
    creating.current = true;

    const projectId = searchParams.get("project_id") ?? null;
    const type = searchParams.get("type") ?? null;

    createDocument(projectId, type).then((result) => {
      if (result.id) {
        router.replace(`/docs/${result.id}`);
      } else {
        router.replace("/docs");
      }
    });
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2
        size={24}
        strokeWidth={1.5}
        className="animate-spin text-[#E24B4A]"
      />
      <p className="mt-3 text-[13px] text-[#555]">Criando documento...</p>
    </div>
  );
}
