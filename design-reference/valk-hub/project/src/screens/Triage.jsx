// VALK Hub — Traction Triage
// The "kill what doesn't work, scale what shows traction" moment, made concrete.

const GATE = {
  kiln:   { metric: 'MRR growth MoM',       target: 10,  unit: '%',    current: 12.4, lane: 'scale',  deadline: '2026-04-25' },
  ember:  { metric: 'Paying customers',      target: 15,  unit: '',     current: 11,   lane: 'risk',   deadline: '2026-04-30' },
  forge:  { metric: 'Time-to-first-deploy',  target: 2,   unit: 'd',    current: 3.2,  lane: 'hold',   deadline: '2026-05-10' },
  mirror: { metric: 'Organic signups/week',  target: 15,  unit: '/sem', current: 4,    lane: 'kill',   deadline: '2026-04-18' },
  anvil:  { metric: 'Net revenue retention', target: 100, unit: '%',    current: 118,  lane: 'scale',  deadline: '2026-05-15' },
  rune:   { metric: 'CAC payback',           target: 12,  unit: 'm',    current: 28,   lane: 'kill',   deadline: '2026-04-22' },
};

const LANES = [
  { id: 'scale', label: 'Escalar',    hint: 'Tração comprovada — dobrar aposta',     color: '#10B981', bar: 'linear-gradient(90deg, #10B98100 0%, #10B98155 50%, #10B98100 100%)' },
  { id: 'hold',  label: 'Manter',     hint: 'Em curso — gate ainda não atingido',    color: '#F59E0B', bar: 'linear-gradient(90deg, #F59E0B00 0%, #F59E0B55 50%, #F59E0B00 100%)' },
  { id: 'risk',  label: 'Em risco',   hint: 'Sinal fraco — ajustar ou preparar kill', color: '#F97316', bar: 'linear-gradient(90deg, #F9731600 0%, #F9731655 50%, #F9731600 100%)' },
  { id: 'kill',  label: 'Janela de kill', hint: 'Não bateu o gate — decidir já',     color: '#E24B4A', bar: 'linear-gradient(90deg, #E24B4A00 0%, #E24B4A77 50%, #E24B4A00 100%)' },
];

const LANE_META = Object.fromEntries(LANES.map(l => [l.id, l]));

const percent = (cur, target, inverted) => {
  if (inverted) return Math.max(0, Math.min(1.5, target / Math.max(cur, 0.001)));
  return Math.max(0, Math.min(1.5, cur / target));
};
const isInverted = (metric) => /time|cac payback/i.test(metric);

const daysUntil = (iso) => {
  const d = Math.ceil((new Date(iso) - new Date('2026-04-17')) / 86400000);
  return d;
};

