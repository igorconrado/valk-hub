// Mock data for VALK Hub — on-narrative Portuguese content
const USER = { name: 'Igor Valk', first: 'Igor', role: 'CEO & Founder', avatar: 'IV', color: '#E24B4A' };

const PEOPLE = [
  { id: 'iv', name: 'Igor Valk', initials: 'IV', role: 'CEO & Founder', color: '#E24B4A', dedication: 'full', tasks: 14, projects: 6 },
  { id: 'rm', name: 'Rafa Moreira', initials: 'RM', role: 'Head of Product', color: '#8B5CF6', dedication: 'full', tasks: 11, projects: 4 },
  { id: 'jc', name: 'Júlia Campos', initials: 'JC', role: 'Product Designer', color: '#3B82F6', dedication: 'full', tasks: 8, projects: 3 },
  { id: 'td', name: 'Théo Duarte', initials: 'TD', role: 'Staff Engineer', color: '#10B981', dedication: 'full', tasks: 18, projects: 3 },
  { id: 'ap', name: 'Ana Paz', initials: 'AP', role: 'Growth Lead', color: '#F59E0B', dedication: 'part', tasks: 6, projects: 5 },
  { id: 'bs', name: 'Bruno Sá', initials: 'BS', role: 'Full-stack Engineer', color: '#EC4899', dedication: 'full', tasks: 12, projects: 2 },
  { id: 'mn', name: 'Marina Nunes', initials: 'MN', role: 'Data Analyst', color: '#06B6D4', dedication: 'part', tasks: 4, projects: 4 },
  { id: 'lc', name: 'Lucas Carvalho', initials: 'LC', role: 'Customer Success', color: '#84CC16', dedication: 'full', tasks: 7, projects: 3 },
];

const phaseLabels = { discovery: 'Discovery', mvp: 'MVP', validation: 'Validação', traction: 'Tração', scale: 'Escala', paused: 'Pausado' };

const PROJECTS = [
  {
    id: 'kiln',        name: 'Kiln',        phase: 'traction',   thesis: 'Ops de restaurantes',
    tagline: 'Gestão de operação para cozinhas que tocam dark kitchens',
    hypothesis: 'Acreditamos que cozinhas com 3+ marcas perdem 18% de margem em fila de pedidos. Se dermos visibilidade em tempo real do fluxo por marca, reduzimos isso para 5%.',
    mrr: 48200, mrrDelta: +12.4, clients: 34, runway: 14, owner: 'rm', since: '2025-03', sprint: 'S-14', sprintProgress: 0.62, health: 'good',
  },
  {
    id: 'ember',       name: 'Ember',       phase: 'validation', thesis: 'Credenciamento PJ',
    tagline: 'Onboarding de prestadores PJ em minutos, não dias',
    hypothesis: 'Pequenas agências gastam 6h por prestador PJ em coleta de docs. Um fluxo assistido pode reduzir para 15min com mesma conformidade.',
    mrr: 12450, mrrDelta: +38.1, clients: 11, runway: 9, owner: 'jc', since: '2025-07', sprint: 'S-09', sprintProgress: 0.41, health: 'good',
  },
  {
    id: 'forge',       name: 'Forge',       phase: 'mvp',        thesis: 'DevEx interno',
    tagline: 'Templates e scaffolds para novos produtos do portfólio VALK',
    hypothesis: 'Produtos novos demoram 3 semanas até a primeira deploy. Com base comum multi-tenant, chegamos a 2 dias.',
    mrr: 0, mrrDelta: 0, clients: 0, runway: null, owner: 'td', since: '2026-01', sprint: 'S-05', sprintProgress: 0.78, health: 'warn',
  },
  {
    id: 'mirror',      name: 'Mirror',      phase: 'discovery',  thesis: 'Reviews B2B',
    tagline: 'Reviews verificados entre fornecedores B2B',
    hypothesis: 'Compradores B2B gastam 4 semanas validando fornecedor. Reviews verificados por NF podem cortar para 1 semana.',
    mrr: 0, mrrDelta: 0, clients: 0, runway: null, owner: 'ap', since: '2026-02', sprint: '—', sprintProgress: 0, health: 'neutral',
  },
  {
    id: 'anvil',       name: 'Anvil',       phase: 'scale',      thesis: 'Faturamento SaaS',
    tagline: 'Cobrança recorrente para SaaS brasileiros — boleto, pix, cartão',
    hypothesis: 'Stripe atende mal BR. SaaS perde 22% em churn involuntário. Régua local inteligente recupera 70%.',
    mrr: 184900, mrrDelta: +4.2, clients: 127, runway: 28, owner: 'iv', since: '2024-08', sprint: 'S-38', sprintProgress: 0.55, health: 'good',
  },
  {
    id: 'rune',        name: 'Rune',        phase: 'paused',     thesis: 'Analytics no-code',
    tagline: 'Dashboards pra times não-técnicos a partir de planilhas',
    hypothesis: 'Times de ops gastam 6h/semana em planilhas. Dashboards prontos podem virar 30min.',
    mrr: 2100, mrrDelta: -18, clients: 4, runway: null, owner: 'rm', since: '2025-05', sprint: '—', sprintProgress: 0, health: 'bad',
    pauseReason: 'CAC 3.2× LTV após 3 meses. Revisitar Q3.'
  },
];

