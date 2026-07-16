from datetime import date
from marshmallow import Schema, fields, validate, validates, validates_schema, ValidationError

from app.models import Usuario, Libro, Categoria, Autor


# ---------------------------------------------------------------------------
# USUARIOS
# ---------------------------------------------------------------------------
class UsuarioCreateSchema(Schema):
    nombre = fields.Str(required=True, validate=validate.Length(min=2, max=120))
    email = fields.Email(required=True, validate=validate.Length(max=150))
    password = fields.Str(required=True, load_only=True, validate=validate.Length(min=8, max=72))
    rol = fields.Str(required=False, validate=validate.OneOf(["admin", "miembro"]))

    @validates("email")
    def validar_email_unico(self, value, **kwargs):
        if Usuario.query.filter_by(email=value.lower()).first():
            raise ValidationError("Ya existe un usuario registrado con este correo.")


class UsuarioUpdateSchema(Schema):
    # En edición el email también debe seguir siendo único (se revisa en la ruta,
    # porque necesitamos excluir al propio registro que se está editando).
    nombre = fields.Str(required=True, validate=validate.Length(min=2, max=120))
    email = fields.Email(required=True, validate=validate.Length(max=150))
    rol = fields.Str(required=True, validate=validate.OneOf(["admin", "miembro"]))
    activo = fields.Bool(required=True)
    password = fields.Str(required=False, load_only=True, validate=validate.Length(min=8, max=72))


class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)


# ---------------------------------------------------------------------------
# LIBROS
# ---------------------------------------------------------------------------
ANIO_ACTUAL = date.today().year


class LibroSchema(Schema):
    titulo = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    isbn = fields.Str(required=True, validate=validate.Length(min=10, max=20))
    categoria_id = fields.Int(required=True)
    editorial = fields.Str(required=False, allow_none=True, validate=validate.Length(max=120))
    anio_publicacion = fields.Int(
        required=False,
        allow_none=True,
        validate=validate.Range(min=1400, max=ANIO_ACTUAL + 1),
    )
    stock = fields.Int(required=True, validate=validate.Range(min=0))
    autor_ids = fields.List(fields.Int(), required=True, validate=validate.Length(min=1))

    @validates("categoria_id")
    def validar_categoria_existe(self, value, **kwargs):
        if not Categoria.query.get(value):
            raise ValidationError("La categoría seleccionada no existe.")

    @validates("autor_ids")
    def validar_autores_existen(self, value, **kwargs):
        encontrados = Autor.query.filter(Autor.id.in_(value)).count()
        if encontrados != len(set(value)):
            raise ValidationError("Uno o más autores seleccionados no existen.")

    @validates("isbn")
    def validar_isbn_formato(self, value, **kwargs):
        limpio = value.replace("-", "").replace(" ", "")
        if not limpio.isdigit() or len(limpio) not in (10, 13):
            raise ValidationError("El ISBN debe tener 10 o 13 dígitos (guiones opcionales).")


def validar_isbn_unico(isbn, libro_id_excluir=None):
    """Regla de negocio: no permitir ISBN duplicado (se llama desde la ruta,
    porque en edición hay que excluir el propio registro)."""
    query = Libro.query.filter_by(isbn=isbn)
    if libro_id_excluir:
        query = query.filter(Libro.id != libro_id_excluir)
    return query.first() is None


# ---------------------------------------------------------------------------
# CATEGORIAS
# ---------------------------------------------------------------------------
class CategoriaSchema(Schema):
    nombre = fields.Str(required=True, validate=validate.Length(min=2, max=80))

    @validates("nombre")
    def validar_nombre_unico(self, value, **kwargs):
        if Categoria.query.filter_by(nombre=value.strip()).first():
            raise ValidationError("Ya existe una categoría con este nombre.")


# ---------------------------------------------------------------------------
# AUTORES
# ---------------------------------------------------------------------------
class AutorSchema(Schema):
    nombre = fields.Str(required=True, validate=validate.Length(min=2, max=150))
    nacionalidad = fields.Str(required=False, allow_none=True, validate=validate.Length(max=80))


# ---------------------------------------------------------------------------
# PRESTAMOS
# ---------------------------------------------------------------------------
class PrestamoCreateSchema(Schema):
    usuario_id = fields.Int(required=True)
    libro_id = fields.Int(required=True)
