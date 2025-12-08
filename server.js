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

// === RECADOS ===
app.post('/recados', async (req, res) => {
  const { titulo, mensagem, tipo } = req.body;
  const { error } = await supabase.from('recados').insert([{ titulo, mensagem, tipo }]);
  if (error) return res.status(500).json({ sucesso: false, erro: error.message });
  res.json({ sucesso: true });
});

app.get('/recados', async (req, res) => {
  const { data, error } = await supabase.from('recados').select('*').order('dataFormatada', { ascending: false });
  if (error) return res.status(500).json({ sucesso: false, erro: error.message });
  res.json({ sucesso: true, recados: data });
});

// === CONTEÚDO ===
app.post('/conteudos', async (req, res) => {
  const { titulo, descricao } = req.body;
  const { error } = await supabase.from('conteudos').insert([{ titulo, descricao }]);
  if (error) return res.status(500).json({ sucesso: false, erro: error.message });
  res.json({ sucesso: true });
});

app.get('/conteudos', async (req, res) => {
  const { data, error } = await supabase.from('conteudos').select('*').order('data', { ascending: false });
  if (error) return res.status(500).json({ sucesso: false, erro: error.message });
  res.json({ sucesso: true, conteudos: data });
});

// === ROTAS PARA O CHAT ===

// Rota para enviar mensagem
app.post('/chat/send', async (req, res) => {
  try {
    const messageData = req.body;
    
    // Validar dados obrigatórios
    if (!messageData.sender_id || !messageData.receiver_id || !messageData.message_text) {
      return res.status(400).json({ sucesso: false, erro: 'Dados obrigatórios faltando' });
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar mensagem:', error);
      return res.status(500).json({ sucesso: false, erro: 'Erro ao salvar mensagem' });
    }

    res.json({ sucesso: true, mensagem: data });
  } catch (err) {
    console.error('Erro no servidor:', err);
    res.status(500).json({ sucesso: false, erro: 'Erro interno do servidor' });
  }
});

// Rota para buscar mensagens entre usuários
app.get('/chat/messages/:sender_id/:receiver_id', async (req, res) => {
  try {
    const { sender_id, receiver_id } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${sender_id},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${sender_id})`)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Erro ao buscar mensagens:', error);
      return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar mensagens' });
    }

    res.json({ sucesso: true, mensagens: data });
  } catch (err) {
    console.error('Erro no servidor:', err);
    res.status(500).json({ sucesso: false, erro: 'Erro interno do servidor' });
  }
});

// Rota para buscar todas as conversas de um usuário
app.get('/chat/conversations/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user_id},receiver_id.eq.${user_id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar conversas:', error);
      return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar conversas' });
    }

    // Agrupar por conversa
    const conversations = {};
    data.forEach(message => {
      const otherUserId = message.sender_id === user_id ? message.receiver_id : message.sender_id;
      if (!conversations[otherUserId] || new Date(message.created_at) > new Date(conversations[otherUserId].lastMessage)) {
        conversations[otherUserId] = {
          user_id: otherUserId,
          lastMessage: message.created_at,
          lastMessageText: message.message_text,
          unreadCount: 0 // Você pode adicionar lógica para contar não lidas
        };
      }
    });

    res.json({ sucesso: true, conversas: Object.values(conversations) });
  } catch (err) {
    console.error('Erro no servidor:', err);
    res.status(500).json({ sucesso: false, erro: 'Erro interno do servidor' });
  }
});

// Rota para marcar mensagens como lidas
app.put('/chat/mark-read/:message_id', async (req, res) => {
  try {
    const { message_id } = req.params;

    const { data, error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', message_id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao marcar como lida:', error);
      return res.status(500).json({ sucesso: false, erro: 'Erro ao marcar mensagem' });
    }

    res.json({ sucesso: true, mensagem: data });
  } catch (err) {
    console.error('Erro no servidor:', err);
    res.status(500).json({ sucesso: false, erro: 'Erro interno do servidor' });
  }
});

// Rota para buscar alunos (para admin)
app.get('/chat/students', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('alunos')
      .select('id, rm, nome_completo, turma_id')
      .order('nome_completo');

    if (error) {
      console.error('Erro ao buscar alunos:', error);
      return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar alunos' });
    }

    res.json({ sucesso: true, alunos: data });
  } catch (err) {
    console.error('Erro no servidor:', err);
    res.status(500).json({ sucesso: false, erro: 'Erro interno do servidor' });
  }
});
