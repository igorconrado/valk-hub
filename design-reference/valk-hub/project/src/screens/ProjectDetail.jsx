// Project detail screen — tabs: Sprint, Tasks, Docs, Métricas, Decisões, Histórico, Relatórios
const ProjectDetail = ({ projectId, goTo, openTask }) => {
  const p = getProject(projectId);
  const [tab, setTab] = React.useState('sprint');
  if (!p) return null;

  const projectTasks = TASKS.filter(t => t.product === projectId);

  const tabs = [
    { id: 'sprint', label: 'Sprint' },
    { id: 'tasks', label: 'Tasks', count: projectTasks.length },
    { id: 'docs', label: 'Docs', count: DOCS.filter(d => d.product === projectId).length },
    { id: 'metrics', label: 'Métricas' },
    { id: 'decisions', label: 'Decisões', count: DECISIONS.filter(d => d.product === projectId).length },
    { id: 'history', label: 'Histórico' },
    { id: 'reports', label: 'Relatórios' },
  ];

  return (
    <div style={{ padding: '24px 36px 48px', maxWidth: 1440, animation: 'fadeUp 300ms var(--ease)' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: 11.5, color: 'var(--text-muted)' }}>
        <button onClick={() => goTo('projects')} style={{ color: 'var(--text-muted)', fontSize: 11.5 }}>Projetos</button>
        <I.chevronR size={11} stroke={2} style={{ color: 'var(--text-ghost)' }} />
        <span style={{ color: 'var(--text-secondary)' }}>{p.name}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18, gap: 24 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <HealthDot state={p.health} />
            <h1 className="display" style={{ fontSize: 26, fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}>{p.name}</h1>
            <PhaseBadge phase={p.phase} />
            <span className="badge neutral"><I.target size={9} /> {p.thesis}</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>{p.tagline}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn ghost"><I.bolt size={13} /> Avançar fase</button>
          <button className="btn ghost"><I.more size={14} /></button>
        </div>
      </div>

      {/* Hypothesis block */}
      <div style={{ padding: '16px 20px', background: 'var(--bg-1)', border: '1px solid var(--border-subtle)', borderRadius: 10, marginBottom: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ fontSize: 9, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 600, writingMode: 'vertical-rl', transform: 'rotate(180deg)', paddingTop: 2 }}>hipótese</div>
        <p style={{ fontSize: 13.5, color: 'var(--text-primary)', margin: 0, fontStyle: 'italic', lineHeight: 1.65, fontFamily: 'var(--font-display)', fontWeight: 500 }}>"{p.hypothesis}"</p>
      </div>

      {/* ─── Kill-or-scale decision moment ─── */}
      <TractionGate project={p} />

      {/* Quick stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        <StatCell label="MRR" value={p.mrr > 0 ? brl(p.mrr) : '—'} delta={p.mrrDelta} />
        <StatCell label="Clientes" value={p.clients > 0 ? p.clients : '—'} />
        <StatCell label="Runway" value={p.runway ? `${p.runway}m` : '—'} />
        <StatCell label="Sprint" value={p.sprint} extra={p.sprintProgress > 0 ? `${Math.round(p.sprintProgress * 100)}%` : null} />
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      <div style={{ padding: '24px 0' }}>
        {tab === 'sprint' && <SprintTab project={p} tasks={projectTasks} openTask={openTask} />}
        {tab === 'tasks' && <TasksTabView tasks={projectTasks} openTask={openTask} />}
        {tab === 'docs' && <DocsTabView projectId={projectId} />}
        {tab === 'metrics' && <MetricsTabView project={p} />}
        {tab === 'decisions' && <DecisionsTabView projectId={projectId} />}
        {tab === 'history' && <HistoryTabView projectId={projectId} />}
        {tab === 'reports' && <ReportsTabView projectId={projectId} />}
      </div>

      {/* Members */}
      <div style={{ marginTop: 36, paddingTop: 24, borderTop: '1px solid var(--border-subtle)' }}>
        <h2 className="label" style={{ marginBottom: 14 }}>Time</h2>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {PEOPLE.slice(0, 5).map(per => (
            <div key={per.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px 8px 8px', background: 'var(--bg-1)', border: '1px solid var(--border-subtle)', borderRadius: 24 }}>
              <Avatar p={per.id} size={26} />
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{per.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-ghost)' }}>{per.role}</div>
              </div>
            </div>
          ))}
          <button className="btn ghost" style={{ borderRadius: 24 }}><I.plus size={12} /> Adicionar</button>
        </div>
      </div>
    </div>
  );
};

// ─── Kill-or-Scale gate — defines "is it working?" ───
const TractionGate = ({ project }) => {
  const t = triageOf(project.id);
  if (!t) return null;
  const vMap = {
    scale: { title: 'Passou o gate · Hora de escalar', color: '#58D3AE', bg: 'rgba(16,185,129,0.04)', border: 'rgba(16,185,129,0.2)', icon: '↑' },
    hold:  { title: 'Em trajetória · Manter curso',    color: 'var(--text-secondary)', bg: 'rgba(255,255,255,0.015)', border: 'var(--border-subtle)', icon: '→' },
    risk:  { title: 'Em risco · Decisão próxima',      color: '#F5BD5C', bg: 'rgba(245,158,11,0.035)', border: 'rgba(245,158,11,0.2)', icon: '△' },
    kill:  { title: 'Gate perdido · Kill recomendado', color: 'var(--primary)', bg: 'rgba(226,75,74,0.05)', border: 'rgba(226,75,74,0.25)', icon: '✕' },
  };
  const v = vMap[t.verdict];
  const fmt = (x) => t.unit === 'brl' ? 'R$ ' + (x/1000).toFixed(0) + 'k' : t.unit === 'ratio' ? x.toFixed(1) + '×' : x;
  const barPct = Math.min(t.progress * 100, 130);

  const spark = t.trend;
  const sMax = Math.max(...spark), sMin = Math.min(...spark);
  const sPts = spark.map((val, i) => {
    const x = (i / (spark.length - 1)) * 100;
    const y = 100 - ((val - sMin) / (sMax - sMin || 1)) * 80 - 10;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <div style={{ background: v.bg, border: `1px solid ${v.border}`, borderRadius: 12, padding: 24, marginBottom: 24, display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 32, position: 'relative', overflow: 'hidden' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 9.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 600 }}>Kill-or-scale gate</span>
          <span style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          <span className={`verdict ${t.verdict}`}>{v.icon} {t.verdict}</span>
        </div>
        <div className="display" style={{ fontSize: 22, fontWeight: 600, color: v.color, letterSpacing: '-0.01em', marginBottom: 8, lineHeight: 1.2 }}>{v.title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 18, maxWidth: 440 }}>{t.note}</div>
        <div className="gate-line" style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 600, display: 'block', marginBottom: 3 }}>Threshold</span>
          <span style={{ fontSize: 12.5, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{t.gate}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {t.verdict === 'kill' && <><button className="btn primary" style={{ fontSize: 12 }}>Registrar kill</button><button className="btn ghost" style={{ fontSize: 12 }}>Revisar thresholds</button></>}
          {t.verdict === 'risk' && <><button className="btn ghost" style={{ fontSize: 12 }}>Agendar comitê</button><button className="btn ghost" style={{ fontSize: 12 }}>Revisar hipótese</button>{t.decisionDue && <span style={{ fontSize: 11, color: 'var(--primary)', marginLeft: 6, fontFamily: 'var(--font-mono)' }}>decisão · {t.decisionDue.slice(5)}</span>}</>}
          {t.verdict === 'hold' && <><button className="btn ghost" style={{ fontSize: 12 }}>Ver métricas</button><button className="btn ghost" style={{ fontSize: 12 }}>Ajustar gate</button></>}
          {t.verdict === 'scale' && <><button className="btn primary" style={{ fontSize: 12 }}>Aprovar escala</button><button className="btn ghost" style={{ fontSize: 12 }}>Alocar time</button></>}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'center' }}>
        <div>
          <div style={{ fontSize: 9.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 600, marginBottom: 8 }}>{t.metric} · últimas {t.weeks} sem</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span className="hero-num hero-num-sm" style={{ color: v.color }}>{fmt(t.actual)}</span>
            <span className="mono" style={{ fontSize: 12, color: 'var(--text-ghost)' }}>/ {fmt(t.target)} gate</span>
          </div>
        </div>
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: '100%', height: 48 }}>
          <defs><linearGradient id={`sg-${project.id}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={v.color} stopOpacity={0.2} /><stop offset="100%" stopColor={v.color} stopOpacity={0} /></linearGradient></defs>
          <polygon points={sPts.split(' ').map(pt => { const [x,y] = pt.split(','); return `${x},${(parseFloat(y)*0.4).toFixed(1)}`; }).join(' ') + ` 100,40 0,40`} fill={`url(#sg-${project.id})`} />
          <polyline points={sPts.split(' ').map(pt => { const [x,y] = pt.split(','); return `${x},${(parseFloat(y)*0.4).toFixed(1)}`; }).join(' ')} fill="none" stroke={v.color} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
        </svg>
        <div>
          <div className="heatbar"><span style={{ width: `${Math.min(barPct, 100)}%`, background: v.color }} /></div>
          <div style={{ position: 'relative', height: 0 }}>
            <span style={{ position: 'absolute', top: -6, left: '100%', transform: 'translateX(-50%)', width: 1, height: 10, background: 'var(--text-ghost)' }} />
            <span style={{ position: 'absolute', top: 6, right: 0, fontSize: 9, color: 'var(--text-ghost)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>gate</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCell = ({ label, value, delta, extra }) => (
  <div className="card" style={{ padding: 16 }}>
    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 600, marginBottom: 6 }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
      <span className="display" style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', fontFamily: value === '—' ? 'var(--font-display)' : (label === 'Sprint' ? 'var(--font-mono)' : 'var(--font-display)') }}>{value}</span>
      {delta !== undefined && delta !== 0 && (
        <span className="mono" style={{ fontSize: 11, color: delta > 0 ? 'var(--status-traction)' : 'var(--status-scale)' }}>{delta > 0 ? '↑' : '↓'}{Math.abs(delta).toFixed(1)}%</span>
      )}
      {extra && <span className="mono" style={{ fontSize: 11, color: 'var(--text-ghost)', marginLeft: 'auto' }}>{extra}</span>}
    </div>
  </div>
);

// ─── Sprint tab ───
const SprintTab = ({ project, tasks, openTask }) => {
  const sprintTasks = tasks.filter(t => ['doing', 'review', 'done', 'hold'].includes(t.status));
  const done = sprintTasks.filter(t => t.status === 'done').length;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <div className="label">Sprint atual</div>
              <div className="display" style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{project.sprint} · 10 → 24 abr</div>
            </div>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{done} / {sprintTasks.length} done</span>
          </div>
          <Progress value={project.sprintProgress} h={4} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 10.5, color: 'var(--text-ghost)' }}>
            <span>{Math.round(project.sprintProgress * 100)}% concluído</span>
            <span className="mono">7 dias restantes</span>
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div className="label" style={{ marginBottom: 12 }}>Meta do sprint</div>
          <p style={{ fontSize: 12.5, color: 'var(--text-primary)', margin: 0, lineHeight: 1.55, fontStyle: 'italic' }}>
            "Validar que restaurantes com 3+ marcas virtuais preferem a nova visão de fluxo por marca."
          </p>
        </div>
      </div>

      <div className="label" style={{ marginBottom: 12 }}>Tasks do sprint</div>
      <div className="card" style={{ padding: 0 }}>
        {sprintTasks.map((t, i) => (
          <TaskRow key={t.id} t={t} onClick={() => openTask(t.id)} last={i === sprintTasks.length - 1} />
        ))}
        {sprintTasks.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-ghost)', fontSize: 12 }}>Nenhuma task ativa no sprint.</div>}
      </div>
    </div>
  );
};

