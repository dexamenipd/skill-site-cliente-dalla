# Design

Destilado de duas skills de referência (emilkowalski/skills `apple-design` e dickwu/apple-design-skill, baseadas nas palestras de design da WWDC e no Human Interface Guidelines) e da skill `checar-copia-de-identidade-visual`. Usamos a linguagem de design (resposta, mola, materiais, tipografia, contenção), nunca a identidade da Apple.

Também usa a skill `ui-ux-pro-max` como referência (design system rodado para "solar energy installer local service residential trust"): estilo **Trust & Authority** (credenciais visíveis, casos com métricas, antes e depois, equipe real), padrão **Before-After Transformation** (prova visual antes do CTA) e as regras de imagem (WebP, `loading="lazy"` abaixo da dobra, espaço reservado para CLS zero, `alt` descritivo). A paleta e a fonte que ela sugere são genéricas: as cores continuam vindo do logo e das fotos do cliente.

## 1. Plano antes do layout (grave em `DESIGN.md` do projeto)

1. **Tese**: em uma frase, o trabalho do site e a coisa mais característica dele.
2. **Cor**: 4 a 6 hex com papel (superfície, texto, acento, sinal), tirados do logo e das fotos do cliente. Calcule o contraste de cada texto sobre a superfície e anote.
3. **Tipo**: uma display com personalidade, usada com contenção, e uma de corpo. Google Fonts via `@fontsource` ou arquivo local `woff2`, só os pesos usados, `font-display: swap`.
4. **Signature**: o único elemento pelo qual o site vai ser lembrado, e por que ele pertence a esta empresa (ex.: o sol que atravessa a página conforme o scroll e liga as seções; a conta de luz que se rasga).
5. **Motion**: o momento orquestrado (a hero) e o que cada seção faz.

Depois critique o plano: você faria o mesmo plano para outra empresa solar? Se sim, é padrão. Troque o que for genérico e escreva o que mudou.

## 2. Anti-template (proibido sem razão do produto)

- Creme quente + serifa de alto contraste + terracota.
- Quase preto + um acento verde-ácido ou vermelhão.
- Hero de "número gigante sobre label pequena com degradê".
- Marcadores 01 / 02 / 03 em conteúdo que não é sequência.
- Clichê solar: azul royal + amarelo + painel de banco de imagem + folha verde. Use as cores e as fotos reais do cliente.
- Texto todo em maiúsculo e centralizado sobre degradê.

Ousadia gasta em um lugar só. O resto fica quieto. Tire um acessório antes de entregar.

## 3. Tipografia

- Tracking por tamanho: display com `letter-spacing: -0.02em` a `-0.035em`, corpo perto de `0`, legenda pequena `+0.01em`.
- Leading inverso ao tamanho: display `1.0` a `1.1`, corpo `1.5` a `1.6`.
- Hierarquia por peso + tamanho + leading juntos. Máximo 2 tamanhos por bloco visual.
- Display com `clamp()`: `clamp(2.25rem, 8vw + 0.5rem, 5.5rem)`. Corpo mínimo 16px no celular (Apple: 17pt padrão).
- Espaçamento em `rem`, para o layout acompanhar o tamanho de fonte do usuário.

## 4. Layout mobile first

- Escreva o CSS para 360 px e suba com `min-width` (640, 1024, 1440). Nunca o contrário.
- Gutter 16 a 20 px no celular. Seções com ritmo de espaço generoso (`padding-block: clamp(4rem, 12vw, 9rem)`).
- Controles com no mínimo 44x44 px e espaço entre eles. CTA principal na metade inferior da tela, ao alcance do polegar.
- Texto alinhado à esquerda. Nada de rolagem horizontal. Imagens com `width`/`height` (sem CLS).

## 5. Materiais e profundidade

- Header e faixa de prévia como camada translúcida: `backdrop-filter: blur(20px) saturate(180%)` + fundo semitransparente, conteúdo passando por baixo.
- Nunca empilhe uma superfície translúcida clara sobre outra.
- Superfície maior = blur e sombra maiores.
- Sem divisória de 1px sob o header: use máscara de degradê onde o conteúdo encosta.
- Elementos de vidro entram animando blur + escala juntos, não só opacidade.
- `prefers-reduced-transparency: reduce`: fundo sólido, sem blur. `prefers-contrast: more`: fundo sólido e borda definida.

## 6. Resposta e toque (sensação)

- Feedback no `pointerdown`, não no clique: `:active { transform: scale(.97) }` imediato.
- Hover só em `@media (hover: hover)`.
- Nunca bloqueie input durante uma animação. Toda animação pode ser interrompida e parte do valor atual na tela.
- Slider do simulador acompanha o dedo 1:1; os números seguem com mola.
- Enter e exit pelo mesmo caminho. Popover/menu nasce do botão que o abriu (`transform-origin`).

## 7. Acessibilidade (falha = bloqueante)

- Contraste: texto até 18px com 4,5:1; texto grande ou negrito e componentes com 3:1.
- Nada comunicado só por cor ou só por movimento.
- Foco visível, ordem lógica de Tab, link "pular para o conteúdo", `<button>`/`<a>` de verdade.
- `alt` descritivo nas fotos de obra; `aria-label` em botões só de ícone.

## 8. Checagem de identidade (antes do deploy)

Liste o que veio da referência Apple. Proporção, ritmo, mola e escala ficam (aprendizado). Paleta, fonte SF, ícones SF Symbols, frases de marketing da Apple, arranjo de página de produto Apple são identidade: troque por escolhas do cliente. Pergunta final: alguém de fora diria "parece site da Apple"? Se sim, mude arranjo e tom, não só a cor. Diga no relatório o que foi mantido e o que foi trocado.
