:::writing{variant="document" id="48261" title="src/App.jsx — corrigido"}
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
      {menuAberto && (
        <div
          className="sidebar-overlay"
          onClick={() => setMenuAberto(false)}
        />
      )}

      <aside
        className={`sidebar ${
          menuAberto ? "sidebar-open" : ""
        }`}
      >
        <div className="sidebar-logo">
          <div className="logo-mark">ML</div>

          <div>
            <div className="logo-title">
              Controle
            </div>

            <div className="logo-subtitle">
              de Estoque
            </div>
          </div>

          <button
            className="sidebar-close"
            onClick={() => setMenuAberto(false)}
            aria-label="Fechar menu"
          >
            ×
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">
              PRINCIPAL
            </div>

            {menuPrincipal.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${
                  paginaAtual === item.id ? "active" : ""
                }`}
                onClick={() => navegar(item.id)}
              >
                <span className="nav-icon">
                  {item.icone}
                </span>

                <span>{item.nome}</span>
              </button>
            ))}
          </div>

          <div className="nav-section">
            <div className="nav-section-title">
              CADASTROS
            </div>

            {menuCadastros.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${
                  paginaAtual === item.id ? "active" : ""
                }`}
                onClick={() => navegar(item.id)}
              >
                <span className="nav-icon">
                  {item.icone}
                </span>

                <span>{item.nome}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="system-status">
            <span className="status-dot" />

            <div>
              <strong>Sistema online</strong>

              <small>
                Controle de estoque
              </small>
            </div>
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="menu-button"
              onClick={() => setMenuAberto(true)}
              aria-label="Abrir menu"
            >
              ☰
            </button>

            <div>
              <h1>{pagina.titulo}</h1>

              <span className="topbar-breadcrumb">
                Controle de estoque
              </span>
            </div>
          </div>

          <div className="topbar-right">
            <div className="user-info">
              <div className="user-avatar">
                ML
              </div>

              <div className="user-details">
                <strong>
                  Controle de Estoque
                </strong>

                <span>
                  Acesso autorizado
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="content">
          <PaginaAtual />
        </main>

        <footer className="app-footer">
          <span>
            Sistema de Controle de Estoque
          </span>

          <span>
            Todos os dados serão centralizados no banco
            compartilhado.
          </span>
        </footer>
      </div>
    </div>
  );
}

export default App;
