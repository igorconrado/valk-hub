// Task detail side panel + Create task dialog
const TaskPanel = ({ taskId, onClose }) => {
  const t = TASKS.find(x => x.id === taskId);
  if (!t) return null;
  const type = TASK_TYPES[t.type];
  const proj = getProject(t.product);

  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 40, animation: 'fadeUp 200ms var(--ease)' }} />
      <aside style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 480, background: 'var(--bg-1)', borderLeft: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-panel)', zIndex: 50, display: 'flex', flexDirection: 'column', animation: 'slideInRight 250ms var(--ease)' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.id}</span>
          {t.linear && <span style={{ fontSize: 10, color: '#B49DF5', fontFamily: 'var(--font-mono)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><I.link size={10} /> {t.linear}</span>}
          <span style={{ flex: 1 }} />
          <button className="btn icon subtle"><I.more size={14} /></button>
          <button className="btn icon subtle" onClick={onClose}><I.x size={14} /></button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          <h2 className="display" style={{ fontSize: 20, fontWeight: 600, margin: '0 0 16px', letterSpacing: '-0.01em', lineHeight: 1.35 }}>{t.title}</h2>

          <div style={{ display: 'flex', gap: 6, marginBottom: 22, flexWrap: 'wrap' }}>
            <span className="badge neutral">{STATUS_LABELS[t.status]}</span>
            <span className="badge" style={{ background: `${type.color}14`, color: type.color, borderColor: `${type.color}22` }}>{type.label}</span>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)', borderColor: 'var(--border-subtle)' }}><span className={`pri ${t.priority}`} /> {t.priority}</span>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 0, marginBottom: 22 }}>
            <DetailRow label="Responsável" value={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Avatar p={t.assignee} size={20} /> <span>{getPerson(t.assignee).name}</span></div>} />
            <DetailRow label="Produto" value={proj ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><HealthDot state={proj.health} /> {proj.name}</span> : '—'} />
            <DetailRow label="Data limite" value={<span className="mono" style={{ color: 'var(--text-primary)' }}>{t.due}</span>} />
            <DetailRow label="Tipo" value={<span style={{ color: type.color }}>{type.label}{type.linearSync && <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--text-ghost)', fontFamily: 'var(--font-mono)' }}>↗ sincroniza com Linear</span>}</span>} last />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div className="label" style={{ marginBottom: 10 }}>Descrição</div>
            <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.65, margin: 0 }}>{t.desc || <span style={{ color: 'var(--text-ghost)', fontStyle: 'italic' }}>Sem descrição.</span>}</p>
          </div>

          {t.blocker && (
            <div style={{ padding: 16, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.18)', borderRadius: 10, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--priority-high)' }} />
                <span style={{ fontSize: 11, color: 'var(--priority-high)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Bloqueado</span>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--text-primary)', margin: 0, lineHeight: 1.55 }}>{t.blocker.reason}</p>
              <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                desbloqueável por <Avatar p={t.blocker.by} size={16} /> {getPerson(t.blocker.by).name}
              </div>
            </div>
          )}

          {t.tags && t.tags.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div className="label" style={{ marginBottom: 8 }}>Tags</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {t.tags.map(tag => <span key={tag} className="badge neutral">#{tag}</span>)}
              </div>
            </div>
          )}

          <div>
            <div className="label" style={{ marginBottom: 12 }}>Atividade</div>
            {[
              { who: 'td', text: 'moveu para Em progresso', when: '3min' },
              { who: 'iv', text: 'atribuiu para Théo', when: '2h' },
              { who: 'iv', text: `criou esta task`, when: 'ontem' },
            ].map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', fontSize: 12, alignItems: 'center', borderBottom: i < 2 ? '1px solid var(--border-subtle)' : 'none' }}>
                <Avatar p={a.who} size={20} />
                <span style={{ color: 'var(--text-secondary)', flex: 1 }}><span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{getPerson(a.who).name}</span> {a.text}</span>
                <span className="mono" style={{ fontSize: 10, color: 'var(--text-ghost)' }}>{a.when}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: 14, borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 8 }}>
          <input className="input" placeholder="Comentar…" style={{ flex: 1, padding: '9px 12px' }} />
          <button className="btn primary">Enviar</button>
        </div>
      </aside>
    </>
  );
};

const DetailRow = ({ label, value, last }) => (
  <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: last ? 'none' : '1px solid var(--border-subtle)', fontSize: 12.5 }}>
    <span style={{ width: 110, color: 'var(--text-muted)', fontSize: 11 }}>{label}</span>
    <span style={{ color: 'var(--text-primary)', flex: 1 }}>{value}</span>
  </div>
);

// ─── Create Task Dialog ───
const CreateTaskDialog = ({ onClose }) => {
  const [type, setType] = React.useState('dev');
  const isDev = type === 'dev';
  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 60, animation: 'fadeUp 200ms var(--ease)' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 480, maxHeight: '90%', overflow: 'auto', background: 'var(--bg-1)', border: '1px solid var(--border-default)', borderRadius: 14, padding: 28, zIndex: 70, animation: 'scaleIn 200ms var(--ease)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 className="display" style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>Nova task</h2>
          <button className="btn icon subtle" onClick={onClose}><I.x size={14} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Título">
            <input className="input" placeholder="Ex: Implementar retry inteligente em pix" autoFocus />
          </Field>
          <Field label="Descrição">
            <textarea className="input" rows={3} placeholder="Contexto, links, critérios de aceite…" style={{ resize: 'vertical', minHeight: 80 }} />
          </Field>

          <Field label="Tipo">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Object.entries(TASK_TYPES).map(([k, v]) => (
                <button key={k} onClick={() => setType(k)} style={{
                  padding: '6px 11px', fontSize: 11.5, fontWeight: 500, borderRadius: 6,
                  border: '1px solid', borderColor: type === k ? `${v.color}33` : 'var(--border-subtle)',
                  background: type === k ? `${v.color}14` : 'transparent',
                  color: type === k ? v.color : 'var(--text-muted)',
                }}>{v.label}</button>
              ))}
            </div>
            {isDev && <div style={{ marginTop: 8, fontSize: 11, color: '#B49DF5', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 6 }}><I.arrowUpRight size={11} /> Sincroniza com o Linear</div>}
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Produto"><Select options={PROJECTS.map(p => [p.id, p.name])} /></Field>
            <Field label="Responsável"><Select options={PEOPLE.map(p => [p.id, p.name])} /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Prioridade"><Select options={[['urgent','Urgente'],['high','Alta'],['medium','Média'],['low','Baixa']]} /></Field>
            <Field label="Data limite"><input className="input" type="date" defaultValue="2026-04-25" /></Field>
          </div>

          <Field label="Tags">
            <input className="input" placeholder="churn, pagamentos…" />
          </Field>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
          <button className="btn ghost" onClick={onClose}>Cancelar</button>
          <button className="btn primary" onClick={onClose}>Criar task</button>
        </div>
      </div>
    </>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label className="label" style={{ display: 'block', marginBottom: 7 }}>{label}</label>
    {children}
  </div>
);

const Select = ({ options }) => (
  <div style={{ position: 'relative' }}>
    <select className="input" style={{ appearance: 'none', paddingRight: 32 }}>
      {options.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
    </select>
    <I.chevronD size={12} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
  </div>
);

Object.assign(window, { TaskPanel, CreateTaskDialog });
