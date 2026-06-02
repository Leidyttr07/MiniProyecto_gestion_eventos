import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents } from '../api/events';
import Navbar from '../components/Navbar';

const Events = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getEvents().then(res => {
      setEvents(res.data);
      setFiltered(res.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...events];
    if (search) result = result.filter(e =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description?.toLowerCase().includes(search.toLowerCase())
    );
    if (status) result = result.filter(e => e.status === status);
    if (date) result = result.filter(e => {
      const ed = new Date(e.start_date);
      const fd = new Date(date + 'T00:00:00');
      return ed.getFullYear() === fd.getFullYear() &&
        ed.getMonth() === fd.getMonth() &&
        ed.getDate() === fd.getDate();
    });
    setFiltered(result);
  }, [search, status, date, events]);

  const statusLabel: Record<string, string> = {
    active: 'Activo', cancelled: 'Cancelado', finished: 'Finalizado'
  };

  const statusColor: Record<string, React.CSSProperties> = {
    active: { background: 'rgba(5,150,105,0.12)', color: '#059669' },
    cancelled: { background: 'rgba(220,38,38,0.12)', color: '#dc2626' },
    finished: { background: 'rgba(100,116,139,0.12)', color: '#64748b' },
  };

  return (
    <div style={s.page}>
      <div style={s.bgOrb1} />
      <div style={s.bgOrb2} />
      <Navbar />

      <main style={s.main}>
        {/* Hero */}
        <div style={s.hero}>
          <div style={s.heroBadge}>Plataforma académica · Universidad del Cauca</div>
          <h1 style={s.heroTitle}>Eventos <span style={s.accent}>Disponibles</span></h1>
          <p style={s.heroSub}>Descubre seminarios, talleres y conferencias para tu desarrollo académico</p>
        </div>

        {/* Filtros */}
        <div style={s.filtersCard}>
          <div style={s.filtersInner}>
            <div style={s.searchWrap}>
              <span style={s.searchIcon}>🔍</span>
              <input
                style={s.searchInput}
                placeholder="Buscar eventos..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select style={s.select} value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="cancelled">Cancelados</option>
              <option value="finished">Finalizados</option>
            </select>
            <input style={s.dateInput} type="date" value={date} onChange={e => setDate(e.target.value)} />
            {(search || status || date) && (
              <button style={s.clearBtn} onClick={() => { setSearch(''); setStatus(''); setDate(''); }}>
                ✕ Limpiar
              </button>
            )}
          </div>
          <p style={s.resultsCount}>
            {filtered.length} evento{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Grid de eventos */}
        {loading ? (
          <div style={s.loadingGrid}>
            {[1,2,3].map(i => <div key={i} style={s.skeleton} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>📭</div>
            <h3 style={s.emptyTitle}>No hay eventos disponibles</h3>
            <p style={s.emptySub}>Intenta con otros filtros o vuelve más tarde</p>
          </div>
        ) : (
          <div style={s.grid}>
            {filtered.map((event, i) => (
              <div
                key={event.id}
                style={{ ...s.card, animationDelay: `${i * 0.05}s` }}
                className="animate-fade-up"
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div style={s.cardTop}>
                  <span style={{ ...s.badge, ...statusColor[event.status] }}>
                    ● {statusLabel[event.status] || event.status}
                  </span>
                  {event.event_type && (
                    <span style={s.typeBadge}>{event.event_type}</span>
                  )}
                </div>

                <h3 style={s.cardTitle}>{event.title}</h3>
                <p style={s.cardDesc}>{event.description || 'Sin descripción'}</p>

                <div style={s.cardMeta}>
                  <div style={s.metaItem}>
                    <span style={s.metaIcon}>📅</span>
                    <span>{new Date(event.start_date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div style={s.metaItem}>
                    <span style={s.metaIcon}>📍</span>
                    <span>{event.location || 'Por definir'}</span>
                  </div>
                  {event.program && (
                    <div style={s.metaItem}>
                      <span style={s.metaIcon}>🎓</span>
                      <span style={{ fontSize: '0.8rem' }}>{event.program}</span>
                    </div>
                  )}
                </div>

                <div style={s.cardFooter}>
                  <div style={s.spotsWrap}>
                    <div style={s.spotsBar}>
                      <div style={{
                        ...s.spotsBarFill,
                        width: `${Math.round(((event.capacity - event.available_spots) / event.capacity) * 100)}%`,
                        background: event.available_spots === 0 ? '#dc2626' : event.available_spots < event.capacity * 0.2 ? '#d97706' : '#059669',
                      }} />
                    </div>
                    <span style={s.spotsText}>{event.available_spots} cupos</span>
                  </div>
                  <button
                    style={s.detailBtn}
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    Ver detalles →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#0f0c29', position: 'relative', overflow: 'hidden' },
  bgOrb1: {
    position: 'fixed', top: '-20%', right: '-10%',
    width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  bgOrb2: {
    position: 'fixed', bottom: '-20%', left: '-10%',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  main: { maxWidth: '1280px', margin: '0 auto', padding: '2rem 2rem 4rem', position: 'relative', zIndex: 1 },
  hero: { textAlign: 'center', padding: '3rem 0 2rem' },
  heroBadge: {
    display: 'inline-block',
    background: 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(99,102,241,0.3)',
    color: '#818cf8',
    borderRadius: '999px',
    padding: '0.35rem 1rem',
    fontSize: '0.78rem',
    fontWeight: 600,
    letterSpacing: '0.05em',
    marginBottom: '1.25rem',
  },
  heroTitle: {
    fontFamily: 'Manrope, sans-serif',
    fontSize: '3rem', fontWeight: 800,
    color: 'white', marginBottom: '1rem',
    letterSpacing: '-0.03em',
  },
  accent: {
    background: 'linear-gradient(135deg, #818cf8, #c4b5fd)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSub: { color: 'rgba(255,255,255,0.5)', fontSize: '1rem', lineHeight: 1.7 },
  filtersCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '1.25rem 1.5rem',
    marginBottom: '2rem',
    backdropFilter: 'blur(12px)',
  },
  filtersInner: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.75rem' },
  searchWrap: { flex: 2, minWidth: '200px', position: 'relative', display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: '1rem', fontSize: '0.9rem', opacity: 0.4, pointerEvents: 'none' },
  searchInput: {
    width: '100%',
    padding: '0.7rem 1rem 0.7rem 2.75rem',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    fontSize: '0.9rem',
    color: 'white',
    outline: 'none',
  },
  select: {
    flex: 1, minWidth: '160px',
    padding: '0.7rem 1rem',
    background: '#1e1b4b',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    fontSize: '0.9rem',
    color: 'white',
    outline: 'none',
  },
  dateInput: {
    flex: 1, minWidth: '160px',
    padding: '0.7rem 1rem',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    fontSize: '0.9rem',
    color: 'white',
    outline: 'none',
  },
  clearBtn: {
    padding: '0.7rem 1.1rem',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: '10px',
    color: '#fca5a5',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  resultsCount: { color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' },
  loadingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
  skeleton: {
    height: '280px', borderRadius: '16px',
    background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  },
  empty: { textAlign: 'center', padding: '5rem 2rem' },
  emptyIcon: { fontSize: '3rem', marginBottom: '1rem' },
  emptyTitle: { fontFamily: 'Manrope, sans-serif', fontSize: '1.25rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' },
  emptySub: { color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '1.5rem',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.9rem',
    transition: 'transform 0.25s cubic-bezier(.22,1,.36,1), box-shadow 0.25s',
    cursor: 'default',
  },
  cardTop: { display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  typeBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 600,
    background: 'rgba(99,102,241,0.15)',
    color: '#818cf8',
  },
  cardTitle: {
    fontFamily: 'Manrope, sans-serif',
    fontSize: '1.1rem', fontWeight: 700,
    color: 'white', lineHeight: 1.3,
  },
  cardDesc: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: '0.875rem',
    lineHeight: 1.6,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  cardMeta: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  metaItem: { display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' },
  metaIcon: { fontSize: '0.85rem', flexShrink: 0 },
  cardFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' },
  spotsWrap: { display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1, marginRight: '1rem' },
  spotsBar: { height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' },
  spotsBarFill: { height: '100%', borderRadius: '999px', transition: 'width 0.5s' },
  spotsText: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' },
  detailBtn: {
    padding: '0.5rem 1.1rem',
    background: 'rgba(99,102,241,0.2)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: '8px',
    color: '#818cf8',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
  },
};

export default Events;