import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../api/auth';
import { useState } from 'react';

interface LoginForm { email: string; password: string; }

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true); setError('');
      const res = await login(data);
      loginUser(res.data.access_token, res.data.user);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/events');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciales inválidas');
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      {/* Fondo decorativo */}
      <div style={s.bgOrb1} />
      <div style={s.bgOrb2} />
      <div style={s.bgOrb3} />

      {/* Panel izquierdo */}
      <div style={s.left}>
        <div style={s.leftContent}>
          <div style={s.logoRow}>
            <div style={s.logoBox}>🎓</div>
            <span style={s.logoText}>EventosUnicauca</span>
          </div>
          <h1 style={s.headline}>
            Gestión de<br />
            <span style={s.headlineAccent}>Eventos</span><br />
            Académicos
          </h1>
          <p style={s.desc}>
            La plataforma oficial de la Universidad del Cauca para seminarios, talleres y conferencias.
          </p>
          <div style={s.tags}>
            {['Seminarios', 'Talleres', 'Conferencias', 'Hackathons'].map(t => (
              <span key={t} style={s.tag}>{t}</span>
            ))}
          </div>
          <div style={s.divider} />
          <p style={s.quote}>"El conocimiento compartido es el mayor activo de una universidad."</p>
        </div>
      </div>

      {/* Panel derecho */}
      <div style={s.right}>
        <div style={s.card}>
          <div style={s.cardInner}>
            <p style={s.eyebrow}>Bienvenido de vuelta</p>
            <h2 style={s.title}>Inicia sesión</h2>
            <p style={s.subtitle}>Accede a todos los eventos académicos</p>

            {error && (
              <div style={s.errorBox}>
                <span style={s.errorIcon}>!</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} style={s.form}>
              <div style={s.field}>
                <label style={s.label}>Correo electrónico</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>✉</span>
                  <input
                    style={{ ...s.input, ...(errors.email ? s.inputErr : {}) }}
                    type="email"
                    placeholder="correo@unicauca.edu.co"
                    {...register('email', {
                      required: 'Campo obligatorio',
                      pattern: { value: /^\S+@\S+$/i, message: 'Correo inválido' }
                    })}
                  />
                </div>
                {errors.email && <span style={s.fieldErr}>{errors.email.message}</span>}
              </div>

              <div style={s.field}>
                <label style={s.label}>Contraseña</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>🔒</span>
                  <input
                    style={{ ...s.input, ...(errors.password ? s.inputErr : {}) }}
                    type="password"
                    placeholder="••••••••"
                    {...register('password', { required: 'Campo obligatorio' })}
                  />
                </div>
                {errors.password && <span style={s.fieldErr}>{errors.password.message}</span>}
              </div>

              <button style={{ ...s.btn, ...(loading ? s.btnLoading : {}) }} type="submit" disabled={loading}>
                {loading ? (
                  <span style={s.btnContent}>Ingresando...</span>
                ) : (
                  <span style={s.btnContent}>Ingresar <span style={s.arrow}>→</span></span>
                )}
              </button>
            </form>

            <div style={s.dividerRow}>
              <div style={s.line} />
              <span style={s.orText}>¿nuevo aquí?</span>
              <div style={s.line} />
            </div>

            <Link to="/register" style={s.registerBtn}>
              Crear cuenta gratis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    background: '#0f0c29',
  },
  bgOrb1: {
    position: 'absolute', top: '-10%', left: '-5%',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgOrb2: {
    position: 'absolute', bottom: '-15%', left: '30%',
    width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgOrb3: {
    position: 'absolute', top: '20%', left: '40%',
    width: '300px', height: '300px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  left: {
    flex: '0 0 55%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem',
    position: 'relative',
    zIndex: 1,
  },
  leftContent: { maxWidth: '460px' },
  logoRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' },
  logoBox: {
    width: '40px', height: '40px', borderRadius: '10px',
    background: 'rgba(99,102,241,0.3)',
    border: '1px solid rgba(99,102,241,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.2rem',
  },
  logoText: {
    fontFamily: 'Manrope, sans-serif',
    fontSize: '0.95rem', fontWeight: 700,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: '-0.01em',
  },
  headline: {
    fontFamily: 'Manrope, sans-serif',
    fontSize: '3.5rem', fontWeight: 800,
    color: 'rgba(255,255,255,0.95)',
    lineHeight: 1.1,
    letterSpacing: '-0.04em',
    marginBottom: '1.5rem',
  },
  headlineAccent: {
    background: 'linear-gradient(135deg, #818cf8, #c4b5fd)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  desc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '1rem', lineHeight: 1.7,
    marginBottom: '2rem',
  },
  tags: { display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '2.5rem' },
  tag: {
    padding: '0.35rem 0.9rem',
    borderRadius: '999px',
    border: '1px solid rgba(255,255,255,0.15)',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.8rem',
    fontWeight: 500,
    backdropFilter: 'blur(4px)',
  },
  divider: {
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
    marginBottom: '2rem',
  },
  quote: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: '0.85rem',
    fontStyle: 'italic',
    lineHeight: 1.6,
  },
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    position: 'relative',
    zIndex: 1,
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '24px',
    overflow: 'hidden',
  },
  cardInner: { padding: '2.5rem' },
  eyebrow: {
    fontSize: '0.75rem', fontWeight: 600,
    color: '#818cf8', letterSpacing: '0.1em',
    textTransform: 'uppercase', marginBottom: '0.5rem',
  },
  title: {
    fontFamily: 'Manrope, sans-serif',
    fontSize: '2rem', fontWeight: 800,
    color: 'white', marginBottom: '0.4rem',
    letterSpacing: '-0.03em',
  },
  subtitle: { color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', marginBottom: '2rem' },
  errorBox: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#fca5a5',
    borderRadius: '10px',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    marginBottom: '1.5rem',
    display: 'flex', alignItems: 'center', gap: '0.75rem',
  },
  errorIcon: {
    width: '20px', height: '20px', borderRadius: '50%',
    background: 'rgba(239,68,68,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
    color: '#fca5a5',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.02em' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: {
    position: 'absolute', left: '1rem',
    fontSize: '0.9rem', opacity: 0.4, pointerEvents: 'none',
    zIndex: 1,
  },
  input: {
    width: '100%',
    padding: '0.8rem 1rem 0.8rem 2.75rem',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    fontSize: '0.95rem',
    color: 'white',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s',
  },
  inputErr: { borderColor: 'rgba(239,68,68,0.5)' },
  fieldErr: { color: '#fca5a5', fontSize: '0.78rem' },
  btn: {
    width: '100%',
    padding: '0.9rem',
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '0.5rem',
    fontFamily: 'Manrope, sans-serif',
    letterSpacing: '-0.01em',
    transition: 'all 0.2s',
    boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
  },
  btnLoading: { opacity: 0.7 },
  btnContent: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' },
  arrow: { fontSize: '1.1rem' },
  dividerRow: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    margin: '1.75rem 0 1.25rem',
  },
  line: { flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' },
  orText: { color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', whiteSpace: 'nowrap' },
  registerBtn: {
    display: 'block',
    width: '100%',
    padding: '0.85rem',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '12px',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.9rem',
    fontWeight: 600,
    transition: 'all 0.2s',
    textDecoration: 'none',
  },
};

export default Login;