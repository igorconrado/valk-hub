// Projects listing
const ProjectsList = ({ goTo, onNew }) => {
  const [filter, setFilter] = React.useState('all');
  const phases = ['all', 'discovery', 'mvp', 'validation', 'traction', 'scale', 'paused'];
  const list = filter === 'all' ? PROJECTS : PROJECTS.filter(p => p.phase === filter);

  return (
    <div style={{ padding: '28px 36px 48px', maxWidth: 1440, animation: 'fadeUp 300ms var(--ease)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 className="display" style={{ fontSize: 24, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>Projetos</h1>
          <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: '6px 0 0' }}>{PROJECTS.length} produtos · {PROJECTS.filter(p=>p.phase!=='paused').length} ativos · {PROJECTS.filter(p=>p.phase==='paused').length} pausados</p>
        </div>
        <button className="btn primary" onClick={onNew}><I.plus size={13} stroke={2.5} /> Novo produto</button>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 22, flexWrap: 'wrap' }}>
        {phases.map(ph => (
          <button key={ph} onClick={() => setFilter(ph)} style={{
            padding: '5px 11px', fontSize: 11.5, fontWeight: 500, borderRadius: 6,
            border: '1px solid',
            borderColor: filter === ph ? 'var(--border-hover)' : 'var(--border-subtle)',
            background: filter === ph ? 'rgba(255,255,255,0.03)' : 'transparent',
            color: filter === ph ? 'var(--text-primary)' : 'var(--text-muted)',
            transition: 'all 150ms'
          }}>
            {ph === 'all' ? 'Todos' : phaseLabels[ph]}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {list.map((p, i) => (
          <button key={p.id} onClick={() => goTo('project:' + p.id)} className="card hoverable" style={{ textAlign: 'left', padding: 22, cursor: 'pointer', animation: `fadeUp 300ms var(--ease) ${i*40}ms both` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <HealthDot state={p.health} />
                <h3 className="display" style={{ fontSize: 19, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>{p.name}</h3>
                <PhaseBadge phase={p.phase} />
              </div>
              <button className="btn icon subtle" onClick={e => e.stopPropagation()}><I.more size={14} /></button>
            </div>

            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.55 }}>{p.tagline}</p>

            <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
              <span className="badge neutral"><I.target size={9} /> {p.thesis}</span>
              {p.phase !== 'discovery' && p.phase !== 'paused' && <span className="badge neutral"><I.bolt size={9} /> {p.sprint}</span>}
              {p.pauseReason && <span className="badge paused">pausado · {p.pauseReason.slice(0,28)}…</span>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar p={p.owner} size={22} />
                <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>{getPerson(p.owner).name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 10.5, color: 'var(--text-ghost)' }}>
                {p.mrr > 0 && <span className="mono">{brl(p.mrr)}<span style={{color:'var(--text-ghost)'}}> mrr</span></span>}
                {p.clients > 0 && <span className="mono">{p.clients} clientes</span>}
                <span className="mono">desde {p.since}</span>
              </div>
            </div>
          </button>
        ))}

        {/* Empty ghost card — "novo produto" call to action */}
        <button onClick={onNew} className="card" style={{ textAlign: 'center', padding: 22, cursor: 'pointer', border: '1px dashed var(--border-default)', background: 'transparent', color: 'var(--text-muted)', minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 200ms' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
          <I.plus size={18} stroke={1.5} />
          <span style={{ fontSize: 12, fontWeight: 500 }}>Novo produto</span>
          <span style={{ fontSize: 10.5, color: 'var(--text-ghost)' }}>começar um novo experimento</span>
        </button>
      </div>
    </div>
  );
};

window.ProjectsList = ProjectsList;
