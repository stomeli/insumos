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
