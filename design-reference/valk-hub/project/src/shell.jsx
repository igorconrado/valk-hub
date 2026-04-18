// Shared components: Avatar, Sidebar, Topbar, MetricValue, HealthDot, etc.

const Avatar = ({ p, size = 24, ring }) => {
  const s = typeof p === 'string' ? getPerson(p) : p;
  const style = { width: size, height: size, background: `${s.color}22`, color: s.color, border: `1px solid ${s.color}33`, fontSize: Math.max(9, size * 0.38), boxShadow: ring ? `0 0 0 2px ${s.color}22` : 'none' };
  return <div className="avatar" style={style}>{s.initials}</div>;
};

const AvatarStack = ({ ids, max = 4, size = 22 }) => {
  const shown = ids.slice(0, max);
  const extra = ids.length - shown.length;
  return (
    <div className="avatar-stack" style={{ display: 'inline-flex' }}>
      {shown.map((id, i) => (
        <div key={id} style={{ marginLeft: i === 0 ? 0 : -6, zIndex: 10 - i, outline: '2px solid var(--bg-1)', borderRadius: '50%' }}>
          <Avatar p={id} size={size} />
        </div>
      ))}
      {extra > 0 && (
        <div style={{ marginLeft: -6, zIndex: 0, width: size, height: size, borderRadius: '50%', background: 'var(--bg-elev)', color: 'var(--text-secondary)', fontSize: size * 0.38, display: 'flex', alignItems: 'center', justifyContent: 'center', outline: '2px solid var(--bg-1)', fontWeight: 500 }}>+{extra}</div>
      )}
    </div>
  );
};

const HealthDot = ({ state = 'good' }) => {
  const color = { good: 'var(--status-traction)', warn: 'var(--priority-high)', bad: 'var(--status-scale)', neutral: 'var(--text-muted)' }[state];
  return <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block', boxShadow: state === 'bad' ? '0 0 8px rgba(226,75,74,0.4)' : 'none' }} />;
};

const PhaseBadge = ({ phase }) => (
  <span className={`badge ${phase}`}>
    <span className="dot" />
    {phaseLabels[phase]}
  </span>
);

const MetricValue = ({ value, delta, prefix = '', suffix = '' }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
    <span className="mono" style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
      {prefix}{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}{suffix}
    </span>
    {delta !== undefined && delta !== 0 && (
      <span className="mono" style={{ fontSize: 11, color: delta > 0 ? 'var(--status-traction)' : 'var(--status-scale)' }}>
        {delta > 0 ? '↑' : '↓'}{Math.abs(delta).toFixed(1)}%
      </span>
    )}
  </div>
);

const brl = (n) => 'R$ ' + n.toLocaleString('pt-BR');

