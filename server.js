const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();


// ✅ CORS primeiro
app.use(cors({
  origin: 'https://ifomorita.onrender.com'
}));

// ✅ JSON parser
app.use(express.json());

// ✅ CSP depois
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
"default-src 'self'; connect-src 'self' https://ifomorita.onrender.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://translate.googleapis.com"

  );
  next();
});


// ✅ Arquivos estáticos e rotas
app.use(express.static(__dirname));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// === Configurar o Supabase ===
const SUPABASE_URL = 'https://caadqubmelbbdnzdmqpf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhYWRxdWJtZWxiYmRuemRtcXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTA3NzQsImV4cCI6MjA3NjEyNjc3NH0.cRAyA5tWHbMTnhHRMBk9O0vK-rYeBGi5tLL09gHomxU'; // sua chave
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// === CHAVES DE CRIPTOGRAFIA ===
const RAW_ENCRYPT_KEY = process.env.ENCRYPT_KEY || 'quyweqwhe8912773y7haDajgdagduadE';
const RAW_ENCRYPT_IV  = process.env.ENCRYPT_IV  || 'Projetotccautoma';

const ENCRYPT_KEY = crypto.createHash('sha256').update(RAW_ENCRYPT_KEY, 'utf8').digest();
const ENCRYPT_IV  = crypto.createHash('md5').update(RAW_ENCRYPT_IV, 'utf8').digest();

function encrypt(text) {
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPT_KEY, ENCRYPT_IV);
  let encrypted = cipher.update(String(text), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(encryptedHex) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPT_KEY, ENCRYPT_IV);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// === ROTA DE CADASTRO ===
app.post('/registrar', async (req, res) => {
  try {
    const alunoData = req.body;
    const senhaHasheada = await bcrypt.hash(alunoData.senha, 10);
    const cpfCriptografado = alunoData.cpf ? encrypt(alunoData.cpf) : null;

    const dadosParaDb = {
      ...alunoData,
      senha: senhaHasheada,
      cpf: cpfCriptografado,
    };

    delete dadosParaDb.id;

    const { error } = await supabase.from('alunos').insert([dadosParaDb]);

    if (error) throw new Error('Não foi possível salvar no banco.');

    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ sucesso: false, erro: err.message });
  }
});

// === ROTA DE LOGIN ===
app.post('/login', async (req, res) => {
  try {
    const { rm, senha } = req.body;

    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .eq('rm', rm)
      .single();

    if (error || !data) return res.status(401).json({ sucesso: false, erro: 'RM não encontrado' });

    const senhaCorreta = await bcrypt.compare(senha, data.senha);
    if (!senhaCorreta) return res.status(401).json({ sucesso: false, erro: 'Senha incorreta' });

    let cpfDescriptografado = null;
    if (data.cpf) {
      try { cpfDescriptografado = decrypt(data.cpf); } catch {}
    }

    const resposta = {
      id: data.id,
      nome_completo: data.nome_completo,
      rm: data.rm,
      email: data.email,
      telefone: data.telefone || null,
      cpf: cpfDescriptografado,
    };

    res.json({ sucesso: true, aluno: resposta });
  } catch (err) {
    res.status(500).json({ sucesso: false, erro: err.message });
  }
});

