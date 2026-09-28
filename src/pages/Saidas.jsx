import { useState, useEffect } from "react";
import { supabase } from "../supabase.js"; // Certifique-se de ajustar o caminho da sua instância do Supabase

function Saidas() {
  const agora = new Date();
  const dataAtual = agora.toISOString().split("T")[0];
  const horaAtual = agora.toTimeString().slice(0, 5);

  const [form, setForm] = useState({
    data: dataAtual,
    hora: horaAtual,
    liderId: "",
    colaboradorId: "",
    itemId: "",
    quantidade: "",
  });

  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados para dados do Supabase
  const [insumos, setInsumos] = useState([]);
  const [lideres, setLideres] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);

  // Busca inicial dos dados nas tabelas do Supabase
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [insumosRes, lideresRes, colaboradoresRes] = await Promise.all([
        supabase.from("insumos").select("*"),
        supabase.from("lideres").select("*"),
        supabase.from("colaboradores").select("*"),
      ]);

      if (insumosRes.error) throw insumosRes.error;
      if (lideresRes.error) throw lideresRes.error;
      if (colaboradoresRes.error) throw colaboradoresRes.error;

      setInsumos(insumosRes.data || []);
      setLideres(lideresRes.data || []);
      setColaboradores(colaboradoresRes.data || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setMensagem("Erro ao carregar informações do banco de dados.");
    }
  };

  const itemSelecionado = insumos.find(
    (item) => String(item.id) === String(form.itemId)
  );

  const liderSelecionado = lideres.find(
    (lider) => String(lider.id) === String(form.liderId)
  );

  const colaboradorSelecionado = colaboradores.find(
    (colaborador) => String(colaborador.id) === String(form.colaboradorId)
  );

  const estoqueAtual = Number(
    itemSelecionado?.estoque_atual ??
      itemSelecionado?.estoque_inicial ??
      0
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMensagem("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.data ||
      !form.hora ||
      !form.liderId ||
      !form.colaboradorId ||
      !form.itemId ||
      !form.quantidade
    ) {
      setMensagem("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!liderSelecionado) {
      setMensagem("O ID do líder não foi encontrado no cadastro.");
      return;
    }

    if (!colaboradorSelecionado) {
      setMensagem("O ID do colaborador não foi encontrado no cadastro.");
      return;
    }

    if (!itemSelecionado) {
      setMensagem("O ID do item não foi encontrado no cadastro.");
      return;
    }

    const quantidade = Number(form.quantidade);

    if (quantidade <= 0) {
      setMensagem("A quantidade deve ser maior que zero.");
      return;
    }

    if (quantidade > estoqueAtual) {
      setMensagem(`Estoque insuficiente. Estoque atual: ${estoqueAtual}.`);
      return;
    }

    setLoading(true);

    try {
      // 1. Registra a nova saída no Supabase
      const novaSaida = {
        data: form.data,
        hora: form.hora,
        lider_id: form.liderId,
        lider_nome: liderSelecionado.nome,
        colaborador_id: form.colaboradorId,
        colaborador_nome: colaboradorSelecionado.nome,
        item_id: form.itemId,
        descricao: itemSelecionado.descricao,
        quantidade,
      };

      const { error: saidaError } = await supabase
        .from("saidas")
        .insert([novaSaida]);

      if (saidaError) throw saidaError;

      // 2. Atualiza o estoque no Supabase
      const novoTotalSaidas =
        Number(itemSelecionado.total_saidas || 0) + quantidade;
      const novoEstoqueAtual = estoqueAtual - quantidade;

      const { error: insumoError } = await supabase
        .from("insumos")
        .update({
          total_saidas: novoTotalSaidas,
          estoque_atual: novoEstoqueAtual,
        })
        .eq("id", form.itemId);

      if (insumoError) throw insumoError;

      setMensagem("Saída registrada com sucesso.");

      // Recarrega os dados atualizados do banco
      await carregarDados();

      // Limpa formulário
      limparFormulario();
    } catch (error) {
      console.error("Erro ao registrar saída:", error);
      setMensagem("Ocorreu um erro ao registrar a saída. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const limparFormulario = () => {
    const agoraAtualizado = new Date();

    setForm({
      data: agoraAtualizado.toISOString().split("T")[0],
      hora: agoraAtualizado.toTimeString().slice(0, 5),
      liderId: "",
      colaboradorId: "",
      itemId: "",
      quantidade: "",
    });

    setMensagem("");
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Saída de insumos</h2>
          <p>Registre a retirada de materiais do estoque.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h3>Nova saída</h3>
          </div>
          <span className="badge badge-danger">Saída</span>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="data">
                  Data *
                </label>
                <input
                  id="data"
                  name="data"
                  type="date"
                  className="form-control"
                  value={form.data}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="hora">
                  Hora *
                </label>
                <input
                  id="hora"
                  name="hora"
                  type="time"
                  className="form-control"
                  value={form.hora}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="liderId">
                  ID do líder *
                </label>
                <input
                  id="liderId"
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

              <div className="form-group">
                <label className="form-label" htmlFor="colaboradorId">
                  ID do colaborador *
                </label>
                <input
                  id="colaboradorId"
                  name="colaboradorId"
                  type="text"
                  className="form-control"
                  placeholder="Digite o ID do colaborador"
                  value={form.colaboradorId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nome do colaborador</label>
                <input
                  type="text"
                  className="form-control"
                  value={colaboradorSelecionado?.nome || ""}
                  placeholder="Nome automático"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="itemId">
                  ID do item *
                </label>
                <input
                  id="itemId"
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
                <label className="form-label">Descrição do item</label>
                <input
                  type="text"
                  className="form-control"
                  value={itemSelecionado?.descricao || ""}
                  placeholder="Descrição automática"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="quantidade">
                  Quantidade *
                </label>
                <input
                  id="quantidade"
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

              {itemSelecionado && (
                <div className="form-group">
                  <label className="form-label">Estoque disponível</label>
                  <input
                    type="text"
                    className="form-control"
                    value={estoqueAtual}
                    readOnly
                  />
                </div>
              )}
            </div>

            {mensagem && (
              <div
                className={
                  mensagem.includes("sucesso")
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
                className="btn btn-danger"
                disabled={loading}
              >
                {loading ? "Salvando..." : "📤 Registrar saída"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card" style={{ marginTop: "18px" }}>
        <div className="card-body">
          <div className="alert alert-warning">
            <span>⚠️</span>
            <div>
              <strong>Controle de estoque</strong>
              <p style={{ marginTop: "4px" }}>
                O sistema verifica o estoque disponível antes de registrar a
                retirada.
              </p>
              <p style={{ marginTop: "5px" }}>
                A descrição do item, o nome do colaborador e o nome do líder são
                preenchidos automaticamente pelos cadastros.
              </p>
              <p style={{ marginTop: "5px" }}>
                Não é permitido retirar uma quantidade maior que o estoque
                disponível.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Saidas;
