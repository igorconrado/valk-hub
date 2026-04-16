"use client";

import { Plus } from "lucide-react";
import { RoleGate } from "@/components/role-gate";
import { CreateTaskDialog } from "./create-task-dialog";

export function NewTaskButton() {
  return (
    <RoleGate allowed={["admin", "operator"]}>
      <CreateTaskDialog>
        <button className="flex items-center gap-1.5 rounded-lg border border-[#222] bg-transparent px-3.5 py-1.5 text-[12px] font-medium text-[#888] transition-all duration-150 hover:border-[#333] hover:bg-white/[0.02] hover:text-[#ccc]">
          <Plus size={14} strokeWidth={1.5} />
          Nova task
        </button>
      </CreateTaskDialog>
    </RoleGate>
  );
}
