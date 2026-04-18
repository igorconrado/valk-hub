// Dashboard screen — traction triage is the hero
const Dashboard = ({ goTo }) => {
  const dateStr = 'sexta-feira, 17 de abril · Sprint S-14';

  // Sort projects by triage urgency: kill > risk > hold > scale
  const triageOrder = { kill: 0, risk: 1, hold: 2, scale: 3 };
  const triaged = PROJECTS
    .map(p => ({ p, t: triageOf(p.id) }))
    .filter(x => x.t)
    .sort((a, b) => triageOrder[a.t.verdict] - triageOrder[b.t.verdict]);

  const counts = {
    scale: triaged.filter(x => x.t.verdict === 'scale').length,
    hold:  triaged.filter(x => x.t.verdict === 'hold').length,
    risk:  triaged.filter(x => x.t.verdict === 'risk').length,
    kill:  triaged.filter(x => x.t.verdict === 'kill').length,
  };

  // Hero: consolidated MRR
  const mrrTotal = PROJECTS.reduce((s, p) => s + (p.mrr || 0), 0);

  const pending = [
    { id: 'p1', title: 'Aprovar kill-or-scale de Mirror', due: 'hoje', priority: 'urgent', decision: true },
    { id: 'p2', title: 'Revisar spec de Conciliação Anvil', due: 'hoje', priority: 'high' },
    { id: 'p3', title: 'Responder e-mail Nuvemshop', due: 'amanhã', priority: 'high' },
    { id: 'p4', title: 'Preparar deck do comitê semanal', due: '18 abr', priority: 'medium' },
  ];

  return (
    <div style={{ padding: '28px 36px 48px', maxWidth: 1520, animation: 'fadeUp 300ms var(--ease)' }}>
      {/* ─── Forged hero: consolidated metric + date + triage summary ─── */}
      <section style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 28, marginBottom: 40, alignItems: 'end' }}>
        <div>
          <p style={{ fontSize: 11, color: 'var(--text-faint)', margin: '0 0 10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{dateStr}</p>
          <div className="hero-num">R$ {(mrrTotal / 1000).toFixed(1).replace('.', ',')}<span style={{ color: 'var(--text-muted)', fontSize: '0.5em' }}>k</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>MRR consolidado · abr/26</span>
            <span className="mono" style={{ fontSize: 12, color: 'var(--status-traction)' }}>↑ 8,3%</span>
            <span style={{ fontSize: 11, color: 'var(--text-ghost)' }}>vs. mar</span>
          </div>
        </div>

        {/* Triage tally */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: '1px solid var(--border-subtle)', borderRadius: 12, overflow: 'hidden', background: 'var(--bg-1)' }}>
          <TriageTally label="Scale" count={counts.scale} color="#58D3AE" bg="rgba(16,185,129,0.04)" />
          <TriageTally label="On track" count={counts.hold} color="var(--text-secondary)" />
          <TriageTally label="At risk" count={counts.risk} color="#F5BD5C" bg="rgba(245,158,11,0.04)" />
          <TriageTally label="Kill" count={counts.kill} color="var(--primary)" bg="rgba(226,75,74,0.06)" pulse={counts.kill > 0} last />
        </div>
      </section>

      {/* ─── Traction triage board — the hero ─── */}
      <section style={{ marginBottom: 44 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h2 className="display" style={{ fontSize: 20, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>Triagem de tração</h2>
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: '4px 0 0' }}>Cada produto medido contra seu gate. O que não cresce, morre.</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-ghost)' }}>ordenado por urgência</span>
            <button className="btn subtle" style={{ fontSize: 11.5 }}>Playbook kill-or-scale</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {triaged.map(({ p, t }) => (
            <DashTriageCard key={p.id} p={p} t={t} onClick={() => goTo('project:' + p.id)} />
          ))}
        </div>
      </section>

      {/* ─── Supporting row: decisions + pending + activity ─── */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 36 }}>
        {/* Pending — weighted toward decisions */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 className="label">Pendentes · Igor</h2>
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-ghost)' }}>{pending.length}</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pending.map(p => (
              <li key={p.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0' }}>
                {p.decision ? (
                  <span style={{ width: 14, height: 14, borderRadius: 3, background: 'rgba(226,75,74,0.12)', border: '1px solid rgba(226,75,74,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--primary)' }} />
                  </span>
                ) : (
                  <button style={{ width: 14, height: 14, border: '1.5px solid var(--border-default)', borderRadius: 4, flexShrink: 0, transition: 'all 150ms' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'} />
                )}
                <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1, lineHeight: 1.4 }}>{p.title}</span>
                {p.decision && <span style={{ fontSize: 9, color: 'var(--primary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>decisão</span>}
                <span style={{ fontSize: 10, color: p.due === 'hoje' ? 'var(--primary)' : 'var(--text-ghost)', fontFamily: 'var(--font-mono)' }}>{p.due}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Decisions recent */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 className="label">Decisões recentes</h2>
            <button style={{ fontSize: 11, color: 'var(--text-muted)' }}>todas</button>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {DECISIONS.map(d => {
              const proj = getProject(d.product);
              return (
                <li key={d.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--text-ghost)', width: 36, paddingTop: 2 }}>{d.date.slice(5)}</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12.5, color: 'var(--text-primary)', lineHeight: 1.45 }}>{d.title}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-ghost)', marginTop: 3 }}>{proj?.name} · {getPerson(d.by).name}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Activity */}
      <section>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 className="label">O que aconteceu</h2>
          <button style={{ fontSize: 11, color: 'var(--text-muted)' }}>ver tudo</button>
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {ACTIVITY.map((a, i) => (
            <div key={i} style={{ padding: '13px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: i < ACTIVITY.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
              <Avatar p={a.who} size={22} />
              <div style={{ flex: 1, fontSize: 12.5, color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{getPerson(a.who).name}</span>{' '}
                <span style={{ color: 'var(--text-muted)' }}>{a.verb}</span>{' '}
                <span style={{ color: 'var(--text-primary)' }}>{a.what}</span>
              </div>
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-ghost)' }}>{a.when}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// ─── Triage tally cell ───
const TriageTally = ({ label, count, color, bg, pulse, last }) => (
  <div style={{
    padding: '16px 18px',
    background: bg || 'transparent',
    borderRight: last ? 'none' : '1px solid var(--border-subtle)',
    display: 'flex', flexDirection: 'column', gap: 4,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span className={pulse ? 'pulse-dot' : ''} style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
      <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 600 }}>{label}</span>
    </div>
    <span className="display" style={{ fontSize: 26, fontWeight: 600, color, lineHeight: 1, letterSpacing: '-0.02em' }}>{count}</span>
  </div>
);

// ─── Dashboard triage card (compact) ───
const DashTriageCard = ({ p, t, onClick }) => {
  const pct = Math.min(t.progress, 1.3);
  const barWidth = Math.min(pct * 100, 130);
  const color = t.verdict === 'scale' ? '#58D3AE' : t.verdict === 'risk' ? '#F5BD5C' : t.verdict === 'kill' ? 'var(--primary)' : 'var(--text-secondary)';

  const formatActual = () => {
    if (t.unit === 'brl') return 'R$ ' + (t.actual / 1000).toFixed(0) + 'k';
    if (t.unit === 'ratio') return t.actual.toFixed(1) + '×';
    return t.actual;
  };
  const formatTarget = () => {
    if (t.unit === 'brl') return 'R$ ' + (t.target / 1000).toFixed(0) + 'k';
    if (t.unit === 'ratio') return t.target.toFixed(1) + '×';
    return t.target;
  };

  // Mini sparkline
  const spark = t.trend;
  const sMax = Math.max(...spark), sMin = Math.min(...spark);
  const sPts = spark.map((v, i) => {
    const x = (i / (spark.length - 1)) * 100;
    const y = 100 - ((v - sMin) / (sMax - sMin || 1)) * 100;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <button onClick={onClick} className={`triage-card ${t.verdict}`}>
      {/* Top row: name, verdict */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, position: 'relative' }}>
        <span className="display" style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{p.name}</span>
        <PhaseBadge phase={p.phase} />
        <span className={`verdict ${t.verdict}`} style={{ marginLeft: 'auto' }}>
          {t.verdict === 'scale' && '↑ scale'}
          {t.verdict === 'hold' && '→ on track'}
          {t.verdict === 'risk' && '△ at risk'}
          {t.verdict === 'kill' && '✕ kill'}
        </span>
      </div>

      {/* Gate line */}
      <div className="gate-line" style={{ marginBottom: 14 }}>
        <span style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 600, display: 'block', marginBottom: 3 }}>Gate</span>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t.gate}</span>
      </div>

      {/* Actual vs target — big number */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginBottom: 12, position: 'relative' }}>
        <div>
          <div style={{ fontSize: 9.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 600, marginBottom: 4 }}>{t.metric}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="display" style={{ fontSize: 30, fontWeight: 600, color, lineHeight: 1, letterSpacing: '-0.02em' }}>{formatActual()}</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-ghost)' }}>/ {formatTarget()}</span>
          </div>
        </div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: 80, height: 32, flexShrink: 0 }}>
          <polyline points={sPts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>

      {/* Heat bar — progress toward gate, overflow shows scaling */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <div className="heatbar">
          <span style={{ width: `${Math.min(barWidth, 100)}%`, background: color }} />
        </div>
        {/* Gate marker at 100% */}
        <span style={{ position: 'absolute', top: -2, left: '100%', transform: 'translateX(-50%)', width: 1, height: 8, background: 'var(--text-ghost)' }} />
        {barWidth > 100 && (
          <div style={{ position: 'absolute', top: 0, left: '100%', width: `${barWidth - 100}%`, maxWidth: '30%', height: 4, background: color, opacity: 0.5, borderRadius: 2 }} />
        )}
      </div>

      {/* Footer note + action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar p={p.owner} size={18} />
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.note}</span>
      </div>

      {/* Decision due pip */}
      {t.decisionDue && (
        <div style={{ marginTop: 12, padding: '8px 10px', background: 'rgba(226,75,74,0.06)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--primary)' }} className="pulse-dot" />
          <span style={{ fontSize: 10.5, color: 'var(--primary)', fontWeight: 500 }}>Decisão em {t.decisionDue.slice(5)}</span>
          <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>→</span>
        </div>
      )}
    </button>
  );
};

window.Dashboard = Dashboard;
window.DashTriageCard = DashTriageCard;
