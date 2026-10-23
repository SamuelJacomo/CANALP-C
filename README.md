# Canal de Escuta P&C

Aplicação estática em português para GitHub Pages, com formulário público e painel de consulta com autenticação Supabase.

## O que está incluído
- Formulário responsivo com uma pergunta aberta e employee_name opcional.
- Timestamp criado pelo banco Supabase.
- Painel `admin.html` com login por e-mail/senha, pesquisa e ordenação por data.
- Visualização apenas: não existem funções de resposta, edição ou exclusão no painel.
- Política RLS: o público pode inserir; apenas usuários autenticados podem ler.

## 1. Configurar o banco Supabase
1. Crie um projeto no Supabase.
2. No **SQL Editor**, execute o conteúdo de `supabase.sql`.
3. Em **Project Settings → API** (ou botão **Connect**), copie a Project URL e a chave pública `anon`/`publishable`.
4. Coloque esses valores em `config.js`.
5. Em **Authentication → Sign In / Providers** (ou configurações de signup), desative o cadastro público.
6. Crie manualmente contas com e-mail e senha para os integrantes autorizados do P&C em **Authentication → Users**.
7. Teste: envie uma manifestação anônima e outra identificada; confirme que aparecem em `escuta_submissions`. Em uma janela anônima, confirme que a tabela não pode ser consultada diretamente.

**Atenção:** a política SQL permite leitura a qualquer conta autenticada nesse projeto. Por isso, desativar signup público e controlar rigorosamente as contas é obrigatório. Para organizações que precisem de autorização mais granular, use uma tabela de membros/roles e uma política RLS específica.

## 2. Publicar no GitHub Pages
1. Crie um repositório, por exemplo `canal-escuta-pc`.
2. Envie todos os arquivos desta pasta para a raiz do repositório.
3. Vá em **Settings → Pages** e selecione a branch principal e a pasta `/ (root)`.
4. Espere a publicação. O formulário ficará em `.../` e o painel em `.../admin.html`.
5. Gere um QR Code com a URL pública do formulário (não use a URL `admin.html`).

## 3. Segurança e privacidade
- A chave pública `anon`/`publishable` pode estar no frontend; a chave `service_role` nunca deve estar no GitHub.
- O employee_name é opcional, mas isso não garante anonimato absoluto: o texto pode identificar a pessoa e logs técnicos da plataforma podem existir.
- Defina aviso de privacidade, finalidade, prazo de retenção, responsáveis pelo acesso e procedimento interno conforme a LGPD.
- Antes de uso corporativo, considere limitar spam/abuso com CAPTCHA ou Edge Function, backups e revisão de segurança.
- O painel usa o fuso `America/Sao_Paulo`; o banco mantém o timestamp em `timestamptz`.
- Este pacote não envia e-mails e não responde aos colaboradores.

## Arquivos
- `index.html`: formulário público.
- `admin.html`: painel privado.
- `app.js`, `admin.js`: lógica do frontend.
- `styles.css`: estilo responsivo.
- `config.js`: configuração pública do Supabase.
- `supabase.sql`: tabela, grants e RLS.


## Projeto já conectado
Este pacote já aponta para o projeto Supabase `voz-ativa-pc` usando a chave pública publishable. Nunca adicione uma chave `service_role` ao frontend.
