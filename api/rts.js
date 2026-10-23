// Aba "RTs cadastrados": repassa para o site de Emissão de Certificados, onde ficam os RTs e as senhas do SEI
// (criptografadas lá). Aqui não se guarda nem se decifra nada: a permissão é conferida por lá, com a sessão
// do colaborador (cert_token devolvido pelo /api/login).
const RTS = "https://madeireiras-cert.vercel.app/api/madeireiras/rts";

module.exports = async (req, res) => {
  if (!["GET", "POST", "DELETE"].includes(req.method)) return res.status(405).json({ error: "Método não aceito." });
  const auth = req.headers.authorization || "";
  if (!auth) return res.status(401).json({ error: "Sessão expirada: saia e entre de novo." });
  const busca = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  let r;
  try {
    r = await fetch(RTS + busca, {
      method: req.method,
      headers: { Authorization: auth, ...(req.method === "POST" ? { "Content-Type": "application/json" } : {}) },
      body: req.method === "POST" ? JSON.stringify(req.body || {}) : undefined,
    });
  } catch {
    return res.status(503).json({ error: "Não foi possível falar com o site de certificados." });
  }
  const dados = await r.json().catch(() => ({ error: "Resposta inválida do site de certificados." }));
  res.setHeader("Cache-Control", "no-store");
  res.status(r.status).json(dados);
};
