from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

from app.models import Categoria, Autor

catalogos_bp = Blueprint("catalogos", __name__, url_prefix="/api")


@catalogos_bp.get("/categorias")
@jwt_required()
def listar_categorias():
    categorias = Categoria.query.order_by(Categoria.nombre).all()
    return jsonify([c.to_dict() for c in categorias]), 200


@catalogos_bp.get("/autores")
@jwt_required()
def listar_autores():
    autores = Autor.query.order_by(Autor.nombre).all()
    return jsonify([a.to_dict() for a in autores]), 200
