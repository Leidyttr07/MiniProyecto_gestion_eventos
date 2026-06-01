import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getEvent, createEvent, updateEvent } from '../../api/events';
import api from '../../api/client';
import Navbar from '../../components/Navbar';

interface EventFormData {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  capacity: number;
  category_id?: number;
}

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EventFormData>();

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data));

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
          category_id: e.category?.id,
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
    <Navbar />
      <main style={styles.main}>
        <div style={styles.card}>
          <h2 style={styles.title}>{isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}</h2>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={styles.field}>
              <label style={styles.label}>Título *</label>
              <input
                style={styles.input}
                placeholder="Nombre del evento"
                {...register('title', { required: 'El título es obligatorio' })}
              />
              {errors.title && <span style={styles.fieldError}>{errors.title.message}</span>}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Descripción</label>
              <textarea
                style={{ ...styles.input, height: '100px', resize: 'vertical' }}
                placeholder="Descripción del evento"
                {...register('description')}
              />
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Fecha inicio *</label>
                <input
                  style={styles.input}
                  type="datetime-local"
                  {...register('start_date', { required: 'Requerido' })}
                />
                {errors.start_date && <span style={styles.fieldError}>{errors.start_date.message}</span>}
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Fecha fin *</label>
                <input
                  style={styles.input}
                  type="datetime-local"
                  {...register('end_date', { required: 'Requerido' })}
                />
                {errors.end_date && <span style={styles.fieldError}>{errors.end_date.message}</span>}
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Lugar</label>
                <input
                  style={styles.input}
                  placeholder="Auditorio, sala, etc."
                  {...register('location')}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Capacidad *</label>
                <input
                  style={styles.input}
                  type="number"
                  min={1}
                  placeholder="Ej: 50"
                  {...register('capacity', {
                    required: 'Requerido',
                    valueAsNumber: true,
                    min: { value: 1, message: 'Mínimo 1' }
                  })}
                />
                {errors.capacity && <span style={styles.fieldError}>{errors.capacity.message}</span>}
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Categoría</label>
              <select style={styles.input} {...register('category_id', { valueAsNumber: true })}>
                <option value="">Sin categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div style={styles.buttons}>
              <Link to="/admin" style={styles.cancelBtn}>Cancelar</Link>
              <button style={styles.submitBtn} type="submit" disabled={loading}>
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
    padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem',
  },
  field: { marginBottom: '1.25rem', flex: 1 },
  row: { display: 'flex', gap: '1rem' },
  label: { display: 'block', marginBottom: '0.4rem', color: '#4a5568', fontWeight: 600, fontSize: '0.9rem' },
  input: {
    width: '100%', padding: '0.6rem 0.75rem',
    border: '1px solid #e2e8f0', borderRadius: '8px',
    fontSize: '1rem', boxSizing: 'border-box',
  },
  fieldError: { color: '#e53e3e', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' },
  buttons: { display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' },
  cancelBtn: {
    padding: '0.75rem 1.5rem', backgroundColor: '#edf2f7',
    color: '#4a5568', borderRadius: '8px',
    textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem',
  },
  submitBtn: {
    padding: '0.75rem 1.5rem', backgroundColor: '#4f46e5',
    color: 'white', border: 'none', borderRadius: '8px',
    fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
  },
};

export default EventForm;