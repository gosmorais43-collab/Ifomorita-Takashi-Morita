// CONFIGURAÇÃO DO SUPABASE
const SUPABASE_URL = 'https://caadqubmelbbdnzdmqpf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_LcLLXnNaNUkhgIxv9Uh3Gg_bhoWkHAG';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== ESTADO GLOBAL =====
let chatState = {
    currentUser: null,
    userRole: null,
    userId: null,
    userRM: null,
    userName: null,
    
    currentDepartment: 'all',
    messages: [],
    isTyping: false,
    
    selectedStudent: null,
    adminMessages: new Map(),
    studentsList: [],
    
    refreshInterval: null,
    isInitialized: false
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Sistema de Chat iniciado...');
    
    // Inicializar sistemas do header
    initializeHeaderSystems();
    
    // Inicializar chat baseado na autenticação
    initializeFromYourSystem();
    
    // Adicionar estilos dinâmicos
    addDynamicStyles();
});

// ===== FUNÇÕES DE ESTILO DINÂMICO =====
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Garantir quebra de texto em todos os elementos */
        .force-text-break {
            overflow-wrap: break-word !important;
            word-wrap: break-word !important;
            word-break: break-word !important;
            hyphens: auto !important;
        }
        
        /* Estilo para mensagens muito longas */
        .message-long {
            max-width: 90% !important;
        }
        
        .message-very-long {
            max-width: 95% !important;
        }
        
        /* Para textos sem espaços */
        .break-all {
            word-break: break-all !important;
        }
        
        /* Animação para mensagens novas */
        @keyframes highlightMessage {
            0% { background-color: rgba(59, 130, 246, 0.1); }
            100% { background-color: transparent; }
        }
        
        .message-new {
            animation: highlightMessage 1s ease;
        }
    `;
    document.head.appendChild(style);
}

// ===== INICIALIZAÇÃO DO SISTEMA =====
function initializeFromYourSystem() {
    console.log('🔐 Verificando autenticação do sistema...');
    
    // 1. Verificar se é administrador
    const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true' || 
                         localStorage.getItem('userType') === 'admin';
    
    if (adminLoggedIn) {
        console.log('👔 Usuário identificado como ADMINISTRADOR');
        
        const userData = {
            id: 'admin',
            name: 'Administrador',
            role: 'admin'
        };
        
        initializeChat(userData);
        showNotification('Bem-vindo, Administrador!', 'success');
        return;
    }
    
    // 2. Verificar se é aluno
    const alunoLogado = localStorage.getItem('alunoLogado');
    
    if (alunoLogado) {
        try {
            const alunoData = JSON.parse(alunoLogado);
            console.log('🎓 Aluno logado encontrado:', alunoData);
            
            if (alunoData.rm) {
                const userData = {
                    id: `aluno_${alunoData.rm}`,
                    rm: alunoData.rm.toString(),
                    name: alunoData.nome || `Aluno ${alunoData.rm}`,
                    role: 'student'
                };
                
                initializeChat(userData);
                showNotification(`Bem-vindo ao chat, ${userData.name}!`, 'success');
                return;
            }
        } catch (error) {
            console.error('❌ Erro ao analisar dados do aluno:', error);
        }
    }
    
    // 3. Verificar localStorage direto
    const directRM = localStorage.getItem('studentRM') || localStorage.getItem('rm');
    const directName = localStorage.getItem('studentName') || localStorage.getItem('nome');
    
    if (directRM) {
        console.log('📦 Dados encontrados no localStorage');
        
        const userData = {
            id: `aluno_${directRM}`,
            rm: directRM,
            name: directName || `Aluno ${directRM}`,
            role: 'student'
        };
        
        initializeChat(userData);
        showNotification(`Bem-vindo, ${userData.name}!`, 'success');
        return;
    }
    
    // 4. Mostrar opções de autenticação
    showAuthenticationOptions();
}

// ===== INICIALIZAÇÃO DO CHAT =====
function initializeChat(userData) {
    console.log('👤 Inicializando chat para:', userData);
    
    // Evitar inicialização dupla
    if (chatState.isInitialized) {
        console.log('⚠️ Chat já inicializado');
        return;
    }
    
    // Salvar estado do usuário
    chatState.currentUser = userData;
    chatState.userRole = userData.role;
    chatState.userId = userData.id;
    chatState.userRM = userData.rm;
    chatState.userName = userData.name;
    
    // Atualizar interface
    updateUserInterface();
    setupChatInterface();
    
    // Inicializar sistemas de chat
    if (userData.role === 'admin') {
        initializeAdminChat();
    } else {
        initializeStudentChat();
    }
    
    // Iniciar sistema de atualização automática
    setupAutoRefresh();
    
    chatState.isInitialized = true;
    console.log('✅ Chat inicializado com sucesso');
}

// ===== SISTEMA DE ARMAZENAMENTO LOCAL =====

// Gerar ID único para mensagens
function generateMessageId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Formatar texto para garantir quebras adequadas
function formatMessageText(text) {
    if (!text || typeof text !== 'string') return '';
    
    // Remover espaços em branco extras
    text = text.trim();
    
    // Se for texto muito longo sem espaços, adicionar quebras
    if (text.length > 50 && !text.includes(' ')) {
        // Quebrar a cada 30 caracteres
        return text.match(/.{1,30}/g).join(' ');
    }
    
    // Para textos muito longos, garantir quebras
    if (text.length > 200) {
        return text.split(' ').map(word => {
            if (word.length > 30) {
                // Quebrar palavras muito longas
                return word.match(/.{1,30}/g).join(' ');
            }
            return word;
        }).join(' ');
    }
    
    return text;
}

// Salvar mensagem no localStorage


function saveMessageToLocalStorage(message) {
    try {
        // Formatar o texto antes de salvar
        message.message_text = formatMessageText(message.message_text);
        
        // Obter todas as mensagens
        const allMessages = getAllMessagesFromLocalStorage();
        
        // Adicionar nova mensagem
        allMessages.push(message);
        
        // Salvar de volta no localStorage (limitado a 1000 mensagens)
        const toSave = allMessages.slice(-1000);
        localStorage.setItem('chat_messages', JSON.stringify(toSave));
        
        console.log('💾 Mensagem salva:', message.id);
        return true;
    } catch (error) {
        console.error('❌ Erro ao salvar mensagem:', error);
        return false;
    }
}
async function sendMessage(text) {
  const senderId = localStorage.getItem('sender_id');
  const senderName = localStorage.getItem('sender_name');

  await supabase.from('messages').insert([{
    sender_id: senderId,
    sender_name: senderName,
    sender_role: "admin",
    receiver_id: "2024001", // exemplo: aluno
    message_text: text,
    department: "all",
    is_read: false,
    created_at: new Date().toISOString()
  }]);
}


// Obter todas as mensagens do localStorage
function getAllMessagesFromLocalStorage() {
    try {
        const messages = localStorage.getItem('chat_messages');
        return messages ? JSON.parse(messages) : [];
    } catch (error) {
        console.error('❌ Erro ao obter mensagens:', error);
        return [];
    }
}

// Obter mensagens de um usuário específico
function getMessagesForUser(userId) {
    const allMessages = getAllMessagesFromLocalStorage();
    return allMessages.filter(message => 
        message.sender_id === userId || message.receiver_id === userId
    );
}

// Obter mensagens entre admin e um aluno específico
function getMessagesBetweenAdminAndStudent(studentRm) {
    const allMessages = getAllMessagesFromLocalStorage();
    return allMessages.filter(message => 
        (message.sender_id === 'admin' && message.receiver_id === `aluno_${studentRm}`) ||
        (message.sender_id === `aluno_${studentRm}` && message.receiver_id === 'admin')
    );
}

// Obter todos os alunos que enviaram mensagens
function getStudentsFromMessages() {
    const allMessages = getAllMessagesFromLocalStorage();
    const studentsMap = new Map();
    
    allMessages.forEach(message => {
        if (message.sender_role === 'student' && message.sender_rm) {
            if (!studentsMap.has(message.sender_rm)) {
                studentsMap.set(message.sender_rm, {
                    id: message.sender_id,
                    rm: message.sender_rm,
                    nome_completo: message.sender_name || `Aluno ${message.sender_rm}`,
                    turma_id: message.sender_class || 'Não informada',
                    lastMessage: message.created_at
                });
            } else {
                // Atualizar última mensagem se for mais recente
                const existing = studentsMap.get(message.sender_rm);
                if (new Date(message.created_at) > new Date(existing.lastMessage)) {
                    existing.lastMessage = message.created_at;
                }
            }
        }
    });
    
    return Array.from(studentsMap.values());
}

// ===== CHAT DO ALUNO =====
function initializeStudentChat() {
    console.log('🎓 Inicializando chat do aluno...');
    
    setupStudentEventListeners();
    loadStudentMessages();
    setupDepartments();
    
    // Garantir que o layout seja ajustado
    setTimeout(adjustStudentLayout, 100);
}

function setupStudentEventListeners() {
    console.log('🎓 Configurando event listeners do aluno...');
    
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.querySelector('.send-btn');
    
    if (messageInput) {
        // Auto-expandir textarea
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            const newHeight = Math.min(this.scrollHeight, 120);
            this.style.height = newHeight + 'px';
            
            // Ajustar layout se necessário
            adjustStudentLayout();
        });

        // Enviar com Enter (sem Shift)
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendStudentMessage();
            }
        });
        
        // Focar no input
        setTimeout(() => {
            messageInput.focus();
            showNotification('Digite sua mensagem e pressione Enter para enviar', 'info');
        }, 500);
    }
    
    if (sendBtn) {
        sendBtn.addEventListener('click', function(e) {
            e.preventDefault();
            sendStudentMessage();
        });
    }
}

function adjustStudentLayout() {
    const messagesContainer = document.getElementById('messagesContainer');
    const inputArea = document.querySelector('.message-input-area');
    
    if (messagesContainer && inputArea) {
        // Calcular altura disponível
        const chatArea = document.querySelector('.chat-main-area');
        const header = document.querySelector('.chat-conversation-header');
        
        if (chatArea && header) {
            const availableHeight = chatArea.clientHeight - header.clientHeight - inputArea.clientHeight;
            messagesContainer.style.maxHeight = availableHeight + 'px';
        }
    }
}

function loadStudentMessages() {
    try {
        console.log('📥 Carregando mensagens do aluno...');
        
        chatState.messages = getMessagesForUser(chatState.userId);
        
        // Ordenar por data
        chatState.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        
        renderStudentMessages();
        console.log(`✅ ${chatState.messages.length} mensagens carregadas`);
        
    } catch (error) {
        console.error('❌ Erro ao carregar mensagens:', error);
        chatState.messages = [];
        renderStudentMessages();
    }
}

function renderStudentMessages() {
    const container = document.getElementById('messagesContainer');
    if (!container) {
        console.error('❌ Container de mensagens não encontrado!');
        return;
    }
    
    // Limpar container
    container.innerHTML = '';
    
    if (chatState.messages.length === 0) {
        container.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">
                    <i class="fas fa-comments"></i>
                </div>
                <h3>Bem-vindo ao Chat com a Diretoria!</h3>
                <p>Inicie uma conversa enviando uma mensagem abaixo.</p>
            </div>
        `;
        return;
    }
    
    // Adicionar mensagens
    chatState.messages.forEach((message, index) => {
        const messageElement = createMessageElement(message, index);
        container.appendChild(messageElement);
    });
    
    // Rolagem para baixo
    scrollToBottom('messagesContainer');
}

