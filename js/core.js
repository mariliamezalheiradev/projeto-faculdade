/* ==========================================================================
   CORE.JS - O Cérebro e Banco de Dados (LocalStorage) do SalãoPro
   ========================================================================== */

function inicializarSistema() {
    // Garante que a gaveta principal do salão exista ao abrir o sistema
    if (!localStorage.getItem('dados_salao')) {
        localStorage.setItem('dados_salao', JSON.stringify(null));
    }
    console.log("CORE Iniciado: Gavetas do banco de dados prontas!");
}

const Banco = {
    salvar: function(nomeDaGaveta, novosDados) {
        const dadosEmTexto = JSON.stringify(novosDados);
        localStorage.setItem(nomeDaGaveta, dadosEmTexto);
        console.log(`Dados salvos na gaveta: ${nomeDaGaveta}`);
    },

    ler: function(nomeDaGaveta) {
        const dados = localStorage.getItem(nomeDaGaveta);
        return dados ? JSON.parse(dados) : null;
    }
};

// Dá a partida no motor
inicializarSistema();