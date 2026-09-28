import { useState } from "react";

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

const handleChange = (event) => {
const { name, value } = event.target;

```
setForm((prev) => ({
  ...prev,
  [name]: value,
}));
```

};

const handleSubmit = (event) => {
event.preventDefault();

```
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

setMensagem(
  "Saída preenchida. A gravação no banco será configurada na próxima etapa."
);
```

};

const limparFormulario = () => {
const agoraAtualizado = new Date();

```
setForm({
  data: agoraAtualizado.toISOString().split("T")[0],
  hora: agoraAtualizado.toTimeString().slice(0, 5),
  liderId: "",
  colaboradorId: "",
  itemId: "",
  quantidade: "",
});

setMensagem("");
```

};

return ( <div> <div className="page-header"> <div> <h2>Saída de insumos</h2>

```
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
          {/* Data */}
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

          {/* Hora */}
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

          {/* ID do líder */}
          <div className="form-group">
            <label className="form-label" htmlFor="liderId">
              ID do líder *
            </label>

            <input
              id="liderId"
              name="liderId"
              type="text"
              className="form-control"
              placeholder="Digite ou selecione o líder"
              value={form.liderId}
              onChange={handleChange}
              required
            />
          </div>

          {/* Nome do líder */}
          <div className="form-group">
            <label className="form-label">
              Nome do líder
            </label>

            <input
              type="text"
              className="form-control"
              value=""
              placeholder="Preenchido automaticamente pelo cadastro"
              readOnly
            />
          </div>

          {/* Colaborador */}
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
              placeholder="Digite ou selecione o colaborador"
              value={form.colaboradorId}
              onChange={handleChange}
              required
            />
          </div>

          {/* Nome do colaborador */}
          <div className="form-group">
            <label className="form-label">
              Nome do colaborador
            </label>

            <input
              type="text"
              className="form-control"
              value=""
              placeholder="Preenchido automaticamente pelo cadastro"
              readOnly
            />
          </div>

          {/* ID do item */}
          <div className="form-group">
            <label className="form-label" htmlFor="itemId">
              ID do item *
            </label>

            <input
              id="itemId"
              name="itemId"
              type="text"
              className="form-control"
              placeholder="Digite ou selecione o item"
              value={form.itemId}
              onChange={handleChange}
              required
            />
          </div>

          {/* Descrição */}
          <div className="form-group">
            <label className="form-label">
              Descrição do item
            </label>

            <input
              type="text"
              className="form-control"
              value=""
              placeholder="Preenchida automaticamente pelo cadastro"
              readOnly
            />
          </div>

          {/* Quantidade */}
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
              placeholder="Informe a quantidade retirada"
              value={form.quantidade}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {mensagem && (
          <div
            className={
              mensagem.includes("preenchida")
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

  {/* Informação sobre a saída */}
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
            Antes de registrar a saída, o sistema verificará
            o estoque disponível do item.
          </p>

          <p style={{ marginTop: "5px" }}>
            A descrição do item, o nome do colaborador e o
            nome do líder serão preenchidos automaticamente
            através dos respectivos cadastros.
          </p>

          <p style={{ marginTop: "5px" }}>
            Não será permitido retirar uma quantidade maior
            que o estoque disponível.
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
```

);
}

export default Saidas;
