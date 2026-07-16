# Sistema de Gestión de Biblioteca — Sprint 1 y 2 (Segundo Parcial)

Proyecto final de Ingeniería de Software I — Universidad José Cecilio del Valle.

## Alcance cubierto hasta ahora

**Sprint 1:**
- Base de datos completa: 8 tablas con relaciones 1:N y N:M, normalizadas hasta 3FN.
- Autenticación (registro/login) con contraseñas hasheadas con bcrypt.
- CRUD completo de **Usuarios** (solo administradores).
- CRUD completo de **Libros** (lectura para todos los roles, escritura solo administradores).

**Sprint 2:**
- CRUD completo de **Categorías** y **Autores**.
- Módulo de **Préstamos**: crear préstamo (con validación de stock, usuario activo, y duplicados), marcar devolución, y cálculo automático de estado "atrasado".
- Dashboard actualizado con indicadores de préstamos activos y atrasados.

**En ambos sprints:** validación en los tres niveles: frontend (React), backend (Flask + marshmallow) y base de datos (constraints de MySQL).

## Arquitectura

```
Frontend (React + Vite)  →  Backend (Flask, API REST)  →  MySQL
```

Ver diagrama de capas y justificación en la conversación / documento de arquitectura del equipo.

## Requisitos previos

- Python 3.10 o superior
- Node.js 18 o superior
- MySQL 8.0 o superior (los `CHECK` constraints requieren 8.0.16+)

## 1. Base de datos

1. Entra a la consola de MySQL como root:

   ```bash
   mysql -u root -p
   ```

2. Crea la base de datos y el usuario de la aplicación (ajusta la contraseña si lo deseas):

   ```sql
   CREATE DATABASE biblioteca_db CHARACTER SET utf8mb4;
   CREATE USER 'biblioteca_user'@'localhost' IDENTIFIED BY 'biblioteca_pass';
   GRANT ALL PRIVILEGES ON biblioteca_db.* TO 'biblioteca_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

3. Ejecuta el script de creación de tablas:

   ```bash
   mysql -u biblioteca_user -p biblioteca_db < backend/init_db.sql
   ```

   Te pedirá la contraseña (`biblioteca_pass`). Si no ves errores, ya quedaron creadas las 8 tablas.

   **Nota:** si tu versión de MySQL es anterior a 8.0.16, los `CHECK` se crean pero MySQL los ignora silenciosamente (no darán error, pero tampoco validarán). En ese caso, confía en las validaciones de backend (marshmallow) como red de seguridad — ya están implementadas — y considera actualizar MySQL antes de la sustentación para poder demostrar la restricción a nivel de base de datos en vivo.

## 2. Backend (Flask)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # En Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edita .env si tu base de datos tiene otro usuario/contraseña/host

python seed_admin.py            # Crea el usuario administrador inicial
python run.py                   # Levanta el backend en http://localhost:5000
```

Credenciales del administrador inicial (cámbialas después de tu primer login):

- Correo: `admin@biblioteca.edu.hn`
- Contraseña: `Admin123*`

## 3. Frontend (React)

```bash
cd frontend
cp .env.example .env             # Verifica que VITE_API_URL apunte al backend
npm install
npm run dev                      # Levanta el frontend en http://localhost:5173
```

Abre `http://localhost:5173` en el navegador e inicia sesión con las credenciales del administrador.

## Estructura del proyecto

```
biblioteca-sprint1/
├── backend/
│   ├── app/
│   │   ├── routes/        # auth, usuarios, libros, catalogos
│   │   ├── utils/         # errores centralizados, seguridad (bcrypt)
│   │   ├── models.py      # las 8 tablas del dominio
│   │   ├── schemas.py     # validaciones de backend (marshmallow)
│   │   └── config.py
│   ├── init_db.sql        # script de creación de la base de datos
│   ├── seed_admin.py       # crea el usuario administrador inicial
│   └── run.py
├── frontend/
│   └── src/
│       ├── components/    # Login, Dashboard, Usuarios, Libros
│       ├── context/       # AuthContext (sesión JWT)
│       └── api.js         # cliente HTTP centralizado
└── docs/
    └── tabla_validaciones_sprint1.md
```

## Próximos sprints (no incluidos aún)

- Tercer parcial: Reservas, Multas, roles y permisos avanzados, reportes.
