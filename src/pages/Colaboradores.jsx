import { useMemo, useState, useEffect } from "react";
import { supabase } from "../supabase.js";

const ITENS_POR_PAGINA = 40;

function Colaboradores() {
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const [modalAberto, setModalAberto] = useState(false);
  const [colaboradorEditando, setColaboradorEditando] = useState(null);

  const [form, setForm] = useState({
    id: "",
    nome: "",
  });

  const carregarColaboradores = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("colaboradores")
      .select("*")
      .order("nome", { ascending: true });

    if (error) {
      console.error(error);
      alert("Erro ao carregar colaboradores.");
      setColaboradores([]);
    } else {
      setColaboradores(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    carregarColaboradores();
  }, []);

  const filtrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) return colaboradores;

    return colaboradores.filter((colaborador) =>
      `${colaborador.id} ${colaborador.nome}`
        .toLowerCase()
        .includes(termo)
    );
  }, [colaboradores, busca]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(filtrados.length / ITENS_POR_PAGINA)
  );

  useEffect(() => {
    if (paginaAtual > totalPaginas) {
      setPaginaAtual(totalPaginas);
    }
  }, [paginaAtual, totalPaginas]);

  const pagina = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;

    return filtrados.slice(
      inicio,
      inicio + ITENS_POR_PAGINA
    );
  }, [filtrados, paginaAtual]);

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

  const salvar = async (event) => {
    event.preventDefault();

    const id = form.id.trim();
    const nome = form.nome.trim();

    if (!id || !nome) {
      alert("Preencha todos os campos.");
      return;
    }

    if (colaboradorEditando) {
      const { error } = await supabase
        .from("colaboradores")
        .update({ nome })
        .eq("id", colaboradorEditando.id);

      if (error) {
        console.error(error);
        alert("Erro ao atualizar colaborador.");
        return;
      }
    } else {
      const { data: existente, error: consultaError } =
        await supabase
          .from("colaboradores")
          .select("id")
          .eq("id", id)
          .maybeSingle();

      if (consultaError) {
        console.error(consultaError);
        alert("Erro ao verificar ID.");
        return;
      }

      if (existente) {
        alert("Já existe um colaborador com este ID.");
        return;
      }

      const { error } = await supabase
        .from("colaboradores")
        .insert({
          id,
          nome,
        });

      if (error) {
        console.error(error);
        alert("Erro ao cadastrar colaborador.");
        return;
      }
    }

    await carregarColaboradores();
    fecharModal();
  };

  const excluir = async (colaborador) => {
    const confirmar = window.confirm(
      `Deseja excluir o colaborador "${colaborador.nome}"?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("colaboradores")
      .delete()
      .eq("id", colaborador.id);

    if (error) {
      console.error(error);
      alert(
        "Não foi possível excluir. Existem saídas vinculadas a este colaborador."
      );
      return;
    }

    await carregarColaboradores();
  };

  const handleBusca = (event) => {
    setBusca(event.target.value);
    setPaginaAtual(1);
  };

  const mudarPagina = (numero) => {
    if (numero >= 1 && numero <= totalPaginas) {
      setPaginaAtual(numero);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Colaboradores</h2>
          <p>Cadastre os colaboradores que participam das saídas.</p>
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
            {filtrados.length} colaborador(es)
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
              {loading ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center", padding: "2rem" }}>
                    Carregando colaboradores...
                  </td>
                </tr>
              ) : pagina.length === 0 ? (
                <tr>
                  <td colSpan="3">
                    <div className="empty-state">
                      <div className="empty-state-icon">👷</div>

                      <h3>
                        {busca
                          ? "Nenhum colaborador encontrado"
                          : "Nenhum colaborador cadastrado"}
                      </h3>

                      <p>
                        {busca
                          ? "Tente outro termo."
                          : "Clique em “Novo colaborador” para começar."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                pagina.map((colaborador) => (
                  <tr key={colaborador.id}>
                    <td>
                      <strong>{colaborador.id}</strong>
                    </td>

                    <td>{colaborador.nome}</td>

                    <td>
                      <div className="action-buttons">
                        <button
                          className="icon-button"
                          onClick={() => abrirEdicao(colaborador)}
                          title="Editar"
                        >
                          ✏️
                        </button>

                        <button
                          className="icon-button danger"
                          onClick={() => excluir(colaborador)}
                          title="Excluir"
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
            {filtrados.length === 0
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
              .filter((numero) => {
                if (totalPaginas <= 5) return true;

                return (
                  numero === 1 ||
                  numero === totalPaginas ||
                  Math.abs(numero - paginaAtual) <= 1
                );
              })
              .map((numero) => (
                <button
                  key={numero}
                  className={`pagination-button ${
                    paginaAtual === numero ? "active" : ""
                  }`}
                  onClick={() => mudarPagina(numero)}
                >
                  {numero}
                </button>
              ))}

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
                type="button"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={salvar}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      ID do colaborador *
                    </label>

                    <input
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
                    <label className="form-label">
                      Nome completo *
                    </label>

                    <input
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
