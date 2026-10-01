import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase.js";

function Dashboard() {
  const [insumos, setInsumos] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const carregarDashboard = async () => {
    setLoading(true);
    setErro("");

    try {
      const [insumosRes, historicoRes] = await Promise.all([
        supabase
          .from("insumos")
          .select("*")
          .order("descricao", { ascending: true }),

        supabase
          .from("view_historico")
          .select("*")
          .order("data", { ascending: false })
          .order("hora", { ascending: false })
          .order("created_at", { ascending: false }),
      ]);

      if (insumosRes.error) {
        throw insumosRes.error;
      }

      if (historicoRes.error) {
        throw historicoRes.error;
      }

      setInsumos(insumosRes.data || []);
      setHistorico(historicoRes.data || []);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      setErro(
        error?.message || "Erro ao carregar informações do dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDashboard();
  }, []);

  const quantidadeItens = insumos.length;

  const estoqueAtual = useMemo(() => {
    return insumos.reduce(
      (total, item) => total + Number(item.estoque_atual || 0),
      0
    );
  }, [insumos]);

  const totalEntradas = useMemo(() => {
    return insumos.reduce(
      (total, item) => total + Number(item.total_entradas || 0),
      0
    );
  }, [insumos]);

  const totalSaidas = useMemo(() => {
    return insumos.reduce(
      (total, item) => total + Number(item.total_saidas || 0),
      0
    );
  }, [insumos]);

  const estoqueBaixo = useMemo(() => {
    return insumos.filter((item) => {
      const estoque = Number(item.estoque_atual || 0);

      return estoque > 0 && estoque <= 10;
    });
  }, [insumos]);

  const estoqueZerado = useMemo(() => {
    return insumos.filter((item) => {
      const estoque = Number(item.estoque_atual || 0);

      return estoque <= 0;
    });
  }, [insumos]);

  const movimentacoesRecentes = historico.slice(0, 10);

  const formatarNumero = (valor) => {
    return Number(valor || 0).toLocaleString("pt-BR");
  };

  const formatarData = (data) => {
    if (!data) return "-";

    const partes = String(data).split("-");

    if (partes.length !== 3) {
      return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  };

  const resumo = [
    {
      titulo: "Itens cadastrados",
      valor: formatarNumero(quantidadeItens),
      descricao: "Total de insumos",
      icone: "📦",
    },
    {
      titulo: "Estoque atual",
      valor: formatarNumero(estoqueAtual),
      descricao: "Unidades disponíveis",
      icone: "📊",
    },
    {
      titulo: "Entradas",
      valor: formatarNumero(totalEntradas),
      descricao: "Unidades recebidas",
      icone: "📥",
    },
    {
      titulo: "Saídas",
      valor: formatarNumero(totalSaidas),
      descricao: "Unidades retiradas",
      icone: "📤",
    },
  ];

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h2>Visão geral</h2>

          <p>
            Acompanhe o estoque e as movimentações do sistema.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={carregarDashboard}
          disabled={loading}
        >
          {loading ? "Atualizando..." : "🔄 Atualizar"}
        </button>
      </div>

      {erro && (
        <div
          className="alert alert-warning"
          style={{ marginBottom: "18px" }}
        >
          {erro}
        </div>
      )}

      {/* CARDS DE RESUMO */}
      <div className="stats-grid">
        {resumo.map((item) => (
          <div className="stat-card" key={item.titulo}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div className="stat-label">
                  {item.titulo}
                </div>

                <div className="stat-value">
                  {loading ? "..." : item.valor}
                </div>

                <div className="stat-description">
                  {item.descricao}
                </div>
              </div>

              <div
                style={{
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#fff8b8",
                  borderRadius: "10px",
                  fontSize: "18px",
                }}
              >
                {item.icone}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MOVIMENTAÇÕES E ESTOQUE BAIXO */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(0, 1fr) minmax(280px, 380px)",
          gap: "18px",
        }}
      >
        {/* MOVIMENTAÇÕES RECENTES */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3>Movimentações recentes</h3>
            </div>

            <span className="badge badge-success">
              {formatarNumero(historico.length)}
            </span>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Item</th>
                  <th>Descrição</th>
                  <th>Quantidade</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        textAlign: "center",
                        padding: "2rem",
                      }}
                    >
                      Carregando movimentações...
                    </td>
                  </tr>
                ) : movimentacoesRecentes.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      <div className="empty-state">
                        <div className="empty-state-icon">
                          📋
                        </div>

                        <h3>Nenhuma movimentação</h3>

                        <p>
                          As entradas e saídas aparecerão aqui.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  movimentacoesRecentes.map((registro) => (
                    <tr
                      key={`${registro.tipo}-${registro.id}`}
                    >
                      <td>
                        {formatarData(registro.data)}
                      </td>

                      <td>
                        {registro.tipo === "entrada" ? (
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
                        <strong>
                          {registro.item_id || "-"}
                        </strong>
                      </td>

                      <td>
                        {registro.descricao_item || "-"}
                      </td>

                      <td>
                        <span
                          className={
                            registro.tipo === "entrada"
                              ? "badge badge-success"
                              : "badge badge-danger"
                          }
                        >
                          {registro.tipo === "entrada"
                            ? "+"
                            : "-"}
                          {formatarNumero(
                            registro.quantidade
                          )}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ESTOQUE BAIXO */}
        <div className="card">
          <div className="card-header">
            <h3>Estoque baixo</h3>

            <span className="badge badge-warning">
              {formatarNumero(
                estoqueBaixo.length + estoqueZerado.length
              )}
            </span>
          </div>

          <div className="card-body">
            {loading ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  📦
                </div>

                <h3>Carregando...</h3>
              </div>
            ) : estoqueBaixo.length === 0 &&
              estoqueZerado.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  ✅
                </div>

                <h3>Nenhum alerta</h3>

                <p>
                  Todos os itens possuem estoque suficiente.
                </p>
              </div>
            ) : (
              <div>
                {estoqueZerado.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 0",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <div>
                      <strong>{item.id}</strong>

                      <div
                        style={{
                          fontSize: "11px",
                          color: "#888",
                          marginTop: "3px",
                        }}
                      >
                        {item.descricao}
                      </div>
                    </div>

                    <span className="badge badge-danger">
                      0
                    </span>
                  </div>
                ))}

                {estoqueBaixo.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 0",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <div>
                      <strong>{item.id}</strong>

                      <div
                        style={{
                          fontSize: "11px",
                          color: "#888",
                          marginTop: "3px",
                        }}
                      >
                        {item.descricao}
                      </div>
                    </div>

                    <span className="badge badge-warning">
                      {formatarNumero(item.estoque_atual)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOVIMENTAÇÕES */}
      <div
        style={{
          marginTop: "18px",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "16px",
        }}
      >
        <div className="card">
          <div className="card-body">
            <div className="stat-label">
              Movimentações
            </div>

            <div
              style={{
                marginTop: "10px",
                fontSize: "18px",
                fontWeight: "800",
              }}
            >
              {loading
                ? "..."
                : `${formatarNumero(historico.length)} registros`}
            </div>

            <p
              style={{
                marginTop: "8px",
                color: "#888",
                fontSize: "11px",
              }}
            >
              Entradas e saídas registradas no sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
