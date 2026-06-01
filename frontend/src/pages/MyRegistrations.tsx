import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyRegistrations, cancelRegistration } from '../api/registrations';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      // Admins should not access participant-only pages
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    getMyRegistrations()
      .then(res => setRegistrations(res.data))
      .finally(() => setLoading(false));
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


  return (
    <div style={styles.container}>
    <Navbar />
      <main style={styles.main}>
        <h2 style={styles.title}>Mis Inscripciones</h2>

        {loading ? (
          <p style={styles.empty}>Cargando...</p>
        ) : registrations.length === 0 ? (
          <div style={styles.emptyBox}>
            <p>No tienes inscripciones aún.</p>
            <Link to="/events" style={styles.link}>Ver eventos disponibles</Link>
          </div>
        ) : (
          <div style={styles.list}>
            {registrations.map(reg => (
              <div key={reg.id} style={styles.card}>
                <div style={styles.cardLeft}>
                  <h3 style={styles.eventTitle}>{reg.event.title}</h3>
                  <p style={styles.eventInfo}>
                    📅 {new Date(reg.event.start_date).toLocaleDateString('es-CO', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                  <p style={styles.eventInfo}>📍 {reg.event.location || 'Por definir'}</p>
                  <p style={styles.eventInfo}>
                    Inscrito el: {new Date(reg.registered_at).toLocaleDateString('es-CO')}
                  </p>
                </div>
                <div style={styles.cardRight}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: reg.status === 'active' ? '#c6f6d5' : '#fed7d7',
                    color: reg.status === 'active' ? '#276749' : '#c53030',
                  }}>
                    {reg.status === 'active' ? 'Activo' : 'Cancelado'}
                  </span>
                  {reg.status === 'active' && (
                    <button
                      style={styles.cancelBtn}
                      onClick={() => handleCancel(reg.id)}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
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
  main: { padding: '2rem', maxWidth: '800px', margin: '0 auto' },
  title: { color: '#1a202c', marginBottom: '1.5rem' },
  empty: { color: '#718096', textAlign: 'center' },
  emptyBox: { textAlign: 'center', padding: '3rem', color: '#718096' },
  link: { color: '#4f46e5', textDecoration: 'none', fontWeight: 600 },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: {
    backgroundColor: 'white', borderRadius: '12px',
    padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  cardLeft: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  cardRight: { display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end' },
  eventTitle: { margin: 0, color: '#1a202c', fontSize: '1.1rem' },
  eventInfo: { margin: 0, color: '#718096', fontSize: '0.85rem' },
  badge: { padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 },
  cancelBtn: {
    padding: '0.4rem 1rem', backgroundColor: '#e53e3e',
    color: 'white', border: 'none', borderRadius: '6px',
    cursor: 'pointer', fontSize: '0.85rem',
  },
};

export default MyRegistrations;