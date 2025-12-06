// ===== SISTEMA DE AUTENTICAÇÃO =====
function checkAdminStatus() {
    const isAdmin = localStorage.getItem('adminLoggedIn') === 'true';
    
    if (isAdmin) {
        showAdminControls();
    }
    
    return isAdmin;
}

function showAdminControls() {
    const adminControls = document.getElementById('adminControls');
    if (adminControls) {
        adminControls.style.display = 'flex';
    }
}

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
            showNotification(`Abrindo ${platform.charAt(0).toUpperCase() + platform.slice(1)}...`, 'info');
        });
    });
}

// ===== DADOS DOS LIVROS =====
let libraryData = JSON.parse(localStorage.getItem('libraryData')) || {
    books: []
};

// ===== LISTA DE PDFs DISPONÍVEIS =====
let availablePdfs = [];

// ===== ESTADO DA BIBLIOTECA =====
let libraryState = {
    currentSubject: 'all',
    searchTerm: '',
    currentPdfUrl: null,
    currentPdfTitle: null,
    currentEditId: null
};

// ===== INICIALIZAÇÃO DA BIBLIOTECA =====
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Inicializando Biblioteca Digital CPS...');
    
    // Inicializar sistemas do header
    initializeHeaderSystems();
    
    // Carregar lista de PDFs disponíveis
    await loadAvailablePdfs();
    
    // Inicializar biblioteca
    initLibrary();
});

function initializeHeaderSystems() {
    initializeZoomControls();
    initializeSocialLinks();
}

async function loadAvailablePdfs() {
    try {
        
        // Para desenvolvimento, você pode definir manualmente os arquivos disponíveis:
        availablePdfs = [
            { name: "Português", path: "pdfs/PortuguesContemp_3_MP_0081P18013_PNLD_2018 (1).pdf" },
            { name: "Historia.pdf", path: "pdfs/historia.pdf" },
            { name: "fisica-.pdf", path: "pdfs/fisica.pdf" },
            { name: "quimica-.pdf", path: "pdfs/quimica.pdf" }
        ];
        
        console.log('📁 PDFs disponíveis:', availablePdfs);
        
        // Atualizar a lista no gerenciador de arquivos
        updateFileManagerList();
        
    } catch (error) {
        console.error('Erro ao carregar PDFs disponíveis:', error);
        showNotification('Erro ao carregar lista de arquivos PDF.', 'error');
    }
}

function initLibrary() {
    // Verificar status de admin
    checkAdminStatus();
    
    // Renderizar livros
    renderBooks();
    
    // Atualizar estatísticas
    updateStatistics();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Configurar filtros
    setupFilters();
}

function renderBooks() {
    const booksContainer = document.getElementById('booksContainer');
    const isAdmin = checkAdminStatus();
    
    booksContainer.innerHTML = '';
    
    if (libraryData.books.length === 0) {
        booksContainer.innerHTML = `
            <div class="no-results-message cps-card">
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-book" style="font-size: 3rem; margin-bottom: 15px; color: var(--cps-azul-claro);"></i>
                    <h3 style="color: var(--cps-azul-escuro); margin-bottom: 10px;">Nenhum livro cadastrado</h3>
                    <p>${isAdmin ? 'Clique em "Adicionar Livro" para começar.' : 'Aguarde o administrador adicionar livros.'}</p>
                </div>
            </div>
        `;
        return;
    }
    
    libraryData.books.forEach(book => {
        const bookCard = createBookCard(book, isAdmin);
        booksContainer.appendChild(bookCard);
    });
}

