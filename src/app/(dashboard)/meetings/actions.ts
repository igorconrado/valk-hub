"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createNotification,
  createNotifications,
} from "@/lib/notifications/create";
import { formatActionError } from "@/lib/action-error";
import { requireProjectMember } from "@/lib/auth/authz";

async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, dbUser: null, error: "Não autenticado" };

  const { data: dbUser } = await supabase
    .from("users")
    .select("id, role")
    .eq("auth_id", user.id)
    .single();

  if (!dbUser)
    return { supabase, dbUser: null, error: "Usuário não encontrado" };
  return { supabase, dbUser, error: null };
}

// --- Create meeting ---

type CreateMeetingInput = {
  title: string;
  type: string;
  scheduled_at: string;
  project_id: string;
  description: string;
  participant_ids: string[];
};

export async function createMeeting(input: CreateMeetingInput) {
  try {
    const { supabase, dbUser, error: authError } = await getAuthUser();
    if (authError || !dbUser) return { error: authError, id: null };

    if (input.project_id && dbUser.role !== "admin") {
      try {
        await requireProjectMember(input.project_id);
      } catch {
        return { error: "Sem permissão", id: null };
      }
    }

    const { data: meeting, error } = await supabase
      .from("meetings")
      .insert({
        title: input.title,
        type: input.type,
        scheduled_at: input.scheduled_at,
        project_id: input.project_id || null,
        description: input.description || null,
        created_by: dbUser.id,
      })
      .select("id")
      .single();

    if (error) return { error: error.message, id: null };

    if (input.participant_ids.length > 0) {
      const rows = input.participant_ids.map((uid) => ({
        meeting_id: meeting.id,
        user_id: uid,
        role: uid === dbUser.id ? "organizer" : "participant",
      }));
      await supabase.from("meeting_participants").insert(rows);
    }

    await supabase.from("activity_log").insert({
      user_id: dbUser.id,
      action: "created_meeting",
      entity_type: "meeting",
      entity_id: meeting.id,
      metadata: {
        title: input.title,
        type: input.type,
        participants_count: input.participant_ids.length,
      },
    });

    // Notify participants (except creator)
    const dateStr = new Date(input.scheduled_at).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const participantsToNotify = input.participant_ids.filter(
      (uid) => uid !== dbUser.id
    );
    if (participantsToNotify.length > 0) {
      await createNotifications(
        participantsToNotify.map((uid) => ({
          userId: uid,
          type: "meeting_scheduled" as const,
          title: `Reunião '${input.title}' agendada para ${dateStr}`,
          entityType: "meeting",
          entityId: meeting.id,
        }))
      );
    }

    revalidatePath("/meetings");
    return { error: null, id: meeting.id };
  } catch (err) {
    return { error: formatActionError(err), id: null };
  }
}

// --- Update meeting status ---

export async function updateMeetingStatus(meetingId: string, status: string) {
  try {
    const { supabase, dbUser, error: authError } = await getAuthUser();
    if (authError || !dbUser) return { error: authError };

    // Authz: check meeting's project membership
    if (dbUser.role !== "admin") {
      const { data: meeting } = await supabase
        .from("meetings")
        .select("project_id")
        .eq("id", meetingId)
        .single();
      if (meeting?.project_id) {
        try { await requireProjectMember(meeting.project_id); }
        catch { return { error: "Sem permissão" }; }
      }
    }

    const { error } = await supabase
      .from("meetings")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", meetingId);

    if (error) return { error: error.message };

    const { data: meetingData } = await supabase
      .from("meetings")
      .select("title")
      .eq("id", meetingId)
      .single();

    const actionName =
      status === "completed"
        ? "completed_meeting"
        : status === "in_progress"
          ? "updated_meeting"
          : "meeting_status_changed";

    await supabase.from("activity_log").insert({
      user_id: dbUser.id,
      action: actionName,
      entity_type: "meeting",
      entity_id: meetingId,
      metadata: { status, title: meetingData?.title ?? "" },
    });

    revalidatePath(`/meetings/${meetingId}`);
    revalidatePath("/meetings");
    return { error: null };
  } catch (err) {
    return { error: formatActionError(err) };
  }
}

// --- Save meeting notes ---

export async function saveMeetingNotes(meetingId: string, notes: string) {
  try {
    const { supabase, dbUser, error: authError } = await getAuthUser();
    if (authError || !dbUser) return { error: authError };

    if (dbUser.role !== "admin") {
      const { data: meeting } = await supabase
        .from("meetings")
        .select("project_id")
        .eq("id", meetingId)
        .single();
      if (meeting?.project_id) {
        try { await requireProjectMember(meeting.project_id); }
        catch { return { error: "Sem permissão" }; }
      }
    }

    const { error } = await supabase
      .from("meetings")
      .update({ notes, updated_at: new Date().toISOString() })
      .eq("id", meetingId);

    if (error) return { error: error.message };

    revalidatePath(`/meetings/${meetingId}`);
    return { error: null };
  } catch (err) {
    return { error: formatActionError(err) };
  }
}

// --- Create decision ---

type CreateDecisionInput = {
  meeting_id: string | null;
  project_id: string;
  title: string;
  impact: string;
  decided_by_ids: string[];
};

