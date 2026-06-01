import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../api/auth';
import { useState } from 'react';

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      setError('');
      const res = await login(data);
      loginUser(res.data.access_token, res.data.user);
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/events');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Iniciar Sesión</h2>
        <p style={styles.subtitle}>Plataforma de Eventos Académicos</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={styles.field}>
            <label style={styles.label}>Correo electrónico</label>
            <input
              style={styles.input}
              type="email"
              placeholder="correo@unicauca.edu.co"
              {...register('email', {
                required: 'El correo es obligatorio',
                pattern: { value: /^\S+@\S+$/i, message: 'Correo inválido' }
              })}
            />
            {errors.email && <span style={styles.fieldError}>{errors.email.message}</span>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••"
              {...register('password', { required: 'La contraseña es obligatoria' })}
            />
            {errors.password && <span style={styles.fieldError}>{errors.password.message}</span>}
          </div>

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p style={styles.link}>
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f0f4f8',
  },
  card: {
    backgroundColor: 'white', padding: '2rem',
    borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%', maxWidth: '420px',
  },
  title: { margin: '0 0 0.25rem', color: '#1a202c', fontSize: '1.75rem' },
  subtitle: { margin: '0 0 1.5rem', color: '#718096', fontSize: '0.9rem' },
  error: {
    backgroundColor: '#fed7d7', color: '#c53030',
    padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem',
    fontSize: '0.9rem',
  },
  field: { marginBottom: '1rem' },
  label: { display: 'block', marginBottom: '0.4rem', color: '#4a5568', fontWeight: 600, fontSize: '0.9rem' },
  input: {
    width: '100%', padding: '0.6rem 0.75rem',
    border: '1px solid #e2e8f0', borderRadius: '8px',
    fontSize: '1rem', boxSizing: 'border-box',
    outline: 'none',
  },
  fieldError: { color: '#e53e3e', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' },
  button: {
    width: '100%', padding: '0.75rem',
    backgroundColor: '#4f46e5', color: 'white',
    border: 'none', borderRadius: '8px',
    fontSize: '1rem', fontWeight: 600,
    cursor: 'pointer', marginTop: '0.5rem',
  },
  link: { textAlign: 'center', marginTop: '1rem', color: '#718096', fontSize: '0.9rem' },
};

export default Login;