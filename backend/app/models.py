from datetime import datetime, date
from app.extensions import db


class Usuario(db.Model):
    __tablename__ = "usuarios"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(150), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    rol = db.Column(db.String(20), nullable=False, default="miembro")
    activo = db.Column(db.Boolean, nullable=False, default=True)
    fecha_registro = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    prestamos = db.relationship("Prestamo", backref="usuario", lazy=True)
    reservas = db.relationship("Reserva", backref="usuario", lazy=True)

    __table_args__ = (
        db.CheckConstraint("rol IN ('admin', 'miembro')", name="chk_usuarios_rol"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "email": self.email,
            "rol": self.rol,
            "activo": self.activo,
            "fecha_registro": self.fecha_registro.isoformat() if self.fecha_registro else None,
        }


class Categoria(db.Model):
    __tablename__ = "categorias"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(80), nullable=False, unique=True)

    libros = db.relationship("Libro", backref="categoria", lazy=True)

    def to_dict(self):
        return {"id": self.id, "nombre": self.nombre}


class Autor(db.Model):
    __tablename__ = "autores"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(150), nullable=False)
    nacionalidad = db.Column(db.String(80))

    def to_dict(self):
        return {"id": self.id, "nombre": self.nombre, "nacionalidad": self.nacionalidad}


# Tabla intermedia N:M entre libros y autores
libro_autor = db.Table(
    "libro_autor",
    db.Column("libro_id", db.Integer, db.ForeignKey("libros.id"), primary_key=True),
    db.Column("autor_id", db.Integer, db.ForeignKey("autores.id"), primary_key=True),
)


class Libro(db.Model):
    __tablename__ = "libros"

    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    isbn = db.Column(db.String(20), nullable=False, unique=True)
    categoria_id = db.Column(db.Integer, db.ForeignKey("categorias.id"), nullable=False)
    editorial = db.Column(db.String(120))
    anio_publicacion = db.Column(db.Integer)
    stock = db.Column(db.Integer, nullable=False, default=0)
    creado_en = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    autores = db.relationship("Autor", secondary=libro_autor, backref="libros", lazy=True)
    prestamos = db.relationship("Prestamo", backref="libro", lazy=True)
    reservas = db.relationship("Reserva", backref="libro", lazy=True)

    __table_args__ = (
        db.CheckConstraint("stock >= 0", name="chk_libros_stock_no_negativo"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "titulo": self.titulo,
            "isbn": self.isbn,
            "categoria_id": self.categoria_id,
            "categoria": self.categoria.nombre if self.categoria else None,
            "editorial": self.editorial,
            "anio_publicacion": self.anio_publicacion,
            "stock": self.stock,
            "autores": [a.to_dict() for a in self.autores],
        }


class Prestamo(db.Model):
    __tablename__ = "prestamos"

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)
    libro_id = db.Column(db.Integer, db.ForeignKey("libros.id"), nullable=False)
    fecha_prestamo = db.Column(db.Date, nullable=False, default=date.today)
    fecha_devolucion_esperada = db.Column(db.Date, nullable=False)
    fecha_devolucion_real = db.Column(db.Date)
    estado = db.Column(db.String(20), nullable=False, default="activo")

    __table_args__ = (
        db.CheckConstraint("estado IN ('activo', 'devuelto', 'atrasado')", name="chk_prestamos_estado"),
        db.CheckConstraint(
            "fecha_devolucion_esperada > fecha_prestamo", name="chk_prestamos_fecha_esperada_posterior"
        ),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "usuario_id": self.usuario_id,
            "libro_id": self.libro_id,
            "fecha_prestamo": self.fecha_prestamo.isoformat(),
            "fecha_devolucion_esperada": self.fecha_devolucion_esperada.isoformat(),
            "fecha_devolucion_real": self.fecha_devolucion_real.isoformat()
            if self.fecha_devolucion_real
            else None,
            "estado": self.estado,
        }


class Reserva(db.Model):
    __tablename__ = "reservas"

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)
    libro_id = db.Column(db.Integer, db.ForeignKey("libros.id"), nullable=False)
    fecha_reserva = db.Column(db.Date, nullable=False, default=date.today)
    estado = db.Column(db.String(20), nullable=False, default="pendiente")

    __table_args__ = (
        db.CheckConstraint("estado IN ('pendiente', 'atendida', 'cancelada')", name="chk_reservas_estado"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "usuario_id": self.usuario_id,
            "libro_id": self.libro_id,
            "fecha_reserva": self.fecha_reserva.isoformat(),
            "estado": self.estado,
        }


class Multa(db.Model):
    __tablename__ = "multas"

    id = db.Column(db.Integer, primary_key=True)
    prestamo_id = db.Column(db.Integer, db.ForeignKey("prestamos.id"), nullable=False)
    monto = db.Column(db.Numeric(10, 2), nullable=False)
    pagado = db.Column(db.Boolean, nullable=False, default=False)
    fecha_generada = db.Column(db.Date, nullable=False, default=date.today)

    __table_args__ = (
        db.CheckConstraint("monto >= 0", name="chk_multas_monto_no_negativo"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "prestamo_id": self.prestamo_id,
            "monto": float(self.monto),
            "pagado": self.pagado,
            "fecha_generada": self.fecha_generada.isoformat(),
        }
