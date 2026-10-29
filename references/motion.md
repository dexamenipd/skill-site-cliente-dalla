# Motion guiado por scroll

Adaptado da skill `crie-meu-motion` (HyperFrames): lá, cada frame do vídeo é uma função pura do tempo `t`. Aqui, cada frame da página é uma função pura do progresso do scroll `p` (0 a 1). Mesma disciplina: mola em forma fechada, nada depende do frame anterior, tudo em sequência com defasagem. O motor já está pronto em `template/src/motion.js`; adapte as cenas, não reescreva o motor.

## 1. Contrato

- Cada cena tem `render(p)` pura: recebe o progresso local (0 a 1) e escreve só `transform`, `opacity`, `clip-path`, variáveis CSS ou desenho em `<canvas>`. Nada de ler layout (`getBoundingClientRect`) dentro do `render`.
- O progresso vem do scroll suavizado pelo Lenis. Uma única `requestAnimationFrame` chama todas as cenas visíveis.
- Sem `Math.random()` sem semente: aleatório vem de hash do índice (`hash(i)`), para a cena ser idêntica a cada scroll.
- Sem CSS `transition`/`animation` com `ease`/`linear` para coisa ligada ao scroll. Movimento usa `spring()` ou `springStep()` do motor.
- Animações temporais (pulso do botão do WhatsApp, brilho do sol em idle) usam o relógio da rAF com mola ou seno lento, nunca keyframes `ease`.

## 2. Molas

Forma fechada (de `crie-meu-motion`), para mapear progresso em movimento com overshoot natural:
```js
spring(x, zeta = 0.42, omega = 17)   // x em segundos virtuais; 1 seção ≈ 1 s
```
- Faixas: `zeta` 0,35 a 0,8, `omega` 10 a 22, por elemento.
- Padrão Apple: sem overshoot (`zeta 1.0`) para UI e texto; overshoot leve (`zeta ~0.8`) só em coisa "física" (placa encaixando no telhado, card).
- Opacidade e cor não oscilam: use `clamp01` em cima da mola para opacidade.
- `springStep(state, alvo, dt, zeta, omega)`: mola com estado para seguir um alvo que muda (números do simulador, cursor). Sempre parte do valor atual (interruptível).

## 3. Hero: história em scroll

Estrutura: `<section class="hero" style="height: 400vh">` com um `.hero__stage` `position: sticky; top: 0; height: 100svh`. O progresso `p` da hero vai de 0 (topo) a 1 (fim da seção).

Roteiro padrão em 4 atos (troque pelos assets do cliente):

| p | Ato | O que acontece |
|---|---|---|
| 0.00 a 0.25 | Telhado | Foto real de obra do cliente (ou ilustração SVG do telhado) com leve parallax; título entra palavra por palavra (defasagem 0,03 de p); sol nasce no canto |
| 0.25 a 0.50 | Placas | Placas SVG descem e encaixam no telhado em sequência (mola zeta 0.7, defasagem por placa), cada uma brilha ao encaixar |
| 0.50 a 0.75 | Energia | Linhas de energia correm das placas para a casa (`stroke-dashoffset`), contador de kWh sobe |
| 0.75 a 1.00 | Economia | Conta de luz encolhe de "R$ 480" para "R$ 60"; CTA "Simular minha economia" sobe e fica |

Regras da hero:
- Algo sempre se mexe, mesmo parado (sol respira, partículas de luz em hash, leve flutuação das placas). O movimento vem de um elemento da cena, nunca de zoom lento na tela inteira.
- Elementos entram em sequência com defasagem de 0,02 a 0,04 de `p`.
- Asset real é a peça principal. Logo e interface inventados são proibidos; ilustração SVG genérica (sol, placa, casa) pode.
- Texto da hero alinhado à esquerda, máximo 2 tamanhos.
- Indicador de progresso discreto (4 pontos) mostra que há história no scroll.

### Variante: sequência de frames (opcional)

