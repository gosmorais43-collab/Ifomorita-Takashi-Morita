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

