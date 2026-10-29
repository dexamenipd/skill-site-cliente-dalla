// Fotos reais: espaços reservados (slots), revelação por máscara, antes e depois,
// títulos palavra por palavra e a foto do CTA final que abre até a borda.
// Transições destiladas de ui-ux-pro-max (references/motion.md, seção 4).
import { cena, tick, spring, springStep, clamp01, lerp, trecho, hash, reduzido, celular } from './motion.js';

const ICONE = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" d="M3.5 8h3.2L8.3 6h7.4l1.6 2h3.2v11h-17z"/><circle cx="12" cy="13.2" r="3.6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';

// [data-slot] sem imagem (arquivo ainda não chegou) vira um espaço reservado
// com o pedido da foto escrito, para o cliente ver onde entra a foto dele.
export function slots() {
  // Logo ainda não chegou: mostra o nome da empresa em texto, sem ícone quebrado
  const logo = document.querySelector('.header__logo img');
  const semLogo = () => { logo.parentElement.classList.add('header__logo--texto'); logo.replaceWith(logo.alt); };
  if (logo) {
    if (logo.complete && logo.naturalWidth === 0) semLogo();
    else logo.addEventListener('error', semLogo, { once: true });
  }

  document.querySelectorAll('[data-slot]').forEach((s) => {
    const img = s.querySelector('img');
    const marcar = () => {
      if (s.classList.contains('slot--vazio')) return;
      s.classList.add('slot--vazio');
      const d = document.createElement('div');
      d.className = 'slot__pedido';
      d.innerHTML = ICONE + '<strong>Sua foto real aqui</strong><span></span>';
      d.querySelector('span').textContent = s.dataset.pedido || '';
      s.append(d);
      // Listras correm devagar com o relógio e com o scroll: o espaço não fica parado
      if (!reduzido) cena(s, (p) => s.style.setProperty('--p', (p * 2 + performance.now() / 6000).toFixed(4)));
    };
    if (!img || !img.getAttribute('src')) return marcar();
    if (img.complete && img.naturalWidth === 0) marcar();
    img.addEventListener('error', marcar, { once: true });
  });
}

// [data-revelar]: a foto sobe por uma máscara (clip-path) e desacelera o zoom,
// com parallax leve (5 a 15%) por foto. Vizinhas na mesma linha entram com defasagem.
export function revelarFotos() {
  if (reduzido) return;
  document.querySelectorAll('[data-revelar]').forEach((fig, i) => {
    const img = fig.querySelector('img');
    const ordem = [...fig.parentElement.children].indexOf(fig) % 3;
    const vel = (celular ? 5 : 9) + hash(i) * 6;
    cena(fig, (p) => {
      const x = (p - 0.03 - ordem * 0.03) * 3;
      const k = clamp01(spring(x, 0.9, 9));
      fig.style.clipPath = `inset(${(1 - k) * 100}% 0 0 0 round var(--raio))`;
      if (img) img.style.transform = `translate3d(0, ${(0.5 - p) * vel}%, 0) scale(${lerp(1.3, 1.12, k)})`;
    });
  });
}

// h2[data-split]: cada palavra sobe de dentro de uma máscara, 40 ms de defasagem.
export function titulos() {
  document.querySelectorAll('[data-split]').forEach((h) => {
    const texto = h.textContent.trim();
    h.setAttribute('aria-label', texto);
    h.textContent = '';
    const palavras = texto.split(/\s+/).map((w, i, todas) => {
      const caixa = document.createElement('span');
      caixa.className = 'split';
      caixa.setAttribute('aria-hidden', 'true');
      const d = document.createElement('span');
      d.textContent = w;
      caixa.append(d);
      h.append(caixa, i < todas.length - 1 ? ' ' : '');
      return d;
    });
    if (reduzido) return;
    cena(h, (p) => {
      palavras.forEach((d, i) => {
        const m = spring((p - 0.06) * 2.6 - i * 0.04, 0.75, 13);
        d.style.transform = `translate3d(0, ${(1 - m) * 110}%, 0)`;
      });
    });
  });
}

// Antes e depois: o scroll abre a comparação sozinho; o dedo assume a qualquer
// momento (interruptível, parte do valor atual). Teclado pelo range escondido.
export function antesDepois() {
  const q = document.querySelector('.ad__quadro');
  if (!q) return;
  const depois = q.querySelector('.ad__depois');
  const alca = q.querySelector('.ad__alca');
  const controle = q.querySelector('.ad__controle');
  const s = { x: reduzido ? 50 : 94, v: 0 };
  let alvo = s.x;
  let mao = false;
  let arrastando = false;

  const pos = (e) => {
    const r = q.getBoundingClientRect();
    return clamp01((e.clientX - r.left) / r.width) * 100;
  };
  q.addEventListener('pointerdown', (e) => {
    mao = true; arrastando = true; alvo = pos(e);
    q.setPointerCapture?.(e.pointerId);
  });
  q.addEventListener('pointermove', (e) => { if (arrastando) alvo = pos(e); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((t) => q.addEventListener(t, () => { arrastando = false; }));
  controle?.addEventListener('input', () => { mao = true; alvo = Number(controle.value); });

  if (!reduzido) {
    cena(q, (p) => {
      if (!mao) alvo = lerp(94, 50, spring(trecho(p, 0.2, 0.55) * 2.2, 0.7, 8));
    });
  }
  tick((dt) => {
    const x = reduzido ? (s.x = alvo) : springStep(s, alvo, dt, arrastando ? 1 : 0.75, arrastando ? 30 : 12);
    depois.style.clipPath = `inset(0 0 0 ${x}%)`;
    alca.style.left = x + '%';
    if (controle && document.activeElement !== controle) controle.value = Math.round(x);
  });
}

// CTA final: a foto nasce como card com margem e cantos, e abre até a borda.
export function finalAbre() {
  const m = document.querySelector('.final__midia');
  if (!m || reduzido) return;
  const img = m.querySelector('img');
  cena(m.parentElement, (p) => {
    const k = clamp01(spring(trecho(p, 0, 0.5) * 2.4, 0.95, 7));
    const lado = (1 - k) * (celular ? 14 : 48);
    m.style.clipPath = `inset(${lado}px ${lado}px round ${(1 - k) * 28}px)`;
    if (img) img.style.transform = `translate3d(0, ${(0.5 - p) * 6}%, 0) scale(${lerp(1.2, 1.04, k)})`;
  });
}
