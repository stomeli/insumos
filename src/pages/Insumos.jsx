import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "../supabase.js";

const ITENS_POR_PAGINA = 40;

const INSUMOS_DESTAQUE = [
  {
    id: "005",
    titulo: "Etq Bancada Branca",
    descricao: "080X040",
    icone: "🏷️",
  },
  {
    id: "001",
    titulo: "Etq Bancada Color",
    descricao: "080X040",
    icone: "🏷️",
  },
  {
    id: "007",
    titulo: "Etq Gestão",
    descricao: "100X150Mm",
    icone: "🏷️",
  },
];

function Insumos() {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const [modalAberto, setModalAberto] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);

  const [form, setForm] = useState({
    id: "",
    descricao: "",
    estoqueInicial: "",
  });

  /*
   * CARREGAR INSUMOS
   */
  const carregarInsumos = useCallback(async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("insumos")
        .select(`
          id,
          descricao,
          estoque_inicial,
          entradas,
          saidas,
          estoque_atual,
          total_entradas,
          total_saidas
        `)
        .order("descricao", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      console.log("INSUMOS CARREGADOS:", data);

      setItens(data || []);
    } catch (error) {
      console.error(
        "Erro ao carregar insumos:",
        error
      );

      alert(
        error?.message ||
          "Erro ao carregar insumos."
      );

      setItens([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarInsumos();
  }, [carregarInsumos]);

  /*
   * CALCULA O ESTOQUE DE UM ITEM
   *
   * O campo estoque_atual é o valor mantido
   * pelo Supabase pelas movimentações de entrada
   * e saída.
   *
   * Caso estoque_atual não esteja disponível,
   * usamos o cálculo de segurança:
   *
   * estoque inicial + entradas - saídas
   */
  const calcularEstoque = useCallback(
    (item) => {
      if (!item) {
        return {
          estoqueInicial: 0,
          entradas: 0,
          saidas: 0,
          estoqueAtual: 0,
        };
      }

      const estoqueInicial = Number(
        item.estoque_inicial ?? 0
      );

      const entradas = Number(
        item.entradas ??
          item.total_entradas ??
          0
      );

      const saidas = Number(
        item.saidas ??
          item.total_saidas ??
          0
      );

      /*
       * PRIMEIRA OPÇÃO:
       * usa diretamente o estoque atual
       * calculado/mantido pelo Supabase.
       */
      const estoqueAtualBanco =
        Number(item.estoque_atual);

      if (
        Number.isFinite(
          estoqueAtualBanco
        )
      ) {
        return {
          estoqueInicial,
          entradas,
          saidas,
          estoqueAtual:
            Math.max(
              0,
              estoqueAtualBanco
            ),
        };
      }

      /*
       * FALLBACK:
       * caso estoque_atual seja nulo,
       * calcula manualmente.
       */
      const estoqueAtual =
        estoqueInicial +
        entradas -
        saidas;

      return {
        estoqueInicial,
        entradas,
        saidas,
        estoqueAtual:
          Math.max(
            0,
            estoqueAtual
          ),
      };
    },
    []
  );

  /*
   * CARDS DE DESTAQUE
   *
   * Cada card procura seu próprio ID:
   *
   * 005 = Etq Bancada Branca
   * 001 = Etq Bancada Color
   * 007 = Etq Gestão
   */
  const cardsInsumos = useMemo(() => {
    return INSUMOS_DESTAQUE.map(
      (insumo) => {
        const itemEncontrado =
          itens.find(
            (item) =>
              String(item.id)
                .trim()
                .toLowerCase() ===
              String(insumo.id)
                .trim()
                .toLowerCase()
          );

        const estoque =
          calcularEstoque(
            itemEncontrado
          );

        console.log(
          `CARD ${insumo.id}:`,
          {
            itemEncontrado,
            estoqueAtualBanco:
              itemEncontrado?.estoque_atual,
            estoque,
          }
        );

        return {
          ...insumo,
          valor: estoque.estoqueAtual,
        };
      }
    );
  }, [itens, calcularEstoque]);

  /*
   * FILTRO
   */
  const itensFiltrados = useMemo(() => {
    const termo =
      busca.toLowerCase().trim();

    if (!termo) {
      return itens;
    }

    return itens.filter(
      (item) =>
        `${item.id} ${item.descricao}`
          .toLowerCase()
          .includes(termo)
    );
  }, [itens, busca]);

  /*
   * PAGINAÇÃO
   */
  const totalPaginas = Math.max(
    1,
    Math.ceil(
      itensFiltrados.length /
        ITENS_POR_PAGINA
    )
  );

  useEffect(() => {
    if (
      paginaAtual >
      totalPaginas
    ) {
      setPaginaAtual(
        totalPaginas
      );
    }
  }, [
    paginaAtual,
    totalPaginas,
  ]);

  const itensPagina = useMemo(() => {
    const inicio =
      (paginaAtual - 1) *
      ITENS_POR_PAGINA;

    return itensFiltrados.slice(
      inicio,
      inicio + ITENS_POR_PAGINA
    );
  }, [
    itensFiltrados,
    paginaAtual,
  ]);

  /*
   * NOVO ITEM
   */
  const abrirNovoItem = () => {
    setItemEditando(null);

    setForm({
      id: "",
      descricao: "",
      estoqueInicial: "",
    });

    setModalAberto(true);
  };

  /*
   * EDITAR ITEM
   */
  const abrirEdicao = (item) => {
    setItemEditando(item);

    setForm({
      id: item.id,
      descricao: item.descricao,
      estoqueInicial: String(
        item.estoque_inicial ?? 0
      ),
    });

    setModalAberto(true);
  };

  /*
   * FECHAR MODAL
   */
  const fecharModal = () => {
    setModalAberto(false);
    setItemEditando(null);
  };

  /*
   * ALTERAÇÃO DOS CAMPOS
   */
  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /*
   * SALVAR ITEM
   */
  const salvarItem = async (event) => {
    event.preventDefault();

    const id = form.id.trim();
    const descricao =
      form.descricao.trim();

    const estoqueInicial =
      Number(form.estoqueInicial);

    if (!id || !descricao) {
      alert(
        "Preencha todos os campos."
      );
      return;
    }

    if (
      !Number.isFinite(
        estoqueInicial
      ) ||
      estoqueInicial < 0
    ) {
      alert(
        "Informe um estoque inicial válido."
      );
      return;
    }

    if (itemEditando) {
      const { error } =
        await supabase
          .from("insumos")
          .update({
            descricao,
            estoque_inicial:
              estoqueInicial,
          })
          .eq(
            "id",
            itemEditando.id
          );

      if (error) {
        console.error(
          "Erro ao atualizar insumo:",
          error
        );

        alert(
          "Erro ao atualizar o insumo."
        );

        return;
      }
    } else {
      const {
        data: existente,
        error: consultaError,
      } = await supabase
        .from("insumos")
        .select("id")
        .eq("id", id)
        .maybeSingle();

      if (consultaError) {
        console.error(
          consultaError
        );

        alert(
          "Erro ao verificar o ID."
        );

        return;
      }

      if (existente) {
        alert(
          "Já existe um insumo com esse ID."
        );

        return;
      }

      const { error } =
        await supabase
          .from("insumos")
          .insert({
            id,
            descricao,
            estoque_inicial:
              estoqueInicial,
          });

      if (error) {
        console.error(
          "Erro Supabase ao cadastrar insumo:",
          error
        );

        alert(
          `Erro ao cadastrar o insumo:\n\n${
            error.message ||
            "Erro desconhecido"
          }`
        );

        return;
      }
    }

    await carregarInsumos();
    fecharModal();
  };

  /*
   * EXCLUIR ITEM
   */
  const excluirItem = async (
    item
  ) => {
    const confirmar =
      window.confirm(
        `Deseja excluir o insumo "${item.descricao}"?`
      );

    if (!confirmar) {
      return;
    }

    const { error } =
      await supabase
        .from("insumos")
        .delete()
        .eq("id", item.id);

    if (error) {
      console.error(error);

      alert(
        "Não foi possível excluir. Verifique se existem movimentações vinculadas a este insumo."
      );

      return;
    }

    await carregarInsumos();
  };

  /*
   * PAGINAÇÃO
   */
  const mudarPagina = (
    pagina
  ) => {
    if (
      pagina >= 1 &&
      pagina <= totalPaginas
    ) {
      setPaginaAtual(pagina);
    }
  };

  /*
   * BUSCA
   */
  const handleBusca = (
    event
  ) => {
    setBusca(
      event.target.value
    );

    setPaginaAtual(1);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Insumos</h2>

          <p>
            Cadastre e acompanhe os
            materiais disponíveis no
            estoque.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={
            abrirNovoItem
          }
        >
          + Novo insumo
        </button>
      </div>

      {/* CARDS */}
      <div className="stats-grid">
        {cardsInsumos.map(
          (item) => (
            <div
              className="stat-card"
              key={item.id}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "flex-start",
                }}
              >
                <div>
                  <div className="stat-label">
                    {item.titulo}
                  </div>

                  <div className="stat-value">
                    {loading
                      ? "..."
                      : item.valor.toLocaleString(
                          "pt-BR"
                        )}
                  </div>

                  <div className="stat-description">
                    {item.descricao}
                  </div>
                </div>

                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    background:
                      "#fff8b8",
                    borderRadius:
                      "10px",
                    fontSize:
                      "18px",
                  }}
                >
                  {item.icone}
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* BUSCA */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <span className="search-icon">
              🔎
            </span>

            <input
              type="text"
              placeholder="Buscar por ID ou descrição..."
              value={busca}
              onChange={
                handleBusca
              }
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
            {
              itensFiltrados.length
            }{" "}
            item(ns)
          </span>
        </div>
      </div>

      {/* TABELA */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID do item</th>
                <th>Descrição</th>
                <th>
                  Estoque inicial
                </th>
                <th>Entradas</th>
                <th>Saídas</th>
                <th>
                  Estoque atual
                </th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      textAlign:
                        "center",
                      padding:
                        "2rem",
                    }}
                  >
                    Carregando
                    insumos...
                  </td>
                </tr>
              ) : itensPagina.length ===
                0 ? (
                <tr>
                  <td colSpan="8">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        📦
                      </div>

                      <h3>
                        {busca
                          ? "Nenhum item encontrado"
                          : "Nenhum insumo cadastrado"}
                      </h3>

                      <p>
                        {busca
                          ? "Tente outro termo de pesquisa."
                          : "Clique em “Novo insumo” para começar."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                itensPagina.map(
                  (item) => {
                    const estoque =
                      calcularEstoque(
                        item
                      );

                    const estoqueBaixo =
                      estoque.estoqueAtual >
                        0 &&
                      estoque.estoqueAtual <=
                        10;

                    const estoqueZerado =
                      estoque.estoqueAtual <=
                      0;

                    return (
                      <tr
                        key={
                          item.id
                        }
                      >
                        <td>
                          <strong>
                            {
                              item.id
                            }
                          </strong>
                        </td>

                        <td>
                          {
                            item.descricao
                          }
                        </td>

                        <td>
                          {
                            estoque.estoqueInicial
                          }
                        </td>

                        <td>
                          <span className="badge badge-success">
                            +
                            {
                              estoque.entradas
                            }
                          </span>
                        </td>

                        <td>
                          <span className="badge badge-danger">
                            -
                            {
                              estoque.saidas
                            }
                          </span>
                        </td>

                        <td>
                          <strong>
                            {
                              estoque.estoqueAtual
                            }
                          </strong>
                        </td>

                        <td>
                          {estoqueZerado ? (
                            <span className="badge badge-danger">
                              Sem
                              estoque
                            </span>
                          ) : estoqueBaixo ? (
                            <span className="badge badge-warning">
                              Estoque
                              baixo
                            </span>
                          ) : (
                            <span className="badge badge-success">
                              Normal
                            </span>
                          )}
                        </td>

                        <td>
                          <div className="action-buttons">
                            <button
                              className="icon-button"
                              title="Editar"
                              onClick={() =>
                                abrirEdicao(
                                  item
                                )
                              }
                            >
                              ✏️
                            </button>

                            <button
                              className="icon-button danger"
                              title="Excluir"
                              onClick={() =>
                                excluirItem(
                                  item
                                )
                              }
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINAÇÃO */}
        <div className="pagination">
          <span className="pagination-info">
            {itensFiltrados.length ===
            0
              ? "0 registros"
              : `Página ${paginaAtual} de ${totalPaginas}`}
          </span>

          <div className="pagination-buttons">
            <button
              className="pagination-button"
              disabled={
                paginaAtual ===
                1
              }
              onClick={() =>
                mudarPagina(
                  paginaAtual -
                    1
                )
              }
            >
              ‹
            </button>

            {Array.from(
              {
                length:
                  totalPaginas,
              },
              (
                _,
                index
              ) =>
                index + 1
            )
              .filter(
                (pagina) => {
                  if (
                    totalPaginas <=
                    5
                  ) {
                    return true;
                  }

                  return (
                    pagina ===
                      1 ||
                    pagina ===
                      totalPaginas ||
                    Math.abs(
                      pagina -
                        paginaAtual
                    ) <= 1
                  );
                }
              )
              .map(
                (
                  pagina,
                  index,
                  paginasVisiveis
                ) => {
                  const anterior =
                    paginasVisiveis[
                      index -
                        1
                    ];

                  return (
                    <span
                      key={
                        pagina
                      }
                    >
                      {anterior &&
                        pagina -
                          anterior >
                          1 && (
                          <span
                            style={{
                              margin:
                                "0 4px",
                              color:
                                "#888",
                            }}
                          >
                            ...
                          </span>
                        )}

                      <button
                        className={`pagination-button ${
                          paginaAtual ===
                          pagina
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          mudarPagina(
                            pagina
                          )
                        }
                      >
                        {
                          pagina
                        }
                      </button>
                    </span>
                  );
                }
              )}

            <button
              className="pagination-button"
              disabled={
                paginaAtual ===
                totalPaginas
              }
              onClick={() =>
                mudarPagina(
                  paginaAtual +
                    1
                )
              }
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modalAberto && (
        <div
          className="modal-overlay"
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              fecharModal();
            }
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <h3>
                {itemEditando
                  ? "Editar insumo"
                  : "Novo insumo"}
              </h3>

              <button
                className="modal-close"
                onClick={
                  fecharModal
                }
                type="button"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <form
                onSubmit={
                  salvarItem
                }
              >
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      ID do item *
                    </label>

                    <input
                      name="id"
                      type="text"
                      className="form-control"
                      placeholder="Ex.: ITEM001"
                      value={
                        form.id
                      }
                      onChange={
                        handleChange
                      }
                      disabled={Boolean(
                        itemEditando
                      )}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Descrição *
                    </label>

                    <input
                      name="descricao"
                      type="text"
                      className="form-control"
                      placeholder="Descrição do insumo"
                      value={
                        form.descricao
                      }
                      onChange={
                        handleChange
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Estoque inicial *
                    </label>

                    <input
                      name="estoqueInicial"
                      type="number"
                      min="0"
                      step="1"
                      className="form-control"
                      value={
                        form.estoqueInicial
                      }
                      onChange={
                        handleChange
                      }
                      required
                    />
                  </div>
                </div>

                <div
                  className="alert alert-warning"
                  style={{
                    marginTop:
                      "18px",
                  }}
                >
                  <span>
                    💡
                  </span>

                  <div>
                    <strong>
                      Controle
                      automático
                    </strong>

                    <p
                      style={{
                        marginTop:
                          "4px",
                      }}
                    >
                      O estoque
                      atual é
                      calculado
                      com base no
                      estoque
                      inicial,
                      entradas e
                      saídas.
                    </p>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={
                      fecharModal
                    }
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {itemEditando
                      ? "Salvar alterações"
                      : "Cadastrar insumo"}
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

export default Insumos;