// === ROTA DE RESET DE SENHA ===
app.post('/reset-password-by-rm-cpf', async (req, res) => {
  try {
    const { rm, cpf, nova_senha } = req.body;
    if (!rm || !cpf || !nova_senha) {
      return res.status(400).json({ sucesso: false, erro: 'RM, CPF e nova senha são obrigatórios' });
    }

    const { data: aluno } = await supabase.from('alunos').select('*').eq('rm', rm).single();
    if (!aluno) return res.status(404).json({ sucesso: false, erro: 'RM não encontrado' });

    const cpfFornecido = String(cpf).replace(/\D/g, '');
    let cpfArmazenado = '';
    try { cpfArmazenado = decrypt(aluno.cpf).replace(/\D/g, ''); } catch { cpfArmazenado = String(aluno.cpf).replace(/\D/g, ''); }

    if (cpfFornecido !== cpfArmazenado) {
      return res.status(401).json({ sucesso: false, erro: 'CPF não confere com o cadastro' });
    }

    const novaHash = await bcrypt.hash(nova_senha, 10);
    const { error } = await supabase.from('alunos').update({ senha: novaHash }).eq('rm', rm);

    if (error) return res.status(500).json({ sucesso: false, erro: 'Erro no banco de dados' });

    res.json({ sucesso: true, mensagem: 'Senha alterada com sucesso' });
  } catch {
    res.status(500).json({ sucesso: false, erro: 'Erro interno do servidor' });
  }
});
// === ROTA PARA BUSCAR DADOS DO ALUNO POR ID ===
app.get('/aluno/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ sucesso: false, erro: 'Aluno não encontrado' });
    }

    res.json({ sucesso: true, aluno: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ sucesso: false, erro: 'Erro interno ao buscar aluno' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

// ===== ROTAS DE CHAT (USANDO TABELA messages) =====

// ROTA 1: Enviar mensagem
app.post('/chat/send', async (req, res) => {
  try {
    const message = req.body;
    
    console.log('📤 Recebendo mensagem para salvar:', message);
    
    // Validar mensagem
    if (!message.sender_id || !message.receiver_id || !message.message_text) {
      return res.status(400).json({ 
        sucesso: false, 
        erro: 'Dados incompletos: sender_id, receiver_id e message_text são obrigatórios' 
      });
    }
    
    // Garantir que o ID existe
    if (!message.id) {
      message.id = crypto.randomUUID();
    }
    
    // Garantir que created_at existe
    if (!message.created_at) {
      message.created_at = new Date().toISOString();
    }
    
    // Converter booleanos para string se necessário (para compatibilidade com o banco)
    if (typeof message.is_read === 'boolean') {
      message.is_read = message.is_read.toString();
    } else if (!message.is_read) {
      message.is_read = 'false';
    }
    
    // Determinar sender_role se não fornecido
    let sender_role = message.sender_role;
    if (!sender_role) {
      if (message.sender_id.startsWith('admin') || message.sender_rm === 'ADMIN') {
        sender_role = 'admin';
      } else {
        sender_role = 'student';
      }
    }
    
    // Determinar sender_name se não fornecido
    let sender_name = message.sender_name;
    if (!sender_name) {
      if (sender_role === 'admin') {
        sender_name = 'Administrador';
      } else {
        sender_name = message.sender_rm ? `Aluno ${message.sender_rm}` : 'Aluno';
      }
    }
    
    console.log('💾 Salvando mensagem no banco:', {
      id: message.id,
      sender_id: message.sender_id,
      receiver_id: message.receiver_id,
      sender_rm: message.sender_rm,
      message_text: message.message_text.substring(0, 50) + '...'
    });
    
    // Salvar na tabela messages
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        id: message.id,
        sender_id: message.sender_id,
        receiver_id: message.receiver_id,
        sender_rm: message.sender_rm,
        sender_role: sender_role,
        sender_name: sender_name,
        receiver_rm: message.receiver_rm,
        message_text: message.message_text,
        department: message.department || 'all',
        is_read: message.is_read,
        created_at: message.created_at
      }])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao salvar mensagem no banco:', error);
      return res.status(500).json({ 
        sucesso: false, 
        erro: 'Erro ao salvar mensagem no banco: ' + error.message 
      });
    }
    
    console.log('✅ Mensagem salva no banco com ID:', data.id);
    
    res.json({ 
      sucesso: true, 
      mensagem: 'Mensagem enviada com sucesso',
      data: data 
    });
    
  } catch (err) {
    console.error('❌ Erro no endpoint /chat/send:', err);
    res.status(500).json({ 
      sucesso: false, 
      erro: 'Erro interno do servidor: ' + err.message 
    });
  }
});

