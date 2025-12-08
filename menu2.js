// CONFIGURAÇÃO DO SUPABASE E API
const SUPABASE_URL = 'https://caadqubmelbbdnzdmqpf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_LcLLXnNaNUkhgIxv9Uh3Gg_bhoWkHAG';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const API_BASE_URL = 'https://ifomorita.onrender.com'; // Seu backend

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
        
        /* Indicador de sincronização */
        .sync-indicator {
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            display: none;
        }
        
        .sync-indicator.active {
            display: block;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { opacity: 0.7; }
            50% { opacity: 1; }
            100% { opacity: 0.7; }
        }
    `;
    document.head.appendChild(style);
}

// ===== FUNÇÕES PARA INTERAGIR COM A API =====

// Enviar mensagem para a API
async function sendMessageToAPI(messageData) {
    try {
        console.log('📤 Enviando mensagem para API:', messageData);
        
        const response = await fetch(`${API_BASE_URL}/chat/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(messageData)
        });

        const result = await response.json();
        
        if (!result.sucesso) {
            throw new Error(result.erro || 'Erro ao enviar mensagem');
        }

        console.log('✅ Mensagem enviada com sucesso:', result.mensagem);
        return result.mensagem;
    } catch (error) {
        console.error('❌ Erro ao enviar mensagem para API:', error);
        throw error;
    }
}

// Buscar mensagens da API
async function getMessagesFromAPI(senderId, receiverId) {
    try {
        console.log(`📥 Buscando mensagens entre ${senderId} e ${receiverId}`);
        
        const response = await fetch(
            `${API_BASE_URL}/chat/messages/${encodeURIComponent(senderId)}/${encodeURIComponent(receiverId)}?limit=100`
        );

        const result = await response.json();
        
        if (!result.sucesso) {
            throw new Error(result.erro || 'Erro ao buscar mensagens');
        }

        console.log(`✅ ${result.mensagens?.length || 0} mensagens recebidas da API`);
        return result.mensagens || [];
    } catch (error) {
        console.error('❌ Erro ao buscar mensagens da API:', error);
        return [];
    }
}

// Buscar lista de alunos (para admin)
async function getStudentsFromAPI() {
    try {
        console.log('👥 Buscando lista de alunos da API...');
        
        const response = await fetch(`${API_BASE_URL}/chat/students`);
        const result = await response.json();
        
        if (!result.sucesso) {
            throw new Error(result.erro || 'Erro ao buscar alunos');
        }

        console.log(`✅ ${result.alunos?.length || 0} alunos recebidos da API`);
        return result.alunos || [];
    } catch (error) {
        console.error('❌ Erro ao buscar alunos da API:', error);
        return [];
    }
}

// Marcar mensagem como lida
async function markMessageAsRead(messageId) {
    try {
        await fetch(`${API_BASE_URL}/chat/mark-read/${messageId}`, {
            method: 'PUT'
        });
        console.log(`✅ Mensagem ${messageId} marcada como lida`);
    } catch (error) {
        console.error('❌ Erro ao marcar mensagem como lida:', error);
    }
}

// ===== SISTEMA DE ARMAZENAMENTO LOCAL (CACHE) =====

// Gerar ID único para mensagens
function generateMessageId() {
    return 'msg_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Formatar texto para garantir quebras adequadas
function formatMessageText(text) {
    if (!text || typeof text !== 'string') return '';
    
    // Remover espaços em branco extras
    text = text.trim();
    
    // Se for texto muito longo sem espaços, adicionar quebras
    if (text.length > 50 && !text.includes(' ')) {
        return text.match(/.{1,30}/g).join(' ');
    }
    
    // Para textos muito longos, garantir quebras
    if (text.length > 200) {
        return text.split(' ').map(word => {
            if (word.length > 30) {
                return word.match(/.{1,30}/g).join(' ');
            }
            return word;
        }).join(' ');
    }
    
    return text;
}

// Salvar mensagem no localStorage (cache)
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
        
        console.log('💾 Mensagem salva no cache local:', message.id);
        return true;
    } catch (error) {
        console.error('❌ Erro ao salvar mensagem no cache:', error);
        return false;
    }
}

