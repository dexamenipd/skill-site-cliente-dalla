---
name: site-cliente-dalla
description: Use quando pedirem para criar o site de um cliente da Dalla Labs (nicho energia solar) a partir de uma pasta com informações-relevantes-do-cliente.md e imagens, e publicar a prévia em repositório privado no GitHub e na Vercel. Gatilhos: "/site-cliente-dalla", "use a skill site-cliente-dalla", "crie o site do cliente no diretório X".
---

# Site cliente Dalla Labs (solar)

Recebe o caminho de uma pasta de cliente, monta um site mobile first cheio de animação guiada por scroll (Vite, sem backend), com simulador de economia e faixa "Prévia Dalla Labs", cria repositório privado no GitHub e publica na Vercel. Devolve o link `*.vercel.app` e o link do repo. A mensagem ao cliente não é desta skill.

## Entrada

- Caminho da pasta do cliente (ex.: `/workspace/Cliente-Dalla/solar-xyz`). Se não vier no prompt, pergunte e pare.
- Na pasta: o `.md` de informações do cliente (obrigatório; qualquer nome no padrão `informa*relevantes*.md`, ex.: `informacoes-relevantes-cliente-solar-xyz.md`, idealmente no formato de `modelo-informacoes.md`) e imagens (logo, obras, equipe). Sem o `.md`, pare e avise.
- Não pergunte nada que o `.md` responde. O que faltar vira placeholder marcado `[PREENCHER: ...]` no código e entra no relatório final.

## Referências (leia só na etapa indicada)

| Arquivo | Quando |
|---|---|
| `references/solar.md` | Etapa 2: seções, copy, simulador |
| `references/design.md` | Etapa 3: tokens, tipografia, anti-template, identidade |
| `references/motion.md` | Etapa 4: motor de scroll, hero, mola, celular |
| `references/checklist.md` | Etapa 6: checagem antes de publicar |
| `references/deploy.md` | Etapa 7: GitHub e Vercel |
| `template/` | Etapa 1: projeto base, copie e adapte, não reescreva do zero |
| `modelo-informacoes.md` | Modelo do `.md` e nomes das fotos para a IA que coleta o conteúdo |

Scripts do template: `npm run importar` (fotos), `npm run fotos` (espaços com e sem foto), `npm run checar` (checagem automática), `npm run versao-final` (só o usuário, depois do Pix).

## Passos

1. **Preparar.** Leia o `.md` e liste as imagens da pasta (nome, tamanho, o que mostram; abra as imagens para ver). Sorteie `N` entre 150 e 200 e confira com `gh repo view dexamenipd/cliente-dalla-labs-N`; se existir, sorteie de novo. Copie `template/` para uma pasta local de trabalho (`$TMP/cliente-dalla-labs-N`, nunca compile na pasta de rede) e troque `cliente-dalla-labs-N` pelo número real no `index.html` (`og:url`, `og:image`). Rode `npm run importar -- "<pasta do cliente>"`: fotos com o nome do espaço (`hero.jpg`, `obra-1.png`, `logo.png`, ver `modelo-informacoes.md`) entram sozinhas, em WebP de 1600 e 800 px, com favicon e `og.jpg`. As que sobrarem com outro nome: abra cada uma, escreva um `mapa.json` (`{"IMG_1234.jpg": "obra-2"}`) e rode de novo com `--mapa mapa.json`. Espaço sem foto fica reservado, nunca cortado.
2. **Conteúdo.** Siga `references/solar.md`. Preencha `src/config.js` (empresa, cidade, WhatsApp, números, depoimentos, tarifa do simulador) só com dados do `.md`. Escreva a copy em PT-BR.
3. **Design.** Siga `references/design.md`. Defina tokens (cores tiradas do logo, tipografia, signature) em `src/style.css`. Escreva o plano de 5 linhas em `DESIGN.md` do projeto antes de codar layout.
4. **Motion.** Siga `references/motion.md`. Monte a hero guiada por scroll e as animações de cada seção. Nada parado sem motivo; celular primeiro; `prefers-reduced-motion` com versão calma.
5. **Build e teste local.** `npm install`, `npm run build`, `npm run preview`. Abra no navegador do app (Claude Browser) em 375x812 e em desktop: role a página inteira, use o simulador, clique no WhatsApp, leia o console. Corrija até não haver erro no console nem rolagem horizontal.
6. **Checagem.** `npm run checar` cobre a parte automática (prévia ligada, noindex, WhatsApp, N real, og.jpg, placeholders, peso das imagens, segredos) e sai com erro se um obrigatório falhar. Depois confira à mão o resto de `references/checklist.md` (itens marcados "manual"). Corrija todo obrigatório.
7. **Publicar.** Siga `references/deploy.md`: repo privado `dexamenipd/cliente-dalla-labs-N`, push, projeto Vercel ligado ao repo, deploy de produção, confirmar que o link abre sem login.
8. **Guardar.** Copie o código-fonte (sem `node_modules` e sem `dist`) para a pasta do cliente em `site/`, e grave `site/ENTREGA.md` com links, número N, placeholders, "Fotos pedidas" (saída de `npm run fotos`) e o que falta.

