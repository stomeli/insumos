const API_URL = import.meta.env.VITE_API_URL || "";

async function requisicao(endpoint, opcoes = {}) {
const resposta = await fetch(${API_URL}${endpoint}, {
headers: {
"Content-Type": "application/json",
...(opcoes.headers || {}),
},
...opcoes,
});

if (!resposta.ok) {
const texto = await resposta.text();
throw new Error(
texto || Erro na requisição: ${resposta.status}
);
}

if (resposta.status === 204) {
return null;
}

return resposta.json();
}

export const api = {
// Insumos
listarInsumos() {
return requisicao("/api/insumos");
},

criarInsumo(dados) {
return requisicao("/api/insumos", {
method: "POST",
body: JSON.stringify(dados),
});
},

atualizarInsumo(id, dados) {
return requisicao(/api/insumos/${encodeURIComponent(id)}, {
method: "PUT",
body: JSON.stringify(dados),
});
},

excluirInsumo(id) {
return requisicao(/api/insumos/${encodeURIComponent(id)}, {
method: "DELETE",
});
},

// Colaboradores
listarColaboradores() {
return requisicao("/api/colaboradores");
},

criarColaborador(dados) {
return requisicao("/api/colaboradores", {
method: "POST",
body: JSON.stringify(dados),
});
},

atualizarColaborador(id, dados) {
return requisicao(
/api/colaboradores/${encodeURIComponent(id)},
{
method: "PUT",
body: JSON.stringify(dados),
}
);
},

excluirColaborador(id) {
return requisicao(
/api/colaboradores/${encodeURIComponent(id)},
{
method: "DELETE",
}
);
},

// Líderes
listarLideres() {
return requisicao("/api/lideres");
},

criarLider(dados) {
return requisicao("/api/lideres", {
method: "POST",
body: JSON.stringify(dados),
});
},

atualizarLider(id, dados) {
return requisicao(/api/lideres/${encodeURIComponent(id)}, {
method: "PUT",
body: JSON.stringify(dados),
});
},

excluirLider(id) {
return requisicao(/api/lideres/${encodeURIComponent(id)}, {
method: "DELETE",
});
},

// Entradas
listarEntradas() {
return requisicao("/api/entradas");
},

criarEntrada(dados) {
return requisicao("/api/entradas", {
method: "POST",
body: JSON.stringify(dados),
});
},

// Saídas
listarSaidas() {
return requisicao("/api/saidas");
},

criarSaida(dados) {
return requisicao("/api/saidas", {
method: "POST",
body: JSON.stringify(dados),
});
},

// Histórico
listarHistorico() {
return requisicao("/api/historico");
},

atualizarHistorico(id, dados) {
return requisicao(
/api/historico/${encodeURIComponent(id)},
{
method: "PUT",
body: JSON.stringify(dados),
}
);
},

excluirHistorico(id) {
return requisicao(
/api/historico/${encodeURIComponent(id)},
{
method: "DELETE",
}
);
},

excluirHistoricoEmMassa(ids) {
return requisicao("/api/historico/massa", {
method: "DELETE",
body: JSON.stringify({ ids }),
});
},
};
