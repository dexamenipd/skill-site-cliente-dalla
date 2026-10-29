// Motor de motion guiado por scroll.
// Cada cena é uma função pura do progresso p (0 a 1), como um frame de vídeo
// é função do tempo t. Uma única rAF desenha todas as cenas visíveis.
import Lenis from 'lenis';

export const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const celular = matchMedia('(max-width: 767px)').matches;

export const clamp01 = (x) => Math.min(1, Math.max(0, x));
export const lerp = (a, b, t) => a + (b - a) * t;
// Progresso local de um trecho [a, b] dentro de p
export const trecho = (p, a, b) => clamp01((p - a) / (b - a));

// Mola em forma fechada (de crie-meu-motion). x em "segundos virtuais".
export function spring(x, zeta = 0.42, omega = 17) {
  if (x <= 0) return 0;
  if (zeta >= 1) return 1 - Math.exp(-omega * x) * (1 + omega * x);
  const wd = omega * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * omega * x) *
    (Math.cos(wd * x) + ((zeta * omega) / wd) * Math.sin(wd * x));
}

// Mola com estado para seguir um alvo que muda. Sempre parte do valor atual.
export function springStep(s, alvo, dt, zeta = 1, omega = 14) {
  const f = omega * omega * (alvo - s.x) - 2 * zeta * omega * s.v;
  s.v += f * dt;
  s.x += s.v * dt;
  if (Math.abs(alvo - s.x) < 0.001 && Math.abs(s.v) < 0.001) { s.x = alvo; s.v = 0; }
  return s.x;
}

// Aleatório determinístico por índice
export function hash(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const cenas = [];
const tickers = new Set();
let lenis = null;

// Registra uma cena ligada à posição de um elemento.
// modo "pin": p vai de 0 (topo do el no topo da tela) a 1 (fim do el no fim da tela)
// modo "passagem": p vai de 0 (el entrando por baixo) a 1 (el saindo por cima)
export function cena(el, render, modo = 'passagem') {
  const c = { el, render, modo, visivel: false, top: 0, h: 0 };
  new IntersectionObserver(([e]) => { c.visivel = e.isIntersecting; }, { rootMargin: '20% 0px' }).observe(el);
  cenas.push(c);
  medir();
  return c;
}

// Função chamada todo frame com (dt, agora). Para coisas vivas: pulso, sol, números.
export function tick(fn) { tickers.add(fn); return () => tickers.delete(fn); }

function medir() {
  const y = scrollY;
  for (const c of cenas) {
    const r = c.el.getBoundingClientRect();
    c.top = r.top + y;
    c.h = r.height;
  }
}

function progresso(c, y, vh) {
  if (c.modo === 'pin') return clamp01((y - c.top) / Math.max(1, c.h - vh));
  return clamp01((y + vh - c.top) / (c.h + vh));
}

export function scrollTo(alvo) {
  if (lenis) lenis.scrollTo(alvo, { offset: -60 });
  else document.querySelector(alvo)?.scrollIntoView({ behavior: reduzido ? 'auto' : 'smooth' });
}

export function iniciar() {
  if (!reduzido) {
    lenis = new Lenis({ lerp: 0.1, syncTouch: false });
  }
  addEventListener('resize', medir);
  addEventListener('load', medir);
  new ResizeObserver(medir).observe(document.body);

  let antes = performance.now();
  function frame(agora) {
    const dt = Math.min(0.05, (agora - antes) / 1000);
    antes = agora;
    lenis?.raf(agora);
    const y = lenis ? lenis.animatedScroll : scrollY;
    const vh = innerHeight;
    for (const c of cenas) if (c.visivel) c.render(progresso(c, y, vh), c.el);
    for (const fn of tickers) fn(dt, agora / 1000);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// Revelação padrão: [data-reveal] entra com mola; filhos [data-reveal-item] com defasagem.
export function revelacoes() {
  document.querySelectorAll('[data-reveal]').forEach((bloco) => {
    const itens = bloco.querySelectorAll('[data-reveal-item]');
    const alvos = itens.length ? [...itens] : [bloco];
    if (reduzido) {
      alvos.forEach((el) => { el.style.opacity = 1; });
      return;
    }
    cena(bloco, (p) => {
      // Entra entre 5% e 35% da passagem; 1 unidade de p ≈ 2,5 s virtuais
      alvos.forEach((el, i) => {
        const x = (p - 0.05 - i * 0.025) * 2.5;
        const m = spring(x, 0.75, 12);
        const o = clamp01(spring(x, 1, 12));
        el.style.opacity = o;
        el.style.transform = `translate3d(0, ${(1 - m) * 28}px, 0)`;
        if (!celular) el.style.filter = o < 0.99 ? `blur(${(1 - o) * 6}px)` : '';
      });
    });
  });
}

// Contadores: [data-contar="123"] sobe com mola quando entra na tela.
export function contadores() {
  document.querySelectorAll('[data-contar]').forEach((el) => {
    const alvo = Number(el.dataset.contar);
    const sufixo = el.dataset.sufixo || '';
    const s = { x: 0, v: 0 };
    let ativo = false;
    if (reduzido) { el.textContent = alvo.toLocaleString('pt-BR') + sufixo; return; }
    new IntersectionObserver(([e]) => { if (e.isIntersecting) ativo = true; }, { threshold: 0.6 }).observe(el);
    tick((dt) => {
      if (!ativo || s.x === alvo) return;
      springStep(s, alvo, dt, 1, 5);
      el.textContent = Math.round(s.x).toLocaleString('pt-BR') + sufixo;
    });
  });
}
