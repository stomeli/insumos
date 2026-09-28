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
    return dados ? JSON.parse(dados) : [];
  } catch (erro) {
    console.error(`Erro ao ler ${chave}:`, erro);
    return [];
  }
}

function salvar(chave, dados) {
  localStorage.setItem(chave, JSON.stringify(dados));
}

export const storage = {
  getInsumos() {
    return ler(STORAGE_KEYS.insumos);
  },

  saveInsumos(dados) {
    salvar(STORAGE_KEYS.insumos, dados);
  },

  getColaboradores() {
    return ler(STORAGE_KEYS.colaboradores);
  },

  saveColaboradores(dados) {
    salvar(STORAGE_KEYS.colaboradores, dados);
  },

  getLideres() {
    return ler(STORAGE_KEYS.lideres);
  },

  saveLideres(dados) {
    salvar(STORAGE_KEYS.lideres, dados);
  },

  getEntradas() {
    return ler(STORAGE_KEYS.entradas);
  },

  saveEntradas(dados) {
    salvar(STORAGE_KEYS.entradas, dados);
  },

  getSaidas() {
    return ler(STORAGE_KEYS.saidas);
  },

  saveSaidas(dados) {
    salvar(STORAGE_KEYS.saidas, dados);
  },

  limparTudo() {
    Object.values(STORAGE_KEYS).forEach((chave) => {
      localStorage.removeItem(chave);
    });
  },
};

export { STORAGE_KEYS };
