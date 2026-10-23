(() => {
  const form = document.querySelector("#feedback-form");
  const nameInput = document.querySelector("#name");
  const messageInput = document.querySelector("#message");
  const button = document.querySelector("#submit-button");
  const status = document.querySelector("#form-status");
  const showStatus = (message, type) => { status.textContent = message; status.className = `status ${type || ""}`; };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const nome = nameInput.value.trim() || null;
    const mensagem = messageInput.value.trim();
    if (!mensagem) { showStatus("Escreva sua manifestação antes de enviar.", "error"); return; }
    if ((nome && nome.length > 120) || mensagem.length > 5000) { showStatus("Confira os limites dos campos e tente novamente.", "error"); return; }
    const cfg = window.PC_CONFIG || {};
    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY || cfg.SUPABASE_URL.startsWith("COLE_AQUI") || cfg.SUPABASE_ANON_KEY.startsWith("COLE_AQUI")) {
      showStatus("O formulário ainda não está conectado ao banco de dados. Configure config.js antes de publicar.", "error"); return;
    }
    if (!window.supabase?.createClient) { showStatus("Não foi possível carregar o serviço. Atualize a página e tente novamente.", "error"); return; }
    button.disabled = true; button.textContent = "Enviando..."; showStatus("", "");
    try {
      const client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
      const { error } = await client.from("manifestacoes").insert([{ nome, mensagem }]);
      if (error) throw error;
      form.reset();
      showStatus("Sua manifestação foi enviada. Obrigado por compartilhar sua opinião com o P&C.", "success");
    } catch (err) {
      console.error("Falha ao enviar manifestação:", err);
      showStatus("Não foi possível enviar agora. Tente novamente mais tarde ou procure o P&C por outro canal.", "error");
    } finally { button.disabled = false; button.innerHTML = 'Enviar manifestação <span>→</span>'; }
  });
})();