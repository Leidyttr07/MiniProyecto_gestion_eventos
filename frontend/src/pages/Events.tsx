import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents } from '../api/events';
import Navbar from '../components/Navbar';

const Events = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [page, setPage] = useState(1);
  const limit = 6;
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await getEvents({
          q: search || undefined,
          status: status || undefined,
          start_date: startDate || undefined,
          page,
          limit,
        });
        const payload = res.data;
        if (payload.data) {
          setEvents(payload.data);
          setTotal(payload.total);
        } else {
          setEvents(payload);
          setTotal(payload.length);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [search, status, startDate, page, limit]);


  return (
    <div style={styles.container}>
    <Navbar />

      <main style={styles.main}>
        <h2 style={styles.title}>Eventos Disponibles</h2>

        <div style={styles.filtersRow}>
          <input
            type="text"
            placeholder="Buscar eventos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={styles.select}
          >
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="cancelled">Cancelado</option>
            <option value="finished">Finalizado</option>
          </select>
          <input
            type="date"
            placeholder="Fecha de inicio"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={styles.dateInput}
          />
          <button
            style={styles.clearButton}
            onClick={() => {
              setSearch('');
              setStatus('');
              setStartDate('');
              setPage(1);
            }}
          >
            Limpiar
          </button>
        </div>
        <div style={styles.pageControls}>
          <span style={styles.pageInfo}>Página {page} de {Math.max(1, Math.ceil(total / limit))}</span>
          <button
            style={styles.pageButton}
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Anterior
          </button>
          <button
            style={styles.pageButton}
            disabled={page >= Math.ceil(total / limit)}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Siguiente
          </button>
        </div>

        {loading ? (
          <p style={styles.loading}>Cargando eventos...</p>
        ) : events.length === 0 ? (
          <p style={styles.empty}>No hay eventos disponibles por el momento.</p>
        ) : (
          <div style={styles.grid}>
            {events.map(event => (
              <div key={event.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.category}>
                    {event.category?.name || 'Sin categoría'}
                  </span>
                  <span style={{
                    ...styles.status,
                    backgroundColor: event.status === 'active' ? '#c6f6d5' : '#fed7d7',
                    color: event.status === 'active' ? '#276749' : '#c53030',
                  }}>
                    {event.status === 'active' ? 'Activo' : event.status}
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
  navButton: {
    backgroundColor: 'transparent', color: 'white',
    border: '1px solid white', borderRadius: '6px',
    padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.9rem',
  },
  main: { padding: '2rem' },
  title: { color: '#1a202c', marginBottom: '1rem' },
  filtersRow: {
    display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem',
  },
  searchInput: {
    flex: 1, minWidth: '220px', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e0',
  },
  select: {
    padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e0', backgroundColor: 'white', minWidth: '180px',
  },
  dateInput: {
    padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e0', backgroundColor: 'white', minWidth: '170px',
  },
  searchButton: {
    padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none', backgroundColor: '#4f46e5', color: 'white', cursor: 'pointer',
  },
  clearButton: {
    padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid #cbd5e0', backgroundColor: 'white', color: '#4a5568', cursor: 'pointer',
  },
  pageControls: {
    display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.25rem',
  },
  pageInfo: { color: '#4a5568', fontSize: '0.95rem' },
  pageButton: {
    padding: '0.65rem 1rem', backgroundColor: '#4f46e5', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer',
  },
  loading: { color: '#718096', textAlign: 'center', marginTop: '2rem' },
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
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  category: {
    backgroundColor: '#ebf4ff', color: '#3182ce',
    padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem',
  },
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