const TaskRow = ({ t, onClick, last }) => {
  const type = TASK_TYPES[t.type];
  const proj = getProject(t.product);
  return (
    <button onClick={onClick} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px',
      borderBottom: last ? 'none' : '1px solid var(--border-subtle)', textAlign: 'left',
      transition: 'background 150ms', cursor: 'pointer'
    }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <span className={`pri ${t.priority}`} />
      <span className="mono" style={{ fontSize: 10, color: 'var(--text-ghost)', width: 48 }}>{t.id}</span>
      <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
      <span className="badge" style={{ background: `${type.color}14`, color: type.color, borderColor: `${type.color}22` }}>{type.label}</span>
      {proj && <span className="badge neutral">{proj.name}</span>}
      <Avatar p={t.assignee} size={20} />
      <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-ghost)', width: 56, textAlign: 'right' }}>{t.due?.slice(5)}</span>
      <span className="badge neutral" style={{ minWidth: 70, justifyContent: 'center' }}>{STATUS_LABELS[t.status]}</span>
    </button>
  );
};

// ─── Metrics tab ───
const MetricsTabView = ({ project }) => {
  const mrr = [120,128,132,140,152,168,178,190,205,218,232,245];
  const months = ['mai','jun','jul','ago','set','out','nov','dez','jan','fev','mar','abr'];
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCell label="MRR" value={brl(project.mrr)} delta={project.mrrDelta} />
        <StatCell label="Churn 30d" value="2.4%" delta={-0.6} />
        <StatCell label="NPS" value="64" delta={+8} />
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <div className="label">MRR — últimos 12 meses</div>
            <div className="display" style={{ fontSize: 20, fontWeight: 600, marginTop: 4 }}>{brl(project.mrr)} <span className="mono" style={{ fontSize: 11, color: 'var(--status-traction)', marginLeft: 8 }}>↑{project.mrrDelta}%</span></div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {['1M','3M','12M','Tudo'].map(r => (
              <button key={r} style={{ padding: '4px 10px', fontSize: 11, color: r==='12M'?'var(--text-primary)':'var(--text-muted)', background: r==='12M'?'rgba(255,255,255,0.04)':'transparent', borderRadius: 5 }}>{r}</button>
            ))}
          </div>
        </div>
        <LineChart data={mrr} labels={months} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card" style={{ padding: 22 }}>
          <div className="label" style={{ marginBottom: 14 }}>Velocidade do time</div>
          <BarChart data={[8,11,9,14,12,10,13,15]} labels={['S7','S8','S9','S10','S11','S12','S13','S14']} />
        </div>
        <div className="card" style={{ padding: 22 }}>
          <div className="label" style={{ marginBottom: 14 }}>Distribuição por status</div>
          <StatusDist />
        </div>
      </div>
    </div>
  );
};

