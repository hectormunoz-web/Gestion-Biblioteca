from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt

from app.extensions import db
from app.models import Autor
from app.schemas import AutorSchema
from app.utils.security import requiere_admin
from app.utils.errors import ErrorNegocio

autores_bp = Blueprint("autores", __name__, url_prefix="/api/autores")


@autores_bp.get("")
@jwt_required()
def listar_autores():
    autores = Autor.query.order_by(Autor.nombre).all()
    return jsonify([a.to_dict() for a in autores]), 200


@autores_bp.post("")
@jwt_required()
def crear_autor():
    requiere_admin(get_jwt())
    datos = AutorSchema().load(request.get_json(force=True) or {})

    autor = Autor(nombre=datos["nombre"].strip(), nacionalidad=datos.get("nacionalidad"))
    db.session.add(autor)
    db.session.commit()
    return jsonify(autor.to_dict()), 201


@autores_bp.put("/<int:autor_id>")
@jwt_required()
def actualizar_autor(autor_id):
    requiere_admin(get_jwt())
    autor = Autor.query.get(autor_id)
    if not autor:
        raise ErrorNegocio("Autor no encontrado.", status_code=404)

    datos = AutorSchema().load(request.get_json(force=True) or {})
    autor.nombre = datos["nombre"].strip()
    autor.nacionalidad = datos.get("nacionalidad")
    db.session.commit()
    return jsonify(autor.to_dict()), 200


@autores_bp.delete("/<int:autor_id>")
@jwt_required()
def eliminar_autor(autor_id):
    requiere_admin(get_jwt())
    autor = Autor.query.get(autor_id)
    if not autor:
        raise ErrorNegocio("Autor no encontrado.", status_code=404)

    if autor.libros:
        raise ErrorNegocio(
            "No se puede eliminar: hay libros asociados a este autor.",
            status_code=409,
        )

    db.session.delete(autor)
    db.session.commit()
    return jsonify({"mensaje": "Autor eliminado correctamente."}), 200
