# Guion de demostración — Casos límite (Sprint 1)

Este guion cubre los 4 casos límite que la rúbrica pide demostrar en vivo:
campos vacíos, tipos de dato incorrectos, valores fuera de rango, e intentos
de duplicar un registro único. Cada caso se muestra en 2 niveles: frontend
(lo que ve el usuario) y backend/base de datos (lo que pasa "por debajo").

**Antes de empezar:** ten el backend corriendo (`python run.py`), el frontend
corriendo (`npm run dev`), y una pestaña de Postman/Insomnia abierta para
la parte de "saltarse el frontend".

---

## Caso 1 — Campos vacíos

### Nivel frontend
1. Ve a **Usuarios → Nuevo usuario**.
2. Deja todos los campos vacíos y da clic en **Guardar**.
3. **Mostrar:** aparecen mensajes en rojo junto a cada campo ("El nombre es
   obligatorio", "El correo es obligatorio", etc.) y la petición **nunca llega
   al backend** — es la primera línea de defensa.

### Nivel backend (saltándose el frontend)
1. Abre Postman/Insomnia.
2. Necesitas un token: primero haz `POST http://localhost:5000/api/auth/login`
   con el body:
   ```json
   { "email": "admin@biblioteca.edu.hn", "password": "Admin123*" }
   ```
   Copia el `access_token` de la respuesta.
3. Haz `POST http://localhost:5000/api/usuarios` con el header
   `Authorization: Bearer TU_TOKEN` y body vacío: `{}`
4. **Mostrar:** el backend responde `400` con un JSON detallando qué campos
   faltan — nunca confía en que el frontend ya validó.

---

## Caso 2 — Tipos de dato incorrectos

### Nivel frontend
1. Ve a **Libros → Nuevo libro**.
2. En el campo **Stock**, intenta escribir letras ("abc").
3. **Mostrar:** el input es `type="number"`, así que el navegador no deja
   escribir texto ahí — bloqueo inmediato a nivel de interfaz.

### Nivel backend
1. En Postman, `POST http://localhost:5000/api/libros` (con tu token) con:
   ```json
   {
     "titulo": "Libro de prueba",
     "isbn": "1234567890",
     "categoria_id": 1,
     "stock": "no-es-un-numero",
     "autor_ids": [1]
   }
   ```
2. **Mostrar:** el backend responde `400`, rechazando el tipo de dato antes
   de tocar la base de datos.

---

## Caso 3 — Valores fuera de rango

### Nivel frontend
1. En el formulario de **Nuevo libro**, pon **Stock = -5**.
2. Da clic en Guardar.
3. **Mostrar:** mensaje "El stock debe ser un número entero mayor o igual a 0."

### Nivel backend + base de datos
1. En Postman, envía el mismo payload con `"stock": -5` directo a la API.
2. **Mostrar:** el backend responde `400` (marshmallow rechaza `Range(min=0)`).
3. **Para demostrar la base de datos como última línea de defensa:** abre
   MySQL Workbench y corre directamente:
   ```sql
   INSERT INTO libros (titulo, isbn, categoria_id, stock)
   VALUES ('Prueba directa', '0000000000', 1, -10);
   ```
4. **Mostrar:** MySQL rechaza el INSERT con un error de `CHECK constraint
   'chk_libros_stock_no_negativo'` — incluso si alguien se salta el backend
   por completo, la base de datos no permite el dato inválido.

---

## Caso 4 — Intento de duplicar un registro único

### Nivel frontend
1. Ve a **Usuarios → Nuevo usuario**.
2. Usa el correo que ya existe: `admin@biblioteca.edu.hn`.
3. Llena el resto de campos válidos y da clic en Guardar.
4. **Mostrar:** el backend responde y el frontend muestra "Ya existe un
   usuario registrado con este correo."

### Nivel base de datos
1. En MySQL Workbench, corre:
   ```sql
   INSERT INTO usuarios (nombre, email, password_hash, rol)
   VALUES ('Otro Admin', 'admin@biblioteca.edu.hn', 'hash-falso', 'admin');
   ```
2. **Mostrar:** MySQL rechaza el INSERT con `Duplicate entry
   'admin@biblioteca.edu.hn' for key 'email'` — la restricción `UNIQUE` actúa
   como última línea de defensa, igual que en el backend.

---

## Guion de presentación oral (resumen para decir en voz alta)

> "Nuestro sistema valida en tres niveles independientes: el frontend evita
> que se envíen datos inválidos desde la interfaz, el backend nunca confía
> en esa validación y la repite completa antes de tocar la base de datos, y
> la base de datos tiene sus propias restricciones como última línea de
> defensa — así que incluso si alguien se salta el frontend y el backend por
> completo, como acabamos de mostrar con una consulta SQL directa, el dato
> inválido sigue sin poder guardarse."

## Checklist final antes de la demo

- [ ] Backend corriendo (`python run.py`)
- [ ] Frontend corriendo (`npm run dev`)
- [ ] MySQL Workbench abierto y conectado a `biblioteca_db`
- [ ] Postman/Insomnia con el login ya probado y el token a la mano
- [ ] Al menos un usuario y un libro de prueba ya cargados (para editar/eliminar en vivo)
