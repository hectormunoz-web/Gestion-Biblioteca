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
