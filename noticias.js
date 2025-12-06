// ===== SISTEMA DE AUTENTICAÇÃO =====
function checkAdminStatus() {
    // Verifica se o usuário está logado como admin
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

// ===== DADOS DAS NOTÍCIAS =====
let newsData = JSON.parse(localStorage.getItem('newsData')) || {
    featured: {
        id: 1,
        title: "Feira de Ciências 2024 - Inscrições Abertas!",
        category: "events",
        excerpt: "Participe da maior feira de ciências da escola com projetos inovadores. Premiação especial para os melhores trabalhos.",
        image: "🔬",
        date: "25/04/2024",
        author: "Coordenação de Ciências",
        content: `
            <h1>Feira de Ciências 2024</h1>
            <div class="news-meta">
                <span><i class="fas fa-calendar"></i> 25 de Abril de 2024</span>
                <span><i class="fas fa-user"></i> Coordenação de Ciências</span>
            </div>
            
            <div class="news-content-full">
                <p>Estão abertas as inscrições para a Feira de Ciências 2024, o maior evento científico da nossa escola!</p>
                
                <h2><i class="fas fa-list"></i> Como Participar</h2>
                <ul>
                    <li>Inscrições até 15 de Maio</li>
                    <li>Projetos individuais ou em grupo (máx. 4 pessoas)</li>
                    <li>Temas livres ou sugeridos pelos professores</li>
                </ul>
                
                <h2><i class="fas fa-trophy"></i> Premiação</h2>
                <ul>
                    <li>1º Lugar: Tablet + Medalha</li>
                    <li>2º Lugar: Fone Bluetooth + Medalha</li>
                    <li>3º Lugar: Kit Ciências + Medalha</li>
                    <li>Menção Honrosa: Certificado</li>
                </ul>
                
                <h2><i class="fas fa-calendar-alt"></i> Cronograma</h2>
                <ul>
                    <li>Inscrições: 25/04 a 15/05</li>
                    <li>Desenvolvimento: 16/05 a 20/06</li>
                    <li>Apresentação: 25/06 (Auditório Principal)</li>
                </ul>
                
                <p>Não perca essa oportunidade de mostrar seu talento científico!</p>
            </div>
        `
    },
    news: [
        {
            id: 2,
            title: "Passeio ao Museu de Ciências",
            category: "trips",
            excerpt: "Visita técnica ao Museu de Ciências com atividades interativas para todos os alunos.",
            image: "🏛️",
            date: "20/04/2024",
            author: "Coordenação Pedagógica",
            content: "Conteúdo detalhado sobre o passeio ao Museu de Ciências..."
        },
        {
            id: 3,
            title: "Campeonato de Matemática",
            category: "academic",
            excerpt: "Inscrições abertas para o campeonato interno de matemática. Premiação especial!",
            image: "🧮",
            date: "18/04/2024",
            author: "Departamento de Matemática",
            content: "Conteúdo detalhado sobre o campeonato de matemática..."
        },
        {
            id: 4,
            title: "Jogos Escolares 2024",
            category: "sports",
            excerpt: "Competição esportiva entre as turmas. Modalidades: futsal, vôlei e basquete.",
            image: "⚽",
            date: "22/04/2024",
            author: "Departamento de Educação Física",
            content: "Conteúdo detalhado sobre os jogos escolares..."
        },
        {
            id: 5,
            title: "Festival de Teatro",
            category: "cultural",
            excerpt: "Apresentações teatrais dos alunos. Inscrições abertas para participantes.",
            image: "🎭",
            date: "28/04/2024",
            author: "Departamento de Artes",
            content: "Conteúdo detalhado sobre o festival de teatro..."
        },
        {
            id: 6,
            title: "Visita à Empresa de Tecnologia",
            category: "trips",
            excerpt: "Passeio técnico para conhecer o funcionamento de uma empresa de TI.",
            image: "💻",
            date: "30/04/2024",
            author: "Coordenação do Curso de TI",
            content: "Conteúdo detalhado sobre a visita técnica..."
        }
    ],
    events: [
        {
            id: 1,
            title: "Feira de Ciências",
            date: "25/06/2024",
            time: "08:00 - 17:00",
            location: "Auditório Principal"
        },
        {
            id: 2,
            title: "Passeio ao Museu",
            date: "20/05/2024",
            time: "07:30 - 13:00",
            location: "Museu de Ciências"
        },
        {
            id: 3,
            title: "Campeonato de Matemática",
            date: "15/05/2024",
            time: "14:00 - 17:00",
            location: "Sala de Aula 101"
        },
        {
            id: 4,
            title: "Jogos Escolares",
            date: "10/05/2024",
            time: "08:00 - 18:00",
            location: "Quadra Poliesportiva"
        }
    ]
};

// ===== INICIALIZAÇÃO DA PÁGINA =====
function initNews() {
    console.log('📰 Inicializando página de notícias...');
    
    // Verificar status de admin
    checkAdminStatus();
    
    // Preencher estatísticas
    if (document.getElementById('activeNews')) {
        document.getElementById('activeNews').textContent = newsData.news.length + 1;
    }
    if (document.getElementById('nextEvent')) {
        document.getElementById('nextEvent').textContent = newsData.events[0].title;
    }
    
    // Preencher notícia em destaque
    renderFeaturedNews();
    
    // Preencher grid de notícias
    renderNewsGrid();
    
    // Preencher timeline de eventos
    renderEventsTimeline();
    
    // Configurar data de atualização
    if (document.getElementById('lastUpdate')) {
        document.getElementById('lastUpdate').textContent = new Date().toLocaleDateString('pt-BR');
    }
    
    // Configurar eventos
    configurarEventos();
}

// ===== RENDERIZAÇÃO DOS COMPONENTES =====
function renderFeaturedNews() {
    const container = document.getElementById('featuredNews');
    if (!container) return;
    
    const featured = newsData.featured;
    const isAdmin = checkAdminStatus();
    
    container.innerHTML = `
        <div class="featured-content">
            <div class="featured-image">
                ${featured.image}
            </div>
            <div class="featured-info">
                <span class="featured-badge">Destaque</span>
                <h2 class="featured-title">${featured.title}</h2>
                <p class="featured-excerpt">${featured.excerpt}</p>
                <div class="featured-meta">
                    <span><i class="fas fa-calendar"></i> ${featured.date}</span>
                    <span><i class="fas fa-user"></i> ${featured.author}</span>
                </div>
                <button class="cps-btn cps-btn-primary" onclick="openNewsModal(${featured.id})">
                    <i class="fas fa-book-reader"></i>
                    Ler Mais
                </button>
                ${isAdmin ? `
                    <div class="news-actions">
                        <button class="edit-btn" onclick="editNews(${featured.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="delete-btn" onclick="deleteNews(${featured.id})">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function renderNewsGrid() {
    const grid = document.getElementById('newsGrid');
    if (!grid) return;

    grid.innerHTML = '';
    const isAdmin = checkAdminStatus();

    newsData.news.forEach(news => {
        const categoryNames = {
            'events': 'Eventos',
            'trips': 'Passeios',
            'academic': 'Acadêmico',
            'sports': 'Esportes',
            'cultural': 'Cultural'
        };

        const card = document.createElement('div');
        card.className = 'news-card cps-card';
        card.onclick = () => openNewsModal(news.id);
        
        card.innerHTML = `
            <div class="news-image">
                ${news.image}
            </div>
            <div class="news-content">
                <span class="news-category">${categoryNames[news.category]}</span>
                <h3 class="news-title">${news.title}</h3>
                <p class="news-excerpt">${news.excerpt}</p>
                <div class="news-meta">
                    <span><i class="fas fa-calendar"></i> ${news.date}</span>
                    <span><i class="fas fa-user"></i> ${news.author}</span>
                </div>
                ${isAdmin ? `
                    <div class="news-actions">
                        <button class="edit-btn" onclick="event.stopPropagation(); editNews(${news.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="delete-btn" onclick="event.stopPropagation(); deleteNews(${news.id})">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        
        grid.appendChild(card);
    });
}

function renderEventsTimeline() {
    const timeline = document.getElementById('eventsTimeline');
    if (!timeline) return;

    timeline.innerHTML = '';
    const isAdmin = checkAdminStatus();

    newsData.events.forEach(event => {
        const [day, month, year] = event.date.split('/');
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        
        const eventItem = document.createElement('div');
        eventItem.className = 'event-item';
        
        eventItem.innerHTML = `
            <div class="event-date">
                <div class="event-day">${day}</div>
                <div class="event-month">${monthNames[parseInt(month) - 1]}</div>
            </div>
            <div class="event-info">
                <h3>${event.title}</h3>
                <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
            </div>
            <div class="event-time">
                <span><i class="fas fa-clock"></i> ${event.time}</span>
            </div>
            ${isAdmin ? `
                <div class="event-actions">
                    <button class="edit-btn" onclick="editEvent(${event.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="delete-btn" onclick="deleteEvent(${event.id})">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            ` : ''}
        `;
        
        timeline.appendChild(eventItem);
    });
}

// ===== GERENCIAMENTO DE NOTÍCIAS E EVENTOS =====
let currentEditId = null;
let currentEditType = null; // 'news' ou 'event'

function openAddNewsModal() {
    currentEditId = null;
    currentEditType = 'news';
    document.getElementById('newsFormTitle').textContent = 'Adicionar Notícia';
    document.getElementById('newsForm').reset();
    document.getElementById('newsDate').valueAsDate = new Date();
    document.getElementById('newsFormModal').style.display = 'flex';
}

function openAddEventModal() {
    currentEditId = null;
    currentEditType = 'event';
    document.getElementById('eventFormTitle').textContent = 'Adicionar Evento';
    document.getElementById('eventForm').reset();
    document.getElementById('eventDate').valueAsDate = new Date();
    document.getElementById('eventFormModal').style.display = 'flex';
}

function editNews(id) {
    const allNews = [newsData.featured, ...newsData.news];
    const news = allNews.find(n => n.id === id);
    
    if (news) {
        currentEditId = id;
        currentEditType = 'news';
        document.getElementById('newsFormTitle').textContent = 'Editar Notícia';
        document.getElementById('newsTitle').value = news.title;
        document.getElementById('newsCategory').value = news.category;
        document.getElementById('newsExcerpt').value = news.excerpt;
        document.getElementById('newsContent').value = news.content;
        document.getElementById('newsAuthor').value = news.author;
        document.getElementById('newsDate').value = formatDateForInput(news.date);
        document.getElementById('newsFormModal').style.display = 'flex';
    }
}

function editEvent(id) {
    const event = newsData.events.find(e => e.id === id);
    
    if (event) {
        currentEditId = id;
        currentEditType = 'event';
        document.getElementById('eventFormTitle').textContent = 'Editar Evento';
        document.getElementById('eventTitle').value = event.title;
        document.getElementById('eventDate').value = formatDateForInput(event.date);
        document.getElementById('eventTime').value = event.time;
        document.getElementById('eventLocation').value = event.location;
        document.getElementById('eventFormModal').style.display = 'flex';
    }
}

function deleteNews(id) {
    if (confirm('Tem certeza que deseja excluir esta notícia?')) {
        if (id === newsData.featured.id) {
            // Não permitir excluir a notícia em destaque
            showNotification('Não é possível excluir a notícia em destaque!', 'error');
            return;
        }
        
        newsData.news = newsData.news.filter(n => n.id !== id);
        saveData();
        renderNewsGrid();
        updateStats();
        showNotification('Notícia excluída com sucesso!', 'success');
    }
}

function deleteEvent(id) {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
        newsData.events = newsData.events.filter(e => e.id !== id);
        saveData();
        renderEventsTimeline();
        updateStats();
        showNotification('Evento excluído com sucesso!', 'success');
    }
}

function saveNews(event) {
    event.preventDefault();
    
    const newsDataToSave = {
        id: currentEditId || Math.max(...[...newsData.news.map(n => n.id), newsData.featured.id], 0) + 1,
        title: document.getElementById('newsTitle').value,
        category: document.getElementById('newsCategory').value,
        excerpt: document.getElementById('newsExcerpt').value,
        content: document.getElementById('newsContent').value,
        author: document.getElementById('newsAuthor').value,
        date: formatDateForDisplay(document.getElementById('newsDate').value),
        image: getCategoryIcon(document.getElementById('newsCategory').value)
    };
    
    if (currentEditId) {
        // Editar notícia existente
        if (currentEditId === newsData.featured.id) {
            newsData.featured = { ...newsData.featured, ...newsDataToSave };
        } else {
            const index = newsData.news.findIndex(n => n.id === currentEditId);
            if (index !== -1) {
                newsData.news[index] = newsDataToSave;
            }
        }
        showNotification('Notícia atualizada com sucesso!', 'success');
    } else {
        // Adicionar nova notícia
        newsData.news.unshift(newsDataToSave);
        showNotification('Notícia adicionada com sucesso!', 'success');
    }
    
    saveData();
    renderFeaturedNews();
    renderNewsGrid();
    updateStats();
    closeNewsFormModal();
}

function saveEvent(event) {
    event.preventDefault();
    
    const eventDataToSave = {
        id: currentEditId || Math.max(...newsData.events.map(e => e.id), 0) + 1,
        title: document.getElementById('eventTitle').value,
        date: formatDateForDisplay(document.getElementById('eventDate').value),
        time: document.getElementById('eventTime').value,
        location: document.getElementById('eventLocation').value
    };
    
    if (currentEditId) {
        // Editar evento existente
        const index = newsData.events.findIndex(e => e.id === currentEditId);
        if (index !== -1) {
            newsData.events[index] = eventDataToSave;
        }
        showNotification('Evento atualizado com sucesso!', 'success');
    } else {
        // Adicionar novo evento
        newsData.events.unshift(eventDataToSave);
        showNotification('Evento adicionado com sucesso!', 'success');
    }
    
    saveData();
    renderEventsTimeline();
    updateStats();
    closeEventFormModal();
}

function enableEditMode() {
    showNotification('Modo de edição ativado. Use os botões de edição nas notícias e eventos.', 'info');
}

function closeNewsFormModal() {
    document.getElementById('newsFormModal').style.display = 'none';
    currentEditId = null;
    currentEditType = null;
}

function closeEventFormModal() {
    document.getElementById('eventFormModal').style.display = 'none';
    currentEditId = null;
    currentEditType = null;
}

// ===== FUNÇÕES AUXILIARES =====
function formatDateForInput(dateString) {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function getCategoryIcon(category) {
    const icons = {
        'events': '🔬',
        'trips': '🏛️',
        'academic': '🧮',
        'sports': '⚽',
        'cultural': '🎭'
    };
    return icons[category] || '📰';
}

function saveData() {
    localStorage.setItem('newsData', JSON.stringify(newsData));
}

function updateStats() {
    if (document.getElementById('activeNews')) {
        document.getElementById('activeNews').textContent = newsData.news.length + 1;
    }
    if (document.getElementById('nextEvent') && newsData.events.length > 0) {
        document.getElementById('nextEvent').textContent = newsData.events[0].title;
    }
    if (document.getElementById('lastUpdate')) {
        document.getElementById('lastUpdate').textContent = new Date().toLocaleDateString('pt-BR');
    }
}

// ===== CONFIGURAÇÃO DE EVENTOS =====
function configurarEventos() {
    // Filtro de categoria
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            const category = this.value;
            filterNewsByCategory(category);
        });
    }
    
    // Busca de notícias
    const searchNews = document.getElementById('searchNews');
    if (searchNews) {
        searchNews.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            searchNews(searchTerm);
        });
    }
    
    // Botão de atualizar
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Atualizando...';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-sync-alt"></i> Atualizar';
                showNotification('Notícias atualizadas com sucesso!', 'success');
            }, 1000);
        });
    }
    
    // Modais
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close-modal');
    
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    window.addEventListener('click', function(event) {
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Botão de inscrição
    const subscribeBtn = document.querySelector('.subscribe-btn');
    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', function() {
            showNotification('Inscrição realizada com sucesso! Você receberá as notícias por email.', 'success');
            document.getElementById('subscribeModal').style.display = 'none';
        });
    }

    // Formulários
    document.getElementById('newsForm').addEventListener('submit', saveNews);
    document.getElementById('eventForm').addEventListener('submit', saveEvent);
}

// ===== FUNÇÕES DE FILTRO E BUSCA =====
function filterNewsByCategory(category) {
    const allNews = [newsData.featured, ...newsData.news];
    const grid = document.getElementById('newsGrid');
    if (!grid) return;
    
    if (category === 'all') {
        renderNewsGrid();
        document.getElementById('featuredNews').style.display = 'block';
    } else {
        const filteredNews = allNews.filter(news => news.category === category);
        
        grid.innerHTML = '';
        filteredNews.forEach(news => {
            if (news.id === 1) {
                document.getElementById('featuredNews').style.display = 'block';
            } else {
                const categoryNames = {
                    'events': 'Eventos',
                    'trips': 'Passeios',
                    'academic': 'Acadêmico',
                    'sports': 'Esportes',
                    'cultural': 'Cultural'
                };

                const card = document.createElement('div');
                card.className = 'news-card cps-card';
                card.onclick = () => openNewsModal(news.id);
                
                card.innerHTML = `
                    <div class="news-image">
                        ${news.image}
                    </div>
                    <div class="news-content">
                        <span class="news-category">${categoryNames[news.category]}</span>
                        <h3 class="news-title">${news.title}</h3>
                        <p class="news-excerpt">${news.excerpt}</p>
                        <div class="news-meta">
                            <span><i class="fas fa-calendar"></i> ${news.date}</span>
                            <span><i class="fas fa-user"></i> ${news.author}</span>
                        </div>
                        ${checkAdminStatus() ? `
                            <div class="news-actions">
                                <button class="edit-btn" onclick="event.stopPropagation(); editNews(${news.id})">
                                    <i class="fas fa-edit"></i> Editar
                                </button>
                                <button class="delete-btn" onclick="event.stopPropagation(); deleteNews(${news.id})">
                                    <i class="fas fa-trash"></i> Excluir
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `;
                
                grid.appendChild(card);
            }
        });
        
        if (category !== 'all' && !filteredNews.some(news => news.id === 1)) {
            document.getElementById('featuredNews').style.display = 'none';
        }
    }
}

