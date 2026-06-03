import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyRegistrations, cancelRegistration } from '../api/registrations';
import Navbar from '../components/Navbar';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRegistrations = () => {
      getMyRegistrations()
        .then(res => setRegistrations(res.data))
        .finally(() => setLoading(false));
    };

    fetchRegistrations(); // carga inicial

    const interval = setInterval(fetchRegistrations, 5000); // actualiza cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  const handleCancel = async (id: number) => {
    if (!confirm('¿Seguro que deseas cancelar esta inscripción?')) return;
    try {
      await cancelRegistration(id);
      setRegistrations(prev =>
        prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r)
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al cancelar');
    }
  };

  const active = registrations.filter(r => r.status === 'active');
  const cancelled = registrations.filter(r => r.status === 'cancelled');

  return (
    <div style={s.page}>
      <div style={s.bgOrb1} /><div style={s.bgOrb2} />
      <Navbar />

      <main style={s.main}>
        <div style={s.header}>
          <div>
            <p style={s.eyebrow}>Mi cuenta</p>
            <h1 style={s.title}>Mis Inscripciones</h1>
            <p style={s.subtitle}>Gestiona tu participación en eventos académicos</p>
          </div>
          <div style={s.statsRow}>
            <div style={s.statPill}>
              <span style={s.statNum}>{active.length}</span>
              <span style={s.statLbl}>Activas</span>
            </div>
            <div style={{ ...s.statPill, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <span style={{ ...s.statNum, color: '#f87171' }}>{cancelled.length}</span>
              <span style={s.statLbl}>Canceladas</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={s.loadingWrap}>
            {[1, 2, 3].map(i => <div key={i} style={s.skeleton} />)}
          </div>
        ) : registrations.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>📭</div>
            <h3 style={s.emptyTitle}>No tienes inscripciones aún</h3>
            <p style={s.emptySub}>Explora los eventos disponibles y regístrate</p>
            <button style={s.exploreBtn} onClick={() => navigate('/events')}>
              Ver eventos disponibles →
            </button>
          </div>
        ) : (
          <div style={s.sections}>
            {active.length > 0 && (
              <div>
                <h2 style={s.sectionTitle}>
                  <span style={s.sectionDot} />
                  Inscripciones activas
                </h2>
                <div style={s.list}>
                  {active.map(reg => (
                    <RegistrationCard key={reg.id} reg={reg} onCancel={handleCancel} onNavigate={navigate} />
                  ))}
                </div>
              </div>
            )}

            {cancelled.length > 0 && (
              <div>
                <h2 style={{ ...s.sectionTitle, marginTop: active.length > 0 ? '2.5rem' : 0 }}>
                  <span style={{ ...s.sectionDot, background: '#ef4444' }} />
                  Inscripciones canceladas
                </h2>
                <div style={s.list}>
                  {cancelled.map(reg => (
                    <RegistrationCard key={reg.id} reg={reg} onCancel={handleCancel} onNavigate={navigate} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

const RegistrationCard = ({ reg, onCancel, onNavigate }: { reg: any; onCancel: (id: number) => void; onNavigate: (path: string) => void }) => {
  const isActive = reg.status === 'active';
  const removedByAdmin = reg.removed_by_admin;
  const event = reg.event;

  return (
    <div style={{
      ...card.wrap,
      borderColor: removedByAdmin ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)',
    }}>
      <div style={card.left}>
        <div style={card.topRow}>
          <span style={{
            ...card.badge,
            background: isActive ? 'rgba(16,185,129,0.12)' : removedByAdmin ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)',
            color: isActive ? '#10b981' : '#f87171',
          }}>
            {isActive ? '● Activo' : removedByAdmin ? '● Removido por el organizador' : '● Cancelado'}
          </span>
          {event.event_type && (
            <span style={card.typeBadge}>{event.event_type}</span>
          )}
        </div>

        {removedByAdmin && (
          <div style={card.adminNotice}>
            ⚠️ El organizador del evento te ha removido de la lista de participantes.
          </div>
        )}

        <h3 style={card.title}>{event.title}</h3>

        <div style={card.meta}>
          <span style={card.metaItem}>
            📅 {new Date(event.start_date).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <span style={card.metaItem}>
            📍 {event.location || 'Por definir'}
          </span>
          {event.program && (
            <span style={card.metaItem}>🎓 {event.program}</span>
          )}
          <span style={card.metaItem}>
            🗓 Inscrito el {new Date(reg.registered_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      <div style={card.right}>
        <button
          style={card.detailBtn}
          onClick={() => onNavigate(`/events/${event.id}`)}
        >
          Ver evento
        </button>
        {isActive && (
          <button
            style={card.cancelBtn}
            onClick={() => onCancel(reg.id)}
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#0f0c29', position: 'relative', overflow: 'hidden' },
  bgOrb1: {
    position: 'fixed', top: '-15%', right: '-10%',
    width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  bgOrb2: {
    position: 'fixed', bottom: '-20%', left: '-10%',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  main: { maxWidth: '900px', margin: '0 auto', padding: '2.5rem 2rem 4rem', position: 'relative', zIndex: 1 },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem',
  },
  eyebrow: {
    fontSize: '0.75rem', fontWeight: 600, color: '#818cf8',
    letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem',
  },
  title: {
    fontFamily: 'Manrope, sans-serif', fontSize: '2rem',
    fontWeight: 800, color: 'white', letterSpacing: '-0.03em', marginBottom: '0.35rem',
  },
  subtitle: { color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' },
  statsRow: { display: 'flex', gap: '0.75rem' },
  statPill: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '0.2rem', padding: '0.75rem 1.25rem',
    background: 'rgba(16,185,129,0.08)',
    border: '1px solid rgba(16,185,129,0.15)',
    borderRadius: '12px', minWidth: '80px',
  },
  statNum: { fontFamily: 'Manrope, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: '#10b981' },
  statLbl: { fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: '0.05em' },
  loadingWrap: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  skeleton: {
    height: '120px', borderRadius: '16px',
    background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%)',
    backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
  },
  empty: { textAlign: 'center', padding: '5rem 2rem' },
  emptyIcon: { fontSize: '3.5rem', marginBottom: '1rem' },
  emptyTitle: {
    fontFamily: 'Manrope, sans-serif', fontSize: '1.25rem',
    color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem',
  },
  emptySub: { color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem', marginBottom: '1.5rem' },
  exploreBtn: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    color: 'white', border: 'none', borderRadius: '10px',
    fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
    fontFamily: 'Manrope, sans-serif',
  },
  sections: {},
  sectionTitle: {
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    fontFamily: 'Manrope, sans-serif', fontSize: '1rem',
    fontWeight: 700, color: 'rgba(255,255,255,0.5)',
    marginBottom: '1rem', letterSpacing: '-0.01em',
  },
  sectionDot: {
    width: '8px', height: '8px', borderRadius: '50%',
    background: '#10b981', flexShrink: 0,
  },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
};

const card: Record<string, React.CSSProperties> = {
  wrap: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px', padding: '1.5rem',
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
    backdropFilter: 'blur(12px)',
    transition: 'border-color 0.2s',
  },
  left: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  topRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  badge: {
    padding: '0.2rem 0.7rem', borderRadius: '999px',
    fontSize: '0.73rem', fontWeight: 600,
  },
  typeBadge: {
    padding: '0.2rem 0.7rem', borderRadius: '999px',
    fontSize: '0.73rem', fontWeight: 600,
    background: 'rgba(99,102,241,0.15)', color: '#818cf8',
  },
  title: {
    fontFamily: 'Manrope, sans-serif', fontSize: '1.05rem',
    fontWeight: 700, color: 'white', lineHeight: 1.3,
  },
  meta: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  metaItem: { color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' },
  right: { display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'flex-end' },
  detailBtn: {
    padding: '0.5rem 1.1rem',
    background: 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(99,102,241,0.25)',
    borderRadius: '8px', color: '#818cf8',
    fontSize: '0.82rem', fontWeight: 600,
    cursor: 'pointer', whiteSpace: 'nowrap',
  },
  cancelBtn: {
    padding: '0.5rem 1.1rem',
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: '8px', color: '#f87171',
    fontSize: '0.82rem', fontWeight: 600,
    cursor: 'pointer', whiteSpace: 'nowrap',
  },
  adminNotice: {
  background: 'rgba(239,68,68,0.08)',
  border: '1px solid rgba(239,68,68,0.2)',
  borderRadius: '8px',
  padding: '0.6rem 0.9rem',
  color: '#fca5a5',
  fontSize: '0.82rem',
  lineHeight: 1.5,
},
};

export default MyRegistrations;