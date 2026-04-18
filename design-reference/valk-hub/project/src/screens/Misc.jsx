// People directory + profile, Notifications, Settings, Onboarding wizard
const PeopleScreen = ({ openPerson }) => (
  <div style={{ padding: '28px 36px 48px', maxWidth: 1200, animation: 'fadeUp 300ms var(--ease)' }}>
    <div style={{ marginBottom: 28 }}>
      <h1 className="display" style={{ fontSize: 24, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>Pessoas</h1>
      <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: '6px 0 0' }}>{PEOPLE.length} membros · {PEOPLE.filter(p=>p.dedication==='full').length} full-time</p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
      {PEOPLE.map(p => (
        <button key={p.id} onClick={() => openPerson(p.id)} className="card hoverable" style={{ textAlign: 'center', padding: 22, cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <Avatar p={p} size={64} />
          </div>
          <div className="display" style={{ fontSize: 15, fontWeight: 600, marginBottom: 3 }}>{p.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 14 }}>{p.role}</div>
          <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: 14, borderTop: '1px solid var(--border-subtle)', fontSize: 10.5 }}>
            <div><div className="mono" style={{ fontSize: 13, color: 'var(--text-primary)' }}>{p.tasks}</div><div style={{ color: 'var(--text-ghost)', marginTop: 2 }}>tasks</div></div>
            <div><div className="mono" style={{ fontSize: 13, color: 'var(--text-primary)' }}>{p.projects}</div><div style={{ color: 'var(--text-ghost)', marginTop: 2 }}>projetos</div></div>
            <div><div className="mono" style={{ fontSize: 13, color: 'var(--text-primary)' }}>{p.dedication === 'full' ? '100%' : '50%'}</div><div style={{ color: 'var(--text-ghost)', marginTop: 2 }}>dedic.</div></div>
          </div>
        </button>
      ))}
    </div>
  </div>
);

