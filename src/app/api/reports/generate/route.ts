import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

type ReportType = "sprint" | "monthly" | "experiment" | "quarterly";

type RequestBody = {
  type: ReportType;
  project_id?: string;
  period_start?: string;
  period_end?: string;
};

// ── Data fetchers per report type ──────────────────────

async function fetchSprintData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string | undefined,
  periodStart: string,
  periodEnd: string
) {
  const taskQuery = supabase
    .from("tasks")
    .select(
      "id, title, status, priority, type, due_date, created_at, assignee:users!assignee_id(name), project:projects!project_id(name)"
    )
    .gte("created_at", periodStart)
    .lte("created_at", periodEnd);

  const completedQuery = supabase
    .from("tasks")
    .select(
      "id, title, status, priority, type, updated_at, assignee:users!assignee_id(name), project:projects!project_id(name)"
    )
    .eq("status", "done")
    .gte("updated_at", periodStart)
    .lte("updated_at", periodEnd);

  const blocksQuery = supabase
    .from("task_blocks")
    .select("id, reason, resolved, created_at, task:tasks!task_id(title)")
    .gte("created_at", periodStart)
    .lte("created_at", periodEnd);

  if (projectId) {
    taskQuery.eq("project_id", projectId);
    completedQuery.eq("project_id", projectId);
  }

  const cyclesQuery = projectId
    ? supabase
        .from("linear_cycles")
        .select("name, number, starts_at, ends_at")
        .eq("project_id", projectId)
        .lte("starts_at", periodEnd)
        .gte("ends_at", periodStart)
    : null;

  const [
    { data: created },
    { data: completed },
    { data: blocks },
    cyclesResult,
  ] = await Promise.all([
    taskQuery,
    completedQuery,
    blocksQuery,
    cyclesQuery ?? Promise.resolve({ data: null }),
  ]);

  return {
    tasks_created: created ?? [],
    tasks_completed: completed ?? [],
    task_blocks: blocks ?? [],
    linear_cycles: cyclesResult.data ?? [],
    period: { start: periodStart, end: periodEnd },
  };
}

async function fetchMonthlyData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  periodStart: string,
  periodEnd: string
) {
  const [
    { data: projects },
    { data: taskSummary },
    { data: decisions },
    { data: meetings },
    { data: snapshots },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("name, phase, status")
      .eq("status", "active"),
    supabase
      .from("tasks")
      .select("status, priority, project:projects!project_id(name)")
      .gte("created_at", periodStart)
      .lte("created_at", periodEnd),
    supabase
      .from("decisions")
      .select(
        "title, impact, status, decided_at, project:projects!project_id(name)"
      )
      .gte("created_at", periodStart)
      .lte("created_at", periodEnd),
    supabase
      .from("meetings")
      .select("title, type, status, scheduled_at")
      .gte("scheduled_at", periodStart)
      .lte("scheduled_at", periodEnd),
    supabase
      .from("metrics_snapshots")
      .select(
        "date, data_json, project:projects!project_id(name)"
      )
      .gte("date", periodStart)
      .lte("date", periodEnd)
      .order("date", { ascending: false }),
  ]);

  return {
    projects: projects ?? [],
    tasks: taskSummary ?? [],
    decisions: decisions ?? [],
    meetings: meetings ?? [],
    metrics_snapshots: snapshots ?? [],
    period: { start: periodStart, end: periodEnd },
  };
}

async function fetchExperimentData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string
) {
  const [{ data: project }, { data: snapshots }, { data: tasks }] =
    await Promise.all([
      supabase
        .from("projects")
        .select(
          "name, phase, status, thesis_type, thesis_hypothesis, launch_target, created_at"
        )
        .eq("id", projectId)
        .single(),
      supabase
        .from("metrics_snapshots")
        .select("date, data_json")
        .eq("project_id", projectId)
        .order("date", { ascending: true }),
      supabase
        .from("tasks")
        .select("title, status, type, priority")
        .eq("project_id", projectId),
    ]);

  return {
    project: project ?? null,
    metrics_history: snapshots ?? [],
    tasks: tasks ?? [],
  };
}

// ── Prompt builders ────────────────────────────────────

