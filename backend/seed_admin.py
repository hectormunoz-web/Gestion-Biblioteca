"""
Crea el usuario administrador inicial del sistema.
Ejecutar UNA sola vez, después de correr init_db.sql:

    python seed_admin.py
"""
from app import create_app
from app.extensions import db
from app.models import Usuario
from app.utils.security import hashear_password

EMAIL_ADMIN = "admin@biblioteca.edu.hn"
PASSWORD_ADMIN = "Admin123*"

app = create_app()

with app.app_context():
    existente = Usuario.query.filter_by(email=EMAIL_ADMIN).first()
    if existente:
        print(f"Ya existe un usuario con el correo {EMAIL_ADMIN}. No se creó nada nuevo.")
    else:
        admin = Usuario(
            nombre="Administrador",
            email=EMAIL_ADMIN,
            password_hash=hashear_password(PASSWORD_ADMIN),
            rol="admin",
        )
        db.session.add(admin)
        db.session.commit()
        print("Usuario administrador creado:")
        print(f"  Email:    {EMAIL_ADMIN}")
        print(f"  Password: {PASSWORD_ADMIN}")
        print("Cámbiala después de iniciar sesión por primera vez.")