## Atualizar um site que já existe

Se a pasta já tem `site/ENTREGA.md` (pedido de "atualizar" ou de "aplicar as alterações pedidas"), não crie repo novo:
1. Leia o `ENTREGA.md` (N, repo) e a seção "Alterações pedidas" do `.md` do cliente.
2. `gh repo clone dexamenipd/cliente-dalla-labs-N "$TMP/cliente-dalla-labs-N"`, `npm install`.
3. Fotos novas: `npm run importar -- "<pasta do cliente>"`. Texto ou layout: edite só o que foi pedido.
4. `npm run checar` e `npm run build` sem erro, teste no navegador do app em 375x812, commit e `git push` (a Vercel publica sozinha).
5. Atualize `site/` e o `ENTREGA.md` na pasta do cliente e marque as alterações feitas no `.md`. Responda no mesmo formato de saída.
Pedido fora de ajuste (página nova, sistema, loja): não faça, responda "fora do escopo de ajustes" para virar orçamento.

## Regras fixas

- Faixa "Prévia Dalla Labs" fixa no topo e `<meta name="robots" content="noindex, nofollow">` sempre ligados. Nunca remova: quem remove é o usuário, depois do Pix, com `npm run versao-final -- --confirmo-pix` (a skill nunca roda esse comando). Escreva no `ENTREGA.md` como rodar.
- Sem backend, sem formulário que envia dados. Todo lead vai para o WhatsApp (`wa.me`), com texto pré-preenchido.
- Não invente depoimento, CREA, número de obras, kWp, anos de empresa nem selo. Sem dado, use placeholder ou corte a seção.
- Referência Apple é linguagem de design (espaço, tipo, mola, materiais), nunca identidade (paleta, fonte SF, ícones, frases, arranjo de página de produto da Apple).
- Sempre `npm run build` sem erro antes de qualquer push para o GitHub. Build quebrado não sobe.
- Não envie mensagem ao cliente. Não mexa em domínio próprio.

## Saída (resposta final, curta)

```
Prévia: https://cliente-dalla-labs-N.vercel.app
Repo: https://github.com/dexamenipd/cliente-dalla-labs-N (privado)
Pasta: <pasta do cliente>/site
Placeholders: <lista ou "nenhum">
Fotos: <x de 16 no lugar; pedidas: lista curta>
Checagem: <itens obrigatórios ok / pendências>
```

## Erros comuns

- Vercel não vê o repo: o app da Vercel no GitHub `dexamenipd` não tem acesso. Avise o usuário (Vercel > Settings > Git) e use o plano B de `deploy.md`.
- Link pede login: proteção de deployment ligada. Use a URL de produção e confira em aba anônima (ver `deploy.md`).
- Hero trava no celular: frames demais ou imagens grandes. Siga os limites de `motion.md`.
