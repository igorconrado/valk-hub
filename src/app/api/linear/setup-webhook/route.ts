import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLinearClient } from "@/lib/linear/client";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const { projectId, teamId } = await request.json();

  if (!projectId || !teamId) {
    return NextResponse.json(
      { error: "projectId e teamId sao obrigatorios" },
      { status: 400 }
    );
  }

  // Determine webhook URL
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

    if (!webhook) {
      return NextResponse.json(
        { error: "Falha ao criar webhook no Linear" },
        { status: 500 }
      );
    }

    // Save webhook_id to linear_sync_config
    const { error } = await supabase
      .from("linear_sync_config")
      .update({
        webhook_id: webhook.id,
      })
      .eq("project_id", projectId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      webhookId: webhook.id,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro ao registrar webhook";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
