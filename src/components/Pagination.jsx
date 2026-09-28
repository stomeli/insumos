function Pagination({
  paginaAtual,
  totalPaginas,
  onChange,
}) {
  if (totalPaginas <= 1) {
    return null;
  }

  return (
    <div className="pagination">
      <button
        type="button"
        onClick={() => onChange(paginaAtual - 1)}
        disabled={paginaAtual === 1}
      >
        ← Anterior
      </button>

      <span>
        Página {paginaAtual} de {totalPaginas}
      </span>

      <button
        type="button"
        onClick={() => onChange(paginaAtual + 1)}
        disabled={paginaAtual === totalPaginas}
      >
        Próxima →
      </button>
    </div>
  );
}

export default Pagination;