const TriageScoreBar = ({ cur, target, inverted, color }) => {
  const p = percent(cur, target, inverted);
  const markerPct = Math.min(100, (1 / Math.max(p, 0.001)) * 100 * (p / 1)); // keep it simple
  const gatePos = 66; // gate fixed at 66% for visual rhythm; score fills relative to it
  const scorePct = Math.min(100, (p / 1.5) * 100);
  return (
    <div style={{ position: 'relative', height: 28 }}>
      {/* track */}
      <div style={{ position: 'absolute', inset: '12px 0', background: 'var(--border-subtle)', borderRadius: 2 }} />
      {/* score fill */}
      <div style={{
        position: 'absolute', left: 0, top: 12, bottom: 12, width: scorePct + '%',
        background: `linear-gradient(90deg, ${color}44, ${color})`,
        borderRadius: 2, transition: 'width 600ms var(--ease)',
      }} />
      {/* gate marker */}
      <div style={{ position: 'absolute', left: gatePos + '%', top: 2, bottom: 2, width: 1, background: 'rgba(255,255,255,0.35)' }}>
        <div style={{ position: 'absolute', top: -2, left: -3, width: 7, height: 7, borderRadius: '50%', background: '#F7F6F3', boxShadow: '0 0 0 2px var(--bg-1)' }} />
      </div>
      {/* gate label */}
      <div style={{ position: 'absolute', left: `calc(${gatePos}% + 8px)`, top: 0, fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>gate</div>
    </div>
  );
};

const TriageScreen = ({ goTo = () => {}, openProject = () => {} }) => {
  const [activeLane, setActiveLane] = React.useState(null);

  const enriched = PROJECTS.map(p => ({ ...p, gate: GATE[p.id] })).filter(p => p.gate);
  const byLane = Object.fromEntries(LANES.map(l => [l.id, enriched.filter(p => p.gate.lane === l.id)]));

  const counts = Object.fromEntries(LANES.map(l => [l.id, byLane[l.id].length]));
  const mrrAtRisk = enriched.filter(p => p.gate.lane === 'risk' || p.gate.lane === 'kill').reduce((s, p) => s + p.mrr, 0);
  const mrrScale  = enriched.filter(p => p.gate.lane === 'scale').reduce((s, p) => s + p.mrr, 0);
  const deadlineCritical = enriched.filter(p => daysUntil(p.gate.deadline) <= 3 && (p.gate.lane === 'kill' || p.gate.lane === 'risk')).length;

  return (
    <div style={{ padding: '28px 32px 60px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, gap: 24 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="label" style={{ color: 'var(--primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px rgba(226,75,74,0.6)' }} />
            Triage · semanal
          </div>
          <h1 className="display" style={{ fontSize: 34, fontWeight: 600, letterSpacing: '-0.02em', margin: 0, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            Aquela que escolhe.
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 8, maxWidth: 560, lineHeight: 1.6 }}>
            Cada produto do portfólio contra seu traction gate. O que passou, escala. O que não passou na janela, mata.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn ghost">Exportar</button>
          <button className="btn primary">Abrir comitê de triagem</button>
        </div>
      </div>

      {/* Top metric strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        <TriageStat label="MRR escalando" value={'R$ ' + mrrScale.toLocaleString('pt-BR')} sub={`${counts.scale} produto(s)`} color="#10B981" />
        <TriageStat label="MRR em risco"  value={'R$ ' + mrrAtRisk.toLocaleString('pt-BR')} sub={`${counts.risk + counts.kill} produto(s)`} color="#E24B4A" />
        <TriageStat label="Decisões na semana" value={deadlineCritical} sub="deadline ≤ 3 dias" color="#F59E0B" accent />
        <TriageStat label="Taxa de kill" value="33%" sub="2 de 6 produtos" color="var(--text-secondary)" mono />
      </div>

      {/* Lane filter row */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, alignItems: 'center' }}>
        <button onClick={() => setActiveLane(null)} style={laneFilterStyle(!activeLane)}>
          Todas <span style={{ color: 'var(--text-ghost)', fontFamily: 'var(--font-mono)', marginLeft: 6, fontSize: 10 }}>{enriched.length}</span>
        </button>
        {LANES.map(l => (
          <button key={l.id} onClick={() => setActiveLane(l.id === activeLane ? null : l.id)} style={laneFilterStyle(activeLane === l.id, l.color)}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: l.color, marginRight: 7, display: 'inline-block' }} />
            {l.label}
            <span style={{ color: 'var(--text-ghost)', fontFamily: 'var(--font-mono)', marginLeft: 6, fontSize: 10 }}>{counts[l.id]}</span>
          </button>
        ))}
      </div>

      {/* Lanes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
        {LANES.filter(l => !activeLane || l.id === activeLane).map(lane => (
          <TriageLane key={lane.id} lane={lane} projects={byLane[lane.id]} openProject={openProject} />
        ))}
      </div>

      {/* Bottom: policy footer */}
      <div style={{ marginTop: 48, padding: '20px 24px', background: 'var(--bg-1)', border: '1px solid var(--border-subtle)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-bg)', border: '1px solid var(--primary-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
          <I.bolt size={16} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Política da forja</div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.55 }}>
            Todo produto entra no portfólio com um gate explícito e uma janela. Não bateu na janela? Killamos sem drama. O tempo investido vira conhecimento, não inércia.
          </div>
        </div>
        <button className="btn ghost" style={{ flexShrink: 0 }}>Abrir playbook ↗</button>
      </div>
    </div>
  );
};

const laneFilterStyle = (on, color = 'var(--primary)') => ({
  padding: '6px 11px',
  fontSize: 12,
  fontWeight: 500,
  borderRadius: 7,
  border: '1px solid ' + (on ? color + '55' : 'var(--border-subtle)'),
  background: on ? color + '18' : 'transparent',
  color: on ? 'var(--text-primary)' : 'var(--text-secondary)',
  display: 'inline-flex',
  alignItems: 'center',
  transition: 'all 150ms var(--ease)',
});

const TriageStat = ({ label, value, sub, color, accent, mono }) => (
  <div style={{
    padding: '16px 18px',
    background: 'var(--bg-1)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  }}>
    {accent && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: color, opacity: 0.4 }} />}
    <div className="label" style={{ color: 'var(--text-muted)', fontSize: 9 }}>{label}</div>
    <div style={{
      fontFamily: 'var(--font-display)',
      fontSize: 26,
      fontWeight: 600,
      color: color,
      letterSpacing: '-0.02em',
      lineHeight: 1.1,
      marginTop: 8,
    }}>{value}</div>
    <div style={{ fontSize: 10.5, color: 'var(--text-ghost)', marginTop: 4, fontFamily: mono ? 'var(--font-mono)' : 'inherit' }}>{sub}</div>
  </div>
);

const TriageLane = ({ lane, projects, openProject }) => {
  return (
    <section>
      {/* Lane header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: lane.color, boxShadow: `0 0 10px ${lane.color}66` }} />
          <h2 className="display" style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', margin: 0, color: 'var(--text-primary)' }}>
            {lane.label}
          </h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-ghost)', marginLeft: 2 }}>
            {String(projects.length).padStart(2, '0')}
          </span>
        </div>
        <div style={{ flex: 1, height: 1, background: lane.bar }} />
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>{lane.hint}</span>
      </div>

      {/* Lane cards */}
      {projects.length === 0 ? (
        <div style={{
          border: '1px dashed var(--border-subtle)',
          borderRadius: 12, padding: '24px',
          color: 'var(--text-ghost)', fontSize: 12, textAlign: 'center',
          fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.12em',
        }}>
          nenhum produto nessa faixa
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14 }}>
          {projects.map(p => <TriageCard key={p.id} p={p} lane={lane} openProject={openProject} />)}
        </div>
      )}
    </section>
  );
};

