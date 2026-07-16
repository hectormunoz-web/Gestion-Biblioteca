from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from marshmallow import Schema, fields, validate

from app.extensions import db
from app.models import Categoria
from app.schemas import CategoriaSchema
from app.utils.security import requiere_admin
from app.utils.errors import ErrorNegocio

categorias_bp = Blueprint("categorias", __name__, url_prefix="/api/categorias")


class _CategoriaNombreSchema(Schema):
    """Valida solo el formato del nombre; la unicidad se revisa aparte en la
    ruta de edición porque ahí se debe excluir el propio registro."""
    nombre = fields.Str(required=True, validate=validate.Length(min=2, max=80))


@categorias_bp.get("")
@jwt_required()
def listar_categorias():
    categorias = Categoria.query.order_by(Categoria.nombre).all()
    return jsonify([c.to_dict() for c in categorias]), 200


@categorias_bp.post("")
@jwt_required()
def crear_categoria():
    requiere_admin(get_jwt())
    datos = CategoriaSchema().load(request.get_json(force=True) or {})

    categoria = Categoria(nombre=datos["nombre"].strip())
    db.session.add(categoria)
    db.session.commit()
    return jsonify(categoria.to_dict()), 201


@categorias_bp.put("/<int:categoria_id>")
@jwt_required()
def actualizar_categoria(categoria_id):
    requiere_admin(get_jwt())
    categoria = Categoria.query.get(categoria_id)
    if not categoria:
        raise ErrorNegocio("Categoría no encontrada.", status_code=404)

    datos = _CategoriaNombreSchema().load(request.get_json(force=True) or {})
    nombre_nuevo = datos["nombre"].strip()

    conflicto = Categoria.query.filter(
        Categoria.nombre == nombre_nuevo, Categoria.id != categoria_id
    ).first()
    if conflicto:
        raise ErrorNegocio("Ya existe otra categoría con este nombre.", status_code=409)

    categoria.nombre = nombre_nuevo
    db.session.commit()
    return jsonify(categoria.to_dict()), 200


@categorias_bp.delete("/<int:categoria_id>")
@jwt_required()
def eliminar_categoria(categoria_id):
    requiere_admin(get_jwt())
    categoria = Categoria.query.get(categoria_id)
    if not categoria:
        raise ErrorNegocio("Categoría no encontrada.", status_code=404)

    if categoria.libros:
        raise ErrorNegocio(
            "No se puede eliminar: hay libros asociados a esta categoría.",
            status_code=409,
        )

    db.session.delete(categoria)
    db.session.commit()
    return jsonify({"mensaje": "Categoría eliminada correctamente."}), 200
