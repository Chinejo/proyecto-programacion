import './Modal.css';

function Modal({ isOpen, onClose, titulo, mensaje, tipo = 'info' }) {
  if (!isOpen) return null;

  const getTipoClase = () => {
    switch(tipo) {
      case 'success': return 'modal-success';
      case 'error': return 'modal-error';
      case 'warning': return 'modal-warning';
      default: return 'modal-info';
    }
  };

  const getIcono = () => {
    switch(tipo) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      default: return 'ℹ';
    }
  };

  return (
    <div className="modal-overlay-custom" onClick={onClose}>
      <div className={`modal-box ${getTipoClase()}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-icono">{getIcono()}</div>
        <h3 className="modal-titulo">{titulo}</h3>
        <p className="modal-mensaje">{mensaje}</p>
        <button className="modal-btn-aceptar" onClick={onClose}>Aceptar</button>
      </div>
    </div>
  );
}

export default Modal;
