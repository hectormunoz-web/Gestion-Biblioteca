from flask import jsonify
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError, DataError
from werkzeug.exceptions import HTTPException


class ErrorNegocio(Exception):
    """Error de regla de negocio, con mensaje seguro para mostrar al usuario final."""

    def __init__(self, mensaje, status_code=400):
        super().__init__(mensaje)
        self.mensaje = mensaje
        self.status_code = status_code


def registrar_manejadores_errores(app):
    @app.errorhandler(ValidationError)
    def manejar_validacion(err):
        # err.messages es un dict {campo: [mensajes]} generado por marshmallow
        return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400

    @app.errorhandler(ErrorNegocio)
    def manejar_error_negocio(err):
        return jsonify({"error": err.mensaje}), err.status_code

    @app.errorhandler(IntegrityError)
    def manejar_integridad(err):
        app.logger.error(f"IntegrityError: {err}")
        mensaje = "No se pudo completar la operación por un conflicto de datos (posible duplicado)."
        return jsonify({"error": mensaje}), 409

    @app.errorhandler(DataError)
    def manejar_data_error(err):
        app.logger.error(f"DataError: {err}")
        return jsonify({"error": "Uno o más valores enviados tienen un formato inválido."}), 400

    @app.errorhandler(HTTPException)
    def manejar_http(err):
        return jsonify({"error": err.description}), err.code

    @app.errorhandler(Exception)
    def manejar_generico(err):
        app.logger.exception("Error no controlado")
        return jsonify({"error": "Ocurrió un error inesperado. Intenta de nuevo más tarde."}), 500
