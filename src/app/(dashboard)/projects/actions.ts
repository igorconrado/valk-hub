"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLinearClient } from "@/lib/linear/client";
import { createNotification } from "@/lib/notifications/create";

type CreateProjectInput = {
  name: string;
  description: string;
  phase: string;
  thesis_type: string;
  thesis_hypothesis: string;
  launch_target: string;
  logo_url: string;
};

export async function createProject(input: CreateProjectInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado" };
  }

  // Get the users table record for the auth user
  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!dbUser) {
    return { error: "Usuário não encontrado" };
  }

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      name: input.name,
      description: input.description || null,
      phase: input.phase,
      thesis_type: input.thesis_type || null,
      thesis_hypothesis: input.thesis_hypothesis || null,
      launch_target: input.launch_target || null,
      logo_url: input.logo_url || null,
      owner_id: dbUser.id,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  // Add creator as project member
  await supabase.from("project_members").insert({
    project_id: project.id,
    user_id: dbUser.id,
    role_in_project: "owner",
  });

  // Log activity
  await supabase.from("activity_log").insert({
    user_id: dbUser.id,
    action: "project_created",
    entity_type: "project",
    entity_id: project.id,
    metadata: { name: input.name },
  });

  revalidatePath("/projects");

  return { error: null };
}

type UpdateProjectInput = {
  id: string;
  name: string;
  description: string;
  phase: string;
  status: string;
  thesis_type: string;
  thesis_hypothesis: string;
  launch_target: string;
  logo_url: string;
};

export async function updateProject(input: UpdateProjectInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado" };
  }

  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!dbUser) {
    return { error: "Usuário não encontrado" };
  }

  const { error } = await supabase
    .from("projects")
    .update({
      name: input.name,
      description: input.description || null,
      phase: input.phase,
      status: input.status,
      thesis_type: input.thesis_type || null,
      thesis_hypothesis: input.thesis_hypothesis || null,
      launch_target: input.launch_target || null,
      logo_url: input.logo_url || null,
    })
    .eq("id", input.id);

  if (error) {
    return { error: error.message };
  }

  await supabase.from("activity_log").insert({
    user_id: dbUser.id,
    action: "updated_project",
    entity_type: "project",
    entity_id: input.id,
    metadata: { name: input.name },
  });

  revalidatePath(`/projects/${input.id}`);
  revalidatePath("/projects");

  return { error: null };
}

export async function removeMember(projectId: string, userId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Não autenticado" };

  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!dbUser) return { error: "Usuário não encontrado" };

  // Get the member name for the activity log
  const { data: member } = await supabase
    .from("users")
    .select("name")
    .eq("id", userId)
    .single();

  const { error } = await supabase
    .from("project_members")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", userId);

  if (error) return { error: error.message };

  await supabase.from("activity_log").insert({
    user_id: dbUser.id,
    action: "removed_member",
    entity_type: "project",
    entity_id: projectId,
    metadata: { member_name: member?.name },
  });

  revalidatePath(`/projects/${projectId}`);

  return { error: null };
}

export async function addMember(
  projectId: string,
  userId: string,
  roleInProject: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Não autenticado" };

  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!dbUser) return { error: "Usuário não encontrado" };

  const { data: member } = await supabase
    .from("users")
    .select("name")
    .eq("id", userId)
    .single();

  const { error } = await supabase.from("project_members").insert({
    project_id: projectId,
    user_id: userId,
    role_in_project: roleInProject,
  });

  if (error) return { error: error.message };

  await supabase.from("activity_log").insert({
    user_id: dbUser.id,
    action: "added_member",
    entity_type: "project",
    entity_id: projectId,
    metadata: { member_name: member?.name },
  });

  // Notify added member (if not self)
  if (userId !== dbUser.id) {
    const { data: proj } = await supabase
      .from("projects")
      .select("name")
      .eq("id", projectId)
      .single();
    if (proj) {
      await createNotification({
        userId,
        type: "member_added",
        title: `Você foi adicionado ao projeto '${proj.name}'`,
        entityType: "project",
        entityId: projectId,
      });
    }
  }

  revalidatePath(`/projects/${projectId}`);

  return { error: null, memberName: member?.name };
}

export async function deleteProject(projectId: string, projectName: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Não autenticado" };

  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!dbUser) return { error: "Usuário não encontrado" };

  // Delete activity_log entries for this project first
  await supabase
    .from("activity_log")
    .delete()
    .eq("entity_type", "project")
    .eq("entity_id", projectId);

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) return { error: error.message };

  await supabase.from("activity_log").insert({
    user_id: dbUser.id,
    action: "deleted_project",
    entity_type: "project",
    entity_id: projectId,
    metadata: { project_name: projectName },
  });

  revalidatePath("/projects");
  redirect("/projects");
}

export async function getLinearTeams() {
  try {
    const teams = await getLinearClient().teams();
    return {
      teams: teams.nodes.map((t) => ({
        id: t.id,
        name: t.name,
        key: t.key,
      })),
      error: null,
    };
  } catch {
    return { teams: [], error: "Falha ao buscar teams do Linear" };
  }
}