function searchNews(searchTerm) {
    const allNews = [newsData.featured, ...newsData.news];
    const grid = document.getElementById('newsGrid');
    if (!grid) return;
    
    if (searchTerm === '') {
        renderNewsGrid();
        document.getElementById('featuredNews').style.display = 'block';
        return;
    }
    
    const filteredNews = allNews.filter(news => 
        news.title.toLowerCase().includes(searchTerm) ||
        news.excerpt.toLowerCase().includes(searchTerm) ||
        news.author.toLowerCase().includes(searchTerm)
    );
    
    grid.innerHTML = '';
    filteredNews.forEach(news => {
        if (news.id === 1) {
            document.getElementById('featuredNews').style.display = 'block';
        } else {
            const categoryNames = {
                'events': 'Eventos',
                'trips': 'Passeios',
                'academic': 'Acadêmico',
                'sports': 'Esportes',
                'cultural': 'Cultural'
            };

            const card = document.createElement('div');
            card.className = 'news-card cps-card';
            card.onclick = () => openNewsModal(news.id);
            
            card.innerHTML = `
                <div class="news-image">
                    ${news.image}
                </div>
                <div class="news-content">
                    <span class="news-category">${categoryNames[news.category]}</span>
                    <h3 class="news-title">${news.title}</h3>
                    <p class="news-excerpt">${news.excerpt}</p>
                    <div class="news-meta">
                        <span><i class="fas fa-calendar"></i> ${news.date}</span>
                        <span><i class="fas fa-user"></i> ${news.author}</span>
                    </div>
                    ${checkAdminStatus() ? `
                        <div class="news-actions">
                            <button class="edit-btn" onclick="event.stopPropagation(); editNews(${news.id})">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="delete-btn" onclick="event.stopPropagation(); deleteNews(${news.id})">
                                <i class="fas fa-trash"></i> Excluir
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
            
            grid.appendChild(card);
        }
    });
    
    if (searchTerm !== '' && !filteredNews.some(news => news.id === 1)) {
        document.getElementById('featuredNews').style.display = 'none';
    }
}

