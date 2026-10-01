import { useMemo, useState, useEffect } from "react";
import { supabase } from "../supabase.js";

const ITENS_POR_PAGINA = 40;

function Lideres() {
  const [lideres, setLideres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);

  const [modalAberto, setModalAberto] = useState(false);
  const [liderEditando, setLiderEditando] = useState(null);

  const [form, setForm] = useState({
    id: "",
    nome: "",
  });

  const carregarLideres = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("lideres")
      .select("*")
      .order("nome", { ascending: true });

    if (error) {
      console.error(error);
      alert("Erro ao carregar líderes.");
      setLideres([]);
    } else {
      setLideres(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    carregarLideres();
  }, []);

  const lideresFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) return lideres;

    return lideres.filter((lider) =>
      `${lider.id} ${lider.nome}`.toLowerCase().includes(termo)
    );
  }, [lideres, busca]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(lideresFiltrados.length / ITENS_POR_PAGINA)
  );

  useEffect(() => {
    if (paginaAtual > totalPaginas) {
      setPaginaAtual(totalPaginas);
    }
  }, [paginaAtual, totalPaginas]);

  const lideresPagina = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;

    return lideresFiltrados.slice(
      inicio,
      inicio + ITENS_POR_PAGINA
    );
  }, [lideresFiltrados, paginaAtual]);

  const abrirNovo = () => {
    setLiderEditando(null);
    setForm({ id: "", nome: "" });
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

  const salvarLider = async (event) => {
    event.preventDefault();

    const id = form.id.trim();
    const nome = form.nome.trim();

    if (!id || !nome) {
      alert("Preencha todos os campos.");
      return;
    }

    if (liderEditando) {
      const { error } = await supabase
        .from("lideres")
        .update({ nome })
        .eq("id", liderEditando.id);

      if (error) {
        console.error(error);
        alert("Erro ao atualizar líder.");
        return;
      }
    } else {
      const { data: existente, error: consultaError } = await supabase
        .from("lideres")
        .select("id")
        .eq("id", id)
        .maybeSingle();

      if (consultaError) {
        console.error(consultaError);
        alert("Erro ao verificar ID.");
        return;
      }

      if (existente) {
        alert("Já existe um líder com este ID.");
        return;
      }

      const { error } = await supabase
        .from("lideres")
        .insert({ id, nome });

      if (error) {
        console.error(error);
        alert("Erro ao cadastrar líder.");
        return;
      }
    }

    await carregarLideres();
    fecharModal();
  };

  const excluirLider = async (lider) => {
    const confirmar = window.confirm(
      `Deseja excluir o líder "${lider.nome}"?`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("lideres")
      .delete()
      .eq("id", lider.id);

    if (error) {
      console.error(error);
      alert(
        "Não foi possível excluir este líder. Existem movimentações vinculadas a ele."
      );
      return;
    }

    await carregarLideres();
  };

  const handleBusca = (event) => {
    setBusca(event.target.value);
    setPaginaAtual(1);
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
          <span style={{ color: "#666", fontSize: "11px" }}>
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
              {loading ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center", padding: "2rem" }}>
                    Carregando líderes...
                  </td>
                </tr>
              ) : lideresPagina.length === 0 ? (
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
                          ? "Tente outro termo."
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
                if (totalPaginas <= 5) return true;

                return (
                  pagina === 1 ||
                  pagina === totalPaginas ||
                  Math.abs(pagina - paginaAtual) <= 1
                );
              })
              .map((pagina, index, paginasVisiveis) => {
                const anterior = paginasVisiveis[index - 1];

                return (
                  <span key={pagina}>
                    {anterior && pagina - anterior > 1 && (
                      <span style={{ margin: "0 4px", color: "#888" }}>
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
              <h3>{liderEditando ? "Editar líder" : "Novo líder"}</h3>

              <button
                className="modal-close"
                onClick={fecharModal}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={salvarLider}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      ID do líder *
                    </label>

                    <input
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
3. Colaboradores.jsx
Como você disse que o colaborador participa da saída, ele precisa ter cadastro próprio no banco e na interface.

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
4. Entradas.jsx
Aqui a entrada usa RPC, então o registro e a atualização do estoque acontecem juntos no banco.

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase.js";

function Entradas() {
  const hoje = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    data: hoje,
    itemId: "",
    quantidade: "",
    liderId: "",
  });

  const [insumos, setInsumos] = useState([]);
  const [lideres, setLideres] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDados, setLoadingDados] = useState(true);

  const carregarDados = async () => {
    setLoadingDados(true);

    const [resInsumos, resLideres] = await Promise.all([
      supabase
        .from("insumos")
        .select("*")
        .order("descricao", { ascending: true }),

      supabase
        .from("lideres")
        .select("*")
        .order("nome", { ascending: true }),
    ]);

    if (resInsumos.error || resLideres.error) {
      console.error(resInsumos.error || resLideres.error);
      setMensagem("Erro ao carregar dados.");
    } else {
      setInsumos(resInsumos.data || []);
      setLideres(resLideres.data || []);
    }

    setLoadingDados(false);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const itemSelecionado = useMemo(
    () =>
      insumos.find(
        (item) =>
          String(item.id).toLowerCase() ===
          String(form.itemId).trim().toLowerCase()
      ),
    [insumos, form.itemId]
  );

  const liderSelecionado = useMemo(
    () =>
      lideres.find(
        (lider) =>
          String(lider.id).toLowerCase() ===
          String(form.liderId).trim().toLowerCase()
      ),
    [lideres, form.liderId]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMensagem("");
  };

  const limparFormulario = () => {
    setForm({
      data: new Date().toISOString().split("T")[0],
      itemId: "",
      quantidade: "",
      liderId: "",
    });

    setMensagem("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.data ||
      !form.itemId ||
      !form.quantidade ||
      !form.liderId
    ) {
      setMensagem("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!itemSelecionado) {
      setMensagem("O ID do item não foi encontrado.");
      return;
    }

    if (!liderSelecionado) {
      setMensagem("O ID do líder não foi encontrado.");
      return;
    }

    const quantidade = Number(form.quantidade);

    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      setMensagem("Informe uma quantidade inteira maior que zero.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.rpc("registrar_entrada", {
        p_data: form.data,
        p_item_id: itemSelecionado.id,
        p_quantidade: quantidade,
        p_lider_id: liderSelecionado.id,
      });

      if (error) throw error;

      setMensagem("Entrada registrada com sucesso!");

      await carregarDados();
      limparFormulario();
    } catch (error) {
      console.error(error);
      setMensagem(
        error?.message || "Erro ao registrar entrada."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Entrada de insumos</h2>
          <p>Registre a entrada de materiais no estoque.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h3>Nova entrada</h3>
          </div>

          <span className="badge badge-yellow">Entrada</span>
        </div>

        <div className="card-body">
          {loadingDados ? (
            <p>Carregando dados do banco...</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Data *</label>

                  <input
                    name="data"
                    type="date"
                    className="form-control"
                    value={form.data}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">ID do item *</label>

                  <input
                    name="itemId"
                    type="text"
                    className="form-control"
                    placeholder="Digite o ID do item"
                    value={form.itemId}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Descrição</label>

                  <input
                    type="text"
                    className="form-control"
                    value={itemSelecionado?.descricao || ""}
                    placeholder="Descrição automática"
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Quantidade *</label>

                  <input
                    name="quantidade"
                    type="number"
                    min="1"
                    step="1"
                    className="form-control"
                    placeholder="Informe a quantidade"
                    value={form.quantidade}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">ID do líder *</label>

                  <input
                    name="liderId"
                    type="text"
                    className="form-control"
                    placeholder="Digite o ID do líder"
                    value={form.liderId}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nome do líder</label>

                  <input
                    type="text"
                    className="form-control"
                    value={liderSelecionado?.nome || ""}
                    placeholder="Nome automático"
                    readOnly
                  />
                </div>
              </div>

              {mensagem && (
                <div
                  className={
                    mensagem.toLowerCase().includes("sucesso")
                      ? "alert alert-success"
                      : "alert alert-warning"
                  }
                  style={{ marginTop: "20px" }}
                >
                  {mensagem}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={limparFormulario}
                  disabled={loading}
                >
                  Limpar
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Salvando..." : "📥 Registrar entrada"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Entradas;
5. Saidas.jsx
Aqui está a parte importante: a saída exige líder + colaborador + insumo, e o banco faz a verificação do estoque.

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase.js";

function Saidas() {
  const agora = new Date();

  const [form, setForm] = useState({
    data: agora.toISOString().split("T")[0],
    hora: agora.toTimeString().slice(0, 5),
    liderId: "",
    colaboradorId: "",
    itemId: "",
    quantidade: "",
  });

  const [insumos, setInsumos] = useState([]);
  const [lideres, setLideres] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);

  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDados, setLoadingDados] = useState(true);

  const carregarDados = async () => {
    setLoadingDados(true);

    const [
      insumosRes,
      lideresRes,
      colaboradoresRes,
    ] = await Promise.all([
      supabase
        .from("insumos")
        .select("*")
        .order("descricao", { ascending: true }),

      supabase
        .from("lideres")
        .select("*")
        .order("nome", { ascending: true }),

      supabase
        .from("colaboradores")
        .select("*")
        .order("nome", { ascending: true }),
    ]);

    if (
      insumosRes.error ||
      lideresRes.error ||
      colaboradoresRes.error
    ) {
      console.error(
        insumosRes.error ||
          lideresRes.error ||
          colaboradoresRes.error
      );

      setMensagem("Erro ao carregar dados.");
    } else {
      setInsumos(insumosRes.data || []);
      setLideres(lideresRes.data || []);
      setColaboradores(colaboradoresRes.data || []);
    }

    setLoadingDados(false);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const itemSelecionado = useMemo(
    () =>
      insumos.find(
        (item) =>
          String(item.id).toLowerCase() ===
          String(form.itemId).trim().toLowerCase()
      ),
    [insumos, form.itemId]
  );

  const liderSelecionado = useMemo(
    () =>
      lideres.find(
        (lider) =>
          String(lider.id).toLowerCase() ===
          String(form.liderId).trim().toLowerCase()
      ),
    [lideres, form.liderId]
  );

  const colaboradorSelecionado = useMemo(
    () =>
      colaboradores.find(
        (colaborador) =>
          String(colaborador.id).toLowerCase() ===
          String(form.colaboradorId).trim().toLowerCase()
      ),
    [colaboradores, form.colaboradorId]
  );

  const estoqueAtual = Number(
    itemSelecionado?.estoque_atual || 0
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMensagem("");
  };

  const limparFormulario = () => {
    const agoraAtualizado = new Date();

    setForm({
      data: agoraAtualizado.toISOString().split("T")[0],
      hora: agoraAtualizado.toTimeString().slice(0, 5),
      liderId: "",
      colaboradorId:
