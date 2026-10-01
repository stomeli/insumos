import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "../supabase.js";

const ITENS_POR_PAGINA = 40;

function Historico() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const carregarHistorico = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("historico")
      .select("*")
      .order("data", { ascending: false })
      .order("hora", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar histórico:", error);
      alert(error.message || "Erro ao carregar histórico.");
      setRegistros([]);
    } else {
      setRegistros(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    carregarHistorico();
  }, [carregarHistorico]);

  const filtrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) {
      return registros;
    }

    return registros.filter((registro) => {
      const texto = [
        registro.tipo,
        registro.colaborador_id,
        registro.nome_colaborador,
        registro.item_id,
        registro.descricao_item,
        registro.lider_id,
        registro.nome_lider,
      ]
        .filter((valor) => valor !== null && valor !== undefined)
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
    const tipo = String(registro.tipo || "").toLowerCase();

    const nomeTipo =
      tipo === "entrada"
        ? "entrada"
        : "saída";

    const confirmar = window.confirm(
      `Deseja excluir esta ${nomeTipo}?`
    );

    if (!confirmar) {
      return;
    }

    if (!registro.id) {
      alert("Não foi possível identificar o registro.");
      return;
    }

    const id = Number(registro.id);

    if (!Number.isInteger(id)) {
      alert("ID do registro inválido.");
      return;
    }

    let error = null;

    if (tipo === "entrada") {
      const resultado = await supabase
        .from("entradas")
        .delete()
        .eq("id", id);

      error = resultado.error;
    } else if (tipo === "saida") {
      const resultado = await supabase
        .from("saidas")
        .delete()
        .eq("id", id);

      error = resultado.error;
    } else {
      alert("Tipo de movimentação inválido.");
      return;
    }

    if (error) {
      console.error("Erro ao excluir movimentação:", error);

      alert(
        error.message ||
          "Erro ao excluir movimentação."
      );

      return;
    }

    await carregarHistorico();
  };

  const mudarPagina = (pagina) => {
    if (
      pagina >= 1 &&
      pagina <= totalPaginas
    ) {
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
            <span className="search-icon">
              🔎
            </span>

            <input
              type="text"
              placeholder="Buscar colaborador, item ou líder..."
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
                      <div className="empty-state-icon">
                        📋
                      </div>

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
                registrosPagina.map((registro) => {
                  const tipo = String(
                    registro.tipo || ""
                  ).toLowerCase();

                  const ehEntrada =
                    tipo === "entrada";

                  return (
                    <tr
                      key={`${tipo}-${registro.id}`}
                    >
                      <td>
                        {ehEntrada ? (
                          <span className="badge badge-success">
                            Entrada
                          </span>
                        ) : (
                          <span className="badge badge-danger">
                            Saída
                          </span>
                        )}
                      </td>

                      <td>
                        {registro.data || "-"}
                      </td>

                      <td>
                        {registro.hora || "-"}
                      </td>

                      <td>
                        <strong>
                          {registro.colaborador_id ||
                            "-"}
                        </strong>
                      </td>

                      <td>
                        {registro.nome_colaborador ||
                          "-"}
                      </td>

                      <td>
                        <strong>
                          {registro.item_id || "-"}
                        </strong>
                      </td>

                      <td>
                        {registro.descricao_item ||
                          "-"}
                      </td>

                      <td>
                        <span
                          className={
                            ehEntrada
                              ? "badge badge-success"
                              : "badge badge-danger"
                          }
                        >
                          {ehEntrada ? "+" : "-"}
                          {registro.quantidade ?? 0}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {registro.lider_id ||
                            "-"}
                        </strong>
                      </td>

                      <td>
                        {registro.nome_lider ||
                          "-"}
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            className="icon-button danger"
                            title="Excluir"
                            onClick={() =>
                              excluirRegistro(
                                registro
                              )
                            }
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
              onClick={() =>
                mudarPagina(paginaAtual - 1)
              }
            >
              ‹
            </button>

            {Array.from(
              {
                length: totalPaginas,
              },
              (_, index) => index + 1
            )
              .filter((pagina) => {
                if (totalPaginas <= 5) {
                  return true;
                }

                return (
                  pagina === 1 ||
                  pagina === totalPaginas ||
                  Math.abs(
                    pagina - paginaAtual
                  ) <= 1
                );
              })
              .map((pagina, index, paginasVisiveis) => {
                const anterior =
                  paginasVisiveis[index - 1];

                return (
                  <span key={pagina}>
                    {anterior &&
                      pagina - anterior > 1 && (
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
                        paginaAtual === pagina
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        mudarPagina(pagina)
                      }
                    >
                      {pagina}
                    </button>
                  </span>
                );
              })}

            <button
              className="pagination-button"
              disabled={
                paginaAtual === totalPaginas
              }
              onClick={() =>
                mudarPagina(paginaAtual + 1)
              }
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
