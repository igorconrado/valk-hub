# VALK Hub V1 — Known Limitations

Conforme decidido na sprint 5, estas funcionalidades ficaram pra V2.

## Tasks
- **Acoes rapidas hover do card kanban** (mudar status/priority/assignee sem abrir modal) — so placeholder console.log
- **Comentarios e anexos nas tasks** — schema existe (counters no card), UI nao implementada
- **Historico de mudancas** da task — sem timeline
- **Reordenar subtasks** via drag
- **Mover subtask pra outro parent** — nao permitido
- **Deep link pra abrir task direto via URL** `/tasks?taskId=X` — URL aceita mas nao abre modal automaticamente

## Triage
- **Actions de card** ("Aprovar escala", "Kill" direto) — hoje navega pra `/projects/{id}` onde voce decide
- **Registrar decisao de triagem no comite** — schema existe (`triage_decisions`) mas sem UI de votacao
- **Sparklines interativos com tooltip** — so barra de progresso visual
- **Exportar triagem** — botao existe mas dispara toast "em breve"
- **Edicao do gate direto na pagina** — so via detalhe do projeto

## Dashboard
- **Drag to reorder cards** — ordem e fixa
- **Hide/show de cards via settings** — nao configuravel
- **Realtime updates** via websockets — next fetch resolve por ora

## Financeiro
- **Integracao Stripe ao vivo** — esqueleto criado na Sprint 3, sem webhook ativo
- **Multi-moeda** — so BRL
- **Projecoes futuras** de caixa — so historico

## Gerais
- **Notificacoes push/email** — schema existe, sem delivery
- **Configuracoes de perfil completas** — so locale switcher
- **Dark/light theme toggle** — so dark
- **i18n: strings dinamicas do banco** (nomes de projetos, titulos de tasks) — nao traduzidos
- **Mobile app nativo** — so PWA via browser
- **2 imports de @/components/ui/** restantes: `TooltipProvider` (layout.tsx) e `Sheet` (sidebar mobile) — sem wrapper DS ainda

## Strings hardcoded pendentes de i18n
- Loading pages (projects/loading.tsx, meetings/loading.tsx, reports/loading.tsx) usam strings PT hardcoded
- Tab label "Relatorios" em project-detail.tsx

## Decisoes arquiteturais deliberadas
- **Sem testes automatizados** — V1 foi priorizar entrega. Adicionar na V2.
- **Sem monitoring/observability** — uptime e errors via Vercel builtin.
- **Sem feature flags** — mudancas vao direto via deploy.
- **Workspace pill removida** — VALK e workspace unica por ora. Reintroduzir se suportar multiplas workspaces no futuro.
