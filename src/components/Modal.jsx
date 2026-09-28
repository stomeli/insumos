function Modal({
  aberto,
  titulo,
  children,
  onClose,
  largura = "520px",
}) {
  if (!aberto) {
    return null;
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="modal"
        style={{ maxWidth: largura }}
      >
        <div className="modal-header">
          <h2>{titulo}</h2>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