const SYSTEM_PROMPT =
  "You are a business analyst writing concise internal reports for VALK, a venture builder. Write in Portuguese (pt-BR). Be direct, data-driven.";

function buildSprintPrompt(data: Awaited<ReturnType<typeof fetchSprintData>>) {
  return `Gere um relatório de sprint com base nos dados abaixo.

Período: ${data.period.start} a ${data.period.end}

Tasks criadas no período (${data.tasks_created.length}):
${JSON.stringify(data.tasks_created, null, 2)}

Tasks concluídas no período (${data.tasks_completed.length}):
${JSON.stringify(data.tasks_completed, null, 2)}

Bloqueios registrados (${data.task_blocks.length}):
${JSON.stringify(data.task_blocks, null, 2)}

Cycles do Linear:
${JSON.stringify(data.linear_cycles, null, 2)}

Estruture o relatório com: Resumo executivo, Tasks concluídas (agrupadas por projeto), Métricas de velocidade (criadas vs concluídas), Bloqueios e riscos, Próximos passos recomendados.`;
}

function buildMonthlyPrompt(
  data: Awaited<ReturnType<typeof fetchMonthlyData>>
) {
  return `Gere um relatório mensal consolidado com base nos dados abaixo.

Período: ${data.period.start} a ${data.period.end}

Projetos ativos:
${JSON.stringify(data.projects, null, 2)}

Tasks do período (${data.tasks.length}):
${JSON.stringify(data.tasks, null, 2)}

Decisões tomadas (${data.decisions.length}):
${JSON.stringify(data.decisions, null, 2)}

Reuniões realizadas (${data.meetings.length}):
${JSON.stringify(data.meetings, null, 2)}

Snapshots de métricas:
${JSON.stringify(data.metrics_snapshots, null, 2)}

Estruture o relatório com: Resumo executivo, Status por projeto, Métricas financeiras (MRR, clientes), Decisões-chave do mês, Reuniões e alinhamentos, Riscos e atenções, Prioridades para o próximo mês.`;
}

function buildExperimentPrompt(
  data: Awaited<ReturnType<typeof fetchExperimentData>>
) {
  return `Gere um relatório de experimento/validação com base nos dados abaixo.

Projeto:
${JSON.stringify(data.project, null, 2)}

Histórico de métricas:
${JSON.stringify(data.metrics_history, null, 2)}

Tasks do projeto (${data.tasks.length}):
${JSON.stringify(data.tasks, null, 2)}

Estruture o relatório com: Hipótese sendo testada, Status atual do experimento, Evolução das métricas (tendência), Evidências a favor e contra a hipótese, Recomendação (pivotar, perseverar, ou escalar), Próximos marcos.`;
}

function buildQuarterlyPrompt(
  data: Awaited<ReturnType<typeof fetchMonthlyData>>
) {
  return `Gere um relatório trimestral consolidado com base nos dados abaixo.

Período: ${data.period.start} a ${data.period.end}

Projetos ativos:
${JSON.stringify(data.projects, null, 2)}

Tasks do trimestre (${data.tasks.length}):
${JSON.stringify(data.tasks, null, 2)}

Decisões tomadas (${data.decisions.length}):
${JSON.stringify(data.decisions, null, 2)}

Reuniões realizadas (${data.meetings.length}):
${JSON.stringify(data.meetings, null, 2)}

Snapshots de métricas:
${JSON.stringify(data.metrics_snapshots, null, 2)}

Estruture o relatório com: Resumo executivo do trimestre, Evolução do portfólio, Métricas financeiras consolidadas (MRR, clientes — comparar início vs fim do trimestre), Decisões estratégicas, Aprendizados-chave, OKRs e metas para o próximo trimestre.`;
}

// ── Chart data builder ─────────────────────────────────

