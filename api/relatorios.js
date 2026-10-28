// Números "SEI - Relatórios" da aba Peticionamento SEI, para o site de Emissão de Certificados mostrar
// na aba Comunicados. Quem chama manda a sessão de lá (Bearer); ela é conferida no próprio site de
// certificados antes de ler. Só sai empresa + número do relatório (nada de credenciamento ou senhas).
const SUPABASE_URL = "https://vjbyyjfmilmeyzeiinxf.supabase.co";
const CERTIFICADOS_AUTH = "https://madeireiras-cert.vercel.app/api/auth";

module.exports = async (req, res) => {
  if (req.method !== "GET") return res.status(405).json({ error: "Use GET." });
  const auth = req.headers.authorization || "";
  if (!auth) return res.status(401).json({ error: "Sessão expirada: entre de novo." });
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!chave) return res.status(500).json({ error: "Falta configurar SUPABASE_SERVICE_ROLE_KEY na Vercel." });

  let ok;
  try {
    ok = await fetch(CERTIFICADOS_AUTH, { headers: { Authorization: auth } });
  } catch {
    return res.status(503).json({ error: "Não foi possível falar com o site de certificados." });
  }
  if (ok.status === 401) return res.status(401).json({ error: "Sessão expirada: entre de novo." });
  if (!ok.ok) return res.status(503).json({ error: "Não foi possível conferir a sessão agora." });

  const headers = { apikey: chave };
  if (!chave.startsWith("sb_")) headers.Authorization = `Bearer ${chave}`;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/curvas_peticionamento?select=empresa,empresa_pasta,relatorios`, { headers });
  if (!r.ok) return res.status(503).json({ error: "Não foi possível ler a aba Peticionamento SEI." });
  const linhas = await r.json().catch(() => []);
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    relatorios: linhas
      .filter(l => l.relatorios)
      .map(l => ({ empresa: l.empresa || "", pasta: l.empresa_pasta || "", relatorio: String(l.relatorios) })),
  });
};
