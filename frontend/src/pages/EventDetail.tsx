import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEvent } from '../api/events';
import { registerToEvent, cancelRegistration, getMyRegistrations } from '../api/registrations';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [myRegistration, setMyRegistration] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    getEvent(Number(id))
      .then(res => setEvent(res.data))
      .finally(() => setLoading(false));

    if (isAuthenticated && !isAdmin) {
      getMyRegistrations().then(res => {
        const reg = res.data.find((r: any) => r.event.id === Number(id) && r.status === 'active');
        setMyRegistration(reg || null);
      });
    }
  }, [id, isAuthenticated, isAdmin]);

  const handleRegister = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      setActionLoading(true); setMessage(''); setIsError(false);
      const res = await registerToEvent(Number(id));
      setMyRegistration(res.data);
      setEvent((e: any) => ({ ...e, available_spots: e.available_spots - 1 }));
      setMessage('¡Inscripción exitosa!');
    } catch (err: any) {
      setIsError(true);
      const msg = err.response?.data?.message;
      setMessage(Array.isArray(msg) ? msg.join(', ') : msg || 'Error al inscribirse');
    } finally { setActionLoading(false); }
  };

  const handleCancel = async () => {
    try {
      setActionLoading(true); setMessage(''); setIsError(false);
      await cancelRegistration(myRegistration.id);
      setMyRegistration(null);
      setEvent((e: any) => ({ ...e, available_spots: e.available_spots + 1 }));
      setMessage('Inscripción cancelada correctamente.');
    } catch (err: any) {
      setIsError(true);
      setMessage(err.response?.data?.message || 'Error al cancelar');
    } finally { setActionLoading(false); }
  };

  if (loading) return (
    <div style={s.loadingPage}>
      <div style={s.bgOrb1} /><div style={s.bgOrb2} />
      <Navbar />
      <div style={s.loadingBox}>
        <div style={s.spinner} />
        <p style={s.loadingText}>Cargando evento...</p>
      </div>
    </div>
  );

  if (!event) return (
    <div style={s.loadingPage}>
      <Navbar />
      <div style={s.loadingBox}>
        <p style={s.loadingText}>Evento no encontrado</p>
      </div>
    </div>
  );

  const isFull = event.available_spots <= 0;
  const registered = event.capacity - event.available_spots;
  const occupancy = Math.round((registered / event.capacity) * 100);

  const statusColor: Record<string, React.CSSProperties> = {
    active: { background: 'rgba(5,150,105,0.12)', color: '#059669' },
    cancelled: { background: 'rgba(220,38,38,0.12)', color: '#dc2626' },
    finished: { background: 'rgba(100,116,139,0.12)', color: '#64748b' },
  };
  const statusLabel: Record<string, string> = {
    active: 'Activo', cancelled: 'Cancelado', finished: 'Finalizado'
  };

  return (
    <div style={s.page}>
      <div style={s.bgOrb1} /><div style={s.bgOrb2} />
      <Navbar />

      <main style={s.main}>
        <button style={s.backBtn} onClick={() => navigate('/events')}>
          ← Volver a eventos
        </button>

        <div style={s.layout}>
          {/* Panel principal */}
          <div style={s.content}>
            <div style={s.topRow}>
              <span style={{ ...s.badge, ...statusColor[event.status] }}>
                ● {statusLabel[event.status] || event.status}
              </span>
              {event.event_type && <span style={s.typeBadge}>{event.event_type}</span>}
            </div>

            <h1 style={s.title}>{event.title}</h1>
            <p style={s.description}>{event.description || 'Sin descripción disponible.'}</p>

            {/* Info grid */}
            <div style={s.infoGrid}>
              {[
                { icon: '📅', label: 'Inicio', value: new Date(event.start_date).toLocaleString('es-CO', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
                { icon: '🏁', label: 'Fin', value: new Date(event.end_date).toLocaleString('es-CO', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
                { icon: '📍', label: 'Lugar', value: event.location || 'Por definir' },
                { icon: '👤', label: 'Organizador', value: event.organizer?.name || 'Universidad del Cauca' },
                ...(event.program ? [{ icon: '🎓', label: 'Programa', value: event.program }] : []),
              ].map(({ icon, label, value }) => (
                <div key={label} style={s.infoItem}>
                  <span style={s.infoIcon}>{icon}</span>
                  <div>
                    <p style={s.infoLabel}>{label}</p>
                    <p style={s.infoValue}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel lateral */}
          <div style={s.sidebar}>
            <div style={s.sideCard}>
              {/* Cupos */}
              <div style={s.cuposSection}>
                <div style={s.cuposHeader}>
                  <span style={s.cuposLabel}>Cupos disponibles</span>
                  <span style={{
                    ...s.cuposCount,
                    color: isFull ? '#ef4444' : event.available_spots < event.capacity * 0.2 ? '#f59e0b' : '#10b981'
                  }}>
                    {event.available_spots}/{event.capacity}
                  </span>
                </div>
                <div style={s.barBg}>
                  <div style={{
                    ...s.barFill,
                    width: `${occupancy}%`,
                    background: occupancy >= 100 ? '#ef4444' : occupancy > 70 ? '#f59e0b' : '#10b981',
                  }} />
                </div>
                <p style={s.cuposSub}>{occupancy}% ocupado · {registered} inscritos</p>
              </div>

              {/* Alerta cupos llenos */}
              {isFull && !myRegistration && !isAdmin && (
                <div style={s.fullAlert}>
                  ⚠️ Capacidad máxima alcanzada ({event.capacity} personas). No se aceptan más inscripciones.
                </div>
              )}

              {/* Mensaje */}
              {message && (
                <div style={{
                  ...s.msgBox,
                  background: isError ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                  border: `1px solid ${isError ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
                  color: isError ? '#fca5a5' : '#6ee7b7',
                }}>
                  {isError ? '❌' : '✅'} {message}
                </div>
              )}

              {/* Acciones */}
              {isAdmin ? (
                <div style={s.adminNote}>
                  <span>👤</span>
                  <span>Vista de administrador — no puedes inscribirte en eventos.</span>
                </div>
              ) : myRegistration ? (
                <button
                  style={s.cancelBtn}
                  onClick={handleCancel}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Procesando...' : '✕ Cancelar inscripción'}
                </button>
              ) : !isFull && (
                <button
                  style={s.registerBtn}
                  onClick={handleRegister}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Procesando...' : !isAuthenticated ? 'Inicia sesión para inscribirte' : '✓ Inscribirme ahora'}
                </button>
              )}

              {myRegistration && (
                <div style={s.inscritoBadge}>
                  ✓ Estás inscrito en este evento
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#0f0c29', position: 'relative', overflow: 'hidden' },
  loadingPage: { minHeight: '100vh', background: '#0f0c29', position: 'relative' },
  bgOrb1: {
    position: 'fixed', top: '-15%', right: '-10%',
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
  loadingBox: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    minHeight: '60vh', gap: '1rem',
  },
  spinner: {
    width: '36px', height: '36px', borderRadius: '50%',
    border: '3px solid rgba(99,102,241,0.2)',
    borderTopColor: '#6366f1',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: { color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' },
  main: { maxWidth: '1100px', margin: '0 auto', padding: '2rem', position: 'relative', zIndex: 1 },
  backBtn: {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', padding: '0.5rem 1rem',
    color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem',
    cursor: 'pointer', marginBottom: '2rem', fontWeight: 500,
  },
  layout: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' },
  content: {},
  topRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' },
  badge: {
    padding: '0.3rem 0.85rem', borderRadius: '999px',
    fontSize: '0.78rem', fontWeight: 600,
  },
  typeBadge: {
    padding: '0.3rem 0.85rem', borderRadius: '999px',
    fontSize: '0.78rem', fontWeight: 600,
    background: 'rgba(99,102,241,0.15)', color: '#818cf8',
  },
  title: {
    fontFamily: 'Manrope, sans-serif', fontSize: '2.25rem',
    fontWeight: 800, color: 'white', lineHeight: 1.2,
    letterSpacing: '-0.03em', marginBottom: '1rem',
  },
  description: {
    color: 'rgba(255,255,255,0.5)', fontSize: '1rem',
    lineHeight: 1.75, marginBottom: '2rem',
  },
  infoGrid: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  infoItem: {
    display: 'flex', alignItems: 'flex-start', gap: '0.9rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px', padding: '1rem',
  },
  infoIcon: { fontSize: '1.1rem', flexShrink: 0, marginTop: '0.1rem' },
  infoLabel: { color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.2rem' },
  infoValue: { color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: 500 },
  sidebar: {},
  sideCard: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px', padding: '1.75rem',
    display: 'flex', flexDirection: 'column', gap: '1.25rem',
    position: 'sticky', top: '80px',
  },
  cuposSection: {},
  cuposHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  cuposLabel: { color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 600 },
  cuposCount: { fontSize: '1.1rem', fontWeight: 800, fontFamily: 'Manrope, sans-serif' },
  barBg: { height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.5rem' },
  barFill: { height: '100%', borderRadius: '999px', transition: 'width 0.5s' },
  cuposSub: { color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' },
  fullAlert: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
    color: '#fca5a5', borderRadius: '10px', padding: '0.85rem 1rem',
    fontSize: '0.82rem', lineHeight: 1.5,
  },
  msgBox: {
    borderRadius: '10px', padding: '0.85rem 1rem',
    fontSize: '0.85rem', lineHeight: 1.5,
  },
  adminNote: {
    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px', padding: '0.85rem 1rem',
    color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem', lineHeight: 1.5,
  },
  registerBtn: {
    width: '100%', padding: '0.9rem',
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    color: 'white', border: 'none', borderRadius: '12px',
    fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
    fontFamily: 'Manrope, sans-serif',
  },
  cancelBtn: {
    width: '100%', padding: '0.9rem',
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
    color: '#fca5a5', borderRadius: '12px',
    fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
    fontFamily: 'Manrope, sans-serif',
  },
  inscritoBadge: {
    textAlign: 'center', color: '#6ee7b7',
    fontSize: '0.82rem', fontWeight: 600,
  },
};

export default EventDetail;