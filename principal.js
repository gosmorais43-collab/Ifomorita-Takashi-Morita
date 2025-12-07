// ===== SISTEMA DE VERIFICAÇÃO DE USUÁRIO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Sistema InfoMorita iniciado!');

    // ✅ Corrigido: usar o mesmo domínio do backend
    const API_BASE = "https://ifomorita.onrender.com";

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
        window.location.href = 'login.html';
        return;
    }

    if (userType === 'admin' || adminLoggedIn === 'true') {
        showAdminPanel();
        initializeAdminSystems();
    } else {
        showStudentPanel();
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
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            contentSections.forEach(section => section.classList.remove('active'));
            document.getElementById(target).classList.add('active');

            console.log(`📱 Navegando para: ${target}`);
        });
    });

    if (menuItems.length > 0) {
        menuItems[0].click();
    }

    initializeCardsInteractivity();
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

// ===== SISTEMAS DO ADMINISTRADOR =====
function initializeAdminSystems() {
    const adminMenuItems = document.querySelectorAll('.admin-menu-item[data-target]');
    const adminContentSections = document.querySelectorAll('.admin-content-section');

    adminMenuItems.forEach(item => {
        item.addEventListener('click', function() {
            if (this.id === 'adminLogoutBtn') {
                logout();
                return;
            }

            const target = this.getAttribute('data-target');
            adminMenuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            adminContentSections.forEach(section => section.classList.remove('active'));
            document.getElementById(target).classList.add('active');

            console.log(`👑 Navegando para: ${target}`);

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

    if (adminMenuItems.length > 0) {
        adminMenuItems[0].click();
    }

    document.getElementById('adminLogoutBtn').addEventListener('click', logout);
    document.getElementById('viewStudentBtn').addEventListener('click', showStudentPanel);
    document.getElementById('saveAllBtn').addEventListener('click', saveAllAdminData);
    document.getElementById('saveContentBtn').addEventListener('click', saveAdminContent);

    initializeRecadosSystem();
    updateAdminStats();
}

// ===== USUÁRIOS =====
function loadUsersTable() {
    const usersTableBody = document.getElementById('usersTableBody');
    const users = [
        { rm: '12345', nome: 'Gabriel Silva', email: 'gabriel.silva@etec.sp.gov.br', tipo: 'Aluno' },
        { rm: '12346', nome: 'Maria Santos', email: 'maria.santos@etec.sp.gov.br', tipo: 'Aluno' },
        { rm: '12347', nome: 'João Oliveira', email: 'joao.oliveira@etec.sp.gov.br', tipo: 'Aluno' },
        { rm: 'admin1', nome: 'Administrador', email: 'admin@etec.sp.gov.br', tipo: 'Administrador' }
    ];

    usersTableBody.innerHTML = "";
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.rm}</td>
            <td>${user.nome}</td>
            <td>${user.email}</td>
            <td>${user.tipo}</td>
            <td class="user-actions"></td>
        `;
        const actions = tr.querySelector('.user-actions');

        const editBtn = document.createElement('button');
        editBtn.className = "cps-button primary small";
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.addEventListener('click', () => editUser(user.rm));
        actions.appendChild(editBtn);

        if (user.tipo === 'Aluno') {
            const makeAdminBtn = document.createElement('button');
            makeAdminBtn.className = "cps-button secondary small";
            makeAdminBtn.innerHTML = '<i class="fas fa-user-shield"></i>';
            makeAdminBtn.addEventListener('click', () => makeAdmin(user.rm));
            actions.appendChild(makeAdminBtn);
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.className = "cps-button secondary small";
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', () => deleteUser(user.rm));
        actions.appendChild(deleteBtn);

        usersTableBody.appendChild(tr);
    });
}

function editUser(rm) { showNotification(`Editando usuário RM: ${rm}`, 'info'); }
function makeAdmin(rm) {
    if (confirm(`Tornar RM: ${rm} administrador?`)) {
        showNotification(`Usuário RM: ${rm} agora é administrador`, 'success');
        loadUsersTable();
    }
}
function deleteUser(rm) {
    if (confirm(`Excluir RM: ${rm}?`)) {
        showNotification(`Usuário RM: ${rm} excluído`, 'success');
        loadUsersTable();
    }
}

// ===== SISTEMA DE RECADOS =====
// (mantido igual, mas sem onclick inline — usamos addEventListener nos botões)

// ===== FUNÇÃO DE INTERATIVIDADE DOS CARDS =====
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

// ===== FUNÇÃO DE NAVEGAÇÃO =====
function navigateTo(page) {
    console.log(`📍 Navegando para: ${page}`);
    showNotification(`Abrindo ${page}...`, 'info');

    const section = document.getElementById(page);
    if (section) {
        document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
        section.classList.add('active');
    }
}

// ===== BLOCO DE BOAS-VINDAS DO USUÁRIO =====
function loadUserInfo() {
    const userData = localStorage.getItem('alunoLogado');
    const userInfo = document.querySelector('.user-info');

    if (userData && userInfo) {
        try {
            const user = JSON.parse(userData);
            userInfo.innerHTML = `
                <div class="user-welcome">
                    <div class="user-name">Bem-vindo, ${user.nome.split(' ')[0]}</div>
                    <div class="user-extra">DAL 2018/01</div>
                </div>
            `;
        } catch (error) {
            console.error('❌ Erro ao carregar informações do usuário:', error);
            userInfo.innerHTML = `<div class="user-welcome">👋 Bem-vindo ao InfoMorita</div>`;
        }
    } else if (userInfo) {
        userInfo.innerHTML = `<div class="user-welcome">👋 Bem-vindo ao InfoMorita</div>`;
    }
}


function navigateTo(page) {
    console.log(`📍 Navegando para: ${page}`);
    showNotification(`Abrindo ${page}...`, 'info');

    // Ativar a seção correspondente
    const section = document.getElementById(page);
    if (section) {
        document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
        section.classList.add('active');
    }
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
function carregarRecadosAluno() {
    const recadosAlunoContainer = document.getElementById('recadosAlunoContainer');
    if (!recadosAlunoContainer) return;

    const recados = JSON.parse(localStorage.getItem('recados_globais')) || [];

    if (recados.length === 0) {
        recadosAlunoContainer.innerHTML = `
            <div class="sem-recados">
                <i class="fas fa-bullhorn"></i>
                <p>Nenhum recado no momento</p>
            </div>
        `;
        return;
    }

    const recadosRecentes = recados.slice(0, 3);

    recadosAlunoContainer.innerHTML = recadosRecentes.map(recado => `
        <div class="recado-aluno-item ${recado.tipo}">
            <div class="recado-aluno-header">
                <div class="recado-aluno-titulo">${recado.titulo}</div>
                <div class="recado-aluno-data">${recado.dataFormatada}</div>
            </div>
            <div class="recado-aluno-mensagem">${recado.mensagem}</div>
            <div class="recado-aluno-tipo">
                ${recado.tipo === 'info' ? 'Informação' :
                  recado.tipo === 'aviso' ? 'Aviso' :
                  recado.tipo === 'urgente' ? 'Urgente' : 'Evento'}
            </div>
        </div>
    `).join('');
}


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
        zoomIn.addEventListener('click', function () {
            if (currentZoom < 150) {
                currentZoom += 10;
                document.body.style.transform = `scale(${currentZoom / 100})`;
                document.body.style.transformOrigin = 'top center';
                showNotification(`Zoom: ${currentZoom}%`, 'info');
            } else {
                showNotification('Zoom máximo atingido (150%)', 'info');
            }
        });

        zoomOut.addEventListener('click', function () {
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





