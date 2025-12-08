// chat.js - ATUALIZADO PARA SUA ESTRUTURA DE BANCO DE DADOS

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
    isInitialized: false,
    backendURL: 'https://ifomorita.onrender.com' // URL do seu backend
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Sistema de Chat iniciado...');
    initializeFromYourSystem();
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

// ===== FUNÇÕES DE COMUNICAÇÃO COM BACKEND =====

// Função para fazer requisições ao backend
async function makeBackendRequest(endpoint, method = 'POST', data = null) {
    try {
        const url = `${chatState.backendURL}${endpoint}`;
        
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        };
        
        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }
        
        console.log(`📤 Enviando requisição para: ${url}`, data);
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        console.log(`📥 Resposta recebida de ${endpoint}:`, result);
        return result;
    } catch (error) {
        console.error(`❌ Erro na requisição para ${endpoint}:`, error);
        throw error;
    }
}

// 1. Enviar mensagem via backend
async function sendMessageToBackend(message) {
    try {
        // Ajustar para a estrutura do seu banco
        const messageForDB = {
            sender_id: message.sender_id,
            receiver_id: message.receiver_id,
            sender_rm: message.sender_rm || (message.sender_role === 'admin' ? 'ADMIN' : message.sender_rm),
            sender_role: message.sender_role,
            sender_name: message.sender_name,
            receiver_rm: message.receiver_rm || (message.receiver_role === 'admin' ? 'ADMIN' : message.receiver_rm),
            message_text: message.message_text,
            department: message.department || 'all',
            is_read: false
        };
        
        console.log('📤 Enviando mensagem para backend:', messageForDB);
        const result = await makeBackendRequest('/chat/send', 'POST', messageForDB);
        
        if (!result.sucesso) {
            throw new Error(result.erro || 'Erro ao enviar mensagem');
        }
        
        console.log('✅ Mensagem enviada via backend:', result.data.id);
        return result.data;
    } catch (error) {
        console.error('❌ Erro ao enviar mensagem via backend:', error);
        throw error;
    }
}

// 2. Obter mensagens entre dois usuários (adaptado para sua estrutura)
async function getMessagesBetweenUsers(user1, user2) {
    try {
        const result = await makeBackendRequest('/chat/messages-between', 'POST', {
            user1: user1,
            user2: user2
        });
        
        if (!result.sucesso) {
            throw new Error(result.erro || 'Erro ao buscar mensagens');
        }
        
        console.log(`✅ ${result.mensagens.length} mensagens carregadas entre ${user1} e ${user2}`);
        return result.mensagens;
    } catch (error) {
        console.error('❌ Erro ao buscar mensagens via backend:', error);
        // Fallback: buscar do localStorage
        const localMessages = getAllMessagesFromLocalStorage();
        return localMessages.filter(msg => 
            (msg.sender_id === user1 && msg.receiver_id === user2) ||
            (msg.sender_id === user2 && msg.receiver_id === user1)
        );
    }
}

// 3. Obter mensagens de um usuário
async function getMessagesForUserBackend(userId) {
    try {
        const result = await makeBackendRequest('/chat/messages-for-user', 'POST', {
            userId: userId
        });
        
        if (!result.sucesso) {
            throw new Error(result.erro || 'Erro ao buscar mensagens');
        }
        
        console.log(`✅ ${result.mensagens.length} mensagens do usuário ${userId} via backend`);
        return result.mensagens;
    } catch (error) {
        console.error('❌ Erro ao buscar mensagens do usuário via backend:', error);
        // Fallback: buscar do localStorage
        return getMessagesForUserLocalStorage(userId);
    }
}

// 4. Obter alunos com mensagens (para admin)
async function getStudentsWithMessages() {
    try {
        const result = await makeBackendRequest('/chat/students-with-messages', 'GET');
        
        if (!result.sucesso) {
            throw new Error(result.erro || 'Erro ao buscar alunos');
        }
        
        console.log(`✅ ${result.alunos.length} alunos carregados via backend`);
        return result.alunos;
    } catch (error) {
        console.error('❌ Erro ao buscar alunos via backend:', error);
        return getStudentsFromMessagesLocalStorage();
    }
}

// 5. Marcar mensagens como lidas
async function markMessagesAsReadBackend(messageIds) {
    try {
        const result = await makeBackendRequest('/chat/mark-as-read', 'POST', {
            messageIds: messageIds
        });
        
        if (!result.sucesso) {
            console.warn('⚠️ Não foi possível marcar mensagens como lidas:', result.erro);
        } else {
            console.log('✅ Mensagens marcadas como lidas:', messageIds);
        }
    } catch (error) {
        console.error('❌ Erro ao marcar mensagens como lidas:', error);
    }
}

