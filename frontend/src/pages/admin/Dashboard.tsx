import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getEvents, deleteEvent, cancelEvent } from '../../api/events';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getEvents()
      .then(res => setEvents(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`¿Eliminar el evento "${title}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const handleCancel = async (id: number, title: string) => {
    if (!confirm(`¿Cancelar el evento "${title}"? Los participantes verán el evento como cancelado.`)) return;
    try {
      await cancelEvent(id);
      setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'cancelled' } : e));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al cancelar');
    }
  };

  const handleLogout = () => { logoutUser(); navigate('/login'); };

  const totalEvents = events.length;
  const activeEvents = events.filter(e => e.status === 'active').length;
  const totalCapacity = events.reduce((sum, e) => sum + e.capacity, 0);
  const totalRegistered = events.reduce((sum, e) => sum + (e.capacity - e.available_spots), 0);

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <h1 style={styles.navTitle}>🎓 Panel Administrador</h1>
        <div style={styles.navLinks}>
          <Link to="/events" style={styles.navLink}>Ver sitio</Link>
          <button onClick={handleLogout} style={styles.navButton}>Cerrar Sesión</button>
        </div>
      </nav>

      <main style={styles.main}>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>{totalEvents}</span>
            <span style={styles.statLabel}>Total eventos</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>{activeEvents}</span>
            <span style={styles.statLabel}>Eventos activos</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>{totalRegistered}</span>
            <span style={styles.statLabel}>Inscripciones totales</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>{totalCapacity}</span>
            <span style={styles.statLabel}>Capacidad total</span>
          </div>
        </div>

        <div style={styles.tableHeader}>
          <h2 style={styles.tableTitle}>Gestión de Eventos</h2>
          <Link to="/admin/events/new" style={styles.createBtn}>+ Crear evento</Link>
        </div>

        {loading ? (
          <p style={styles.empty}>Cargando eventos...</p>
        ) : events.length === 0 ? (
          <p style={styles.empty}>No hay eventos creados.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Evento</th>
                  <th style={styles.th}>Fecha</th>
                  <th style={styles.th}>Cupos</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.eventName}>{event.title}</div>
                      <div style={styles.eventCategory}>
                        {event.event_type || 'Sin tipo'} — {event.program || 'Sin programa'}
                      </div>
                    </td>
                    <td style={styles.td}>
                      {new Date(event.start_date).toLocaleDateString('es-CO', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        fontWeight: 700,
                        color: event.available_spots > 0 ? '#276749' : '#c53030'
                      }}>
                        {event.available_spots}/{event.capacity}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: event.status === 'active' ? '#c6f6d5' : event.status === 'cancelled' ? '#fed7d7' : '#e2e8f0',
                        color: event.status === 'active' ? '#276749' : event.status === 'cancelled' ? '#c53030' : '#4a5568',
                      }}>
                        {event.status === 'active' ? 'Activo' : event.status === 'cancelled' ? 'Cancelado' : 'Finalizado'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <Link to={`/admin/events/${event.id}/edit`} style={styles.editBtn}>
                          Editar
                        </Link>
                        {event.status === 'active' && (
                          <button
                            style={styles.cancelBtn}
                            onClick={() => handleCancel(event.id, event.title)}
                          >
                            Cancelar
                          </button>
                        )}
                        <button
                          style={styles.deleteBtn}
                          onClick={() => handleDelete(event.id, event.title)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
  navLinks: { display: 'flex', gap: '1rem', alignItems: 'center' },
  navLink: { color: 'white', textDecoration: 'none', fontSize: '0.9rem' },
  navButton: {
    backgroundColor: 'transparent', color: 'white',
    border: '1px solid white', borderRadius: '6px',
    padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.9rem',
  },
  main: { padding: '2rem' },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem', marginBottom: '2rem',
  },
  statCard: {
    backgroundColor: 'white', borderRadius: '12px',
    padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
  },
  statNumber: { fontSize: '2rem', fontWeight: 700, color: '#4f46e5' },
  statLabel: { fontSize: '0.85rem', color: '#718096' },
  tableHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '1rem',
  },
  tableTitle: { margin: 0, color: '#1a202c' },
  createBtn: {
    backgroundColor: '#4f46e5', color: 'white',
    padding: '0.6rem 1.25rem', borderRadius: '8px',
    textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
  },
  tableWrapper: {
    backgroundColor: 'white', borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#f7fafc' },
  th: {
    padding: '1rem', textAlign: 'left',
    fontSize: '0.85rem', color: '#4a5568',
    fontWeight: 600, borderBottom: '1px solid #e2e8f0',
  },
  tr: { borderBottom: '1px solid #e2e8f0' },
  td: { padding: '1rem', fontSize: '0.9rem', color: '#2d3748' },
  eventName: { fontWeight: 600 },
  eventCategory: { fontSize: '0.8rem', color: '#718096', marginTop: '0.2rem' },
  badge: { padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 },
  actions: { display: 'flex', gap: '0.5rem' },
  editBtn: {
    padding: '0.35rem 0.75rem', backgroundColor: '#ebf8ff',
    color: '#2b6cb0', borderRadius: '6px',
    textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600,
  },
  cancelBtn: {
    padding: '0.35rem 0.75rem', backgroundColor: '#fffbeb',
    color: '#b7791f', border: 'none', borderRadius: '6px',
    cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
  },
  deleteBtn: {
    padding: '0.35rem 0.75rem', backgroundColor: '#fff5f5',
    color: '#c53030', border: 'none', borderRadius: '6px',
    cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
  },
  empty: { color: '#718096', textAlign: 'center', padding: '2rem' },
};

export default Dashboard;