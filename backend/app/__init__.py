from flask import Flask
from dotenv import load_dotenv

from app.config import Config
from app.extensions import db, jwt, cors
from app.utils.errors import registrar_manejadores_errores

load_dotenv()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    registrar_manejadores_errores(app)

    from app.routes.auth import auth_bp
    from app.routes.usuarios import usuarios_bp
    from app.routes.libros import libros_bp
    from app.routes.categorias import categorias_bp
    from app.routes.autores import autores_bp
    from app.routes.prestamos import prestamos_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(usuarios_bp)
    app.register_blueprint(libros_bp)
    app.register_blueprint(categorias_bp)
    app.register_blueprint(autores_bp)
    app.register_blueprint(prestamos_bp)

    @app.get("/api/salud")
    def salud():
        return {"estado": "ok"}, 200

    return app