function buildChartData(
  type: ReportType,
  rawData: Record<string, unknown>
) {
  const charts: Record<string, unknown> = {};
  const summary: Record<string, unknown> = {};

  // MRR trend from snapshots
  const snapshots = (rawData.metrics_snapshots ?? rawData.metrics_history ?? []) as Array<{
    date: string;
    data_json: Record<string, number | null>;
    project?: { name: string } | { name: string }[] | null;
  }>;

  if (snapshots.length > 0) {
    charts.mrr_trend = snapshots
      .filter((s) => s.data_json?.mrr != null)
      .map((s) => ({ date: s.date, value: s.data_json.mrr }))
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  }

  // Tasks velocity and status distribution
  const tasksCreated = (rawData.tasks_created ?? rawData.tasks ?? []) as Array<{
    status: string;
    priority?: string;
  }>;
  const tasksCompleted = (rawData.tasks_completed ?? []) as Array<unknown>;

  // Status distribution from all tasks in the data
  const allTasks = tasksCreated;
  const statusDist: Record<string, number> = {
    backlog: 0,
    doing: 0,
    on_hold: 0,
    review: 0,
    done: 0,
  };
  for (const t of allTasks) {
    const s = t.status;
    if (s in statusDist) statusDist[s]++;
  }
  charts.status_distribution = statusDist;

  // Velocity — for sprint/monthly, show planned vs completed
  const planned = tasksCreated.length;
  const completed =
    type === "sprint" || type === "monthly"
      ? (tasksCompleted as Array<unknown>).length
      : allTasks.filter((t) => t.status === "done").length;

  charts.tasks_velocity = [
    { sprint: "Período", planned, completed },
  ];

  // Summary
  const decisions = (rawData.decisions ?? []) as Array<unknown>;
  summary.total_tasks = planned;
  summary.completed = completed;
  summary.velocity_pct = planned > 0 ? Math.round((completed / planned) * 100) : 0;
  summary.decisions = decisions.length;

  return { charts, summary };
}

// ── Route handler ──────────────────────────────────────

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // Rate limit: 10 requests per minute per user
  const { success, remaining, resetMs } = rateLimit(`reports:${user.id}`, {
    maxRequests: 10,
    windowMs: 60_000,
  });

  if (!success) {
    const retryAfter = Math.ceil(resetMs / 1000);
    return NextResponse.json(
      { error: "Limite de requisições atingido. Tente novamente em breve." },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfter.toString(),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Serviço de relatórios não configurado" },
      { status: 500 }
    );
  }

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido" },
      { status: 400 }
    );
  }

  const { type, project_id, period_start, period_end } = body;

  const validTypes: ReportType[] = [
    "sprint",
    "monthly",
    "experiment",
    "quarterly",
  ];
  if (!validTypes.includes(type)) {
    return NextResponse.json(
      { error: `Tipo inválido. Use: ${validTypes.join(", ")}` },
      { status: 400 }
    );
  }

  // Default period: last 14 days for sprint, last 30 for monthly, last 90 for quarterly
  const now = new Date();
  const defaultDays =
    type === "sprint" ? 14 : type === "quarterly" ? 90 : 30;
  const start =
    period_start ??
    new Date(now.getTime() - defaultDays * 86400000)
      .toISOString()
      .split("T")[0];
  const end = period_end ?? now.toISOString().split("T")[0];

  try {
    let data: Record<string, unknown>;
    let userPrompt: string;

    switch (type) {
      case "sprint": {
        const sprintData = await fetchSprintData(
          supabase,
          project_id,
          start,
          end
        );
        data = sprintData as unknown as Record<string, unknown>;
        userPrompt = buildSprintPrompt(sprintData);
        break;
      }
      case "monthly": {
        const monthlyData = await fetchMonthlyData(supabase, start, end);
        data = monthlyData as unknown as Record<string, unknown>;
        userPrompt = buildMonthlyPrompt(monthlyData);
        break;
      }
      case "experiment": {
        if (!project_id) {
          return NextResponse.json(
            { error: "project_id é obrigatório para relatórios de experimento" },
            { status: 400 }
          );
        }
        const experimentData = await fetchExperimentData(supabase, project_id);
        data = experimentData as unknown as Record<string, unknown>;
        userPrompt = buildExperimentPrompt(experimentData);
        break;
      }
      case "quarterly": {
        const quarterlyData = await fetchMonthlyData(supabase, start, end);
        data = quarterlyData as unknown as Record<string, unknown>;
        userPrompt = buildQuarterlyPrompt(quarterlyData);
        break;
      }
    }

    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    const contentMd = textBlock?.text ?? "";

    const { charts, summary } = buildChartData(type, data);

    return NextResponse.json({
      content_md: contentMd,
      data_json: { ...data, charts, summary },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro ao gerar relatório";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