const PersonProfile = ({ personId, openTask, onClose }) => {
  const p = getPerson(personId);
  const tasks = TASKS.filter(t => t.assignee === personId && t.status !== 'done');

  return (
    <div style={{ padding: '24px 36px 60px', maxWidth: 1000, margin: '0 auto', animation: 'fadeUp 300ms var(--ease)' }}>
      <button onClick={onClose} style={{ color: 'var(--text-muted)', fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 18 }}><I.chevronL size={11} /> Pessoas</button>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 32 }}>
        <Avatar p={p} size={80} />
        <div style={{ flex: 1 }}>
          <h1 className="display" style={{ fontSize: 24, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>{p.name}</h1>
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>{p.role}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <span className="badge neutral">{p.dedication === 'full' ? 'Full-time' : 'Part-time'}</span>
            <span className="badge neutral">{p.projects} projetos</span>
          </div>
        </div>
        <button className="btn ghost">Enviar mensagem</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        <div>
          <h2 className="label" style={{ marginBottom: 12 }}>Tasks ativas ({tasks.length})</h2>
          <div className="card" style={{ padding: 0 }}>
            {tasks.map((t, i) => <TaskRow key={t.id} t={t} onClick={() => openTask(t.id)} last={i === tasks.length - 1} />)}
            {tasks.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-ghost)', fontSize: 12 }}>Sem tasks abertas.</div>}
          </div>
        </div>
        <div>
          <h2 className="label" style={{ marginBottom: 12 }}>Projetos</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PROJECTS.filter(pr => pr.owner === p.id || Math.random() > 0.7).slice(0, 4).map(pr => (
              <div key={pr.id} className="card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <HealthDot state={pr.health} />
                <span className="display" style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{pr.name}</span>
                <PhaseBadge phase={pr.phase} />
              </div>
            ))}
          </div>

          <h2 className="label" style={{ marginTop: 22, marginBottom: 12 }}>Atividade recente</h2>
          <div className="card" style={{ padding: 0 }}>
            {ACTIVITY.slice(0, 4).map((a, i, arr) => (
              <div key={i} style={{ padding: '10px 14px', borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>{a.verb}</span>{' '}
                <span style={{ color: 'var(--text-primary)' }}>{a.what}</span>
                <div style={{ fontSize: 10, color: 'var(--text-ghost)', marginTop: 3 }} className="mono">{a.when}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Notifications dropdown ───
const NotifsDropdown = ({ onClose }) => {
  const iconFor = (type) => ({ task: I.tasks, mention: I.people, decision: I.flame, meeting: I.meetings, report: I.reports }[type] || I.bell);
  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 40 }} />
      <div style={{ position: 'absolute', top: 56, right: 28, width: 360, background: 'var(--bg-1)', border: '1px solid var(--border-default)', borderRadius: 12, zIndex: 50, boxShadow: '0 16px 48px rgba(0,0,0,0.5)', animation: 'scaleIn 180ms var(--ease)', overflow: 'hidden', transformOrigin: 'top right' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="display" style={{ fontSize: 14, fontWeight: 600 }}>Notificações</span>
          <button style={{ fontSize: 11, color: 'var(--text-muted)' }}>Marcar todas como lidas</button>
        </div>
        <div style={{ maxHeight: 420, overflow: 'auto' }}>
          {NOTIFS.map((n, i) => {
            const IconC = iconFor(n.type);
            return (
              <div key={n.id} style={{ padding: '12px 16px 12px 14px', borderBottom: i < NOTIFS.length - 1 ? '1px solid var(--border-subtle)' : 'none', display: 'flex', gap: 11, alignItems: 'flex-start', background: n.unread ? 'rgba(226,75,74,0.02)' : 'transparent', position: 'relative', cursor: 'pointer' }}>
                {n.unread && <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: 'var(--primary)' }} />}
                <div style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: n.unread ? 'var(--primary)' : 'var(--text-muted)', flexShrink: 0 }}>
                  <IconC size={12} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: n.unread ? 'var(--text-primary)' : 'var(--text-secondary)', lineHeight: 1.45 }}>{n.text}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-ghost)', marginTop: 4 }} className="mono">{n.when}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ padding: 10, borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <button style={{ fontSize: 11, color: 'var(--text-muted)', padding: 6 }}>Ver todas as notificações</button>
        </div>
      </div>
    </>
  );
};

// ─── Settings ───
const SettingsScreen = () => {
  const [notifs, setNotifs] = React.useState({ email: true, push: true, weekly: false, mentions: true });
  return (
    <div style={{ padding: '28px 36px 48px', maxWidth: 800, animation: 'fadeUp 300ms var(--ease)' }}>
      <h1 className="display" style={{ fontSize: 24, fontWeight: 600, margin: '0 0 28px', letterSpacing: '-0.01em' }}>Configurações</h1>

      <Section title="Perfil">
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid var(--border-subtle)' }}>
            <Avatar p={PEOPLE[0]} size={56} />
            <div>
              <div className="display" style={{ fontSize: 16, fontWeight: 600 }}>{USER.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{USER.role}</div>
            </div>
            <button className="btn ghost" style={{ marginLeft: 'auto' }}>Trocar foto</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Nome"><input className="input" defaultValue="Igor Valk" /></Field>
            <Field label="E-mail"><input className="input" defaultValue="igor@valk.software" /></Field>
          </div>
        </div>
      </Section>

      <Section title="Notificações">
        <div className="card" style={{ padding: 0 }}>
          {[
            ['email', 'E-mail diário', 'Resumo dos eventos do dia'],
            ['push', 'Push notifications', 'Alertas em tempo real no browser'],
            ['weekly', 'Relatório semanal', 'Toda sexta às 18h'],
            ['mentions', 'Menções', 'Quando alguém te marca em um doc ou task'],
          ].map(([k, t, s], i, arr) => (
            <div key={k} style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{t}</div>
                <div style={{ fontSize: 11, color: 'var(--text-ghost)', marginTop: 2 }}>{s}</div>
              </div>
              <Toggle on={notifs[k]} onChange={v => setNotifs({...notifs, [k]: v})} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Preferências">
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 20, borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)' }}>Visão padrão de Tasks</div>
            <div style={{ width: 180 }}><Select options={[['list','Lista'],['kanban','Kanban']]} /></div>
          </div>
          <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)' }}>Fuso horário</div>
            <div style={{ width: 180 }}><Select options={[['sp','São Paulo (GMT-3)'],['utc','UTC']]} /></div>
          </div>
        </div>
      </Section>
    </div>
  );
};

const Section = ({ title, children }) => (
  <section style={{ marginBottom: 28 }}>
    <h2 className="label" style={{ marginBottom: 10 }}>{title}</h2>
    {children}
  </section>
);

const Toggle = ({ on, onChange }) => (
  <button onClick={() => onChange(!on)} style={{ width: 34, height: 18, borderRadius: 9, background: on ? 'var(--primary)' : 'var(--border-default)', position: 'relative', transition: 'background 200ms', flexShrink: 0 }}>
    <span style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 200ms' }} />
  </button>
);

// ─── Onboarding wizard ───
const OnboardingWizard = ({ onClose }) => {
  const [step, setStep] = React.useState(0);
  const steps = [
    { t: 'Bem-vindo à VALK Hub', d: 'Este é o sistema interno da VALK — venture builder que cria, valida e escala produtos SaaS. Vamos te mostrar o essencial em 5 passos.' },
    { t: 'Projetos', d: 'Cada produto do portfólio vive em uma fase (Discovery → MVP → Validação → Tração → Escala) — ou é pausado. Acompanhe métricas, hipóteses e histórico em um só lugar.' },
    { t: 'Tasks', d: 'Lista ou kanban. Tasks de tipo "Dev" sincronizam automaticamente com o Linear. Use filtros para focar no que importa hoje.' },
    { t: 'Docs e reuniões', d: 'Documentação de hipóteses, specs e retros convivem com a ata das reuniões e as decisões tomadas. Tudo rastreável.' },
    { t: 'Pronto pra começar', d: 'A gente kill o que não funciona. Escala o que mostra tração. Vamos construir.' },
  ];
  const s = steps[step];
  const last = step === steps.length - 1;

  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 80 }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 480, background: 'var(--bg-1)', border: '1px solid var(--border-default)', borderRadius: 16, padding: 36, zIndex: 90, boxShadow: '0 24px 80px rgba(0,0,0,0.7)', animation: 'scaleIn 240ms var(--ease)' }}>
        {/* Visual */}
        <div style={{ height: 140, marginBottom: 26, borderRadius: 10, background: 'radial-gradient(ellipse at center, rgba(226,75,74,0.12), transparent 70%), var(--bg-card)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <div className="display" style={{ fontSize: 48, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.18em', zIndex: 2 }}>
            {step === 0 && 'VALK'}
            {step === 1 && <I.projects size={48} stroke={1.2} />}
            {step === 2 && <I.tasks size={48} stroke={1.2} />}
            {step === 3 && <I.docs size={48} stroke={1.2} />}
            {step === 4 && <I.flame size={48} stroke={1.2} />}
          </div>
        </div>

        <div className="mono" style={{ fontSize: 10, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 8 }}>passo {step + 1} de {steps.length}</div>
        <h2 className="display" style={{ fontSize: 22, fontWeight: 600, margin: '0 0 12px', letterSpacing: '-0.01em' }}>{s.t}</h2>
        <p style={{ fontSize: 13.5, color: 'var(--text-tertiary)', lineHeight: 1.65, margin: 0, minHeight: 60 }}>{s.d}</p>

        {/* Dots */}
        <div style={{ display: 'flex', gap: 6, margin: '28px 0 24px' }}>
          {steps.map((_, i) => (
            <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i <= step ? 'var(--primary)' : 'var(--border-subtle)', transition: 'background 300ms' }} />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={onClose} style={{ fontSize: 12, color: 'var(--text-muted)' }}>Pular</button>
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && <button className="btn ghost" onClick={() => setStep(s => s - 1)}><I.chevronL size={12} /> Voltar</button>}
            {last ? (
              <button className="btn primary" onClick={onClose}>Começar <I.arrowR size={13} /></button>
            ) : (
              <button className="btn primary" onClick={() => setStep(s => s + 1)}>Próximo <I.chevronR size={12} /></button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

Object.assign(window, { PeopleScreen, PersonProfile, NotifsDropdown, SettingsScreen, OnboardingWizard });
