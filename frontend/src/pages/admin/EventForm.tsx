import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createEvent, updateEvent, getEvent } from '../../api/events';
import { useEffect, useState } from 'react';

interface EventFormData {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  capacity: number;
  event_type: string;
  program: string;
}

const EventForm = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EventFormData>();

  useEffect(() => {
    if (isEditing) {
      getEvent(Number(id)).then(res => {
        const e = res.data;
        reset({
          title: e.title,
          description: e.description,
          start_date: e.start_date?.slice(0, 16),
          end_date: e.end_date?.slice(0, 16),
          location: e.location,
          capacity: e.capacity,
        });
      });
    }
  }, [id]);

  const onSubmit = async (data: EventFormData) => {
    try {
      setLoading(true);
      setError('');
      if (isEditing) {
        await updateEvent(Number(id), data);
      } else {
        await createEvent(data);
      }
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar el evento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <h1 style={styles.navTitle}>🎓 Panel Administrador</h1>
        <Link to="/admin" style={styles.navLink}>← Volver al panel</Link>
      </nav>

      <main style={styles.main}>
        <div style={styles.card}>
          <h2 style={styles.title}>{isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}</h2>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={styles.field}>
              <label style={styles.label}>Título del evento</label>
              <input
                style={styles.input}
                placeholder="Ej: Seminario de Inteligencia Artificial"
                {...register('title', { required: 'El título es obligatorio' })}
              />
              {errors.title && <span style={styles.fieldError}>{errors.title.message}</span>}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Descripción</label>
              <textarea
                style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
                placeholder="Descripción del evento..."
                {...register('description')}
              />
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Fecha y hora de inicio</label>
                <input
                  style={styles.input}
                  type="datetime-local"
                  {...register('start_date', { required: 'La fecha de inicio es obligatoria' })}
                />
                {errors.start_date && <span style={styles.fieldError}>{errors.start_date.message}</span>}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Fecha y hora de fin</label>
                <input
                  style={styles.input}
                  type="datetime-local"
                  {...register('end_date', { required: 'La fecha de fin es obligatoria' })}
                />
                {errors.end_date && <span style={styles.fieldError}>{errors.end_date.message}</span>}
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Lugar</label>
                <input
                  style={styles.input}
                  placeholder="Ej: Auditorio principal"
                  {...register('location')}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Capacidad</label>
                <input
                  style={styles.input}
                  type="number"
                  min={1}
                  placeholder="Ej: 50"
                  {...register('capacity', {
                    required: 'La capacidad es obligatoria',
                    min: { value: 1, message: 'Mínimo 1 persona' },
                    valueAsNumber: true,
                  })}
                />
                {errors.capacity && <span style={styles.fieldError}>{errors.capacity.message}</span>}
              </div>
            </div>
                  <div style={styles.row}>
  <div style={styles.field}>
    <label style={styles.label}>Tipo de evento</label>
    <select style={styles.input} {...register('event_type')}>
      <option value="">Seleccionar...</option>
      <option value="Seminario">Seminario</option>
      <option value="Taller">Taller</option>
      <option value="Conferencia">Conferencia</option>
    </select>
  </div>

  <div style={styles.field}>
      <label style={styles.label}>Programa académico</label>
      <select style={styles.input} {...register('program')}>
        <option value="">Seleccionar...</option>
        <option value="Ingeniería Automática Industrial">Ingeniería Automática Industrial</option>
        <option value="Ingeniería Electrónica y Telecomunicaciones">Ingeniería Electrónica y Telecomunicaciones</option>
        <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
      </select>
    </div>
  </div>
            <div style={styles.buttons}>
              <button type="button" style={styles.cancelBtn} onClick={() => navigate('/admin')}>
                Cancelar
              </button>
              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear evento'}
              </button>
            </div>
          </form>
        </div>
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
  navLink: { color: 'white', textDecoration: 'none', fontSize: '0.9rem' },
  main: { padding: '2rem', maxWidth: '700px', margin: '0 auto' },
  card: {
    backgroundColor: 'white', borderRadius: '12px',
    padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  title: { margin: '0 0 1.5rem', color: '#1a202c' },
  error: {
    backgroundColor: '#fed7d7', color: '#c53030',
    padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem',
  },
  field: { marginBottom: '1.25rem', flex: 1 },
  row: { display: 'flex', gap: '1rem' },
  label: { display: 'block', marginBottom: '0.4rem', color: '#4a5568', fontWeight: 600, fontSize: '0.9rem' },
  input: {
    width: '100%', padding: '0.6rem 0.75rem',
    border: '1px solid #e2e8f0', borderRadius: '8px',
    fontSize: '1rem', boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  fieldError: { color: '#e53e3e', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' },
  buttons: { display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' },
  cancelBtn: {
    padding: '0.75rem 1.5rem', backgroundColor: 'white',
    color: '#4a5568', border: '1px solid #e2e8f0',
    borderRadius: '8px', cursor: 'pointer', fontSize: '1rem',
  },
  submitBtn: {
    padding: '0.75rem 1.5rem', backgroundColor: '#4f46e5',
    color: 'white', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontSize: '1rem', fontWeight: 600,
  },
};

export default EventForm;