const LineChart = ({ data, labels, h = 180 }) => {
  const w = 720;
  const max = Math.max(...data), min = Math.min(...data);
  const pad = 24;
  const xs = (i) => pad + (i / (data.length - 1)) * (w - pad * 2);
  const ys = (v) => pad + (1 - (v - min) / (max - min)) * (h - pad * 2);
  const pts = data.map((v, i) => [xs(i), ys(v)]);
  const d = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const area = d + ` L${xs(data.length - 1)},${h - pad} L${pad},${h - pad} Z`;

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', display: 'block' }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="mrrg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.2} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* grid */}
        {[0,1,2,3].map(i => (
          <line key={i} x1={pad} x2={w-pad} y1={pad + i*(h-pad*2)/3} y2={pad + i*(h-pad*2)/3} stroke="var(--border-subtle)" strokeDasharray="2 4" />
        ))}
        <path d={area} fill="url(#mrrg)" />
        <path d={d} fill="none" stroke="var(--primary)" strokeWidth={2} strokeLinejoin="round" />
        {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={3} fill="var(--bg-1)" stroke="var(--primary)" strokeWidth={1.5} />)}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 24px', marginTop: 6, fontSize: 10, color: 'var(--text-ghost)', fontFamily: 'var(--font-mono)' }}>
        {labels.filter((_, i) => i % 2 === 0).map(l => <span key={l}>{l}</span>)}
      </div>
    </div>
  );
};

