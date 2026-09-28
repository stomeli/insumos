import { useMemo, useState } from "react";

const ITENS_POR_PAGINA = 40;

function Historico() {
const [registros, setRegistros] = useState([]);
const [busca, setBusca] = useState("");

const [paginaAtual, setPaginaAtual] = useState(1);

const [selecionados, setSelecionados] = useState([]);

const [modalAberto, setModalAberto] = useState(false);
const [registroEditando, setRegistroEditando] = useState(null);

const [form, setForm] = useState({
data: "",
hora: "",
colaboradorId: "",
nomeColaborador: "",
itemId: "",
descricaoItem: "",
quantidade: "",
liderId: "",
nomeLider: "",
});

const registrosFiltrados = useMemo(() => {
const termo = busca.toLowerCase().trim();


if (!termo) {
  return registros;
}

return registros.filter((registro) => {
  return (
    registro.colaboradorId
      .toLowerCase()
      .includes(termo) ||
    registro.nomeColaborador
      .toLowerCase()
      .includes(termo) ||
    registro.itemId
      .toLowerCase()
      .includes(termo) ||
    registro.descricaoItem
      .toLowerCase()
      .includes(termo) ||
    registro.liderId
      .toLowerCase()
      .includes(termo) ||
    registro.nomeLider
      .toLowerCase()
      .includes(termo)
  );
});

}, [registros, busca]);

const totalPaginas = Math.max(
1,
Math.ceil(
registrosFiltrados.length / ITENS_POR_PAGINA
)
);

const registrosPagina = useMemo(() => {
const inicio =
(paginaAtual - 1) * ITENS_POR_PAGINA;


const fim = inicio + ITENS_POR_PAGINA;

return registrosFiltrados.slice(inicio, fim);


}, [registrosFiltrados, paginaAtual]);

const idsPagina = registrosPagina.map(
(registro) => registro.id
);

const todosDaPaginaSelecionados =
idsPagina.length > 0 &&
idsPagina.every((id) => selecionados.includes(id));

const abrirEdicao = (registro) => {
setRegistroEditando(registro);


setForm({
  data: registro.data,
  hora: registro.hora,
  colaboradorId: registro.colaboradorId,
  nomeColaborador: registro.nomeColaborador,
  itemId: registro.itemId,
  descricaoItem: registro.descricaoItem,
  quantidade: registro.quantidade,
  liderId: registro.liderId,
  nomeLider: registro.nomeLider,
});

setModalAberto(true);


};

const fecharModal = () => {
setModalAberto(false);
setRegistroEditando(null);
};

const handleChange = (event) => {
const { name, value } = event.target;


setForm((prev) => ({
  ...prev,
  [name]: value,
}));


};

const salvarEdicao = (event) => {
event.preventDefault();
  

if (!registroEditando) {
  return;
}

setRegistros((prev) =>
  prev.map((registro) =>
    registro.id === registroEditando.id
      ? {
          ...registro,
          data: form.data,
          hora: form.hora,
          colaboradorId: form.colaboradorId,
          nomeColaborador: form.nomeColaborador,
          itemId: form.itemId,
          descricaoItem: form.descricaoItem,
          quantidade: form.quantidade,
          liderId: form.liderId,
          nomeLider: form.nomeLider,
        }
      : registro
  )
);

fecharModal();


};

const alternarSelecao = (id) => {
setSelecionados((prev) => {
if (prev.includes(id)) {
return prev.filter(
(registroId) => registroId !== id
);
}


  return [...prev, id];
});


};

const selecionarTodosDaPagina = () => {
if (todosDaPaginaSelecionados) {
setSelecionados((prev) =>
prev.filter((id) => !idsPagina.includes(id))
);


  return;
}

setSelecionados((prev) => {
  const novos = idsPagina.filter(
    (id) => !prev.includes(id)
  );

  return [...prev, ...novos];
});


};

const selecionarTodosRegistros = () => {
const todosIds = registrosFiltrados.map(
(registro) => registro.id
);


setSelecionados(todosIds);


};

const limparSelecao = () => {
setSelecionados([]);
};

const excluirRegistro = (registro) => {
const confirmar = window.confirm(
"Deseja excluir este registro do histórico?"
);


if (!confirmar) {
  return;
}

setRegistros((prev) =>
  prev.filter((item) => item.id !== registro.id)
);

setSelecionados((prev) =>
  prev.filter((id) => id !== registro.id)
);


};

const excluirSelecionados = () => {
if (selecionados.length === 0) {
return;
}


const confirmar = window.confirm(
  `Deseja excluir ${selecionados.length} registro(s) selecionado(s)?`
);

if (!confirmar) {
  return;
}

setRegistros((prev) =>
  prev.filter(
    (registro) => !selecionados.includes(registro.id)
  )
);

setSelecionados([]);
setPaginaAtual(1);


};

const excluirTodos = () => {
if (registrosFiltrados.length === 0) {
return;
}


const confirmar = window.confirm(
  `Deseja excluir todos os ${registrosFiltrados.length} registros exibidos?`
);

if (!confirmar) {
  return;
}

if (busca) {
  const idsParaExcluir = new Set(
    registrosFiltrados.map((registro) => registro.id)
  );

  setRegistros((prev) =>
    prev.filter(
      (registro) => !idsParaExcluir.has(registro.id)
    )
  );
} else {
  setRegistros([]);
}

setSelecionados([]);
setPaginaAtual(1);


};

const mudarPagina = (pagina) => {
if (pagina < 1 || pagina > totalPaginas) {
return;
}


setPaginaAtual(pagina);


};

const handleBusca = (event) => {
setBusca(event.target.value);
setPaginaAtual(1);
setSelecionados([]);
};

return ( <div>
{/* Cabeçalho */} <div className="page-header"> <div> <h2>Histórico</h2>


      <p>
        Consulte e gerencie todas as movimentações de
        estoque.
      </p>
    </div>

    {registrosFiltrados.length > 0 && (
      <button
        className="btn btn-danger"
        onClick={excluirTodos}
      >
        🗑️ Excluir todos
      </button>
    )}
  </div>

  {/* Barra de ferramentas */}
  <div className="toolbar">
    <div className="toolbar-left">
      <div className="search-box">
        <span className="search-icon">🔎</span>

        <input
          type="text"
          placeholder="Buscar colaborador, item ou líder..."
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
        {registrosFiltrados.length} registro(s)
      </span>
    </div>
  </div>

  {/* Barra de seleção */}
  {selecionados.length > 0 && (
    <div
      className="selection-bar"
      style={{
        marginBottom: "14px",
        padding: "12px 16px",
        background: "#fff8b8",
        border: "1px solid #f0d900",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
      }}
    >
      <strong style={{ fontSize: "12px" }}>
        {selecionados.length} registro(s) selecionado(s)
      </strong>

      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <button
          className="btn btn-secondary"
          onClick={selecionarTodosRegistros}
        >
          Selecionar todos
        </button>

        <button
          className="btn btn-secondary"
          onClick={limparSelecao}
        >
          Limpar seleção
        </button>

        <button
          className="btn btn-danger"
          onClick={excluirSelecionados}
        >
          🗑️ Excluir selecionados
        </button>
      </div>
    </div>
  )}

  {/* Tabela */}
  <div className="card">
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: "42px" }}>
              <input
                type="checkbox"
                checked={todosDaPaginaSelecionados}
                onChange={selecionarTodosDaPagina}
                disabled={idsPagina.length === 0}
                aria-label="Selecionar registros da página"
              />
            </th>

            <th>Data e hora</th>
            <th>ID colaborador</th>
            <th>Nome</th>
            <th>ID item</th>
            <th>Descrição</th>
            <th>Quantidade</th>
            <th>ID líder</th>
            <th>Nome do líder</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {registrosPagina.length === 0 ? (
            <tr>
              <td colSpan="10">
                <div className="empty-state">
                  <div className="empty-state-icon">
                    📋
                  </div>

                  <h3>
                    {busca
                      ? "Nenhum registro encontrado"
                      : "Nenhum registro no histórico"}
                  </h3>

                  <p>
                    {busca
                      ? "Tente outro termo de pesquisa."
                      : "As movimentações aparecerão aqui após os registros de entrada e saída."}
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            registrosPagina.map((registro) => {
              const selecionado = selecionados.includes(
                registro.id
              );

              return (
                <tr
                  key={registro.id}
                  style={
                    selecionado
                      ? {
                          background: "#fffde0",
                        }
                      : undefined
                  }
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selecionado}
                      onChange={() =>
                        alternarSelecao(registro.id)
                      }
                      aria-label={`Selecionar registro ${registro.id}`}
                    />
                  </td>

                  <td>
                    <div>
                      <strong>{registro.data}</strong>

                      <div
                        style={{
                          color: "#888",
                          fontSize: "10px",
                          marginTop: "2px",
                        }}
                      >
                        {registro.hora}
                      </div>
                    </div>
                  </td>

                  <td>
                    <strong>
                      {registro.colaboradorId}
                    </strong>
                  </td>

                  <td>{registro.nomeColaborador}</td>

                  <td>
                    <strong>{registro.itemId}</strong>
                  </td>

                  <td>{registro.descricaoItem}</td>

                  <td>
                    <span className="badge badge-danger">
                      -{registro.quantidade}
                    </span>
                  </td>

                  <td>
                    <strong>{registro.liderId}</strong>
                  </td>

                  <td>{registro.nomeLider}</td>

                  <td>
                    <div className="action-buttons">
                      <button
                        className="icon-button"
                        title="Editar"
                        onClick={() =>
                          abrirEdicao(registro)
                        }
                      >
                        ✏️
                      </button>

                      <button
                        className="icon-button danger"
                        title="Excluir"
                        onClick={() =>
                          excluirRegistro(registro)
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

    {/* Paginação */}
    <div className="pagination">
      <span className="pagination-info">
        {registrosFiltrados.length === 0
          ? "0 registros"
          : `Página ${paginaAtual} de ${totalPaginas}`}
      </span>

      <div className="pagination-buttons">
        <button
          className="pagination-button"
          disabled={paginaAtual === 1}
          onClick={() =>
            mudarPagina(paginaAtual - 1)
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
              Math.abs(pagina - paginaAtual) <= 1
            );
          })
          .map((pagina, index, paginasVisiveis) => {
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
                    paginaAtual === pagina
                      ? "active"
                      : ""
                  }`}
                  onClick={() => mudarPagina(pagina)}
                >
                  {pagina}
                </button>
              </span>
            );
          })}

        <button
          className="pagination-button"
          disabled={paginaAtual === totalPaginas}
          onClick={() =>
            mudarPagina(paginaAtual + 1)
          }
        >
          ›
        </button>
      </div>
    </div>
  </div>

  {/* Modal de edição */}
  {modalAberto && (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          fecharModal();
        }
      }}
    >
      <div
        className="modal"
        style={{
          maxWidth: "850px",
        }}
      >
        <div className="modal-header">
          <h3>Editar registro</h3>

          <button
            className="modal-close"
            onClick={fecharModal}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={salvarEdicao}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Data
                </label>

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
                <label className="form-label">
                  Hora
                </label>

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
                  ID do colaborador
                </label>

                <input
                  name="colaboradorId"
                  type="text"
                  className="form-control"
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
                  name="nomeColaborador"
                  type="text"
                  className="form-control"
                  value={form.nomeColaborador}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  ID do item
                </label>

                <input
                  name="itemId"
                  type="text"
                  className="form-control"
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
                  name="descricaoItem"
                  type="text"
                  className="form-control"
                  value={form.descricaoItem}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Quantidade
                </label>

                <input
                  name="quantidade"
                  type="number"
                  min="1"
                  className="form-control"
                  value={form.quantidade}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  ID do líder
                </label>

                <input
                  name="liderId"
                  type="text"
                  className="form-control"
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
                  name="nomeLider"
                  type="text"
                  className="form-control"
                  value={form.nomeLider}
                  onChange={handleChange}
                  required
                />
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
                Salvar alterações
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

export default Historico;
