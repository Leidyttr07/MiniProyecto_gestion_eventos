import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getEvents } from '../api/events';
import { useAuth } from '../context/AuthContext';

const Events = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const { isAuthenticated, isAdmin, logoutUser, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getEvents()
      .then(res => {
        setEvents(res.data);
        setFiltered(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...events];
    if (search) {
      result = result.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.description?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (status) {
      result = result.filter(e => e.status === status);
    }
    if (date) {
      result = result.filter(e => {
        const eventDate = new Date(e.start_date);
        const filterDate = new Date(date + 'T00:00:00');
        return (
          eventDate.getFullYear() === filterDate.getFullYear() &&
          eventDate.getMonth() === filterDate.getMonth() &&
          eventDate.getDate() === filterDate.getDate()
        );
      });
    }
    setFiltered(result);
  }, [search, status, date, events]);

  const handleClear = () => {
    setSearch('');
    setStatus('');
    setDate('');
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <h1 style={styles.navTitle}>🎓 Eventos Académicos</h1>
        <div style={styles.navLinks}>
          {isAuthenticated ? (
            <>
              <span style={styles.navUser}>Hola, {user?.name}</span>
              {!isAdmin && <Link to="/my-registrations" style={styles.navLink}>Mis Inscripciones</Link>}
              {isAdmin && <Link to="/admin" style={styles.navLink}>Panel Admin</Link>}
              <button onClick={handleLogout} style={styles.navButton}>Cerrar Sesión</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.navLink}>Iniciar Sesión</Link>
              <Link to="/register" style={styles.navLink}>Registrarse</Link>
            </>
          )}
        </div>
      </nav>

      <main style={styles.main}>
        <h2 style={styles.title}>Eventos Disponibles</h2>

        <div style={styles.filters}>
          <input
            style={styles.searchInput}
            placeholder="Buscar eventos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            style={styles.select}
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="cancelled">Cancelado</option>
            <option value="finished">Finalizado</option>
          </select>
          <input
            style={styles.dateInput}
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
          <button style={styles.clearBtn} onClick={handleClear}>Limpiar</button>
        </div>

        {loading ? (
          <p style={styles.empty}>Cargando eventos...</p>
        ) : filtered.length === 0 ? (
          <p style={styles.empty}>No hay eventos disponibles por el momento.</p>
        ) : (
          <div style={styles.grid}>
            {filtered.map(event => (
              <div key={event.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={{
                    ...styles.status,
                    backgroundColor: event.status === 'active' ? '#c6f6d5' : '#fed7d7',
                    color: event.status === 'active' ? '#276749' : '#c53030',
                  }}>
                    {event.status === 'active' ? 'Activo' : event.status === 'cancelled' ? 'Cancelado' : 'Finalizado'}
                  </span>
                </div>
                <h3 style={styles.cardTitle}>{event.title}</h3>
                <p style={styles.cardDesc}>{event.description}</p>
                <div style={styles.cardInfo}>
                  <span>📅 {new Date(event.start_date).toLocaleDateString('es-CO', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}</span>
                  <span>📍 {event.location || 'Por definir'}</span>
                  <span>👥 {event.available_spots} cupos disponibles</span>
                  {event.event_type && <span>🏷️ {event.event_type}</span>}
                  {event.program && <span>🎓 {event.program}</span>}
                </div>
                <button
                  style={styles.cardButton}
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  Ver detalles
                </button>
              </div>
            ))}
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
  navUser: { color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' },
  navButton: {
    backgroundColor: 'transparent', color: 'white',
    border: '1px solid white', borderRadius: '6px',
    padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.9rem',
  },
  main: { padding: '2rem' },
  title: { color: '#1a202c', marginBottom: '1.5rem' },
  filters: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  searchInput: {
    flex: 2, padding: '0.6rem 0.75rem',
    border: '1px solid #e2e8f0', borderRadius: '8px',
    fontSize: '0.9rem', minWidth: '200px',
  },
  select: {
    flex: 1, padding: '0.6rem 0.75rem',
    border: '1px solid #e2e8f0', borderRadius: '8px',
    fontSize: '0.9rem', backgroundColor: 'white',
  },
  dateInput: {
    flex: 1, padding: '0.6rem 0.75rem',
    border: '1px solid #e2e8f0', borderRadius: '8px',
    fontSize: '0.9rem',
  },
  clearBtn: {
    padding: '0.6rem 1.25rem', backgroundColor: 'white',
    border: '1px solid #e2e8f0', borderRadius: '8px',
    cursor: 'pointer', fontSize: '0.9rem', color: '#4a5568',
  },
  empty: { color: '#718096', textAlign: 'center', marginTop: '2rem' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: 'white', borderRadius: '12px',
    padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex', flexDirection: 'column', gap: '0.75rem',
  },
  cardHeader: { display: 'flex', justifyContent: 'flex-end' },
  status: { padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' },
  cardTitle: { margin: 0, color: '#1a202c', fontSize: '1.1rem' },
  cardDesc: { margin: 0, color: '#718096', fontSize: '0.9rem', lineHeight: 1.5 },
  cardInfo: { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem', color: '#4a5568' },
  cardButton: {
    marginTop: 'auto', padding: '0.6rem',
    backgroundColor: '#4f46e5', color: 'white',
    border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontWeight: 600,
  },
};

export default Events;