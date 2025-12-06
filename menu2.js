// CONFIGURAÇÃO DO SUPABASE
const SUPABASE_URL = 'https://caadqubmelbbdnzdmqpf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_LcLLXnNaNUkhgIxv9Uh3Gg_bhoWkHAG';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const API_BASE = "https://lfomorita.onrender.com";

async function login(rm, senha) {
  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rm, senha })
  });
  const data = await response.json();
  console.log(data);
}

// SENHA DA DIRETORIA
const ADMIN_PASSWORD = "diretor123";

console.log('🚀 Sistema ETEC Takashi Morita iniciado!');

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM Carregado - Configurando eventos...');
    
    // ===== SISTEMA DE ZOOM =====
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
                    showMessage(`Zoom: ${currentZoom}%`, 'info');
                } else {
                    showMessage('Zoom máximo atingido (150%)', 'info');
                }
            });
            
            zoomOut.addEventListener('click', function() {
                if (currentZoom > 50) {
                    currentZoom -= 10;
                    document.body.style.zoom = currentZoom + '%';
                    console.log(`🔍 Zoom diminuído para: ${currentZoom}%`);
                    showMessage(`Zoom: ${currentZoom}%`, 'info');
                } else {
                    showMessage('Zoom mínimo atingido (50%)', 'info');
                }
            });

            console.log('✅ Controles de zoom inicializados');
        } else {
            console.log('❌ Controles de zoom não encontrados');
        }
    }

    // ===== SISTEMA DE NAVEGAÇÃO =====
    function initializeNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const contentTabs = document.querySelectorAll('.content-tab');
        
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class de todos
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                contentTabs.forEach(tab => {
                    tab.classList.remove('active');
                });
                
                // Adiciona active class ao item clicado
                this.parentElement.classList.add('active');
                const tabId = this.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
                
                console.log(`📱 Navegando para: ${tabId}`);
            });
        });
    }

    // ===== SISTEMA DE MODAIS =====
    function initializeModalSystem() {
        const userTypeModal = document.getElementById('userTypeModal');
        const adminLoginModal = document.getElementById('adminLoginModal');
        
        // Abrir modal de seleção de usuário ao clicar em Login
        const loginNav = document.querySelector('[data-tab="login"]');
        if (loginNav) {
            loginNav.addEventListener('click', function() {
                userTypeModal.style.display = 'flex';
            });
        }

        // Seleção de tipo de usuário
        const userTypeCards = document.querySelectorAll('.user-type-card');
        userTypeCards.forEach(card => {
            card.addEventListener('click', function() {
                const userType = this.getAttribute('data-type');
                
                if (userType === 'student') {
                    userTypeModal.style.display = 'none';
                    // Foca no formulário de login de aluno
                    document.getElementById('username')?.focus();
                } else if (userType === 'admin') {
                    userTypeModal.style.display = 'none';
                    adminLoginModal.style.display = 'flex';
                    document.getElementById('adminPassword')?.focus();
                }
            });
        });

        // Login administrativo - REDIRECIONA PARA PRINCIPAL.HTML
        const adminLoginForm = document.getElementById('adminLoginForm');
        if (adminLoginForm) {
            adminLoginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const password = document.getElementById('adminPassword').value;
                
                if (password === ADMIN_PASSWORD) {
                    showMessage('Acesso administrativo concedido!', 'success');
                    adminLoginModal.style.display = 'none';
                    
                    // Salvar no localStorage que é admin
                    localStorage.setItem('userType', 'admin');
                    localStorage.setItem('adminLoggedIn', 'true');
                    
                    // Redirecionar para principal.html após 1.5 segundos
                    setTimeout(() => {
                        window.location.href = 'principal.html';
                    }, 1500);
                } else {
                    showMessage('Senha administrativa incorreta!', 'error');
                }
            });
        }

        // Fechar modais
        const closeButtons = document.querySelectorAll('.close-modal');
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                userTypeModal.style.display = 'none';
                adminLoginModal.style.display = 'none';
            });
        });
    }

    // ===== SISTEMA DE CADASTRO =====
    function initializeRegistrationSystem() {
        const registerToggle = document.getElementById('registerToggle');
        const registerForm = document.getElementById('registerForm');
        const cancelRegister = document.getElementById('cancelRegister');
        
        if (registerToggle && registerForm) {
            registerToggle.addEventListener('click', function() {
                const isVisible = registerForm.style.display === 'block';
                registerForm.style.display = isVisible ? 'none' : 'block';
                registerToggle.classList.toggle('active', !isVisible);
            });
            
            if (cancelRegister) {
                cancelRegister.addEventListener('click', function() {
                    registerForm.style.display = 'none';
                    registerToggle.classList.remove('active');
                });
            }
        }
    }

    // ===== MÁSCARAS DE FORMULÁRIO =====
    function initializeInputMasks() {
        const cpfInput = document.getElementById('cpf');
        if (cpfInput) {
            cpfInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length <= 11) {
                    value = value.replace(/(\d{3})(\d)/, '$1.$2')
                                 .replace(/(\d{3})(\d)/, '$1.$2')
                                 .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                }
                e.target.value = value;
            });
        }
        
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
    }

    // ===== SISTEMA DE LOGIN =====
