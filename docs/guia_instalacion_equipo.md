# Guía de instalación para el equipo — Sprint 1

Sigue estos pasos EN ORDEN. No te saltes ninguno, incluso si crees que ya
tienes algo instalado — confírmalo con los comandos de verificación.

---

## Paso 0 — Instalar los programas necesarios

Instala estos 5 programas, en este orden. Si ya tienes alguno, solo
verifica la versión con el comando indicado.

| # | Programa | Descarga | Verificar con |
|---|---|---|---|
| 1 | **Python 3.10+** | [python.org/downloads](https://www.python.org/downloads/) | `python --version` |
| 2 | **Node.js 18+** | [nodejs.org](https://nodejs.org/) (versión LTS) | `node --version` y `npm --version` |
| 3 | **MySQL 8.0+** | [dev.mysql.com/downloads/installer](https://dev.mysql.com/downloads/installer/) (elige "Developer Default") | `mysql --version` |
| 4 | **Git** | [git-scm.com/download/win](https://git-scm.com/download/win) | `git --version` |
| 5 | **VS Code** (opcional pero recomendado) | [code.visualstudio.com](https://code.visualstudio.com/) | — |

**Importante al instalar Python:** marca la casilla **"Add python.exe to PATH"**
en la primera pantalla del instalador. Si no la ves marcada, la instalación
causa problemas después.

Después de instalar los 5, **cierra completamente** todas las ventanas de
PowerShell/VS Code que tengas abiertas y ábrelas de nuevo antes de continuar
(el PATH no se actualiza en ventanas ya abiertas).

Corre los 4 comandos de verificación de la tabla. Si los 4 responden con un
número de versión, sigue al Paso 1.

---

## Paso 1 — Configurar Git (una sola vez por computadora)

```powershell
git config --global user.name "Tu Nombre Completo"
git config --global user.email "tu-correo@ejemplo.com"
```

Esto hace que tus commits queden identificados con tu nombre — la rúbrica
del proyecto evalúa que cada integrante tenga commits propios.

---

## Paso 2 — Clonar el repositorio

Elige una carpeta en tu computadora donde quieras tener el proyecto (por
ejemplo `Documentos\Proyectos`) y abre una terminal ahí. Luego:

```powershell
git clone [PEGAR AQUÍ LA URL DEL REPOSITORIO DE GITHUB]
cd biblioteca-ujcv
```

(Reemplaza `biblioteca-ujcv` por el nombre real de la carpeta que se haya creado)

---

## Paso 3 — Crear tu base de datos local (cada quien la suya)

Cada integrante necesita **su propia base de datos en su propia máquina** —
no comparten una sola base de datos entre todos en esta etapa.

1. Abre **MySQL Workbench** (o la consola `mysql -u root -p`).
2. Ejecuta:

```sql
CREATE DATABASE biblioteca_db CHARACTER SET utf8mb4;
CREATE USER 'biblioteca_user'@'localhost' IDENTIFIED BY 'biblioteca_pass';
GRANT ALL PRIVILEGES ON biblioteca_db.* TO 'biblioteca_user'@'localhost';
FLUSH PRIVILEGES;
```

3. Carga las 8 tablas ejecutando el script `backend/init_db.sql`:
   - En Workbench: `File → Open SQL Script...` → selecciona `backend/init_db.sql` → clic en el rayo ⚡
   - O desde terminal: `mysql -u biblioteca_user -p biblioteca_db < backend/init_db.sql`

---

## Paso 4 — Levantar el backend

```powershell
cd backend
python -m venv venv
```

Activar el entorno virtual:

```powershell
venv\Scripts\Activate.ps1
```

Si te da un error de "la ejecución de scripts está deshabilitada", corre esto
una sola vez y vuelve a intentar activar:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Instalar dependencias:

```powershell
pip install -r requirements.txt
```

Copiar configuración:

```powershell
copy .env.example .env
```

Crear el usuario administrador:

```powershell
python seed_admin.py
```

Levantar el servidor:

```powershell
python run.py
```

Debe mostrar `Running on http://0.0.0.0:5000`. **Deja esta terminal abierta.**

---

## Paso 5 — Levantar el frontend

Abre una **terminal nueva** (no cierres la del backend):

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

Abre en el navegador: `http://localhost:5173`

---

## Paso 6 — Verificar que todo funciona

Inicia sesión con:
- **Correo:** `admin@biblioteca.edu.hn`
- **Contraseña:** `Admin123*`

Deberías ver el Dashboard. Prueba crear un libro desde "Libros → Nuevo libro"
para confirmar que la conexión frontend-backend-base de datos funciona.

---

## Paso 7 — Flujo de trabajo diario (para no pisarse el código entre todos)

Cada vez que vayas a trabajar en tu módulo:

```powershell
git pull origin main
git checkout -b feature/nombre-de-tu-modulo
```

Trabaja, guarda tus cambios, y al terminar:

```powershell
git add .
git commit -m "Descripción clara de lo que hiciste"
git push origin feature/nombre-de-tu-modulo
```

Luego crea un **Pull Request** en GitHub para fusionar tu rama a `main`, así
queda un historial claro de quién hizo qué (requisito de la rúbrica).

---

## Errores comunes ya resueltos (si te sale alguno de estos)

| Error | Solución |
|---|---|
| `python : no se encontró Python` | Reinstala Python marcando "Add to PATH", o desactiva el alias en "Alias de ejecución de aplicaciones" de Windows |
| `mysql : no se reconoce` | Agrega la carpeta `bin` de MySQL (ej. `C:\Program Files\MySQL\MySQL Server 8.0\bin`) a la variable de entorno PATH |
| `la ejecución de scripts está deshabilitada` | Corre `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| `cryptography package is required` | Corre `pip install cryptography` dentro del entorno virtual activado |
| `Error Code: 1046. No database selected` | Ya no debería pasar — el script `init_db.sql` ya incluye `USE biblioteca_db;` al inicio |
| `npm : no se reconoce` | Instala Node.js desde nodejs.org (versión LTS) |
