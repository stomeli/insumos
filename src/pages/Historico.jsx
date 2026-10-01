import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase.js";

const ITENS_POR_PAGINA = 40;

function Historico() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const carregarHistorico = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("historico")
      .select("*")
      .order("data", { ascending: false })
      .order("hora", { ascending: false });

    if (error) {
      console.error(error);
      alert("Erro ao carregar histórico.");
      setRegistros([]);
    } else {
      setRegistros(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    carregarHistorico();
  }, []);

  const filtrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) return registros;

    return registros.filter((registro) => {
      const texto = [
        registro.tipo,
        registro.colaborador_id,
        registro.colaborador_nome,
        registro.item_id,
        registro.descricao,
        registro.lider_id,
        registro.lider_nome,
      ]
        .join(" ")
        .toLowerCase();

      return texto.includes(termo);
    });
  }, [registros, busca]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(filtrados.length / ITENS_POR_PAGINA)
  );

  useEffect(() => {
    if (paginaAtual > totalPaginas) {
      setPaginaAtual(totalPaginas);
    }
  }, [paginaAtual, totalPaginas]);

  const registrosPagina = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;

    return filtrados.slice(
      inicio,
      inicio + ITENS_POR_PAGINA
    );
  }, [filtrados, paginaAtual]);

  const handleBusca = (event) => {
    setBusca(event.target.value);
    setPaginaAtual(1);
  };

  const excluirRegistro = async (registro) => {
    const confirmar = window.confirm(
      `Deseja excluir esta ${registro.tipo.toLowerCase()}?`
    );

    if (!confirmar) return;

    const { error } = await supabase.rpc(
      registro.tipo === "Entrada"
        ? "excluir_entrada"
        : "excluir_saida",
      {
        p_id: registro.id_original,
      }
    );

    if (error) {
      console.error(error);
      alert(error.message || "Erro ao excluir movimentação.");
      return;
    }

    await carregarHistorico();
  };

  const mudarPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaAtual(pagina);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Histórico</h2>
          <p>
            Consulte todas as entradas e saídas de estoque.
          </p>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <span className="search-icon">🔎</span>

            <input
              type="text"
              placeholder="Buscar colaborador, item ou líder..."
              value={busca}
              onChange={handleBusca}
            />
          </div>
        </div>

        <div className="toolbar-right">
          <span style={{ color: "#666", fontSize: "11px" }}>
            {filtrados.length} registro(s)
          </span>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Data</th>
                <th>Hora</th>
                <th>ID colaborador</th>
                <th>Nome</th>
                <th>ID item</th>
                <th>Descrição</th>
                <th>Quantidade</th>
                <th>ID líder</th>
                <th>Nome do líder</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="11"
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                    }}
                  >
                    Carregando histórico...
                  </td>
                </tr>
              ) : registrosPagina.length === 0 ? (
                <tr>
                  <td colSpan="11">
                    <div className="empty-state">
                      <div className="empty-state-icon">📋</div>

                      <h3>
                        {busca
                          ? "Nenhum registro encontrado"
                          : "Nenhum registro no histórico"}
                      </h3>

                      <p>
                        {busca
                          ? "Tente outro termo de pesquisa."
                          : "As movimentações aparecerão aqui."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                registrosPagina.map((registro) => (
                  <tr key={`${registro.tipo}-${registro.id_original}`}>
                    <td>
                      {registro.tipo === "Entrada" ? (
                        <span className="badge badge-success">
                          Entrada
                        </span>
                      ) : (
                        <span className="badge badge-danger">
                          Saída
                        </span>
                      )}
                    </td>

                    <td>{registro.data}</td>

                    <td>{registro.hora || "-"}</td>

                    <td>
                      <strong>
                        {registro.colaborador_id || "-"}
                      </strong>
                    </td>

                    <td>
                      {registro.colaborador_nome || "-"}
                    </td>

                    <td>
                      <strong>{registro.item_id}</strong>
                    </td>

                    <td>{registro.descricao}</td>

                    <td>
                      <span
                        className={
                          registro.tipo === "Entrada"
                            ? "badge badge-success"
                            : "badge badge-danger"
                        }
                      >
                        {registro.tipo === "Entrada" ? "+" : "-"}
                        {registro.quantidade}
                      </span>
                    </td>

                    <td>
                      <strong>{registro.lider_id}</strong>
                    </td>

                    <td>{registro.lider_nome}</td>

                    <td>
                      <div className="action-buttons">
                        <button
                          className="icon-button danger"
                          title="Excluir"
                          onClick={() =>
                            excluirRegistro(registro)
                          }
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
              .filter((pagina) => {
                if (totalPaginas <= 5) return true;

                return (
                  pagina === 1 ||
                  pagina === totalPaginas ||
                  Math.abs(pagina - paginaAtual) <= 1
                );
              })
              .map((pagina) => (
                <button
                  key={pagina}
                  className={`pagination-button ${
                    paginaAtual === pagina ? "active" : ""
                  }`}
                  onClick={() => mudarPagina(pagina)}
                >
                  {pagina}
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
    </div>
  );
}

export default Historico;
