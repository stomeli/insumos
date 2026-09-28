import { useState } from "react";
import { storage } from "../data/storage";

function Entradas() {
const [form, setForm] = useState({
data: new Date().toISOString().split("T")[0],
itemId: "",
quantidade: "",
liderId: "",
});

const [mensagem, setMensagem] = useState("");

const insumos = storage.getInsumos();
const lideres = storage.getLideres();

const itemSelecionado = insumos.find(
(item) => String(item.id) === String(form.itemId)
);

const liderSelecionado = lideres.find(
(lider) => String(lider.id) === String(form.liderId)
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
  !form.itemId ||
  !form.quantidade ||
  !form.liderId
) {
  setMensagem(
    "Preencha todos os campos obrigatórios."
  );
  return;
}

if (!itemSelecionado) {
  setMensagem(
    "O ID do item não foi encontrado no cadastro."
  );
  return;
}

if (!liderSelecionado) {
  setMensagem(
    "O ID do líder não foi encontrado no cadastro."
  );
  return;
}

const quantidade = Number(form.quantidade);

const entradas = storage.getEntradas();

const novaEntrada = {
  id: Date.now().toString(),
  data: form.data,
  itemId: form.itemId,
  descricao: itemSelecionado.descricao,
  quantidade,
  liderId: form.liderId,
  liderNome: liderSelecionado.nome,
  criadoEm: new Date().toISOString(),
};

storage.saveEntradas([
  ...entradas,
  novaEntrada,
]);

const insumosAtualizados = insumos.map((item) => {
  if (String(item.id) !== String(form.itemId)) {
    return item;
  }

  const estoqueAtual =
    Number(item.estoqueAtual ?? item.estoqueInicial ?? 0);

  const totalEntradas =
    Number(item.totalEntradas ?? 0) + quantidade;

  return {
    ...item,
    totalEntradas,
    estoqueAtual: estoqueAtual + quantidade,
  };
});

storage.saveInsumos(insumosAtualizados);

setMensagem(
  "Entrada registrada com sucesso."
);

setForm({
  data: new Date().toISOString().split("T")[0],
  itemId: "",
  quantidade: "",
  liderId: "",
});

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

      <p>
        Registre a entrada de materiais no estoque.
      </p>
    </div>
  </div>

  <div className="card">
    <div className="card-header">
      <div>
        <h3>Nova entrada</h3>
      </div>

      <span className="badge badge-yellow">
        Entrada
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
              Descrição
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
            className="btn btn-primary"
          >
            📥 Registrar entrada
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
        <span>💡</span>

        <div>
          <strong>Como funciona</strong>

          <p style={{ marginTop: "4px" }}>
            Informe o ID do item e o sistema buscará
            automaticamente a descrição cadastrada.
          </p>

          <p style={{ marginTop: "5px" }}>
            O mesmo acontece com o ID do líder.
            Ao registrar a entrada, a quantidade é
            adicionada ao estoque atual.
          </p>
        </div>
      </div>
    </div>
  </div>
</div>

);
}

export default Entradas;
