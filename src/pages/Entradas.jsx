import { useState, useEffect, useMemo } from "react";
import { supabase } from "../supabase"; // Ajuste o caminho do seu cliente Supabase

function Entradas() {
  const [form, setForm] = useState({
    data: new Date().toISOString().split("T")[0],
    itemId: "",
    quantidade: "",
    liderId: "",
  });

  const [insumos, setInsumos] = useState([]);
  const [lideres, setLideres] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDados, setLoadingDados] = useState(true);

  // Carrega os insumos e líderes do Supabase ao montar o componente
  useEffect(() => {
    async function carregarDados() {
      try {
        setLoadingDados(true);

        const [resInsumos, resLideres] = await Promise.all([
          supabase.from("insumos").select("*"),
          supabase.from("lideres").select("*"),
        ]);

        if (resInsumos.error) throw resInsumos.error;
        if (resLideres.error) throw resLideres.error;

        setInsumos(resInsumos.data || []);
        setLideres(resLideres.data || []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setMensagem("Erro ao carregar insumos e líderes do banco de dados.");
      } finally {
        setLoadingDados(false);
      }
    }

    carregarDados();
  }, []);

  // Busca insensível a maiúsculas/minúsculas
  const itemSelecionado = useMemo(() => {
    if (!form.itemId) return null;
    return insumos.find(
      (item) =>
        String(item.id).trim().toLowerCase() ===
        String(form.itemId).trim().toLowerCase()
    );
  }, [insumos, form.itemId]);

  const liderSelecionado = useMemo(() => {
    if (!form.liderId) return null;
    return lideres.find(
      (lider) =>
        String(lider.id).trim().toLowerCase() ===
        String(form.liderId).trim().toLowerCase()
    );
  }, [lideres, form.liderId]);

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

    if (!form.data || !form.itemId || !form.quantidade || !form.liderId) {
      setMensagem("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!itemSelecionado) {
      setMensagem("O ID do item não foi encontrado no cadastro.");
      return;
    }

    if (!liderSelecionado) {
      setMensagem("O ID do líder não foi encontrado no cadastro.");
      return;
    }

    const quantidade = Number(form.quantidade);

    if (isNaN(quantidade) || quantidade <= 0) {
      setMensagem("Informe uma quantidade válida e maior que zero.");
      return;
    }

    try {
      setLoading(true);

      // 1. Salva a nova entrada na tabela 'entradas'
      const { error: errorEntrada } = await supabase.from("entradas").insert([
        {
          data: form.data,
          item_id: itemSelecionado.id,
          descricao: itemSelecionado.descricao,
          quantidade,
          lider_id: liderSelecionado.id,
          lider_nome: liderSelecionado.nome,
        },
      ]);

      if (errorEntrada) throw errorEntrada;

      // 2. Calcula e atualiza o estoque do insumo na tabela 'insumos'
      const estoqueAtual = Number(
        itemSelecionado.estoque_atual ?? itemSelecionado.estoque_inicial ?? 0
      );
      const totalEntradas =
        Number(itemSelecionado.total_entradas ?? 0) + quantidade;
      const novoEstoque = estoqueAtual + quantidade;

      const { error: errorInsumo } = await supabase
        .from("insumos")
        .update({
          total_entradas: totalEntradas,
          estoque_atual: novoEstoque,
        })
        .eq("id", itemSelecionado.id);

      if (errorInsumo) throw errorInsumo;

      // 3. Atualiza o estado local do insumo sem precisar recarregar tudo
      setInsumos((prev) =>
        prev.map((item) =>
          item.id === itemSelecionado.id
            ? { ...item, total_entradas: totalEntradas, estoque_atual: novoEstoque }
            : item
        )
      );

      setMensagem("Entrada registrada com sucesso!");

      // Limpa o formulário após registrar
      setForm({
        data: new Date().toISOString().split("T")[0],
        itemId: "",
        quantidade: "",
        liderId: "",
      });
    } catch (error) {
      console.error("Erro ao registrar entrada:", error);
      setMensagem("Erro ao registrar entrada no Supabase. Tente novamente.");
    } finally {
      setLoading(false);
    }
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

      <div className="card" style={{ marginTop: "18px" }}>
        <div className="card-body">
          <div className="alert alert-warning">
            <span>💡</span>

            <div>
              <strong>Como funciona</strong>

              <p style={{ marginTop: "4px" }}>
                Informe o ID do item e o sistema buscará automaticamente a
                descrição cadastrada.
              </p>

              <p style={{ marginTop: "5px" }}>
                O mesmo acontece com o ID do líder. Ao registrar a entrada, a
                quantidade é adicionada ao estoque atual no Supabase.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Entradas;
