// Mobile screens — 390x844 — wrapped inside an iOS-style frame

const MobileFrame = ({ title, children, back, onBack, rightAction, tabBar = true }) => (
  <div style={{ width: 390, height: 844, background: 'var(--bg-0)', borderRadius: 44, overflow: 'hidden', position: 'relative', border: '8px solid #0a0a0a', boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 0 0 1px #1a1a1a' }}>
    {/* Status bar */}
    <div style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
      <span>9:41</span>
      <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 110, height: 28, background: '#000', borderRadius: 16 }} />
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <svg width="16" height="10" viewBox="0 0 16 10"><rect x="0" y="4" width="3" height="6" fill="currentColor" rx="0.5"/><rect x="4" y="2" width="3" height="8" fill="currentColor" rx="0.5"/><rect x="8" y="0" width="3" height="10" fill="currentColor" rx="0.5"/><rect x="12" y="0" width="3" height="10" fill="currentColor" rx="0.5" opacity="0.5"/></svg>
        <svg width="22" height="10" viewBox="0 0 22 10" fill="none"><rect x="1" y="1" width="18" height="8" rx="2" stroke="currentColor" strokeOpacity="0.6"/><rect x="2" y="2" width="14" height="6" rx="1" fill="currentColor"/></svg>
      </div>
    </div>

    {/* Header */}
    {title && (
      <div style={{ padding: '6px 18px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border-subtle)' }}>
        {back && <button onClick={onBack} style={{ color: 'var(--primary)', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 2 }}><I.chevronL size={14} /></button>}
        <span className="display" style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{title}</span>
        {rightAction}
      </div>
    )}

    <div style={{ height: `calc(100% - ${(tabBar ? 86 : 0) + (title ? 98 : 48)}px)`, overflow: 'auto' }}>
      {children}
    </div>

    {tabBar && (
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 86, background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid var(--border-subtle)', display: 'flex', paddingTop: 10, paddingBottom: 20 }}>
        {[
          ['dashboard', I.dashboard, 'Home'],
          ['projects', I.projects, 'Produtos'],
          ['tasks', I.tasks, 'Tasks'],
          ['docs', I.docs, 'Docs'],
          ['more', I.menu, 'Mais'],
        ].map(([id, Ic, label], i) => (
          <button key={id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: i === 0 ? 'var(--text-primary)' : 'var(--text-faint)' }}>
            <Ic size={20} />
            <span style={{ fontSize: 10, fontWeight: 500 }}>{label}</span>
          </button>
        ))}
      </div>
    )}
  </div>
);

// Mobile Login
const MobileLogin = () => (
  <MobileFrame tabBar={false}>
    <div style={{ padding: '30px 28px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ textAlign: 'center', marginTop: 60, marginBottom: 'auto' }}>
        <div className="display" style={{ fontSize: 44, fontWeight: 600, letterSpacing: '0.2em', color: 'var(--text-primary)' }}>VALK</div>
        <div style={{ width: 32, height: 1, background: 'var(--primary)', margin: '14px auto', opacity: 0.8 }} />
        <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.3em', fontWeight: 500 }}>software</div>
        <div style={{ marginTop: 32, fontSize: 11, fontStyle: 'italic', color: 'var(--text-ghost)' }}>"Aquela que escolhe"</div>
      </div>
      <div>
        <label className="label" style={{ display: 'block', marginBottom: 8 }}>E-mail</label>
        <input className="input" placeholder="nome@valk.software" defaultValue="igor@valk.software" />
        <button className="btn primary" style={{ width: '100%', marginTop: 14, padding: 13, fontSize: 12, letterSpacing: '0.14em', fontWeight: 600 }}>ACESSAR</button>
        <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-ghost)', marginTop: 24 }}>VALK SOFTWARE © 2026</div>
      </div>
    </div>
  </MobileFrame>
);

// Mobile Dashboard
const MobileDashboard = () => (
  <MobileFrame title="Hub" rightAction={<button className="btn icon subtle"><I.bell size={16} /></button>}>
    <div style={{ padding: '20px 18px' }}>
      <h2 className="display" style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Bom dia, Igor.</h2>
      <p style={{ fontSize: 11.5, color: 'var(--text-faint)', margin: '4px 0 22px' }}>sex, 17 abr · S-14</p>

      <div className="label" style={{ marginBottom: 10 }}>Números do mês</div>
      <div className="card" style={{ padding: 18, marginBottom: 22 }}>
        <MetricValue value={245750} prefix="R$ " delta={8.3} />
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>MRR consolidado</div>
        <Sparkline data={[180,184,190,195,210,224,238,245]} w={340} h={40} />
      </div>

      <div className="label" style={{ marginBottom: 10 }}>Em andamento</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
        {PROJECTS.filter(p=>p.phase!=='paused').slice(0,3).map(p => (
          <div key={p.id} className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <HealthDot state={p.health} />
            <span className="display" style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{p.name}</span>
            <PhaseBadge phase={p.phase} />
          </div>
        ))}
      </div>

      <div className="label" style={{ marginBottom: 10 }}>Pendentes hoje</div>
      <div className="card" style={{ padding: 0 }}>
        {[{t:'Aprovar kill Mirror',d:'hoje'},{t:'Revisar spec Anvil',d:'hoje'},{t:'Responder Nuvemshop',d:'amanhã'}].map((p,i,a) => (
          <div key={i} style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: i<a.length-1?'1px solid var(--border-subtle)':'none' }}>
            <span style={{ width: 14, height: 14, border: '1.5px solid var(--border-default)', borderRadius: 4 }} />
            <span style={{ flex: 1, fontSize: 12.5 }}>{p.t}</span>
            <span className="mono" style={{ fontSize: 10, color: p.d==='hoje'?'var(--primary)':'var(--text-ghost)' }}>{p.d}</span>
          </div>
        ))}
      </div>
    </div>
  </MobileFrame>
);

