import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getEvent, createEvent, updateEvent } from '../../api/events';
import Navbar from '../../components/Navbar';

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
          event_type: e.event_type || '',
          program: e.program || '',
        });
      });
    }
  }, [id]);

  const onSubmit = async (data: EventFormData) => {
    try {
      setLoading(true); setError('');
      if (isEditing) {
        await updateEvent(Number(id), data);
      } else {
        await createEvent(data);
      }
      navigate('/admin');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Error al guardar el evento');
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.bgOrb1} /><div style={s.bgOrb2} />
      <Navbar />

      <main style={s.main}>
        <button style={s.backBtn} onClick={() => navigate('/admin')}>
          ← Volver al panel
        </button>

        <div style={s.layout}>
          {/* Sidebar info */}
          <div style={s.sidebar}>
            <div style={s.sideCard}>
              <div style={s.sideIcon}>{isEditing ? '✏️' : '✨'}</div>
              <h2 style={s.sideTitle}>{isEditing ? 'Editar evento' : 'Nuevo evento'}</h2>
              <p style={s.sideDesc}>
                {isEditing
                  ? 'Actualiza la información del evento. Los cambios serán visibles inmediatamente.'
                  : 'Completa el formulario para crear un nuevo evento académico en la plataforma.'}
              </p>
              <div style={s.sideTips}>
                <p style={s.sideTipsTitle}>💡 Consejos</p>
                <ul style={s.tipsList}>
                  <li style={s.tip}>Usa un título claro y descriptivo</li>
                  <li style={s.tip}>Especifica el lugar con detalle</li>
                  <li style={s.tip}>Define una capacidad realista</li>
                  <li style={s.tip}>Selecciona el programa correcto</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div style={s.formCard}>
            {error && (
              <div style={s.errorBox}>
                <span style={s.errorIcon}>!</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} style={s.form}>
              {/* Título */}
              <div style={s.section}>
                <h3 style={s.sectionLabel}>Información básica</h3>
                <div style={s.field}>
                  <label style={s.label}>Título del evento *</label>
                  <input
                    style={{ ...s.input, ...(errors.title ? s.inputErr : {}) }}
                    placeholder="Ej: Seminario de Inteligencia Artificial"
                    {...register('title', { required: 'El título es obligatorio' })}
                  />
                  {errors.title && <span style={s.fieldErr}>{errors.title.message}</span>}
                </div>

                <div style={s.field}>
                  <label style={s.label}>Descripción</label>
                  <textarea
                    style={{ ...s.input, ...s.textarea }}
                    placeholder="Describe el contenido y objetivos del evento..."
                    {...register('description')}
                  />
                </div>
              </div>

              {/* Fechas */}
              <div style={s.section}>
                <h3 style={s.sectionLabel}>Fecha y lugar</h3>
                <div style={s.row}>
                  <div style={s.field}>
                    <label style={s.label}>Fecha y hora de inicio *</label>
                    <input
                      style={{ ...s.input, ...(errors.start_date ? s.inputErr : {}) }}
                      type="datetime-local"
                      {...register('start_date', { required: 'La fecha de inicio es obligatoria' })}
                    />
                    {errors.start_date && <span style={s.fieldErr}>{errors.start_date.message}</span>}
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Fecha y hora de fin *</label>
                    <input
                      style={{ ...s.input, ...(errors.end_date ? s.inputErr : {}) }}
                      type="datetime-local"
                      {...register('end_date', { required: 'La fecha de fin es obligatoria' })}
                    />
                    {errors.end_date && <span style={s.fieldErr}>{errors.end_date.message}</span>}
                  </div>
                </div>

                <div style={s.row}>
                  <div style={s.field}>
                    <label style={s.label}>Lugar *</label>
                    <input
                      style={{ ...s.input, ...(errors.location ? s.inputErr : {}) }}
                      placeholder="Ej: Auditorio principal, Bloque A"
                      {...register('location', { required: 'El lugar es obligatorio' })}
                    />
                    {errors.location && <span style={s.fieldErr}>{errors.location.message}</span>}
                  </div>

                  <div style={{ ...s.field, flex: '0 0 160px' }}>
                    <label style={s.label}>Capacidad *</label>
                    <input
                      style={{ ...s.input, ...(errors.capacity ? s.inputErr : {}) }}
                      type="number" min={1}
                      placeholder="Ej: 50"
                      {...register('capacity', {
                        required: 'La capacidad es obligatoria',
                        min: { value: 1, message: 'Mínimo 1' },
                        valueAsNumber: true,
                      })}
                    />
                    {errors.capacity && <span style={s.fieldErr}>{errors.capacity.message}</span>}
                  </div>
                </div>
              </div>

              {/* Clasificación */}
              <div style={s.section}>
                <h3 style={s.sectionLabel}>Clasificación</h3>
                <div style={s.row}>
                  <div style={s.field}>
                    <label style={s.label}>Tipo de evento</label>
                    <select style={s.input} {...register('event_type')}>
                      <option value="">Seleccionar tipo...</option>
                      <option value="Seminario">Seminario</option>
                      <option value="Taller">Taller</option>
                      <option value="Conferencia">Conferencia</option>
                      <option value="Congreso">Congreso</option>
                      <option value="Webinar">Webinar</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Programa académico</label>
                    <select style={s.input} {...register('program')}>
                      <option value="">Seleccionar programa...</option>
                      <option value="Ingeniería Automática Industrial">Ingeniería Automática Industrial</option>
                      <option value="Ingeniería Electrónica y Telecomunicaciones">Ingeniería Electrónica y Telecomunicaciones</option>
                      <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div style={s.buttons}>
                <button
                  type="button"
                  style={s.cancelBtn}
                  onClick={() => navigate('/admin')}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }}
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : isEditing ? '✓ Guardar cambios' : '✓ Crear evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#0f0c29', position: 'relative', overflow: 'hidden' },
  bgOrb1: {
    position: 'fixed', top: '-15%', right: '-10%',
    width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  bgOrb2: {
    position: 'fixed', bottom: '-20%', left: '-10%',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  main: { maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem 4rem', position: 'relative', zIndex: 1 },
  backBtn: {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', padding: '0.5rem 1rem',
    color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem',
    cursor: 'pointer', marginBottom: '2rem', fontWeight: 500,
  },
  layout: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' },
  sidebar: {},
  sideCard: {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px', padding: '1.75rem',
    position: 'sticky', top: '80px',
    backdropFilter: 'blur(12px)',
  },
  sideIcon: { fontSize: '2rem', marginBottom: '1rem' },
  sideTitle: {
    fontFamily: 'Manrope, sans-serif', fontSize: '1.25rem',
    fontWeight: 800, color: 'white', marginBottom: '0.75rem', letterSpacing: '-0.02em',
  },
  sideDesc: { color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1.5rem' },
  sideTips: {
    background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)',
    borderRadius: '12px', padding: '1rem',
  },
  sideTipsTitle: { color: '#818cf8', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem' },
  tipsList: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  tip: { color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', lineHeight: 1.5, paddingLeft: '0.5rem', borderLeft: '2px solid rgba(99,102,241,0.3)' },
  formCard: {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px', padding: '2rem',
    backdropFilter: 'blur(12px)',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
    color: '#fca5a5', borderRadius: '12px', padding: '0.85rem 1rem',
    fontSize: '0.875rem', marginBottom: '1.5rem',
    display: 'flex', alignItems: 'center', gap: '0.75rem',
  },
  errorIcon: {
    width: '20px', height: '20px', borderRadius: '50%',
    background: 'rgba(239,68,68,0.25)', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, color: '#fca5a5',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '0' },
  section: {
    paddingBottom: '1.75rem', marginBottom: '1.75rem',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', flexDirection: 'column', gap: '1rem',
  },
  sectionLabel: {
    fontSize: '0.75rem', fontWeight: 700, color: '#818cf8',
    letterSpacing: '0.08em', textTransform: 'uppercase',
  },
  row: { display: 'flex', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.45rem', flex: 1 },
  label: { fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.02em' },
  input: {
    width: '100%', padding: '0.8rem 1rem',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px', fontSize: '0.9rem', color: 'white',
    outline: 'none', boxSizing: 'border-box',
    transition: 'all 0.2s', fontFamily: 'Outfit, sans-serif',
  },
  textarea: { minHeight: '100px', resize: 'vertical' },
  inputErr: { borderColor: 'rgba(239,68,68,0.5)' },
  fieldErr: { color: '#fca5a5', fontSize: '0.76rem' },
  buttons: { display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '0.5rem' },
  cancelBtn: {
    padding: '0.8rem 1.5rem',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', color: 'rgba(255,255,255,0.5)',
    fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
    fontFamily: 'Manrope, sans-serif',
  },
  submitBtn: {
    padding: '0.8rem 1.75rem',
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    color: 'white', border: 'none', borderRadius: '10px',
    fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
    fontFamily: 'Manrope, sans-serif',
  },
};

export default EventForm;