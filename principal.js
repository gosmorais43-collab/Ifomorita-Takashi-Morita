// ===== SISTEMA DE VERIFICAÇÃO DE USUÁRIO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Sistema InfoMorita iniciado!');


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

    // Verificar se o usuário está logado
    checkAuthentication();
    
    // Inicializar sistemas comuns
    initializeThemeSystem();
    initializeZoomControls();
    initializeSocialLinks();
    initializeSearchSystem();
    
    // Carregar informações do usuário
    loadUserInfo();
    
    // Carregar conteúdo salvo
    loadSavedContent();
});

function checkAuthentication() {
    const userType = localStorage.getItem('userType');
    const alunoLogado = localStorage.getItem('alunoLogado');
    const adminLoggedIn = localStorage.getItem('adminLoggedIn');
    
    if (!userType && !alunoLogado && !adminLoggedIn) {
        // Se não está logado, redireciona para login
        window.location.href = 'login.html';
        return;
    }
    
    // Mostrar conteúdo baseado no tipo de usuário
    if (userType === 'admin' || adminLoggedIn === 'true') {
        showAdminPanel();
        initializeAdminSystems();
    } else {
        showStudentPanel();
        // Carregar recados para alunos
        carregarRecadosAluno();
    }
}

function showStudentPanel() {
    document.getElementById('studentLayout').style.display = 'flex';
    document.getElementById('adminLayout').style.display = 'none';
    initializeStudentSystems();
    console.log('🎓 Modo Aluno ativado');
}

function showAdminPanel() {
    document.getElementById('studentLayout').style.display = 'none';
    document.getElementById('adminLayout').style.display = 'flex';
    initializeAdminSystems();
    console.log('👑 Modo Administrador ativado');
}

// ===== SISTEMAS DO ALUNO =====
function initializeStudentSystems() {
    const menuItems = document.querySelectorAll('.menu-item');
    const contentSections = document.querySelectorAll('.content-section');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            if (this.id === 'logoutBtn') {
                logout();
                return;
            }
            
            const target = this.getAttribute('data-target');
            
            // Remove a classe active de todos os itens do menu
            menuItems.forEach(i => i.classList.remove('active'));
            
            // Adiciona a classe active ao item clicado
            this.classList.add('active');
            
            // Esconde todas as seções de conteúdo
            contentSections.forEach(section => section.classList.remove('active'));
            
            // Mostra a seção de conteúdo correspondente
            document.getElementById(target).classList.add('active');
            
            console.log(`📱 Navegando para: ${target}`);
        });
    });
    
    // Ativar o primeiro item do menu por padrão
    if (menuItems.length > 0) {
        menuItems[0].click();
    }
    
    initializeCardsInteractivity();
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

// ===== SISTEMAS DO ADMINISTRADOR =====
function initializeAdminSystems() {
    // Navegação do admin
    const adminMenuItems = document.querySelectorAll('.admin-menu-item[data-target]');
    const adminContentSections = document.querySelectorAll('.admin-content-section');
    
    adminMenuItems.forEach(item => {
        item.addEventListener('click', function() {
            if (this.id === 'adminLogoutBtn') {
                logout();
                return;
            }
            
            const target = this.getAttribute('data-target');
            
            // Remove a classe active de todos os itens do menu
            adminMenuItems.forEach(i => i.classList.remove('active'));
            
            // Adiciona a classe active ao item clicado
            this.classList.add('active');
            
            // Esconde todas as seções de conteúdo
            adminContentSections.forEach(section => section.classList.remove('active'));
            
            // Mostra a seção de conteúdo correspondente
            document.getElementById(target).classList.add('active');
            
            console.log(`👑 Navegando para: ${target}`);
            
            // Carregar dados específicos da seção
            if (target === 'admin-usuarios') {
                loadUsersTable();
            } else if (target === 'admin-conteudo') {
                loadAdminContentForm();
            } else if (target === 'admin-recados') {
                carregarRecadosEnviados();
                previewRecado();
            }
        });
    });
    
    // Ativar o primeiro item do menu por padrão
    if (adminMenuItems.length > 0) {
        adminMenuItems[0].click();
    }
    
    // Botões de ação do admin
    document.getElementById('adminLogoutBtn').addEventListener('click', logout);
    document.getElementById('viewStudentBtn').addEventListener('click', function() {
        showStudentPanel();
    });
    
    document.getElementById('saveAllBtn').addEventListener('click', saveAllAdminData);
    document.getElementById('saveContentBtn').addEventListener('click', saveAdminContent);
    
    // Inicializar sistema de recados
    initializeRecadosSystem();
    
    // Inicializar dashboard
    updateAdminStats();
}

