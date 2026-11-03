# Controle de Curvas

Página única (`index.html`) publicada na Vercel em https://controle-curvas.vercel.app/ (projeto Vercel `controle-curvas`, publica sozinho a cada envio para o GitHub).

- Banco: o mesmo Supabase do Controle GLP (`vjbyyjfmilmeyzeiinxf`). O Controle GLP fica em outro repositório: github.com/felipe10trentini-oss/Controle-GLP.
- Login: cada colaborador entra com o login e a senha da Emissão de Certificados (madeireiras-cert). `api/login.js` confere em https://madeireiras-cert.vercel.app/api/auth e abre uma sessão do Supabase para `<login>@colaborador.controle-curvas.vercel.app`. Variável na Vercel: `SUPABASE_SERVICE_ROLE_KEY` (chave secreta "controlecurvas" do Supabase).

- Aba Cadastros: é a própria tela `/madeireiras` da Emissão de Certificados (madeireiras-cert) num iframe, com o login enviado por postMessage (`EmbedCadastros.tsx` lá, `renderCadastros` aqui). Não recriar a tela aqui: mudanças nos cadastros são feitas no madeireiras-cert e aparecem nos dois. Só quem tem a permissão de Cadastros de lá vê a aba.
- Relatórios 2026: empresa sem RT usa o "Resp. Legal" cadastrado nos RTs (`api/responsaveis-legais.js`) e fica no grupo com o nome dele. `curvas_empresas.resp_legal` existe no banco, mas a coluna foi tirada da tela.

## Dois computadores mexem neste projeto

O GitHub é a cópia oficial. Para um computador nunca apagar o trabalho do outro:

1. **Antes de qualquer alteração:** `git pull` (se a pasta não existir, `git clone https://github.com/felipe10trentini-oss/controle-curvas.git`).
2. **Logo depois de cada alteração pronta:** `git add`, `git commit` e `git push` — sem esperar o fim do dia. O push já publica na Vercel.
3. Nunca enviar arquivos pelo "Add files via upload" do GitHub a partir de uma cópia antiga: baixe a versão atual antes, ou use o git.
4. Se o `git pull` der conflito, pare e pergunte ao usuário qual versão vale.
