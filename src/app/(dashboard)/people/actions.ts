"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { formatActionError } from "@/lib/action-error";

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
  try {
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
  } catch (err) {
    return { error: formatActionError(err) };
  }
}

// --- Invite user ---

type InviteUserInput = {
  name: string;
  email: string;
  role: string;
  company_role: string | null;
  dedication: string | null;
};

export async function inviteUser(input: InviteUserInput) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Não autenticado", name: null };

    const { data: dbUser } = await supabase
      .from("users")
      .select("id, role")
      .eq("auth_id", user.id)
      .single();
    if (!dbUser) return { error: "Usuário não encontrado", name: null };

    if (dbUser.role !== "admin") {
      return { error: "Apenas admins podem convidar", name: null };
    }

    // Check if email already exists (prevents orphan from race condition)
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", input.email)
      .maybeSingle();

    if (existing) {
      return { error: "Este email já está cadastrado", name: null };
    }

    // Insert user — if concurrent insert creates duplicate, DB unique constraint catches it
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        name: input.name,
        email: input.email,
        role: input.role,
        company_role: input.company_role || null,
        dedication: input.dedication || null,
      })
      .select("id")
      .single();

    if (error) {
      // Unique violation = concurrent insert
      if (error.code === "23505") {
        return { error: "Este email já está cadastrado", name: null };
      }
      return { error: error.message, name: null };
    }

    // Activity log — failure here is non-critical, user already created
    await supabase.from("activity_log").insert({
      user_id: dbUser.id,
      action: "invited_user",
      entity_type: "user",
      entity_id: newUser.id,
      metadata: { name: input.name, email: input.email },
    });

    revalidatePath("/people");
    return { error: null, name: input.name };
  } catch (err) {
    return { error: formatActionError(err), name: null };
  }
}

// --- Reset onboarding (admin only) ---

export async function resetOnboarding(userId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Não autenticado" };

    const { data: dbUser } = await supabase
      .from("users")
      .select("role")
      .eq("auth_id", user.id)
      .single();
    if (!dbUser || dbUser.role !== "admin") return { error: "Apenas admins" };

    const { error } = await supabase
      .from("onboarding_progress")
      .delete()
      .eq("user_id", userId);

    if (error) return { error: error.message };

    return { error: null };
  } catch (err) {
    return { error: formatActionError(err) };
  }
}
