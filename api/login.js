// Login individual do Controle de Curvas.
// Confere login e senha no site de Emissão de Certificados (mesmos colaboradores, madeireiras.operadores)
// e abre uma sessão do Supabase do Controle de Curvas para aquele colaborador.
// Variável de ambiente na Vercel: SUPABASE_SERVICE_ROLE_KEY (chave de serviço do projeto do Controle GLP/Curvas).

const SUPABASE_URL = "https://vjbyyjfmilmeyzeiinxf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_HgnI-KSEvq1PJet6fmrV_g_MRf6HK4M";
const CERTIFICADOS_AUTH = "https://madeireiras-cert.vercel.app/api/auth";
// Cada colaborador vira um usuário do Supabase com este e-mail interno (nenhum e-mail é enviado).
const DOMINIO = "colaborador.controle-curvas.vercel.app";

const emailDe = login => `${login.toLowerCase().replace(/[^a-z0-9._-]/g, "-")}@${DOMINIO}`;

async function admin(caminho, metodo, corpo) {
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/${caminho}`, {
    method: metodo,
    headers: { apikey: chave, Authorization: `Bearer ${chave}`, "Content-Type": "application/json" },
    body: corpo && JSON.stringify(corpo),
  });
  return { ok: r.ok, status: r.status, dados: await r.json().catch(() => null) };
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return res.status(500).json({ error: "Falta configurar SUPABASE_SERVICE_ROLE_KEY na Vercel." });
  const { login, senha } = req.body || {};
  if (!login || !senha) return res.status(401).json({ error: "Informe login e senha." });

  // 1. Confere no site de Emissão de Certificados (lá ficam as senhas e o "ativo" de cada colaborador).
  let cert;
  try {
    cert = await fetch(CERTIFICADOS_AUTH, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ login, senha }) });
  } catch {
    return res.status(503).json({ error: "Não foi possível falar com o site de certificados." });
  }
  if (cert.status === 401) return res.status(401).json({ error: "Login ou senha incorretos." });
  if (!cert.ok) return res.status(503).json({ error: "Não foi possível verificar o login agora." });
  const { sessao } = await cert.json();
  const email = emailDe(sessao.login);
  const perfil = { nome: sessao.nome, login: sessao.login };

  // 2. Garante o usuário do colaborador no Supabase do Controle de Curvas (já existir não é erro).
  const novo = await admin("users", "POST", { email, email_confirm: true, user_metadata: perfil });
  if (!novo.ok && novo.status !== 422) return res.status(500).json({ error: "Falha ao preparar o acesso do colaborador." });

  // 3. Gera um link de acesso de uso único e troca pela sessão (sem enviar e-mail).
  const link = await admin("generate_link", "POST", { type: "magiclink", email });
  const tokenHash = link.dados && (link.dados.hashed_token || (link.dados.properties || {}).hashed_token);
  if (!tokenHash) return res.status(500).json({ error: "Falha ao abrir a sessão." });
  const v = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ type: "magiclink", token_hash: tokenHash }),
  });
  const s = await v.json().catch(() => null);
  if (!v.ok || !s || !s.access_token) return res.status(500).json({ error: "Falha ao abrir a sessão." });

  // Nome e login atualizados (o nome pode ter mudado no cadastro de colaboradores).
  await admin(`users/${s.user.id}`, "PUT", { user_metadata: perfil });

  res.status(200).json({ access_token: s.access_token, refresh_token: s.refresh_token, nome: sessao.nome });
};
