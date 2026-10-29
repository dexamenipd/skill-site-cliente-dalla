// Hero em 4 atos guiada por scroll (references/motion.md, seção 3).
// Troque a foto e os textos pelos do cliente; mantenha render(p) pura.
import { cena, tick, spring, clamp01, trecho, lerp, hash, reduzido, celular } from './motion.js';

export function hero() {
  const el = document.querySelector('.hero');
  if (!el) return;
  const $ = (s) => el.querySelector(s);
  const $$ = (s) => [...el.querySelectorAll(s)];

  const foto = $('.hero__foto');
  const sol = $('.hero__sol');
  const palavras = $$('.hero__titulo .w');
  const placas = $$('.placa');
  const fluxos = $$('.fluxo');
  const kwh = $('.hero__kwh');
  const conta = $('.hero__conta-valor');
  const contaBarra = $('.hero__conta-barra');
  const ctas = $('.hero__ctas');
  const pontos = $$('.hero__pontos i');
  const atos = $$('[data-ato]');

  const contaAntes = Number(conta?.dataset.antes || 480);
  const contaDepois = Number(conta?.dataset.depois || 60);

  fluxos.forEach((f) => {
    const L = f.getTotalLength();
    f.style.strokeDasharray = L;
    f.dataset.l = L;
  });

  if (reduzido) {
    el.classList.add('hero--estatica');
    return;
  }

  // Estado "vivo": o sol respira e as placas flutuam mesmo com o scroll parado
  let vivo = 0;
  let inicio = null;
  tick((dt, t) => { vivo = t; if (inicio === null) inicio = t; });

  cena(el, (p) => {
    // Ato 1: telhado, título palavra por palavra, sol nasce
    const a1 = trecho(p, 0, 0.25);
    if (foto) foto.style.transform = `scale(${lerp(1.08, 1, a1)}) translate3d(0, ${p * -6}%, 0)`;
    // Título entra pelo relógio ao carregar (não espera o scroll), palavra por palavra
    const desde = inicio === null ? 0 : vivo - inicio;
    palavras.forEach((w, i) => {
      const x = desde - 0.15 - i * 0.07;
      const m = spring(x, 0.8, 14);
      w.style.opacity = clamp01(spring(x, 1, 14));
      w.style.transform = `translate3d(0, ${(1 - m) * 0.6}em, 0)`;
    });
    if (sol) {
      const r = 1 + Math.sin(vivo * 1.3) * 0.04;
      const sx = lerp(-10, 70, p);
      const sy = lerp(40, 4, spring(p * 3, 1, 6));
      sol.style.transform = `translate3d(${sx}vw, ${sy}vh, 0) scale(${r})`;
    }

    // Ato 2: placas descem e encaixam com overshoot leve, em sequência
    placas.forEach((pl, i) => {
      const x = (p - 0.22 - i * 0.03) * 5;
      const m = spring(x, 0.6, 16);
      const flut = Math.sin(vivo * 2 + hash(i) * 6) * 0.6;
      pl.style.opacity = clamp01(x * 4);
      pl.style.transform = `translate3d(0, ${(1 - m) * -60 + flut}px, 0)`;
      pl.classList.toggle('placa--on', x > 0.35);
    });

    // Ato 3: energia corre das placas para a casa
    const a3 = trecho(p, 0.5, 0.72);
    fluxos.forEach((f, i) => {
      const k = clamp01(a3 * 1.3 - i * 0.1);
      f.style.strokeDashoffset = f.dataset.l * (1 - k);
    });
    if (kwh) kwh.textContent = Math.round(a3 * 620).toLocaleString('pt-BR');

    // Ato 4: conta de luz cai, CTA sobe e fica
    const a4 = trecho(p, 0.72, 0.92);
    const mc = spring(a4 * 2.2, 0.9, 10);
    if (conta) conta.textContent = 'R$ ' + Math.round(lerp(contaAntes, contaDepois, mc)).toLocaleString('pt-BR');
    if (contaBarra) contaBarra.style.transform = `scaleX(${lerp(1, contaDepois / contaAntes, mc)})`;
    if (ctas) {
      // CTA entra pelo relógio logo após o título: conversão não espera o scroll
      const mx = spring(desde - 0.15 - palavras.length * 0.07, 0.85, 14);
      ctas.style.opacity = clamp01(mx);
      ctas.style.transform = `translate3d(0, ${(1 - mx) * 24}px, 0)`;
    }

    // Texto de cada ato aparece no seu trecho
    atos.forEach((at) => {
      const [a, b] = at.dataset.ato.split(',').map(Number);
      const k = trecho(p, a, a + 0.06) * (1 - trecho(p, b - 0.04, b));
      at.style.opacity = k;
      at.style.transform = `translate3d(0, ${(1 - k) * 16}px, 0)`;
    });

    const ativo = Math.min(3, Math.floor(p * 4));
    pontos.forEach((pt, i) => pt.classList.toggle('on', i === ativo));
  }, 'pin');

  if (celular) el.classList.add('hero--celular');
}

// Signature contínua: o sol pequeno atravessa a página inteira com o scroll global
export function solGlobal() {
  const s = document.querySelector('.sol-global');
  if (!s || reduzido) return;
  const st = { x: 0, v: 0 };
  tick((dt, t) => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const alvo = max > 0 ? scrollY / max : 0;
    // springStep inline para não importar o estado de fora
    const f = 120 * (alvo - st.x) - 2 * 11 * st.v;
    st.v += f * dt; st.x += st.v * dt;
    const y = st.x * (innerHeight - 80);
    const x = Math.sin(st.x * Math.PI) * 18;
    s.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${t * 20}deg)`;
  });
}
