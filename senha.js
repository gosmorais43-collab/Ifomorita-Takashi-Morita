
(function () {
  // Utilitário de mensagens (pequeno "toast" inline)
  function showMessage(text, type = 'info') {
    // type: 'info' | 'success' | 'error' | 'warning'
    let existing = document.getElementById('inlineMessage');
    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'inlineMessage';
      existing.style.position = 'fixed';
      existing.style.right = '20px';
      existing.style.bottom = '20px';
      existing.style.zIndex = 10000;
      existing.style.padding = '12px 16px';
      existing.style.borderRadius = '8px';
      existing.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
      existing.style.color = '#fff';
      existing.style.fontFamily = 'Open Sans, sans-serif';
      existing.style.fontSize = '14px';
      document.body.appendChild(existing);
    }

    existing.textContent = text;
    existing.style.backgroundColor = type === 'success' ? '#4CAF50' :
                                     type === 'error' ? '#E53935' :
                                     type === 'warning' ? '#FB8C00' : '#2196F3';
    existing.style.display = 'block';

    clearTimeout(existing._timeout);
    existing._timeout = setTimeout(() => {
      existing.style.display = 'none';
    }, 4000);
  }

  // Máscara simples de CPF (coloca pontos e traço enquanto digita)
  function cpfMask(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    let res = digits;
    if (digits.length > 9) {
      res = digits.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (digits.length > 6) {
      res = digits.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (digits.length > 3) {
      res = digits.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    return res;
  }

  // Remove formatação do CPF antes de enviar
  function cleanCpf(formatted) {
    return (formatted || '').replace(/\D/g, '');
  }

  // Referências DOM
  const form = document.getElementById('passwordResetForm');
  const rmInput = document.getElementById('rm');
  const cpfInput = document.getElementById('cpf');
  const newPasswordInput = document.getElementById('newPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const successBox = document.getElementById('successMessage');

  if (!form) {
    console.error('senha.js: form #passwordResetForm não encontrado no DOM.');
    return;
  }

  // Aplica máscara ao campo CPF
  if (cpfInput) {
    cpfInput.addEventListener('input', (e) => {
      const cursorPos = e.target.selectionStart;
      const oldLen = e.target.value.length;
      e.target.value = cpfMask(e.target.value);
      // opcional: tentar restaurar cursor (simples)
      const newLen = e.target.value.length;
      const diff = newLen - oldLen;
      e.target.selectionStart = e.target.selectionEnd = Math.max(0, cursorPos + diff);
    });
  }

  // Submissão do formulário
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const rm = (rmInput?.value || '').trim();
    const cpfRaw = (cpfInput?.value || '').trim();
    const cpf = cleanCpf(cpfRaw);
    const novaSenha = (newPasswordInput?.value || '');
    const confirma = (confirmPasswordInput?.value || '');

    // Validações cliente
    if (!rm) {
      showMessage('Preencha seu RM.', 'warning');
      rmInput?.focus();
      return;
    }
    if (!cpf || cpf.length !== 11) {
      showMessage('Informe um CPF válido (11 dígitos).', 'warning');
      cpfInput?.focus();
      return;
    }
    if (!novaSenha || !confirma) {
      showMessage('Preencha a nova senha e a confirmação.', 'warning');
      newPasswordInput?.focus();
      return;
    }
    if (novaSenha !== confirma) {
      showMessage('As senhas não coincidem.', 'error');
      confirmPasswordInput?.focus();
      return;
    }
    if (novaSenha.length < 6) {
      showMessage('A nova senha deve ter pelo menos 6 caracteres.', 'warning');
      newPasswordInput?.focus();
      return;
    }

    // Desativar botão de submit enquanto processa
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn?.innerHTML;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    }

    try {
      // Faz POST para a rota do backend que você precisa ter implementada:
      // POST /reset-password-by-rm-cpf  { rm, cpf, nova_senha }
      const response = await fetch('https://ifomorita.onrender.com/reset-password-by-rm-cpf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rm, cpf, nova_senha: novaSenha })
});


      // Ler texto (evita erro se servidor retornar HTML)
      const text = await response.text();

      // Tentar parsear JSON
      let result;
      try {
        result = text ? JSON.parse(text) : {};
      } catch (parseErr) {
        console.error('Resposta do servidor não é JSON:', text);
        throw new Error('Resposta inesperada do servidor. Veja console.');
      }

      if (!response.ok) {
        const errMsg = result.erro || result.mensagem || 'Erro ao redefinir senha';
        throw new Error(errMsg);
      }

      // Sucesso
      showMessage(result.mensagem || 'Senha redefinida com sucesso!', 'success');

      // Exibe caixa de sucesso (se existir no HTML)
      if (successBox) {
        form.style.display = 'none';
        successBox.style.display = 'block';
        window.scrollTo({ top: successBox.offsetTop - 20, behavior: 'smooth' });
      } else {
        // fallback: recarregar ou limpar form
        form.reset();
      }
    } catch (err) {
      console.error('Erro ao redefinir senha:', err);
      showMessage(err.message || 'Erro ao redefinir senha', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    }
  });

  // Optional: limpar mensagem quando usuário começar a digitar
  [rmInput, cpfInput, newPasswordInput, confirmPasswordInput].forEach(inp => {
    if (!inp) return;
    inp.addEventListener('input', () => {
      const inline = document.getElementById('inlineMessage');
      if (inline) inline.style.display = 'none';
    });
  });



})();
