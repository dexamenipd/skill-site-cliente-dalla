# Checagem antes de publicar

Recorte da skill `terminei-o-site-e-agora` para site estático de prévia, sem backend. [O] = obrigatório (bloqueia o deploy), [R] = recomendado (anote se ficar pendente).

`npm run checar` já confere sozinho: prévia, noindex (meta, robots.txt, vercel.json), WhatsApp, N real no `og:url`, `og.jpg`, empresa preenchida, favicon, logo, título, description, H1 único, placeholders, alt pendente, peso das imagens e segredos. Abaixo, confira à mão o que ele não cobre (navegador, links, contraste, identidade, jurídico).

## Publicação
- [O] Celular 360/375 px: texto legível sem zoom, botões clicáveis, sem rolagem horizontal, `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- [O] WhatsApp: `https://wa.me/55DDDNUMERO?text=...` com DDI e DDD, sem `+`, espaços ou traços, texto com `encodeURIComponent`. Botão flutuante não cobre CTA nem rodapé.
- [O] Todos os links e âncoras funcionam. Links externos em nova aba com `rel="noopener noreferrer"`.
- [O] Console do navegador sem erro.
- [R] Página 404 com a marca e caminho para a home (`public/404.html`).
- [O] Favicon (a partir do logo do cliente) e `apple-touch-icon` 180x180.
- [O] Imagens em WebP, com `width`/`height`, `loading="lazy"` abaixo da dobra, `fetchpriority="high"` na principal.
- [R] Lighthouse mobile: LCP até 2,5 s, CLS até 0,1, sem script bloqueante.
- [O] `og:title`, `og:description`, `og:image` (1200x630, URL absoluta https), `og:url`, `twitter:card`. O link vai ser mandado no WhatsApp, a prévia do link precisa aparecer bonita.
- [R] Rodapé com nome, cidade, contato, CNPJ se houver.

## SEO (preparado, mas desligado na prévia)
- [O] `<meta name="robots" content="noindex, nofollow">` e `public/robots.txt` com `Disallow: /` enquanto `PREVIA = true`.
- [O] `<title>` com 50 a 60 caracteres ("Energia solar em Cidade | Empresa"), meta description com 120 a 160 caracteres.
- [O] Um H1 só, H2/H3 sem pular nível. Texto real no HTML, nada de lorem ipsum.
- [O] `alt` em toda imagem informativa, `alt=""` nas decorativas.
- [R] Deixe pronto em `ENTREGA.md` o que muda na versão final: tirar noindex, `robots.txt` liberado, `sitemap.xml`, Search Console, Perfil da Empresa no Google com o mesmo nome, endereço e telefone.

## Jurídico e LGPD
- [O] Sem depoimento, nota, número ou selo inventado. Promessa sem prova reescrita ("até", "estimativa").
- [O] Aviso de estimativa no simulador.
- [O] Fontes com licença para uso comercial (Google Fonts ok). Imagens: só as da pasta do cliente ou ilustração própria. Registre em `ENTREGA.md` a origem de cada imagem; as baixadas da internet ficam marcadas "confirmar autorização com o cliente antes da versão final".
- [O] Logos de fabricantes (painéis, inversores) só com autorização; na dúvida, só o nome em texto.
- [R] Sem analytics nem pixel na prévia (evita aviso de cookies). Na versão final: analytics sem cookies ou com consentimento.
- [O] Acessibilidade: contraste 4,5:1 no texto, foco visível, navegação por Tab, `prefers-reduced-motion` funcionando.

## Identidade visual
- [O] Rodar o item 8 de `design.md` (checagem de cópia da referência Apple) e escrever o resultado no relatório.

## Segurança (estático)
- [O] Nenhum segredo, token ou dado pessoal além do contato público no código ou no Git.
- [O] `vercel.json` com cabeçalhos: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy` restritiva.
- [R] `npm audit --omit=dev` sem vulnerabilidade alta.