// Obter todas as mensagens do localStorage
function getAllMessagesFromLocalStorage() {
    try {
        const messages = localStorage.getItem('chat_messages');
        return messages ? JSON.parse(messages) : [];
    } catch (error) {
        console.error('❌ Erro ao obter mensagens do cache:', error);
        return [];
    }
}

// Obter mensagens de um usuário específico do cache
function getMessagesForUser(userId) {
    const allMessages = getAllMessagesFromLocalStorage();
    return allMessages.filter(message => 
        message.sender_id === userId || message.receiver_id === userId
    );
}

// Obter mensagens entre admin e um aluno específico do cache
function getMessagesBetweenAdminAndStudent(studentRm) {
    const allMessages = getAllMessagesFromLocalStorage();
    return allMessages.filter(message => 
        (message.sender_id === 'admin' && message.receiver_id === `aluno_${studentRm}`) ||
        (message.sender_id === `aluno_${studentRm}` && message.receiver_id === 'admin')
    );
}

// Obter todos os alunos que enviaram mensagens (do cache)
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

// ===== FUNÇÕES DE SINCRONIZAÇÃO =====

// Sincronizar mensagens locais com a API
async function syncLocalMessages() {
    try {
        const allMessages = getAllMessagesFromLocalStorage();
        const localOnlyMessages = allMessages.filter(msg => msg.local_only);
        
        if (localOnlyMessages.length === 0) return;
        
        console.log(`🔄 Sincronizando ${localOnlyMessages.length} mensagens locais...`);
        
        for (const msg of localOnlyMessages) {
            try {
                // Remover a flag local_only antes de enviar
                const { local_only, ...messageToSend } = msg;
                const savedMessage = await sendMessageToAPI(messageToSend);
                
                // Atualizar no localStorage (remover a versão local, adicionar a do servidor)
                const updatedMessages = allMessages.filter(m => m.id !== msg.id);
                updatedMessages.push(savedMessage);
                localStorage.setItem('chat_messages', JSON.stringify(updatedMessages));
                
                console.log('✅ Mensagem local sincronizada:', msg.id);
            } catch (error) {
                console.error('❌ Erro ao sincronizar mensagem:', msg.id, error);
            }
        }
    } catch (error) {
        console.error('❌ Erro na sincronização:', error);
    }
}

// Mostrar indicador de sincronização
function showSyncIndicator(show) {
    let indicator = document.querySelector('.sync-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'sync-indicator';
        indicator.innerHTML = '<i class="fas fa-sync-alt"></i> Sincronizando...';
        document.body.appendChild(indicator);
    }
    
    if (show) {
        indicator.classList.add('active');
    } else {
        indicator.classList.remove('active');
    }
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
                    name: alunoData.nome_completo || `Aluno ${alunoData.rm}`,
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
    
    // 3. Mostrar opções de autenticação
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
    
    // Sincronizar mensagens locais
    setTimeout(() => syncLocalMessages(), 2000);
    
    chatState.isInitialized = true;
    console.log('✅ Chat inicializado com sucesso');
}

