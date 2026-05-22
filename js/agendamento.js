/* js/agendamento.js */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('agendamentoForm');
    const formContainer = document.getElementById('formContainer');
    const confirmationScreen = document.getElementById('confirmationScreen');
    const cepInput = document.getElementById('cep');
    const btnBuscar = document.getElementById('buscarCep');

    // ==========================================
    // 1. CARREGAR DADOS DINÂMICOS DO BANCO
    // ==========================================
    
    // Puxa os Serviços
    const selectServico = document.getElementById('servico');
    const catalogo = Banco.ler('catalogo_servicos') || [];
    
    if (catalogo.length > 0) {
        selectServico.innerHTML = '<option value="" disabled selected>Escolha um serviço...</option>';
        catalogo.forEach(serv => {
            selectServico.innerHTML += `<option value="${serv.nome}">${serv.nome} - R$ ${serv.preco}</option>`;
        });
    } else {
        selectServico.innerHTML = '<option value="" disabled selected>Nenhum serviço cadastrado no sistema</option>';
    }

    // Puxa os Profissionais
    const selectProfissional = document.getElementById('profissional');
    const equipe = Banco.ler('equipe_profissionais') || [];
    
    if (equipe.length > 0) {
        equipe.forEach(prof => {
            selectProfissional.innerHTML += `<option value="${prof.nome}">${prof.nome} (${prof.especialidade})</option>`;
        });
    }

    // ==========================================
    // 2. MÁSCARAS E VIACEP
    // ==========================================

    const telefone = document.getElementById('telefone');
    if(telefone) {
        telefone.addEventListener('input', function () {
            let val = this.value.replace(/\D/g, '');
            if (val.length > 11) val = val.slice(0, 11);
            if (val.length <= 10) {
                this.value = val.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            } else {
                this.value = val.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            }
        });
    }

    if(cepInput) {
        cepInput.addEventListener('input', function () {
            let val = this.value.replace(/\D/g, '');
            if (val.length > 8) val = val.slice(0, 8);
            this.value = val.replace(/(\d{5})(\d{3})/, '$1-$2');
        });
    }

    // A busca do CEP com a CRASE corrigida (``)
    async function buscarCep() {
        let cep = cepInput.value.replace(/\D/g, '');
        if (cep.length !== 8) {
            alert('Digite um CEP válido!');
            return;
        }

        btnBuscar.textContent = 'Buscando...';
        btnBuscar.disabled = true;

        try {
            const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await res.json();

            if (data.erro) {
                alert('CEP não encontrado!');
                return;
            }

            document.getElementById('rua').value = data.logradouro || '';
            document.getElementById('bairro').value = data.bairro || '';
            document.getElementById('cidade').value = data.localidade || '';
            document.getElementById('estado').value = data.uf || '';
        } catch (e) {
            alert('Erro ao buscar CEP.');
        } finally {
            btnBuscar.textContent = 'Buscar';
            btnBuscar.disabled = false;
        }
    }

    if(btnBuscar) btnBuscar.addEventListener('click', buscarCep);
    if(cepInput) {
        cepInput.addEventListener('blur', () => {
            if (cepInput.value.length >= 8) buscarCep();
        });
    }

    const dataInput = document.getElementById('data');
    if(dataInput) dataInput.min = new Date().toISOString().split('T')[0];

    // ==========================================
    // 3. SALVAR AGENDAMENTO
    // ==========================================

    if(form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const servicoEscolhido = document.getElementById('servico').value;
            if (!servicoEscolhido) {
                alert('Por favor, selecione um serviço.');
                return;
            }

            const nomeCli = document.getElementById('nome').value.trim();
            const telefoneCli = document.getElementById('telefone').value;
            const profissionalEscolhido = document.getElementById('profissional').value;
            const dataEscolhida = document.getElementById('data').value;
            const horaEscolhida = document.getElementById('hora').value;

            // Salvar na Agenda Mestra do Dashboard
            const novoAgendamento = {
                hora: horaEscolhida,
                cliente: nomeCli,
                servico: servicoEscolhido,
                profissional: profissionalEscolhido
            };
            let agendaAtual = Banco.ler('agenda_diaria') || [];
            agendaAtual.push(novoAgendamento);
            Banco.salvar('agenda_diaria', agendaAtual);

            // Salvar como Novo Cliente no Dashboard
            const novoCliente = {
                id: Date.now(),
                nome: nomeCli,
                telefone: telefoneCli
            };
            let listaClientes = Banco.ler('lista_clientes') || [];
            listaClientes.push(novoCliente);
            Banco.salvar('lista_clientes', listaClientes);

            // Mostrar Tela de Sucesso
            document.getElementById('appointmentDetails').innerHTML = `
                <p><strong>👤 Nome:</strong> ${nomeCli}</p>
                <p><strong>📅 Data:</strong> ${dataEscolhida.split('-').reverse().join('/')}</p>
                <p><strong>⏰ Horário:</strong> ${horaEscolhida}</p>
                <p><strong>💇 Serviço:</strong> ${servicoEscolhido}</p>
                <p><strong>👩‍💼 Profissional:</strong> ${profissionalEscolhido}</p>
                <p><strong>📱 WhatsApp:</strong> ${telefoneCli}</p>
            `;

            formContainer.style.display = 'none';
            confirmationScreen.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

function novoAgendamento() {
    document.getElementById('confirmationScreen').style.display = 'none';
    document.getElementById('formContainer').style.display = 'block';
    document.getElementById('agendamentoForm').reset();
}