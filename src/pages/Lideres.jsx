import { useMemo, useState, useEffect } from "react";

const ITENS_POR_PAGINA = 40;

function Lideres() {
  const [lideres, setLideres] = useState([]);
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const [modalAberto, setModalAberto] = useState(false);
  const [liderEditando, setLiderEditando] = useState(null);

  const [form, setForm] = useState({
    id: "",
    nome: "",
  });

  // Filtragem de líderes
  const lideresFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) {
      return lideres;
    }

    return lideres.filter((lider) => {
      return (
        lider.id.toLowerCase().includes(termo) ||
        lider.nome.toLowerCase().includes(termo)
      );
    });
  }, [lideres, busca]);

  // Cálculo total de páginas
  const totalPaginas = Math.max(
    1,
    Math.ceil(lideresFiltrados.length / ITENS_POR_PAGINA)
  );

  // Garantir que a página não fique maior que o total disponível
  useEffect(() => {
    if (paginaAtual > totalPaginas) {
      setPaginaAtual(totalPaginas);
    }
  }, [paginaAtual, totalPaginas]);

  // Itens da página atual
  const lideresPagina = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;

    return lideresFiltrados.slice(inicio, fim);
  }, [lideresFiltrados, paginaAtual]);

  const abrirNovo = () => {
    setLiderEditando(null);
    setForm({
      id: "",
      nome: "",
    });
    setModalAberto(true);
  };

  const abrirEdicao = (lider) => {
    setLiderEditando(lider);
    setForm({
      id: lider.id,
      nome: lider.nome,
    });
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setLiderEditando(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const salvarLider = (event) => {
    event.preventDefault();

    const id = form.id.trim();
    const nome = form.nome.trim();

    if (!id || !nome) {
      return;
    }

    if (liderEditando) {
      setLideres((prev) =>
        prev.map((lider) =>
          lider.id === liderEditando.id
            ? {
                ...lider,
                nome,
              }
            : lider
        )
      );
    } else {
      const idExistente = lideres.some(
        (lider) => lider.id.toLowerCase() === id.toLowerCase()
      );

      if (idExistente) {
        alert("Já existe um líder cadastrado com este ID.");
        return;
      }

      setLideres((prev) => [
        ...prev,
        {
          id,
          nome,
        },
      ]);
    }

    fecharModal();
  };

  const excluirLider = (lider) => {
    const confirmar = window.confirm(
      `Deseja excluir o líder "${lider.nome}"?`
    );

    if (!confirmar) {
      return;
    }

    setLideres((prev) =>
      prev.filter((registro) => registro.id !== lider.id)
    );
  };

  const mudarPagina = (pagina) => {
    if (pagina < 1 || pagina > totalPaginas) {
      return;
    }

    setPaginaAtual(pagina);
  };

  const handleBusca = (event) => {
    setBusca(event.target.value);
    setPaginaAtual(1);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Líderes</h2>
          <p>
            Cadastre os líderes responsáveis pelas movimentações de estoque.
          </p>
        </div>

        <button className="btn btn-primary" onClick={abrirNovo}>
          + Novo líder
        </button>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <span className="search-icon">🔎</span>

            <input
              type="text"
              placeholder="Buscar por ID ou nome..."
              value={busca}
              onChange={handleBusca}
            />
          </div>
        </div>

        <div className="toolbar-right">
          <span
            style={{
              color: "#666",
              fontSize: "11px",
            }}
          >
            {lideresFiltrados.length} líder(es)
          </span>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID do líder</th>
                <th>Nome completo</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {lideresPagina.length === 0 ? (
                <tr>
                  <td colSpan="3">
                    <div className="empty-state">
                      <div className="empty-state-icon">👤</div>

                      <h3>
                        {busca
                          ? "Nenhum líder encontrado"
                          : "Nenhum líder cadastrado"}
                      </h3>

                      <p>
                        {busca
                          ? "Tente outro termo de pesquisa."
                          : "Clique em “Novo líder” para começar."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                lideresPagina.map((lider) => (
                  <tr key={lider.id}>
                    <td>
                      <strong>{lider.id}</strong>
                    </td>

                    <td>{lider.nome}</td>

                    <td>
                      <div className="action-buttons">
                        <button
                          className="icon-button"
                          title="Editar"
                          onClick={() => abrirEdicao(lider)}
                        >
                          ✏️
                        </button>

                        <button
                          className="icon-button danger"
                          title="Excluir"
                          onClick={() => excluirLider(lider)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span className="pagination-info">
            {lideresFiltrados.length === 0
              ? "0 registros"
              : `Página ${paginaAtual} de ${totalPaginas}`}
          </span>

          <div className="pagination-buttons">
            <button
              className="pagination-button"
              disabled={paginaAtual === 1}
              onClick={() => mudarPagina(paginaAtual - 1)}
            >
              ‹
            </button>

            {Array.from(
              { length: totalPaginas },
              (_, index) => index + 1
            )
              .filter((pagina) => {
                if (totalPaginas <= 5) {
                  return true;
                }

                return (
                  pagina === 1 ||
                  pagina === totalPaginas ||
                  Math.abs(pagina - paginaAtual) <= 1
                );
              })
              .map((pagina, index, paginasVisiveis) => {
                const paginaAnterior = paginasVisiveis[index - 1];

                const mostrarReticencias =
                  paginaAnterior &&
                  pagina - paginaAnterior > 1;

                return (
                  <span key={pagina}>
                    {mostrarReticencias && (
                      <span
                        style={{
                          margin: "0 4px",
                          color: "#888",
                        }}
                      >
                        ...
                      </span>
                    )}

                    <button
                      className={`pagination-button ${
                        paginaAtual === pagina ? "active" : ""
                      }`}
                      onClick={() => mudarPagina(pagina)}
                    >
                      {pagina}
                    </button>
                  </span>
                );
              })}

            <button
              className="pagination-button"
              disabled={paginaAtual === totalPaginas}
              onClick={() => mudarPagina(paginaAtual + 1)}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {modalAberto && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              fecharModal();
            }
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <h3>
                {liderEditando ? "Editar líder" : "Novo líder"}
              </h3>

              <button
                className="modal-close"
                onClick={fecharModal}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={salvarLider}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="id">
                      ID do líder *
                    </label>

                    <input
                      id="id"
                      name="id"
                      type="text"
                      className="form-control"
                      placeholder="Ex.: LID001"
                      value={form.id}
                      onChange={handleChange}
                      disabled={Boolean(liderEditando)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="nome">
                      Nome completo *
                    </label>

                    <input
                      id="nome"
                      name="nome"
                      type="text"
                      className="form-control"
                      placeholder="Nome completo"
                      value={form.nome}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={fecharModal}
                  >
                    Cancelar
                  </button>

                  <button type="submit" className="btn btn-primary">
                    {liderEditando
                      ? "Salvar alterações"
                      : "Cadastrar líder"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Lideres;
