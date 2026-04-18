import { createClient } from "@/lib/supabase/server";

type NotificationType =
  | "task_assigned"
  | "task_blocked"
  | "task_unblocked"
  | "meeting_scheduled"
  | "meeting_reminder"
  | "decision_registered"
  | "action_item_assigned"
  | "report_published"
  | "member_added"
  | "mention";

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  entityType?: string;
  entityId?: string;
};

export async function createNotification(input: CreateNotificationInput) {
  const supabase = await createClient();

  await supabase.from("notifications").insert({
    user_id: input.userId,
    type: input.type,
    title: input.title,
    body: input.body ?? null,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
  });
}

export async function createNotifications(inputs: CreateNotificationInput[]) {
  if (inputs.length === 0) return;

  const supabase = await createClient();

  await supabase.from("notifications").insert(
    inputs.map((input) => ({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
    }))
  );
}