const TASK_TYPES = {
  dev:       { label: 'Dev',       color: '#8B5CF6', linearSync: true },
  design:    { label: 'Design',    color: '#3B82F6' },
  research:  { label: 'Research',  color: '#06B6D4' },
  growth:    { label: 'Growth',    color: '#F59E0B' },
  ops:       { label: 'Ops',       color: '#84CC16' },
  decision:  { label: 'Decisão',   color: '#E24B4A' },
};

const TASK_STATUS = ['backlog', 'doing', 'hold', 'review', 'done'];
const STATUS_LABELS = { backlog: 'Backlog', doing: 'Em progresso', hold: 'Pausado', review: 'Revisão', done: 'Concluído' };

const TASKS = [
  { id: 't-481', title: 'Régua de cobrança com retry inteligente em pix', product: 'anvil', type: 'dev', priority: 'urgent', status: 'doing', assignee: 'td', due: '2026-04-22', linear: 'ANV-412', desc: 'Quando o pagamento falha, a régua atual reenvia em intervalos fixos. Precisamos de retry com back-off adaptativo por tipo de falha (saldo insuficiente, limite, etc).', tags: ['churn', 'pagamentos'] },
  { id: 't-480', title: 'Experimento: novo onboarding guiado em 3 passos', product: 'kiln', type: 'growth', priority: 'high', status: 'doing', assignee: 'ap', due: '2026-04-20', desc: 'Rodar A/B do onboarding atual (6 passos) vs novo fluxo condensado.', tags: ['ativação'] },
  { id: 't-479', title: 'Pesquisa com 8 restaurantes sobre fluxo de marca virtual', product: 'kiln', type: 'research', priority: 'medium', status: 'review', assignee: 'rm', due: '2026-04-19', desc: 'Entrevistas semi-estruturadas, 45min cada.', tags: ['discovery'] },
  { id: 't-478', title: 'Decidir: seguimos com Mirror ou kill?', product: 'mirror', type: 'decision', priority: 'urgent', status: 'review', assignee: 'iv', due: '2026-04-18', desc: 'Traction gate: 15 signups por semana organicamente ou kill. Estamos em 4/sem.', tags: ['kill-or-scale'] },
  { id: 't-477', title: 'Refatorar componente de tabela (Forge UI)', product: 'forge', type: 'dev', priority: 'low', status: 'backlog', assignee: 'bs', due: '2026-04-30', linear: 'FRG-88', desc: 'Tabela atual não suporta virtualização.', tags: ['tech-debt'] },
  { id: 't-476', title: 'Wireframes da tela de conciliação', product: 'anvil', type: 'design', priority: 'high', status: 'doing', assignee: 'jc', due: '2026-04-21', desc: 'Tela de conciliação para o time de finanças dos clientes.', tags: [] },
  { id: 't-475', title: 'Configurar tracking de eventos no Ember', product: 'ember', type: 'ops', priority: 'medium', status: 'hold', assignee: 'mn', due: '2026-04-25', desc: 'Precisamos dos eventos de onboarding antes de começar a medir ativação.', blocker: { reason: 'Aguardando acesso ao PostHog pela equipe de Ember', by: 'td' }, tags: [] },
  { id: 't-474', title: 'Escrever copy da landing do Ember v2', product: 'ember', type: 'growth', priority: 'medium', status: 'backlog', assignee: 'ap', due: '2026-04-24', desc: '', tags: ['landing'] },
  { id: 't-473', title: 'Spike: viabilidade técnica de assinatura em USD', product: 'anvil', type: 'research', priority: 'low', status: 'backlog', assignee: 'td', due: '2026-05-02', desc: '', tags: [] },
  { id: 't-472', title: 'Fix: duplicação de webhook em cenários de retry', product: 'anvil', type: 'dev', priority: 'urgent', status: 'done', assignee: 'td', due: '2026-04-15', linear: 'ANV-401', desc: 'Done.', tags: ['bug'] },
  { id: 't-471', title: 'Apresentar Mirror no comitê de quinta', product: 'mirror', type: 'ops', priority: 'high', status: 'done', assignee: 'ap', due: '2026-04-14', desc: 'Apresentação feita, decisão pendente.', tags: [] },
  { id: 't-470', title: 'Kill-or-scale de Rune: documento final', product: 'rune', type: 'decision', priority: 'high', status: 'hold', assignee: 'iv', due: '2026-04-17', desc: 'Paused enquanto aguarda números finais de março.', blocker: { reason: 'Marina ainda está consolidando o relatório de março', by: 'mn' }, tags: [] },
  { id: 't-469', title: 'Webhook de NF-e para validação de reviews', product: 'mirror', type: 'dev', priority: 'medium', status: 'backlog', assignee: 'bs', due: '2026-05-05', linear: 'MIR-23', desc: '', tags: [] },
  { id: 't-468', title: 'Protótipo de tela de carteira (Forge)', product: 'forge', type: 'design', priority: 'medium', status: 'review', assignee: 'jc', due: '2026-04-18', desc: '', tags: [] },
];