const TriageCard = ({ p, lane, openProject }) => {
  const { gate } = p;
  const inv = isInverted(gate.metric);
  const pct = percent(gate.current, gate.target, inv);
  const passing = pct >= 1;
  const days = daysUntil(gate.deadline);
  const urgent = days <= 3 && !passing;

  const ctaLabel = ({ scale: 'Aprovar escala', hold: 'Ver sprint', risk: 'Plano de recuperação', kill: 'Abrir kill review' })[lane.id];

  return (
    <div
      className="card hoverable"
      style={{
        padding: 18,
        borderColor: urgent ? 'rgba(226,75,74,0.25)' : undefined,
        background: urgent ? 'linear-gradient(180deg, rgba(226,75,74,0.04) 0%, var(--bg-1) 60%)' : undefined,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={() => openProject(p.id)}
    >
      {/* subtle top accent */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: lane.color, opacity: passing ? 0.6 : 0.35 }} />

      {/* head */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <HealthDot state={p.health} />
          <span className="display" style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</span>
          <PhaseBadge phase={p.phase} />
        </div>
        <Avatar p={p.owner} size={22} />
      </div>

      {/* thesis */}
      <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginBottom: 14, lineHeight: 1.5, minHeight: 34 }}>
        {p.thesis} · <span style={{ color: 'var(--text-muted)' }}>{p.tagline}</span>
      </div>

      {/* Gate block */}
      <div style={{ padding: '12px 14px', background: 'var(--bg-0)', border: '1px solid var(--border-subtle)', borderRadius: 8, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="label" style={{ fontSize: 9 }}>Gate</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {gate.metric}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <span className="mono" style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: lane.color, letterSpacing: '-0.02em' }}>
              {gate.current}{gate.unit}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8, fontFamily: 'var(--font-mono)' }}>
              / {inv ? 'max' : 'min'} {gate.target}{gate.unit}
            </span>
          </div>
          <div style={{
            fontSize: 10, padding: '2px 7px', borderRadius: 4,
            background: passing ? 'rgba(16,185,129,0.08)' : 'rgba(226,75,74,0.08)',
            color: passing ? '#58D3AE' : '#E97675',
            fontWeight: 600, fontFamily: 'var(--font-mono)',
            letterSpacing: '0.04em',
          }}>
            {passing ? `+${Math.round((pct - 1) * 100)}%` : `−${Math.round((1 - pct) * 100)}%`}
          </div>
        </div>

        <TriageScoreBar cur={gate.current} target={gate.target} inverted={inv} color={lane.color} />
      </div>

      {/* deadline + cta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: urgent ? 'var(--primary)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <I.clock size={12} />
          {days > 0 ? `${days}d para decisão` : days === 0 ? 'hoje' : `atrasado ${-days}d`}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); openProject(p.id); }}
          style={{
            fontSize: 11.5, fontWeight: 600, padding: '6px 10px', borderRadius: 6,
            background: lane.id === 'kill' ? 'var(--primary)' : 'transparent',
            color: lane.id === 'kill' ? '#fff' : lane.color,
            border: lane.id === 'kill' ? 'none' : `1px solid ${lane.color}44`,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            transition: 'all 150ms',
          }}
        >
          {ctaLabel}
          <I.chevronR size={11} stroke={2.2} />
        </button>
      </div>
    </div>
  );
};

Object.assign(window, { TriageScreen });
