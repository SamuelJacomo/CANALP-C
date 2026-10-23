(() => {
  const $ = (selector) => document.querySelector(selector);
  const loginCard = $("#login-card"), dashboard = $("#dashboard");
  const loginForm = $("#login-form"), loginButton = $("#login-button");
  const loginStatus = $("#login-status"), dashboardStatus = $("#dashboard-status");
  const list = $("#feedback-list"), search = $("#search");
  let client = null, allItems = [];

  const status = (el, message, type = "") => { el.textContent = message; el.className = `status ${type}`; };
  const configReady = () => {
    const c = window.PC_CONFIG || {};
    return c.SUPABASE_URL && c.SUPABASE_ANON_KEY && !c.SUPABASE_URL.startsWith("COLE_AQUI") && !c.SUPABASE_ANON_KEY.startsWith("COLE_AQUI");
  };
  function formatDate(value) {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(value));
  }
  function render() {
    const term = search.value.trim().toLocaleLowerCase("pt-BR");
    const filtered = allItems.filter(item => `${item.nome || "anônimo"} ${item.mensagem}`.toLocaleLowerCase("pt-BR").includes(term));
    list.replaceChildren();
    const count = document.createElement("p"); count.className = "count";
    count.textContent = `${filtered.length} manifestação(ões)${term ? " encontrada(s)" : ""}`;
    list.append(count);
    if (!filtered.length) {
      const empty = document.createElement("div"); empty.className = "empty-state";
      empty.textContent = term ? "Nenhuma manifestação corresponde à busca." : "Ainda não há manifestações registradas.";
      list.append(empty); return;
    }
    filtered.forEach(item => {
      const card = document.createElement("article"); card.className = "feedback-item";
      const meta = document.createElement("div"); meta.className = "feedback-meta";
      const who = document.createElement("span"); who.className = "feedback-name"; who.textContent = item.nome?.trim() || "Manifestação anônima";
      const when = document.createElement("time"); when.dateTime = item.enviado_em; when.textContent = formatDate(item.enviado_em) + " (horário de Brasília)";
      const message = document.createElement("div"); message.className = "feedback-message"; message.textContent = item.mensagem;
      meta.append(who, when); card.append(meta, message); list.append(card);
    });
  }
  async function loadItems() {
    status(dashboardStatus, "Carregando manifestações...");
    const { data, error } = await client.from("manifestacoes").select("id,nome,mensagem,enviado_em").order("enviado_em", { ascending: false }).limit(1000);
    if (error) {
      console.error(error);
      status(dashboardStatus, "Não foi possível carregar. Confira se a conta está autorizada e se as políticas RLS foram configuradas corretamente.", "error");
      return;
    }
    allItems = data || []; status(dashboardStatus, "Dados atualizados.", "success"); render();
  }
  function showDashboard() { loginCard.classList.add("hidden"); dashboard.classList.remove("hidden"); loadItems(); }
  function showLogin() { dashboard.classList.add("hidden"); loginCard.classList.remove("hidden"); }
  if (!configReady()) status(loginStatus, "Configure a URL e a chave pública no arquivo config.js.", "error");
  else {
    client = window.supabase.createClient(window.PC_CONFIG.SUPABASE_URL, window.PC_CONFIG.SUPABASE_ANON_KEY);
    client.auth.getSession().then(({ data }) => { if (data.session) showDashboard(); });
    client.auth.onAuthStateChange((_event, session) => { if (session) showDashboard(); else showLogin(); });
  }
  loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (!client) { status(loginStatus, "Configure config.js antes de entrar.", "error"); return; }
    loginButton.disabled = true; loginButton.textContent = "Entrando...";
    const { error } = await client.auth.signInWithPassword({ email: $("#email").value.trim(), password: $("#password").value });
    if (error) status(loginStatus, "Não foi possível entrar. Confira o e-mail e a senha ou fale com o administrador.", "error");
    else { status(loginStatus, "", ""); loginForm.reset(); }
    loginButton.disabled = false; loginButton.innerHTML = 'Entrar no painel <span>→</span>';
  });
  $("#logout-button").addEventListener("click", async () => { await client?.auth.signOut(); allItems = []; list.replaceChildren(); showLogin(); });
  $("#refresh-button").addEventListener("click", loadItems);
  search.addEventListener("input", render);
})();