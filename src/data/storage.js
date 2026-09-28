const STORAGE_KEYS = {
insumos: "controle_estoque_insumos",
colaboradores: "controle_estoque_colaboradores",
lideres: "controle_estoque_lideres",
entradas: "controle_estoque_entradas",
saidas: "controle_estoque_saidas",
};

function ler(chave) {
try {
const dados = localStorage.getItem(chave);

```
if (!dados) {
  return [];
}

const parsed = JSON.parse(dados);

return Array.isArray(parsed) ? parsed : [];
```

} catch (erro) {
console.error(`Erro ao ler ${chave}:`, erro);
return [];
}
}

function salvar(chave, dados) {
try {
localStorage.setItem(chave, JSON.stringify(dados));
return true;
} catch (erro) {
console.error(`Erro ao salvar ${chave}:`, erro);
return false;
}
}

export const storage = {
// =========================
// INSUMOS
// =========================

getInsumos() {
return ler(STORAGE_KEYS.insumos);
},

saveInsumos(dados) {
return salvar(STORAGE_KEYS.insumos, dados);
},

// =========================
// COLABORADORES
// =========================

getColaboradores() {
return ler(STORAGE_KEYS.colaboradores);
},

saveColaboradores(dados) {
return salvar(STORAGE_KEYS.colaboradores, dados);
},

// =========================
// LÍDERES
// =========================

getLideres() {
return ler(STORAGE_KEYS.lideres);
},

saveLideres(dados) {
return salvar(STORAGE_KEYS.lideres, dados);
},

// =========================
// ENTRADAS
// =========================

getEntradas() {
return ler(STORAGE_KEYS.entradas);
},

saveEntradas(dados) {
return salvar(STORAGE_KEYS.entradas, dados);
},

// =========================
// SAÍDAS
// =========================

getSaidas() {
return ler(STORAGE_KEYS.saidas);
},

saveSaidas(dados) {
return salvar(STORAGE_KEYS.saidas, dados);
},

// =========================
// LIMPAR DADOS
// =========================

limparTudo() {
Object.values(STORAGE_KEYS).forEach((chave) => {
localStorage.removeItem(chave);
});
},
};

export { STORAGE_KEYS };
