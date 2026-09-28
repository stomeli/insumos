import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import Entradas from "./pages/Entradas";
import Saidas from "./pages/Saidas";
import Insumos from "./pages/Insumos";
import Colaboradores from "./pages/Colaboradores";
import Lideres from "./pages/Lideres";
import Historico from "./pages/Historico";

const paginas = {
  dashboard: {
    titulo: "Dashboard",
    componente: Dashboard,
  },
  entradas: {
    titulo: "Entradas",
    componente: Entradas,
  },
  saidas: {
    titulo: "Saídas",
    componente: Saidas,
  },
  insumos: {
    titulo: "Insumos",
    componente: Insumos,
  },
  colaboradores: {
    titulo: "Colaboradores",
    componente: Colaboradores,
  },
  lideres: {
    titulo: "Líderes",
    componente: Lideres,
  },
  historico: {
    titulo: "Histórico",
    componente: Historico,
  },
};

function App() {
  const [paginaAtual, setPaginaAtual] = useState("dashboard");
  const [menuAberto, setMenuAberto] = useState(false);

  const pagina = paginas[paginaAtual];
  const PaginaAtual = pagina.componente;

  const navegar = (paginaSelecionada) => {
    setPaginaAtual(paginaSelecionada);
    setMenuAberto(false);
  };

  const menuPrincipal = [
    {
      id: "dashboard",
      nome: "Dashboard",
      icone: "▦",
    },
    {
      id: "entradas",
      nome: "Entrada",
      icone: "↓",
    },
    {
      id: "saidas",
      nome: "Saída",
      icone: "↑",
    },
    {
      id: "historico",
      nome: "Histórico",
      icone: "◷",
    },
  ];

  const menuCadastros = [
    {
      id: "insumos",
      nome: "Insumos",
      icone: "▣",
    },
    {
      id: "colaboradores",
      nome: "Colaboradores",
      icone: "♙",
    },
    {
      id: "lideres",
      nome: "Líderes",
      icone: "♟",
    },
  ];

  return (
    <div className="app">

      {/* OVERLAY MOBILE */}
      {menuAberto && (
        <div
          className="sidebar-overlay"
          onClick={() => setMenuAberto(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`sidebar ${
          menuAberto ? "sidebar-open" : ""
        }`}
      >

        {/* CABEÇALHO DA SIDEBAR */}
        <div className="sidebar-header">

          <div className="logo">

           <div className="logo-icon">
  <img
    src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/mercado-libre/default.svg"
    alt="Mercado Livre"
  />
</div>


            <div>
              <strong>Controle</strong>
              <span>de Estoque</span>
            </div>

          </div>

          <button
            className="close-sidebar"
            onClick={() => setMenuAberto(false)}
            aria-label="Fechar menu"
          >
            ×
          </button>

        </div>

        {/* MENU */}
        <nav className="sidebar-menu">

          {/* PRINCIPAL */}
          <div className="menu-title">
            PRINCIPAL
          </div>

          {menuPrincipal.map((item) => (
            <button
              key={item.id}
              className={`menu-item ${
                paginaAtual === item.id ? "active" : ""
              }`}
              onClick={() => navegar(item.id)}
            >
              <span className="menu-icon">
                {item.icone}
              </span>

              <span>
                {item.nome}
              </span>
            </button>
          ))}

          {/* CADASTROS */}
          <div
            className="menu-title"
            style={{ marginTop: "22px" }}
          >
            CADASTROS
          </div>

          {menuCadastros.map((item) => (
            <button
              key={item.id}
              className={`menu-item ${
                paginaAtual === item.id ? "active" : ""
              }`}
              onClick={() => navegar(item.id)}
            >
              <span className="menu-icon">
                {item.icone}
              </span>

              <span>
                {item.nome}
              </span>
            </button>
          ))}

        </nav>

      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="main-area">

        {/* TOPBAR */}
        <header className="topbar">

          <button
            className="menu-toggle"
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
          >
            ☰
          </button>

          <div className="page-heading">

            <span className="company-label">
              CONTROLE DE ESTOQUE
            </span>

            <h1>
              {pagina.titulo}
            </h1>

          </div>

          <div className="topbar-right">

            <div className="online-indicator">
              <span></span>
              Online
            </div>

          </div>

        </header>

        {/* CONTEÚDO */}
        <main className="content">
          <PaginaAtual />
        </main>

      </div>

    </div>
  );
}

export default App;