// ===== FUNÇÕES DE FALLBACK (localStorage) =====

function getAllMessagesFromLocalStorage() {
    try {
        const messages = localStorage.getItem('chat_messages_fallback');
        return messages ? JSON.parse(messages) : [];
    } catch (error) {
        console.error('❌ Erro ao obter mensagens do localStorage:', error);
        return [];
    }
}

function getMessagesForUserLocalStorage(userId) {
    const allMessages = getAllMessagesFromLocalStorage();
    return allMessages.filter(message => 
        message.sender_id === userId || message.receiver_id === userId
    );
}

function getStudentsFromMessagesLocalStorage() {
    const allMessages = getAllMessagesFromLocalStorage();
    const studentsMap = new Map();
    
    allMessages.forEach(message => {
        if (message.sender_role === 'student' && message.sender_rm && message.sender_rm !== 'ADMIN') {
            if (!studentsMap.has(message.sender_rm)) {
                studentsMap.set(message.sender_rm, {
                    rm: message.sender_rm,
                    nome_completo: message.sender_name || `Aluno ${message.sender_rm}`,
                    id: message.sender_id,
                    turma_id: message.sender_class || 'Não informada',
                    lastMessage: message.created_at
                });
            }
        }
    });
    
    return Array.from(studentsMap.values());
}

