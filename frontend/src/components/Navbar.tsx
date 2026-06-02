import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, isAdmin, logoutUser, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logoutUser(); navigate('/login'); };
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <nav style={s.nav}>
      <Link to="/events" style={s.brand}>
        <div style={s.brandIcon}>🎓</div>
        <span style={s.brandText}>EventosUnicauca</span>
      </Link>

      <div style={s.links}>
        <Link to="/events" style={{ ...s.link, ...(isActive('/events') && !isActive('/events/') ? s.linkActive : {}) }}>
          Eventos
        </Link>
        {isAuthenticated && !isAdmin && (
          <Link to="/my-registrations" style={{ ...s.link, ...(isActive('/my-registrations') ? s.linkActive : {}) }}>
            Mis Inscripciones
          </Link>
        )}
        {isAdmin && (
          <Link to="/admin" style={{ ...s.link, ...(isActive('/admin') ? s.linkActive : {}) }}>
            Panel Admin
          </Link>
        )}
      </div>

      <div style={s.right}>
        {isAuthenticated ? (
          <>
            <div style={s.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
            <span style={s.userName}>{user?.name?.split(' ')[0]}</span>
            <button onClick={handleLogout} style={s.logoutBtn}>Salir</button>
          </>
        ) : (
          <>
            <Link to="/login" style={s.loginLink}>Iniciar sesión</Link>
            <Link to="/register" style={s.registerBtn}>Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const s: Record<string, React.CSSProperties> = {
  nav: {
    position: 'sticky', top: 0, zIndex: 100,
    background: 'rgba(15,12,41,0.85)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    padding: '0 2rem',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    height: '64px',
  },
  brand: { display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' },
  brandIcon: { fontSize: '1.4rem' },
  brandText: {
    fontFamily: 'Manrope, sans-serif', fontWeight: 800,
    fontSize: '1.05rem', color: '#818cf8', letterSpacing: '-0.02em',
  },
  links: { display: 'flex', alignItems: 'center', gap: '0.25rem' },
  link: {
    padding: '0.4rem 0.85rem', borderRadius: '8px',
    fontSize: '0.9rem', fontWeight: 500,
    color: 'rgba(255,255,255,0.5)', transition: 'all 0.15s', textDecoration: 'none',
  },
  linkActive: { background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontWeight: 600 },
  right: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  avatar: {
    width: '32px', height: '32px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #4338ca)',
    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.85rem', fontWeight: 700,
  },
  userName: { fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.5)' },
  logoutBtn: {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', padding: '0.45rem 0.9rem',
    fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontWeight: 500,
  },
  loginLink: { fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' },
  registerBtn: {
    background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)',
    color: '#818cf8', padding: '0.45rem 1rem', borderRadius: '8px',
    fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none',
  },
};

export default Navbar;