function createMessageElement(message, index) {
    const isUserMessage = message.sender_id === chatState.userId;
    const isLongMessage = message.message_text && message.message_text.length > 100;
    const isVeryLongMessage = message.message_text && message.message_text.length > 200;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUserMessage ? 'user' : 'admin'}`;
    
    if (isLongMessage) messageDiv.classList.add('message-long');
    if (isVeryLongMessage) messageDiv.classList.add('message-very-long');
    if (index === chatState.messages.length - 1) messageDiv.classList.add('message-new');
    
    messageDiv.dataset.id = message.id;
    messageDiv.dataset.index = index;

    // Avatar
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = isUserMessage ? '<i class="fas fa-user"></i>' : '<i class="fas fa-user-tie"></i>';

    // Conteúdo
    const content = document.createElement('div');
    content.className = 'message-content force-text-break';
    
    // Header
    const header = document.createElement('div');
    header.className = 'message-header';
    
    const senderName = document.createElement('span');
    senderName.className = 'message-sender';
    senderName.textContent = isUserMessage ? 'Você' : (message.sender_name || 'Diretoria');
    
    const time = document.createElement('span');
    time.className = 'message-time';
    time.textContent = formatTime(message.created_at);
    
    header.appendChild(senderName);
    header.appendChild(time);
    
    // Texto
    const text = document.createElement('div');
    text.className = 'message-text force-text-break';
    text.textContent = message.message_text || '';
    
    // Se for texto sem espaços, forçar quebra
    if (message.message_text && !message.message_text.includes(' ')) {
        text.classList.add('break-all');
    }
    
    content.appendChild(header);
    content.appendChild(text);
    
    // Status (apenas para mensagens do usuário)
    if (isUserMessage) {
        const status = document.createElement('div');
        status.className = 'message-status';
        status.innerHTML = message.is_read ? 
            '<i class="fas fa-check-double"></i> Lida' : 
            '<i class="fas fa-check"></i> Enviada';
        content.appendChild(status);
    }
    
    // Montar mensagem
    if (isUserMessage) {
        messageDiv.appendChild(content);
        messageDiv.appendChild(avatar);
    } else {
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
    }
    
    return messageDiv;
}

function sendStudentMessage() {
    const input = document.getElementById('messageInput');
    const sendBtn = document.querySelector('.send-btn');
    
    if (!input) {
        showNotification('Erro: campo de mensagem não encontrado', 'error');
        return;
    }
    
    const text = input.value.trim();
    
    if (!text) {
        showNotification('Digite uma mensagem antes de enviar', 'warning');
        return;
    }
    
    // Desabilitar input temporariamente
    input.disabled = true;
    if (sendBtn) sendBtn.disabled = true;
    
    try {
        // Criar mensagem
        const newMessage = {
            id: generateMessageId(),
            sender_id: chatState.userId,
            receiver_id: 'admin',
            sender_rm: chatState.userRM,
            sender_role: 'student',
            sender_name: chatState.userName,
            receiver_role: 'admin',
            message_text: text,
            department: chatState.currentDepartment,
            is_read: false,
            created_at: new Date().toISOString()
        };
        
        // Salvar
        const saved = saveMessageToLocalStorage(newMessage);
        
        if (!saved) {
            throw new Error('Falha ao salvar mensagem');
        }
        
        // Adicionar ao estado
        chatState.messages.push(newMessage);
        
        // Renderizar
        renderStudentMessages();
        
        // Limpar input
        input.value = '';
        input.style.height = 'auto';
        
        // Feedback visual
        showNotification('✅ Mensagem enviada!', 'success');
        
        // Simular notificação para admin
        simulateAdminNotification(newMessage);
        
    } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error);
        showNotification('Erro ao enviar mensagem. Tente novamente.', 'error');
    } finally {
        // Reabilitar input
        input.disabled = false;
        if (sendBtn) sendBtn.disabled = false;
        input.focus();
    }
}

function simulateAdminNotification(message) {
    // Simular notificação para admin
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        const notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
        notifications.push({
            id: message.id,
            student_rm: message.sender_rm,
            student_name: message.sender_name,
            message_preview: message.message_text.substring(0, 50) + '...',
            timestamp: new Date().toISOString(),
            read: false
        });
        localStorage.setItem('admin_notifications', JSON.stringify(notifications));
    }
}

// ===== CHAT DO ADMINISTRADOR =====
async function initializeAdminChat() {
    console.log('👔 Inicializando chat do administrador...');
    
    await loadStudentsList();
    setupAdminEventListeners();
    startAdminPolling();
    
    // Mostrar notificações pendentes
    showAdminNotifications();
}

function showAdminNotifications() {
    try {
        const notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
        const unread = notifications.filter(n => !n.read);
        
        if (unread.length > 0) {
            showNotification(`Você tem ${unread.length} nova(s) mensagem(ns) de alunos`, 'info');
            
            // Marcar como lidas
            notifications.forEach(n => n.read = true);
            localStorage.setItem('admin_notifications', JSON.stringify(notifications));
        }
    } catch (error) {
        console.error('Erro ao verificar notificações:', error);
    }
}

function setupAdminEventListeners() {
    const adminInput = document.getElementById('adminMessageInput');
    const adminSendBtn = document.getElementById('adminSendBtn');
    
    if (adminInput) {
        adminInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });

        adminInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendAdminMessage();
            }
        });
    }
    
    if (adminSendBtn) {
        adminSendBtn.addEventListener('click', sendAdminMessage);
    }
}

async function loadStudentsList() {
    try {
        console.log('📥 Carregando lista de alunos...');
        
        // Tentar do Supabase
        const { data: alunos, error } = await supabase
            .from('alunos')
            .select('id, rm, nome_completo, turma_id')
            .order('nome_completo');

        if (!error && alunos && alunos.length > 0) {
            chatState.studentsList = alunos;
        } else {
            // Buscar das mensagens no localStorage
            chatState.studentsList = getStudentsFromMessages();
        }
        
        // Adicionar alunos únicos do localStorage
        const localStudents = getStudentsFromMessages();
        const existingRMs = new Set(chatState.studentsList.map(s => s.rm));
        
        localStudents.forEach(student => {
            if (!existingRMs.has(student.rm)) {
                chatState.studentsList.push(student);
            }
        });
        
        // Ordenar por última mensagem (mais recente primeiro)
        chatState.studentsList.sort((a, b) => {
            const dateA = new Date(a.lastMessage || 0);
            const dateB = new Date(b.lastMessage || 0);
            return dateB - dateA;
        });
        
        renderStudentsList();
        
        // Atualizar contadores
        const totalEl = document.getElementById('totalStudents');
        if (totalEl) totalEl.textContent = chatState.studentsList.length;
        
        console.log(`✅ ${chatState.studentsList.length} alunos carregados`);
        
    } catch (error) {
        console.error('❌ Erro ao carregar alunos:', error);
        chatState.studentsList = getStudentsFromMessages();
        renderStudentsList();
    }
}

function renderStudentsList() {
    const container = document.getElementById('studentsList');
    if (!container) return;
    
    if (chatState.studentsList.length === 0) {
        container.innerHTML = `
            <div class="no-students">
                <i class="fas fa-users-slash"></i>
                <span>Nenhum aluno encontrado</span>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    
    chatState.studentsList.forEach(aluno => {
        const studentElement = createStudentElement(aluno);
        container.appendChild(studentElement);
    });

    setupStudentSearch();
}