const BarChart = ({ data, labels }) => {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ width: '100%', height: `${(v / max) * 100}%`, background: i === data.length - 1 ? 'var(--primary)' : 'var(--border-hover)', borderRadius: '3px 3px 0 0', minHeight: 2 }} />
          <span className="mono" style={{ fontSize: 9, color: 'var(--text-ghost)' }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
};

const StatusDist = () => {
  const dist = [
    { label: 'Done', value: 42, color: 'var(--status-traction)' },
    { label: 'Em progresso', value: 28, color: 'var(--primary)' },
    { label: 'Backlog', value: 18, color: 'var(--border-hover)' },
    { label: 'Review', value: 8, color: 'var(--status-validation)' },
    { label: 'Pausado', value: 4, color: 'var(--priority-high)' },
  ];
  return (
    <div>
      <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
        {dist.map(d => <div key={d.label} style={{ width: `${d.value}%`, background: d.color }} />)}
      </div>
      {dist.map(d => (
        <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', fontSize: 11.5 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: d.color }} />
          <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{d.label}</span>
          <span className="mono" style={{ color: 'var(--text-ghost)' }}>{d.value}%</span>
        </div>
      ))}
    </div>
  );
};

// ─── Tasks tab (inside project) ───
const TasksTabView = ({ tasks, openTask }) => (
  <div className="card" style={{ padding: 0 }}>
    {tasks.map((t, i) => <TaskRow key={t.id} t={t} onClick={() => openTask(t.id)} last={i === tasks.length - 1} />)}
    {tasks.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-ghost)', fontSize: 12 }}>Sem tasks ainda.</div>}
  </div>
);

