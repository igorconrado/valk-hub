"use client";

import { Plus } from "lucide-react";
import { RoleGate } from "@/components/role-gate";
import { CreateDocumentDialog } from "./create-document-dialog";

export function NewDocButton() {
  return (
    <RoleGate allowed={["admin", "operator"]}>
      <CreateDocumentDialog>
        <button className="flex items-center gap-1.5 rounded-lg border border-[#222] bg-transparent px-3.5 py-1.5 text-[12px] font-medium text-[#888] transition-all duration-150 hover:border-[#333] hover:bg-white/[0.02] hover:text-[#ccc]">
          <Plus size={14} strokeWidth={1.5} />
          Novo doc
        </button>
      </CreateDocumentDialog>
    </RoleGate>
  );
}
