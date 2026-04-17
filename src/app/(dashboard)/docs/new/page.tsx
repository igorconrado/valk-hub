import { createDocument } from "../actions";

export default async function NewDocPage({
  searchParams,
}: {
  searchParams: Promise<{ project_id?: string; type?: string }>;
}) {
  const params = await searchParams;
  await createDocument(params.project_id ?? null, params.type ?? null);
  return null;
}