export async function connectLinearTeam(
  projectId: string,
  teamId: string,
  teamName: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Nao autenticado" };

  const { error } = await supabase.from("linear_sync_config").upsert(
    {
      project_id: projectId,
      team_id: teamId,
      team_name: teamName,
      sync_enabled: true,
    },
    { onConflict: "project_id" }
  );

  if (error) return { error: error.message };

  // Register webhook with Linear
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    "http://localhost:3000";
  const webhookUrl = `${baseUrl.replace(/\/$/, "")}/api/linear/webhook`;

  try {
    const webhookPayload = await getLinearClient().createWebhook({
      url: webhookUrl,
      teamId,
      resourceTypes: ["Issue", "Cycle"],
      label: "VALK Hub Sync",
    });

    const webhook = await webhookPayload.webhook;

    if (webhook) {
      await supabase
        .from("linear_sync_config")
        .update({ webhook_id: webhook.id })
        .eq("project_id", projectId);
    }
  } catch {
    // Webhook registration failed but connection still works
    // Outbound sync will work, inbound won't until webhook is set up
  }

  revalidatePath(`/projects/${projectId}`);
  return { error: null };
}

export async function updateLinearSyncEnabled(
  projectId: string,
  syncEnabled: boolean
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Nao autenticado" };

  const { error } = await supabase
    .from("linear_sync_config")
    .update({ sync_enabled: syncEnabled })
    .eq("project_id", projectId);

  if (error) return { error: error.message };

  revalidatePath(`/projects/${projectId}`);
  return { error: null };
}

export async function disconnectLinear(projectId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Nao autenticado" };

  // Delete webhook from Linear if exists
  const { data: config } = await supabase
    .from("linear_sync_config")
    .select("webhook_id")
    .eq("project_id", projectId)
    .maybeSingle();

  if (config?.webhook_id) {
    try {
      await getLinearClient().deleteWebhook(config.webhook_id);
    } catch {
      // Webhook may already be deleted on Linear's side
    }
  }

  const { error } = await supabase
    .from("linear_sync_config")
    .delete()
    .eq("project_id", projectId);

  if (error) return { error: error.message };

  revalidatePath(`/projects/${projectId}`);
  return { error: null };
}

// Cache: track last sync time per project to avoid hammering Linear
const cycleSyncCache = new Map<string, number>();
const CYCLE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function syncLinearCycles(projectId: string) {
  const now = Date.now();
  const lastSync = cycleSyncCache.get(projectId) ?? 0;
  if (now - lastSync < CYCLE_CACHE_TTL) {
    return { error: null, skipped: true };
  }

  const supabase = await createClient();

  const { data: syncConfig } = await supabase
    .from("linear_sync_config")
    .select("team_id")
    .eq("project_id", projectId)
    .maybeSingle();

  if (!syncConfig?.team_id) return { error: null, skipped: true };

  try {
    const team = await getLinearClient().team(syncConfig.team_id);
    const cyclesConnection = await team.cycles();
    const cycles = cyclesConnection.nodes;

    for (const cycle of cycles) {
      await supabase.from("linear_cycles").upsert(
        {
          linear_cycle_id: cycle.id,
          project_id: projectId,
          linear_team_id: syncConfig.team_id,
          name: cycle.name ?? null,
          number: cycle.number,
          starts_at: cycle.startsAt?.toISOString() ?? null,
          ends_at: cycle.endsAt?.toISOString() ?? null,
        },
        { onConflict: "linear_cycle_id" }
      );
    }

    cycleSyncCache.set(projectId, now);
    return { error: null, skipped: false };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Erro ao sincronizar cycles",
      skipped: false,
    };
  }
}

export async function saveMetricsSnapshot(
  projectId: string,
  date: string,
  data: Record<string, number | null>
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Nao autenticado" };

  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!dbUser) return { error: "Usuario nao encontrado" };

  const { error } = await supabase.from("metrics_snapshots").insert({
    project_id: projectId,
    date,
    data_json: data,
    source: "manual",
    created_by: dbUser.id,
  });

  if (error) return { error: error.message };

  revalidatePath(`/projects/${projectId}`);
  return { error: null };
}

export async function deleteMetricsSnapshot(
  snapshotId: string,
  projectId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Nao autenticado" };

  const { error } = await supabase
    .from("metrics_snapshots")
    .delete()
    .eq("id", snapshotId);

  if (error) return { error: error.message };

  revalidatePath(`/projects/${projectId}`);
  return { error: null };
}

export async function saveStripeProductId(
  projectId: string,
  stripeProductId: string | null
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Nao autenticado" };

  const { error } = await supabase
    .from("projects")
    .update({ stripe_product_id: stripeProductId })
    .eq("id", projectId);

  if (error) return { error: error.message };

  revalidatePath(`/projects/${projectId}`);
  return { error: null };
}
