import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "../supabase.js";

function Saidas() {
  const criarDataHoraAtual = () => {
    const agora = new Date();

    return {
      data: agora.toISOString().split("T")[0],
      hora: agora.toTimeString().slice(0, 5),
    };
  };

  const dataHoraInicial = criarDataHoraAtual();

  const [form, setForm] = useState({
    data: dataHoraInicial.data,
    hora: dataHoraInicial.hora,
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

  const carregarDados = useCallback(async () => {
    setLoadingDados(true);

    try {
      const [
        insumosRes,
        lideresRes,
        colaboradoresRes,
      ] = await Promise.all([
        supabase
          .from("insumos")
          .select(
            "id, descricao, estoque_inicial, entradas, saidas, estoque_atual, total_entradas, total_saidas"
          )
          .order("descricao", {
            ascending: true,
          }),

        supabase
          .from("lideres")
          .select("id, nome")
          .order("nome", {
            ascending: true,
          }),

        supabase
          .from("colaboradores")
          .select("id, nome")
          .order("nome", {
            ascending: true,
          }),
      ]);

      if (insumosRes.error) {
        throw insumosRes.error;
      }

      if (lideresRes.error) {
        throw lideresRes.error;
      }

      if (colaboradoresRes.error) {
        throw colaboradoresRes.error;
      }

      setInsumos(insumosRes.data || []);
      setLideres(lideresRes.data || []);
      setColaboradores(
        colaboradoresRes.data || []
      );
    } catch (error) {
      console.error(
        "Erro ao carregar dados:",
        error
      );

      setMensagem(
        error?.message ||
          "Erro ao carregar dados."
      );

      setInsumos([]);
      setLideres([]);
      setColaboradores([]);
    } finally {
      setLoadingDados(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const itemSelecionado = useMemo(() => {
    const id = String(form.itemId)
      .trim()
      .toLowerCase();

    if (!id) {
      return null;
    }

    return (
      insumos.find(
        (item) =>
          String(item.id)
            .trim()
            .toLowerCase() === id
      ) || null
    );
  }, [insumos, form.itemId]);

  const liderSelecionado = useMemo(() => {
    const id = String(form.liderId)
      .trim()
      .toLowerCase();

    if (!id) {
      return null;
    }

    return (
      lideres.find(
        (lider) =>
          String(lider.id)
            .trim()
            .toLowerCase() === id
      ) || null
    );
  }, [lideres, form.liderId]);

  const colaboradorSelecionado = useMemo(() => {
    const id = String(form.colaboradorId)
      .trim()
      .toLowerCase();

    if (!id) {
      return null;
    }

    return (
      colaboradores.find(
        (colaborador) =>
          String(colaborador.id)
            .trim()
            .toLowerCase() === id
      ) || null
    );
  }, [
    colaboradores,
    form.colaboradorId,
  ]);

  const estoqueAtual = Number(
    itemSelecionado?.estoque_atual ?? 0
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
    const dataHora = criarDataHoraAtual();

    setForm({
      data: dataHora.data,
      hora: dataHora.hora,
      liderId: "",
      colaboradorId: "",
      itemId: "",
      quantidade: "",
    });

    setMensagem("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMensagem("");

    const data = String(form.data).trim();
    const hora = String(form.hora).trim();
    const liderId = String(form.liderId).trim();
    const colaboradorId = String(
      form.colaboradorId
    ).trim();
    const itemId = String(form.itemId).trim();

    if (
      !data ||
      !hora ||
      !liderId ||
      !colaboradorId ||
      !itemId ||
      form.quantidade === ""
    ) {
      setMensagem(
        "Preencha todos os campos obrigatórios."
      );
      return;
    }

    if (!liderSelecionado) {
      setMensagem(
        `O ID do líder "${liderId}" não foi encontrado.`
      );
      return;
    }

    if (!colaboradorSelecionado) {
      setMensagem(
        `O ID do colaborador "${colaboradorId}" não foi encontrado.`
      );
      return;
    }

    if (!itemSelecionado) {
      setMensagem(
        `O ID do item "${itemId}" não foi encontrado.`
      );
      return;
    }

    const quantidade = Number(
      form.quantidade
    );

    if (
      !Number.isInteger(quantidade) ||
      quantidade <= 0
    ) {
      setMensagem(
        "Informe uma quantidade inteira maior que zero."
      );
      return;
    }

    const estoque = Number(
      itemSelecionado.estoque_atual ?? 0
    );

    if (quantidade > estoque) {
      setMensagem(
        `Estoque insuficiente. Estoque atual: ${estoque}.`
      );
      return;
    }

    setLoading(true);

    try {
      /*
       * IMPORTANTE:
       * Os IDs são enviados como TEXT.
       * Isso corresponde à função:
       *
       * registrar_saida(
       *   text,
       *   numeric,
       *   text,
       *   text,
       *   date,
       *   time
       * )
       */

      const { data: resultado, error } =
        await supabase.rpc(
          "registrar_saida",
          {
            p_item_id: itemId,
            p_quantidade: quantidade,
            p_lider_id: liderId,
            p_colaborador_id:
              colaboradorId,
            p_data: data,
            p_hora: hora,
          }
        );

      if (error) {
        console.error(
          "Erro retornado pelo Supabase:",
          error
        );

        throw error;
      }

      console.log(
        "Saída registrada:",
        resultado
      );

      setMensagem(
        "Saída registrada com sucesso."
      );

      await carregarDados();

      limparFormulario();
    } catch (error) {
      console.error(
        "Erro ao registrar saída:",
        error
      );

      setMensagem(
        error?.message ||
          "Erro ao registrar saída."
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

          <p>
            Registre a retirada de materiais do
            estoque.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h3>Nova saída</h3>
          </div>

          <span className="badge badge-danger">
            Saída
          </span>
        </div>

        <div className="card-body">
          {loadingDados ? (
            <p>
              Carregando dados do banco...
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
            >
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Data *
                  </label>

                  <input
                    name="data"
                    type="date"
                    className="form-control"
                    value={form.data}
                    onChange={
                      handleChange
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Hora *
                  </label>

                  <input
                    name="hora"
                    type="time"
                    className="form-control"
                    value={form.hora}
                    onChange={
                      handleChange
                    }
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
                    onChange={
                      handleChange
                    }
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
                    value={
                      liderSelecionado?.nome ||
                      ""
                    }
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
                    value={
                      form.colaboradorId
                    }
                    onChange={
                      handleChange
                    }
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
                    value={
                      colaboradorSelecionado?.nome ||
                      ""
                    }
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
                    onChange={
                      handleChange
                    }
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
                    value={
                      itemSelecionado?.descricao ||
                      ""
                    }
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
                    value={
                      form.quantidade
                    }
                    onChange={
                      handleChange
                    }
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
                      value={
                        estoqueAtual
                      }
                      readOnly
                    />
                  </div>
                )}
              </div>

              {mensagem && (
                <div
                  className={
                    mensagem
                      .toLowerCase()
                      .includes(
                        "sucesso"
                      )
                      ? "alert alert-success"
                      : "alert alert-warning"
                  }
                  style={{
                    marginTop: "20px",
                  }}
                >
                  {mensagem}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={
                    limparFormulario
                  }
                  disabled={loading}
                >
                  Limpar
                </button>

                <button
                  type="submit"
                  className="btn btn-danger"
                  disabled={loading}
                >
                  {loading
                    ? "Salvando..."
                    : "📤 Registrar saída"}
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
