

// 1. MÁSCARAS DE ENTRADA
// Máscara de CNPJ
document.getElementById("cnpj").addEventListener("input", function (e) {
    let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/);
    e.target.value = !x[2] ? x[1] : x[1] + '.' + x[2] + (x[3] ? '.' : '') + x[3] + (x[4] ? '/' : '') + x[4] + (x[5] ? '-' : '') + x[5];
});

// Máscara de CPF
document.getElementById("cpf").addEventListener("input", function (e) {
    let x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})/);
    e.target.value = !x[2] ? x[1] : x[1] + '.' + x[2] + (x[3] ? '.' : '') + x[3] + (x[4] ? '-' : '') + x[4];
});

// Máscara de Celular
document.getElementById("celular").addEventListener("input", function (e) {
    let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
    e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
});

// Máscara de CEP
document.getElementById("cep").addEventListener("input", function (e) {
    let x = e.target.value.replace(/\D/g, '').match(/(\d{0,5})(\d{0,3})/);
    e.target.value = !x[2] ? x[1] : x[1] + '-' + x[2];
});

// 2. BUSCA AUTOMÁTICA DE CEP (ViaCEP)
document.getElementById("cep").addEventListener("blur", function () {
    let cep = this.value.replace(/\D/g, '');

    if (cep.length === 8) {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(res => res.json())
            .then(dados => {
                if (!dados.erro) {
                    document.getElementById("logradouro").value = dados.logradouro;
                    document.getElementById("bairro").value = dados.bairro;
                    document.getElementById("cidade").value = dados.localidade;
                    document.getElementById("estado").value = dados.uf;
                    document.getElementById("numero").focus();
                } else {
                    alert("CEP não encontrado.");
                }
            })
            .catch(() => alert("Erro ao buscar o CEP."));
    }
});

// 3. MEDIDOR DE FORÇA DE SENHA
const inputSenha = document.getElementById('senha');
const barraForca = document.getElementById('forca-senha-bar');
const textoForca = document.getElementById('forca-senha-texto');

inputSenha.addEventListener('input', function() {
    const senha = inputSenha.value;
    let pontos = 0;

    if (senha.length >= 8) pontos += 1;
    if (/[A-Z]/.test(senha)) pontos += 1;
    if (/[a-z]/.test(senha)) pontos += 1;
    if (/[0-9]/.test(senha)) pontos += 1;
    if (/[^A-Za-z0-9]/.test(senha)) pontos += 1;

    barraForca.className = '';
    textoForca.style.color = '#fff';

    if (senha.length === 0) {
        textoForca.innerText = '';
        barraForca.style.width = '0%';
    } else if (pontos <= 2) {
        barraForca.classList.add('senha-fraca');
        textoForca.innerText = 'Fraca: Use letras, números e símbolos.';
        textoForca.style.color = '#ff4d4d';
    } else if (pontos === 3 || pontos === 4) {
        barraForca.classList.add('senha-media');
        textoForca.innerText = 'Média: Quase lá!';
        textoForca.style.color = '#ffd11a';
    } else if (pontos === 5) {
        barraForca.classList.add('senha-forte');
        textoForca.innerText = 'Forte: Senha excelente!';
        textoForca.style.color = '#00ff88';
    }
});

// 4. ENVIO DO FORMULÁRIO (SALVAMENTO NO CORE)
const formSalao = document.querySelector("form");

formSalao.addEventListener("submit", function(event) {
    event.preventDefault(); 

    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmarsenha").value;

    // Validação de senha
    if (senha !== confirmarSenha) {
        alert("As senhas não coincidem! Por favor, digite novamente.");
        return; 
    }

    // Coleta dos dados
    const dadosSalao = {
        nome_salao: document.getElementById("nome_salao").value,
        nome_completo: document.getElementById("nome_completo").value,
        email: document.getElementById("email").value,
        cnpj: document.getElementById("cnpj").value,
        cpf: document.getElementById("cpf").value,
        celular: document.getElementById("celular").value,
        cep: document.getElementById("cep").value, 
        logradouro: document.getElementById("logradouro").value,
        estado: document.getElementById("estado").value,
        cidade: document.getElementById("cidade").value,
        bairro: document.getElementById("bairro").value,
        numero: document.getElementById("numero").value,
        complemento: document.getElementById("complemento").value,
        senha: senha 
    };

    // Salva usando o CORE e pula para o Login
    Banco.salvar('dados_salao', dadosSalao);

    alert("Salão cadastrado com sucesso! Redirecionando para o login...");
    window.location.href = 'login.html'; 
});