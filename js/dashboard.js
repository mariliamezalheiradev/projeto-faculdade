/* ==========================================================================
   DASHBOARD.JS - Cérebro de todas as Abas do FlowSalon
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 1. INICIALIZAÇÃO E NAVEGAÇÃO GERAL
    // ==========================================
    
    const dadosCadastrados = Banco.ler('dados_salao');
    if (dadosCadastrados) {
        const spanNome = document.getElementById('boas-vindas-nome');
        if (spanNome) spanNome.innerText = dadosCadastrados.nome_salao;
    } else {
        window.location.href = 'login.html'; // Redireciona se não estiver logado
    }

    // Lógica das Abas (Tabs)
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.content-section');

    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault(); 
            menuItems.forEach(link => link.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            this.classList.add('active');
            const targetId = this.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Logout
    const btnSair = document.getElementById("btn-sair");
    if (btnSair) {
        btnSair.addEventListener("click", () => {
            if (confirm("Deseja realmente sair do sistema?")) window.location.href = 'login.html';
        });
    }

    // Tabela Estática da Tela 1 (Resumo)
    const agendamentos = [
        { hora: "14:00", cliente: "Ana Silva", servico: "Corte e Hidratação", status: "Confirmado" },
        { hora: "15:30", cliente: "Bruno Lopes", servico: "Degradê + Barba", status: "Em espera" },
        { hora: "17:00", cliente: "Clara Rocha", servico: "Mechas", status: "Pendente" },
        { hora: "18:00", cliente: "David Souza", servico: "Limpeza de Pele", status: "Confirmado" }
    ];

    function carregarTabela() {
        const tbody = document.querySelector("#tabela-atendimento tbody");
        if (!tbody) return; 
        tbody.innerHTML = "";
        agendamentos.forEach(item => {
            let statusColor = item.status === "Confirmado" ? "#00ff88" : (item.status === "Em espera" ? "#00cfff" : "#ffaa00"); 
            tbody.innerHTML += `
                <tr>
                    <td>${item.hora}</td><td>${item.cliente}</td><td>${item.servico}</td>
                    <td style="color: ${statusColor}; font-weight: bold;">${item.status}</td>
                </tr>
            `;
        });
    }
    carregarTabela();


    // ==========================================
    // 2. ABA: AGENDA MESTRA E MODAL
    // ==========================================
    
    if (!Banco.ler('agenda_diaria')) Banco.salvar('agenda_diaria', []); 

    function renderizarAgenda() {
        const lista = document.getElementById('agenda-lista');
        if(!lista) return; 
        lista.innerHTML = ''; 
        const agendamentosSalvos = Banco.ler('agenda_diaria') || [];
        const horariosComerciais = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

        horariosComerciais.forEach(hora => {
            const agendamento = agendamentosSalvos.find(item => item.hora === hora);
            if (agendamento) {
                lista.innerHTML += `
                    <div class="time-slot reservado">
                        <div class="slot-hora">${hora}</div>
                        <div class="slot-detalhes">
                            <div>
                                <h3>${agendamento.cliente}</h3>
                                <p>${agendamento.servico} | Prof. ${agendamento.profissional}</p>
                            </div>
                            <span class="badge-status">Confirmado</span>
                        </div>
                    </div>`;
            } else {
                lista.innerHTML += `
                    <div class="time-slot livre">
                        <div class="slot-hora">${hora}</div>
                        <div class="slot-detalhes"><p>Horário Livre</p></div>
                    </div>`;
            }
        });
    }

    const modal = document.getElementById('modal-agendamento');
    const formAgenda = document.getElementById('form-agendamento');
    document.getElementById("btn-novo")?.addEventListener("click", () => modal.style.display = 'flex');
    document.getElementById('btn-abrir-modal')?.addEventListener('click', () => modal.style.display = 'flex');
    document.getElementById('btn-fechar-modal')?.addEventListener('click', () => modal.style.display = 'none');

    if (formAgenda) {
        formAgenda.addEventListener('submit', function(e) {
            e.preventDefault();
            const novaHora = document.getElementById('novo-hora').value;
            let listaAtual = Banco.ler('agenda_diaria') || [];

            if (listaAtual.find(item => item.hora === novaHora)) return alert('Esse horário já está ocupado!');

            listaAtual.push({
                hora: novaHora,
                cliente: document.getElementById('novo-cliente').value,
                servico: document.getElementById('novo-servico').value,
                profissional: document.getElementById('novo-profissional').value
            });

            Banco.salvar('agenda_diaria', listaAtual);
            modal.style.display = 'none'; formAgenda.reset(); renderizarAgenda(); alert("Agendamento salvo com sucesso!");
        });
    }
    renderizarAgenda();


    // ==========================================
    // 3. ABA: GESTÃO DE CLIENTES (Zap e Busca)
    // ==========================================

    if (!Banco.ler('lista_clientes')) Banco.salvar('lista_clientes', []);

    const formCliente = document.getElementById('formCliente');
    const listaClientesApp = document.getElementById('listaClientesApp');
    const inputBuscaCliente = document.getElementById('busca-cliente');
    const inputCliTelefone = document.getElementById('cliente-telefone');

    // Máscara de Telefone do Cliente
    if (inputCliTelefone) {
        inputCliTelefone.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '').slice(0, 11);
            let f = '';
            if (v.length > 0) f = '(' + v.slice(0, 2);
            if (v.length > 2) f += ') ' + v.slice(2, 7);
            if (v.length > 7) f += '-' + v.slice(7);
            e.target.value = f;
        });
    }

    // Desenha Clientes
    function renderizarClientes(filtro = "") {
        if (!listaClientesApp) return;
        listaClientesApp.innerHTML = '';
        let clientes = Banco.ler('lista_clientes') || [];

        // Lógica da Busca
        if (filtro) {
            clientes = clientes.filter(c => c.nome.toLowerCase().includes(filtro.toLowerCase()) || c.telefone.includes(filtro));
        }

        if (clientes.length === 0) return listaClientesApp.innerHTML = '<p style="color: #888; grid-column: 1/-1;">Nenhum cliente encontrado.</p>';

        clientes.forEach(cliente => {
            const numeroLimpo = cliente.telefone.replace(/\D/g, '');
            const linkZap = `https://wa.me/55${numeroLimpo}`;
            const indexReal = (Banco.ler('lista_clientes') || []).findIndex(c => c.id === cliente.id);

            listaClientesApp.innerHTML += `
                <div class="cyber-card">
                    <div class="card-top">
                        <h3 style="color: #fff;">${cliente.nome}</h3>
                        <span class="badge" style="background: #00ff88; color: black;">Ativo</span>
                    </div>
                    <p style="color: #aaa; font-size: 0.9rem; margin-bottom: 20px;"><strong>Zap:</strong> ${cliente.telefone}</p>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn-outline" style="flex: 1; border-color: #25d366; color: #25d366;" onclick="window.open('${linkZap}', '_blank')">
                            <i class="fab fa-whatsapp"></i> Zap
                        </button>
                        <button class="btn-action" style="color: #ff4b4b; border-color: #ff4b4b; padding: 8px 15px;" onclick="removerCliente(${indexReal})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
    }

    // Salvar Cliente
    if (formCliente) {
        formCliente.addEventListener('submit', function(e) {
            e.preventDefault();
            const novoCliente = {
                id: Date.now(),
                nome: document.getElementById('cliente-nome').value.trim(),
                telefone: inputCliTelefone.value.trim()
            };
            let clis = Banco.ler('lista_clientes') || [];
            clis.push(novoCliente); Banco.salvar('lista_clientes', clis);
            formCliente.reset(); renderizarClientes(); alert('Cliente salvo na agenda com sucesso!');
        });
    }

    // Escuta a barra de pesquisa
    if (inputBuscaCliente) inputBuscaCliente.addEventListener('input', (e) => renderizarClientes(e.target.value));

    // Excluir Cliente
    window.removerCliente = function(index) {
        if(confirm('Tem certeza que deseja remover este cliente?')) {
            let clis = Banco.ler('lista_clientes') || []; clis.splice(index, 1); Banco.salvar('lista_clientes', clis); 
            renderizarClientes(inputBuscaCliente ? inputBuscaCliente.value : "");
        }
    };
    
    renderizarClientes();


    // ==========================================
    // 4. ABA: CATÁLOGO DE SERVIÇOS
    // ==========================================

    if (!Banco.ler('catalogo_servicos')) Banco.salvar('catalogo_servicos', []);

    const formServico = document.getElementById('formServico');
    const listaServicos = document.getElementById('listaServicos');
    const btnMasc = document.getElementById('btn-cat-masc');
    const btnFem = document.getElementById('btn-cat-fem');
    let categoriaAtual = 'Masculino'; 

    function renderizarServicos() {
        if (!listaServicos) return;
        listaServicos.innerHTML = '';
        const servicos = Banco.ler('catalogo_servicos') || [];
        const filtrados = servicos.filter(s => s.tipo === categoriaAtual);

        if (filtrados.length === 0) return listaServicos.innerHTML = `<p style="color: #888; grid-column: 1/-1; text-align:center;">Nenhum serviço ${categoriaAtual} cadastrado.</p>`;

        filtrados.forEach((s) => {
            const iReal = servicos.findIndex(item => item.id === s.id);
            listaServicos.innerHTML += `
                <div class="cyber-card service-card">
                    <div class="card-top">
                        <h3 style="color: #fff; cursor: text;" contenteditable="true" onblur="editarServico(${iReal}, 'nome', this.innerText)">${s.nome}</h3>
                        <span class="badge" style="background: ${categoriaAtual === 'Masculino' ? '#00f2fe' : '#ff007f'}; color: black;">${s.tipo}</span>
                    </div>
                    <div class="service-details">
                        <span class="price">R$ <span style="cursor: text;" contenteditable="true" onblur="editarServico(${iReal}, 'preco', this.innerText)">${parseFloat(s.preco).toFixed(2)}</span></span>
                    </div>
                    <button class="btn-action" style="color: #ff4b4b; border-color: #ff4b4b; width:100%; margin-top:10px;" onclick="removerCatalogo(${iReal})">Excluir Serviço</button>
                </div>
            `;
        });
    }

    if(btnMasc && btnFem) {
        btnMasc.style.background = '#00f2fe'; btnMasc.style.color = '#000';
        btnMasc.addEventListener('click', () => {
            categoriaAtual = 'Masculino';
            btnMasc.style.background = '#00f2fe'; btnMasc.style.color = '#000'; btnFem.style.background = 'transparent'; btnFem.style.color = '#00f2fe';
            renderizarServicos();
        });
        btnFem.addEventListener('click', () => {
            categoriaAtual = 'Feminino';
            btnFem.style.background = '#00f2fe'; btnFem.style.color = '#000'; btnMasc.style.background = 'transparent'; btnMasc.style.color = '#00f2fe';
            renderizarServicos();
        });
    }

    if (formServico) {
        formServico.addEventListener('submit', function(e) {
            e.preventDefault();
            const novo = {
                id: Date.now(), 
                nome: document.getElementById('servico-nome').value.trim(),
                preco: document.getElementById('servico-preco').value.trim(),
                tipo: document.getElementById('servico-tipo').value
            };
            let cat = Banco.ler('catalogo_servicos') || [];
            cat.push(novo); Banco.salvar('catalogo_servicos', cat);
            formServico.reset(); 
            novo.tipo === 'Masculino' ? btnMasc.click() : btnFem.click();
        });
    }

    window.removerCatalogo = function(index) {
        if(confirm('Tem certeza que deseja excluir este serviço?')) {
            let cat = Banco.ler('catalogo_servicos') || []; cat.splice(index, 1); Banco.salvar('catalogo_servicos', cat); renderizarServicos();
        }
    };

    window.editarServico = function(index, campo, valor) {
        let cat = Banco.ler('catalogo_servicos') || [];
        if (campo === 'preco') {
            valor = valor.replace(/[^\d.,]/g, '').replace(',', '.');
            if(isNaN(valor) || valor === '') return renderizarServicos(); 
        }
        cat[index][campo] = valor.trim(); Banco.salvar('catalogo_servicos', cat); renderizarServicos();
    };
    renderizarServicos();


    // ==========================================
    // 5. ABA: GESTÃO DE PROFISSIONAIS
    // ==========================================

    if (!Banco.ler('equipe_profissionais')) Banco.salvar('equipe_profissionais', []); 

    const formProf = document.getElementById('formProfissional');
    const inputCpf = document.getElementById('prof-cpf');
    const inputTelefoneProf = document.getElementById('prof-telefone');
    const selectEspec = document.getElementById('prof-especialidade');
    const campoOutra = document.getElementById('campo-outra-profissao');
    const listaFunc = document.getElementById('listaFuncionarios');

    const formatarCPF = (e) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 11);
        v = v.replace(/(\d{3})(\d)/, '$1.$2'); v = v.replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3'); v = v.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
        e.target.value = v;
    };
    const formatarTelefoneProf = (e) => {
        let d = e.target.value.replace(/\D/g, '').slice(0, 13); let f = '';
        if (d.length > 0) f = '+' + d.slice(0, 2); if (d.length > 2) f += ' ' + d.slice(2, 4); if (d.length > 4) f += ' ' + d.slice(4, 9); if (d.length > 9) f += '-' + d.slice(9);
        e.target.value = f;
    };

    if (inputCpf) inputCpf.addEventListener('input', formatarCPF);
    if (inputTelefoneProf) inputTelefoneProf.addEventListener('input', formatarTelefoneProf);

    if (selectEspec) {
        selectEspec.addEventListener('change', function() {
            campoOutra.style.display = this.value === 'Outra' ? 'block' : 'none';
        });
    }

    function renderizarProfissionais() {
        if (!listaFunc) return;
        listaFunc.innerHTML = ''; 
        const equipe = Banco.ler('equipe_profissionais') || [];
        if (equipe.length === 0) return listaFunc.innerHTML = '<p style="color: #888; grid-column: 1/-1;">Nenhum profissional cadastrado ainda.</p>';

        equipe.forEach(prof => {
            listaFunc.innerHTML += `
                <div class="cyber-card">
                    <div class="card-top">
                        <h3 style="color: #fff;">${prof.nome}</h3>
                        <span class="badge" style="background: #00f2fe; color: black;">Equipe</span>
                    </div>
                    <p style="color: #00ff88; font-weight: bold; margin-bottom: 10px;">${prof.especialidade}</p>
                    <p style="color: #aaa; font-size: 0.85rem;"><strong>CPF:</strong> ${prof.cpf}</p>
                    <p style="color: #aaa; font-size: 0.85rem;"><strong>Tel:</strong> ${prof.telefone}</p>
                    <p style="color: #aaa; font-size: 0.85rem;"><strong>E-mail:</strong> ${prof.email}</p>
                    <button class="btn-outline" style="width: 100%; margin-top: 15px;">Ver Detalhes</button>
                </div>
            `;
        });
    }

    if (formProf) {
        formProf.addEventListener('submit', function(e) {
            e.preventDefault();
            const prof = {
                id: Date.now(), 
                nome: document.getElementById('prof-nome').value.trim(),
                cpf: inputCpf.value.trim(),
                email: document.getElementById('prof-email').value.trim(),
                telefone: inputTelefoneProf.value.trim(),
                especialidade: selectEspec.value === 'Outra' ? document.getElementById('prof-outra').value.trim() : selectEspec.value
            };

            if (prof.especialidade === '' || prof.cpf.length < 14) return alert('Verifique os dados informados!');

            let eq = Banco.ler('equipe_profissionais') || [];
            eq.push(prof); Banco.salvar('equipe_profissionais', eq);

            formProf.reset(); campoOutra.style.display = 'none'; renderizarProfissionais();
            alert('Profissional cadastrado com sucesso!');
        });
    }
    renderizarProfissionais();

});