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
      colaboradorId: "",
      itemId: "",
      quantidade: "",
    });

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
    setMensagem("O ID do líder não foi encontrado.");
    return;
  }

  if (!colaboradorSelecionado) {
    setMensagem("O ID do colaborador não foi encontrado.");
    return;
  }

  if (!itemSelecionado) {
    setMensagem("O ID do item não foi encontrado.");
    return;
  }

  const quantidade = Number(form.quantidade);

  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    setMensagem("Informe uma quantidade inteira maior que zero.");
    return;
  }

  const estoqueAtual = Number(itemSelecionado.estoque_atual || 0);

  if (quantidade > estoqueAtual) {
    setMensagem(
      `Estoque insuficiente. Estoque atual: ${estoqueAtual}.`
    );
    return;
  }

  setLoading(true);

  try {
    const { error } = await supabase.rpc("registrar_saida", {
      p_item_id: String(itemSelecionado.id),
      p_quantidade: quantidade,
      p_lider_id: String(liderSelecionado.id),
      p_colaborador_id: String(colaboradorSelecionado.id),
      p_data: form.data,
      p_hora: form.hora,
    });

    if (error) {
      throw error;
    }

    setMensagem("Saída registrada com sucesso.");

    await carregarDados();
    limparFormulario();
  } catch (error) {
    console.error("Erro ao registrar saída:", error);

    setMensagem(
      error?.message || "Erro ao registrar saída."
    );
  } finally {
    setLoading(false);
  }
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
                  <label className="form-label">Hora *</label>

                  <input
                    name="hora"
                    type="time"
                    className="form-control"
                    value={form.hora}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    ID do líder *
                  </label>

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
                  <label className="form-label">
                    Nome do líder
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={liderSelecionado?.nome || ""}
                    placeholder="Nome automático"
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    ID do colaborador *
                  </label>

                  <input
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
                  <label className="form-label">
                    Nome do colaborador
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={colaboradorSelecionado?.nome || ""}
                    placeholder="Nome automático"
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    ID do item *
                  </label>

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
                  <label className="form-label">
                    Descrição do item
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={itemSelecionado?.descricao || ""}
                    placeholder="Descrição automática"
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Quantidade *
                  </label>

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

                {itemSelecionado && (
                  <div className="form-group">
                    <label className="form-label">
                      Estoque disponível
                    </label>

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
                  className="btn btn-danger"
                  disabled={loading}
                >
                  {loading ? "Salvando..." : "📤 Registrar saída"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Saidas;
