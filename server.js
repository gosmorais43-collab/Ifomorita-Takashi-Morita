const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// === Configuração de Content Security Policy (CSP) ===
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; style-src 'self' https://www.gstatic.com; script-src 'self' https://translate.googleapis.com"
  );
  next();
});

// === Configurar o Supabase ===
const SUPABASE_URL = 'https://caadqubmelbbdnzdmqpf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhYWRxdWJtZWxiYmRuemRtcXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NTA3NzQsImV4cCI6MjA3NjEyNjc3NH0.cRAyA5tWHbMTnhHRMBk9O0vK-rYeBGi5tLL09gHomxU';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// === CHAVES DE CRIPTOGRAFIA ===
const RAW_ENCRYPT_KEY = process.env.ENCRYPT_KEY || 'quyweqwhe8912773y7haDajgdagduadE';
const RAW_ENCRYPT_IV  = process.env.ENCRYPT_IV  || 'Projetotccautoma';

const ENCRYPT_KEY = crypto.createHash('sha256').update(RAW_ENCRYPT_KEY, 'utf8').digest();
const ENCRYPT_IV  = crypto.createHash('md5').update(RAW_ENCRYPT_IV, 'utf8').digest();

function encrypt(text) {
  try {
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPT_KEY, ENCRYPT_IV);
    let encrypted = cipher.update(String(text), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  } catch (err) {
    console.error('Erro encrypt:', err);
    throw err;
  }
}

function decrypt(encryptedHex) {
  try {
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPT_KEY, ENCRYPT_IV);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Erro decrypt:', err);
    throw err;
  }
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

    const { data, error } = await supabase
      .from('alunos')
      .insert([dadosParaDb]);

    if (error) {
      console.error(error);
      throw new Error('Não foi possível salvar no banco.');
    }

    res.json({ sucesso: true });
  } catch (err) {
    console.error('Erro ao cadastrar aluno →', err);
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

    if (error || !data) {
      return res.status(401).json({ sucesso: false, erro: 'RM não encontrado' });
    }

    const senhaCorreta = await bcrypt.compare(senha, data.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ sucesso: false, erro: 'Senha incorreta' });
    }

    let cpfDescriptografado = null;
    if (data.cpf) {
      try {
        cpfDescriptografado = decrypt(data.cpf);
      } catch (deErr) {
        console.error('Falha ao descriptografar CPF:', deErr);
      }
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
    console.error('Erro no login:', err);
    res.status(500).json({ sucesso: false, erro: err.message });
  }
});

// === ROTA SIMPLIFICADA: REDEFINIR SENHA ===
app.post('/reset-password-by-rm-cpf', async (req, res) => {
  console.log('=== TENTATIVA DE RESET DE SENHA ===');
  
  try {
    const { rm, cpf, nova_senha } = req.body;
    
    // Validação básica
    if (!rm || !cpf || !nova_senha) {
      return res.status(400).json({ 
        sucesso: false, 
        erro: 'RM, CPF e nova senha são obrigatórios' 
      });
    }

    // Buscar aluno pelo RM
    console.log(`Buscando aluno com RM: ${rm}`);
    const { data: aluno, error: findError } = await supabase
      .from('alunos')
      .select('*')
      .eq('rm', rm)
      .single();

    if (findError || !aluno) {
      console.log('Aluno não encontrado');
      return res.status(404).json({ 
        sucesso: false, 
        erro: 'RM não encontrado' 
      });
    }

    console.log(`Aluno encontrado: ${aluno.nome_completo}`);

    // Validar CPF (simplificado)
    const cpfFornecido = String(cpf).replace(/\D/g, '');
    let cpfArmazenado = '';
    
    try {
      cpfArmazenado = decrypt(aluno.cpf).replace(/\D/g, '');
    } catch (e) {
      // Se não conseguir descriptografar, tenta usar direto
      cpfArmazenado = String(aluno.cpf).replace(/\D/g, '');
    }

    console.log(`CPF fornecido: ${cpfFornecido}`);
    console.log(`CPF armazenado: ${cpfArmazenado}`);

    if (cpfFornecido !== cpfArmazenado) {
      console.log('CPF não confere!');
      return res.status(401).json({ 
        sucesso: false, 
        erro: 'CPF não confere com o cadastro' 
      });
    }

    console.log('CPF validado com sucesso!');

    // Gerar nova hash da senha
    const novaHash = await bcrypt.hash(nova_senha, 10);
    
    // ATUALIZAR APENAS A SENHA - SIMPLES E DIRETO
    console.log('Atualizando senha no banco...');
    
    // Primeiro, vamos verificar qual campo usar para identificar o aluno
    console.log(`ID do aluno: ${aluno.id}`);
    console.log(`RM do aluno: ${aluno.rm}`);
    
    // Vamos tentar pelo RM primeiro (é único e sabemos que existe)
    const { data: updated, error: updateError } = await supabase
      .from('alunos')
      .update({ senha: novaHash })
      .eq('rm', rm)  // Usamos o RM que veio na requisição
      .select();

    console.log('Resultado da atualização:', { 
      updated: updated ? 'Sucesso' : 'Falha',
      error: updateError ? updateError.message : 'Nenhum'
    });

    if (updateError) {
      console.error('Erro na atualização:', updateError);
      
      // Se falhar pelo RM, tenta pelo ID
      console.log('Tentando pelo ID...');
      const { data: updatedById, error: errorById } = await supabase
        .from('alunos')
        .update({ senha: novaHash })
        .eq('id', aluno.id)
        .select();
        
      if (errorById) {
        console.error('Erro ao atualizar pelo ID:', errorById);
        return res.status(500).json({ 
          sucesso: false, 
          erro: `Erro no banco de dados: ${errorById.message}` 
        });
      }
      
      if (!updatedById || updatedById.length === 0) {
        console.log('Nenhum registro foi atualizado pelo ID');
        return res.status(500).json({ 
          sucesso: false, 
          erro: 'Não foi possível atualizar a senha' 
        });
      }
      
      console.log('Senha atualizada com sucesso pelo ID!');
      return res.json({ 
        sucesso: true, 
        mensagem: 'Senha alterada com sucesso' 
      });
    }

    if (!updated || updated.length === 0) {
      console.log('Nenhum registro foi atualizado pelo RM');
      return res.status(500).json({ 
        sucesso: false, 
        erro: 'Não foi possível atualizar a senha' 
      });
    }

    console.log('Senha atualizada com sucesso pelo RM!');
    return res.json({ 
      sucesso: true, 
      mensagem: 'Senha alterada com sucesso' 
    });

  } catch (error) {
    console.error('Erro geral:', error);
    return res.status(500).json({ 
      sucesso: false, 
      erro: 'Erro interno do servidor' 
    });
  }
});

// Rota de teste SIMPLES
app.get('/teste-update', async (req, res) => {
  try {
    // Primeiro, vamos ver se conseguimos fazer qualquer atualização
    const { data, error } = await supabase
      .from('alunos')
      .update({ telefone: '11999999999' })
      .eq('rm', '12345')  // Coloque um RM que existe
      .select();
      
    return res.json({ 
      sucesso: !error, 
      data, 
      error: error ? error.message : null 
    });
  } catch (err) {
    res.json({ sucesso: false, error: err.message });
  }
});
// === ROTA PRINCIPAL (GET /) ===
app.get("/", (req, res) => {
  res.send("API do TCC está online 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

