# EventosUnicauca — Plataforma de Gestión de Eventos Académicos

Aplicación web para la administración de eventos académicos, seminarios, talleres y conferencias de la Universidad del Cauca. Permite a estudiantes y docentes registrarse, consultar eventos, realizar inscripciones y gestionar la asistencia.

---

## Tecnologías

**Frontend:** React + TypeScript + Vite  
**Backend:** NestJS + TypeScript  
**Base de datos:** PostgreSQL  
**Autenticación:** JWT + bcrypt  
**Validación:** React Hook Form + class-validator  
**HTTP Client:** Axios  

---

## Funcionalidades

### Participantes
- Registro con nombre, apellido, código estudiantil y programa académico
- Inicio de sesión con JWT
- Consulta de eventos con filtros por nombre, estado y fecha
- Visualización de cupos disponibles en tiempo real
- Inscripción y cancelación de inscripción a eventos
- Historial de inscripciones activas y canceladas
- Notificación cuando el organizador elimina al participante del evento

### Administrador
- Panel con estadísticas: total de eventos, inscripciones, porcentaje de ocupación
- CRUD completo de eventos (crear, editar, cancelar, eliminar)
- Visualización de participantes inscritos por evento
- Eliminación de participantes con notificación automática
- Actualización en tiempo real sin recargar la página (polling cada 5 segundos)

---

## Estructura del proyecto

```
miniproyecto/
├── frontend/          # Aplicación React
│   └── src/
│       ├── api/           # Clientes HTTP (Axios)
│       ├── components/    # Componentes reutilizables
│       ├── context/       # AuthContext (JWT, roles)
│       ├── pages/         # Páginas de la aplicación
│       │   ├── admin/     # Dashboard y formulario de eventos
│       │   ├── Events.tsx
│       │   ├── EventDetail.tsx
│       │   ├── Login.tsx
│       │   ├── Register.tsx
│       │   └── MyRegistrations.tsx
│       └── router/        # AppRouter con rutas protegidas
│
└── eventos-backend/   # API REST NestJS
    └── src/
        ├── auth/          # Registro, login, JWT, guards
        ├── users/         # Gestión de usuarios
        ├── events/        # CRUD de eventos
        └── registrations/ # Inscripciones y cancelaciones
```

---

## Instalación y ejecución local

### Requisitos
- Node.js 18+
- PostgreSQL 14+

### Base de datos

Crear la base de datos en PostgreSQL:

```sql
CREATE DATABASE eventos_academicos;
```

Ejecutar el esquema:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'participant',
  student_code VARCHAR(20),
  program VARCHAR(150),
  refresh_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  location VARCHAR(255),
  capacity INTEGER DEFAULT 30,
  available_spots INTEGER DEFAULT 30,
  status VARCHAR(20) DEFAULT 'active',
  organizer_id INTEGER REFERENCES users(id),
  event_type VARCHAR(100),
  program VARCHAR(150),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE registrations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  event_id INTEGER REFERENCES events(id),
  status VARCHAR(20) DEFAULT 'active',
  removed_by_admin BOOLEAN DEFAULT FALSE,
  registered_at TIMESTAMP DEFAULT NOW()
);
```

### Backend

```bash
cd eventos-backend
npm install
```

Crear el archivo `.env` en la raíz del backend:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=eventos_academicos
JWT_SECRET=una_clave_secreta_muy_larga_y_segura
JWT_EXPIRES_IN=24h
PORT=3000
```

Iniciar el servidor:

```bash
npm run start:dev
```

El backend queda disponible en `http://localhost:3000`  
Documentación Swagger en `http://localhost:3000/api/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend queda disponible en `http://localhost:5173`

---

## Variables de entorno

### Backend (.env)

| Variable | Descripción |
|---|---|
| DB_HOST | Host de PostgreSQL |
| DB_PORT | Puerto de PostgreSQL |
| DB_USER | Usuario de PostgreSQL |
| DB_PASSWORD | Contraseña de PostgreSQL |
| DB_NAME | Nombre de la base de datos |
| JWT_SECRET | Clave secreta para firmar tokens |
| JWT_EXPIRES_IN | Tiempo de expiración del token |
| PORT | Puerto del servidor |

---

## Endpoints principales de la API

### Autenticación
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | /auth/register | Registro de usuario | No |
| POST | /auth/login | Inicio de sesión | No |
| POST | /auth/logout | Cerrar sesión | Sí |

### Eventos
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | /events | Listar todos los eventos | No |
| GET | /events/:id | Obtener un evento | No |
| POST | /events | Crear evento | Admin |
| PUT | /events/:id | Editar evento | Admin |
| DELETE | /events/:id | Eliminar evento | Admin |
| PUT | /events/:id/cancel | Cancelar evento | Admin |

### Inscripciones
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | /registrations | Inscribirse a un evento | Participante |
| PUT | /registrations/:id/cancel | Cancelar inscripción | Participante |
| GET | /registrations/my | Ver mis inscripciones | Participante |
| GET | /registrations/event/:id | Ver inscritos por evento | Admin |
| DELETE | /registrations/:id | Eliminar participante | Admin |

---

## Seguridad implementada

- Contraseñas hasheadas con **bcrypt** (salt rounds: 10)
- Autenticación con **JWT** (access token + refresh token)
- Autorización por roles con **Guards de NestJS**
- Protección de rutas en el frontend con **React Router**
- **CORS** habilitado para comunicación frontend-backend
- Validación de entradas en frontend (**React Hook Form**) y backend (**class-validator**)
- El `.env` está en `.gitignore` — las credenciales no se suben al repositorio

---

## Roles del sistema

| Rol | Permisos |
|---|---|
| **participant** | Ver eventos, inscribirse, cancelar inscripción, ver sus inscripciones |
| **admin** | Todo lo anterior + crear/editar/eliminar eventos, ver y eliminar inscritos |

El rol `admin` solo se asigna manualmente en la base de datos. El registro público siempre crea usuarios con rol `participant`.

---

## Autores

Proyecto desarrollado para la asignatura **Desarrollo de Aplicaciones Web**  
Universidad del Cauca — 2026
