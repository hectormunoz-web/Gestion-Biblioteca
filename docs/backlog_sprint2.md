# Backlog — Sprint 2 (Segundo Parcial)
Sistema de Gestión de Biblioteca · Universidad José Cecilio del Valle

**Fecha de presentación del backlog:** [completar antes de iniciar el sprint]
**Meta del sprint:** CRUD completo de Categorías y Autores, módulo de Préstamos funcional de punta a punta (crear/devolver con reglas de negocio), y Dashboard con indicadores de préstamos.

---

## Historias de usuario

### HU-06 · Gestión de categorías (CRUD)
**Como** administrador
**Quiero** crear, ver, editar y eliminar categorías de libros
**Para** mantener organizado el catálogo por temática

**Criterios de aceptación:**
- [X] El nombre es requerido (2-80 caracteres) y debe ser único
- [X] El backend revalida la unicidad antes de guardar (además del `UNIQUE` en base de datos)
- [X] No se puede eliminar una categoría que tiene libros asociados
- [X] Cualquier usuario autenticado puede ver el listado; solo el admin puede crear/editar/eliminar

**Responsable:** _____________
**Estado:** ☐ Pendiente ☐ En progreso X Completado

---

### HU-07 · Gestión de autores (CRUD)
**Como** administrador
**Quiero** crear, ver, editar y eliminar autores
**Para** poder asociarlos correctamente a los libros del catálogo

**Criterios de aceptación:**
- [X] El nombre es requerido (2-150 caracteres); la nacionalidad es opcional
- [X] No se puede eliminar un autor que tiene libros asociados
- [X] Cualquier usuario autenticado puede ver el listado; solo el admin puede crear/editar/eliminar

**Responsable:** _____________
**Estado:** ☐ Pendiente ☐ En progreso x Completado

---

### HU-08 · Registrar un préstamo
**Como** administrador
**Quiero** registrar el préstamo de un libro a un usuario
**Para** llevar control de qué ejemplares están prestados y cuándo deben devolverse

**Criterios de aceptación:**
- [X] Solo se puede prestar un libro con stock disponible (stock > 0)
- [X] No se permite un préstamo a un usuario inactivo
- [X] No se permite que un mismo usuario tenga dos préstamos activos del mismo libro (duplicado lógico)
- [X] La fecha de devolución esperada se calcula automáticamente (15 días desde hoy)
- [X] Al crear el préstamo, el stock del libro disminuye en 1 automáticamente
- [X] Todas las reglas anteriores se validan en el backend, no solo en el frontend

**Responsable:** _____________
**Estado:** ☐ Pendiente ☐ En progreso X Completado

---

### HU-09 · Registrar la devolución de un préstamo
**Como** administrador
**Quiero** marcar un préstamo como devuelto
**Para** liberar el ejemplar y que vuelva a estar disponible para otros usuarios

**Criterios de aceptación:**
- [X] Al marcar como devuelto, el stock del libro aumenta en 1 automáticamente
- [X] No se puede devolver un préstamo que ya fue marcado como devuelto anteriormente
- [X] Se pide confirmación antes de registrar la devolución
- [X] La fecha de devolución real queda registrada

**Responsable:** _____________
**Estado:** ☐ Pendiente ☐ En progreso X Completado

---

### HU-10 · Estado automático de préstamos atrasados
**Como** administrador
**Quiero** que el sistema marque automáticamente los préstamos vencidos como "atrasados"
**Para** identificar rápidamente qué usuarios tienen libros pendientes de devolver fuera de plazo

**Criterios de aceptación:**
- [ ] Un préstamo activo cuya fecha esperada ya pasó se muestra como "Atrasado" sin intervención manual
- [ ] El Dashboard refleja el conteo de préstamos atrasados en tiempo real

**Responsable:** _____________
**Estado:** ☐ Pendiente ☐ En progreso ☐ Completado

---

### HU-11 · Dashboard con indicadores de préstamos
**Como** usuario autenticado
**Quiero** ver en el Dashboard cuántos préstamos están activos y atrasados
**Para** tener una vista general del estado de los préstamos sin entrar al listado completo

**Criterios de aceptación:**
- [ ] Muestra el total de préstamos activos (dato real, calculado del backend)
- [ ] Muestra el total de préstamos atrasados, resaltado visualmente si es mayor a cero

**Responsable:** _____________
**Estado:** ☐ Pendiente ☐ En progreso ☐ Completado

---

## Tablero Scrum (columnas sugeridas)

| Por hacer | En progreso | En revisión | Completado |
|---|---|---|---|
| HU-06 | | | |
| HU-07 | | | |
| HU-08 | | | |
| HU-09 | | | |
| HU-10 | | | |
| HU-11 | | | |

## Retrospectiva del sprint (completar al cierre)

**¿Qué salió bien?**
_____________________________________________

**¿Qué se puede mejorar para el próximo sprint?**
_____________________________________________

**¿Qué compromisos no se cumplieron y por qué?**
_____________________________________________