function initializeLoginSystem() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('🔐 Tentando login...');

            const rm = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (!rm || !password) {
                showMessage('Preencha todos os campos!', 'error');
                return;
            }

            const submitButton = this.querySelector('button');
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
            submitButton.disabled = true;

            try {
                // CHAMAR O BACKEND (rota /login) em vez de buscar diretamente do Supabase
                const response = await fetch('http://localhost:3000/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ rm, senha: password })
                });

                const result = await response.json();

                if (!response.ok || !result.sucesso) {
                    throw new Error(result.erro || 'Erro ao efetuar login');
                }

                const aluno = result.aluno;

                console.log('✅ Login bem-sucedido pelo backend:', aluno.nome_completo);
                showMessage(`Bem-vindo, ${aluno.nome_completo}!`, 'success');
                submitButton.innerHTML = '<i class="fas fa-check"></i> Sucesso!';

                localStorage.setItem('alunoLogado', JSON.stringify({
                    id: aluno.id,
                    nome: aluno.nome_completo,
                    rm: aluno.rm,
                    email: aluno.email,
                    telefone: aluno.telefone || ''
                }));

                localStorage.setItem('userType', 'student');

                setTimeout(() => {
                    window.location.href = 'principal.html';
                }, 1500);

            } catch (error) {
                console.error('❌ Erro login:', error);
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
                showMessage(error.message, 'error');
            }
        });
    }
}

    // ===== CADASTRO DE ALUNOS =====
    function initializeStudentRegistration() {
        const studentRegisterForm = document.getElementById('studentRegisterForm');
        if (studentRegisterForm) {
            studentRegisterForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                console.log('📝 Iniciando cadastro de aluno...');
                
                const submitButton = this.querySelector('button[type="submit"]');
                const originalText = submitButton.innerHTML;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cadastrando...';
                submitButton.disabled = true;
                
                try {
                    const alunoData = {
                        rm: document.getElementById('rm').value,
                        senha: document.getElementById('registerPassword').value,
                        nome_completo: document.getElementById('fullName').value,
                        email: document.getElementById('email').value,
                        telefone: document.getElementById('phone').value,
                        cpf: document.getElementById('cpf').value,
                        data_nascimento: document.getElementById('birthDate').value,
                        turma_id: document.getElementById('turma').value,
                        nome_responsavel: document.getElementById('responsibleName').value,
                        telefone_emergencia: document.getElementById('emergencyPhone').value,
                        endereco: document.getElementById('address').value,
                        alergias: document.getElementById('allergies').value,
                        medicamentos: document.getElementById('medications').value,
                        created_at: new Date().toISOString()
                    };
                    
                    if (!alunoData.rm || !alunoData.senha || !alunoData.nome_completo || !alunoData.email || !alunoData.turma_id) {
                        throw new Error('Preencha todos os campos obrigatórios!');
                    }
                    
                    // Envie os dados para o seu backend local
const response = await fetch("http://localhost:3000/registrar", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(alunoData)
});
const result = await response.json();

if (result.sucesso) {
    console.log('✅ Aluno cadastrado com sucesso via backend');
    showMessage('Aluno cadastrado com sucesso!', 'success');
    submitButton.innerHTML = '<i class="fas fa-check"></i> Cadastrado!';
    studentRegisterForm.reset();

    setTimeout(() => {
        const registerForm = document.getElementById('registerForm');
        const registerToggle = document.getElementById('registerToggle');
        if (registerForm && registerToggle) {
            registerForm.style.display = 'none';
            registerToggle.classList.remove('active');
        }
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }, 2000);
} else {
    showMessage(result.erro || 'Erro ao cadastrar aluno!', 'error');
    submitButton.innerHTML = originalText;
    submitButton.disabled = false;
}
                    setTimeout(() => {
                        const registerForm = document.getElementById('registerForm');
                        const registerToggle = document.getElementById('registerToggle');
                        if (registerForm && registerToggle) {
                            registerForm.style.display = 'none';
                            registerToggle.classList.remove('active');
                        }
                        submitButton.innerHTML = originalText;
                        submitButton.disabled = false;
                    }, 2000);
                    
                } catch (error) {
                    console.error('❌ Erro no cadastro:', error);
                    submitButton.innerHTML = originalText;
                    submitButton.disabled = false;
                    showMessage(error.message, 'error');
                }
            });
        }
    }

    // ===== INTERATIVIDADE DOS COMPONENTES =====
    function initializeComponentsInteractivity() {
        // Cards de cursos
        const courseCards = document.querySelectorAll('.course-card');
        courseCards.forEach(card => {
            const button = card.querySelector('.cps-button');
            if (button) {
                button.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const courseTitle = card.querySelector('h3').textContent;
                    showMessage(`Mais informações sobre o curso de ${courseTitle} em breve!`, 'info');
                });
            }
        });

        // Eventos da timeline
        const timelineEvents = document.querySelectorAll('.timeline-event');
        timelineEvents.forEach(event => {
            event.addEventListener('click', function() {
                const year = this.querySelector('.event-year').textContent;
                const title = this.querySelector('h3').textContent;
                showMessage(`Evento de ${year}: ${title}`, 'info');
            });
        });
    }

    // ===== SISTEMA DE MENSAGENS =====
    function showMessage(message, type = 'info') {
        const existing = document.querySelector('.message-popup');
        if (existing) existing.remove();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-popup ${type}`;
        
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'exclamation-circle';
        
        messageDiv.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => messageDiv.remove(), 300);
        }, 5000);
    }

    // ===== INICIALIZAR TODOS OS SISTEMAS =====
    function initializeAllSystems() {
        initializeNavigation();
        initializeModalSystem();
        initializeRegistrationSystem();
        initializeInputMasks();
        initializeLoginSystem();
        initializeStudentRegistration();
        initializeComponentsInteractivity();
        initializeZoomControls();
        
        console.log('🎯 Todos os sistemas foram inicializados!');
        
        // Mostrar mensagem de boas-vindas
        setTimeout(() => {
            showMessage('Bem-vindo ao portal da ETEC Takashi Morita!', 'info');
        }, 1000);
    }

    // INICIAR
    initializeAllSystems();
});


