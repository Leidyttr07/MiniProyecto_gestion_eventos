import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerUser } from '../api/auth';
import { useState } from 'react';

interface RegisterForm { name: string; email: string; password: string; confirmPassword: string; }

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: RegisterForm) => {
    try {
      setLoading(true); setError('');
      await registerUser({ name: data.name, email: data.email, password: data.password });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.bgOrb1} />
      <div style={s.bgOrb2} />

      <div style={s.left}>
        <div style={s.leftContent}>
          <div style={s.logoRow}>
            <div style={s.logoBox}>🎓</div>
            <span style={s.logoText}>EventosUnicauca</span>
          </div>
          <h1 style={s.headline}>
            Únete a la<br />
            <span style={s.accent}>comunidad</span><br />
            académica
          </h1>
          <p style={s.desc}>
            Accede a todos los eventos de la Universidad del Cauca con un solo registro.
          </p>
          <div style={s.checklist}>
            {[
              'Inscripción instantánea a eventos',
              'Historial de asistencias',
              'Seminarios, talleres y conferencias',
              'Acceso a todos los programas',
            ].map(item => (
              <div key={item} style={s.checkItem}>
                <div style={s.checkIcon}>✓</div>
                <span style={s.checkText}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={s.right}>
        <div style={s.card}>
          <p style={s.eyebrow}>Registro gratuito</p>
          <h2 style={s.title}>Crear cuenta</h2>
          <p style={s.subtitle}>Completa el formulario para comenzar</p>

          {error && (
            <div style={s.errorBox}>
              <span style={s.errorIcon}>!</span>
              <span>{Array.isArray(error) ? error.join(', ') : error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Nombre completo</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>👤</span>
                <input
                  style={{ ...s.input, ...(errors.name ? s.inputErr : {}) }}
                  placeholder="Juan Pérez"
                  {...register('name', { required: 'El nombre es obligatorio' })}
                />
              </div>
              {errors.name && <span style={s.fieldErr}>{errors.name.message}</span>}
            </div>

            <div style={s.field}>
              <label style={s.label}>Correo electrónico</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>✉</span>
                <input
                  style={{ ...s.input, ...(errors.email ? s.inputErr : {}) }}
                  type="email"
                  placeholder="correo@unicauca.edu.co"
                  {...register('email', {
                    required: 'El correo es obligatorio',
                    pattern: { value: /^\S+@\S+$/i, message: 'Correo inválido' }
                  })}
                />
              </div>
              {errors.email && <span style={s.fieldErr}>{errors.email.message}</span>}
            </div>

            <div style={s.row}>
              <div style={s.field}>
                <label style={s.label}>Contraseña</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>🔒</span>
                  <input
                    style={{ ...s.input, ...(errors.password ? s.inputErr : {}) }}
                    type="password"
                    placeholder="Mín. 6 caracteres"
                    {...register('password', {
                      required: 'Obligatorio',
                      minLength: { value: 6, message: 'Mínimo 6 caracteres' }
                    })}
                  />
                </div>
                {errors.password && <span style={s.fieldErr}>{errors.password.message}</span>}
              </div>

              <div style={s.field}>
                <label style={s.label}>Confirmar</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>🔒</span>
                  <input
                    style={{ ...s.input, ...(errors.confirmPassword ? s.inputErr : {}) }}
                    type="password"
                    placeholder="Repite"
                    {...register('confirmPassword', {
                      required: 'Obligatorio',
                      validate: v => v === watch('password') || 'No coinciden'
                    })}
                  />
                </div>
                {errors.confirmPassword && <span style={s.fieldErr}>{errors.confirmPassword.message}</span>}
              </div>
            </div>

            <button style={{ ...s.btn, ...(loading ? s.btnLoading : {}) }} type="submit" disabled={loading}>
              {loading ? 'Registrando...' : 'Crear cuenta →'}
            </button>
          </form>

          <div style={s.dividerRow}>
            <div style={s.line} />
            <span style={s.orText}>¿ya tienes cuenta?</span>
            <div style={s.line} />
          </div>

          <Link to="/login" style={s.loginBtn}>Iniciar sesión</Link>
        </div>
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh', display: 'flex',
    position: 'relative', overflow: 'hidden',
    background: '#0f0c29',
  },
  bgOrb1: {
    position: 'absolute', top: '-10%', left: '-5%',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgOrb2: {
    position: 'absolute', bottom: '-15%', right: '-5%',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  left: {
    flex: '0 0 50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    padding: '4rem', position: 'relative', zIndex: 1,
  },
  leftContent: { maxWidth: '420px' },
  logoRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' },
  logoBox: {
    width: '40px', height: '40px', borderRadius: '10px',
    background: 'rgba(99,102,241,0.3)',
    border: '1px solid rgba(99,102,241,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
  },
  logoText: {
    fontFamily: 'Manrope, sans-serif', fontSize: '0.95rem',
    fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.01em',
  },
  headline: {
    fontFamily: 'Manrope, sans-serif', fontSize: '3.2rem',
    fontWeight: 800, color: 'rgba(255,255,255,0.95)',
    lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: '1.5rem',
  },
  accent: {
    background: 'linear-gradient(135deg, #818cf8, #c4b5fd)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
  },
  desc: {
    color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem',
    lineHeight: 1.7, marginBottom: '2rem',
  },
  checklist: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  checkItem: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  checkIcon: {
    width: '22px', height: '22px', borderRadius: '50%',
    background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.7rem', color: '#818cf8', flexShrink: 0, fontWeight: 700,
  },
  checkText: { color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' },
  right: {
    flex: 1, display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '2rem',
    position: 'relative', zIndex: 1,
  },
  card: {
    width: '100%', maxWidth: '460px',
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '24px', padding: '2.5rem',
  },
  eyebrow: {
    fontSize: '0.75rem', fontWeight: 600, color: '#818cf8',
    letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem',
  },
  title: {
    fontFamily: 'Manrope, sans-serif', fontSize: '1.9rem',
    fontWeight: 800, color: 'white', marginBottom: '0.35rem', letterSpacing: '-0.03em',
  },
  subtitle: { color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', marginBottom: '1.75rem' },
  errorBox: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    color: '#fca5a5', borderRadius: '10px', padding: '0.75rem 1rem',
    fontSize: '0.875rem', marginBottom: '1.25rem',
    display: 'flex', alignItems: 'center', gap: '0.75rem',
  },
  errorIcon: {
    width: '20px', height: '20px', borderRadius: '50%',
    background: 'rgba(239,68,68,0.3)', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, color: '#fca5a5',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1.1rem' },
  row: { display: 'flex', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.45rem', flex: 1 },
  label: { fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.02em' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: {
    position: 'absolute', left: '1rem', fontSize: '0.85rem',
    opacity: 0.35, pointerEvents: 'none', zIndex: 1,
  },
  input: {
    width: '100%', padding: '0.8rem 1rem 0.8rem 2.75rem',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px', fontSize: '0.9rem', color: 'white',
    outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s',
  },
  inputErr: { borderColor: 'rgba(239,68,68,0.5)' },
  fieldErr: { color: '#fca5a5', fontSize: '0.76rem' },
  btn: {
    width: '100%', padding: '0.9rem',
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    color: 'white', border: 'none', borderRadius: '12px',
    fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
    marginTop: '0.5rem', letterSpacing: '-0.01em',
    boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
    fontFamily: 'Manrope, sans-serif',
  },
  btnLoading: { opacity: 0.7 },
  dividerRow: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    margin: '1.75rem 0 1.25rem',
  },
  line: { flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' },
  orText: { color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', whiteSpace: 'nowrap' },
  loginBtn: {
    display: 'block', width: '100%', padding: '0.85rem',
    textAlign: 'center', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px', color: 'rgba(255,255,255,0.6)',
    fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s', textDecoration: 'none',
  },
};

export default Register;