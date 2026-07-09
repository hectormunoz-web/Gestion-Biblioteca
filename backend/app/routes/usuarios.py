from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity

from app.extensions import db
from app.models import Usuario
from app.schemas import UsuarioCreateSchema, UsuarioUpdateSchema
from app.utils.security import hashear_password, requiere_admin
from app.utils.errors import ErrorNegocio

usuarios_bp = Blueprint("usuarios", __name__, url_prefix="/api/usuarios")


@usuarios_bp.get("")
@jwt_required()
def listar_usuarios():
    requiere_admin(get_jwt())
    usuarios = Usuario.query.order_by(Usuario.id).all()
    return jsonify([u.to_dict() for u in usuarios]), 200


@usuarios_bp.get("/<int:usuario_id>")
@jwt_required()
def obtener_usuario(usuario_id):
    requiere_admin(get_jwt())
    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        raise ErrorNegocio("Usuario no encontrado.", status_code=404)
    return jsonify(usuario.to_dict()), 200


@usuarios_bp.post("")
@jwt_required()
def crear_usuario():
    requiere_admin(get_jwt())
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


@usuarios_bp.put("/<int:usuario_id>")
@jwt_required()
def actualizar_usuario(usuario_id):
    requiere_admin(get_jwt())
    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        raise ErrorNegocio("Usuario no encontrado.", status_code=404)

    datos = UsuarioUpdateSchema().load(request.get_json(force=True) or {})

    email_nuevo = datos["email"].lower().strip()
    conflicto = Usuario.query.filter(Usuario.email == email_nuevo, Usuario.id != usuario_id).first()
    if conflicto:
        raise ErrorNegocio("Ya existe otro usuario con este correo.", status_code=409)

    # Regla de negocio: no permitir que un admin se quite a sí mismo el rol de admin
    # si es el único administrador activo del sistema.
    if usuario.rol == "admin" and datos["rol"] != "admin":
        admins_activos = Usuario.query.filter_by(rol="admin", activo=True).count()
        if admins_activos <= 1:
            raise ErrorNegocio(
                "No se puede quitar el rol de administrador: debe existir al menos un admin activo.",
                status_code=409,
            )

    usuario.nombre = datos["nombre"].strip()
    usuario.email = email_nuevo
    usuario.rol = datos["rol"]
    usuario.activo = datos["activo"]
    if datos.get("password"):
        usuario.password_hash = hashear_password(datos["password"])

    db.session.commit()
    return jsonify(usuario.to_dict()), 200


@usuarios_bp.delete("/<int:usuario_id>")
@jwt_required()
def eliminar_usuario(usuario_id):
    requiere_admin(get_jwt())
    usuario_actual_id = get_jwt_identity()

    if str(usuario_id) == str(usuario_actual_id):
        raise ErrorNegocio("No puedes eliminar tu propia cuenta mientras estás conectado.", status_code=409)

    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        raise ErrorNegocio("Usuario no encontrado.", status_code=404)

    if usuario.prestamos:
        raise ErrorNegocio(
            "No se puede eliminar: el usuario tiene préstamos registrados. "
            "Desactívalo en su lugar.",
            status_code=409,
        )

    db.session.delete(usuario)
    db.session.commit()
    return jsonify({"mensaje": "Usuario eliminado correctamente."}), 200
