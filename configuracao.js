// ===== SISTEMA DE ZOOM DO HEADER =====
function initializeZoomControls() {
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');
    
    let currentZoom = 100;
    
    if (zoomIn && zoomOut) {
        zoomIn.addEventListener('click', function() {
            if (currentZoom < 150) {
                currentZoom += 10;
                document.body.style.zoom = currentZoom + '%';
                showNotification(`Zoom: ${currentZoom}%`, 'info');
            } else {
                showNotification('Zoom máximo atingido (150%)', 'info');
            }
        });
        
        zoomOut.addEventListener('click', function() {
            if (currentZoom > 50) {
                currentZoom -= 10;
                document.body.style.zoom = currentZoom + '%';
                showNotification(`Zoom: ${currentZoom}%`, 'info');
            } else {
                showNotification('Zoom mínimo atingido (50%)', 'info');
            }
        });
    }
}

// ===== SISTEMA DE REDES SOCIAIS =====
function initializeSocialLinks() {
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.querySelector('i').className.split('-')[1];
            showNotification(`Abrindo ${platform}...`, 'info');
        });
    });
}

// ===== INICIALIZAÇÃO DO HEADER =====
function initializeHeaderSystems() {
    initializeZoomControls();
    initializeSocialLinks();
}

// ===== SISTEMA DE CONFIGURAÇÕES DO ALUNO =====
class ConfiguracoesSistema {
    constructor() {
        this.currentAction = null;
        this.alunoData = null;
        this.init();
    }

    async init() {
        initializeHeaderSystems();
        await this.carregarDadosAluno();
        this.setupNavigation();
        this.setupEventListeners();
        this.preencherDadosAluno();
    }

    async carregarDadosAluno() {
        try {
            const alunoLogado = JSON.parse(localStorage.getItem('alunoLogado'));
            if (!alunoLogado || !alunoLogado.id) {
                showNotification('Faça login para acessar suas configurações', 'warning');
                return;
            }

            const response = await fetch(`https://ifomorita.onrender.com/aluno/${alunoLogado.id}`);
            const result = await response.json();

            if (!result.sucesso) {
                showNotification(result.erro || 'Erro ao carregar dados do aluno', 'error');
                return;
            }

            this.alunoData = result.aluno;
        } catch (error) {
            showNotification('Erro ao carregar dados do aluno', 'error');
        }
    }

    preencherDadosAluno() {
        if (!this.alunoData) return;
        this.preencherInformacoesBasicas();
        this.preencherEmail();
        this.preencherEndereco();
    }

    preencherInformacoesBasicas() {
        if (this.alunoData.rm) {
            document.getElementById('rm-value').textContent = this.alunoData.rm;
        }
        if (this.alunoData.nome_completo) {
            document.getElementById('nome-value').textContent = this.alunoData.nome_completo;
        }
        if (this.alunoData.turma_id) {
            document.getElementById('turma-value').textContent = this.getTurmaName(this.alunoData.turma_id);
        }
    }

    preencherEmail() {
        const emailInput = document.getElementById('email-atual');
        if (this.alunoData.email && emailInput) {
            emailInput.value = this.alunoData.email;
        }
    }

    preencherEndereco() {
        if (this.alunoData.endereco) {
            try {
                const enderecoObj = typeof this.alunoData.endereco === 'string' 
                    ? JSON.parse(this.alunoData.endereco) 
                    : this.alunoData.endereco;

                if (enderecoObj.logradouro) document.getElementById('endereco-input').value = enderecoObj.logradouro;
                if (enderecoObj.complemento) document.getElementById('complemento-input').value = enderecoObj.complemento;
                if (enderecoObj.bairro) document.getElementById('bairro-input').value = enderecoObj.bairro;
                if (enderecoObj.cidade) document.getElementById('cidade-input').value = enderecoObj.cidade;
                if (enderecoObj.numero) document.getElementById('numero-input').value = enderecoObj.numero;
                if (enderecoObj.cep) document.getElementById('cep-input').value = enderecoObj.cep;
                if (enderecoObj.estado) document.getElementById('estado-select').value = enderecoObj.estado;
            } catch (error) {
                if (typeof this.alunoData.endereco === 'string') {
                    document.getElementById('endereco-input').value = this.alunoData.endereco;
                }
            }
        }
    }

    async salvarEndereco() {
        if (!this.alunoData) {
            showNotification('Erro: Dados do aluno não carregados', 'error');
            return;
        }

        const enderecoCompleto = {
            logradouro: document.getElementById('endereco-input').value,
            complemento: document.getElementById('complemento-input').value,
            bairro: document.getElementById('bairro-input').value,
            cidade: document.getElementById('cidade-input').value,
            numero: document.getElementById('numero-input').value,
            cep: document.getElementById('cep-input').value,
            estado: document.getElementById('estado-select').value
        };

        if (!enderecoCompleto.logradouro || !enderecoCompleto.numero || !enderecoCompleto.bairro || !enderecoCompleto.cidade) {
            showNotification('Preencha todos os campos obrigatórios do endereço', 'warning');
            return;
        }

        this.showConfirmModal(
            'Salvar Endereço',
            'Tem certeza que deseja salvar as alterações do endereço?',
            async () => {
                try {
                    const response = await fetch(`https://ifomorita.onrender.com/aluno/${this.alunoData.id}/endereco`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(enderecoCompleto)
                    });
                    const result = await response.json();
                    if (result.sucesso) {
                        this.alunoData.endereco = JSON.stringify(enderecoCompleto);
                        showNotification('Endereço salvo com sucesso!', 'success');
                    } else {
                        showNotification(result.erro || 'Erro ao salvar endereço', 'error');
                    }
                } catch (error) {
                    showNotification('Erro ao salvar endereço', 'error');
                }
            }
        );
    }

    getTurmaName(turmaId) {
        const turmas = {
            '1': '1º Ano - Automação',
            '2': '2º Ano - Automação',
            '3': '3º Ano - Automação',
            '4': '1º Ano - Eletrônica',
            '5': '2º Ano - Eletrônica',
            '6': '3º Ano - Eletrônica',
            '7': '1º Ano - Administração',
            '8': '2º Ano - Administração',
            '9': '3º Ano - Administração'
        };
        return turmas[turmaId] || `Turma ${turmaId}`;
    }

    setupNavigation() {
        const menuItems = document.querySelectorAll('.menu-item');
        const contentSections = document.querySelectorAll('.content-section');
        
        menuItems.forEach(item => {
            item.addEventListener('click', function() {
                const section = this.dataset.section;
                menuItems.forEach(i => i.classList.remove('active'));
                contentSections.forEach(s => s.classList.remove('active'));
                this.classList.add('active');
                document.getElementById(section).classList.add('active');
            });
        });
    }

    setupEventListeners() {
        this.setupInputMasks();
        const cepInput = document.getElementById('cep-input');
        if (cepInput) {
            cepInput.addEventListener('blur', () => this.buscarCEP());
        }
    }

    setupInputMasks() {
        const cepInput = document.getElementById('cep-input');
        if (cepInput) {
            cepInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length === 8) {
                    value = value.replace(/(\d{5})(\d)/, '$1-$2');
                }
                e.target.value = value;
            });
        }
    }

    async buscarCEP() {
        const cepInput = document.getElementById('cep-input');
        const cep = cepInput.value.replace(/\D/g, '');
        if (cep.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if (!data.erro) {
                document.getElementById('endereco-input').value = data