// ROTA 2: Obter mensagens entre dois usuários
app.post('/chat/messages-between', async (req, res) => {
  try {
    const { user1, user2 } = req.body;
    
    console.log('📥 Buscando mensagens entre:', user1, 'e', user2);
    
    if (!user1 || !user2) {
      return res.status(400).json({ 
        sucesso: false, 
        erro: 'Usuários não especificados' 
      });
    }
    
    // Buscar mensagens onde:
    // (user1 envia para user2) OU (user2 envia para user1)
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user1},receiver_id.eq.${user2}),and(sender_id.eq.${user2},receiver_id.eq.${user1})`)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('❌ Erro ao buscar mensagens:', error);
      return res.status(500).json({ 
        sucesso: false, 
        erro: 'Erro ao buscar mensagens: ' + error.message 
      });
    }
    
    console.log(`✅ ${data ? data.length : 0} mensagens encontradas`);
    
    res.json({ 
      sucesso: true, 
      mensagens: data || [],
      total: data ? data.length : 0
    });
    
  } catch (err) {
    console.error('❌ Erro no endpoint /chat/messages-between:', err);
    res.status(500).json({ 
      sucesso: false, 
      erro: 'Erro interno do servidor: ' + err.message 
    });
  }
});

// ROTA 3: Obter todas as mensagens de um usuário
app.post('/chat/messages-for-user', async (req, res) => {
  try {
    const { userId } = req.body;
    
    console.log('📥 Buscando mensagens para usuário:', userId);
    
    if (!userId) {
      return res.status(400).json({ 
        sucesso: false, 
        erro: 'Usuário não especificado' 
      });
    }
    
    // Buscar mensagens onde o usuário é sender OU receiver
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('❌ Erro ao buscar mensagens:', error);
      return res.status(500).json({ 
        sucesso: false, 
        erro: 'Erro ao buscar mensagens: ' + error.message 
      });
    }
    
    console.log(`✅ ${data ? data.length : 0} mensagens encontradas para ${userId}`);
    
    res.json({ 
      sucesso: true, 
      mensagens: data || [],
      total: data ? data.length : 0
    });
    
  } catch (err) {
    console.error('❌ Erro no endpoint /chat/messages-for-user:', err);
    res.status(500).json({ 
      sucesso: false, 
      erro: 'Erro interno do servidor: ' + err.message 
    });
  }
});

// ROTA 4: Obter alunos que enviaram mensagens (para admin)
app.get('/chat/students-with-messages', async (req, res) => {
  try {
    console.log('📥 Buscando alunos que enviaram mensagens...');
    
    // Primeiro buscar da tabela alunos para ter todos os dados
    const { data: todosAlunos, error: alunosError } = await supabase
      .from('alunos')
      .select('rm, nome_completo, turma_id')
      .order('nome_completo');
    
    if (alunosError) {
      console.error('❌ Erro ao buscar alunos da tabela:', alunosError);
      // Continuar mesmo com erro
    }
    
    // Buscar mensagens de alunos
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('sender_rm, sender_name, sender_id, created_at')
      .neq('sender_rm', 'ADMIN')
      .not('sender_rm', 'is', null)
      .order('created_at', { ascending: false });
    
    if (messagesError) {
      console.error('❌ Erro ao buscar mensagens:', messagesError);
      // Se não conseguir mensagens, retornar só os alunos
      if (todosAlunos) {
        const alunosFormatados = todosAlunos.map(aluno => ({
          rm: aluno.rm,
          nome_completo: aluno.nome_completo,
          turma_id: aluno.turma_id || 'Não informada',
          lastMessage: null,
          messageCount: 0
        }));
        
        return res.json({ 
          sucesso: true, 
          alunos: alunosFormatados,
          total: alunosFormatados.length
        });
      }
      return res.status(500).json({ 
        sucesso: false, 
        erro: 'Erro ao buscar dados: ' + messagesError.message 
      });
    }
    
    console.log(`📊 ${messages ? messages.length : 0} mensagens encontradas`);
    
    // Agrupar por RM
    const studentsMap = new Map();
    
    // Primeiro adicionar todos os alunos da tabela
    if (todosAlunos) {
      todosAlunos.forEach(aluno => {
        const rm = aluno.rm.toString();
        studentsMap.set(rm, {
          rm: rm,
          nome_completo: aluno.nome_completo,
          turma_id: aluno.turma_id || 'Não informada',
          lastMessage: null,
          messageCount: 0
        });
      });
    }
    
    // Atualizar com dados das mensagens
    if (messages && messages.length > 0) {
      messages.forEach(message => {
        if (message.sender_rm && message.sender_rm !== 'ADMIN') {
          const rm = message.sender_rm.toString();
          
          if (studentsMap.has(rm)) {
            const student = studentsMap.get(rm);
            student.messageCount += 1;
            // Atualizar última mensagem se for mais recente
            const msgDate = new Date(message.created_at);
            const currentDate = student.lastMessage ? new Date(student.lastMessage) : new Date(0);
            
            if (msgDate > currentDate) {
              student.lastMessage = message.created_at;
            }
          } else {
            // Se aluno não está na tabela alunos, criar entrada
            studentsMap.set(rm, {
              rm: rm,
              nome_completo: message.sender_name || `Aluno ${rm}`,
              turma_id: 'Não informada',
              lastMessage: message.created_at,
              messageCount: 1
            });
          }
        }
      });
    }
    
    let students = Array.from(studentsMap.values());
    
    // Ordenar por última mensagem (mais recente primeiro), depois por nome
    students.sort((a, b) => {
      const dateA = a.lastMessage ? new Date(a.lastMessage) : new Date(0);
      const dateB = b.lastMessage ? new Date(b.lastMessage) : new Date(0);
      
      if (dateB - dateA !== 0) {
        return dateB - dateA; // Ordena por data (mais recente primeiro)
      }
      
      // Se datas iguais ou ambas null, ordena por nome
      return a.nome_completo.localeCompare(b.nome_completo);
    });
    
    console.log(`✅ ${students.length} alunos carregados`);
    
    res.json({ 
      sucesso: true, 
      alunos: students,
      total: students.length
    });
    
  } catch (err) {
    console.error('❌ Erro no endpoint /chat/students-with-messages:', err);
    res.status(500).json({ 
      sucesso: false, 
      erro: 'Erro interno do servidor: ' + err.message 
    });
  }
});

// ROTA 5: Marcar mensagens como lidas
app.post('/chat/mark-as-read', async (req, res) => {
  try {
    const { messageIds } = req.body;
    
    console.log('📝 Marcando mensagens como lidas:', messageIds);
    
    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ 
        sucesso: false, 
        erro: 'IDs de mensagens inválidos' 
      });
    }
    
    // Atualizar status de leitura
    const { error } = await supabase
      .from('messages')
      .update({ is_read: 'true' })
      .in('id', messageIds);
    
    if (error) {
      console.error('❌ Erro ao marcar mensagens como lidas:', error);
      return res.status(500).json({ 
        sucesso: false, 
        erro: 'Erro ao atualizar status: ' + error.message 
      });
    }
    
    console.log(`✅ ${messageIds.length} mensagens marcadas como lidas`);
    
    res.json({ 
      sucesso: true, 
      mensagem: 'Mensagens marcadas como lidas',
      count: messageIds.length
    });
    
  } catch (err) {
    console.error('❌ Erro no endpoint /chat/mark-as-read:', err);
    res.status(500).json({ 
      sucesso: false, 
      erro: 'Erro interno do servidor: ' + err.message 
    });
  }
});

// ROTA 6: Verificar novas mensagens não lidas
app.post('/chat/check-new-messages', async (req, res) => {
  try {
    const { userId, lastCheck } = req.body;
    
    console.log('🔍 Verificando novas mensagens para:', userId, 'desde:', lastCheck);
    
    if (!userId) {
      return res.status(400).json({ 
        sucesso: false, 
        erro: 'Usuário não especificado' 
      });
    }
    
    let query = supabase
      .from('messages')
      .select('*')
      .eq('receiver_id', userId)
      .eq('is_read', 'false');
    
    // Se tiver timestamp da última verificação
    if (lastCheck) {
      try {
        const lastCheckDate = new Date(lastCheck);
        query = query.gt('created_at', lastCheckDate.toISOString());
      } catch (dateError) {
        console.warn('⚠️ Formato de data inválido para lastCheck:', lastCheck);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Erro ao verificar novas mensagens:', error);
      return res.status(500).json({ 
        sucesso: false, 
        erro: 'Erro ao verificar mensagens: ' + error.message 
      });
    }
    
    console.log(`📩 ${data ? data.length : 0} novas mensagens encontradas`);
    
    res.json({ 
      sucesso: true, 
      novasMensagens: data || [],
      totalNovas: data ? data.length : 0
    });
    
  } catch (err) {
    console.error('❌ Erro no endpoint /chat/check-new-messages:', err);
    res.status(500).json({ 
      sucesso: false, 
      erro: 'Erro interno do servidor: ' + err.message 
    });
  }
});

// ROTA 7: Obter contador de mensagens não lidas
app.post('/chat/unread-count', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        sucesso: false, 
        erro: 'Usuário não especificado' 
      });
    }
    
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('is_read', 'false');
    
    if (error) {
      console.error('❌ Erro ao contar mensagens não lidas:', error);
      return res.status(500).json({ 
        sucesso: false, 
        erro: 'Erro ao contar mensagens' 
      });
    }
    
    res.json({ 
      sucesso: true, 
      count: count || 0
    });
    
  } catch (err) {
    console.error('❌ Erro no endpoint /chat/unread-count:', err);
    res.status(500).json({ 
      sucesso: false, 
      erro: 'Erro interno do servidor' 
    });
  }
});

















