"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type UpdateProfileInput = {
  user_id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  responsibilities: string | null;
  // Admin-only fields
  role?: string;
  company_role?: string | null;
  dedication?: string | null;
};

export async function updateProfile(input: UpdateProfileInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { data: dbUser } = await supabase
    .from("users")
    .select("id, role")
    .eq("auth_id", user.id)
    .single();
  if (!dbUser) return { error: "Usuário não encontrado" };

  const isAdmin = dbUser.role === "admin";
  const isSelf = dbUser.id === input.user_id;

  if (!isSelf && !isAdmin) {
    return { error: "Sem permissão" };
  }

  const updates: Record<string, unknown> = {
    name: input.name,
    avatar_url: input.avatar_url,
    bio: input.bio,
    responsibilities: input.responsibilities,
  };

  // Only admin can change role, company_role, dedication
  if (isAdmin) {
    if (input.role) updates.role = input.role;
    if (input.company_role !== undefined)
      updates.company_role = input.company_role;
    if (input.dedication !== undefined)
      updates.dedication = input.dedication;
  }

  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", input.user_id);

  if (error) return { error: error.message };

  await supabase.from("activity_log").insert({
    user_id: dbUser.id,
    action: "updated_profile",
    entity_type: "user",
    entity_id: input.user_id,
    metadata: { name: input.name },
  });

  revalidatePath(`/people/${input.user_id}`);
  revalidatePath("/people");
  return { error: null };
}
