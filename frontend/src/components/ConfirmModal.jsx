export default function ConfirmModal({ titulo, mensaje, onConfirmar, onCancelar }) {
  return (
    <div className="modal-fondo">
      <div className="modal-caja">
        <h3 style={{ marginTop: 0 }}>{titulo}</h3>
        <p>{mensaje}</p>
        <div className="modal-acciones">
          <button className="btn btn-secundario" onClick={onCancelar}>Cancelar</button>
          <button className="btn btn-peligro" onClick={onConfirmar}>Sí, eliminar</button>
        </div>
      </div>
    </div>
  );
}