Só quando houver vídeo ou muitas fotos boas da obra. Gere frames com FFmpeg (`ffmpeg -i obra.mp4 -vf "fps=24,scale=900:-2" -q:v 70 public/seq/f_%03d.webp`), no máximo 90 frames no celular e 150 no desktop, desenhe no `<canvas>` o frame `round(p * (n-1))`. Pré-carregue os primeiros 10, o resto em idle.

## 4. Outras seções (nada parado)

- **Revelação padrão**: cada bloco entra com mola (y 24px → 0, opacidade 0 → 1, blur 6px → 0), filhos com defasagem. Progresso vem da posição do bloco na viewport (`motion.js` faz isso via atributo `data-reveal`).
- **Contadores**: sobem com `springStep` quando entram na tela.
- **Transições de foto e título** (destiladas de `ui-ux-pro-max`, prontas em `template/src/imagens.js`):
  - `data-revelar`: a foto sobe por uma máscara (`clip-path: inset`) enquanto o zoom desacelera de 1,3 para 1,12; parallax de 5 a 15% por foto; vizinhas na mesma linha com defasagem.
  - `h2[data-split]`: palavras sobem de dentro de uma máscara, 40 ms de defasagem. Só em títulos curtos (até ~8 palavras), nunca em parágrafo.
  - Antes e depois: o scroll abre a comparação sozinho (de 94% para 50%); o toque assume no `pointerdown` e a mola parte do valor atual. Range escondido para teclado.
  - CTA final: a foto nasce como card com margem e cantos e abre até a borda conforme o scroll (seção clara para escura sem corte seco).
  - Espaço de foto vazio: listras que correm devagar com o relógio e o scroll (nada parado).
  - Regras herdadas: defasagem 30 a 50 ms por item, no máximo ~8 itens em sequência; parallax nunca em texto; reserve o espaço da imagem (`aspect-ratio` ou `width`/`height`) para CLS zero.
- **Como funciona**: linha SVG se desenha conforme o scroll; cada passo acende quando a linha chega nele.
- **Obras**: mosaico com revelação por máscara e parallax leve por imagem (velocidades diferentes por hash).
- **Simulador**: números seguem o slider com `springStep`, barra da conta encolhe, placas aparecem em grade conforme o kWp.
- **Signature contínua**: o sol (ou elemento escolhido em `DESIGN.md`) atravessa a página inteira ligado ao scroll global.
- **Botão WhatsApp**: pulso de escala 1 → 1.06 a cada ~2,5 s com mola, para enquanto o dedo está na tela.

## 5. Celular primeiro e desempenho

- Anime só `transform`, `opacity`, `clip-path` e `filter: blur` pequeno. `will-change` só no elemento em movimento.
- No celular (`matchMedia('(max-width: 767px)')`): metade das partículas, sem `filter: blur` nas revelações, sequência de frames com no máximo 90 frames, hero com `height: 300vh`.
- Use `100svh`, não `100vh` (barra do navegador do celular).
- Lenis com `syncTouch: false` no celular (scroll nativo, o progresso continua suave pela mola). Nunca sequestre o scroll do toque.
- Pause cenas fora da tela (`IntersectionObserver`). Meta: 60 fps em celular médio, LCP até 2,5 s, CLS até 0,1.
- Imagens WebP, `loading="lazy"` abaixo da dobra, `fetchpriority="high"` na imagem da hero.

## 6. Movimento reduzido

`prefers-reduced-motion: reduce`: sem Lenis, hero vira uma seção normal (altura automática) com o estado final de cada ato visível, revelações viram cross-fade de opacidade curto, sem parallax, sem pulso. Nada de informação só no movimento: os números e a mensagem da hero aparecem também em texto estático.

## 7. Revisão de motion (antes do deploy)

Grave a tela no navegador do app em 375x812 rolando a página inteira, depois tire screenshots em p = 0, 0.25, 0.5, 0.75, 1 da hero. Para cada ato, nota de 0 a 10 em: frame morto, mola, hierarquia, leitura no celular, fidelidade à marca do cliente. Corrija o que ficar abaixo de 8 (no máximo 3 passadas). Anote em `revisao.md` do projeto.
