import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, isAdmin, logoutUser, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/events" style={styles.brand}>🎓 Eventos Académicos</Link>
      <div style={styles.links}>
        <Link to="/events" style={styles.link}>Eventos</Link>
        {isAuthenticated && (
          <span style={styles.userName}>Hola, {user?.name}</span>
        )}
        {isAuthenticated && !isAdmin && (
          <Link to="/my-registrations" style={styles.link}>Mis Inscripciones</Link>
        )}
        {isAdmin && (
          <Link to="/admin" style={styles.link}>Panel Admin</Link>
        )}
        {isAuthenticated ? (
          <button onClick={handleLogout} style={styles.button}>Cerrar Sesión</button>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Iniciar Sesión</Link>
            <Link to="/register" style={styles.linkOutline}>Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const styles: Record<string, React.CSSProperties> = {
  nav: {
    backgroundColor: '#4f46e5', padding: '1rem 2rem',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    position: 'sticky', top: 0, zIndex: 100,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  brand: {
    color: 'white', textDecoration: 'none',
    fontSize: '1.2rem', fontWeight: 700,
  },
  links: { display: 'flex', gap: '1rem', alignItems: 'center' },
  userName: { color: 'white', marginLeft: '0.5rem', fontWeight: 600 },
  link: { color: 'white', textDecoration: 'none', fontSize: '0.9rem' },
  linkOutline: {
    color: 'white', textDecoration: 'none', fontSize: '0.9rem',
    border: '1px solid white', borderRadius: '6px', padding: '0.35rem 0.75rem',
  },
  button: {
    backgroundColor: 'transparent', color: 'white',
    border: '1px solid white', borderRadius: '6px',
    padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '0.9rem',
  },
};

export default Navbar;