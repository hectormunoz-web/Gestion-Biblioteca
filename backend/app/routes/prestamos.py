from datetime import date, timedelta

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt

from app.extensions import db
from app.models import Prestamo, Libro, Usuario
from app.schemas import PrestamoCreateSchema
from app.utils.security import requiere_admin
from app.utils.errors import ErrorNegocio

prestamos_bp = Blueprint("prestamos", __name__, url_prefix="/api/prestamos")

DIAS_PRESTAMO_DEFAULT = 15


def _actualizar_estados_vencidos():
    """Recalcula a 'atrasado' cualquier préstamo activo cuya fecha esperada
    ya pasó. Se ejecuta antes de listar, para que el estado mostrado siempre
    esté al día sin depender de un job externo."""
    hoy = date.today()
    vencidos = Prestamo.query.filter(
        Prestamo.estado == "activo", Prestamo.fecha_devolucion_esperada < hoy
    ).all()
    for prestamo in vencidos:
        prestamo.estado = "atrasado"
    if vencidos:
        db.session.commit()


@prestamos_bp.get("")
@jwt_required()
def listar_prestamos():
    _actualizar_estados_vencidos()
    prestamos = Prestamo.query.order_by(Prestamo.fecha_prestamo.desc()).all()

    resultado = []
    for p in prestamos:
        item = p.to_dict()
        item["usuario_nombre"] = p.usuario.nombre if p.usuario else None
        item["libro_titulo"] = p.libro.titulo if p.libro else None
        resultado.append(item)

    return jsonify(resultado), 200


@prestamos_bp.post("")
@jwt_required()
def crear_prestamo():
    requiere_admin(get_jwt())
    datos = PrestamoCreateSchema().load(request.get_json(force=True) or {})

    usuario = Usuario.query.get(datos["usuario_id"])
    if not usuario:
        raise ErrorNegocio("El usuario seleccionado no existe.", status_code=404)
    if not usuario.activo:
        raise ErrorNegocio("No se puede prestar un libro a un usuario inactivo.", status_code=409)

    libro = Libro.query.get(datos["libro_id"])
    if not libro:
        raise ErrorNegocio("El libro seleccionado no existe.", status_code=404)

    # Regla de negocio: no prestar si no hay existencias
    if libro.stock <= 0:
        raise ErrorNegocio("No hay existencias disponibles de este libro.", status_code=409)

    # Regla de negocio: no permitir que el mismo usuario tenga dos préstamos
    # activos/atrasados del mismo libro al mismo tiempo (duplicado lógico)
    duplicado = Prestamo.query.filter(
        Prestamo.usuario_id == usuario.id,
        Prestamo.libro_id == libro.id,
        Prestamo.estado.in_(["activo", "atrasado"]),
    ).first()
    if duplicado:
        raise ErrorNegocio(
            "Este usuario ya tiene un préstamo activo de este mismo libro.",
            status_code=409,
        )

    hoy = date.today()
    prestamo = Prestamo(
        usuario_id=usuario.id,
        libro_id=libro.id,
        fecha_prestamo=hoy,
        fecha_devolucion_esperada=hoy + timedelta(days=DIAS_PRESTAMO_DEFAULT),
        estado="activo",
    )
    libro.stock -= 1

    db.session.add(prestamo)
    db.session.commit()

    item = prestamo.to_dict()
    item["usuario_nombre"] = usuario.nombre
    item["libro_titulo"] = libro.titulo
    return jsonify(item), 201


@prestamos_bp.put("/<int:prestamo_id>/devolver")
@jwt_required()
def devolver_prestamo(prestamo_id):
    requiere_admin(get_jwt())
    prestamo = Prestamo.query.get(prestamo_id)
    if not prestamo:
        raise ErrorNegocio("Préstamo no encontrado.", status_code=404)

    if prestamo.estado == "devuelto":
        raise ErrorNegocio("Este préstamo ya fue devuelto anteriormente.", status_code=409)

    prestamo.estado = "devuelto"
    prestamo.fecha_devolucion_real = date.today()
    prestamo.libro.stock += 1

    db.session.commit()

    item = prestamo.to_dict()
    item["usuario_nombre"] = prestamo.usuario.nombre if prestamo.usuario else None
    item["libro_titulo"] = prestamo.libro.titulo if prestamo.libro else None
    return jsonify(item), 200
