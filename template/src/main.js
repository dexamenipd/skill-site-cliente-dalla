import './style.css';
import { PREVIA, CLIENTE, linkWhatsApp } from './config.js';
import { iniciar, revelacoes, contadores, cena, tick, scrollTo, trecho, reduzido } from './motion.js';
import { hero, solGlobal } from './hero.js';
import { simulador } from './simulador.js';
import { slots, revelarFotos, titulos, antesDepois, finalAbre } from './imagens.js';

if (!PREVIA) document.querySelector('.previa')?.remove();

// Todo link de WhatsApp sai do config
document.querySelectorAll('[data-whats]').forEach((a) => {
  a.href = linkWhatsApp(a.dataset.whats || `Olá! Vim pelo site da ${CLIENTE.empresa} e quero um orçamento de energia solar.`);
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
});

// Âncoras com scroll suave do Lenis
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const alvo = a.getAttribute('href');
    if (alvo.length < 2) return;
    e.preventDefault();
    scrollTo(alvo);
  });
});

slots();
titulos();
iniciar();
hero();
solGlobal();
revelacoes();
contadores();
simulador();
revelarFotos();
antesDepois();
finalAbre();

// Como funciona: linha se desenha com o scroll, cada passo acende quando a linha chega
const passos = document.querySelector('.passos');
if (passos) {
  const linha = passos.querySelector('.passos__linha');
  const itens = [...passos.querySelectorAll('.passo')];
  cena(passos, (p) => {
    const k = trecho(p, 0.15, 0.7);
    linha.style.transform = `scaleY(${k})`;
    itens.forEach((it, i) => it.classList.toggle('on', k >= i / itens.length + 0.02));
  });
}

// Botão flutuante: pulso com mola a cada ~2,5 s, para enquanto há toque na tela
const flutuante = document.querySelector('.whats-flutuante');
if (flutuante && !reduzido) {
  let tocando = false;
  addEventListener('pointerdown', () => { tocando = true; });
  addEventListener('pointerup', () => { tocando = false; });
  tick((dt, t) => {
    const fase = (t % 2.5) / 2.5;
    const s = tocando ? 1 : 1 + Math.max(0, Math.sin(fase * Math.PI * 2)) * 0.06 * (fase < 0.5 ? 1 : 0);
    flutuante.style.transform = `scale(${s})`;
  });
}

// Header ganha material quando a página rola
const header = document.querySelector('.header');
tick(() => header?.classList.toggle('header--solido', scrollY > 24));

document.querySelector('.ano').textContent = new Date().getFullYear();