export async function createDecision(input: CreateDecisionInput) {
  try {
    const { supabase, dbUser, error: authError } = await getAuthUser();
    if (authError || !dbUser) return { error: authError };

    if (input.project_id && dbUser.role !== "admin") {
      try { await requireProjectMember(input.project_id); }
      catch { return { error: "Sem permissão" }; }
    }

    const { data: decision, error } = await supabase
      .from("decisions")
      .insert({
        meeting_id: input.meeting_id || null,
        project_id: input.project_id || null,
        title: input.title,
        impact: input.impact,
        status: "approved",
        decided_at: new Date().toISOString(),
        decided_by: input.decided_by_ids[0] ?? dbUser.id,
        created_by: dbUser.id,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };

    await supabase.from("activity_log").insert({
      user_id: dbUser.id,
      action: "registered_decision",
      entity_type: "decision",
      entity_id: decision.id,
      metadata: { title: input.title, impact: input.impact },
    });

    // Notify project members (if project linked)
    if (input.project_id) {
      const { data: members } = await supabase
        .from("project_members")
        .select("user_id")
        .eq("project_id", input.project_id);
      const toNotify = (members ?? [])
        .map((m) => m.user_id as string)
        .filter((uid) => uid !== dbUser.id);
      if (toNotify.length > 0) {
        await createNotifications(
          toNotify.map((uid) => ({
            userId: uid,
            type: "decision_registered" as const,
            title: `Decisão registrada: '${input.title}'`,
            entityType: "decision",
            entityId: decision.id,
          }))
        );
      }
    }

    if (input.meeting_id) revalidatePath(`/meetings/${input.meeting_id}`);
    if (input.project_id) revalidatePath(`/projects/${input.project_id}`);
    revalidatePath("/");
    return { error: null };
  } catch (err) {
    return { error: formatActionError(err) };
  }
}

// --- Create action item (+ auto-create task) ---

type CreateActionItemInput = {
  meeting_id: string;
  project_id: string | null;
  title: string;
  assignee_id: string;
  due_date: string;
};

export async function createActionItem(input: CreateActionItemInput) {
  try {
    const { supabase, dbUser, error: authError } = await getAuthUser();
    if (authError || !dbUser) return { error: authError };

    if (input.project_id && dbUser.role !== "admin") {
      try { await requireProjectMember(input.project_id); }
      catch { return { error: "Sem permissão" }; }
    }

    // Create task first
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .insert({
        title: input.title,
        type: "task",
        project_id: input.project_id || null,
        assignee_id: input.assignee_id,
        status: "backlog",
        priority: "medium",
        due_date: input.due_date || null,
        created_by: dbUser.id,
      })
      .select("id")
      .single();

    if (taskError) return { error: taskError.message };

    // Create action item linked to task
    const { error: aiError } = await supabase.from("action_items").insert({
      meeting_id: input.meeting_id,
      task_id: task.id,
      title: input.title,
      assignee_id: input.assignee_id,
      due_date: input.due_date || null,
      status: "pending",
      created_by: dbUser.id,
    });

    if (aiError) return { error: aiError.message };

    await supabase.from("activity_log").insert({
      user_id: dbUser.id,
      action: "created_action_item",
      entity_type: "meeting",
      entity_id: input.meeting_id,
      metadata: { title: input.title, assignee_id: input.assignee_id },
    });

    // Notify assignee (if not self)
    if (input.assignee_id !== dbUser.id) {
      const dueStr = input.due_date
        ? ` com prazo ${new Date(input.due_date).toLocaleDateString("pt-BR")}`
        : "";
      await createNotification({
        userId: input.assignee_id,
        type: "action_item_assigned",
        title: `Action item: '${input.title}'${dueStr}`,
        entityType: "meeting",
        entityId: input.meeting_id,
      });
    }

    revalidatePath(`/meetings/${input.meeting_id}`);
    revalidatePath("/tasks");
    return { error: null };
  } catch (err) {
    return { error: formatActionError(err) };
  }
}

// --- Toggle action item status ---

export async function toggleActionItem(itemId: string, meetingId: string) {
  try {
    const { supabase, dbUser, error: authError } = await getAuthUser();
    if (authError || !dbUser) return { error: authError };

    const { data: item } = await supabase
      .from("action_items")
      .select("status, task_id")
      .eq("id", itemId)
      .single();

    if (!item) return { error: "Item não encontrado" };

    const newStatus = item.status === "done" ? "pending" : "done";
    const completedAt = newStatus === "done" ? new Date().toISOString() : null;

    const { error } = await supabase
      .from("action_items")
      .update({ status: newStatus, completed_at: completedAt })
      .eq("id", itemId);

    if (error) return { error: error.message };

    // Sync task status
    if (item.task_id) {
      await supabase
        .from("tasks")
        .update({
          status: newStatus === "done" ? "done" : "backlog",
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.task_id);
    }

    // Log activity
    if (newStatus === "done") {
      const { data: aiData } = await supabase
        .from("action_items")
        .select("title")
        .eq("id", itemId)
        .single();
      await supabase.from("activity_log").insert({
        user_id: dbUser.id,
        action: "completed_action_item",
        entity_type: "meeting",
        entity_id: meetingId,
        metadata: { title: aiData?.title ?? "" },
      });
    }

    revalidatePath(`/meetings/${meetingId}`);
    revalidatePath("/tasks");
    return { error: null };
  } catch (err) {
    return { error: formatActionError(err) };
  }
}