function createBookCard(book, isAdmin) {
    const bookCard = document.createElement('div');
    bookCard.className = 'book-card cps-card';
    bookCard.setAttribute('data-subject', book.subject);
    bookCard.setAttribute('data-title', book.title);
    bookCard.setAttribute('data-author', book.author);
    
    const subjectNames = {
        'matematica': 'Matemática',
        'portugues': 'Português',
        'fisica': 'Física',
        'quimica': 'Química',
        'biologia': 'Biologia',
        'historia': 'História',
        'geografia': 'Geografia',
        'ingles': 'Inglês',
        'espanhol': 'Espanhol',
        'filosofia': 'Filosofia',
        'sociologia': 'Sociologia',
        'artes': 'Artes',
        'educacao-fisica': 'Educação Física'
    };

    const subjectIcons = {
        'matematica': 'fa-calculator',
        'portugues': 'fa-pen-fancy',
        'fisica': 'fa-atom',
        'quimica': 'fa-flask',
        'biologia': 'fa-dna',
        'historia': 'fa-landmark',
        'geografia': 'fa-globe-americas',
        'ingles': 'fa-language',
        'espanhol': 'fa-language',
        'filosofia': 'fa-brain',
        'sociologia': 'fa-users',
        'artes': 'fa-palette',
        'educacao-fisica': 'fa-running'
    };

    const subjectColors = {
        'matematica': 'cps-bg-azul',
        'portugues': 'cps-bg-laranja',
        'fisica': 'cps-bg-verde',
        'quimica': 'cps-bg-laranja',
        'biologia': 'cps-bg-verde',
        'historia': 'cps-bg-azul',
        'geografia': 'cps-bg-verde',
        'ingles': 'cps-bg-azul',
        'espanhol': 'cps-bg-laranja',
        'filosofia': 'cps-bg-azul',
        'sociologia': 'cps-bg-laranja',
        'artes': 'cps-bg-verde',
        'educacao-fisica': 'cps-bg-laranja'
    };

    // Verificar se o arquivo existe
    const hasFile = book.filename && availablePdfs.some(pdf => pdf.name === book.filename);
    const fileStatus = hasFile ? 'Disponível' : 'Arquivo não encontrado';
    const fileStatusClass = hasFile ? 'file-available' : 'file-unavailable';
    
    bookCard.innerHTML = `
        <div class="book-cover ${subjectColors[book.subject]}">
            <i class="subject-icon fas ${subjectIcons[book.subject]}"></i>
        </div>
        <div class="book-content">
            <span class="book-category cps-badge">${subjectNames[book.subject]}</span>
            <h3 class="book-title">${book.title}</h3>
            <div class="book-author">
                <i class="fas fa-user-edit"></i>
                ${book.author}
            </div>
            <div class="book-meta">
                <span><i class="fas fa-calendar"></i> Adicionado em: ${book.addedDate}</span>
                <span><i class="fas fa-file-pdf"></i> Arquivo: ${book.filename}</span>
                <span class="${fileStatusClass}">
                    <i class="fas ${hasFile ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
                    ${fileStatus}
                </span>
            </div>
            ${book.description ? `<p class="book-description">${book.description}</p>` : ''}
            <div class="book-actions">
                <button class="cps-btn cps-btn-secondary" onclick="viewPdf('${book.filename}', '${book.title.replace(/'/g, "\\'")}')" ${!hasFile ? 'disabled' : ''}>
                    <i class="fas fa-eye"></i>
                    Visualizar
                </button>
                <button class="cps-btn cps-btn-primary" onclick="downloadBook('${book.filename}', '${book.title.replace(/'/g, "\\'")}')" ${!hasFile ? 'disabled' : ''}>
                    <i class="fas fa-download"></i>
                    Download
                </button>
            </div>
            ${isAdmin ? `
                <div class="book-admin-actions">
                    <button class="edit-book-btn" onclick="editBook(${book.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="delete-book-btn" onclick="deleteBook(${book.id})">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            ` : ''}
        </div>
    `;
    
    return bookCard;
}

function updateStatistics() {
    const totalBooks = libraryData.books.length;
    const uniqueSubjects = new Set(libraryData.books.map(book => book.subject)).size;
    
    document.getElementById('totalBooks').textContent = totalBooks;
    document.getElementById('totalSubjects').textContent = uniqueSubjects;
}

function setupEventListeners() {
    // Filtro de matéria
    const subjectFilter = document.getElementById('subjectFilter');
    if (subjectFilter) {
        subjectFilter.addEventListener('change', function() {
            libraryState.currentSubject = this.value;
            filterBooks();
        });
    }
    
    // Busca de livros
    const searchInput = document.getElementById('searchBooks');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            libraryState.searchTerm = this.value.toLowerCase();
            filterBooks();
        });
    }
    
    // Fechar modais ao clicar fora
    window.addEventListener('click', function(event) {
        const bookFormModal = document.getElementById('bookFormModal');
        const fileManagerModal = document.getElementById('fileManagerModal');
        const quickViewModal = document.getElementById('quickViewModal');
        
        if (event.target === bookFormModal) {
            closeBookFormModal();
        }
        if (event.target === fileManagerModal) {
            closeFileManager();
        }
        if (event.target === quickViewModal) {
            closeQuickView();
        }
    });
    
    // Fechar modais com ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeBookFormModal();
            closeFileManager();
            closeQuickView();
        }
    });

    // Formulário de livro
    document.getElementById('bookForm').addEventListener('submit', saveBook);
}

function setupFilters() {
    const subjectFilter = document.getElementById('subjectFilter');
    const subjects = new Set(libraryData.books.map(book => book.subject));
    
    const existingOptions = Array.from(subjectFilter.options).map(opt => opt.value);
    
    subjects.forEach(subject => {
        if (!existingOptions.includes(subject)) {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = formatSubjectName(subject);
            subjectFilter.appendChild(option);
        }
    });
}

function formatSubjectName(subject) {
    const subjectNames = {
        'matematica': 'Matemática',
        'portugues': 'Português',
        'fisica': 'Física',
        'quimica': 'Química',
        'biologia': 'Biologia',
        'historia': 'História',
        'geografia': 'Geografia',
        'ingles': 'Inglês',
        'espanhol': 'Espanhol',
        'filosofia': 'Filosofia',
        'sociologia': 'Sociologia',
        'artes': 'Artes',
        'educacao-fisica': 'Educação Física'
    };
    
    return subjectNames[subject] || subject.charAt(0).toUpperCase() + subject.slice(1);
}

function filterBooks() {
    const bookCards = document.querySelectorAll('.book-card');
    let visibleCount = 0;
    
    bookCards.forEach(card => {
        const subject = card.dataset.subject;
        const title = card.dataset.title.toLowerCase();
        const author = card.dataset.author.toLowerCase();
        
        const matchesSubject = libraryState.currentSubject === 'all' || subject === libraryState.currentSubject;
        const matchesSearch = !libraryState.searchTerm || 
                            title.includes(libraryState.searchTerm) ||
                            author.includes(libraryState.searchTerm);
        
        if (matchesSubject && matchesSearch) {
            card.style.display = 'block';
            visibleCount++;
            card.style.animation = 'fadeIn 0.5s ease';
        } else {
            card.style.display = 'none';
        }
    });
    
    showNoResultsMessage(visibleCount === 0);
}

function showNoResultsMessage(show) {
    let message = document.getElementById('noResultsMessage');
    
    if (show && !message) {
        message = document.createElement('div');
        message.id = 'noResultsMessage';
        message.className = 'no-results-message cps-card';
        message.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 15px; color: var(--cps-azul-claro);"></i>
                <h3 style="color: var(--cps-azul-escuro); margin-bottom: 10px;">Nenhum livro encontrado</h3>
                <p>Tente alterar os filtros ou termos de busca.</p>
            </div>
        `;
        
        const booksContainer = document.getElementById('booksContainer');
        booksContainer.appendChild(message);
    } else if (!show && message) {
        message.remove();
    }
}

