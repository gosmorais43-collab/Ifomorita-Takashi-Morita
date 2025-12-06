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
                console.log(`🔍 Zoom aumentado para: ${currentZoom}%`);
                showNotification(`Zoom: ${currentZoom}%`, 'info');
            } else {
                showNotification('Zoom máximo atingido (150%)', 'info');
            }
        });
        
        zoomOut.addEventListener('click', function() {
            if (currentZoom > 50) {
                currentZoom -= 10;
                document.body.style.zoom = currentZoom + '%';
                console.log(`🔍 Zoom diminuído para: ${currentZoom}%`);
                showNotification(`Zoom: ${currentZoom}%`, 'info');
            } else {
                showNotification('Zoom mínimo atingido (50%)', 'info');
            }
        });

        console.log('✅ Controles de zoom inicializados');
    } else {
        console.log('❌ Controles de zoom não encontrados');
    }
}

// ===== SISTEMA DE REDES SOCIAIS =====
function initializeSocialLinks() {
    const socialLinks = document.querySelectorAll('.social-link');
    
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.querySelector('i').className.split('-')[1];
            
            // URLs das redes sociais (substitua pelos links reais)
            const socialUrls = {
                'instagram': 'https://instagram.com/etecmorita',
                'facebook': 'https://facebook.com/etecmorita',
                'twitter': 'https://twitter.com/etecmorita',
                'youtube': 'https://youtube.com/etecmorita'
            };
            
            // Em ambiente real, descomente a linha abaixo:
            // window.open(socialUrls[platform], '_blank');
            
            // Para demonstração, mostra mensagem
            showNotification(`Abrindo ${platform.charAt(0).toUpperCase() + platform.slice(1)}...`, 'info');
        });
    });
}

// ===== INICIALIZAÇÃO DO HEADER =====
function initializeHeaderSystems() {
    console.log('🚀 Inicializando sistema do header...');
    
    initializeZoomControls();
    initializeSocialLinks();
    
    console.log('✅ Header inicializado com sucesso!');
}

// ===== CONFIGURAÇÃO DO SUPABASE =====
const SUPABASE_URL = 'https://caadqubmelbbdnzdmqpf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhYWRxdWJtZWxiYmRuemRtcXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTA3NzQsImV4cCI6MjA3NjEyNjc3NH0.cRAyA5tWHbMTnhHRMBk9O0vK-rYeBGi5tLL09gHomxU';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== SISTEMA DE CONFIGURAÇÕES DO ALUNO =====
class ConfiguracoesSistema {
    constructor() {
        this.currentAction = null;
        this.alunoData = null;
        this.init();
    }

    async init() {
        // Inicializar sistemas do header
        initializeHeaderSystems();
        
        // Carregar dados do aluno
        await this.carregarDadosAluno();
        
        // Configurar interface
        this.setupNavigation();
        this.setupEventListeners();
        this.preencherDadosAluno();
        
        console.log('✅ Sistema de configurações inicializado');
    }

    async carregarDadosAluno() {
        try {
            const alunoLogado = JSON.parse(localStorage.getItem('alunoLogado'));
            
            if (!alunoLogado || !alunoLogado.id) {
                console.error('Nenhum aluno logado encontrado');
                showNotification('Faça login para acessar suas configurações', 'warning');
                return;
            }

            console.log('🔍 Buscando dados do aluno ID:', alunoLogado.id);

            const { data: alunoBanco, error } = await supabase
                .from('alunos')
                .select('*')
                .eq('id', alunoLogado.id)
                .single();

            if (error) {
                console.error('Erro ao buscar dados do aluno:', error);
                showNotification('Erro ao carregar dados do aluno', 'error');
                return;
            }

            if (alunoBanco) {
                this.alunoData = alunoBanco;
                console.log('✅ Dados do aluno carregados:', this.alunoData);
            }

        } catch (error) {
            console.error('Erro ao carregar dados do aluno:', error);
            showNotification('Erro ao carregar dados do aluno', 'error');
        }
    }

