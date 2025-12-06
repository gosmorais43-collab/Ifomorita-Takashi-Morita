// ===== SISTEMA DE AUTENTICAÇÃO =====
function checkAdminStatus() {
    // Verifica se o usuário está logado como admin
    // Em um sistema real, isso viria do servidor ou de uma sessão segura
    const isAdmin = localStorage.getItem('adminLoggedIn') === 'true';
    
    if (isAdmin) {
        showAdminControls();
    }
    
    return isAdmin;
}

function showAdminControls() {
    const adminControls = document.getElementById('adminControls');
    const actionsHeader = document.getElementById('actionsHeader');
    
    if (adminControls && actionsHeader) {
        adminControls.style.display = 'flex';
        actionsHeader.style.display = 'table-cell';
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

// ===== DADOS DOS PROFESSORES =====
let professores = JSON.parse(localStorage.getItem('professores')) || [
    {id: 1, nome: "ADRIANO OLIVEIRA BARBOSA", email: "", site: "", lattes: ""},
    {id: 2, nome: "ADRIANO OLIVEIRA COTA", email: "", site: "", lattes: ""},
    {id: 3, nome: "ADRIANO RESENDE DO NASCIMENTO", email: "adriano.nascimento16@etec.sp.gov.br", site: "", lattes: ""},
    {id: 4, nome: "ADRIANO SANTOS CERQUEIRA", email: "ascpuc@gmail.com", site: "", lattes: ""},
    {id: 5, nome: "AGNALDO MARQUES CRUZ", email: "profagnaldologistica@hotmail.com", site: "", lattes: ""},
    {id: 6, nome: "AIRTON CRUZ SILVA", email: "airton.silva01@etec.sp.gov.br", site: "", lattes: "http://lattes.cnpq.br/3420888237546567"},
    {id: 7, nome: "ALESSANDRA SOUSA DA SILVA", email: "", site: "", lattes: ""},
    {id: 8, nome: "ALEX SANDRO SANTOS SILVA", email: "", site: "", lattes: ""},
    {id: 9, nome: "ALEXANDRE ALVES SIMAO", email: "alexandre.simao3@etec.sp.gov.br", site: "", lattes: ""},
    {id: 10, nome: "ALIDA TEREZINHA DE FARIAS", email: "atfarias0812@gmail.com", site: "", lattes: ""},
    {id: 11, nome: "ALLAN ARAUJO COELHO", email: "", site: "", lattes: ""},
    {id: 12, nome: "ALMIR SOARES DA SILVA", email: "", site: "", lattes: ""},
    {id: 13, nome: "AMANDA APARECIDA PUPPIM", email: "", site: "", lattes: ""},
    {id: 14, nome: "ANA CASSIA DOS SANTOS HAYASHI", email: "anacassiahayashi@gmail.com", site: "", lattes: ""},
    {id: 15, nome: "ANA LUCIA CALACA", email: "regina.dias6@etec.sp.gov.br", site: "", lattes: ""},
    {id: 16, nome: "ANDRE DE LUCAS OLIVERO", email: "", site: "", lattes: ""},
    {id: 17, nome: "ANDRE LOPES LOULA", email: "", site: "", lattes: ""},
    {id: 18, nome: "ANDREIA REIMBERG FREITAS", email: "", site: "", lattes: ""},
    {id: 19, nome: "ANDREZA CAPIOTTO CAVOLI", email: "", site: "", lattes: ""},
    {id: 20, nome: "ANGELA MARIA DA PÁSCOA CAMPOS MADRINI", email: "", site: "", lattes: ""},
    {id: 21, nome: "ANIZIO DOS SANTOS", email: "", site: "servdata.cnt.br", lattes: ""},
    {id: 22, nome: "ANTONIO CARLOS AUGUSTO MARINHO", email: "", site: "", lattes: ""},
    {id: 23, nome: "ANTONIO CARLOS MOTA", email: "", site: "", lattes: ""},
    {id: 24, nome: "ANTONIO CARLOS ROCHA DOS SANTOS", email: "", site: "", lattes: ""},
    {id: 25, nome: "ARAQUEM BRUNO LOPES FERNANDES", email: "", site: "", lattes: ""},
    {id: 26, nome: "ARINDA MARIA DA ROCHA", email: "arindarocha@hotmail.com", site: "", lattes: ""},
    {id: 27, nome: "ARLETE NUNES DA SILVA", email: "", site: "", lattes: ""},
    {id: 28, nome: "BENTO ALVES CERQUEIRA CESAR FILHO", email: "bento.cesar@etec.sp.gov.br", site: "", lattes: ""},
    {id: 29, nome: "BRUNA SOARES DE SOUZA", email: "", site: "", lattes: ""},
    {id: 30, nome: "BRUNO PEREIRA DA SILVA", email: "", site: "", lattes: ""},
    {id: 31, nome: "CAMILA DUARTE BALDINI", email: "camila.baldini01@etec.sp.gov.br", site: "", lattes: ""},
    {id: 32, nome: "CAMILO CORDEIRO PEDRA", email: "", site: "", lattes: ""},
    {id: 33, nome: "CHRISTIAN FERREIRA DE OLIVEIRA", email: "", site: "", lattes: ""},
    {id: 34, nome: "CINTIA MARIA DE OLIVEIRA", email: "", site: "", lattes: ""},
    {id: 35, nome: "CLÉBER PEREIRA CALÇA", email: "", site: "", lattes: ""},
    {id: 36, nome: "CRISOGONO ANTONIO MARTINS", email: "crisomartins@hotmail.com", site: "", lattes: ""},
    {id: 37, nome: "CRISTIANE FURLAN", email: "cristiane.furlan@etec.sp.gov.br", site: "", lattes: "http://lattes.cnpq.br/2962985541949900"},
    {id: 38, nome: "CRISTIANE SANCHEZ MACEDO DE SOUZA", email: "cristiane.souza114@etec.sp.gov.br", site: "", lattes: ""},
    {id: 39, nome: "DANIEL MARCOLINO", email: "profdanhiel@etectm.com", site: "", lattes: ""},
    {id: 40, nome: "DANIELLA BARBOSA BUTTLER", email: "", site: "", lattes: ""},
    {id: 41, nome: "DANILLO MARCHESANO RAMOS ALVES", email: "danillo.marchesano@etec.sp.gov.br", site: "", lattes: ""},
    {id: 42, nome: "DARIO CORTEZ PARE", email: "dario.pare01@etec.sp.gov.br", site: "", lattes: ""},
    {id: 43, nome: "DENER EVANGELISTA DA CRUZ", email: "", site: "", lattes: ""},
    {id: 44, nome: "DENILSON SERRA RODRIGUES DA ROCHA", email: "", site: "", lattes: ""},
    {id: 45, nome: "DENISE VILELA SANTUCCI", email: "", site: "", lattes: ""},
    {id: 46, nome: "DIMAS PEDROSO NETO", email: "", site: "", lattes: ""},
    {id: 47, nome: "EDISON KANASHIRO", email: "edison.kanashiro01@etec.sp.gov.br", site: "-x-", lattes: "-x-"},
    {id: 48, nome: "EDSON DE OLIVEIRA", email: "edsondeoliveira64@homail.com", site: "", lattes: ""},
    {id: 49, nome: "EDSON JOSE RODRIGUES", email: "edson.rodrigues23@etec.sp.gov.br", site: "www.etectm.com", lattes: ""},
    {id: 50, nome: "EDUARDO ARMANI", email: "professoreduardoetec@gmail.com", site: "", lattes: ""},
    {id: 51, nome: "EDUARDO AUGUSTO PASCOAL", email: "", site: "", lattes: ""},
    {id: 52, nome: "EDUARDO DE SOUZA SANTOS", email: "", site: "", lattes: ""},
    {id: 53, nome: "EGLE MENDES MARTINS", email: "", site: "", lattes: ""},
    {id: 54, nome: "ELENICE DA SILVA", email: "elenice.silva3@etec.sp.gov.br", site: "", lattes: ""},
    {id: 55, nome: "ELIANA XAVIER DE OLIVEIRA", email: "", site: "", lattes: ""},
    {id: 56, nome: "ELIANE APARECIDA RODRIGUES SILVA", email: "", site: "", lattes: ""},
    {id: 57, nome: "ELISABETH TOLEDO DA SILVA", email: "elisabeth.silva12@etec.sp.gov.br", site: "", lattes: ""},
    {id: 58, nome: "ELVIS RODRIGO MARQUES", email: "", site: "", lattes: ""},
    {id: 59, nome: "EMILIO MENDES DOS REIS", email: "", site: "", lattes: ""},
    {id: 60, nome: "ERCILIA DORTH SILVEIRA", email: "", site: "", lattes: ""},
    {id: 61, nome: "ERNESTO AUGUSTO MOURA", email: "", site: "2731379541570370", lattes: ""},
    {id: 62, nome: "EUCLIDES OLIVEIRA DOS SANTOS", email: "euclides.santos@etec.sp.gov.br", site: "euclides.oliveira2012@bol.com.br", lattes: "euclides.oliveira2012@bol.com.br"},
    {id: 63, nome: "EUDES CRISTINO DE FRANCA", email: "eudes.crisfranca@gmail.com.br", site: "w", lattes: "w"},
    {id: 64, nome: "FABIANA ESTELA DA SILVA YAMANA", email: "fabiana.yamana@etec.sp.gov.br", site: "", lattes: "http://lattes.cnpq.br/2985081754107470"},
    {id: 65, nome: "FABIOLA DE TORRES SANTOS", email: "", site: "", lattes: ""},
    {id: 66, nome: "FELIPE CORDEIRO FRANCISCO", email: "", site: "", lattes: ""},
    {id: 67, nome: "FELIPE JOSE HENRIQUE DOS SANTOS", email: "", site: "", lattes: ""},
    {id: 68, nome: "FERNANDO ALMEIDA OLIVEIRA", email: "", site: "", lattes: ""},
    {id: 69, nome: "FLANY TOLEDO", email: "", site: "", lattes: ""},
    {id: 70, nome: "FLAVIA CHRISTINA ANDRADE GRIMM", email: "", site: "", lattes: ""},
    {id: 71, nome: "FLAVIA REGINA DE MELO OLIVEIRA", email: "", site: "", lattes: ""},
    {id: 72, nome: "FLAVIO FERREIRA BENTO", email: "flavio.bento3@etec.sp.gov.br", site: "", lattes: ""},
    {id: 73, nome: "GABRIELA MOURA DA SILVEIRA", email: "gabriela.silveira36@etec.sp.gov.br", site: "", lattes: ""},
    {id: 74, nome: "GERALDO LUIS ANTUNES LINS", email: "", site: "", lattes: ""},
    {id: 75, nome: "GILMAR CARLOS DE CAMPOS", email: "", site: "", lattes: ""},
    {id: 76, nome: "GLAUCIA DE ANDRADE DORIA", email: "", site: "", lattes: ""},
    {id: 77, nome: "GUILHERME KENJI YAMAMOTO", email: "guilherme.yamamoto3@etec.sp.gov.br", site: "http://superkinji.wix.com/prof-guilherme#!eco/c1v2", lattes: "http://buscatextual.cnpq.br/buscatextual/visualizacv.do?id=k4602142u2"},
    {id: 78, nome: "HERMAN SCHNABEL FRAGOSO", email: "", site: "", lattes: ""},
    {id: 79, nome: "HERODES BESERRA CAVALCANTI", email: "", site: "", lattes: ""},
    {id: 80, nome: "IGOR IVANOWSKY CALMON NOGUEIRA DA GAMA", email: "", site: "", lattes: ""},
    {id: 81, nome: "ISABEL GUIMARAES VIEIRA DE SOUZA", email: "", site: "", lattes: ""},
    {id: 82, nome: "ITALO DE MENEZES LESSA", email: "italo.lessa01@etec.sp.gov.br", site: "", lattes: ""},
    {id: 83, nome: "IVANIA SCHUMACKER", email: "ivania.schumacker01@etec.sp.gov.br", site: "", lattes: ""},
    {id: 84, nome: "JANDER TEMISTOCLES DE OLIVEIRA", email: "", site: "", lattes: ""},
    {id: 85, nome: "JAQUELINI RIBEIRO DIAS", email: "", site: "", lattes: ""},
    {id: 86, nome: "JOAO BALON", email: "joaobalon_professor@msn.com", site: "", lattes: ""},
    {id: 87, nome: "JOAO DIAS SIQUEIRA JUNIOR", email: "joao.siqueira50@etec.sp.gov.br", site: "", lattes: ""},
    {id: 88, nome: "JOAO LOPES DA SILVA NETO", email: "joao.silva1078@etec.sp.gov.br", site: "", lattes: ""},
    {id: 89, nome: "JOAO SANCHEZ", email: "joao.sanchez.professor@gmail.com", site: "", lattes: ""},
    {id: 90, nome: "JONAS SOARES FILHO", email: "", site: "", lattes: ""},
    {id: 91, nome: "JOSE ANTONIO RIBEIRO JUNIOR", email: "jose.ribeiro165@etec.sp.gov.br", site: "", lattes: "http://lattes.cnpq.br/2688353828458154"},
    {id: 92, nome: "JOSE APARECIDO DE SOUZA", email: "jose.souza251@etec.sp.gov.br", site: "", lattes: ""},
    {id: 93, nome: "JOSE AUGUSTO RODRIGUES", email: "", site: "", lattes: ""},
    {id: 94, nome: "JOSE CURIACOS NETO", email: "curiacosmarketing@hotmail.com", site: "", lattes: ""},
    {id: 95, nome: "JOSE MARCELO DA SILVA", email: "", site: "", lattes: ""},
    {id: 96, nome: "JOSE ROBERTO DE AQUINO", email: "", site: "", lattes: ""},
    {id: 97, nome: "JOSE SALO GANDELMAN", email: "", site: "", lattes: ""},
    {id: 98, nome: "JULIAN ANTHONY MURRAY CARRYL", email: "juliancarryl@gmail.com", site: "", lattes: ""},
    {id: 99, nome: "JULIANA CARLA CUNHA PEREIRA", email: "juliana.carla.cunha@gmail.com", site: "", lattes: "http:lattes.cnpq.br/3404464122186258"},
    {id: 100, nome: "JULIO LANDUCCI DE DEUS", email: "", site: "", lattes: ""},
    {id: 101, nome: "KAREN AKEMI SAKUYAMA", email: "karen.sakuyama@etec.sp.gov.br", site: "", lattes: ""},
    {id: 102, nome: "KARINA GRACIELA SOARES", email: "", site: "", lattes: ""},
    {id: 103, nome: "KAROL NUNES NASCIMENTO", email: "", site: "", lattes: ""},
    {id: 104, nome: "KATIA DA CONCEICAO RIBEIRO", email: "katia.adm30@gmail.com", site: "", lattes: "https://wwws.cnpq.br/cvlattesweb/pkg_menu.menu?f_cod=7b0eb550c475b0468d616b9650e319fb"},
    {id: 105, nome: "KELLY DIAS OLIMPIO", email: "", site: "", lattes: ""},
    {id: 106, nome: "LAURELENA CORA MARTINS", email: "", site: "", lattes: ""},
    {id: 107, nome: "LEONARDO GUEDES FERREIRA", email: "", site: "", lattes: ""},
    {id: 108, nome: "LETICIA ZAMENGO DO NASCIMENTO", email: "leticiazamengo@hotmail.com", site: "", lattes: ""},
    {id: 109, nome: "LUCIANA DE SOUZA SILVA", email: "", site: "", lattes: ""},
    {id: 110, nome: "LUCIO TADEU COSTABILE", email: "", site: "", lattes: ""},
    {id: 111, nome: "LUIS FERNANDO DA SILVA JUNIOR", email: "", site: "", lattes: ""},
    {id: 112, nome: "LUIZ ANTONIO DA CRUZ JUNIOR", email: "luiz.cruz29@etec.sp.gov.br", site: "", lattes: ""},
    {id: 113, nome: "LUIZ CARLOS ALONSO LOZANO", email: "", site: "", lattes: ""},
    {id: 114, nome: "LUIZ CARLOS DE FREITAS", email: "lcfreitas2011@terra.com.br", site: "", lattes: ""},
    {id: 115, nome: "MARCELIANA MENDES DOS REIS", email: "", site: "", lattes: ""},
    {id: 116, nome: "MARCELLO PAULA CARVALHO", email: "marcello.meta@hotmail.com", site: "", lattes: ""},
    {id: 117, nome: "MARCELLO SCARPEL CONTINI", email: "", site: "", lattes: ""},
    {id: 118, nome: "MARCELO COELHO DE SOUZA", email: "", site: "", lattes: ""},
    {id: 119, nome: "MARCELO DE RICO ELEODORO", email: "marcelo.eleodoro3@etec.sp.gov.br", site: "", lattes: ""},
    {id: 120, nome: "MARCO ANTONIO DA SILVA", email: "", site: "", lattes: ""},
    {id: 121, nome: "MARCOS AUGUSTO PEREIRA DA SILVA", email: "profmarcosaugustops@gmail.com", site: "", lattes: "http://lattes.cnpq.br/1264973102433072"},
    {id: 122, nome: "MARCOS JOSE DA SILVA", email: "", site: "", lattes: ""},
    {id: 123, nome: "MARCOS LIMA DE OLIVEIRA", email: "marcos.oliveira146@etec.sp.gov.br", site: "", lattes: ""},
    {id: 124, nome: "MARIA ALICE OLIVA DE OLIVEIRA", email: "o mesmo", site: "", lattes: ""},
    {id: 125, nome: "MARIA CRISTINA GAMA BONINI", email: "prof.mariacristina.etec@gmail.com", site: "", lattes: ""},
    {id: 126, nome: "MARIA HELENA RIBEIRO SILVA", email: "mribeirohs@yahoo.com.br", site: "", lattes: ""},
    {id: 127, nome: "MARLICE GOMES AMARANTE", email: "marlice.amarante@etec.sp.gov.br", site: "", lattes: ""},
    {id: 128, nome: "NATALIA DE MENEZES LESSA", email: "profnatalialessa@gmail.com", site: "", lattes: ""},
    {id: 129, nome: "NATHALIA BARROS MESQUITA MONTAGNER", email: "", site: "", lattes: ""},
    {id: 130, nome: "OSSIMAR MENDES TINEL", email: "", site: "", lattes: ""},
    {id: 131, nome: "PATRICIA GUIMARAES DE SOUZA", email: "", site: "", lattes: ""},
    {id: 132, nome: "PAULO CESAR OLIVEIRA GAMA", email: "prof.gama.paulo@gmail.com", site: "", lattes: ""},
    {id: 133, nome: "PAULO FERNANDES PANTALEAO", email: "", site: "", lattes: ""},
    {id: 134, nome: "PAULO HENRIQUE DA SILVA", email: "paulohtst@outlook.com", site: "", lattes: ""},
    {id: 135, nome: "PAULO HENRIQUE DOS SANTOS", email: "", site: "", lattes: ""},
    {id: 136, nome: "PAULO MARCOS NUNES CAMARGO", email: "paulo.camargo37", site: "", lattes: ""},
    {id: 137, nome: "PEDRO MAICO CADORNA DE SOUSA", email: "", site: "", lattes: ""},
    {id: 138, nome: "RAQUEL CATARINA ALVES LANDIM", email: "", site: "", lattes: ""},
    {id: 139, nome: "RAQUEL SCHNOELLER DE TOLEDO", email: "", site: "", lattes: ""},
    {id: 140, nome: "REGINA HELENA DIAS GATTI", email: "", site: "", lattes: ""},
    {id: 141, nome: "REGINA PEREIRA GARCIA", email: "", site: "", lattes: ""},
    {id: 142, nome: "REGINALDO DOS SANTOS", email: "", site: "", lattes: ""},
    {id: 143, nome: "REINALDO DA SILVA SANTOS", email: "reinaudo@gmail.com", site: "", lattes: ""},
    {id: 144, nome: "RENAN AIROSA MACHADO DE AZEVEDO", email: "renan.mack@gmail.com", site: "", lattes: ""},
    {id: 145, nome: "RENATA DE CAMPOS GARCIA", email: "", site: "", lattes: ""},
    {id: 146, nome: "RENATA SARAIVA CORREA DE SOUZA", email: "", site: "", lattes: ""},
    {id: 147, nome: "RENATO CZARNOTTA", email: "", site: "", lattes: ""},
    {id: 148, nome: "RENATO HENRIQUE DA LUZ", email: "", site: "", lattes: ""},
    {id: 149, nome: "RICARDO DANIEL ALVES LOPES", email: "", site: "", lattes: ""},
    {id: 150, nome: "RICARDO HERRERO MARTINS DE CARVALHO", email: "", site: "", lattes: ""},
    {id: 151, nome: "RICARDO SANTIN", email: "", site: "", lattes: ""},
    {id: 152, nome: "RODRIGO ANTUNES", email: "", site: "", lattes: ""},
    {id: 153, nome: "ROGERIO BARBOSA DA SILVA", email: "GERAO_GERAO@HOTMAIL.COM", site: "", lattes: ""},
    {id: 154, nome: "ROMILDO DE CAMPOS PARADELO JUNIOR", email: "", site: "", lattes: ""},
    {id: 155, nome: "ROSA DE SOUZA OLIVEIRA", email: "", site: "", lattes: ""},
    {id: 156, nome: "ROSANE MARGARITELLI MOREIRA", email: "", site: "", lattes: ""},
    {id: 157, nome: "RUBENS DE OLIVEIRA", email: "", site: "", lattes: ""},
    {id: 158, nome: "RUDIMAR LUIZ DE OLIVEIRA", email: "", site: "", lattes: ""},
    {id: 159, nome: "RUTE AMADO DE MOURA", email: "", site: "", lattes: ""},
    {id: 160, nome: "SAMUEL DE ALMEIDA RIBEIRO", email: "samuel.ribeiro33@etec.sp.gov.br", site: "", lattes: ""},
    {id: 161, nome: "SANDRA HELENA DA SILVA DE SANTIS", email: "", site: "", lattes: ""},
    {id: 162, nome: "SANDRA RIBEIRO COSTA DA SILVA", email: "", site: "", lattes: ""},
    {id: 163, nome: "SANDRO MARTINS VARGAS", email: "", site: "", lattes: ""},
    {id: 164, nome: "SERGIO TAVARES", email: "sergio.tavares@etec.sp.gov.br", site: "https://sites.google.com/site/tavaresst/", lattes: "http://lattes.cnpq.br/2406666178413864"},
    {id: 165, nome: "SHAIENE DE CARVALHO SILVA", email: "", site: "", lattes: ""},
    {id: 166, nome: "SILVIA CIRLENE PULTRINI", email: "", site: "", lattes: ""},
    {id: 167, nome: "SILVIA HELENA DE ARAUJO BUENO", email: "", site: "", lattes: ""},
    {id: 168, nome: "SOLANGE CASELLA ALBUQUERQUE", email: "solange.albuquerque5@etec.sp.gov.br", site: "", lattes: ""},
    {id: 169, nome: "TADEU SILVESTRE DA SILVA", email: "", site: "", lattes: ""},
    {id: 170, nome: "TANIA SAYURI ODA SANTANA", email: "tania.santana6@etec.sp.gov.br", site: "www.etectm.com", lattes: ""},
    {id: 171, nome: "TARCISIO OLIVEIRA VASCONCELOS", email: "", site: "", lattes: ""},
    {id: 172, nome: "TATIANA DOS SANTOS", email: "thati_ef@yahoo.com.br", site: "", lattes: ""},
    {id: 173, nome: "TATIANE RUIZ FALCONI", email: "", site: "", lattes: ""},
    {id: 174, nome: "THALES BIANCHI TOLEDO", email: "", site: "", lattes: ""},
    {id: 175, nome: "THALITA ALMEIDA MARTINS PESSOA", email: "thalita_tau@hotmail.com", site: "", lattes: ""},
    {id: 176, nome: "THIAGO MARCELO DE OLIVEIRA", email: "", site: "", lattes: ""},
    {id: 177, nome: "THIAGO TEIXEIRA", email: "thiago.educ@hotmail.com", site: "www.facebook.com/profthiagoteixeira", lattes: "http://lattes.cnpq.br/8064426378547758"},
    {id: 178, nome: "TIZIANO GAVIOLI", email: "tiziano.gavioli01@etec.sp.gov.br", site: "", lattes: ""},
    {id: 179, nome: "VALDECI PEREIRA DE ALMEIDA", email: "vpaphk@hotmail.com", site: "", lattes: ""},
    {id: 180, nome: "VALDOMIRO GONÇALVES CERQUEIRA", email: "valdomirocerqueira8@gmail.com", site: "", lattes: ""},
    {id: 181, nome: "VALERIA PROFITTE", email: "valeprofit@msn.com", site: "", lattes: ""},
    {id: 182, nome: "VANDERLENA ABREU LIMA", email: "vanderlena.lima@etec.sp.gov.br", site: "", lattes: ""},
    {id: 183, nome: "VANUSKA MENDES DOS REIS", email: "", site: "", lattes: ""},
    {id: 184, nome: "VERA LUCIA PINTO", email: "veralucia.pinzon.pinto@gmail.com", site: "", lattes: ""},
    {id: 185, nome: "VERA LUCIA SANTOS SILVA", email: "vera.silva46@etec.sp.gov.br", site: "", lattes: ""},
    {id: 186, nome: "VERUSKA MESQUITA DE SOUSA MORAZOTTI", email: "", site: "", lattes: ""},
    {id: 187, nome: "VILMAR IDELFONSO DE OLIVEIRA", email: "vilmar.oliveira2@etec.sp.gov.br", site: "", lattes: ""},
    {id: 188, nome: "VINICIUS DE LIRA TEIXEIRA", email: "", site: "", lattes: ""},
    {id: 189, nome: "WALDICE CAROLINA DA SILVA", email: "waldice.silva01@etec.sp.gov.br", site: "", lattes: ""},
    {id: 190, nome: "WALTER JOSE SILVA", email: "", site: "", lattes: ""},
    {id: 191, nome: "WENDER VANDO ASSIS PEREIRA", email: "", site: "", lattes: ""},
    {id: 192, nome: "WILSON MITIHARU SHIBATA", email: "", site: "", lattes: ""},
    {id: 193, nome: "WILTON CAMPOS MARCELINO", email: "", site: "", lattes: ""},
    {id: 194, nome: "ZELIA MARIA NOGUEIRA BRITSC", email: "", site: "", lattes: ""}
];

// ===== SISTEMA DE MODAL =====
let currentEditId = null;

function openAddModal() {
    currentEditId = null;
    document.getElementById('modalTitle').textContent = 'Adicionar Professor';
    document.getElementById('teacherForm').reset();
    document.getElementById('teacherModal').style.display = 'block';
}

function openEditModal(professor) {
    currentEditId = professor.id;
    document.getElementById('modalTitle').textContent = 'Editar Professor';
    document.getElementById('teacherName').value = professor.nome;
    document.getElementById('teacherEmail').value = professor.email || '';
    document.getElementById('teacherSite').value = professor.site || '';
    document.getElementById('teacherLattes').value = professor.lattes || '';
    document.getElementById('teacherModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('teacherModal').style.display = 'none';
    currentEditId = null;
}

// ===== GERENCIAMENTO DE PROFESSORES =====
function saveProfessor(event) {
    event.preventDefault();
    
    const nome = document.getElementById('teacherName').value;
    const email = document.getElementById('teacherEmail').value;
    const site = document.getElementById('teacherSite').value;
    const lattes = document.getElementById('teacherLattes').value;
    
    if (currentEditId) {
        // Editar professor existente
        const index = professores.findIndex(p => p.id === currentEditId);
        if (index !== -1) {
            professores[index] = { ...professores[index], nome, email, site, lattes };
            showNotification('Professor atualizado com sucesso!', 'success');
        }
    } else {
        // Adicionar novo professor
        const newId = Math.max(...professores.map(p => p.id), 0) + 1;
        professores.push({ id: newId, nome, email, site, lattes });
        showNotification('Professor adicionado com sucesso!', 'success');
    }
    
    // Salvar no localStorage
    localStorage.setItem('professores', JSON.stringify(professores));
    
    // Atualizar a tabela
    renderTeachersTable();
    
    // Fechar modal
    closeModal();
}

function deleteProfessor(id) {
    if (confirm('Tem certeza que deseja excluir este professor?')) {
        professores = professores.filter(p => p.id !== id);
        localStorage.setItem('professores', JSON.stringify(professores));
        renderTeachersTable();
        showNotification('Professor excluído com sucesso!', 'success');
    }
}

function enableEditMode() {
    const rows = document.querySelectorAll('#teacherTableBody tr');
    
    rows.forEach(row => {
        const editCell = row.querySelector('.edit-cell');
        if (editCell) {
            editCell.style.display = 'table-cell';
        }
    });
    
    showNotification('Modo de edição ativado', 'info');
}

// ===== RENDERIZAÇÃO DA TABELA =====
function renderTeachersTable() {
    const tableBody = document.getElementById('teacherTableBody');
    const isAdmin = checkAdminStatus();
    
    tableBody.innerHTML = '';
    
    professores.forEach(professor => {
        const row = document.createElement('tr');
        
        // Formatar email
        let emailHTML = professor.email ? 
            `<a href="mailto:${professor.email}" class="email-link">${professor.email}</a>` : 
            '<span class="text-secondary">-</span>';
        
        // Formatar site
        let siteHTML = professor.site ? 
            (professor.site.startsWith('http') ? 
                `<a href="${professor.site}" target="_blank" class="external-link"><i class="fas fa-external-link-alt"></i> Site</a>` : 
                `<span>${professor.site}</span>`) : 
            '<span class="text-secondary">-</span>';
        
        // Formatar Lattes
        let lattesHTML = professor.lattes ? 
            (professor.lattes.startsWith('http') ? 
                `<a href="${professor.lattes}" target="_blank" class="external-link"><i class="fas fa-graduation-cap"></i> Lattes</a>` : 
                `<span>${professor.lattes}</span>`) : 
            '<span class="text-secondary">-</span>';
        
        // Coluna de ações (visível apenas para admin)
        let actionsHTML = '';
        if (isAdmin) {
            actionsHTML = `
                <td class="edit-cell" style="display: none;">
                    <button class="edit-row-btn" onclick="openEditModal(${JSON.stringify(professor).replace(/"/g, '&quot;')})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="delete-btn" onclick="deleteProfessor(${professor.id})">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </td>
            `;
        }
        
        row.innerHTML = `
            <td><strong>${professor.nome}</strong></td>
            <td>${emailHTML}</td>
            <td>${siteHTML}</td>
            <td>${lattesHTML}</td>
            ${actionsHTML}
        `;
        
        tableBody.appendChild(row);
    });
}

// ===== SISTEMA DE BUSCA =====
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const noResults = document.getElementById('noResults');
    
    searchInput.addEventListener('input', function() {
        const searchText = this.value.toLowerCase();
        const rows = document.querySelectorAll('#teacherTableBody tr');
        let found = false;
        
        rows.forEach(row => {
            const name = row.cells[0].textContent.toLowerCase();
            if (name.includes(searchText)) {
                row.style.display = '';
                found = true;
            } else {
                row.style.display = 'none';
            }
        });
        
        noResults.style.display = found ? 'none' : 'flex';
    });
}

// ===== FUNÇÃO DE NOTIFICAÇÃO =====
function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="notification-icon ${getNotificationIcon(type)}"></i>
            <span class="notification-text">${message}</span>
        </div>
    `;
    
    // Estilos da notificação
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
    
    // Remover após 3 segundos
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
    
    // Inicializar o header
    initializeZoomControls();
    initializeSocialLinks();
    
    // Configurar o formulário
    document.getElementById('teacherForm').addEventListener('submit', saveProfessor);
    
    // Inicializar a página
    renderTeachersTable();
    initializeSearch();
    
    console.log('✅ Todos os sistemas inicializados!');
});

// Fechar modal ao clicar fora dele
window.onclick = function(event) {
    const modal = document.getElementById('teacherModal');
    if (event.target === modal) {
        closeModal();
    }
};