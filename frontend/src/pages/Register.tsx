import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerUser } from '../api/auth';
import { useState } from 'react';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: RegisterForm) => {
    try {
      setLoading(true);
      setError('');
      await registerUser({ name: data.name, email: data.email, password: data.password });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Crear Cuenta</h2>
        <p style={styles.subtitle}>Plataforma de Eventos Académicos</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={styles.field}>
            <label style={styles.label}>Nombre completo</label>
            <input
              style={styles.input}
              placeholder="Juan Pérez"
              {...register('name', { required: 'El nombre es obligatorio' })}
            />
            {errors.name && <span style={styles.fieldError}>{errors.name.message}</span>}
          </div>

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
              placeholder="Mínimo 6 caracteres"
              {...register('password', {
                required: 'La contraseña es obligatoria',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' }
              })}
            />
            {errors.password && <span style={styles.fieldError}>{errors.password.message}</span>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Confirmar contraseña</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Repite tu contraseña"
              {...register('confirmPassword', {
                required: 'Confirma tu contraseña',
                validate: value => value === watch('password') || 'Las contraseñas no coinciden'
              })}
            />
            {errors.confirmPassword && <span style={styles.fieldError}>{errors.confirmPassword.message}</span>}
          </div>

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <p style={styles.link}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
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

export default Register;