// ===== FUNÇÕES GLOBAIS =====
window.openNewsModal = function(newsId) {
    const allNews = [newsData.featured, ...newsData.news];
    const news = allNews.find(n => n.id === newsId);
    const modal = document.getElementById('newsModal');
    const modalContent = document.getElementById('modalContent');
    
    if (news && modal && modalContent) {
        modalContent.innerHTML = news.content || `
            <h1>${news.title}</h1>
            <div class="news-meta">
                <span><i class="fas fa-calendar"></i> ${news.date}</span>
                <span><i class="fas fa-user"></i> ${news.author}</span>
            </div>
            <div class="news-content-full">
                <p>${news.excerpt}</p>
                <p>Mais detalhes em breve...</p>
            </div>
        `;
        
        modal.style.display = 'flex';
    }
};

window.showCategory = function(category) {
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.value = category;
        filterNewsByCategory(category);
        
        const newsSection = document.querySelector('.news-section');
        if (newsSection) {
            newsSection.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }
};

window.showModal = function(type) {
    if (type === 'subscribe') {
        const modal = document.getElementById('subscribeModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }
};

// ===== FUNÇÃO DE NOTIFICAÇÃO =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="notification-icon ${getNotificationIcon(type)}"></i>
            <span class="notification-text">${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: var(--border-radius);
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
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

function getNotificationColor(type) {
    const colors = {
        'success': 'var(--cps-verde)',
        'error': 'var(--cps-vermelho)',
        'warning': 'var(--cps-laranja)',
        'info': 'var(--cps-azul-claro)'
    };
    return colors[type] || 'var(--cps-azul-claro)';
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Carregado - Iniciando sistemas...');
    
    initializeZoomControls();
    initializeSocialLinks();
    initNews();
    
    console.log('✅ Todos os sistemas inicializados!');
});