function openPageAsAdmin(page) {
    const pages = {
        'horario': 'horario.html',
        'noticias': 'noticias.html',
        'chat': 'chat.html',
        'professores': 'professores.html',
        'biblioteca': 'livros.html',
        'configuracoes': 'configuracoes.html'
    };
    
    if (pages[page]) {
        // Salvar estado de admin para a página
        localStorage.setItem('adminMode', 'true');
        window.open(pages[page], '_blank');
        showNotification(`Abrindo ${page} como administrador...`, 'info');
    }
}

function updateAdminStats() {
    // Simular dados - em produção, viria do banco de dados
    setTimeout(() => {
        document.getElementById('totalUsers').textContent = '157';
        document.getElementById('totalPDFs').textContent = '23';
        document.getElementById('totalEvents').textContent = '8';
        document.getElementById('totalStudents').textContent = '156';
        document.getElementById('totalAdmins').textContent = '1';
    }, 1000);
}

function loadAdminContentForm() {
    // Carregar valores atuais nos formulários
    document.getElementById('adminSiteTitle').value = document.getElementById('site-title').textContent;
    document.getElementById('adminWelcomeMessage').value = document.getElementById('welcome-message').querySelector('p').textContent;
    document.getElementById('adminHorarioDesc').value = document.getElementById('horario-desc').textContent;
    document.getElementById('adminEventosDesc').value = document.getElementById('eventos-desc').textContent;
    document.getElementById('adminChatDesc').value = document.getElementById('chat-desc').textContent;
    document.getElementById('adminBibliotecaDesc').value = document.getElementById('biblioteca-desc').textContent;
}

function saveAdminContent() {
    // Salvar conteúdo do formulário
    const siteTitle = document.getElementById('adminSiteTitle').value;
    const welcomeMessage = document.getElementById('adminWelcomeMessage').value;
    const horarioDesc = document.getElementById('adminHorarioDesc').value;
    const eventosDesc = document.getElementById('adminEventosDesc').value;
    const chatDesc = document.getElementById('adminChatDesc').value;
    const bibliotecaDesc = document.getElementById('adminBibliotecaDesc').value;
    
    // Atualizar elementos na página do aluno
    document.getElementById('site-title').textContent = siteTitle;
    document.getElementById('welcome-message').querySelector('p').textContent = welcomeMessage;
    document.getElementById('horario-desc').textContent = horarioDesc;
    document.getElementById('eventos-desc').textContent = eventosDesc;
    document.getElementById('chat-desc').textContent = chatDesc;
    document.getElementById('biblioteca-desc').textContent = bibliotecaDesc;
    
    // Salvar no localStorage
    localStorage.setItem('admin_site_title', siteTitle);
    localStorage.setItem('admin_welcome_message', welcomeMessage);
    localStorage.setItem('admin_horario_desc', horarioDesc);
    localStorage.setItem('admin_eventos_desc', eventosDesc);
    localStorage.setItem('admin_chat_desc', chatDesc);
    localStorage.setItem('admin_biblioteca_desc', bibliotecaDesc);
    
    showNotification('Conteúdo salvo com sucesso!', 'success');
}

