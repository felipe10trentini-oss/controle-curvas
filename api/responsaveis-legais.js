// Aba Relatórios: responsável legal de cada empresa, cadastrado nos RTs da Emissão de Certificados.
// Repassa com a sessão do colaborador (cert_token); lá só saem nome e empresa, sem e-mail nem senha.
const URL_LEGAIS = "https://madeireiras-cert.vercel.app/api/madeireiras/responsaveis-legais";

module.exports = async (req, res) => {
  if (req.method !== "GET") return res.status(405).json({ error: "Use GET." });
  const auth = req.headers.authorization || "";
  if (!auth) return res.status(401).json({ error: "Sessão expirada: saia e entre de novo." });
  let r;
  try {
    r = await fetch(URL_LEGAIS, { headers: { Authorization: auth } });
  } catch {
    return res.status(503).json({ error: "Não foi possível falar com o site de certificados." });
  }
  const dados = await r.json().catch(() => ({ error: "Resposta inválida do site de certificados." }));
  res.setHeader("Cache-Control", "no-store");
  res.status(r.status).json(dados);
};
