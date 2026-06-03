import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getEvents, deleteEvent, cancelEvent } from '../../api/events';
import { getRegistrationsByEvent,  removeRegistrationByAdmin } from '../../api/registrations';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

const Dashboard = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; registrationId: number; name: string }>({
  open: false, registrationId: 0, name: ''});
  const [modal, setModal] = useState<{ open: boolean; title: string; participants: any[] }>({
  open: false, title: '', participants: []
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = () => {
      getEvents().then(res => setEvents(res.data)).finally(() => setLoading(false));
    };

    fetchEvents(); // carga inicial

    const interval = setInterval(fetchEvents, 5000); // actualiza cada 5 segundos

    return () => clearInterval(interval); // limpia al desmontar
  }, []);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const handleCancel = async (id: number, title: string) => {
    if (!confirm(`¿Cancelar "${title}"? Los participantes verán el evento como cancelado.`)) return;
    try {
      await cancelEvent(id);
      setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'cancelled' } : e));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al cancelar');
    }
  };

  const handleViewParticipants = async (eventId: number, title: string) => {
    try {
      const res = await getRegistrationsByEvent(eventId);
      setModal({ open: true, title, participants: res.data });
    } catch {
      alert('Error al cargar participantes');
    }
  };

  const handleRemoveParticipant = (registrationId: number, name: string) => {
    setConfirmModal({ open: true, registrationId, name });
  };

  const confirmRemove = async () => {
    try {
      await removeRegistrationByAdmin(confirmModal.registrationId);
      setModal(prev => ({
        ...prev,
        participants: prev.participants.filter(p => p.id !== confirmModal.registrationId)
      }));
      setConfirmModal({ open: false, registrationId: 0, name: '' });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar participante');
    }
  };

  const totalEvents = events.length;
  const activeEvents = events.filter(e => e.status === 'active').length;
  const cancelledEvents = events.filter(e => e.status === 'cancelled').length;
  const totalCapacity = events.reduce((sum, e) => sum + e.capacity, 0);
  const totalRegistered = events.reduce((sum, e) => sum + (e.capacity - e.available_spots), 0);
  const occupancy = totalCapacity > 0 ? Math.round((totalRegistered / totalCapacity) * 100) : 0;

  const statusColor: Record<string, React.CSSProperties> = {
    active: { background: 'rgba(16,185,129,0.12)', color: '#10b981' },
    cancelled: { background: 'rgba(239,68,68,0.12)', color: '#ef4444' },
    finished: { background: 'rgba(100,116,139,0.12)', color: '#64748b' },
  };
  const statusLabel: Record<string, string> = {
    active: 'Activo', cancelled: 'Cancelado', finished: 'Finalizado'
  };

  return (
    <div style={s.page}>
      <div style={s.bgOrb1} /><div style={s.bgOrb2} />
      <Navbar />

      {/* Modal de participantes */}
      {modal.open && (
        <div style={{ ...s.overlay }} onClick={() => setModal({ ...modal, open: false })}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>Inscritos: {modal.title}</h2>
              <button style={s.modalClose} onClick={() => setModal({ ...modal, open: false })}>✕</button>
            </div>
            {modal.participants.length === 0 ? (
              <p style={s.modalEmpty}>No hay inscritos aún</p>
            ) : (
              <table style={s.modalTable}>
                <thead>
                  <tr>
                    {['#', 'Nombre', 'Código', 'Programa', 'Correo', 'Fecha', 'Acción'].map(h => (
                    <th key={h} style={s.modalTh}>{h}</th>
                  ))}
                  </tr>
                </thead>
                <tbody>
                  {modal.participants.map((r, i) => (
                  <tr key={r.id} style={s.modalTr}>
                    <td style={s.modalTd}>{i + 1}</td>
                    <td style={s.modalTd}>{r.user?.name} {r.user?.last_name}</td>
                    <td style={s.modalTd}>{r.user?.student_code}</td>
                    <td style={s.modalTd}>{r.user?.program}</td>
                    <td style={s.modalTd}>{r.user?.email}</td>
                    <td style={s.modalTd}>
                      {new Date(r.registered_at).toLocaleDateString('es-CO', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td style={s.modalTd}>
                      <button
                        style={s.removeBtn}
                        onClick={() => handleRemoveParticipant(r.id, r.user?.name)}
                      >
                        🗑 Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
      
    {confirmModal.open && (
    <div style={s.overlay}>
      <div style={{ ...s.modalBox, maxWidth: '400px', textAlign: 'center' as const }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
        <h3 style={{ color: 'white', fontFamily: 'Manrope, sans-serif', marginBottom: '0.75rem' }}>
          ¿Eliminar participante?
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Se eliminará a <strong style={{ color: 'white' }}>{confirmModal.name}</strong> del evento. El participante será notificado.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            style={{ padding: '0.7rem 1.5rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => setConfirmModal({ open: false, registrationId: 0, name: '' })}
          >
            Cancelar
          </button>
          <button
            style={{ padding: '0.7rem 1.5rem', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#f87171', cursor: 'pointer', fontWeight: 600 }}
            onClick={confirmRemove}
          >
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
    )}

      <main style={s.main}>
        <div style={s.header}>
          <div>
            <p style={s.eyebrow}>Panel de administración</p>
            <h1 style={s.title}>Bienvenido, {user?.name?.split(' ')[0]}</h1>
            <p style={s.subtitle}>Gestiona todos los eventos académicos desde aquí</p>
          </div>
          <Link to="/admin/events/new" style={s.createBtn}>+ Crear evento</Link>
        </div>

        <div style={s.statsGrid}>
          {[
            { icon: '📋', value: totalEvents, label: 'Total eventos', sub: `${activeEvents} activos`, color: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)' },
            { icon: '✅', value: activeEvents, label: 'Eventos activos', sub: `${cancelledEvents} cancelados`, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
            { icon: '👥', value: totalRegistered, label: 'Inscripciones', sub: `de ${totalCapacity} cupos`, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
            { icon: '📊', value: `${occupancy}%`, label: 'Ocupación', sub: 'promedio general', color: '#818cf8', bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.2)' },
          ].map(({ icon, value, label, sub, color, bg, border }) => (
            <div key={label} style={{ ...s.statCard, background: bg, border: `1px solid ${border}` }}>
              <div style={s.statTop}>
                <span style={s.statIcon}>{icon}</span>
                <span style={{ ...s.statValue, color }}>{value}</span>
              </div>
              <p style={s.statLabel}>{label}</p>
              <p style={s.statSub}>{sub}</p>
            </div>
          ))}
        </div>

        <div style={s.occupancyCard}>
          <div style={s.occupancyHeader}>
            <span style={s.occupancyLabel}>Ocupación general de todos los eventos</span>
            <span style={{ ...s.occupancyPct, color: occupancy > 80 ? '#ef4444' : occupancy > 50 ? '#f59e0b' : '#10b981' }}>{occupancy}%</span>
          </div>
          <div style={s.barBg}>
            <div style={{
              ...s.barFill, width: `${occupancy}%`,
              background: occupancy > 80 ? 'linear-gradient(90deg,#ef4444,#dc2626)' : occupancy > 50 ? 'linear-gradient(90deg,#f59e0b,#d97706)' : 'linear-gradient(90deg,#10b981,#059669)',
            }} />
          </div>
          <div style={s.occupancyFooter}>
            <span style={s.occupancySub}>{totalRegistered} personas inscritas de {totalCapacity} cupos totales</span>
            <span style={s.occupancySub}>{totalCapacity - totalRegistered} cupos disponibles</span>
          </div>
        </div>

        <div style={s.tableSection}>
          <h2 style={s.tableTitle}>Gestión de eventos</h2>
          {loading ? (
            <div style={s.loadingWrap}>{[1,2,3].map(i => <div key={i} style={s.skeleton} />)}</div>
          ) : events.length === 0 ? (
            <div style={s.empty}>
              <div style={s.emptyIcon}>📭</div>
              <p style={s.emptyText}>No hay eventos creados aún</p>
              <Link to="/admin/events/new" style={s.createBtn}>+ Crear primer evento</Link>
            </div>
          ) : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Evento', 'Fecha', 'Ocupación', 'Estado', 'Acciones'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {events.map(event => {
                    const reg = event.capacity - event.available_spots;
                    const pct = Math.round((reg / event.capacity) * 100);
                    return (
                      <tr key={event.id} style={s.tr}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={s.td}>
                          <p style={s.eventName}>{event.title}</p>
                          <div style={s.eventTags}>
                            {event.event_type && <span style={s.tag}>{event.event_type}</span>}
                            {event.program && <span style={s.tag}>{event.program}</span>}
                          </div>
                        </td>
                        <td style={s.td}>
                          <p style={s.dateText}>{new Date(event.start_date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          <p style={s.locationText}>📍 {event.location || 'Por definir'}</p>
                        </td>
                        <td style={s.td}>
                          <div style={s.occWrap}>
                            <span style={{ ...s.occCount, color: pct >= 100 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#10b981' }}>{reg}/{event.capacity}</span>
                            <div style={s.miniBarBg}>
                              <div style={{ ...s.miniBarFill, width: `${pct}%`, background: pct >= 100 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#10b981' }} />
                            </div>
                            <span style={s.pctText}>{pct}%</span>
                          </div>
                        </td>
                        <td style={s.td}>
                          <span style={{ ...s.statusBadge, ...statusColor[event.status] }}>
                            ● {statusLabel[event.status] || event.status}
                          </span>
                        </td>
                        <td style={s.td}>
                          <div style={s.actions}>
                            <button style={s.participantsBtn} onClick={() => handleViewParticipants(event.id, event.title)}>
                              👥 Ver inscritos
                            </button>
                            <button style={s.editBtn} onClick={() => navigate(`/admin/events/${event.id}/edit`)}>
                              ✏️ Editar
                            </button>
                            {event.status === 'active' && (
                              <button style={s.cancelBtn} onClick={() => handleCancel(event.id, event.title)}>
                                ⏸ Cancelar
                              </button>
                            )}
                            <button style={s.deleteBtn} onClick={() => handleDelete(event.id, event.title)}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};


const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#0f0c29', position: 'relative', overflow: 'hidden' },
  bgOrb1: { position: 'fixed', top: '-15%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 },
  bgOrb2: { position: 'fixed', bottom: '-20%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'},
  modalBox: { background: '#1a1740', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '700px', maxHeight: '80vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  modalTitle: { fontFamily: 'Manrope, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: 'white' },
  modalClose: { background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', color: 'white', width: '32px', height: '32px', cursor: 'pointer', fontSize: '0.9rem' },
  modalEmpty: { color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '2rem' },
  modalTable: { width: '100%', borderCollapse: 'collapse' },
  modalTh: { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  modalTr: { borderBottom: '1px solid rgba(255,255,255,0.04)' },
  modalTd: { padding: '0.85rem 1rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' },
  main: { maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 2rem 4rem', position: 'relative', zIndex: 1 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
  eyebrow: { fontSize: '0.75rem', fontWeight: 600, color: '#818cf8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem' },
  title: { fontFamily: 'Manrope, sans-serif', fontSize: '2rem', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', marginBottom: '0.35rem' },
  subtitle: { color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' },
  createBtn: { padding: '0.7rem 1.4rem', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 15px rgba(99,102,241,0.3)', fontFamily: 'Manrope, sans-serif' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' },
  statCard: { borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', backdropFilter: 'blur(12px)' },
  statTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' },
  statIcon: { fontSize: '1.25rem' },
  statValue: { fontFamily: 'Manrope, sans-serif', fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.03em' },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontWeight: 600 },
  statSub: { color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem' },
  occupancyCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', backdropFilter: 'blur(12px)' },
  occupancyHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' },
  occupancyLabel: { color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', fontWeight: 600 },
  occupancyPct: { fontFamily: 'Manrope, sans-serif', fontSize: '1.1rem', fontWeight: 800 },
  barBg: { height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.75rem' },
  barFill: { height: '100%', borderRadius: '999px', transition: 'width 0.6s cubic-bezier(.22,1,.36,1)' },
  occupancyFooter: { display: 'flex', justifyContent: 'space-between' },
  occupancySub: { color: 'rgba(255,255,255,0.25)', fontSize: '0.78rem' },
  tableSection: {},
  tableTitle: { fontFamily: 'Manrope, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '1rem', letterSpacing: '-0.01em' },
  loadingWrap: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  skeleton: { height: '72px', borderRadius: '12px', background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' },
  empty: { textAlign: 'center', padding: '4rem 2rem' },
  emptyIcon: { fontSize: '3rem', marginBottom: '1rem' },
  emptyText: { color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem', fontSize: '0.95rem' },
  tableWrap: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden', backdropFilter: 'blur(12px)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '1rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' },
  td: { padding: '1rem 1.25rem', verticalAlign: 'middle' },
  eventName: { fontWeight: 600, color: 'white', fontSize: '0.9rem', marginBottom: '0.3rem' },
  eventTags: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap' },
  tag: { padding: '0.15rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, background: 'rgba(99,102,241,0.12)', color: '#818cf8' },
  dateText: { color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '0.2rem' },
  locationText: { color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' },
  occWrap: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  occCount: { fontFamily: 'Manrope, sans-serif', fontSize: '0.9rem', fontWeight: 700 },
  miniBarBg: { height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' },
  miniBarFill: { height: '100%', borderRadius: '999px' },
  pctText: { fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' },
  statusBadge: { padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 },
  actions: { display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' },
  participantsBtn: { padding: '0.4rem 0.8rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '7px', color: '#10b981', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' },
  editBtn: { padding: '0.4rem 0.8rem', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '7px', color: '#818cf8', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' },
  cancelBtn: { padding: '0.4rem 0.8rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '7px', color: '#fbbf24', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' },
  deleteBtn: { padding: '0.4rem 0.6rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '7px', color: '#f87171', fontSize: '0.78rem', cursor: 'pointer' },
  removeBtn: {
    padding: '0.3rem 0.7rem',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: '6px', color: '#f87171',
    fontSize: '0.75rem', cursor: 'pointer',
  },
};

export default Dashboard;