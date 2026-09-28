import { useMemo, useState } from "react";
import { storage } from "../data/storage";

const ITENS_POR_PAGINA = 40;

function Insumos() {
const [itens, setItens] = useState(() =>
storage.getInsumos()
);

const [busca, setBusca] = useState("");
const [paginaAtual, setPaginaAtual] = useState(1);

const [modalAberto, setModalAberto] = useState(false);
const [itemEditando, setItemEditando] = useState(null);

const [form, setForm] = useState({
id: "",
descricao: "",
estoqueInicial: "",
});

const itensFiltrados = useMemo(() => {
const termo = busca.toLowerCase().trim();

if (!termo) {
  return itens;
}

return itens.filter((item) => {
  return (
    String(item.id)
      .toLowerCase()
      .includes(termo) ||
    String(item.descricao)
      .toLowerCase()
      .includes(termo)
  );
});

}, [itens, busca]);

const totalPaginas = Math.max(
1,
Math.ceil(
itensFiltrados.length / ITENS_POR_PAGINA
)
);

const paginaCorrigida = Math.min(
paginaAtual,
totalPaginas
);

const itensPagina = useMemo(() => {
const inicio =
(paginaCorrigida - 1) * ITENS_POR_PAGINA;

const fim = inicio + ITENS_POR_PAGINA;

return itensFiltrados.slice(inicio, fim);

}, [
itensFiltrados,
paginaCorrigida,
]);

const abrirNovoItem = () => {
setItemEditando(null);

setForm({
  id: "",
  descricao: "",
  estoqueInicial: "",
});

setModalAberto(true);

};

const abrirEdicao = (item) => {
setItemEditando(item);

setForm({
  id: item.id,
  descricao: item.descricao,
  estoqueInicial: item.estoqueInicial ?? 0,
});

setModalAberto(true);

};

const fecharModal = () => {
setModalAberto(false);
setItemEditando(null);
};

const handleChange = (event) => {
const { name, value } = event.target;

setForm((prev) => ({
  ...prev,
  [name]: value,
}));

};

const salvarItem = (event) => {
event.preventDefault();

const id = form.id.trim();
const descricao = form.descricao.trim();
const estoqueInicial = Number(
  form.estoqueInicial
);

if (!id || !descricao) {
  alert("Preencha todos os campos obrigatórios.");
  return;
}

if (
  Number.isNaN(estoqueInicial) ||
  estoqueInicial < 0
) {
  alert("Informe um estoque inicial válido.");
  return;
}

let itensAtualizados;

if (itemEditando) {
  itensAtualizados = itens.map((item) =>
    item.id === itemEditando.id
      ? {
          ...item,
          descricao,
          estoqueInicial,

          estoqueAtual:
            Number(
              item.estoqueAtual ??
                item.estoqueInicial ??
                0
            ) -
              Number(
                item.estoqueInicial ?? 0
              ) +
              estoqueInicial,
        }
      : item
  );
} else {
  const idExistente = itens.some(
    (item) =>
      String(item.id).toLowerCase() ===
      id.toLowerCase()
  );

  if (idExistente) {
    alert(
      "Já existe um item cadastrado com este ID."
    );
    return;
  }

  itensAtualizados = [
    ...itens,
    {
      id,
      descricao,
      estoqueInicial,
      entradas: 0,
      saidas: 0,
      totalEntradas: 0,
      totalSaidas: 0,
      estoqueAtual: estoqueInicial,
    },
  ];
}

setItens(itensAtualizados);
storage.saveInsumos(itensAtualizados);

setPaginaAtual(1);
fecharModal();

};

const excluirItem = (item) => {
const confirmar = window.confirm(
Deseja excluir o item "${item.descricao}"?
);

if (!confirmar) {
  return;
}

const itensAtualizados = itens.filter(
  (registro) => registro.id !== item.id
);

setItens(itensAtualizados);
storage.saveInsumos(itensAtualizados);

const novaQuantidadePaginas = Math.max(
  1,
  Math.ceil(
    itensAtualizados.length /
      ITENS_POR_PAGINA
  )
);

setPaginaAtual((pagina) =>
  Math.min(pagina, novaQuantidadePaginas)
);

};

const mudarPagina = (pagina) => {
if (
pagina < 1 ||
pagina > totalPaginas
) {
return;
}

setPaginaAtual(pagina);

};

const handleBusca = (event) => {
setBusca(event.target.value);
setPaginaAtual(1);
};

return (
<div>
<div className="page-header">
<div>
<h2>Insumos</h2>

      <p>
        Cadastre e acompanhe os materiais
        disponíveis no estoque.
      </p>
    </div>

    <button
      className="btn btn-primary"
      onClick={abrirNovoItem}
    >
      + Novo insumo
    </button>
  </div>

  <div className="toolbar">
    <div className="toolbar-left">
      <div className="search-box">
        <span className="search-icon">
          🔎
        </span>

        <input
          type="text"
          placeholder="Buscar por ID ou descrição..."
          value={busca}
          onChange={handleBusca}
        />
      </div>
    </div>

    <div className="toolbar-right">
      <span
        style={{
          color: "#666",
          fontSize: "11px",
        }}
      >
        {itensFiltrados.length} item(ns)
      </span>
    </div>
  </div>

  <div className="card">
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID do item</th>
            <th>Descrição</th>
            <th>Estoque inicial</th>
            <th>Entradas</th>
            <th>Saídas</th>
            <th>Estoque atual</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {itensPagina.length === 0 ? (
            <tr>
              <td colSpan="8">
                <div className="empty-state">
                  <div className="empty-state-icon">
                    📦
                  </div>

                  <h3>
                    {busca
                      ? "Nenhum item encontrado"
                      : "Nenhum insumo cadastrado"}
                  </h3>

                  <p>
                    {busca
                      ? "Tente utilizar outro termo de pesquisa."
                      : "Clique em “Novo insumo” para começar."}
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            itensPagina.map((item) => {
              const estoqueAtual = Number(
                item.estoqueAtual ?? 0
              );

              const entradas = Number(
                item.totalEntradas ??
                  item.entradas ??
                  0
              );

              const saidas = Number(
                item.totalSaidas ??
                  item.saidas ??
                  0
              );

              const estoqueBaixo =
                estoqueAtual > 0 &&
                estoqueAtual <= 10;

              const estoqueZerado =
                estoqueAtual <= 0;

              return (
                <tr key={item.id}>
                  <td>
                    <strong>{item.id}</strong>
                  </td>

                  <td>{item.descricao}</td>

                  <td>
                    {item.estoqueInicial}
                  </td>

                  <td>
                    <span className="badge badge-success">
                      +{entradas}
                    </span>
                  </td>

                  <td>
                    <span className="badge badge-danger">
                      -{saidas}
                    </span>
                  </td>

                  <td>
                    <strong>
                      {estoqueAtual}
                    </strong>
                  </td>

                  <td>
                    {estoqueZerado ? (
                      <span className="badge badge-danger">
                        Sem estoque
                      </span>
                    ) : estoqueBaixo ? (
                      <span className="badge badge-warning">
                        Estoque baixo
                      </span>
                    ) : (
                      <span className="badge badge-success">
                        Normal
                      </span>
                    )}
                  </td>

                  <td>
                    <div className="action-buttons">
                      <button
                        className="icon-button"
                        title="Editar"
                        onClick={() =>
                          abrirEdicao(item)
                        }
                      >
                        ✏️
                      </button>

                      <button
                        className="icon-button danger"
                        title="Excluir"
                        onClick={() =>
                          excluirItem(item)
                        }
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>

    <div className="pagination">
      <span className="pagination-info">
        {itensFiltrados.length === 0
          ? "0 registros"
          : `Página ${paginaCorrigida} de ${totalPaginas}`}
      </span>

      <div className="pagination-buttons">
        <button
          className="pagination-button"
          disabled={paginaCorrigida === 1}
          onClick={() =>
            mudarPagina(
              paginaCorrigida - 1
            )
          }
        >
          ‹
        </button>

        {Array.from(
          { length: totalPaginas },
          (_, index) => index + 1
        )
          .filter((pagina) => {
            if (totalPaginas <= 5) {
              return true;
            }

            return (
              pagina === 1 ||
              pagina === totalPaginas ||
              Math.abs(
                pagina - paginaCorrigida
              ) <= 1
            );
          })
          .map(
            (
              pagina,
              index,
              paginasVisiveis
            ) => {
              const paginaAnterior =
                paginasVisiveis[index - 1];

              const mostrarReticencias =
                paginaAnterior &&
                pagina - paginaAnterior > 1;

              return (
                <span key={pagina}>
                  {mostrarReticencias && (
                    <span
                      style={{
                        margin: "0 4px",
                        color: "#888",
                      }}
                    >
                      ...
                    </span>
                  )}

                  <button
                    className={`pagination-button ${
                      paginaCorrigida === pagina
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      mudarPagina(pagina)
                    }
                  >
                    {pagina}
                  </button>
                </span>
              );
            }
          )}

        <button
          className="pagination-button"
          disabled={
            paginaCorrigida ===
            totalPaginas
          }
          onClick={() =>
            mudarPagina(
              paginaCorrigida + 1
            )
          }
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
        if (
          event.target ===
          event.currentTarget
        ) {
          fecharModal();
        }
      }}
    >
      <div className="modal">
        <div className="modal-header">
          <h3>
            {itemEditando
              ? "Editar insumo"
              : "Novo insumo"}
          </h3>

          <button
            className="modal-close"
            onClick={fecharModal}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={salvarItem}>
            <div className="form-grid">
              <div className="form-group">
                <label
                  className="form-label"
                  htmlFor="id"
                >
                  ID do item *
                </label>

                <input
                  id="id"
                  name="id"
                  type="text"
                  className="form-control"
                  placeholder="Ex.: ITEM001"
                  value={form.id}
                  onChange={handleChange}
                  disabled={Boolean(
                    itemEditando
                  )}
                  required
                />
              </div>

              <div className="form-group">
                <label
                  className="form-label"
                  htmlFor="descricao"
                >
                  Descrição *
                </label>

                <input
                  id="descricao"
                  name="descricao"
                  type="text"
                  className="form-control"
                  placeholder="Descrição do insumo"
                  value={form.descricao}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label
                  className="form-label"
                  htmlFor="estoqueInicial"
                >
                  Estoque inicial *
                </label>

                <input
                  id="estoqueInicial"
                  name="estoqueInicial"
                  type="number"
                  min="0"
                  step="1"
                  className="form-control"
                  placeholder="0"
                  value={
                    form.estoqueInicial
                  }
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div
              className="alert alert-warning"
              style={{ marginTop: "18px" }}
            >
              <span>💡</span>

              <div>
                <strong>
                  Estoque atual
                </strong>

                <p
                  style={{
                    marginTop: "4px",
                  }}
                >
                  O estoque atual será
                  calculado automaticamente
                  com base no estoque inicial,
                  entradas e saídas.
                </p>
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

              <button
                type="submit"
                className="btn btn-primary"
              >
                {itemEditando
                  ? "Salvar alterações"
                  : "Cadastrar insumo"}
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

export default Insumos;