// ===== CHAT DO ALUNO =====
async function initializeStudentChat() {
    console.log('🎓 Inicializando chat do aluno...');
    
    setupStudentEventListeners();
    await loadStudentMessages();
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

async function loadStudentMessages() {
    try {
        console.log('📥 Carregando mensagens do aluno...');
        
        // Buscar do banco de dados
        const apiMessages = await getMessagesFromAPI(chatState.userId, 'admin');
        
        // Combinar com mensagens locais (cache)
        const localMessages = getMessagesForUser(chatState.userId);
        const allMessages = [...apiMessages, ...localMessages.filter(m => m.local_only)];
        
        // Remover duplicatas
        const uniqueMessages = [];
        const seenIds = new Set();
        
        allMessages.forEach(msg => {
            const id = msg.id;
            if (!seenIds.has(id)) {
                seenIds.add(id);
                uniqueMessages.push(msg);
            }
        });
        
        // Ordenar por data
        uniqueMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        
        chatState.messages = uniqueMessages;
        renderStudentMessages();
        
        console.log(`✅ ${chatState.messages.length} mensagens carregadas`);
        
        // Marcar mensagens do admin como lidas
        await markAdminMessagesAsRead();
        
    } catch (error) {
        console.error('❌ Erro ao carregar mensagens da API:', error);
        // Fallback para localStorage
        chatState.messages = getMessagesForUser(chatState.userId);
        renderStudentMessages();
    }
}

async function markAdminMessagesAsRead() {
    const unreadMessages = chatState.messages.filter(msg => 
        msg.sender_id === 'admin' && !msg.is_read && !msg.local_only
    );
    
    for (const msg of unreadMessages) {
        await markMessageAsRead(msg.id);
        msg.is_read = true;
    }
    
    if (unreadMessages.length > 0) {
        renderStudentMessages();
        console.log(`✅ ${unreadMessages.length} mensagens marcadas como lidas`);
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
                <p><small>Mensagens salvas no servidor - acesse de qualquer dispositivo</small></p>
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

async function sendStudentMessage() {
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
        // Mostrar indicador de sincronização
        showSyncIndicator(true);
        
        // Criar mensagem
        const newMessage = {
            id: generateMessageId(),
            sender_id: chatState.userId,
            receiver_id: 'admin',
            sender_rm: chatState.userRM,
            sender_role: 'student',
            sender_name: chatState.userName,
            receiver_rm: null,
            message_text: text,
            department: chatState.currentDepartment,
            is_read: false,
            created_at: new Date().toISOString()
        };
        
        // Tentar enviar para a API primeiro
        let savedMessage;
        try {
            savedMessage = await sendMessageToAPI(newMessage);
            console.log('✅ Mensagem enviada para o servidor');
        } catch (apiError) {
            console.log('⚠️ Servidor offline, salvando localmente');
            // Se a API falhar, salvar localmente com flag
            savedMessage = {
                ...newMessage,
                local_only: true
            };
            showNotification('⚠️ Mensagem salva localmente. Será enviada quando houver conexão.', 'warning');
        }
        
        // Salvar no cache local
        saveMessageToLocalStorage(savedMessage);
        
        // Adicionar ao estado
        chatState.messages.push(savedMessage);
        
        // Renderizar
        renderStudentMessages();
        
        // Limpar input
        input.value = '';
        input.style.height = 'auto';
        
        // Feedback visual
        showNotification('✅ Mensagem enviada!', 'success');
        
    } catch (error) {
        console.error('❌ Erro crítico ao enviar mensagem:', error);
        showNotification('Erro ao processar mensagem.', 'error');
    } finally {
        // Reabilitar input
        input.disabled = false;
        if (sendBtn) sendBtn.disabled = false;
        input.focus();
        
        // Esconder indicador de sincronização
        showSyncIndicator(false);
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
        
        // Buscar do banco de dados via API
        const apiStudents = await getStudentsFromAPI();
        
        if (apiStudents && apiStudents.length > 0) {
            chatState.studentsList = apiStudents.map(aluno => ({
                ...aluno,
                lastMessage: null // Será atualizado pelas mensagens
            }));
        }
        
        // Adicionar alunos das mensagens (cache local)
        const messageStudents = getStudentsFromMessages();
        const existingRMs = new Set(chatState.studentsList.map(s => s.rm));
        
        messageStudents.forEach(student => {
            if (!existingRMs.has(student.rm)) {
                chatState.studentsList.push(student);
            }
        });
        
        // Ordenar por última mensagem
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
        // Fallback para localStorage
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
        // Buscar do banco de dados
        const apiMessages = await getMessagesFromAPI('admin', `aluno_${aluno.rm}`);
        
        // Combinar com mensagens locais (cache)
        const localMessages = getMessagesBetweenAdminAndStudent(aluno.rm);
        const allMessages = [...apiMessages, ...localMessages.filter(m => m.local_only)];
        
        // Remover duplicatas e ordenar
        const seenIds = new Set();
        const uniqueMessages = [];
        
        allMessages.forEach(msg => {
            if (!seenIds.has(msg.id)) {
                seenIds.add(msg.id);
                uniqueMessages.push(msg);
            }
        });
        
        uniqueMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        
        chatState.adminMessages.set(aluno.rm, uniqueMessages);
        renderAdminMessages(uniqueMessages);
        
    } catch (error) {
        console.error('❌ Erro ao carregar mensagens da API:', error);
        // Fallback para localStorage
        const messages = getMessagesBetweenAdminAndStudent(aluno.rm);
        chatState.adminMessages.set(aluno.rm, messages);
        renderAdminMessages(messages);
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
                <p><small>Mensagens sincronizadas com o servidor</small></p>
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

async function sendAdminMessage() {
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
        
        // Mostrar indicador de sincronização
        showSyncIndicator(true);
        
        const newMessage = {
            id: generateMessageId(),
            sender_id: 'admin',
            receiver_id: `aluno_${aluno.rm}`,
            sender_role: 'admin',
            sender_name: 'Administrador',
            receiver_rm: aluno.rm,
            message_text: text,
            is_read: false,
            created_at: new Date().toISOString()
        };

        // Tentar enviar para a API primeiro
        let savedMessage;
        try {
            savedMessage = await sendMessageToAPI(newMessage);
            console.log('✅ Mensagem enviada para o servidor');
        } catch (apiError) {
            console.log('⚠️ Servidor offline, salvando localmente');
            // Se a API falhar, salvar localmente com flag
            savedMessage = {
                ...newMessage,
                local_only: true
            };
            showNotification('⚠️ Mensagem salva localmente. Será enviada quando houver conexão.', 'warning');
        }

        // Salvar no cache local
        saveMessageToLocalStorage(savedMessage);

        // Atualizar estado
        const studentMessages = chatState.adminMessages.get(aluno.rm) || [];
        studentMessages.push(savedMessage);
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
        
        // Esconder indicador de sincronização
        showSyncIndicator(false);
    }
}

// ===== FUNÇÕES AUXILIARES (mantidas) =====

// Funções createMessageElement e createAdminMessageElement (mantenha as origens)
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
    
    // Indicador de mensagem local
    if (message.local_only) {
        const localBadge = document.createElement('span');
        localBadge.className = 'local-badge';
        localBadge.innerHTML = '<i class="fas fa-save"></i> Local';
        localBadge.style.marginLeft = '8px';
        localBadge.style.fontSize = '0.8em';
        localBadge.style.color = '#666';
        senderName.appendChild(localBadge);
    }
    
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
    
    // Indicador de mensagem local
    if (message.local_only) {
        const localBadge = document.createElement('span');
        localBadge.className = 'local-badge';
        localBadge.innerHTML = '<i class="fas fa-save"></i> Local';
        localBadge.style.marginLeft = '8px';
        localBadge.style.fontSize = '0.8em';
        localBadge.style.color = '#666';
        senderName.appendChild(localBadge);
    }

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

// ===== SISTEMA DE ATUALIZAÇÃO AUTOMÁTICA =====
function setupAutoRefresh() {
    // Limpar intervalo anterior
    if (chatState.refreshInterval) {
        clearInterval(chatState.refreshInterval);
    }
    
    // Atualizar a cada 5 segundos
    chatState.refreshInterval = setInterval(refreshMessages, 5000);
    
    console.log('🔄 Sistema de atualização automática iniciado (5s)');
}

async function refreshMessages() {
    try {
        if (chatState.userRole === 'admin') {
            if (chatState.selectedStudent) {
                const aluno = chatState.selectedStudent;
                const apiMessages = await getMessagesFromAPI('admin', `aluno_${aluno.rm}`);
                
                // Combinar com mensagens locais
                const localMessages = getMessagesBetweenAdminAndStudent(aluno.rm);
                const allMessages = [...apiMessages, ...localMessages.filter(m => m.local_only)];
                
                // Remover duplicatas
                const uniqueMessages = [];
                const seenIds = new Set();
                
                allMessages.forEach(msg => {
                    if (!seenIds.has(msg.id)) {
                        seenIds.add(msg.id);
                        uniqueMessages.push(msg);
                    }
                });
                
                uniqueMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                
                const currentMessages = chatState.adminMessages.get(aluno.rm) || [];
                
                if (uniqueMessages.length !== currentMessages.length) {
                    chatState.adminMessages.set(aluno.rm, uniqueMessages);
                    renderAdminMessages(uniqueMessages);
                }
            }
        } else {
            const apiMessages = await getMessagesFromAPI(chatState.userId, 'admin');
            
            // Combinar com mensagens locais
            const localMessages = getMessagesForUser(chatState.userId);
            const allMessages = [...apiMessages, ...localMessages.filter(m => m.local_only)];
            
            // Remover duplicatas
            const uniqueMessages = [];
            const seenIds = new Set();
            
            allMessages.forEach(msg => {
                if (!seenIds.has(msg.id)) {
                    seenIds.add(msg.id);
                    uniqueMessages.push(msg);
                }
            });
            
            uniqueMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            
            if (uniqueMessages.length !== chatState.messages.length) {
                const oldCount = chatState.messages.length;
                chatState.messages = uniqueMessages;
                renderStudentMessages();
                
                // Verificar se há novas mensagens do admin
                const newMessages = chatState.messages.slice(oldCount);
                const newFromAdmin = newMessages.filter(msg => msg.sender_id === 'admin');
                
                if (newFromAdmin.length > 0 && !document.hidden) {
                    showNotification(`📩 ${newFromAdmin.length} nova(s) mensagem(ns) da diretoria!`, 'info');
                    
                    // Marcar como lidas
                    for (const msg of newFromAdmin) {
                        if (!msg.local_only) {
                            await markMessageAsRead(msg.id);
                        }
                    }
                }
            }
        }
        
        // Sincronizar mensagens locais periodicamente (20% de chance a cada refresh)
        if (Math.random() < 0.2) {
            await syncLocalMessages();
        }
        
    } catch (error) {
        console.error('❌ Erro ao refresh:', error);
    }
}

function startAdminPolling() {
    setInterval(async () => {
        if (chatState.userRole === 'admin') {
            try {
                // Verificar se há novas mensagens não lidas
                const allMessages = getAllMessagesFromLocalStorage();
                const newMessagesFromStudents = allMessages.filter(msg => 
                    msg.receiver_id === 'admin' && !msg.is_read && !msg.local_only
                );
                
                if (newMessagesFromStudents.length > 0) {
                    await loadStudentsList();
                }
            } catch (error) {
                console.error('Erro no polling:', error);
            }
        }
    }, 10000);
}

// ===== FUNÇÕES DO HEADER E NOTIFICAÇÕES (mantidas) =====
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

function showNotification(message, type = 'info') {
    // Implementação mantida igual
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
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
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

function showAuthenticationOptions() {
    // Implementação mantida igual
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

// ===== FUNÇÕES GLOBAIS (mantidas) =====
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

window.refreshChat = async function() {
    if (chatState.userRole === 'admin') {
        await loadStudentsList();
        if (chatState.selectedStudent) {
            await loadAdminMessages(chatState.selectedStudent);
        }
    } else {
        await loadStudentMessages();
    }
    showNotification('Chat atualizado', 'info');
};

// Modal functions (mantidas iguais)
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
console.log('✅ Sistema de Chat carregado com sincronização de banco de dados!');

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
