import bcrypt


def hashear_password(password_plano: str) -> str:
    return bcrypt.hashpw(password_plano.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verificar_password(password_plano: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password_plano.encode("utf-8"), password_hash.encode("utf-8"))


def requiere_admin(claims: dict):
    """Lanza excepción si el usuario autenticado no tiene rol admin."""
    from app.utils.errors import ErrorNegocio

    if claims.get("rol") != "admin":
        raise ErrorNegocio("No tienes permisos para realizar esta acción.", status_code=403)