    preencherDadosAluno() {
        if (!this.alunoData) {
            console.log('⚠️ Nenhum dado do aluno disponível');
            return;
        }

        // Preencher informações básicas
        this.preencherInformacoesBasicas();
        
        // Preencher e-mail
        this.preencherEmail();
        
        // Preencher endereço
        this.preencherEndereco();
        
        // Preencher telefones
        this.preencherTelefones();
        
        // Preencher informações adicionais
        this.preencherInformacoesAdicionais();
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
                console.error('Erro ao parsear endereço:', error);
                // Se não for JSON, tenta preencher como string simples
                if (typeof this.alunoData.endereco === 'string') {
                    document.getElementById('endereco-input').value = this.alunoData.endereco;
                }
            }
        }
    }

    preencherTelefones() {
        if (this.alunoData.telefone) {
            document.getElementById('telefone-pessoal').value = this.formatPhone(this.alunoData.telefone);
        }
        if (this.alunoData.telefone_emergencia) {
            document.getElementById('telefone-emergencia').value = this.formatPhone(this.alunoData.telefone_emergencia);
        }
    }

    preencherInformacoesAdicionais() {
        if (this.alunoData.alergias) {
            document.getElementById('alergias').value = this.alunoData.alergias;
        }
        if (this.alunoData.medicamentos) {
            document.getElementById('medicamentos').value = this.alunoData.medicamentos;
        }
    }

    // ===== CONFIGURAÇÃO DE NAVEGAÇÃO =====
    setupNavigation() {
        const menuItems = document.querySelectorAll('.menu-item');
        const contentSections = document.querySelectorAll('.content-section');
        
        menuItems.forEach(item => {
            item.addEventListener('click', function() {
                const section = this.dataset.section;
                
                // Remover active de todos os itens
                menuItems.forEach(i => i.classList.remove('active'));
                contentSections.forEach(s => s.classList.remove('active'));
                
                // Adicionar active ao item clicado
                this.classList.add('active');
                
                // Mostrar seção correspondente
                document.getElementById(section).classList.add('active');
                
                console.log(`📱 Navegando para: ${section}`);
            });
        });
    }

    // ===== CONFIGURAÇÃO DE EVENT LISTENERS =====
    setupEventListeners() {
        // Força da senha em tempo real
        const novaSenhaInput = document.getElementById('nova-senha');
        if (novaSenhaInput) {
            novaSenhaInput.addEventListener('input', () => this.checkPasswordStrength());
        }
        
        // Máscaras de entrada
        this.setupInputMasks();
        
        // Buscar CEP automático
        const cepInput = document.getElementById('cep-input');
        if (cepInput) {
            cepInput.addEventListener('blur', () => this.buscarCEP());
        }
    }

    setupInputMasks() {
        // Máscara de telefone
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length === 11) {
                    value = value.replace(/(\d{2})(\d)/, '($1) $2')
                               .replace(/(\d{5})(\d)/, '$1-$2');
                } else if (value.length === 10) {
                    value = value.replace(/(\d{2})(\d)/, '($1) $2')
                               .replace(/(\d{4})(\d)/, '$1-$2');
                }
                e.target.value = value;
            });
        });
        
        // Máscara de CEP
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

    // ===== FUNÇÕES DE FORMATAÇÃO =====
    formatCPF(cpf) {
        if (!cpf) return '';
        const cleaned = cpf.replace(/\D/g, '');
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    formatPhone(phone) {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length === 10) {
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return phone;
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

    // ===== FUNÇÕES PRINCIPAIS =====
    async alterarEmail() {
        if (!this.alunoData) {
            showNotification('Erro: Dados do aluno não carregados', 'error');
            return;
        }

        const novoEmail = document.getElementById('novo-email').value.trim();
        
        if (!novoEmail) {
            showNotification('Digite o novo e-mail', 'warning');
            return;
        }
        
        if (!this.isValidEmail(novoEmail)) {
            showNotification('Digite um e-mail válido', 'error');
            return;
        }

        this.showConfirmModal(
            'Alterar E-mail',
            `Tem certeza que deseja alterar seu e-mail para ${novoEmail}?`,
            async () => {
                try {
                    const { error } = await supabase
                        .from('alunos')
                        .update({ email: novoEmail })
                        .eq('id', this.alunoData.id);

                    if (error) throw error;

                    // Atualizar dados locais
                    this.alunoData.email = novoEmail;
                    document.getElementById('email-atual').value = novoEmail;
                    document.getElementById('novo-email').value = '';
                    
                    showNotification('E-mail alterado com sucesso!', 'success');
                } catch (error) {
                    console.error('Erro ao alterar e-mail:', error);
                    showNotification('Erro ao alterar e-mail', 'error');
                }
            }
        );
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

        // Validar dados obrigatórios
        if (!enderecoCompleto.logradouro || !enderecoCompleto.numero || !enderecoCompleto.bairro || !enderecoCompleto.cidade) {
            showNotification('Preencha todos os campos obrigatórios do endereço', 'warning');
            return;
        }

        this.showConfirmModal(
            'Salvar Endereço',
            'Tem certeza que deseja salvar as alterações do endereço?',
            async () => {
                try {
                    const { error } = await supabase
                        .from('alunos')
                        .update({ 
                            endereco: JSON.stringify(enderecoCompleto)
                        })
                        .eq('id', this.alunoData.id);

                    if (error) throw error;

                    this.alunoData.endereco = JSON.stringify(enderecoCompleto);
                    
                    showNotification('Endereço salvo com sucesso!', 'success');
                } catch (error) {
                    console.error('Erro ao salvar endereço:', error);
                    showNotification('Erro ao salvar endereço', 'error');
                }
            }
        );
    }

    async alterarSenha() {
        if (!this.alunoData) {
            showNotification('Erro: Dados do aluno não carregados', 'error');
            return;
        }

        const senhaAtual = document.getElementById('senha-atual').value;
        const novaSenha = document.getElementById('nova-senha').value;
        const confirmarSenha = document.getElementById('confirmar-senha').value;

        if (!senhaAtual || !novaSenha || !confirmarSenha) {
            showNotification('Preencha todos os campos de senha', 'warning');
            return;
        }

        if (novaSenha !== confirmarSenha) {
            showNotification('As senhas não coincidem', 'error');
            return;
        }

        if (novaSenha.length < 6) {
            showNotification('A nova senha deve ter pelo menos 6 caracteres', 'warning');
            return;
        }

        this.showConfirmModal(
            'Alterar Senha',
            'Tem certeza que deseja alterar sua senha?',
            async () => {
                try {
                    // SOLUÇÃO SIMPLES: Atualizar direto no banco
                    const { error } = await supabase
                        .from('alunos')
                        .update({ senha: novaSenha })
                        .eq('id', this.alunoData.id);

                    if (error) throw error;

                    this.alunoData.senha = novaSenha;

                    // Limpar campos
                    document.getElementById('senha-atual').value = '';
                    document.getElementById('nova-senha').value = '';
                    document.getElementById('confirmar-senha').value = '';

                    showNotification('Senha alterada com sucesso!', 'success');

                } catch (error) {
                    console.error('Erro ao alterar senha:', error);
                    showNotification('Erro ao alterar senha', 'error');
                }
            }
        );
    }

    async salvarContatos() {
        if (!this.alunoData) {
            showNotification('Erro: Dados do aluno não carregados', 'error');
            return;
        }

        const telefonePessoal = document.getElementById('telefone-pessoal').value;
        const telefoneResidencial = document.getElementById('telefone-residencial').value;
        const telefoneEmergencia = document.getElementById('telefone-emergencia').value;

        this.showConfirmModal(
            'Salvar Contatos',
            'Tem certeza que deseja salvar as alterações dos contatos?',
            async () => {
                try {
                    const { error } = await supabase
                        .from('alunos')
                        .update({ 
                            telefone: telefonePessoal,
                            telefone_emergencia: telefoneEmergencia
                        })
                        .eq('id', this.alunoData.id);

                    if (error) throw error;

                    this.alunoData.telefone = telefonePessoal;
                    this.alunoData.telefone_emergencia = telefoneEmergencia;

                    showNotification('Contatos salvos com sucesso!', 'success');
                } catch (error) {
                    console.error('Erro ao salvar contatos:', error);
                    showNotification('Erro ao salvar contatos', 'error');
                }
            }
        );
    }

    async salvarInformacoesAdicionais() {
        if (!this.alunoData) {
            showNotification('Erro: Dados do aluno não carregados', 'error');
            return;
        }

        const alergias = document.getElementById('alergias').value;
        const medicamentos = document.getElementById('medicamentos').value;

        this.showConfirmModal(
            'Salvar Informações',
            'Tem certeza que deseja salvar as informações adicionais?',
            async () => {
                try {
                    const { error } = await supabase
                        .from('alunos')
                        .update({ 
                            alergias: alergias,
                            medicamentos: medicamentos
                        })
                        .eq('id', this.alunoData.id);

                    if (error) throw error;

                    this.alunoData.alergias = alergias;
                    this.alunoData.medicamentos = medicamentos;

                    showNotification('Informações salvas com sucesso!', 'success');
                } catch (error) {
                    console.error('Erro ao salvar informações:', error);
                    showNotification('Erro ao salvar informações', 'error');
                }
            }
        );
    }

    // ===== FUNÇÕES AUXILIARES =====
    checkPasswordStrength() {
        const password = document.getElementById('nova-senha').value;
        const strengthBar = document.getElementById('password-strength');
        
        if (!strengthBar) return;
        
        let strength = 0;
        
        if (password.length >= 6) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
        if (password.match(/\d/)) strength++;
        if (password.match(/[^a-zA-Z\d]/)) strength++;
        
        strengthBar.className = 'password-strength';
        
        if (password.length > 0) {
            if (strength < 2) {
                strengthBar.classList.add('weak');
            } else if (strength < 4) {
                strengthBar.classList.add('medium');
            } else {
                strengthBar.classList.add('strong');
            }
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async buscarCEP() {
        const cepInput = document.getElementById('cep-input');
        const cep = cepInput.value.replace(/\D/g, '');
        
        if (cep.length !== 8) return;
        
        try {
            showNotification('Buscando CEP...', 'info');
            
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            
            if (!data.erro) {
                document.getElementById('endereco-input').value = data.logradouro;
                document.getElementById('bairro-input').value = data.bairro;
                document.getElementById('cidade-input').value = data.localidade;
                document.getElementById('estado-select').value = data.uf;
                
                // Focar no campo número após preencher
                document.getElementById('numero-input').focus();
                
                showNotification('Endereço preenchido automaticamente', 'success');
            } else {
                showNotification('CEP não encontrado', 'error');
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            showNotification('Erro ao buscar CEP', 'error');
        }
    }

    // ===== SISTEMA DE MODAL =====
    showConfirmModal(title, message, action) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalMessage').textContent = message;
        this.currentAction = action;
        
        const modal = document.getElementById('confirmationModal');
        modal.classList.add('show');
    }

    confirmAction() {
        if (this.currentAction) {
            this.currentAction();
        }
        this.hideModal();
    }

    cancelAction() {
        this.hideModal();
    }

    hideModal() {
        const modal = document.getElementById('confirmationModal');
        modal.classList.remove('show');
    }
}

// ===== SISTEMA DE NOTIFICAÇÕES =====
function showNotification(message, type = 'info') {
    // Remover notificação existente
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        info: 'info-circle',
        warning: 'exclamation-triangle'
    };
    
    const colors = {
        success: '#107C10',
        error: '#D13438',
        info: '#0078D7',
        warning: '#FFB900'
    };
    
    notification.innerHTML = `
        <i class="fas fa-${icons[type]}" style="margin-right: 8px;"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInRight 0.3s ease;
        font-family: 'Open Sans', sans-serif;
        font-size: 0.9rem;
        font-weight: 500;
        max-width: 300px;
    `;
    
    // Adicionar estilos de animação
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Auto-remover após 4 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// ===== FUNÇÕES GLOBAIS =====
let sistema;

function alterarEmail() {
    sistema.alterarEmail();
}

function salvarEndereco() {
    sistema.salvarEndereco();
}

function alterarSenha() {
    sistema.alterarSenha();
}

function salvarContatos() {
    sistema.salvarContatos();
}

function salvarInformacoesAdicionais() {
    sistema.salvarInformacoesAdicionais();
}

function confirmAction() {
    sistema.confirmAction();
}

function cancelAction() {
    sistema.cancelAction();
}

// Fechar modal clicando fora
window.addEventListener('click', (e) => {
    const modal = document.getElementById('confirmationModal');
    if (e.target === modal) {
        sistema.cancelAction();
    }
});

// Inicializar sistema quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    sistema = new ConfiguracoesSistema();
    
    // Mostrar mensagem de boas-vindas
    setTimeout(() => {
        const studentData = localStorage.getItem('alunoLogado');
        if (studentData) {
            const aluno = JSON.parse(studentData);
            showNotification(`Bem-vindo às configurações, ${aluno.nome_completo?.split(' ')[0]}! ⚙️`, 'info');
        }
    }, 1000);
});

// ===== OTIMIZAÇÕES DE PERFORMANCE =====
// Preload de imagens do header
function preloadHeaderImages() {
    const images = [
        'logo-governo-do-estado-sp.png',
        'centro-paula-souza-logo.svg',
        'Etec.png'
    ];
    
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Iniciar preload quando a página carregar
window.addEventListener('load', preloadHeaderImages);