// Meetings listing + detail, Reports listing + editor + generate dialog
const MeetingsScreen = ({ openMeeting, onNew }) => {
  const upcoming = MEETINGS.filter(m => m.status === 'scheduled');
  const previous = MEETINGS.filter(m => m.status === 'done');

  return (
    <div style={{ padding: '28px 36px 48px', maxWidth: 1200, animation: 'fadeUp 300ms var(--ease)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 className="display" style={{ fontSize: 24, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>Reuniões</h1>
          <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: '6px 0 0' }}>{upcoming.length} agendadas · {previous.length} realizadas</p>
        </div>
        <button className="btn primary" onClick={onNew}><I.plus size={13} stroke={2.5} /> Agendar</button>
      </div>

      <h2 className="label" style={{ marginBottom: 12 }}>Próximas</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 32 }}>
        {upcoming.map(m => <MeetingCard key={m.id} m={m} onClick={() => openMeeting(m.id)} />)}
      </div>

      <h2 className="label" style={{ marginBottom: 12 }}>Anteriores</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {previous.map(m => <MeetingCard key={m.id} m={m} onClick={() => openMeeting(m.id)} />)}
      </div>
    </div>
  );
};

const MeetingCard = ({ m, onClick }) => {
  const proj = m.product ? getProject(m.product) : null;
  const d = new Date(m.when);
  const dayNames = ['dom','seg','ter','qua','qui','sex','sáb'];
  const monthNames = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  return (
    <button onClick={onClick} className="card hoverable" style={{ textAlign: 'left', padding: 18, cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ width: 52, textAlign: 'center', padding: '6px 0', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 8 }}>
          <div className="mono" style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{monthNames[d.getMonth()]}</div>
          <div className="display" style={{ fontSize: 20, fontWeight: 600, color: m.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)' }}>{String(d.getDate()).padStart(2,'0')}</div>
          <div className="mono" style={{ fontSize: 9, color: 'var(--text-ghost)', textTransform: 'uppercase' }}>{dayNames[d.getDay()]}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <span className="badge neutral" style={{ textTransform: 'capitalize' }}>{m.type}</span>
            {proj && <span className="badge neutral">{proj.name}</span>}
            <span style={{ marginLeft: 'auto' }} />
            <span className="badge" style={{ background: m.status === 'scheduled' ? 'rgba(59,130,246,0.08)' : 'rgba(107,114,128,0.08)', color: m.status === 'scheduled' ? '#7FB0F5' : '#888', borderColor: m.status === 'scheduled' ? 'rgba(59,130,246,0.2)' : 'rgba(107,114,128,0.18)' }}>
              {m.status === 'scheduled' ? 'Agendada' : 'Realizada'}
            </span>
          </div>
          <div className="display" style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>{m.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-ghost)' }}>{String(d.getHours()).padStart(2,'0')}:{String(d.getMinutes()).padStart(2,'0')}</span>
            <span style={{ marginLeft: 'auto' }}><AvatarStack ids={m.participants} size={20} /></span>
          </div>
        </div>
      </div>
    </button>
  );
};

const MeetingDetail = ({ meetingId, onClose }) => {
  const m = MEETINGS.find(x => x.id === meetingId) || MEETINGS[0];
  const [tab, setTab] = React.useState('pauta');

  return (
    <div style={{ padding: '24px 36px 60px', maxWidth: 1000, margin: '0 auto', animation: 'fadeUp 300ms var(--ease)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, fontSize: 11.5 }}>
        <button onClick={onClose} style={{ color: 'var(--text-muted)', fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 4 }}><I.chevronL size={11} /> Reuniões</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <span className="badge neutral" style={{ textTransform: 'capitalize' }}>{m.type}</span>
            {m.product && <span className="badge neutral">{getProject(m.product)?.name}</span>}
          </div>
          <h1 className="display" style={{ fontSize: 24, fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}>{m.title}</h1>
          <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 12, color: 'var(--text-tertiary)' }}>
            <span className="mono">{m.when}</span>
            <span>·</span>
            <AvatarStack ids={m.participants} size={20} />
            <span>{m.participants.length} participantes</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {m.status === 'scheduled' ? (
            <>
              <button className="btn ghost">Adiar</button>
              <button className="btn primary">Iniciar</button>
            </>
          ) : (
            <button className="btn ghost">Ver ata completa</button>
          )}
        </div>
      </div>

      <Tabs tabs={[
        { id: 'pauta', label: 'Pauta & Ata' },
        { id: 'decisions', label: 'Decisões', count: 2 },
        { id: 'actions', label: 'Action Items', count: 3 },
      ]} active={tab} onChange={setTab} />

      <div style={{ padding: '24px 0' }}>
        {tab === 'pauta' && (
          <div>
            <div className="card" style={{ padding: 24, marginBottom: 16 }}>
              <div className="label" style={{ marginBottom: 12 }}>Pauta</div>
              <ol style={{ paddingLeft: 20, margin: 0, fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.7 }}>
                <li>Portfolio review — status de todos os produtos</li>
                <li>Decisão: Mirror — kill ou continuar?</li>
                <li>Anvil — review do novo cliente enterprise</li>
                <li>Kiln — resultados do experimento de onboarding</li>
                <li>Prioridades para S-15</li>
              </ol>
            </div>
            <div className="card" style={{ padding: 24 }}>
              <div className="label" style={{ marginBottom: 12 }}>Ata</div>
              <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7, margin: 0 }}>Comitê começou 5min atrasado. Discussão principal girou em torno do Mirror — traction gate não foi atingido (4 signups/sem vs 15 esperados). Decidido: kill ao fim do sprint atual, prazo para desligamento dos sistemas em 2 semanas…</p>
            </div>
          </div>
        )}
        {tab === 'decisions' && (
          <div>
            <button className="btn ghost" style={{ marginBottom: 14 }}><I.plus size={12} /> Registrar decisão</button>
            {[
              { title: 'Kill Mirror ao fim do sprint atual', by: 'iv', when: 'há 2min' },
              { title: 'Acelerar contratação de engenheiro backend para Anvil', by: 'iv', when: 'há 10min' },
            ].map((d, i) => (
              <div key={i} className="card" style={{ padding: 16, marginBottom: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, boxShadow: '0 0 6px rgba(226,75,74,0.3)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{d.title}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-ghost)', marginTop: 4 }}>{getPerson(d.by).name} · {d.when}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === 'actions' && (
          <div className="card" style={{ padding: 0 }}>
            {[
              { text: 'Comunicar kill do Mirror para stakeholders', owner: 'ap', due: '18 abr', done: false },
              { text: 'Preparar doc de desligamento do Mirror', owner: 'rm', due: '22 abr', done: false },
              { text: 'Abrir vaga de engenheiro backend', owner: 'iv', due: 'hoje', done: true },
            ].map((a, i, arr) => (
              <div key={i} style={{ padding: '14px 18px', borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                <button style={{ width: 16, height: 16, borderRadius: 4, border: '1.5px solid', borderColor: a.done ? 'var(--status-traction)' : 'var(--border-default)', background: a.done ? 'var(--status-traction)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', flexShrink: 0 }}>{a.done && <I.check size={11} stroke={3} />}</button>
                <span style={{ flex: 1, fontSize: 13, color: a.done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: a.done ? 'line-through' : 'none' }}>{a.text}</span>
                <Avatar p={a.owner} size={20} />
                <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-ghost)', width: 56, textAlign: 'right' }}>{a.due}</span>
              </div>
            ))}
            <div style={{ padding: '12px 18px', display: 'flex', gap: 10, alignItems: 'center' }}>
              <I.plus size={13} style={{ color: 'var(--text-muted)' }} />
              <input className="input" placeholder="Nova action item…" style={{ flex: 1, border: 'none', background: 'transparent', padding: '4px 0' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Reports ───
const ReportsScreen = ({ openReport, onNew }) => (
  <div style={{ padding: '28px 36px 48px', maxWidth: 1200, animation: 'fadeUp 300ms var(--ease)' }}>
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
      <div>
        <h1 className="display" style={{ fontSize: 24, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>Relatórios</h1>
        <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: '6px 0 0' }}>{REPORTS.length} relatórios · {REPORTS.filter(r => r.ai).length} com AI</p>
      </div>
      <button className="btn primary" onClick={onNew}><I.sparkle size={13} /> Gerar relatório</button>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
      {REPORTS.map(r => (
        <button key={r.id} onClick={() => openReport(r.id)} className="card hoverable" style={{ textAlign: 'left', padding: 20, cursor: 'pointer' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, alignItems: 'center' }}>
            <span className="badge neutral" style={{ textTransform: 'capitalize' }}>{r.type}</span>
            {r.product && <span className="badge neutral">{getProject(r.product)?.name}</span>}
            <span style={{ marginLeft: 'auto' }} />
            {r.ai && <span className="badge" style={{ background: 'rgba(139,92,246,0.08)', color: '#B49DF5', borderColor: 'rgba(139,92,246,0.2)' }}><I.sparkle size={9} /> AI</span>}
            <span className="badge" style={{ background: r.status === 'published' ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.06)', color: r.status === 'published' ? '#58D3AE' : '#F5BD5C', borderColor: r.status === 'published' ? 'rgba(16,185,129,0.14)' : 'rgba(245,158,11,0.14)' }}>
              {r.status === 'published' ? 'Publicado' : 'Rascunho'}
            </span>
          </div>
          <h3 className="display" style={{ fontSize: 16, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>{r.title}</h3>
          <div style={{ fontSize: 11, color: 'var(--text-ghost)', marginTop: 10, display: 'flex', gap: 8 }}>
            <span className="mono">{r.period}</span><span>·</span>
            <span>{getPerson(r.author).name}</span>
          </div>
        </button>
      ))}
    </div>
  </div>
);

const GenerateReportDialog = ({ onClose, onGenerate }) => {
  const [ai, setAi] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [msgIdx, setMsgIdx] = React.useState(0);
  const msgs = ['Analisando métricas do período…', 'Consolidando decisões tomadas…', 'Identificando tendências…', 'Escrevendo insights…', 'Revisando…'];

  React.useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => setMsgIdx(i => (i + 1) % msgs.length), 900);
    const finish = setTimeout(() => { setLoading(false); onGenerate(); }, 4500);
    return () => { clearInterval(id); clearTimeout(finish); };
  }, [loading]);

  return (
    <>
      <div onClick={loading ? undefined : onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 60 }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 460, background: 'var(--bg-1)', border: '1px solid var(--border-default)', borderRadius: 14, padding: 28, zIndex: 70, animation: 'scaleIn 200ms var(--ease)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
        {!loading ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 className="display" style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>Gerar relatório</h2>
              <button className="btn icon subtle" onClick={onClose}><I.x size={14} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Tipo"><Select options={[['portfolio','Portfolio'],['metric','Métricas'],['discovery','Discovery'],['decision','Decisão']]} /></Field>
              <Field label="Produto"><Select options={[['all','Todo o portfólio'], ...PROJECTS.map(p => [p.id, p.name])]} /></Field>
              <Field label="Período"><Select options={[['this-month','Este mês'],['last-month','Mês passado'],['q1','Q1/2026'],['custom','Personalizado']]} /></Field>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 14, background: ai ? 'rgba(139,92,246,0.06)' : 'var(--bg-card)', border: '1px solid', borderColor: ai ? 'rgba(139,92,246,0.18)' : 'var(--border-subtle)', borderRadius: 10, cursor: 'pointer' }}>
                <button type="button" onClick={() => setAi(!ai)} style={{ width: 32, height: 18, borderRadius: 9, background: ai ? '#8B5CF6' : 'var(--border-default)', position: 'relative', transition: 'background 200ms' }}>
                  <span style={{ position: 'absolute', top: 2, left: ai ? 16 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 200ms' }} />
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, color: ai ? '#B49DF5' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}><I.sparkle size={11} /> Gerar com AI</div>
                  <div style={{ fontSize: 11, color: 'var(--text-ghost)', marginTop: 3 }}>A AI vai escrever insights e conclusões a partir dos dados.</div>
                </div>
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
              <button className="btn ghost" onClick={onClose}>Cancelar</button>
              <button className="btn primary" onClick={() => ai ? setLoading(true) : onGenerate()}>{ai ? <><I.sparkle size={12} /> Gerar</> : 'Criar rascunho'}</button>
            </div>
          </>
        ) : (
          <div style={{ padding: '16px 8px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 12, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', color: '#B49DF5', marginBottom: 16, animation: 'pulse 1.4s infinite' }}><I.sparkle size={20} /></div>
            <div className="display" style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Gerando relatório</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', minHeight: 20, fontFamily: 'var(--font-mono)' }}>{msgs[msgIdx]}</div>
            <div style={{ marginTop: 20, height: 2, background: 'var(--border-subtle)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: '60%', height: '100%', background: 'linear-gradient(90deg, transparent, #8B5CF6, transparent)', backgroundSize: '200% 100%', animation: 'shimmer 1.2s linear infinite' }} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const ReportEditor = ({ reportId, onClose }) => {
  const r = REPORTS.find(x => x.id === reportId) || REPORTS[0];
  return (
    <div style={{ padding: '24px 36px 60px', maxWidth: 900, margin: '0 auto', animation: 'fadeUp 300ms var(--ease)' }}>
      <button onClick={onClose} style={{ color: 'var(--text-muted)', fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 18 }}><I.chevronL size={11} /> Relatórios</button>

      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <span className="badge neutral" style={{ textTransform: 'capitalize' }}>{r.type}</span>
        {r.ai && <span className="badge" style={{ background: 'rgba(139,92,246,0.08)', color: '#B49DF5', borderColor: 'rgba(139,92,246,0.2)' }}><I.sparkle size={9} /> AI</span>}
      </div>

      <h1 className="display" style={{ fontSize: 30, fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}>{r.title}</h1>
      <div style={{ display: 'flex', gap: 14, marginTop: 10, marginBottom: 28, fontSize: 11.5, color: 'var(--text-tertiary)' }}>
        <span className="mono">{r.period}</span>
        <span>·</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Avatar p={r.author} size={18} /> {getPerson(r.author).name}</div>
        <span style={{ marginLeft: 'auto' }} />
        <button className="btn ghost">Exportar PDF</button>
        <button className="btn primary">Publicar</button>
      </div>

      <div style={{ fontSize: 14.5, color: 'var(--text-primary)', lineHeight: 1.75 }}>
        <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', borderLeft: '2px solid #8B5CF6', paddingLeft: 16, marginBottom: 24 }}>
          <span style={{ fontSize: 10, color: '#B49DF5', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6, fontStyle: 'normal' }}><I.sparkle size={10} /> AI summary</span>
          Março foi um mês de consolidação. Anvil atingiu MRR de R$ 184.900 (+4.2%) e Kiln cresceu 38.1%. Mirror segue abaixo do gate de tração. Forge entregou primeiro protótipo interno. Rune permanece pausado.
        </p>

        <h2 className="display" style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 14 }}>MRR consolidado</h2>
        <div className="card" style={{ padding: 20, marginBottom: 24 }}>
          <LineChart data={[120,128,132,140,152,168,178,190,205,218,232,245]} labels={['mai','jun','jul','ago','set','out','nov','dez','jan','fev','mar','abr']} />
        </div>

        <h2 className="display" style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 14 }}>Velocidade do time</h2>
        <div className="card" style={{ padding: 20, marginBottom: 24 }}>
          <BarChart data={[8,11,9,14,12,10,13,15]} labels={['S7','S8','S9','S10','S11','S12','S13','S14']} />
        </div>

        <h2 className="display" style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 14 }}>Principais decisões</h2>
        <ul style={{ paddingLeft: 20 }}>
          <li style={{ marginBottom: 8 }}>Pausar Rune até relatório de abril.</li>
          <li style={{ marginBottom: 8 }}>Anvil investe em assinatura internacional.</li>
          <li style={{ marginBottom: 8 }}>Kiln foca em marcas virtuais nos próximos 3 sprints.</li>
        </ul>
      </div>
    </div>
  );
};

Object.assign(window, { MeetingsScreen, MeetingDetail, ReportsScreen, GenerateReportDialog, ReportEditor });