function createStudentElement(aluno) {
    const studentDiv = document.createElement('div');
    studentDiv.className = 'student-item';
    studentDiv.dataset.studentRm = aluno.rm;
    
    studentDiv.addEventListener('click', () => selectStudent(aluno));

    const avatar = document.createElement('div');
    avatar.className = 'student-avatar';
    avatar.innerHTML = '<i class="fas fa-user"></i>';

    const info = document.createElement('div');
    info.className = 'student-info';

    const name = document.createElement('div');
    name.className = 'student-name';
    name.textContent = aluno.nome_completo || `Aluno RM ${aluno.rm}`;

    const details = document.createElement('div');
    details.className = 'student-details';

    const rm = document.createElement('div');
    rm.className = 'student-rm';
    rm.textContent = `RM: ${aluno.rm}`;

    const turma = document.createElement('div');
    turma.className = 'student-turma';
    turma.textContent = aluno.turma_id || 'Turma não informada';

    details.appendChild(rm);
    details.appendChild(turma);
    info.appendChild(name);
    info.appendChild(details);
    studentDiv.appendChild(avatar);
    studentDiv.appendChild(info);

    return studentDiv;
}

function setupStudentSearch() {
    const searchInput = document.getElementById('studentSearch');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const term = this.value.toLowerCase();
        const items = document.querySelectorAll('.student-item');
        
        items.forEach(item => {
            const name = item.querySelector('.student-name').textContent.toLowerCase();
            const rm = item.querySelector('.student-rm').textContent.toLowerCase();
            item.style.display = (name.includes(term) || rm.includes(term)) ? 'flex' : 'none';
        });
    });
}