// Mobile Projects
const MobileProjects = () => (
  <MobileFrame title="Projetos" rightAction={<button className="btn icon subtle"><I.plus size={16} stroke={2.5} /></button>}>
    <div style={{ padding: '16px 18px' }}>
      {PROJECTS.map(p => (
        <div key={p.id} className="card" style={{ padding: 16, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <HealthDot state={p.health} />
            <span className="display" style={{ fontSize: 16, fontWeight: 600, flex: 1 }}>{p.name}</span>
            <PhaseBadge phase={p.phase} />
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--text-tertiary)', margin: '0 0 10px', lineHeight: 1.5 }}>{p.tagline}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: 'var(--text-ghost)' }}>
            <Avatar p={p.owner} size={18} />
            <span>{getPerson(p.owner).name}</span>
            {p.mrr > 0 && <><span>·</span><span className="mono">{brl(p.mrr)}</span></>}
          </div>
        </div>
      ))}
    </div>
  </MobileFrame>
);

// Mobile Project Detail — horizontal tabs
const MobileProjectDetail = () => {
  const p = PROJECTS[0];
  const [tab, setTab] = React.useState('sprint');
  const tabs = ['Sprint','Tasks','Docs','Métricas','Decisões'];
  return (
    <MobileFrame title={p.name} back onBack={() => {}}>
      <div style={{ padding: '14px 18px 0' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          <PhaseBadge phase={p.phase} />
          <span className="badge neutral"><I.target size={9} /> {p.thesis}</span>
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--text-primary)', fontStyle: 'italic', padding: 12, background: 'var(--bg-1)', border: '1px solid var(--border-subtle)', borderRadius: 8, margin: '10px 0 14px', lineHeight: 1.55 }}>"{p.hypothesis}"</p>
      </div>
      <div style={{ borderBottom: '1px solid var(--border-subtle)', overflowX: 'auto', display: 'flex', padding: '0 12px', whiteSpace: 'nowrap', scrollbarWidth: 'none' }}>
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 14px', fontSize: 12, fontWeight: 500, position: 'relative',
            color: tab === t ? 'var(--text-primary)' : 'var(--text-faint)'
          }}>
            {t}
            {tab === t && <span style={{ position: 'absolute', bottom: -1, left: 8, right: 8, height: 2, background: 'var(--primary)' }} />}
          </button>
        ))}
      </div>
      <div style={{ padding: '16px 18px' }}>
        <div className="card" style={{ padding: 16, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="label">{p.sprint} · 10 → 24 abr</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-ghost)' }}>{Math.round(p.sprintProgress*100)}%</span>
          </div>
          <Progress value={p.sprintProgress} h={3} />
        </div>
        {TASKS.filter(t => t.product === p.id).slice(0,4).map(t => (
          <div key={t.id} className="card" style={{ padding: 12, marginBottom: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className={`pri ${t.priority}`} />
            <span style={{ flex: 1, fontSize: 12, lineHeight: 1.4 }}>{t.title}</span>
            <Avatar p={t.assignee} size={18} />
          </div>
        ))}
      </div>
    </MobileFrame>
  );
};

// Mobile Tasks Kanban — horizontal scroll
const MobileKanban = () => {
  const cols = TASK_STATUS;
  return (
    <MobileFrame title="Tasks" rightAction={<button className="btn icon subtle"><I.plus size={16} stroke={2.5} /></button>}>
      <div style={{ display: 'flex', gap: 10, padding: '14px 18px', overflowX: 'auto', height: '100%', scrollbarWidth: 'none' }}>
        {cols.map(col => {
          const items = TASKS.filter(t => t.status === col);
          return (
            <div key={col} style={{ flex: '0 0 260px', background: 'var(--bg-1)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px 10px', fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                <span>{STATUS_LABELS[col]}</span>
                <span className="mono" style={{ color: 'var(--text-ghost)' }}>{items.length}</span>
              </div>
              {items.slice(0,3).map(t => {
                const type = TASK_TYPES[t.type];
                return (
                  <div key={t.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 10, marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span className={`pri ${t.priority}`} />
                      <span className="mono" style={{ fontSize: 9, color: 'var(--text-ghost)' }}>{t.id}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.4 }}>{t.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span className="badge" style={{ background: `${type.color}14`, color: type.color, borderColor: `${type.color}22`, fontSize: 9 }}>{type.label}</span>
                      <Avatar p={t.assignee} size={16} />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </MobileFrame>
  );
};

// Mobile Doc editor
const MobileDocEditor = () => (
  <MobileFrame title="Doc" back onBack={()=>{}} rightAction={<button className="btn icon subtle"><I.more size={16} /></button>}>
    <div style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <span className="badge neutral">Tese</span>
        <span className="badge neutral">Kiln</span>
        <span className="badge neutral mono">v2.1</span>
      </div>
      <h1 className="display" style={{ fontSize: 22, fontWeight: 600, margin: '0 0 16px', letterSpacing: '-0.01em', lineHeight: 1.25 }}>Hipóteses de valor — Kiln 2026</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic', borderLeft: '2px solid var(--primary)', paddingLeft: 12, marginBottom: 20, lineHeight: 1.6 }}>
        Esse documento compila as hipóteses de valor do Kiln para 2026, priorizadas após 12 entrevistas com clientes de marcas virtuais.
      </p>
      <h2 className="display" style={{ fontSize: 17, fontWeight: 600, marginBottom: 10 }}>Hipóteses priorizadas</h2>
      <ol style={{ paddingLeft: 20, fontSize: 13, lineHeight: 1.7, color: 'var(--text-primary)' }}>
        <li style={{ marginBottom: 10 }}>Cozinhas com 3+ marcas perdem 18% da margem em fila de pedidos.</li>
        <li style={{ marginBottom: 10 }}>Operadores não confiam em roteamento sem <em>porquê</em>.</li>
        <li style={{ marginBottom: 10 }}>Visão unificada reduz decisão em 40%.</li>
      </ol>
    </div>
  </MobileFrame>
);

// Mobile Meeting detail
const MobileMeeting = () => {
  const m = MEETINGS[0];
  return (
    <MobileFrame title="Reunião" back onBack={()=>{}}>
      <div style={{ padding: '16px 18px' }}>
        <span className="badge neutral" style={{ textTransform: 'capitalize' }}>{m.type}</span>
        <h1 className="display" style={{ fontSize: 19, fontWeight: 600, margin: '10px 0 6px' }}>{m.title}</h1>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }} className="mono">{m.when}</div>
        <AvatarStack ids={m.participants} size={22} />

        <div className="card" style={{ padding: 16, marginTop: 16 }}>
          <div className="label" style={{ marginBottom: 10 }}>Pauta</div>
          <ol style={{ paddingLeft: 18, margin: 0, fontSize: 12, lineHeight: 1.65, color: 'var(--text-primary)' }}>
            <li>Portfolio review</li>
            <li>Mirror — kill ou continuar?</li>
            <li>Anvil review</li>
          </ol>
        </div>

        <div className="label" style={{ margin: '20px 0 10px' }}>Action items</div>
        {[{t:'Comunicar kill Mirror',by:'ap',d:false},{t:'Doc desligamento',by:'rm',d:false}].map((a,i)=>(
          <div key={i} className="card" style={{ padding: 12, marginBottom: 6, display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ width: 14, height: 14, border: '1.5px solid var(--border-default)', borderRadius: 4 }} />
            <span style={{ flex: 1, fontSize: 12 }}>{a.t}</span>
            <Avatar p={a.by} size={18} />
          </div>
        ))}
      </div>
    </MobileFrame>
  );
};

// Sidebar as sheet
const MobileSheet = () => (
  <MobileFrame tabBar={false}>
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
    <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 300, background: 'var(--bg-0)', borderRight: '1px solid var(--border-subtle)', padding: '50px 16px 20px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '0 8px' }}>
        <span className="display" style={{ fontSize: 15, fontWeight: 600, letterSpacing: '0.24em' }}>VALK</span>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--primary)' }} />
        <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>hub</span>
      </div>
      {[['Dashboard','dashboard',true],['Projetos','projects',false],['Tasks','tasks',false],['Docs','docs',false],['Reuniões','meetings',false],['Relatórios','reports',false],['Pessoas','people',false]].map(([l,ic,on])=>{
        const IconC = I[ic];
        return (
          <button key={l} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, fontSize: 13, color: on?'var(--text-primary)':'var(--text-faint)', background: on?'rgba(255,255,255,0.05)':'transparent', marginBottom: 2 }}>
            <IconC size={15} /> {l}
          </button>
        );
      })}
      <div style={{ marginTop: 'auto', padding: 10, borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar p={PEOPLE[0]} size={28} />
        <div style={{ flex: 1, fontSize: 12 }}>
          <div style={{ fontWeight: 500 }}>{USER.name}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{USER.role}</div>
        </div>
      </div>
    </div>
  </MobileFrame>
);

Object.assign(window, { MobileFrame, MobileLogin, MobileDashboard, MobileProjects, MobileProjectDetail, MobileKanban, MobileDocEditor, MobileMeeting, MobileSheet });
