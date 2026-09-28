import { useState } from "react";
import { storage } from "../data/storage";

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

const insumos = storage.getInsumos();
const lideres = storage.getLideres();
const colaboradores = storage.getColaboradores();

const itemSelecionado = insumos.find(
(item) => String(item.id) === String(form.itemId)
);

const liderSelecionado = lideres.find(
(lider) => String(lider.id) === String(form.liderId)
);

const colaboradorSelecionado = colaboradores.find(
(colaborador) =>
String(colaborador.id) === String(form.colaboradorId)
);

const estoqueAtual = Number(
itemSelecionado?.estoqueAtual ??
itemSelecionado?.estoqueInicial ??
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

const handleSubmit = (event) => {
event.preventDefault();

if (
  !form.data ||
  !form.hora ||
  !form.liderId ||
  !form.colaboradorId ||
  !form.itemId ||
  !form.quantidade
) {
  setMensagem(
    "Preencha todos os campos obrigatórios."
  );
  return;
}

if (!liderSelecionado) {
  setMensagem(
    "O ID do líder não foi encontrado no cadastro."
  );
  return;
}

if (!colaboradorSelecionado) {
  setMensagem(
    "O ID do colaborador não foi encontrado no cadastro."
  );
  return;
}

if (!itemSelecionado) {
  setMensagem(
    "O ID do item não foi encontrado no cadastro."
  );
  return;
}

const quantidade = Number(form.quantidade);

if (quantidade <= 0) {
  setMensagem(
    "A quantidade deve ser maior que zero."
  );
  return;
}

if (quantidade > estoqueAtual) {
  setMensagem(
    `Estoque insuficiente. Estoque atual: ${estoqueAtual}.`
  );
  return;
}

const saidas = storage.getSaidas();

const novaSaida = {
  id: Date.now().toString(),
  data: form.data,
  hora: form.hora,
  liderId: form.liderId,
  liderNome: liderSelecionado.nome,
  colaboradorId: form.colaboradorId,
  colaboradorNome: colaboradorSelecionado.nome,
  itemId: form.itemId,
  descricao: itemSelecionado.descricao,
  quantidade,
  criadoEm: new Date().toISOString(),
};

storage.saveSaidas([
  ...saidas,
  novaSaida,
]);

const insumosAtualizados = insumos.map((item) => {
  if (String(item.id) !== String(form.itemId)) {
    return item;
  }

  const estoque =
    Number(item.estoqueAtual ?? item.estoqueInicial ?? 0);

  const totalSaidas =
    Number(item.totalSaidas ?? 0) + quantidade;

  return {
    ...item,
    totalSaidas,
    estoqueAtual: estoque - quantidade,
  };
});

storage.saveInsumos(insumosAtualizados);

setMensagem(
  "Saída registrada com sucesso."
);

const agoraAtualizado = new Date();

setForm({
  data: agoraAtualizado.toISOString().split("T")[0],
  hora: agoraAtualizado.toTimeString().slice(0, 5),
  liderId: "",
  colaboradorId: "",
  itemId: "",
  quantidade: "",
});

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

      <p>
        Registre a retirada de materiais do estoque.
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
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label
              className="form-label"
              htmlFor="data"
            >
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
            <label
              className="form-label"
              htmlFor="hora"
            >
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
            <label
              className="form-label"
              htmlFor="liderId"
            >
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
            <label
              className="form-label"
              htmlFor="colaboradorId"
            >
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
            <label className="form-label">
              Nome do colaborador
            </label>

            <input
              type="text"
              className="form-control"
              value={
                colaboradorSelecionado?.nome || ""
              }
              placeholder="Nome automático"
              readOnly
            />
          </div>

          <div className="form-group">
            <label
              className="form-label"
              htmlFor="itemId"
            >
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
            <label className="form-label">
              Descrição do item
            </label>

            <input
              type="text"
              className="form-control"
              value={
                itemSelecionado?.descricao || ""
              }
              placeholder="Descrição automática"
              readOnly
            />
          </div>

          <div className="form-group">
            <label
              className="form-label"
              htmlFor="quantidade"
            >
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
          >
            Limpar
          </button>

          <button
            type="submit"
            className="btn btn-danger"
          >
            📤 Registrar saída
          </button>
        </div>
      </form>
    </div>
  </div>

  <div
    className="card"
    style={{ marginTop: "18px" }}
  >
    <div className="card-body">
      <div className="alert alert-warning">
        <span>⚠️</span>

        <div>
          <strong>Controle de estoque</strong>

          <p style={{ marginTop: "4px" }}>
            O sistema verifica o estoque disponível
            antes de registrar a retirada.
          </p>

          <p style={{ marginTop: "5px" }}>
            A descrição do item, o nome do colaborador
            e o nome do líder são preenchidos
            automaticamente pelos cadastros.
          </p>

          <p style={{ marginTop: "5px" }}>
            Não é permitido retirar uma quantidade
            maior que o estoque disponível.
          </p>
        </div>
      </div>
    </div>
  </div>
</div>

);
}

export default Saidas;
