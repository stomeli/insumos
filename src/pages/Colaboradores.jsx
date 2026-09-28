import { useEffect, useMemo, useState } from "react";
import { supabase } from "../data/supabase"; // Ajuste o caminho se necessário

const ITENS_POR_PAGINA = 40;

function Colaboradores() {
  const [colaboradores, setColaboradores] = useState([]);
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [carregando, setCarregando] = useState(true);

  const [modalAberto, setModalAberto] = useState(false);
  const [colaboradorEditando, setColaboradorEditando] = useState(null);

  const [form, setForm] = useState({
    id: "",
    nome: "",
  });

  // Carregar colaboradores do Supabase ao montar o componente
  useEffect(() => {
    carregarColaboradores();
  }, []);

  const carregarColaboradores = async () => {
    setCarregando(true);
    const { data, error } = await supabase
      .from("colaboradores")
      .select("*")
      .order("nome", { ascending: true });

    if (error) {
      console.error("Erro ao carregar colaboradores:", error);
      alert("Erro ao carregar colaboradores: " + error.message);
    } else {
      setColaboradores(data || []);
    }
    setCarregando(false);
  };

  const colaboradoresFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) {
      return colaboradores;
    }

    return colaboradores.filter((colaborador) => {
      return (
        String(colaborador.id).toLowerCase().includes(termo) ||
        String(colaborador.nome).toLowerCase().includes(termo)
      );
    });
  }, [colaboradores, busca]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(colaboradoresFiltrados.length / ITENS_POR_PAGINA)
  );

  const colaboradoresPagina = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;

    return colaboradoresFiltrados.slice(inicio, fim);
  }, [colaboradoresFiltrados, paginaAtual]);

  const abrirNovo = () => {
    setColaboradorEditando(null);
    setForm({
      id: "",
      nome: "",
    });
    setModalAberto(true);
  };

  const abrirEdicao = (colaborador) => {
    setColaboradorEditando(colaborador);
    setForm({
      id: colaborador.id,
      nome: colaborador.nome,
    });
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setColaboradorEditando(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const salvarColaborador = async (event) => {
    event.preventDefault();

    const id = form.id.trim();
    const nome = form.nome.trim();

    if (!id || !nome) {
      return;
    }

    if (colaboradorEditando) {
      // Atualizar no Supabase
      const { error } = await supabase
        .from("colaboradores")
        .update({ nome })
        .eq("id", colaboradorEditando.id);

      if (error) {
        alert("Erro ao atualizar colaborador: " + error.message);
        return;
      }

      setColaboradores((prev) =>
        prev.map((c) => (c.id === colaboradorEditando.id ? { ...c, nome } : c))
      );
    } else {
      // Verificar se já existe antes de inserir
      const idExistente = colaboradores.some(
        (c) => String(c.id).toLowerCase() === id.toLowerCase()
      );

      if (idExistente) {
        alert("Já existe um colaborador cadastrado com este ID.");
        return;
      }

      // Inserir no Supabase
      const { error } = await supabase
        .from("colaboradores")
        .insert([{ id, nome }]);

      if (error) {
        alert("Erro ao cadastrar colaborador: " + error.message);
        return;
      }

      setColaboradores((prev) => [...prev, { id, nome }]);
    }

    fecharModal();
  };

  const excluirColaborador = async (colaborador) => {
    const confirmar = window.confirm(
      `Deseja excluir o colaborador "${colaborador.nome}"?`
    );

    if (!confirmar) {
      return;
    }

    // Excluir do Supabase
    const { error } = await supabase
      .from("colaboradores")
      .delete()
      .eq("id", colaborador.id);

    if (error) {
      alert("Erro ao excluir colaborador: " + error.message);
      return;
    }

    const colaboradoresAtualizados = colaboradores.filter(
      (registro) => registro.id !== colaborador.id
    );

    setColaboradores(colaboradoresAtualizados);

    if (
      paginaAtual > 1 &&
      colaboradoresPagina.length === 1 &&
      paginaAtual === totalPaginas
    ) {
      setPaginaAtual((pagina) => Math.max(1, pagina - 1));
    }
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
        <h2>Colaboradores</h2>
          <p>
            Cadastre os colaboradores que poderão retirar insumos do estoque.
          </p>
        </div>

        <button className="btn btn-primary" onClick={abrirNovo}>
          + Novo colaborador
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
          <span style={{ color: "#666", fontSize: "11px" }}>
            {colaboradoresFiltrados.length} colaborador(es)
          </span>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID do colaborador</th>
                <th>Nome completo</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center", padding: "2rem" }}>
                    Carregando colaboradores...
                  </td>
                </tr>
              ) : colaboradoresPagina.length === 0 ? (
                <tr>
                  <td colSpan="3">
                    <div className="empty-state">
                      <div className="empty-state-icon">👥</div>
                      <h3>
                        {busca
                          ? "Nenhum colaborador encontrado"
                          : "Nenhum colaborador cadastrado"}
                      </h3>
                      <p>
                        {busca
                          ? "Tente outro termo de pesquisa."
                          : "Clique em “Novo colaborador” para começar."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                colaboradoresPagina.map((colaborador) => (
                  <tr key={colaborador.id}>
                    <td>
                      <strong>{colaborador.id}</strong>
                    </td>
                    <td>{colaborador.nome}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="icon-button"
                          title="Editar"
                          onClick={() => abrirEdicao(colaborador)}
                        >
                          ✏️
                        </button>
                        <button
                          className="icon-button danger"
                          title="Excluir"
                          onClick={() => excluirColaborador(colaborador)}
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
            {colaboradoresFiltrados.length === 0
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
                  paginaAnterior && pagina - paginaAnterior > 1;

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
                {colaboradorEditando
                  ? "Editar colaborador"
                  : "Novo colaborador"}
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
              <form onSubmit={salvarColaborador}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="id">
                      ID do colaborador *
                    </label>

                    <input
                      id="id"
                      name="id"
                      type="text"
                      className="form-control"
                      placeholder="Ex.: COL001"
                      value={form.id}
                      onChange={handleChange}
                      disabled={Boolean(colaboradorEditando)}
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
                    {colaboradorEditando
                      ? "Salvar alterações"
                      : "Cadastrar colaborador"}
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

export default Colaboradores;
