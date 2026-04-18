// Docs listing + Document editor
const DocsScreen = ({ openDoc, onNew }) => {
  const [q, setQ] = React.useState('');
  const [typeF, setTypeF] = React.useState('all');
  const [prodF, setProdF] = React.useState('all');

  const filtered = DOCS.filter(d => {
    if (q && !d.title.toLowerCase().includes(q.toLowerCase())) return false;
    if (typeF !== 'all' && d.type !== typeF) return false;
    if (prodF !== 'all' && d.product !== prodF) return false;
    return true;
  });

  return (
    <div style={{ padding: '28px 36px 48px', maxWidth: 1200, animation: 'fadeUp 300ms var(--ease)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="display" style={{ fontSize: 24, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>Docs</h1>
          <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: '6px 0 0' }}>{DOCS.length} documentos no workspace</p>
        </div>
        <button className="btn primary" onClick={onNew}><I.plus size={13} stroke={2.5} /> Novo doc</button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <I.search size={13} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar em todos os docs…" style={{ paddingLeft: 36 }} />
        </div>
        <FilterPill label="Tipo" value={typeF} onChange={setTypeF} options={[['all','Todos'], ...Object.entries(DOC_TYPES)]} />
        <FilterPill label="Produto" value={prodF} onChange={setProdF} options={[['all','Todos'], ...PROJECTS.map(p => [p.id, p.name])]} />
      </div>

      <div>
        {filtered.map(d => (
          <div key={d.id} onClick={() => openDoc(d.id)} className="card hoverable" style={{ padding: '14px 18px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
            <div style={{ width: 36, height: 36, borderRadius: 7, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <I.docs size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)' }}>{d.title}</div>
              <div style={{ fontSize: 10.5, color: 'var(--text-ghost)', marginTop: 3, display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>{DOC_TYPES[d.type]}</span><span>·</span>
                {d.product && <>
                  <span>{getProject(d.product)?.name}</span><span>·</span>
                </>}
                <span>{getPerson(d.author).name}</span>
              </div>
            </div>
            <span className="badge neutral mono">v{d.version}</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-ghost)', width: 60, textAlign: 'right' }}>{d.updated.slice(5)}</span>
          </div>
        ))}
        {filtered.length === 0 && <EmptyState icon={<I.docs size={22} />} title="Nenhum doc encontrado" desc="Tenta limpar os filtros ou criar um novo documento." cta="Novo doc" onCta={onNew} />}
      </div>
    </div>
  );
};

const EmptyState = ({ icon, title, desc, cta, onCta }) => (
  <div style={{ padding: '60px 24px', textAlign: 'center', border: '1px dashed var(--border-default)', borderRadius: 12, background: 'var(--bg-1)' }}>
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', marginBottom: 14 }}>{icon}</div>
    <div className="display" style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{title}</div>
    <div style={{ fontSize: 12, color: 'var(--text-ghost)', marginBottom: 18 }}>{desc}</div>
    {cta && <button className="btn primary" onClick={onCta}><I.plus size={12} /> {cta}</button>}
  </div>
);

// ─── Doc editor ───
const DocEditor = ({ docId, onClose }) => {
  const d = DOCS.find(x => x.id === docId) || DOCS[0];
  const [title, setTitle] = React.useState(d.title);
  const [saved, setSaved] = React.useState('Salvo há 2min');

  return (
    <div style={{ padding: '24px 36px 60px', maxWidth: 900, margin: '0 auto', animation: 'fadeUp 300ms var(--ease)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22, fontSize: 11.5, color: 'var(--text-muted)' }}>
        <button onClick={onClose} style={{ color: 'var(--text-muted)', fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 4 }}><I.chevronL size={11} /> Docs</button>
        <I.chevronR size={11} stroke={2} style={{ color: 'var(--text-ghost)' }} />
        <span style={{ color: 'var(--text-secondary)' }}>{DOC_TYPES[d.type]}</span>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn ghost"><I.link size={12} /> Copiar link</button>
          <button className="btn ghost">Exportar PDF</button>
        </span>
      </div>

      <input value={title} onChange={e => setTitle(e.target.value)} className="display" style={{
        width: '100%', fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em',
        background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)',
        fontFamily: 'var(--font-display)', padding: 0, marginBottom: 12
      }} />

      <div style={{ display: 'flex', gap: 14, alignItems: 'center', fontSize: 11.5, color: 'var(--text-tertiary)', marginBottom: 22 }}>
        <span className="badge neutral">{DOC_TYPES[d.type]}</span>
        {d.product && <span>{getProject(d.product)?.name}</span>}
        <span>·</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Avatar p={d.author} size={18} /> {getPerson(d.author).name}</div>
        <span>·</span>
        <span className="mono">v{d.version}</span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--status-traction)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-traction)' }} /> {saved}
        </span>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '6px 8px', background: 'var(--bg-1)', border: '1px solid var(--border-subtle)', borderRadius: 8, marginBottom: 20, position: 'sticky', top: 12 }}>
        {[['bold', <I.bold size={13} />], ['italic', <I.italic size={13} />], ['h1', <I.h1 size={13} />], ['h2', <I.h2 size={13} />], ['list', <I.list size={13} />], ['quote', <I.quote size={13} />], ['code', <I.code size={13} />], ['link', <I.link size={13} />]].map(([k, ic], i) => (
          <button key={k} className="btn icon subtle" style={{ width: 28, height: 28, color: 'var(--text-muted)' }}>{ic}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.75 }}>
        <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', borderLeft: '2px solid var(--primary)', paddingLeft: 16, margin: '0 0 28px' }}>
          Esse documento compila as hipóteses de valor do Kiln para 2026, priorizadas após 12 entrevistas com clientes de marcas virtuais em São Paulo e Belo Horizonte.
        </p>

        <h2 className="display" style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Contexto</h2>
        <p>Em 2025 validamos o fluxo operacional básico para uma única marca por cozinha. Nosso próximo passo é entender como cozinhas com 3+ marcas virtuais gerenciam a complexidade adicional — e onde o Kiln pode reduzir o atrito dessa operação.</p>

        <h2 className="display" style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Hipóteses priorizadas</h2>
        <ol style={{ paddingLeft: 20 }}>
          <li style={{ marginBottom: 10 }}>Cozinhas com 3+ marcas perdem 18% da margem em fila de pedidos nos horários de pico.</li>
          <li style={{ marginBottom: 10 }}>Operadores de cozinha não confiam no roteamento automático quando ele não mostra <em>por quê</em> priorizou uma marca sobre outra.</li>
          <li style={{ marginBottom: 10 }}>Uma visão unificada por marca, em tempo real, reduz tempo de decisão em 40%.</li>
        </ol>

        <blockquote style={{ margin: '24px 0', padding: '14px 20px', background: 'var(--bg-1)', borderLeft: '2px solid var(--text-muted)', fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: 14 }}>
          "Quando bate o horário de pico, eu simplesmente desligo a marca que dá mais trabalho. Não é ideal, mas é o que dá pra fazer."
          <div style={{ fontSize: 11, color: 'var(--text-ghost)', marginTop: 8, fontStyle: 'normal' }}>— Fernanda, sócia de dark kitchen em Pinheiros</div>
        </blockquote>

        <h2 className="display" style={{ fontSize: 22, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>Próximos passos</h2>
        <ul style={{ paddingLeft: 20 }}>
          <li style={{ marginBottom: 8 }}>Protótipo de visão por marca — entrega S-14</li>
          <li style={{ marginBottom: 8 }}>Testes moderados com 6 operadores — S-15</li>
          <li style={{ marginBottom: 8 }}>Decisão de investimento em Q3</li>
        </ul>
      </div>
    </div>
  );
};

Object.assign(window, { DocsScreen, DocEditor });
