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

  useEffect(() => {
    getEvent(Number(id))
      .then(res => setEvent(res.data))
      .finally(() => setLoading(false));

    if (isAuthenticated) {
      getMyRegistrations().then(res => {
        const reg = res.data.find((r: any) => r.event.id === Number(id) && r.status === 'active');
        setMyRegistration(reg || null);
      });
    }
  }, [id, isAuthenticated]);

  const handleRegister = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      setActionLoading(true);
      const res = await registerToEvent(Number(id));
      setMyRegistration(res.data);
      setEvent((e: any) => ({ ...e, available_spots: e.available_spots - 1 }));
      setMessage('¡Inscripción exitosa!');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error al inscribirse');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setActionLoading(true);
      await cancelRegistration(myRegistration.id);
      setMyRegistration(null);
      setEvent((e: any) => ({ ...e, available_spots: e.available_spots + 1 }));
      setMessage('Inscripción cancelada');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error al cancelar');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div style={styles.loading}>Cargando...</div>;
  if (!event) return <div style={styles.loading}>Evento no encontrado</div>;

  return (
    <div style={styles.container}>
      <Navbar />

      <main style={styles.main}>
        <div style={styles.card}>
          <div style={styles.header}>
            <span style={styles.category}>{event.category?.name || 'Sin categoría'}</span>
            <span style={{
              ...styles.status,
              backgroundColor: event.status === 'active' ? '#c6f6d5' : '#fed7d7',
              color: event.status === 'active' ? '#276749' : '#c53030',
            }}>
              {event.status === 'active' ? 'Activo' : event.status}
            </span>
          </div>

          <h2 style={styles.title}>{event.title}</h2>
          <p style={styles.description}>{event.description}</p>

          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>📅 Fecha inicio</span>
              <span>{new Date(event.start_date).toLocaleString('es-CO')}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>📅 Fecha fin</span>
              <span>{new Date(event.end_date).toLocaleString('es-CO')}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>📍 Lugar</span>
              <span>{event.location || 'Por definir'}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>👥 Cupos disponibles</span>
              <span style={{ fontWeight: 700, color: event.available_spots > 0 ? '#276749' : '#c53030' }}>
                {event.available_spots} / {event.capacity}
              </span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>👤 Organizador</span>
              <span>{event.organizer?.name}</span>
            </div>
          </div>

          {message && (
            <div style={{
              ...styles.message,
              backgroundColor: message.includes('exitosa') || message.includes('cancelada') ? '#c6f6d5' : '#fed7d7',
              color: message.includes('exitosa') || message.includes('cancelada') ? '#276749' : '#c53030',
            }}>
              {message}
            </div>
          )}

          <div style={styles.actions}>
            {!isAdmin && (myRegistration ? (
              <button
                style={{ ...styles.button, backgroundColor: '#e53e3e' }}
                onClick={handleCancel}
                disabled={actionLoading}
              >
                {actionLoading ? 'Procesando...' : 'Cancelar inscripción'}
              </button>
            ) : (
              <button
                style={{
                  ...styles.button,
                  backgroundColor: event.available_spots > 0 ? '#4f46e5' : '#a0aec0',
                  cursor: event.available_spots > 0 ? 'pointer' : 'not-allowed',
                }}
                onClick={handleRegister}
                disabled={actionLoading || event.available_spots <= 0}
              >
                {actionLoading ? 'Procesando...' : event.available_spots > 0 ? 'Inscribirse' : 'Sin cupos'}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', backgroundColor: '#f0f4f8' },
  nav: {
    backgroundColor: '#4f46e5', padding: '1rem 2rem',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  navTitle: { color: 'white', margin: 0, fontSize: '1.25rem' },
  navLink: { color: 'white', textDecoration: 'none', fontSize: '0.9rem' },
  main: { padding: '2rem', maxWidth: '800px', margin: '0 auto' },
  card: {
    backgroundColor: 'white', borderRadius: '12px',
    padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' },
  category: {
    backgroundColor: '#ebf4ff', color: '#3182ce',
    padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.85rem',
  },
  status: { padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.85rem' },
  title: { margin: '0 0 1rem', color: '#1a202c', fontSize: '1.75rem' },
  description: { color: '#718096', lineHeight: 1.7, marginBottom: '1.5rem' },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' },
  infoItem: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  infoLabel: { fontWeight: 600, color: '#4a5568', fontSize: '0.85rem' },
  message: { padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' },
  actions: { display: 'flex', gap: '1rem' },
  button: {
    padding: '0.75rem 2rem', color: 'white',
    border: 'none', borderRadius: '8px',
    fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
  },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' },
};

export default EventDetail;