const resumo = [
{
titulo: "Itens cadastrados",
valor: "0",
descricao: "Total de insumos",
icone: "📦",
},
{
titulo: "Estoque atual",
valor: "0",
descricao: "Unidades disponíveis",
icone: "📊",
},
{
titulo: "Entradas",
valor: "0",
descricao: "Movimentações de entrada",
icone: "📥",
},
{
titulo: "Saídas",
valor: "0",
descricao: "Movimentações de saída",
icone: "📤",
},
];

function Dashboard() {
return ( <div className="dashboard">
{/* Cabeçalho */} <div className="page-header"> <div> <h2>Visão geral</h2> <p>
Acompanhe o estoque e as movimentações do sistema. </p> </div> </div>

```
  {/* Cards de resumo */}
  <div className="stats-grid">
    {resumo.map((item) => (
      <div className="stat-card" key={item.titulo}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div className="stat-label">{item.titulo}</div>

            <div className="stat-value">{item.valor}</div>

            <div className="stat-description">
              {item.descricao}
            </div>
          </div>

          <div
            style={{
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#fff8b8",
              borderRadius: "10px",
              fontSize: "18px",
            }}
          >
            {item.icone}
          </div>
        </div>
      </div>
    ))}
  </div>

  {/* Área inferior */}
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 380px)",
      gap: "18px",
    }}
  >
    {/* Movimentações recentes */}
    <div className="card">
      <div className="card-header">
        <div>
          <h3>Movimentações recentes</h3>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Item</th>
              <th>Descrição</th>
              <th>Quantidade</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td colSpan="5">
                <div className="empty-state">
                  <div className="empty-state-icon">📋</div>

                  <h3>Nenhuma movimentação</h3>

                  <p>
                    As entradas e saídas aparecerão aqui.
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    {/* Estoque baixo */}
    <div className="card">
      <div className="card-header">
        <h3>Estoque baixo</h3>

        <span className="badge badge-warning">
          Atenção
        </span>
      </div>

      <div className="card-body">
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>

          <h3>Nenhum alerta</h3>

          <p>
            Os itens com estoque baixo aparecerão aqui.
          </p>
        </div>
      </div>
    </div>
  </div>

  {/* Informações rápidas */}
  <div
    style={{
      marginTop: "18px",
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: "16px",
    }}
  >
    <div className="card">
      <div className="card-body">
        <div className="stat-label">Status do sistema</div>

        <div
          style={{
            marginTop: "10px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span className="status-dot"></span>

          <strong style={{ fontSize: "13px" }}>
            Sistema online
          </strong>
        </div>

        <p
          style={{
            marginTop: "8px",
            color: "#888",
            fontSize: "11px",
          }}
        >
          Conexão com o banco de dados será configurada
          posteriormente.
        </p>
      </div>
    </div>

    <div className="card">
      <div className="card-body">
        <div className="stat-label">Controle de estoque</div>

        <div
          style={{
            marginTop: "10px",
            fontSize: "18px",
            fontWeight: "800",
          }}
        >
          Centralizado
        </div>

        <p
          style={{
            marginTop: "8px",
            color: "#888",
            fontSize: "11px",
          }}
        >
          Os dados serão compartilhados entre os
          computadores.
        </p>
      </div>
    </div>

    <div className="card">
      <div className="card-body">
        <div className="stat-label">Movimentações</div>

        <div
          style={{
            marginTop: "10px",
            fontSize: "18px",
            fontWeight: "800",
          }}
        >
          0 registros
        </div>

        <p
          style={{
            marginTop: "8px",
            color: "#888",
            fontSize: "11px",
          }}
        >
          Entradas e saídas registradas no sistema.
        </p>
      </div>
    </div>
  </div>
</div>
```

);
}

export default Dashboard;