async function selectStudent(aluno) {
    // Remover seleção anterior
    document.querySelectorAll('.student-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Selecionar novo
    const selected = document.querySelector(`[data-student-rm="${aluno.rm}"]`);
    if (selected) selected.classList.add('active');
    
    chatState.selectedStudent = aluno;
    
    // Atualizar header
    updateSelectedStudentInfo(aluno);
    
    // Habilitar input
    const adminInput = document.getElementById('adminMessageInput');
    const adminSendBtn = document.getElementById('adminSendBtn');
    
    if (adminInput) adminInput.disabled = false;
    if (adminSendBtn) adminSendBtn.disabled = false;
    
    // Carregar mensagens
    await loadAdminMessages(aluno);
}

function updateSelectedStudentInfo(aluno) {
    const container = document.getElementById('selectedStudentInfo');
    if (!container) return;
    
    container.innerHTML = `
        <div class="student-avatar large">
            <i class="fas fa-user"></i>
        </div>
        <div class="student-details">
            <h3>${aluno.nome_completo || `Aluno RM ${aluno.rm}`}</h3>
            <span class="student-status">
                RM: ${aluno.rm} • ${aluno.turma_id || 'Turma não informada'}
            </span>
        </div>
    `;
}

async function loadAdminMessages(aluno) {
    try {
        const messages = getMessagesBetweenAdminAndStudent(aluno.rm);
        
        // Ordenar
        const sortedMessages = messages.sort((a, b) => 
            new Date(a.created_at) - new Date(b.created_at)
        );
        
        chatState.adminMessages.set(aluno.rm, sortedMessages);
        renderAdminMessages(sortedMessages);
        
    } catch (error) {
        console.error('❌ Erro ao carregar mensagens:', error);
        chatState.adminMessages.set(aluno.rm, []);
        renderAdminMessages([]);
    }
}

function renderAdminMessages(messages) {
    const container = document.getElementById('adminMessagesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (messages.length === 0) {
        const aluno = chatState.selectedStudent;
        container.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">
                    <i class="fas fa-user-tie"></i>
                </div>
                <h3>Modo Administrativo</h3>
                <p>Inicie uma conversa com ${aluno?.nome_completo || 'o aluno'}</p>
            </div>
        `;
        return;
    }
    
    messages.forEach((message, index) => {
        const messageElement = createAdminMessageElement(message, index);
        container.appendChild(messageElement);
    });
    
    scrollToBottom('adminMessagesContainer');
}

function createAdminMessageElement(message, index) {
    const isAdminMessage = message.sender_id === 'admin';
    const isLongMessage = message.message_text && message.message_text.length > 100;
    const isVeryLongMessage = message.message_text && message.message_text.length > 200;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isAdminMessage ? 'admin' : 'user'}`;
    
    if (isLongMessage) messageDiv.classList.add('message-long');
    if (isVeryLongMessage) messageDiv.classList.add('message-very-long');
    if (index === chatState.adminMessages.get(chatState.selectedStudent.rm).length - 1) {
        messageDiv.classList.add('message-new');
    }
    
    messageDiv.dataset.id = message.id;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = isAdminMessage ? '<i class="fas fa-user-tie"></i>' : '<i class="fas fa-user"></i>';

    const content = document.createElement('div');
    content.className = 'message-content force-text-break';

    const header = document.createElement('div');
    header.className = 'message-header';
    
    const senderName = document.createElement('span');
    senderName.className = 'message-sender';
    senderName.textContent = isAdminMessage ? 'Você (Administrador)' : (message.sender_name || 'Aluno');

    const time = document.createElement('span');
    time.className = 'message-time';
    time.textContent = formatTime(message.created_at);
    
    header.appendChild(senderName);
    header.appendChild(time);

    const text = document.createElement('div');
    text.className = 'message-text force-text-break';
    text.textContent = message.message_text || '';
    
    // Se for texto sem espaços
    if (message.message_text && !message.message_text.includes(' ')) {
        text.classList.add('break-all');
    }

    content.appendChild(header);
    content.appendChild(text);
    
    if (isAdminMessage) {
        const status = document.createElement('div');
        status.className = 'message-status';
        status.innerHTML = message.is_read ? 
            '<i class="fas fa-check-double"></i> Lida' : 
            '<i class="fas fa-check"></i> Enviada';
        content.appendChild(status);
    }

    if (isAdminMessage) {
        messageDiv.appendChild(content);
        messageDiv.appendChild(avatar);
    } else {
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
    }

    return messageDiv;
}

function sendAdminMessage() {
    if (!chatState.selectedStudent) {
        showNotification('Selecione um aluno primeiro', 'warning');
        return;
    }

    const input = document.getElementById('adminMessageInput');
    const sendBtn = document.getElementById('adminSendBtn');
    
    if (!input) return;
    
    const text = input.value.trim();

    if (!text) {
        showNotification('Digite uma mensagem', 'warning');
        return;
    }

    // Desabilitar temporariamente
    input.disabled = true;
    if (sendBtn) sendBtn.disabled = true;

    try {
        const aluno = chatState.selectedStudent;
        
        const newMessage = {
            id: generateMessageId(),
            sender_id: 'admin',
            receiver_id: `aluno_${aluno.rm}`,
            sender_role: 'admin',
            sender_name: 'Administrador',
            receiver_rm: aluno.rm,
            receiver_role: 'student',
            message_text: text,
            is_read: false,
            created_at: new Date().toISOString()
        };

        // Salvar
        const saved = saveMessageToLocalStorage(newMessage);
        
        if (!saved) {
            throw new Error('Falha ao salvar mensagem');
        }

        // Adicionar ao estado
        const studentMessages = chatState.adminMessages.get(aluno.rm) || [];
        studentMessages.push(newMessage);
        chatState.adminMessages.set(aluno.rm, studentMessages);
        
        // Renderizar
        renderAdminMessages(studentMessages);

        // Limpar input
        input.value = '';
        input.style.height = 'auto';
        
        showNotification('Mensagem enviada para o aluno', 'success');

    } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error);
        showNotification('Erro ao enviar mensagem', 'error');
    } finally {
        // Reabilitar
        input.disabled = false;
        if (sendBtn) sendBtn.disabled = false;
        input.focus();
    }
}