// ─── Sidebar ───
const Sidebar = ({ screen, setScreen, collapsed }) => {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'projects',  label: 'Projetos',  icon: 'projects' },
    { id: 'tasks',     label: 'Tasks',     icon: 'tasks' },
    { id: 'docs',      label: 'Docs',      icon: 'docs' },
    { id: 'meetings',  label: 'Reuniões',  icon: 'meetings' },
    { id: 'reports',   label: 'Relatórios',icon: 'reports' },
    { id: 'people',    label: 'Pessoas',   icon: 'people' },
  ];

  return (
    <aside className="sidebar" style={{ width: 240, background: 'var(--bg-0)', borderRight: '1px solid #111', display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '22px 20px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="display" style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', letterSpacing: '0.3em' }}>VALK</span>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px rgba(226,75,74,0.5)' }} />
        <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 500 }}>hub</span>
      </div>

      {/* Workspace pill */}
      <div style={{ padding: '0 16px 14px' }}>
        <button className="ws-pill" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 8, transition: 'all 200ms var(--ease)' }}>
          <div style={{ width: 22, height: 22, borderRadius: 5, background: 'linear-gradient(135deg, #E24B4A 0%, #7a1a1a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>V</div>
          <div style={{ flex: 1, textAlign: 'left', lineHeight: 1.2, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>VALK Software</div>
            <div style={{ fontSize: 9.5, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>venture builder</div>
          </div>
          <I.chevronD size={12} stroke={2} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ padding: '4px 12px', flex: 1, overflow: 'auto' }}>
        <div className="label" style={{ padding: '10px 10px 6px' }}>Workspace</div>
        {items.map(item => {
          const IconC = I[item.icon];
          const active = screen === item.id;
          return (
            <button key={item.id} onClick={() => setScreen(item.id)} className={`nav-item ${active ? 'active' : ''}`} style={{
              display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: '8px 10px',
              borderRadius: 7, marginBottom: 1, position: 'relative',
              color: active ? '#F0F0F0' : '#4A4A4A',
              background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
              fontSize: 13, fontWeight: 500, transition: 'all 150ms var(--ease)',
            }}>
              {active && <span style={{ position: 'absolute', left: -12, top: 6, bottom: 6, width: 2, background: 'var(--primary)', borderRadius: '0 2px 2px 0' }} />}
              <IconC size={15} stroke={active ? 1.75 : 1.5} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="label" style={{ padding: '18px 10px 6px' }}>Produtos</div>
        {PROJECTS.map(p => (
          <button key={p.id} onClick={() => setScreen('project:' + p.id)} className="nav-item" style={{
            display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: '7px 10px',
            borderRadius: 7, marginBottom: 1,
            color: screen === 'project:' + p.id ? '#F0F0F0' : '#4A4A4A',
            background: screen === 'project:' + p.id ? 'rgba(255,255,255,0.05)' : 'transparent',
            fontSize: 12.5, fontWeight: 500, transition: 'all 150ms var(--ease)',
          }}>
            <HealthDot state={p.health} />
            <span style={{ flex: 1, textAlign: 'left' }}>{p.name}</span>
            <span style={{ fontSize: 9, color: 'var(--text-ghost)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{phaseLabels[p.phase].slice(0,4)}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: 14, borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar p={USER.avatar === 'IV' ? PEOPLE[0] : USER} size={26} />
        <div style={{ flex: 1, lineHeight: 1.2, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{USER.name}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{USER.role}</div>
        </div>
        <button className="btn icon subtle" style={{ opacity: 0.6 }}><I.settings size={14} /></button>
      </div>
    </aside>
  );
};

// ─── Topbar ───
const Topbar = ({ title, crumbs, right, onOpenSearch, onOpenNotifs, notifsOpen, unreadCount }) => (
  <header style={{ height: 56, borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16, background: 'var(--bg-0)', position: 'relative', zIndex: 5 }}>
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
      {crumbs && crumbs.map((c, i) => (
        <React.Fragment key={i}>
          <span style={{ fontSize: 12, color: i === crumbs.length - 1 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: i === crumbs.length - 1 ? 500 : 400 }}>{c}</span>
          {i < crumbs.length - 1 && <I.chevronR size={12} stroke={2} style={{ color: 'var(--text-ghost)' }} />}
        </React.Fragment>
      ))}
      {title && !crumbs && <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{title}</span>}
    </div>

    <button onClick={onOpenSearch} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', background: 'var(--bg-1)', border: '1px solid var(--border-subtle)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 12, width: 220, transition: 'all 200ms var(--ease)' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}>
      <I.search size={13} />
      <span style={{ flex: 1, textAlign: 'left' }}>Buscar…</span>
      <kbd style={{ fontSize: 10, padding: '1px 5px', background: 'var(--bg-elev)', borderRadius: 3, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>⌘K</kbd>
    </button>

    <button className="btn icon subtle" onClick={onOpenNotifs} style={{ position: 'relative' }}>
      <I.bell size={15} />
      {unreadCount > 0 && <span style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 6px rgba(226,75,74,0.6)' }} />}
    </button>

    {right}
  </header>
);

// Simple tooltip-less segmented control
const Segmented = ({ options, value, onChange }) => (
  <div style={{ display: 'inline-flex', background: 'var(--bg-1)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 2 }}>
    {options.map(o => (
      <button key={o.value} onClick={() => onChange(o.value)} style={{
        padding: '5px 11px', fontSize: 12, fontWeight: 500, borderRadius: 6, transition: 'all 150ms',
        color: value === o.value ? 'var(--text-primary)' : 'var(--text-muted)',
        background: value === o.value ? 'rgba(255,255,255,0.05)' : 'transparent',
        display: 'inline-flex', alignItems: 'center', gap: 6
      }}>{o.icon}{o.label}</button>
    ))}
  </div>
);

// Empty-state placeholder for images/charts
const Placeholder = ({ h = 160, label = 'placeholder' }) => (
  <div style={{ height: h, borderRadius: 8, background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0 8px, transparent 8px 16px), var(--bg-1)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-ghost)', fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
    {label}
  </div>
);

// Tabs
const Tabs = ({ tabs, active, onChange }) => (
  <div style={{ borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: 4 }}>
    {tabs.map(t => {
      const on = active === t.id;
      return (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding: '11px 14px', fontSize: 12.5, fontWeight: 500, position: 'relative',
          color: on ? 'var(--text-primary)' : 'var(--text-faint)',
          transition: 'color 150ms'
        }} onMouseEnter={e => !on && (e.currentTarget.style.color = 'var(--text-secondary)')} onMouseLeave={e => !on && (e.currentTarget.style.color = 'var(--text-faint)')}>
          {t.label}
          {t.count !== undefined && <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--text-ghost)', fontFamily: 'var(--font-mono)' }}>{t.count}</span>}
          {on && <span style={{ position: 'absolute', bottom: -1, left: 10, right: 10, height: 2, background: 'var(--primary)', borderRadius: '2px 2px 0 0' }} />}
        </button>
      );
    })}
  </div>
);

// Mini sparkline chart
const Sparkline = ({ data, color = 'var(--primary)', h = 40, w = 120 }) => {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => [i / (data.length - 1) * w, h - ((v - min) / (max - min || 1)) * (h - 4) - 2]);
  const d = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const area = d + ` L${w},${h} L0,${h} Z`;
  const id = 'g' + Math.random().toString(36).slice(2, 8);
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
};

// Progress bar
const Progress = ({ value, color = 'var(--primary)', h = 3 }) => (
  <div style={{ width: '100%', height: h, background: 'var(--border-subtle)', borderRadius: h, overflow: 'hidden' }}>
    <div style={{ width: `${value * 100}%`, height: '100%', background: color, borderRadius: h, transition: 'width 400ms var(--ease)' }} />
  </div>
);

Object.assign(window, { Avatar, AvatarStack, HealthDot, PhaseBadge, MetricValue, brl, Sidebar, Topbar, Segmented, Placeholder, Tabs, Sparkline, Progress });