// ===== GERENCIAMENTO DE LIVROS =====
function openAddBookModal() {
    libraryState.currentEditId = null;
    document.getElementById('bookFormTitle').textContent = 'Adicionar Livro';
    document.getElementById('bookForm').reset();
    
    // Preencher o select com arquivos disponíveis
    populateFileSelect();
    
    document.getElementById('bookFormModal').style.display = 'flex';
}

function editBook(id) {
    const book = libraryData.books.find(b => b.id === id);
    
    if (book) {
        libraryState.currentEditId = id;
        document.getElementById('bookFormTitle').textContent = 'Editar Livro';
        document.getElementById('bookTitle').value = book.title;
        document.getElementById('bookAuthor').value = book.author;
        document.getElementById('bookSubject').value = book.subject;
        document.getElementById('bookDescription').value = book.description || '';
        
        // Preencher o select com arquivos disponíveis
        populateFileSelect(book.filename);
        
        document.getElementById('bookFormModal').style.display = 'flex';
    }
}

function populateFileSelect(selectedFile = '') {
    const fileSelect = document.getElementById('bookFile');
    fileSelect.innerHTML = '<option value="">Selecione um arquivo PDF</option>';
    
    availablePdfs.forEach(pdf => {
        const option = document.createElement('option');
        option.value = pdf.name;
        option.textContent = pdf.name;
        
        if (pdf.name === selectedFile) {
            option.selected = true;
        }
        
        fileSelect.appendChild(option);
    });
    
    // Se não houver arquivos, mostrar mensagem
    if (availablePdfs.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Nenhum arquivo PDF encontrado na pasta "pdfs/"';
        option.disabled = true;
        fileSelect.appendChild(option);
    }
}

