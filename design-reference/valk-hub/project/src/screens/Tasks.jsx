// Tasks screen (global) — list + kanban views
const TasksScreen = ({ openTask, onNew, initialView = 'list' }) => {
  const [view, setView] = React.useState(initialView);
  const [filters, setFilters] = React.useState({ product: 'all', status: 'all', type: 'all', assignee: 'all', priority: 'all' });
  const [tasks, setTasks] = React.useState(TASKS);

  const filtered = tasks.filter(t => {
    if (filters.product !== 'all' && t.product !== filters.product) return false;
    if (filters.status !== 'all' && t.status !== filters.status) return false;
    if (filters.type !== 'all' && t.type !== filters.type) return false;
    if (filters.assignee !== 'all' && t.assignee !== filters.assignee) return false;
    if (filters.priority !== 'all' && t.priority !== filters.priority) return false;
    return true;
  });

  const moveTask = (id, status) => setTasks(ts => ts.map(t => t.id === id ? { ...t, status } : t));

  return (
    <div style={{ padding: '28px 36px 48px', maxWidth: 1600, animation: 'fadeUp 300ms var(--ease)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h1 className="display" style={{ fontSize: 24, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>Tasks</h1>
          <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: '6px 0 0' }}>{filtered.length} de {tasks.length} · {tasks.filter(t=>t.status==='doing').length} em progresso · {tasks.filter(t=>t.status==='hold').length} pausadas</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Segmented value={view} onChange={setView} options={[
            { value: 'list', label: 'Lista', icon: <I.list size={12} /> },
            { value: 'kanban', label: 'Kanban', icon: <I.grid size={12} /> },
          ]} />
          <button className="btn primary" onClick={onNew}><I.plus size={13} stroke={2.5} /> Nova task</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap', alignItems: 'center' }}>
        <I.filter size={13} style={{ color: 'var(--text-muted)' }} />
        <FilterPill label="Produto" value={filters.product} onChange={v => setFilters({...filters, product: v})} options={[['all','Todos'], ...PROJECTS.map(p => [p.id, p.name])]} />
        <FilterPill label="Status" value={filters.status} onChange={v => setFilters({...filters, status: v})} options={[['all','Todos'], ...TASK_STATUS.map(s => [s, STATUS_LABELS[s]])]} />
        <FilterPill label="Tipo" value={filters.type} onChange={v => setFilters({...filters, type: v})} options={[['all','Todos'], ...Object.entries(TASK_TYPES).map(([k,v]) => [k, v.label])]} />
        <FilterPill label="Responsável" value={filters.assignee} onChange={v => setFilters({...filters, assignee: v})} options={[['all','Todos'], ...PEOPLE.map(p => [p.id, p.name])]} />
        <FilterPill label="Prioridade" value={filters.priority} onChange={v => setFilters({...filters, priority: v})} options={[['all','Todas'], ['urgent','Urgente'], ['high','Alta'], ['medium','Média'], ['low','Baixa']]} />
      </div>

      {view === 'list' ? (
        <div className="card" style={{ padding: 0 }}>
          {filtered.map((t, i) => <TaskRow key={t.id} t={t} onClick={() => openTask(t.id)} last={i === filtered.length - 1} />)}
          {filtered.length === 0 && <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-ghost)', fontSize: 12 }}>Nenhuma task encontrada com esses filtros.</div>}
        </div>
      ) : (
        <Kanban tasks={filtered} moveTask={moveTask} openTask={openTask} />
      )}
    </div>
  );
};

const FilterPill = ({ label, value, options, onChange }) => {
  const [open, setOpen] = React.useState(false);
  const current = options.find(o => o[0] === value);
  const active = value !== 'all';
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 10px', fontSize: 11.5, fontWeight: 500, borderRadius: 6,
        border: '1px solid', borderColor: active ? 'var(--primary-border)' : 'var(--border-subtle)',
        background: active ? 'var(--primary-bg)' : 'transparent',
        color: active ? 'var(--primary)' : 'var(--text-muted)',
      }}>
        <span style={{ opacity: 0.7 }}>{label}:</span> {current?.[1] || 'Todos'}
        <I.chevronD size={10} stroke={2} />
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: 'var(--bg-elev)', border: '1px solid var(--border-default)', borderRadius: 8, padding: 4, minWidth: 160, maxHeight: 300, overflow: 'auto', zIndex: 20, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
            {options.map(([k, v]) => (
              <button key={k} onClick={() => { onChange(k); setOpen(false); }} style={{
                display: 'block', width: '100%', padding: '6px 10px', fontSize: 12, textAlign: 'left', borderRadius: 5,
                color: k === value ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: k === value ? 'rgba(255,255,255,0.04)' : 'transparent'
              }} onMouseEnter={e => k !== value && (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')} onMouseLeave={e => k !== value && (e.currentTarget.style.background = 'transparent')}>{v}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const Kanban = ({ tasks, moveTask, openTask }) => {
  const [drag, setDrag] = React.useState(null);
  const cols = TASK_STATUS;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, minHeight: 500 }}>
      {cols.map(col => {
        const items = tasks.filter(t => t.status === col);
        return (
          <div key={col} onDragOver={e => e.preventDefault()} onDrop={() => { if (drag) moveTask(drag, col); setDrag(null); }} style={{ background: 'var(--bg-1)', border: '1px solid var(--border-subtle)', borderRadius: 10, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{STATUS_LABELS[col]}</span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-ghost)' }}>{items.length}</span>
            </div>
            <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              {items.map(t => {
                const type = TASK_TYPES[t.type];
                const proj = getProject(t.product);
                return (
                  <div key={t.id} draggable onDragStart={() => setDrag(t.id)} onDragEnd={() => setDrag(null)} onClick={() => openTask(t.id)} className="kcard" style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 12, cursor: 'grab',
                    opacity: drag === t.id ? 0.4 : 1, transition: 'all 150ms'
                  }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <span className={`pri ${t.priority}`} />
                      <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-ghost)' }}>{t.id}</span>
                      {t.linear && <span style={{ fontSize: 9, color: '#8B5CF6', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>↗ {t.linear}</span>}
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 10 }}>{t.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span className="badge" style={{ background: `${type.color}14`, color: type.color, borderColor: `${type.color}22` }}>{type.label}</span>
                      {proj && <span className="badge neutral">{proj.name}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-subtle)', gap: 8 }}>
                      <Avatar p={t.assignee} size={18} />
                      <span style={{ fontSize: 10.5, color: 'var(--text-ghost)' }}>{getPerson(t.assignee).initials}</span>
                      <span style={{ flex: 1 }} />
                      <span className="mono" style={{ fontSize: 10, color: 'var(--text-ghost)' }}>{t.due?.slice(5)}</span>
                    </div>
                  </div>
                );
              })}
              <button style={{ padding: 8, fontSize: 11, color: 'var(--text-ghost)', border: '1px dashed var(--border-subtle)', borderRadius: 6, marginTop: 'auto' }}><I.plus size={11} /> Nova</button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

window.TasksScreen = TasksScreen;