const DECISIONS = [
  { id: 'd1', title: 'Seguimos com Anvil em assinatura internacional', product: 'anvil', date: '2026-04-14', by: 'iv' },
  { id: 'd2', title: 'Kiln: foco em marcas virtuais nos próximos 3 sprints', product: 'kiln', date: '2026-04-12', by: 'rm' },
  { id: 'd3', title: 'Forge: investir em tabela + form builder antes de listas', product: 'forge', date: '2026-04-10', by: 'td' },
  { id: 'd4', title: 'Pausar Rune até relatório de abril', product: 'rune', date: '2026-04-08', by: 'iv' },
];

const ACTIVITY = [
  { who: 'td', verb: 'moveu', what: 'ANV-412 para Em progresso', when: '3min', type: 'task' },
  { who: 'rm', verb: 'publicou', what: 'Relatório de Discovery — Kiln', when: '22min', type: 'doc' },
  { who: 'ap', verb: 'criou experimento', what: '“Onboarding 3-step” em Kiln', when: '1h', type: 'growth' },
  { who: 'iv', verb: 'decidiu', what: 'Pausar Rune até abril', when: '4h', type: 'decision' },
  { who: 'jc', verb: 'atualizou docs', what: 'UX spec — Conciliação Anvil v3', when: '6h', type: 'doc' },
  { who: 'td', verb: 'concluiu', what: 'ANV-401 — fix webhook duplicado', when: 'ontem', type: 'task' },
  { who: 'mn', verb: 'compartilhou dashboard', what: 'Retenção semanal por produto', when: 'ontem', type: 'metric' },
];

const DOCS = [
  { id: 'doc1', title: 'Hipóteses de valor — Kiln 2026', product: 'kiln', type: 'thesis', author: 'rm', version: '2.1', updated: '2026-04-14' },
  { id: 'doc2', title: 'UX spec — Conciliação Anvil v3', product: 'anvil', type: 'spec', author: 'jc', version: '3.0', updated: '2026-04-14' },
  { id: 'doc3', title: 'Relatório de Discovery — Mirror', product: 'mirror', type: 'research', author: 'ap', version: '1.2', updated: '2026-04-13' },
  { id: 'doc4', title: 'Playbook kill-or-scale VALK', product: null, type: 'playbook', author: 'iv', version: '1.0', updated: '2026-04-01' },
  { id: 'doc5', title: 'Arquitetura multi-tenant — Forge', product: 'forge', type: 'tech', author: 'td', version: '0.4', updated: '2026-04-10' },
  { id: 'doc6', title: 'Brief de marca — Ember', product: 'ember', type: 'brief', author: 'jc', version: '1.0', updated: '2026-04-09' },
  { id: 'doc7', title: 'Retrospectiva S-13 — Kiln', product: 'kiln', type: 'retro', author: 'rm', version: '1.0', updated: '2026-04-07' },
  { id: 'doc8', title: 'Análise competitiva — Anvil', product: 'anvil', type: 'research', author: 'ap', version: '2.0', updated: '2026-04-05' },
];

const DOC_TYPES = { thesis: 'Tese', spec: 'Spec', research: 'Research', playbook: 'Playbook', tech: 'Tech', brief: 'Brief', retro: 'Retro' };

const MEETINGS = [
  { id: 'm1', title: 'Comitê semanal de portfólio', type: 'committee', when: '2026-04-17 15:00', participants: ['iv','rm','td','ap'], status: 'scheduled', product: null },
  { id: 'm2', title: 'Kiln — review de sprint S-14', type: 'sprint', when: '2026-04-18 10:00', participants: ['rm','td','jc'], status: 'scheduled', product: 'kiln' },
  { id: 'm3', title: 'Mirror — kill-or-scale', type: 'decision', when: '2026-04-18 16:00', participants: ['iv','ap','rm'], status: 'scheduled', product: 'mirror' },
  { id: 'm4', title: 'Anvil — 1:1 com cliente Nuvemshop', type: 'customer', when: '2026-04-14 14:00', participants: ['iv','lc'], status: 'done', product: 'anvil' },
  { id: 'm5', title: 'Ember — review de onboarding', type: 'review', when: '2026-04-11 11:00', participants: ['jc','ap','bs'], status: 'done', product: 'ember' },
];

