import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import Entradas from "./pages/Entradas";
import Saidas from "./pages/Saidas";
import Insumos from "./pages/Insumos";
import Colaboradores from "./pages/Colaboradores";
import Lideres from "./pages/Lideres";
import Historico from "./pages/Historico";

const menuItems = [
{ id: "dashboard", label: "Dashboard", icon: "📊" },
{ id: "entradas", label: "Entradas", icon: "📥" },
{ id: "saidas", label: "Saídas", icon: "📤" },
{ id: "insumos", label: "Insumos", icon: "📦" },
{ id: "colaboradores", label: "Colaboradores", icon: "👥" },
{ id: "lideres", label: "Líderes", icon: "👤" },
{ id: "historico", label: "Histórico", icon: "📋" },
];

function App() {
const [activePage, setActivePa]()
