const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// === Configuração de Content Security Policy (CSP) ===
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; connect-src 'self' https://lfomorita.onrender.com; style-src 'self' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; script-src 'self' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://translate.googleapis.com"
  );
  next();
});



// Servir todos os arquivos estáticos da raiz
app.use(express.static(__dirname));

// Rota principal para abrir o index.html
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));


