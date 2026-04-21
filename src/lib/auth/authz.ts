"use server";

import { createClient } from "@/lib/supabase/server";

type AuthContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  dbUser: { id: string; role: string };
};

/**
 * Require an authenticated user with a matching database row.
 * Throws on failure — catch in server actions via try/catch.
 */
export async function requireUser(): Promise<AuthContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("UNAUTHORIZED");

  const { data: dbUser } = await supabase
    .from("users")
    .select("id, role")
    .eq("auth_id", user.id)
    .single();

  if (!dbUser) throw new Error("USER_NOT_FOUND");
  return { supabase, dbUser };
}

/** Require the caller to be an admin. */
export async function requireAdmin(): Promise<AuthContext> {
  const ctx = await requireUser();
  if (ctx.dbUser.role !== "admin") throw new Error("FORBIDDEN");
  return ctx;
}

/** Require the caller to be a member of the given project (or admin). */
export async function requireProjectMember(
  projectId: string
): Promise<AuthContext> {
  const ctx = await requireUser();
  if (ctx.dbUser.role === "admin") return ctx;

  const { data: membership } = await ctx.supabase
    .from("project_members")
    .select("role_in_project")
    .eq("project_id", projectId)
    .eq("user_id", ctx.dbUser.id)
    .single();

  if (!membership) throw new Error("FORBIDDEN");
  return ctx;
}

/** Require the caller to be an owner of the given project (or admin). */
export async function requireProjectOwner(
  projectId: string
): Promise<AuthContext> {
  const ctx = await requireUser();
  if (ctx.dbUser.role === "admin") return ctx;

  const { data: membership } = await ctx.supabase
    .from("project_members")
    .select("role_in_project")
    .eq("project_id", projectId)
    .eq("user_id", ctx.dbUser.id)
    .single();

  if (!membership || !["owner", "admin"].includes(membership.role_in_project)) {
    throw new Error("FORBIDDEN");
  }
  return ctx;
}
