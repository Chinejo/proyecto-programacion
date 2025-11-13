import './ModalConfirmar.css';

function ModalConfirmar({ isOpen, onClose, onConfirm, titulo, mensaje }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay-confirmar" onClick={onClose}>
      <div className="modal-box-confirmar" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icono-confirmar">⚠</div>
        <h3 className="modal-titulo-confirmar">{titulo}</h3>
        <p className="modal-mensaje-confirmar">{mensaje}</p>
        <div className="modal-botones-confirmar">
          <button className="modal-btn-cancelar" onClick={onClose}>
            Cancelar
          </button>
          <button className="modal-btn-confirmar" onClick={() => {
            onConfirm();
            onClose();
          }}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalConfirmar;
