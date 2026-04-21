import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProjectsGrid } from "./projects-grid";

export const metadata: Metadata = { title: "Projetos" };

export default async function ProjectsPage() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*, owner:users!owner_id(name)")
    .order("created_at", { ascending: false });

  return <ProjectsGrid projects={projects ?? []} />;
}