function saveMessageToLocalStorage(message) {
    try {
        const allMessages = getAllMessagesFromLocalStorage();
        allMessages.push(message);
        localStorage.setItem('chat_messages_fallback', JSON.stringify(allMessages));
        return true;
    } catch (error) {
        console.error('❌ Erro ao salvar mensagem no localStorage:', error);
        return false;
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
            id: 'admin_001',
            name: 'Administrador',
            role: 'admin',
            rm: 'ADMIN'
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

// ===== CHAT DO ALUNO =====
function initializeStudentChat() {
    console.log('🎓 Inicializando chat do aluno...');
    
    setupStudentEventListeners();
    loadStudentMessages();
    setupDepartments();
    
    setTimeout(adjustStudentLayout, 100);
}

async function loadStudentMessages() {
    try {
        console.log('📥 Carregando mensagens do aluno...');
        
        chatState.messages = await getMessagesForUserBackend(chatState.userId);
        
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
    
    chatState.messages.forEach((message, index) => {
        const messageElement = createMessageElement(message, index);
        container.appendChild(messageElement);
    });
    
    scrollToBottom('messagesContainer');
}

// ===== CHAT DO ADMINISTRADOR =====
async function initializeAdminChat() {
    console.log('👔 Inicializando chat do administrador...');
    
    await loadStudentsList();
    setupAdminEventListeners();
    startAdminPolling();
}

async function loadStudentsList() {
    try {
        console.log('📥 Carregando lista de alunos...');
        
        chatState.studentsList = await getStudentsWithMessages();
        
        // Se não encontrar alunos nas mensagens, buscar da tabela alunos
        if (chatState.studentsList.length === 0) {
            console.log('📥 Buscando alunos da tabela principal...');
            const { data: alunos, error } = await supabase
                .from('alunos')
                .select('rm, nome_completo, turma_id')
                .order('nome_completo');
            
            if (!error && alunos) {
                chatState.studentsList = alunos.map(aluno => ({
                    rm: aluno.rm,
                    nome_completo: aluno.nome_completo,
                    turma_id: aluno.turma_id || 'Não informada'
                }));
            }
        }
        
        renderStudentsList();
        
        const totalEl = document.getElementById('totalStudents');
        if (totalEl) totalEl.textContent = chatState.studentsList.length;
        
        console.log(`✅ ${chatState.studentsList.length} alunos carregados`);
        
    } catch (error) {
        console.error('❌ Erro ao carregar alunos:', error);
        chatState.studentsList = [];
        renderStudentsList();
    }
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

async function loadAdminMessages(aluno) {
    try {
        const messages = await getMessagesBetweenUsers('admin_001', `aluno_${aluno.rm}`);
        
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

// ===== ENVIO DE MENSAGENS =====
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
    
    input.disabled = true;
    if (sendBtn) sendBtn.disabled = true;
    
    try {
        // Criar mensagem na estrutura do seu banco
        const newMessage = {
            sender_id: chatState.userId,
            receiver_id: 'admin_001',
            sender_rm: chatState.userRM,
            sender_role: 'student',
            sender_name: chatState.userName,
            receiver_rm: 'ADMIN',
            receiver_role: 'admin',
            message_text: text,
            department: chatState.currentDepartment || 'all',
            is_read: false,
            created_at: new Date().toISOString()
        };
        
        // Enviar via backend
        const savedMessage = await sendMessageToBackend(newMessage);
        
        // Adicionar ao estado
        chatState.messages.push(savedMessage);
        
        // Salvar no localStorage como fallback
        saveMessageToLocalStorage(savedMessage);
        
        // Renderizar
        renderStudentMessages();
        
        // Limpar input
        input.value = '';
        input.style.height = 'auto';
        
        showNotification('✅ Mensagem enviada!', 'success');
        
    } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error);
        
        // Fallback: salvar apenas no localStorage
        const tempId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        const tempMessage = {
            id: tempId,
            sender_id: chatState.userId,
            receiver_id: 'admin_001',
            sender_rm: chatState.userRM,
            sender_role: 'student',
            sender_name: chatState.userName,
            receiver_rm: 'ADMIN',
            message_text: text,
            department: chatState.currentDepartment || 'all',
            is_read: false,
            created_at: new Date().toISOString()
        };
        
        saveMessageToLocalStorage(tempMessage);
        chatState.messages.push(tempMessage);
        renderStudentMessages();
        
        showNotification('⚠️ Mensagem salva localmente (sem conexão)', 'warning');
    } finally {
        input.disabled = false;
        if (sendBtn) sendBtn.disabled = false;
        input.focus();
    }
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

    input.disabled = true;
    if (sendBtn) sendBtn.disabled = true;

    try {
        const aluno = chatState.selectedStudent;
        
        const newMessage = {
            sender_id: 'admin_001',
            receiver_id: `aluno_${aluno.rm}`,
            sender_rm: 'ADMIN',
            sender_role: 'admin',
            sender_name: 'Administrador',
            receiver_rm: aluno.rm,
            receiver_role: 'student',
            message_text: text,
            department: 'all',
            is_read: false,
            created_at: new Date().toISOString()
        };

        // Enviar via backend
        const savedMessage = await sendMessageToBackend(newMessage);

        // Adicionar ao estado
        const studentMessages = chatState.adminMessages.get(aluno.rm) || [];
        studentMessages.push(savedMessage);
        chatState.adminMessages.set(aluno.rm, studentMessages);
        
        // Salvar no localStorage como fallback
        saveMessageToLocalStorage(savedMessage);
        
        // Renderizar
        renderAdminMessages(studentMessages);

        // Limpar input
        input.value = '';
        input.style.height = 'auto';
        
        showNotification('Mensagem enviada para o aluno', 'success');

    } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error);
        
        // Fallback: salvar apenas no localStorage
        const tempId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        const tempMessage = {
            id: tempId,
            sender_id: 'admin_001',
            receiver_id: `aluno_${aluno.rm}`,
            sender_rm: 'ADMIN',
            sender_role: 'admin',
            sender_name: 'Administrador',
            receiver_rm: aluno.rm,
            message_text: text,
            department: 'all',
            is_read: false,
            created_at: new Date().toISOString()
        };
        
        saveMessageToLocalStorage(tempMessage);
        const studentMessages = chatState.adminMessages.get(aluno.rm) || [];
        studentMessages.push(tempMessage);
        chatState.adminMessages.set(aluno.rm, studentMessages);
        renderAdminMessages(studentMessages);
        
        showNotification('⚠️ Mensagem salva localmente (sem conexão)', 'warning');
    } finally {
        input.disabled = false;
        if (sendBtn) sendBtn.disabled = false;
        input.focus();
    }
}

// ===== SISTEMA DE ATUALIZAÇÃO AUTOMÁTICA =====
async function refreshMessages() {
    if (chatState.userRole === 'admin') {
        if (chatState.selectedStudent) {
            const aluno = chatState.selectedStudent;
            const currentMessages = chatState.adminMessages.get(aluno.rm) || [];
            const newMessages = await getMessagesBetweenUsers('admin_001', `aluno_${aluno.rm}`);
            
            if (newMessages.length !== currentMessages.length) {
                chatState.adminMessages.set(aluno.rm, newMessages);
                renderAdminMessages(newMessages);
                
                // Marcar mensagens recebidas como lidas
                const unreadIds = newMessages
                    .filter(msg => msg.sender_id === `aluno_${aluno.rm}` && !msg.is_read)
                    .map(msg => msg.id);
                
                if (unreadIds.length > 0) {
                    await markMessagesAsReadBackend(unreadIds);
                }
            }
        }
    } else {
        const currentCount = chatState.messages.length;
        const newMessages = await getMessagesForUserBackend(chatState.userId);
        
        if (newMessages.length !== currentCount) {
            chatState.messages = newMessages;
            renderStudentMessages();
            
            // Notificar sobre novas mensagens
            const newFromAdmin = newMessages.filter(msg => 
                msg.sender_id === 'admin_001' && 
                !chatState.messages.some(m => m.id === msg.id)
            );
            
            if (newFromAdmin.length > 0 && !document.hidden) {
                showNotification('📩 Nova mensagem da diretoria!', 'info');
                
                // Marcar como lidas
                const unreadIds = newFromAdmin
                    .filter(msg => !msg.is_read)
                    .map(msg => msg.id);
                
                if (unreadIds.length > 0) {
                    await markMessagesAsReadBackend(unreadIds);
                }
            }
        }
    }
}

function setupAutoRefresh() {
    if (chatState.refreshInterval) {
        clearInterval(chatState.refreshInterval);
    }
    
    chatState.refreshInterval = setInterval(refreshMessages, 3000);
    console.log('🔄 Sistema de atualização automática iniciado');
}

function startAdminPolling() {
    setInterval(() => {
        if (chatState.userRole === 'admin') {
            loadStudentsList();
        }
    }, 10000); // Atualizar lista a cada 10 segundos
}

// ===== FUNÇÕES AUXILIARES =====
function generateMessageId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
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

function createMessageElement(message, index) {
    const isUserMessage = message.sender_id === chatState.userId;
    const isAdmin = message.sender_role === 'admin';
    const isLongMessage = message.message_text && message.message_text.length > 100;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUserMessage ? 'user' : (isAdmin ? 'admin' : 'other')}`;
    
    if (isLongMessage) messageDiv.classList.add('message-long');
    if (index === chatState.messages.length - 1) messageDiv.classList.add('message-new');
    
    messageDiv.dataset.id = message.id;

    // Avatar
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = isUserMessage ? '<i class="fas fa-user"></i>' : 
                       isAdmin ? '<i class="fas fa-user-tie"></i>' : '<i class="fas fa-user"></i>';

    // Conteúdo
    const content = document.createElement('div');
    content.className = 'message-content force-text-break';
    
    // Header
    const header = document.createElement('div');
    header.className = 'message-header';
    
    const senderName = document.createElement('span');
    senderName.className = 'message-sender';
    senderName.textContent = isUserMessage ? 'Você' : 
                            (isAdmin ? 'Administrador' : (message.sender_name || 'Aluno'));
    
    const time = document.createElement('span');
    time.className = 'message-time';
    time.textContent = formatTime(message.created_at);
    
    header.appendChild(senderName);
    header.appendChild(time);
    
    // Texto
    const text = document.createElement('div');
    text.className = 'message-text force-text-break';
    text.textContent = message.message_text || '';
    
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
    const isAdminMessage = message.sender_role === 'admin';
    const isLongMessage = message.message_text && message.message_text.length > 100;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isAdminMessage ? 'admin' : 'user'}`;
    
    if (isLongMessage) messageDiv.classList.add('message-long');
    if (index === chatState.adminMessages.get(chatState.selectedStudent.rm)?.length - 1) {
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

// ... (mantenha as outras funções como renderAdminMessages, renderStudentsList, etc.) ...

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

// ===== LISTENERS DE EVENTOS =====
function setupStudentEventListeners() {
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.querySelector('.send-btn');
    
    if (messageInput) {
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            const newHeight = Math.min(this.scrollHeight, 120);
            this.style.height = newHeight + 'px';
            adjustStudentLayout();
        });

        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendStudentMessage();
            }
        });
        
        setTimeout(() => {
            messageInput.focus();
        }, 500);
    }
    
    if (sendBtn) {
        sendBtn.addEventListener('click', function(e) {
            e.preventDefault();
            sendStudentMessage();
        });
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

// ===== FUNÇÕES DE INTERFACE =====
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

function showNotification(message, type = 'info') {
    // ... (seu código de notificação existente)
}

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
