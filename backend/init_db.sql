-- =========================================================
-- Sistema de Gestión de Biblioteca
-- Script de creación de base de datos (MySQL 8.0+)
-- 8 tablas del dominio, normalizadas hasta 3FN
-- =========================================================

USE biblioteca_db;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS multas;
DROP TABLE IF EXISTS reservas;
DROP TABLE IF EXISTS prestamos;
DROP TABLE IF EXISTS libro_autor;
DROP TABLE IF EXISTS libros;
DROP TABLE IF EXISTS autores;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS usuarios;

SET FOREIGN_KEY_CHECKS = 1;

-- 1) USUARIOS
CREATE TABLE usuarios (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(120) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    rol             VARCHAR(20)  NOT NULL DEFAULT 'miembro',
    activo          TINYINT(1)   NOT NULL DEFAULT 1,
    fecha_registro  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_usuarios_rol CHECK (rol IN ('admin', 'miembro')),
    CONSTRAINT chk_usuarios_email_formato
        CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2) CATEGORIAS
CREATE TABLE categorias (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    nombre  VARCHAR(80) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3) AUTORES
CREATE TABLE autores (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    nombre        VARCHAR(150) NOT NULL,
    nacionalidad  VARCHAR(80)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4) LIBROS
CREATE TABLE libros (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    titulo              VARCHAR(200) NOT NULL,
    isbn                VARCHAR(20)  NOT NULL UNIQUE,
    categoria_id        INT NOT NULL,
    editorial           VARCHAR(120),
    anio_publicacion    INT,
    stock               INT NOT NULL DEFAULT 0,
    creado_en           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_libros_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    CONSTRAINT chk_libros_stock_no_negativo CHECK (stock >= 0),
    CONSTRAINT chk_libros_anio_valido
        CHECK (anio_publicacion IS NULL
               OR (anio_publicacion >= 1400 AND anio_publicacion <= 2100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5) LIBRO_AUTOR (tabla intermedia N:M entre libros y autores)
CREATE TABLE libro_autor (
    libro_id  INT NOT NULL,
    autor_id  INT NOT NULL,
    PRIMARY KEY (libro_id, autor_id),
    CONSTRAINT fk_libro_autor_libro FOREIGN KEY (libro_id) REFERENCES libros(id) ON DELETE CASCADE,
    CONSTRAINT fk_libro_autor_autor FOREIGN KEY (autor_id) REFERENCES autores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6) PRESTAMOS (N:1 con usuarios, N:1 con libros)
CREATE TABLE prestamos (
    id                          INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id                  INT NOT NULL,
    libro_id                    INT NOT NULL,
    fecha_prestamo              DATE NOT NULL DEFAULT (CURRENT_DATE),
    fecha_devolucion_esperada   DATE NOT NULL,
    fecha_devolucion_real       DATE,
    estado                      VARCHAR(20) NOT NULL DEFAULT 'activo',
    CONSTRAINT fk_prestamos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_prestamos_libro FOREIGN KEY (libro_id) REFERENCES libros(id),
    CONSTRAINT chk_prestamos_estado CHECK (estado IN ('activo', 'devuelto', 'atrasado')),
    CONSTRAINT chk_prestamos_fecha_esperada_posterior
        CHECK (fecha_devolucion_esperada > fecha_prestamo),
    CONSTRAINT chk_prestamos_fecha_real_coherente
        CHECK (fecha_devolucion_real IS NULL OR fecha_devolucion_real >= fecha_prestamo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7) RESERVAS (N:1 con usuarios, N:1 con libros)
CREATE TABLE reservas (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id    INT NOT NULL,
    libro_id      INT NOT NULL,
    fecha_reserva DATE NOT NULL DEFAULT (CURRENT_DATE),
    estado        VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    CONSTRAINT fk_reservas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_reservas_libro FOREIGN KEY (libro_id) REFERENCES libros(id) ON DELETE CASCADE,
    CONSTRAINT chk_reservas_estado CHECK (estado IN ('pendiente', 'atendida', 'cancelada')),
    UNIQUE KEY uq_reserva_activa (usuario_id, libro_id, estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8) MULTAS (N:1 con prestamos)
CREATE TABLE multas (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    prestamo_id     INT NOT NULL,
    monto           DECIMAL(10, 2) NOT NULL,
    pagado          TINYINT(1) NOT NULL DEFAULT 0,
    fecha_generada  DATE NOT NULL DEFAULT (CURRENT_DATE),
    CONSTRAINT fk_multas_prestamo FOREIGN KEY (prestamo_id) REFERENCES prestamos(id) ON DELETE CASCADE,
    CONSTRAINT chk_multas_monto_no_negativo CHECK (monto >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Índices adicionales útiles para búsquedas frecuentes
CREATE INDEX idx_libros_titulo ON libros (titulo);
CREATE INDEX idx_prestamos_usuario ON prestamos (usuario_id);
CREATE INDEX idx_prestamos_libro ON prestamos (libro_id);

-- Datos semilla mínimos para poder probar Libros desde el Sprint 1
INSERT INTO categorias (nombre) VALUES
    ('Novela'), ('Ciencia'), ('Historia'), ('Infantil'), ('Tecnología');

INSERT INTO autores (nombre, nacionalidad) VALUES
    ('Gabriel García Márquez', 'Colombia'),
    ('Isabel Allende', 'Chile'),
    ('Ray Bradbury', 'Estados Unidos');

-- NOTA: el usuario administrador inicial NO se inserta aquí porque el hash
-- de la contraseña debe generarse con bcrypt en tiempo real.
-- Ejecutar después de este script: python backend/seed_admin.py
-- (ver instrucciones en el README).