// ===== SISTEMA DE ATUALIZAÇÃO AUTOMÁTICA =====
function setupAutoRefresh() {
    // Limpar intervalo anterior
    if (chatState.refreshInterval) {
        clearInterval(chatState.refreshInterval);
    }
    
    // Atualizar a cada 3 segundos
    chatState.refreshInterval = setInterval(refreshMessages, 3000);
    
    console.log('🔄 Sistema de atualização automática iniciado');
}

function refreshMessages() {
    if (chatState.userRole === 'admin') {
        if (chatState.selectedStudent) {
            const aluno = chatState.selectedStudent;
            const currentMessages = chatState.adminMessages.get(aluno.rm) || [];
            const newMessages = getMessagesBetweenAdminAndStudent(aluno.rm);
            
            if (newMessages.length !== currentMessages.length) {
                chatState.adminMessages.set(aluno.rm, newMessages);
                renderAdminMessages(newMessages);
            }
        }
    } else {
        const currentCount = chatState.messages.length;
        const newMessages = getMessagesForUser(chatState.userId);
        
        if (newMessages.length !== currentCount) {
            chatState.messages = newMessages;
            renderStudentMessages();
            
            // Notificar sobre novas mensagens
            const newFromAdmin = newMessages.filter(msg => 
                msg.sender_id === 'admin' && 
                !chatState.messages.some(m => m.id === msg.id)
            );
            
            if (newFromAdmin.length > 0 && !document.hidden) {
                showNotification('📩 Nova mensagem da diretoria!', 'info');
            }
        }
    }
}

