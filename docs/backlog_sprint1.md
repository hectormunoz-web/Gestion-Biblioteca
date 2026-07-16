# Backlog — Sprint 1 (Segundo Parcial)
Sistema de Gestión de Biblioteca · Universidad José Cecilio del Valle

**Fecha de presentación del backlog:** [completar antes de iniciar el sprint]
**Duración del sprint:** [completar, ej. 2 semanas]
**Meta del sprint:** Tener la base de datos completa (8 tablas), autenticación funcional, y el CRUD de Usuarios y Libros operando de punta a punta con validación en los tres niveles.

---

## Historias de usuario

### HU-01 · Modelado de base de datos
**Como** equipo de desarrollo
**Quiero** tener las 8 tablas del dominio creadas con sus relaciones y restricciones
**Para** que el resto del sistema tenga una base de datos sólida y normalizada sobre la cual construir

**Criterios de aceptación:**
- [ ] Existen las 8 tablas: usuarios, categorías, autores, libros, libro_autor, préstamos, reservas, multas
- [ ] Existe al menos una relación 1:N (categorías→libros) y una N:M (libros↔autores vía libro_autor)
- [ ] Cada tabla tiene llave primaria, y las llaves foráneas tienen integridad referencial
- [ ] Los campos críticos tienen restricciones NOT NULL, UNIQUE o CHECK (ej. stock ≥ 0, email único)
- [ ] El modelo está normalizado hasta 3FN y el equipo puede justificarlo

**Responsable:** _____________
**Estado:** ☐ Pendiente ☐ En progreso ☐ Completado

---

### HU-02 · Registro e inicio de sesión
**Como** usuario del sistema
**Quiero** poder iniciar sesión con mi correo y contraseña
**Para** acceder a las funciones según mi rol (administrador o miembro)

**Criterios de aceptación:**
- [ ] El formulario de login valida formato de correo y campo de contraseña requerido antes de enviar
- [ ] El backend revalida el formato y verifica las credenciales contra la base de datos
- [ ] Las contraseñas se almacenan como hash (bcrypt), nunca en texto plano
- [ ] Si las credenciales son incorrectas, se muestra un mensaje claro (no un error técnico)
- [ ] Si el usuario está inactivo, se le informa que su cuenta está desactivada
- [ ] Al iniciar sesión correctamente, el usuario es dirigido al Dashboard

**Responsable:** _____________
**Estado:** ☐ Pendiente ☐ En progreso ☐ Completado

---

### HU-03 · Gestión de usuarios (CRUD)
**Como** administrador
**Quiero** crear, ver, editar y eliminar usuarios del sistema
**Para** mantener actualizado el registro de miembros y administradores de la biblioteca

**Criterios de aceptación:**
- [ ] Solo un administrador puede acceder a esta pantalla (un miembro regular no puede)
- [ ] El formulario valida en el cliente: nombre (2-120 caracteres), correo (formato válido), contraseña (mínimo 8 caracteres)
- [ ] El backend revalida todo lo anterior y además verifica que el correo no esté duplicado
- [ ] No se puede eliminar un usuario que tiene préstamos asociados (mensaje claro explicando por qué)
- [ ] No se puede eliminar la propia cuenta mientras se está conectado
- [ ] Antes de eliminar, se pide confirmación explícita
- [ ] La lista de usuarios muestra datos reales del backend, no datos de ejemplo

**Responsable:** _____________
**Estado:** ☐ Pendiente ☐ En progreso ☐ Completado

---

### HU-04 · Gestión de libros (CRUD)
**Como** administrador
**Quiero** crear, ver, editar y eliminar libros del catálogo
**Para** mantener actualizado el inventario de la biblioteca

**Criterios de aceptación:**
- [ ] El formulario valida en el cliente: título requerido, ISBN (10 o 13 dígitos), categoría seleccionada, al menos un autor, stock ≥ 0
- [ ] El backend revalida todo lo anterior y verifica que el ISBN no esté duplicado
- [ ] Se puede asociar un libro a varios autores (relación N:M)
- [ ] No se puede eliminar un libro con préstamos o reservas asociadas
- [ ] Antes de eliminar, se pide confirmación explícita
- [ ] Cualquier usuario autenticado (admin o miembro) puede ver el listado; solo el admin puede crear/editar/eliminar

**Responsable:** _____________
**Estado:** ☐ Pendiente ☐ En progreso ☐ Completado

---

### HU-05 · Dashboard con indicadores básicos
**Como** usuario autenticado
**Quiero** ver un resumen general al entrar al sistema
**Para** tener una vista rápida del estado de la biblioteca

**Criterios de aceptación:**
- [ ] Muestra el total de libros registrados (dato real, no de ejemplo)
- [ ] Muestra la cantidad de libros sin existencias (stock = 0)
- [ ] Se actualiza automáticamente al consultar el backend, no está hardcodeado

**Responsable:** _____________
**Estado:** ☐ Pendiente ☐ En progreso ☐ Completado

---

## Tablero Scrum (columnas sugeridas para Trello / GitHub Projects)

| Por hacer | En progreso | En revisión | Completado |
|---|---|---|---|
| HU-01 | | | |
| HU-02 | | | |
| HU-03 | | | |
| HU-04 | | | |
| HU-05 | | | |

**Instrucciones:** creen un tablero en Trello, GitHub Projects, o Jira con estas 4 columnas y una tarjeta por historia de usuario (pueden subdividir cada HU en tareas más pequeñas dentro de la misma tarjeta: "diseño de tabla", "endpoint backend", "validación frontend", etc.). Tomen una captura de pantalla del tablero al cierre del sprint como evidencia.

## Reparto sugerido del equipo

| Integrante | Historias asignadas |
|---|---|
| _____________ | HU-02 (auth) + HU-03 (usuarios) |
| _____________ | HU-04 (libros) |
| _____________ | HU-01 (base de datos) + apoyo en HU-04 |
| _____________ | HU-05 (dashboard) + documentación (README, tabla de validaciones) |

## Retrospectiva del sprint (completar al cierre)

**¿Qué salió bien?**
_____________________________________________

**¿Qué se puede mejorar para el próximo sprint?**
_____________________________________________

**¿Qué compromisos no se cumplieron y por qué?**
_____________________________________________