const DocsTabView = ({ projectId }) => {
  const docs = DOCS.filter(d => d.product === projectId);
  return (
    <div>
      {docs.map(d => <DocRow key={d.id} d={d} />)}
      {docs.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-ghost)', fontSize: 12 }}>Sem documentos ainda.</div>}
    </div>
  );
};

const DocRow = ({ d }) => (
  <div className="card hoverable" style={{ padding: '14px 18px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
    <div style={{ width: 34, height: 34, borderRadius: 7, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      <I.docs size={15} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{d.title}</div>
      <div style={{ fontSize: 10.5, color: 'var(--text-ghost)', marginTop: 2, display: 'flex', gap: 8 }}>
        <span>{DOC_TYPES[d.type]}</span><span>·</span>
        <span>{getPerson(d.author).name}</span><span>·</span>
        <span className="mono">v{d.version}</span>
      </div>
    </div>
    <span className="mono" style={{ fontSize: 10, color: 'var(--text-ghost)' }}>{d.updated.slice(5)}</span>
  </div>
);

const DecisionsTabView = ({ projectId }) => {
  const items = DECISIONS.filter(d => d.product === projectId);
  return (
    <div className="card" style={{ padding: 0 }}>
      {items.map((d, i) => (
        <div key={d.id} style={{ padding: '16px 20px', borderBottom: i < items.length - 1 ? '1px solid var(--border-subtle)' : 'none', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', marginTop: 7, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{d.title}</div>
            <div style={{ fontSize: 10.5, color: 'var(--text-ghost)', marginTop: 4 }}>{getPerson(d.by).name} · {d.date}</div>
          </div>
        </div>
      ))}
      {items.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-ghost)', fontSize: 12 }}>Sem decisões registradas.</div>}
    </div>
  );
};

const HistoryTabView = ({ projectId }) => (
  <div className="card" style={{ padding: 0 }}>
    {[
      { date: '2026-04-14', ev: 'Avançou para Tração', by: 'iv' },
      { date: '2026-03-20', ev: 'MRR cruzou R$ 30.000', by: 'mn' },
      { date: '2026-02-08', ev: 'Primeiro cliente pagante', by: 'rm' },
      { date: '2026-01-15', ev: 'Avançou de Validação para MVP', by: 'rm' },
      { date: '2025-12-01', ev: 'Hipótese v2 publicada', by: 'iv' },
      { date: '2025-03-14', ev: 'Projeto criado', by: 'iv' },
    ].map((e, i, arr) => (
      <div key={i} style={{ padding: '14px 20px', borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none', display: 'flex', alignItems: 'center', gap: 14 }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--text-ghost)', width: 80 }}>{e.date}</span>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-ghost)' }} />
        <span style={{ flex: 1, fontSize: 12.5, color: 'var(--text-primary)' }}>{e.ev}</span>
        <Avatar p={e.by} size={20} />
      </div>
    ))}
  </div>
);

const ReportsTabView = ({ projectId }) => {
  const rs = REPORTS.filter(r => r.product === projectId);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
      {rs.map(r => (
        <div key={r.id} className="card hoverable" style={{ padding: 18, cursor: 'pointer' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <span className="badge neutral">{r.type}</span>
            {r.ai && <span className="badge" style={{ background: 'rgba(139,92,246,0.08)', color: '#B49DF5', borderColor: 'rgba(139,92,246,0.2)' }}><I.sparkle size={9} /> AI</span>}
          </div>
          <h3 className="display" style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{r.title}</h3>
          <div style={{ fontSize: 10.5, color: 'var(--text-ghost)', marginTop: 8, display: 'flex', gap: 8 }}>
            <span className="mono">{r.period}</span><span>·</span>
            <span>{getPerson(r.author).name}</span>
          </div>
        </div>
      ))}
      {rs.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-ghost)', fontSize: 12, gridColumn: '1/-1' }}>Sem relatórios ainda.</div>}
    </div>
  );
};

Object.assign(window, { ProjectDetail, TaskRow });