function deleteBook(id) {
    if (confirm('Tem certeza que deseja excluir este livro?')) {
        libraryData.books = libraryData.books.filter(book => book.id !== id);
        saveLibraryData();
        renderBooks();
        updateStatistics();
        showNotification('Livro excluído com sucesso!', 'success');
    }
}

function saveBook(event) {
    event.preventDefault();
    
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();
    const subject = document.getElementById('bookSubject').value;
    const description = document.getElementById('bookDescription').value.trim();
    const selectedFile = document.getElementById('bookFile').value;
    
    // Validações básicas
    if (!title || !author || !subject || !selectedFile) {
        showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    // Verificar se o arquivo selecionado existe
    const fileExists = availablePdfs.some(pdf => pdf.name === selectedFile);
    if (!fileExists) {
        showNotification('O arquivo selecionado não foi encontrado.', 'error');
        return;
    }
    
    const bookData = {
        id: libraryState.currentEditId || Math.max(...libraryData.books.map(b => b.id), 0) + 1,
        title: title,
        author: author,
        subject: subject,
        description: description,
        addedDate: new Date().toLocaleDateString('pt-BR'),
        filename: selectedFile
    };
    
    if (libraryState.currentEditId) {
        // Editar livro existente
        const index = libraryData.books.findIndex(b => b.id === libraryState.currentEditId);
        if (index !== -1) {
            libraryData.books[index] = bookData;
        }
        showNotification('Livro atualizado com sucesso!', 'success');
    } else {
        // Adicionar novo livro
        libraryData.books.unshift(bookData);
        showNotification('Livro adicionado com sucesso!', 'success');
    }
    
    saveLibraryData();
    renderBooks();
    updateStatistics();
    closeBookFormModal();
}

function enableEditMode() {
    showNotification('Modo de edição ativado. Use os botões de edição nos livros.', 'info');
}

function closeBookFormModal() {
    document.getElementById('bookFormModal').style.display = 'none';
    libraryState.currentEditId = null;
}

function saveLibraryData() {
    try {
        localStorage.setItem('libraryData', JSON.stringify(libraryData));
    } catch (e) {
        console.error('Erro ao salvar dados:', e);
        showNotification('Erro ao salvar dados. Tente novamente.', 'error');
    }
}

// ===== GERENCIADOR DE ARQUIVOS =====
function openFileManager() {
    updateFileManagerList();
    document.getElementById('fileManagerModal').style.display = 'flex';
}

function closeFileManager() {
    document.getElementById('fileManagerModal').style.display = 'none';
}

function updateFileManagerList() {
    const filesList = document.getElementById('filesList');
    
    if (availablePdfs.length === 0) {
        filesList.innerHTML = `
            <div class="no-files-message">
                <i class="fas fa-folder-open"></i>
                <h3>Nenhum arquivo encontrado</h3>
                <p>Coloque seus arquivos PDF na pasta "pdfs/" do projeto</p>
            </div>
        `;
        return;
    }
    
    filesList.innerHTML = '';
    
    availablePdfs.forEach((pdf, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        fileItem.innerHTML = `
            <div class="file-info">
                <i class="fas fa-file-pdf file-icon"></i>
                <div>
                    <div class="file-name">${pdf.name}</div>
                    <div class="file-size">${pdf.path}</div>
                </div>
            </div>
            <div class="file-actions">
                <button class="cps-btn cps-btn-secondary" onclick="previewFile('${pdf.name}')">
                    <i class="fas fa-eye"></i> Visualizar
                </button>
                <button class="cps-btn cps-btn-secondary" onclick="testFile('${pdf.name}')">
                    <i class="fas fa-check"></i> Testar
                </button>
            </div>
        `;
        
        filesList.appendChild(fileItem);
    });
}

function refreshFileList() {
    // Em um ambiente real, você faria uma requisição ao servidor
    // Aqui apenas recarregamos a lista estática
    loadAvailablePdfs();
    showNotification('Lista de arquivos atualizada!', 'success');
}

function uploadNewFile() {
    document.getElementById('fileUploadInput').click();
}

function handleFileUpload(event) {
    const files = event.target.files;
    
    if (files.length === 0) return;
    
    // Em um ambiente real, você enviaria os arquivos para o servidor
    // Aqui apenas mostramos uma notificação
    showNotification(`${files.length} arquivo(s) selecionado(s). Em um ambiente real, eles seriam enviados para a pasta "pdfs/".`, 'info');
    
    // Limpar o input
    event.target.value = '';
}

function previewFile(filename) {
    const pdf = availablePdfs.find(p => p.name === filename);
    if (!pdf) return;
    
    document.getElementById('quickViewTitle').textContent = `Visualizando: ${filename}`;
    const quickViewFrame = document.getElementById('quickViewFrame');
    quickViewFrame.src = pdf.path;
    document.getElementById('quickViewModal').style.display = 'flex';
}

function testFile(filename) {
    const pdf = availablePdfs.find(p => p.name === filename);
    if (!pdf) return;
    
    // Verificar se o arquivo está acessível
    fetch(pdf.path)
        .then(response => {
            if (response.ok) {
                showNotification(`✅ Arquivo "${filename}" está acessível!`, 'success');
            } else {
                showNotification(`❌ Arquivo "${filename}" não encontrado.`, 'error');
            }
        })
        .catch(error => {
            console.error('Erro ao testar arquivo:', error);
            showNotification(`❌ Erro ao acessar "${filename}". Verifique se o arquivo está na pasta "pdfs/".`, 'error');
        });
}

function closeQuickView() {
    document.getElementById('quickViewModal').style.display = 'none';
    const quickViewFrame = document.getElementById('quickViewFrame');
    quickViewFrame.src = '';
}

// ===== VISUALIZAÇÃO E DOWNLOAD DE PDFs =====
window.viewPdf = function(filename, bookTitle) {
    const pdf = availablePdfs.find(p => p.name === filename);
    
    if (!pdf) {
        showNotification('Arquivo PDF não encontrado.', 'error');
        return;
    }
    
    // Abrir em nova aba
    window.open(pdf.path, '_blank');
    showNotification(`Abrindo "${bookTitle}" em nova aba...`, 'info');
    
    // Registrar visualização
    logView(bookTitle);
};

window.downloadBook = function(filename, bookTitle) {
    const pdf = availablePdfs.find(p => p.name === filename);
    
    if (!pdf) {
        showNotification('Arquivo PDF não encontrado.', 'error');
        return;
    }
    
    showNotification(`Iniciando download de "${bookTitle}"...`, 'info');
    
    // Criar link de download
    const a = document.createElement('a');
    a.href = pdf.path;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showNotification(`Download de "${bookTitle}" iniciado!`, 'success');
    
    // Registrar download
    logDownload(filename);
};

function logView(bookTitle) {
    try {
        const views = JSON.parse(localStorage.getItem('bookViews')) || {};
        views[bookTitle] = (views[bookTitle] || 0) + 1;
        localStorage.setItem('bookViews', JSON.stringify(views));
    } catch (e) {
        console.error('Erro ao registrar visualização:', e);
    }
}

function logDownload(filename) {
    try {
        const downloads = JSON.parse(localStorage.getItem('bookDownloads')) || {};
        downloads[filename] = (downloads[filename] || 0) + 1;
        localStorage.setItem('bookDownloads', JSON.stringify(downloads));
    } catch (e) {
        console.error('Erro ao registrar download:', e);
    }
}

// ===== SISTEMA DE NOTIFICAÇÕES =====
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="notification-icon ${getNotificationIcon(type)}"></i>
            <span class="notification-text">${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'fas fa-check-circle',
        'error': 'fas fa-exclamation-circle',
        'warning': 'fas fa-exclamation-triangle',
        'info': 'fas fa-info-circle'
    };
    return icons[type] || 'fas fa-info-circle';
}

// ===== OTIMIZAÇÕES =====
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

window.addEventListener('load', preloadHeaderImages);