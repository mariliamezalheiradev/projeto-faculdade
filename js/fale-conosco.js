document.addEventListener('DOMContentLoaded', () => {
    const formContato = document.getElementById('form-contato');
    const telaSucesso = document.getElementById('mensagem-sucesso-contato');

    // Se a tabela de mensagens ainda não existir no banco, ele cria
    if (!Banco.ler('mensagens_suporte')) {
        Banco.salvar('mensagens_suporte', []);
    }

    if (formContato) {
        formContato.addEventListener('submit', function (e) {
            e.preventDefault();

            const nome = document.getElementById('contato-nome').value.trim();
            const email = document.getElementById('contato-email').value.trim();
            const assunto = document.getElementById('contato-assunto').value;
            const mensagem = document.getElementById('contato-mensagem').value.trim();


            const novaMensagem = {
                id: Date.now(),
                data: new Date().toLocaleDateString('pt-BR'),
                nome: nome,
                email: email,
                assunto: assunto,
                mensagem: mensagem
            };

            let listaMensagens = Banco.ler('mensagens_suporte') || [];
            listaMensagens.push(novaMensagem);
            Banco.salvar('mensagens_suporte', listaMensagens);


            formContato.style.display = 'none';
            telaSucesso.style.display = 'block';
        });
    }
});