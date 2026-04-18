// Login screen — split layout with ember particles
const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = React.useState('igor@valk.software');
  const [loading, setLoading] = React.useState(false);

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 700);
  };

  // Ember particles (10)
  const embers = Array.from({ length: 14 }, (_, i) => {
    const delay = (i * 1.3) % 12;
    const dur = 8 + (i % 5) * 1.5;
    const left = 5 + ((i * 37) % 90);
    const dx = ((i % 2 === 0 ? 1 : -1) * (10 + (i * 7) % 40)) + 'px';
    const size = 2 + (i % 3);
    return <span key={i} className="ember" style={{ left: `${left}%`, animationDelay: `${delay}s`, animationDuration: `${dur}s`, '--dx': dx, width: size, height: size }} />;
  });

  return (
    <div className="login-root" style={{ width: '100%', height: '100%', display: 'flex', background: 'var(--bg-0)', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        .ember {
          position: absolute; bottom: -20px; width: 3px; height: 3px; border-radius: 50%;
          background: var(--primary); box-shadow: 0 0 6px rgba(226,75,74,0.8), 0 0 12px rgba(226,75,74,0.4);
          animation: emberRise linear infinite; pointer-events: none; opacity: 0;
        }
        .login-logo-line { width: 40px; height: 1px; background: var(--primary); margin: 14px auto; opacity: 0.8; }
        .login-corner { position: absolute; font-size: 10px; color: rgba(226,75,74,0.45); text-transform: uppercase; letter-spacing: 0.18em; font-weight: 500; }
      `}</style>

      {/* Left — brand */}
      <div className="login-left" style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>
        {/* Radial glow */}
        <div style={{ position: 'absolute', left: '50%', bottom: '-10%', width: 900, height: 600, transform: 'translateX(-50%)', background: 'radial-gradient(ellipse at center, rgba(226,75,74,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
        {/* Embers */}
        {embers}
        {/* Grid overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />

        <div className="login-corner" style={{ top: 24, left: 28 }}>venture builder</div>
        <div className="login-corner" style={{ bottom: 24, right: 28 }}>est. 2026</div>

        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div className="display" style={{ fontSize: 56, fontWeight: 600, letterSpacing: '0.2em', color: 'var(--text-primary)' }}>VALK</div>
          <div className="login-logo-line" />
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.32em', fontWeight: 500 }}>software</div>
          <div style={{ marginTop: 48, fontSize: 11, fontStyle: 'italic', color: 'var(--text-ghost)', letterSpacing: '0.02em' }}>
            "Aquela que escolhe"
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div style={{ width: 380, background: 'var(--bg-1)', borderLeft: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', padding: '28px 40px', position: 'relative' }}>
        <div className="mono" style={{ position: 'absolute', top: 20, right: 24, fontSize: 9, color: 'var(--text-invisible)' }}>v1.0</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 64 }}>
          <span className="display" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.24em' }}>VALK</span>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px rgba(226,75,74,0.5)' }} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 500, marginTop: 2 }}>hub</span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 className="display" style={{ fontSize: 22, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>Bem-vindo de volta.</h1>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: '8px 0 32px' }}>Entre com seu e-mail corporativo.</p>

          <form onSubmit={submit}>
            <label className="label" style={{ display: 'block', marginBottom: 8 }}>E-mail</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nome@valk.software" autoFocus />

            <button type="submit" className="btn primary" style={{ width: '100%', marginTop: 18, padding: '13px' }} disabled={loading}>
              <span style={{ letterSpacing: '0.14em', fontSize: 12, fontWeight: 600 }}>{loading ? 'ENTRANDO…' : 'ACESSAR'}</span>
              {!loading && <I.arrowR size={13} />}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '24px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
              <span style={{ fontSize: 10, color: 'var(--text-ghost)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>ou</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
            </div>

            <button type="button" className="btn ghost" style={{ width: '100%', padding: '11px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z"/></svg>
              Continuar com Google
            </button>
          </form>
        </div>

        <div style={{ fontSize: 10, color: 'var(--text-ghost)', textAlign: 'center', letterSpacing: '0.04em' }}>
          VALK SOFTWARE © 2026
        </div>
      </div>
    </div>
  );
};

window.LoginScreen = LoginScreen;