function startAdminPolling() {
    setInterval(() => {
        if (chatState.userRole === 'admin') {
            const allMessages = getAllMessagesFromLocalStorage();
            const newMessagesFromStudents = allMessages.filter(msg => 
                msg.receiver_id === 'admin' && !msg.is_read
            );
            
            if (newMessagesFromStudents.length > 0) {
                loadStudentsList();
            }
        }
    }, 5000);
}

// ===== FUNÇÕES AUXILIARES =====
function formatTime(timestamp) {
    try {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Agora';
        if (diffMins < 60) return `${diffMins} min atrás`;
        
        return date.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
    } catch (error) {
        return 'Agora';
    }
}

function scrollToBottom(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
    }
}

function setupDepartments() {
    const items = document.querySelectorAll('.department-item');
    
    items.forEach(item => {
        item.addEventListener('click', function() {
            items.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            const dept = this.dataset.department;
            chatState.currentDepartment = dept;
            
            showNotification(`Setor: ${this.querySelector('h4').textContent}`, 'info');
        });
    });
}

function updateUserInterface() {
    const userNameElement = document.getElementById('userName');
    const userRoleElement = document.getElementById('userRole');
    
    if (userNameElement) {
        userNameElement.textContent = chatState.userName || 'Usuário';
    }
    
    if (userRoleElement) {
        userRoleElement.textContent = chatState.userRole === 'admin' ? 'Administrador' : 'Aluno';
        userRoleElement.className = `user-role ${chatState.userRole}`;
    }
    
    if (chatState.userRole === 'student' && chatState.userRM) {
        const rmDisplay = document.getElementById('studentRMDisplay');
        if (rmDisplay) {
            rmDisplay.textContent = chatState.userRM;
        }
    }
}

