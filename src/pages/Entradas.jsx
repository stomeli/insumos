import { useState } from "react";

function Entradas() {
const [form, setForm] = useState({
data: new Date().toISOString().split("T")[0],
itemId: "",
quantidade: "",
liderId: "",
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
  !form.itemId ||
  !form.quantidade ||
  !form.liderId
) {
  setMensagem("Preencha todos os campos obrigatórios.");
  return;
}

setMensagem(
  "Entrada preenchida. A gravação no banco será configurada na próxima etapa."
);
```

};

const limparFormulario = () => {
setForm({
data: new Date().toISOString().split("T")[0],
itemId: "",
quantidade: "",
liderId: "",
});

```
setMensagem("");
```

};

return ( <div> <div className="page-header"> <div> <h2>Entrada de insumos</h2>

```
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
              placeholder="Digite o ID do item"
              value={form.itemId}
              onChange={handleChange}
              required
            />
          </div>

          {/* Descrição */}
          <div className="form-group">
            <label className="form-label">
              Descrição
            </label>

            <input
              type="text"
              className="form-control"
              value=""
              placeholder="Será preenchida automaticamente pelo ID"
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
              placeholder="Informe a quantidade"
              value={form.quantidade}
              onChange={handleChange}
              required
            />
          </div>

          {/* Líder */}
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

          {/* Nome do líder */}
          <div className="form-group">
            <label className="form-label">
              Nome do líder
            </label>

            <input
              type="text"
              className="form-control"
              value=""
              placeholder="Será preenchido automaticamente"
              readOnly
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
            className="btn btn-primary"
          >
            📥 Registrar entrada
          </button>
        </div>
      </form>
    </div>
  </div>

  {/* Orientação */}
  <div
    className="card"
    style={{ marginTop: "18px" }}
  >
    <div className="card-body">
      <div className="alert alert-warning">
        <span>💡</span>

        <div>
          <strong>Como funcionará</strong>

          <p style={{ marginTop: "4px" }}>
            Ao informar o ID do item, o sistema buscará
            automaticamente a descrição cadastrada. O mesmo
            acontecerá com o ID do líder.
          </p>

          <p style={{ marginTop: "5px" }}>
            Ao registrar a entrada, a quantidade será
            adicionada ao estoque atual do item.
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
```

);
}

export default Entradas;
