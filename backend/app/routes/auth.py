from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt

from app.extensions import db
from app.models import Usuario
from app.schemas import UsuarioCreateSchema, LoginSchema
from app.utils.security import hashear_password, verificar_password
from app.utils.errors import ErrorNegocio

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/registro")
def registro():
    datos = UsuarioCreateSchema().load(request.get_json(force=True) or {})

    usuario = Usuario(
        nombre=datos["nombre"].strip(),
        email=datos["email"].lower().strip(),
        password_hash=hashear_password(datos["password"]),
        rol=datos.get("rol", "miembro"),
    )
    db.session.add(usuario)
    db.session.commit()

    return jsonify(usuario.to_dict()), 201


@auth_bp.post("/login")
def login():
    datos = LoginSchema().load(request.get_json(force=True) or {})

    usuario = Usuario.query.filter_by(email=datos["email"].lower().strip()).first()
    if not usuario or not verificar_password(datos["password"], usuario.password_hash):
        raise ErrorNegocio("Correo o contraseña incorrectos.", status_code=401)

    if not usuario.activo:
        raise ErrorNegocio("Esta cuenta está desactivada. Contacta a un administrador.", status_code=403)

    token = create_access_token(
        identity=str(usuario.id),
        additional_claims={"rol": usuario.rol, "nombre": usuario.nombre},
    )
    return jsonify({"access_token": token, "usuario": usuario.to_dict()}), 200


@auth_bp.get("/perfil")
@jwt_required()
def perfil():
    usuario_id = get_jwt_identity()
    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        raise ErrorNegocio("Usuario no encontrado.", status_code=404)
    return jsonify(usuario.to_dict()), 200
