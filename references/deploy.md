# Deploy: GitHub privado + Vercel

Conta GitHub: `dexamenipd` (via `gh`, já logado). Vercel: a conta logada no conector Vercel MCP (deve ser a ligada ao `dexamenipd`). Confira antes com `get_auth_user` do MCP; se a conta Vercel não tiver o GitHub `dexamenipd` ligado, use o plano B e avise.

## 1. Repositório

Regra: **sempre rode `npm run build` e confirme que terminou sem erro antes de qualquer push** (o primeiro e todos os seguintes). Build falhou: corrija antes de commitar. Nunca suba código que não compila.

Na pasta local de trabalho (`$TMP/cliente-dalla-labs-N`):
```bash
npm run checar         # obrigatórios ok; senão, pare e corrija
npm run build          # tem que passar sem erro; senão, pare e corrija
git init -b main
git add -A
git commit -m "Prévia do site <Empresa>"
gh repo create dexamenipd/cliente-dalla-labs-N --private --source . --push
```
`.gitignore` do template já exclui `node_modules`, `dist` e `.vercel`. Confira com `git status` que nenhuma imagem pesada (> 2 MB) entrou.

## 2. Projeto Vercel ligado ao repo (plano A)

1. Carregue as ferramentas do MCP Vercel (`ToolSearch` com `select:` de `create_project`, `get_project`, `list_deployments`, `get_deployment`, `create_deployment`).
2. `create_project` com:
   - `name`: `cliente-dalla-labs-N`
   - `framework`: `vite`
   - `gitRepository`: `{ "type": "github", "repo": "dexamenipd/cliente-dalla-labs-N" }`
   - `ssoProtection`: `null` (link público, sem login)
3. O push já feito não dispara build sozinho em projeto recém-criado. Dispare com `create_deployment`: `name` e `project` = `cliente-dalla-labs-N`, `target: "production"`, `gitSource: { "type": "github", "org": "dexamenipd", "repo": "cliente-dalla-labs-N", "ref": "main" }`.
4. Acompanhe com `get_deployment` até `READY`. Se `ERROR`, leia os eventos do build (`list_deployment_events`), corrija, rode `npm run build` de novo até passar, e só então faça novo commit e push (o push agora dispara o deploy sozinho).

Se `create_project` recusar o repo (Vercel sem acesso ao GitHub `dexamenipd`), pare o plano A, avise o usuário para instalar o app da Vercel no GitHub com acesso a todos os repos e siga o plano B para não travar a entrega.

## 3. Plano B: deploy direto da pasta

```bash
npm run build
npx vercel@latest deploy --prod --yes --name cliente-dalla-labs-N
```
Se a CLI pedir login, o usuário roda `npx vercel@latest login` no terminal dele (não digite credenciais). O repo continua no GitHub como fonte, mas sem deploy automático: anote em `ENTREGA.md`.

## 4. Conferir o link

(A versão final, sem prévia, é com o usuário: `npm run versao-final -- --confirmo-pix` faz build, checagem, commit e push. A skill nunca roda.)


- URL final: `https://cliente-dalla-labs-N.vercel.app` (alias de produção). Se o nome estiver ocupado, a Vercel gera outro; use o alias que o `get_deployment` ou `get_project` mostrar.
- Abra no navegador do app (sessão sem login da Vercel) e confira que não aparece tela de login. Se aparecer, `update_project` com `ssoProtection: null` e confira de novo.
- Confira a faixa "Prévia Dalla Labs", o `noindex` (veja o código-fonte) e a prévia do link (`og:image`).
- Nunca use a URL de deployment com hash (`cliente-...-abc123.vercel.app`) como link para o cliente.