const REPORTS = [
  { id: 'r1', title: 'Portfolio VALK — Março 2026', type: 'portfolio', product: null, period: 'Mar/2026', status: 'published', ai: true, author: 'iv' },
  { id: 'r2', title: 'Anvil — Retenção e churn Q1', type: 'metric', product: 'anvil', period: 'Q1/2026', status: 'draft', ai: true, author: 'mn' },
  { id: 'r3', title: 'Kiln — Discovery round 2', type: 'discovery', product: 'kiln', period: '2026-03', status: 'published', ai: false, author: 'rm' },
  { id: 'r4', title: 'Mirror — Análise de kill-or-scale', type: 'decision', product: 'mirror', period: '2026-04', status: 'draft', ai: true, author: 'iv' },
];

const NOTIFS = [
  { id: 'n1', type: 'task', unread: true, text: 'Théo te atribuiu ANV-412 — Régua de cobrança', when: '3min' },
  { id: 'n2', type: 'mention', unread: true, text: 'Rafa te mencionou em Discovery — Kiln', when: '22min' },
  { id: 'n3', type: 'decision', unread: true, text: 'Decisão pendente: Mirror kill-or-scale', when: '1h' },
  { id: 'n4', type: 'meeting', unread: false, text: 'Comitê semanal começa em 30min', when: '3h' },
  { id: 'n5', type: 'report', unread: false, text: 'Relatório mensal gerado: Portfolio Março 2026', when: 'ontem' },
  { id: 'n6', type: 'task', unread: false, text: 'Ana concluiu: Apresentar Mirror no comitê', when: 'ontem' },
];

// ─── Traction triage: each project measured against its phase gate ───
// Gates are hypothesis-driven thresholds that define "it's working"
// verdict: 'scale' = exceeding gate, 'hold' = on track, 'risk' = slipping, 'kill' = gate blown
const TRIAGE = {
  anvil:  { gate: 'MRR > R$150k & churn < 3%', metric: 'MRR', actual: 184900, target: 150000, unit: 'brl', progress: 1.23, verdict: 'scale',  trend: [142,148,155,162,168,175,180,184], weeks: 8, note: 'Cresceu R$ 42k em 8 semanas. Hora de dobrar a aposta.' },
  kiln:   { gate: 'MRR > R$40k & churn < 5%',  metric: 'MRR', actual: 48200,  target: 40000,  unit: 'brl', progress: 1.20, verdict: 'scale',  trend: [28,31,34,38,41,43,46,48],        weeks: 8, note: 'Passou o gate de tração. Revisar alocação no próximo comitê.' },
  ember:  { gate: '15 signups orgânicos/sem',  metric: 'Signups orgânicos', actual: 11, target: 15, unit: 'int', progress: 0.73, verdict: 'hold', trend: [3,5,6,7,8,9,10,11], weeks: 8, note: 'Trajetória saudável. Mais 2 semanas para bater o gate.' },
  forge:  { gate: 'Deploy de novo produto < 2 dias', metric: 'Dias até deploy', actual: 4, target: 2, unit: 'int', progress: 0.5,  verdict: 'hold', trend: [9,8,7,7,6,5,5,4], weeks: 8, note: 'Template base entregue. Próximo: CLI de scaffolding.', inverse: true },
  mirror: { gate: '15 signups orgânicos/sem',  metric: 'Signups orgânicos', actual: 4, target: 15, unit: 'int', progress: 0.27, verdict: 'risk', trend: [2,3,4,3,4,5,4,4], weeks: 8, note: '4 semanas estagnado. Decisão de kill-or-scale em 18/abr.', decisionDue: '2026-04-18' },
  rune:   { gate: 'CAC < LTV × 0.3',            metric: 'CAC/LTV', actual: 3.2, target: 0.3, unit: 'ratio', progress: 0.09, verdict: 'kill', trend: [2.8,3.0,3.1,3.2,3.2,3.2,3.1,3.2], weeks: 8, note: 'Gate blown. Projeto pausado em 08/abr. Revisitar Q3.', inverse: true },
};

function triageOf(id) { return TRIAGE[id]; }
function getPerson(id) { return PEOPLE.find(p => p.id === id) || PEOPLE[0]; }
function getProject(id) { return PROJECTS.find(p => p.id === id); }

Object.assign(window, { USER, PEOPLE, PROJECTS, TASKS, TASK_TYPES, TASK_STATUS, STATUS_LABELS, DECISIONS, ACTIVITY, DOCS, DOC_TYPES, MEETINGS, REPORTS, NOTIFS, TRIAGE, phaseLabels, getPerson, getProject, triageOf });
