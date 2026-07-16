# Tabla de validaciones — Sprint 1

Sistema de Gestión de Biblioteca · Segundo parcial · Sprint 1

## Pantalla: Login

| Campo | Frontend | Backend | Base de datos |
|---|---|---|---|
| Correo | Requerido, formato de correo válido | Requerido, formato de correo (marshmallow `Email`), se compara contra usuario existente | — |
| Contraseña | Requerido | Se verifica contra el hash con bcrypt; nunca se compara en texto plano | `password_hash` `NOT NULL` |

Regla de negocio: si el usuario existe pero está `activo = false`, se rechaza el login con mensaje específico.

## Pantalla: Usuarios (listado, crear, editar)

| Campo | Frontend | Backend | Base de datos |
|---|---|---|---|
| Nombre | Requerido, 2–120 caracteres | Requerido, `Length(min=2, max=120)` | `NOT NULL`, `VARCHAR(120)` |
| Correo | Requerido, formato válido (regex) | Requerido, `Email`, valida duplicado antes de insertar/actualizar | `UNIQUE`, `NOT NULL`, `CHECK` de formato con regex |
| Contraseña | Requerida al crear (mín. 8), opcional al editar | `Length(min=8, max=72)`, se hashea con bcrypt antes de guardar | Solo se almacena el hash, nunca texto plano |
| Rol | Selección cerrada (select con 2 opciones) | `OneOf(["admin", "miembro"])` | `CHECK (rol IN ('admin','miembro'))` |
| Estado (activo) | Selección cerrada al editar | Booleano validado por schema | `NOT NULL DEFAULT TRUE` |

Reglas de negocio adicionales:
- No se permite eliminar el propio usuario mientras está la sesión activa.
- No se permite eliminar un usuario con préstamos asociados (se sugiere desactivar).
- No se puede quitar el rol de administrador si es el único admin activo del sistema.

## Pantalla: Libros (listado, crear, editar)

| Campo | Frontend | Backend | Base de datos |
|---|---|---|---|
| Título | Requerido | Requerido, `Length(min=1, max=200)` | `NOT NULL`, `VARCHAR(200)` |
| ISBN | Requerido, 10 o 13 dígitos (guiones permitidos) | Se limpia el valor, se revalida formato y se verifica duplicado antes de insertar/actualizar | `UNIQUE`, `NOT NULL` |
| Categoría | Requerido, selección de lista cargada del backend | Requerido, se valida que la categoría exista en base de datos | `FK` a `categorias(id)`, `NOT NULL` |
| Autores | Requerido, al menos 1 casilla marcada | Requerido, lista no vacía, se valida que todos los autores existan | Tabla intermedia `libro_autor` con `FK` a ambos lados |
| Editorial | Opcional | Opcional, `Length(max=120)` | `VARCHAR(120)`, permite `NULL` |
| Año de publicación | Opcional, rango 1400–(año actual + 1) | Opcional, `Range(min=1400, max=año actual+1)` | `CHECK` de rango |
| Stock | Requerido, entero ≥ 0 | Requerido, `Range(min=0)` | `CHECK (stock >= 0)` |

## Casos límite demostrables en vivo

1. **Campos vacíos**: enviar el formulario de Usuario o Libro sin llenar campos requeridos → el frontend bloquea el envío y muestra el mensaje junto al campo; si se fuerza la petición directa al backend, este responde 400 con detalle por campo.
2. **Tipos de dato incorrectos**: enviar texto en el campo `stock` o `anio_publicacion` → rechazado por el input `type="number"` en frontend y por marshmallow en backend (`DataError`/`ValidationError` capturado centralizadamente).
3. **Valores fuera de rango**: `stock` negativo, año fuera de 1400–(actual+1) → bloqueado en cliente y servidor.
4. **Registro duplicado**: correo de usuario repetido o ISBN repetido → bloqueado antes de enviar si se detecta (validación asíncrona opcional) y siempre bloqueado en backend con mensaje "Ya existe..." (409), respaldado por la restricción `UNIQUE` de MySQL como última línea de defensa.
5. **Eliminación de un usuario con historial**: se rechaza con mensaje de negocio explicando por qué (no un error técnico crudo).

---

# Sprint 2 — Validaciones adicionales

## Pantalla: Categorías

| Campo | Frontend | Backend | Base de datos |
|---|---|---|---|
| Nombre | Requerido, 2–80 caracteres | Requerido, `Length(min=2, max=80)`, valida duplicado antes de insertar/actualizar | `UNIQUE`, `NOT NULL` |

Regla de negocio: no se puede eliminar una categoría con libros asociados (se valida en backend antes del `DELETE`).

## Pantalla: Autores

| Campo | Frontend | Backend | Base de datos |
|---|---|---|---|
| Nombre | Requerido, 2–150 caracteres | Requerido, `Length(min=2, max=150)` | `NOT NULL` |
| Nacionalidad | Opcional | Opcional, `Length(max=80)` | Permite `NULL` |

Regla de negocio: no se puede eliminar un autor con libros asociados.

## Pantalla: Préstamos

| Campo | Frontend | Backend | Base de datos |
|---|---|---|---|
| Usuario | Requerido, selección de lista (solo usuarios activos) | Requerido, se valida que exista y que esté activo | `FK` a `usuarios(id)`, `NOT NULL` |
| Libro | Requerido, selección de lista (solo libros con stock > 0) | Requerido, se valida que exista y que tenga stock disponible | `FK` a `libros(id)`, `NOT NULL` |
| Fecha de devolución esperada | No editable (se calcula automáticamente) | Se calcula en backend: fecha de hoy + 15 días | `CHECK (fecha_devolucion_esperada > fecha_prestamo)` |

Reglas de negocio adicionales:
- No se permite un préstamo si el libro no tiene existencias (`stock <= 0`).
- No se permite que el mismo usuario tenga dos préstamos activos/atrasados del mismo libro al mismo tiempo (evita duplicados lógicos).
- No se permite prestar a un usuario inactivo.
- Al crear el préstamo, el stock del libro disminuye en 1; al devolver, aumenta en 1 (mantenido de forma consistente en la misma transacción).
- No se puede marcar como devuelto un préstamo que ya fue devuelto.
- El estado "atrasado" se recalcula automáticamente al consultar la lista, comparando la fecha esperada contra la fecha actual — no requiere intervención manual.

## Casos límite adicionales — Sprint 2

6. **Préstamo sin existencias**: intentar prestar un libro con `stock = 0` → el formulario no lo ofrece en la lista desplegable (frontend), y si se fuerza vía API, el backend responde 409.
7. **Préstamo duplicado**: intentar prestar el mismo libro al mismo usuario dos veces mientras el primero sigue activo → el backend lo rechaza con mensaje explícito.
8. **Doble devolución**: intentar marcar como devuelto un préstamo que ya fue devuelto → el backend lo rechaza con 409 en vez de duplicar el efecto sobre el stock.
