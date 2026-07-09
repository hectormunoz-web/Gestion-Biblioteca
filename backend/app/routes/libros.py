from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt

from app.extensions import db
from app.models import Libro, Autor
from app.schemas import LibroSchema, validar_isbn_unico
from app.utils.security import requiere_admin
from app.utils.errors import ErrorNegocio

libros_bp = Blueprint("libros", __name__, url_prefix="/api/libros")


@libros_bp.get("")
@jwt_required()
def listar_libros():
    libros = Libro.query.order_by(Libro.titulo).all()
    return jsonify([l.to_dict() for l in libros]), 200


@libros_bp.get("/<int:libro_id>")
@jwt_required()
def obtener_libro(libro_id):
    libro = Libro.query.get(libro_id)
    if not libro:
        raise ErrorNegocio("Libro no encontrado.", status_code=404)
    return jsonify(libro.to_dict()), 200


@libros_bp.post("")
@jwt_required()
def crear_libro():
    requiere_admin(get_jwt())
    datos = LibroSchema().load(request.get_json(force=True) or {})

    isbn_limpio = datos["isbn"].replace("-", "").replace(" ", "")
    if not validar_isbn_unico(isbn_limpio):
        raise ErrorNegocio("Ya existe un libro registrado con este ISBN.", status_code=409)

    libro = Libro(
        titulo=datos["titulo"].strip(),
        isbn=isbn_limpio,
        categoria_id=datos["categoria_id"],
        editorial=datos.get("editorial"),
        anio_publicacion=datos.get("anio_publicacion"),
        stock=datos["stock"],
    )
    libro.autores = Autor.query.filter(Autor.id.in_(datos["autor_ids"])).all()

    db.session.add(libro)
    db.session.commit()
    return jsonify(libro.to_dict()), 201


@libros_bp.put("/<int:libro_id>")
@jwt_required()
def actualizar_libro(libro_id):
    requiere_admin(get_jwt())
    libro = Libro.query.get(libro_id)
    if not libro:
        raise ErrorNegocio("Libro no encontrado.", status_code=404)

    datos = LibroSchema().load(request.get_json(force=True) or {})

    isbn_limpio = datos["isbn"].replace("-", "").replace(" ", "")
    if not validar_isbn_unico(isbn_limpio, libro_id_excluir=libro_id):
        raise ErrorNegocio("Ya existe otro libro registrado con este ISBN.", status_code=409)

    libro.titulo = datos["titulo"].strip()
    libro.isbn = isbn_limpio
    libro.categoria_id = datos["categoria_id"]
    libro.editorial = datos.get("editorial")
    libro.anio_publicacion = datos.get("anio_publicacion")
    libro.stock = datos["stock"]
    libro.autores = Autor.query.filter(Autor.id.in_(datos["autor_ids"])).all()

    db.session.commit()
    return jsonify(libro.to_dict()), 200


@libros_bp.delete("/<int:libro_id>")
@jwt_required()
def eliminar_libro(libro_id):
    requiere_admin(get_jwt())
    libro = Libro.query.get(libro_id)
    if not libro:
        raise ErrorNegocio("Libro no encontrado.", status_code=404)

    if libro.prestamos or libro.reservas:
        raise ErrorNegocio(
            "No se puede eliminar: el libro tiene préstamos o reservas asociadas.",
            status_code=409,
        )

    db.session.delete(libro)
    db.session.commit()
    return jsonify({"mensaje": "Libro eliminado correctamente."}), 200
