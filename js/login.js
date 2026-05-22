/* ==========================================================================
   LOGIN.JS - Validação de Acesso (Tela do Matheus)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const emailDigitado = document.getElementById('email').value.trim();
        const senhaDigitada = document.getElementById('senha').value;
        const emailError = document.getElementById('email-error');
        const senhaError = document.getElementById('senha-error');

        // 1. Pede para o motor (CORE) buscar o salão cadastrado
        const salaoCadastrado = Banco.ler('dados_salao');

        // 2. Limpa mensagens de erro
        emailError.textContent = '';
        senhaError.textContent = '';

        // 3. Validação Real
        if (!salaoCadastrado) {
            alert('Nenhum salão encontrado! Por favor, faça o cadastro primeiro.');
            window.location.href = 'cadastro-salao.html';
            return;
        }

        if (emailDigitado === salaoCadastrado.email && senhaDigitada === salaoCadastrado.senha) {

            alert(`Bem-vindo de volta, ${salaoCadastrado.nome_completo}!`);
            
            // Aqui você pula para o Painel Administrativo de verdade (Dashboard)
            window.location.href = 'dashboard.html'; 
            
        } else {
            // Login Incorreto
            if (emailDigitado !== salaoCadastrado.email) {
                emailError.textContent = 'E-mail não reconhecido.';
            }
            if (senhaDigitada !== salaoCadastrado.senha) {
                senhaError.textContent = 'Senha incorreta.';
            }
        }
    });
});