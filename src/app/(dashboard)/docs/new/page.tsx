import { redirect } from "next/navigation";
import { createDocument } from "../actions";

export default async function NewDocPage({
  searchParams,
}: {
  searchParams: Promise<{ project_id?: string; type?: string }>;
}) {
  const params = await searchParams;
  const result = await createDocument(
    params.project_id ?? null,
    params.type ?? null
  );

  if (result.id) {
    redirect(`/docs/${result.id}`);
  }

  // Fallback if creation failed (e.g. not authenticated)
  redirect("/docs");
}