function setupChatInterface() {
    const studentChat = document.getElementById('studentChat');
    const adminChat = document.getElementById('adminChat');
    
    if (chatState.userRole === 'admin') {
        if (studentChat) studentChat.style.display = 'none';
        if (adminChat) adminChat.style.display = 'block';
    } else {
        if (studentChat) studentChat.style.display = 'block';
        if (adminChat) adminChat.style.display = 'none';
    }
}

// ===== SISTEMA DE HEADER =====
function initializeHeaderSystems() {
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');
    
    let currentZoom = 100;
    
    if (zoomIn && zoomOut) {
        zoomIn.addEventListener('click', function() {
            if (currentZoom < 150) {
                currentZoom += 10;
                document.body.style.zoom = currentZoom + '%';
                showNotification(`Zoom: ${currentZoom}%`, 'info');
            }
        });
        
        zoomOut.addEventListener('click', function() {
            if (currentZoom > 50) {
                currentZoom -= 10;
                document.body.style.zoom = currentZoom + '%';
                showNotification(`Zoom: ${currentZoom}%`, 'info');
            }
        });
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
    
    notification.innerHTML = `
        <i class="fas fa-${icons[type]}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remover após 4 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// ===== FUNÇÕES DE AUTENTICAÇÃO =====
function showAuthenticationOptions() {
    const container = document.querySelector('.chat-container') || document.body;
    
    const optionsHTML = `
        <div style="text-align: center; padding: 40px;">
            <div style="font-size: 64px; color: #3b82f6; margin-bottom: 20px;">
                <i class="fas fa-comments"></i>
            </div>
            <h3 style="color: #333; margin-bottom: 15px;">Acesso ao Chat</h3>
            <p style="color: #666; margin-bottom: 30px;">
                Para acessar o chat, faça login no sistema principal.
            </p>
            <button onclick="window.location.href='index.html'" style="
                background: #3b82f6;
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                display: inline-flex;
                align-items: center;
                gap: 10px;
            ">
                <i class="fas fa-sign-in-alt"></i>
                Ir para Login
            </button>
        </div>
    `;
    
    if (container) {
        container.innerHTML = optionsHTML;
    }
}

// ===== FUNÇÕES GLOBAIS =====
window.sendQuickMessage = function(type) {
    const messages = {
        'agendamento': 'Gostaria de agendar uma reunião com a diretoria.',
        'documento': 'Preciso solicitar um documento escolar.',
        'duvida': 'Tenho uma dúvida que gostaria de esclarecer.'
    };

    const input = document.getElementById('messageInput');
    if (input) {
        input.value = messages[type] || 'Mensagem rápida';
        input.focus();
        showNotification('Mensagem rápida adicionada', 'info');
    }
};

window.refreshChat = function() {
    if (chatState.userRole === 'admin') {
        loadStudentsList();
        if (chatState.selectedStudent) {
            loadAdminMessages(chatState.selectedStudent);
        }
    } else {
        loadStudentMessages();
    }
    showNotification('Chat atualizado', 'info');
};

// Modal
window.showConfirmModal = function(message, callback) {
    const modal = document.getElementById('confirmModal');
    const messageElement = document.getElementById('confirmMessage');
    
    if (modal && messageElement) {
        messageElement.textContent = message;
        modal.style.display = 'flex';
        window.confirmActionCallback = callback;
    }
};

window.confirmAction = function() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    if (typeof window.confirmActionCallback === 'function') {
        window.confirmActionCallback();
        window.confirmActionCallback = null;
    }
};

window.closeModal = function() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.style.display = 'none';
    }
    window.confirmActionCallback = null;
};

// ===== INICIALIZAÇÃO COMPLETA =====
console.log('✅ Sistema de Chat carregado!');

// Listener global para Ctrl+Enter
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
        if (chatState.userRole === 'admin') {
            sendAdminMessage();
        } else {
            sendStudentMessage();
        }
    }
});

// Ajustar layout na inicialização
window.addEventListener('load', function() {
    if (chatState.userRole === 'student') {
        setTimeout(adjustStudentLayout, 200);
    }
});

// Ajustar layout no redimensionamento
window.addEventListener('resize', function() {
    if (chatState.userRole === 'student') {
        adjustStudentLayout();
    }

});

const socket = io("https://ifomorita.onrender.com"); // ou seu domínio online

const form = document.getElementById('chatForm');
const input = document.getElementById('chatInput');
const messages = document.getElementById('messages');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = input.value.trim();
  if (msg) {
    socket.emit('chat-message', { autor: 'Gabriel', texto: msg });
    input.value = '';
  }
});

socket.on('chat-message', (data) => {
  const li = document.createElement('li');
  li.textContent = `${data.autor}: ${data.texto}`;
  messages.appendChild(li);
});