function loadUsersTable() {
    const usersTableBody = document.getElementById('usersTableBody');
    
    // Dados de exemplo - em produção viria de uma API
    const users = [
        { rm: '12345', nome: 'Gabriel Silva', email: 'gabriel.silva@etec.sp.gov.br', tipo: 'Aluno' },
        { rm: '12346', nome: 'Maria Santos', email: 'maria.santos@etec.sp.gov.br', tipo: 'Aluno' },
        { rm: '12347', nome: 'João Oliveira', email: 'joao.oliveira@etec.sp.gov.br', tipo: 'Aluno' },
        { rm: 'admin1', nome: 'Administrador', email: 'admin@etec.sp.gov.br', tipo: 'Administrador' }
    ];
    
    usersTableBody.innerHTML = users.map(user => `
        <tr>
            <td>${user.rm}</td>
            <td>${user.nome}</td>
            <td>${user.email}</td>
            <td>${user.tipo}</td>
            <td class="user-actions">
                <button class="cps-button primary small" onclick="editUser('${user.rm}')">
                    <i class="fas fa-edit"></i>
                </button>
                ${user.tipo === 'Aluno' ? `
                <button class="cps-button secondary small" onclick="makeAdmin('${user.rm}')">
                    <i class="fas fa-user-shield"></i>
                </button>
                ` : ''}
                <button class="cps-button secondary small" onclick="deleteUser('${user.rm}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function editUser(rm) {
    showNotification(`Editando usuário RM: ${rm}`, 'info');
}

function makeAdmin(rm) {
    if (confirm(`Tem certeza que deseja tornar o usuário RM: ${rm} um administrador?`)) {
        showNotification(`Usuário RM: ${rm} agora é administrador`, 'success');
        loadUsersTable();
    }
}

function deleteUser(rm) {
    if (confirm(`Tem certeza que deseja excluir o usuário RM: ${rm}?`)) {
        showNotification(`Usuário RM: ${rm} excluído com sucesso`, 'success');
        loadUsersTable();
    }
}

function saveAllAdminData() {
    saveAdminContent();
    showNotification('Todos os dados administrativos foram salvos!', 'success');
}

// ===== SISTEMA DE RECADOS =====
function initializeRecadosSystem() {
    // Event listeners para recados
    const enviarRecadoBtn = document.getElementById('enviarRecadoBtn');
    const previewRecadoBtn = document.getElementById('previewRecadoBtn');
    
    if (enviarRecadoBtn) {
        enviarRecadoBtn.addEventListener('click', enviarRecado);
    }
    
    if (previewRecadoBtn) {
        previewRecadoBtn.addEventListener('click', previewRecado);
    }
    
    // Atualizar preview quando os campos mudarem
    const recadoTitulo = document.getElementById('recadoTitulo');
    const recadoMensagem = document.getElementById('recadoMensagem');
    const recadoTipo = document.getElementById('recadoTipo');
    
    if (recadoTitulo) {
        recadoTitulo.addEventListener('input', previewRecado);
    }
    if (recadoMensagem) {
        recadoMensagem.addEventListener('input', previewRecado);
    }
    if (recadoTipo) {
        recadoTipo.addEventListener('change', previewRecado);
    }
}

function enviarRecado() {
    const titulo = document.getElementById('recadoTitulo').value.trim();
    const mensagem = document.getElementById('recadoMensagem').value.trim();
    const tipo = document.getElementById('recadoTipo').value;

    if (!titulo || !mensagem) {
        showNotification('Preencha o título e a mensagem do recado', 'error');
        return;
    }

    // Criar objeto do recado
    const novoRecado = {
        id: Date.now(),
        titulo: titulo,
        mensagem: mensagem,
        tipo: tipo,
        data: new Date().toISOString(),
        dataFormatada: formatarData(new Date()),
        enviadoPor: 'Administrador'
    };

    // Salvar no localStorage
    const recados = JSON.parse(localStorage.getItem('recados_globais')) || [];
    recados.unshift(novoRecado); // Adiciona no início
    localStorage.setItem('recados_globais', JSON.stringify(recados));

    // Limpar formulário
    document.getElementById('recadoTitulo').value = '';
    document.getElementById('recadoMensagem').value = '';
    document.getElementById('recadoTipo').value = 'info';

    // Atualizar listas
    carregarRecadosEnviados();
    carregarRecadosAluno();
    
    // Resetar preview
    previewRecado();

    showNotification('Recado enviado para todos os usuários!', 'success');
}

function previewRecado() {
    const previewContainer = document.getElementById('previewContainer');
    if (!previewContainer) return;

    const titulo = document.getElementById('recadoTitulo').value || 'Título do Recado';
    const mensagem = document.getElementById('recadoMensagem').value || 'Esta é uma pré-visualização de como o recado será exibido para os usuários.';
    const tipo = document.getElementById('recadoTipo').value;

    const tipoTextos = {
        'info': 'Informação',
        'aviso': 'Aviso',
        'urgente': 'Urgente',
        'evento': 'Evento'
    };

    const previewHTML = `
        <div class="recado-preview-item ${tipo}">
            <div class="recado-header">
                <span class="recado-titulo">${titulo}</span>
                <span class="recado-data">${formatarData(new Date())}</span>
            </div>
            <div class="recado-mensagem">${mensagem}</div>
            <div class="recado-tipo">${tipoTextos[tipo]}</div>
        </div>
    `;

    previewContainer.innerHTML = previewHTML;
}

function carregarRecadosEnviados() {
    const recadosList = document.getElementById('recadosList');
    if (!recadosList) return;

    const recados = JSON.parse(localStorage.getItem('recados_globais')) || [];

    if (recados.length === 0) {
        recadosList.innerHTML = '<div class="sem-recados"><i class="fas fa-bullhorn"></i><p>Nenhum recado enviado ainda</p></div>';
        return;
    }

    // Mostrar apenas os 5 mais recentes
    const recadosRecentes = recados.slice(0, 5);

    recadosList.innerHTML = recadosRecentes.map(recado => `
        <div class="recado-item">
            <div class="recado-item-header">
                <div class="recado-item-titulo">${recado.titulo}</div>
                <div class="recado-item-meta">
                    <span>${recado.dataFormatada}</span>
                    <span>•</span>
                    <span>${recado.enviadoPor}</span>
                </div>
            </div>
            <div class="recado-item-mensagem">${recado.mensagem}</div>
            <div class="recado-item-actions">
                <button class="cps-button secondary small" onclick="excluirRecado(${recado.id})">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        </div>
    `).join('');
}

function carregarRecadosAluno() {
    const recadosAlunoContainer = document.getElementById('recadosAlunoContainer');
    if (!recadosAlunoContainer) return;

    const recados = JSON.parse(localStorage.getItem('recados_globais')) || [];

    if (recados.length === 0) {
        recadosAlunoContainer.innerHTML = '<div class="sem-recados"><i class="fas fa-bullhorn"></i><p>Nenhum recado no momento</p></div>';
        return;
    }

    // Mostrar apenas os 3 mais recentes para alunos
    const recadosRecentes = recados.slice(0, 3);

    recadosAlunoContainer.innerHTML = recadosRecentes.map(recado => `
        <div class="recado-aluno-item ${recado.tipo}">
            <div class="recado-aluno-header">
                <div class="recado-aluno-titulo">${recado.titulo}</div>
                <div class="recado-aluno-data">${recado.dataFormatada}</div>
            </div>
            <div class="recado-aluno-mensagem">${recado.mensagem}</div>
            <div class="recado-aluno-tipo">${recado.tipo === 'info' ? 'Informação' : 
                                           recado.tipo === 'aviso' ? 'Aviso' : 
                                           recado.tipo === 'urgente' ? 'Urgente' : 'Evento'}</div>
        </div>
    `).join('');
}

function excluirRecado(id) {
    if (confirm('Tem certeza que deseja excluir este recado?')) {
        const recados = JSON.parse(localStorage.getItem('recados_globais')) || [];
        const recadosAtualizados = recados.filter(recado => recado.id !== id);
        localStorage.setItem('recados_globais', JSON.stringify(recadosAtualizados));
        
        carregarRecadosEnviados();
        carregarRecadosAluno();
        showNotification('Recado excluído com sucesso', 'success');
    }
}

function formatarData(data) {
    const options = { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return data.toLocaleDateString('pt-BR', options);
}

// ===== SISTEMAS COMUNS =====
function initializeThemeSystem() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Aplicar tema salvo
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeButton(newTheme);
            
            showNotification(`Modo ${newTheme === 'dark' ? 'Escuro' : 'Claro'} ativado`, 'info');
        });
    }
}

function updateThemeButton(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        if (theme === 'dark') {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i><span>Modo Claro</span>';
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i><span>Modo Escuro</span>';
        }
    }
}

function initializeZoomControls() {
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');
    
    let currentZoom = 100;
    
    if (zoomIn && zoomOut) {
        zoomIn.addEventListener('click', function() {
            if (currentZoom < 150) {
                currentZoom += 10;
                document.body.style.transform = `scale(${currentZoom / 100})`;
                document.body.style.transformOrigin = 'top center';
                showNotification(`Zoom: ${currentZoom}%`, 'info');
            } else {
                showNotification('Zoom máximo atingido (150%)', 'info');
            }
        });
        
        zoomOut.addEventListener('click', function() {
            if (currentZoom > 80) {
                currentZoom -= 10;
                document.body.style.transform = `scale(${currentZoom / 100})`;
                document.body.style.transformOrigin = 'top center';
                showNotification(`Zoom: ${currentZoom}%`, 'info');
            } else {
                showNotification('Zoom mínimo atingido (80%)', 'info');
            }
        });
    }
}

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

function initializeSearchSystem() {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (!searchTerm) {
            showNotification('Digite algo para pesquisar', 'warning');
            return;
        }
        
        showNotification(`Buscando por: ${searchTerm}`, 'info');
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

function initializeCardsInteractivity() {
    const cards = document.querySelectorAll('.cps-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
            this.style.boxShadow = '0 12px 30px rgba(0, 120, 215, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        });
    });
}

function loadUserInfo() {
    const userData = localStorage.getItem('alunoLogado');
    const userInfo = document.querySelector('.user-info');
    
    if (userData && userInfo) {
        try {
            const user = JSON.parse(userData);
            userInfo.innerHTML = `
                <div class="user-welcome" style="
                    background: var(--cps-azul-claro);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    box-shadow: 0 2px 8px rgba(0,120,215,0.3);
                ">
                    <div style="font-weight: 600;">Bom-vindos, ${user.nome.split(' ')[0]}</div>
                    <div style="font-size: 0.8rem; opacity: 0.9;">DAL 2018/01</div>
                </div>
            `;
        } catch (error) {
            console.error('❌ Erro ao carregar informações do usuário:', error);
            userInfo.innerHTML = `
                <div class="user-welcome" style="
                    background: var(--cps-azul-claro);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 0.9rem;
                ">
                    👋 Bem-vindo ao InfoMorita
                </div>
            `;
        }
    } else if (userInfo) {
        userInfo.innerHTML = `
            <div class="user-welcome" style="
                background: var(--cps-azul-claro);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 0.9rem;
            ">
                👋 Bem-vindo ao InfoMorita
            </div>
        `;
    }
}

function loadSavedContent() {
    // Carregar conteúdo salvo do admin
    const siteTitle = localStorage.getItem('admin_site_title');
    const welcomeMessage = localStorage.getItem('admin_welcome_message');
    const horarioDesc = localStorage.getItem('admin_horario_desc');
    const eventosDesc = localStorage.getItem('admin_eventos_desc');
    const chatDesc = localStorage.getItem('admin_chat_desc');
    const bibliotecaDesc = localStorage.getItem('admin_biblioteca_desc');
    
    if (siteTitle) document.getElementById('site-title').textContent = siteTitle;
    if (welcomeMessage) document.getElementById('welcome-message').querySelector('p').textContent = welcomeMessage;
    if (horarioDesc) document.getElementById('horario-desc').textContent = horarioDesc;
    if (eventosDesc) document.getElementById('eventos-desc').textContent = eventosDesc;
    if (chatDesc) document.getElementById('chat-desc').textContent = chatDesc;
    if (bibliotecaDesc) document.getElementById('biblioteca-desc').textContent = bibliotecaDesc;
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        info: 'info-circle',
        warning: 'exclamation-triangle'
    };
    
    notification.innerHTML = `
        <i class="fas fa-${icons[type]}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(notification);
    
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

// ===== FUNÇÕES AUXILIARES =====
function navigateTo(page) {
    console.log(`📍 Navegando para: ${page}`);
    showNotification(`Abrindo ${page}...`, 'info');
}

function logout() {
    // Limpar dados de login
    localStorage.removeItem('alunoLogado');
    localStorage.removeItem('userType');
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminMode');
    
    showNotification('Saindo do sistema...', 'info');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// ===== INICIALIZAÇÃO FINAL =====
window.addEventListener('load', function() {
    // Mostrar mensagem de boas-vindas
    setTimeout(() => {
        const userType = localStorage.getItem('userType');
        const userData = localStorage.getItem('alunoLogado');
        
        if (userType === 'admin') {
            showNotification('Bem-vindo ao Painel Administrativo! 👑', 'success');
        } else if (userData) {
            const user = JSON.parse(userData);
            showNotification(`Bem-vindo de volta, ${user.nome.split(' ')[0]}! 🎓`, 'success');
        } else {
            showNotification('Bem-vindo ao InfoMorita! 🌟', 'info');
        }
    }, 1000);

});
