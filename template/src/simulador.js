// Simulador de economia (references/solar.md). Sem backend: resultado vai para o WhatsApp.
import { SIMULADOR as S, linkWhatsApp } from './config.js';
import { tick, springStep, reduzido } from './motion.js';

export function calcular(conta, ligacao = 'bi') {
  const consumo = conta / S.tarifa;
  const compensar = Math.max(consumo - S.minimo[ligacao], 0);
  const geracaoKwp = S.hsp * 30 * S.perdas;
  const kwp = compensar / geracaoKwp;
  const economiaMes = compensar * S.tarifa * S.fatorFioB;
  const investimento = kwp * S.custoKwp;
  return {
    consumo,
    kwp,
    economiaMes,
    economia25: economiaMes * 12 * 25 * 0.9,
    investimento,
    payback: economiaMes > 0 ? investimento / (economiaMes * 12) : 0,
    placas: Math.ceil((kwp * 1000) / S.potenciaPlaca),
    area: kwp * S.areaPorKwp,
    co2Ano: (compensar * 12 * S.kgCo2PorKwh) / 1000,
    contaDepois: conta - economiaMes,
  };
}

const brl = (v) => 'R$ ' + Math.round(v).toLocaleString('pt-BR');
const num = (v, d = 0) => v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });

export function simulador() {
  const raiz = document.querySelector('.sim');
  if (!raiz) return;
  const range = raiz.querySelector('.sim__range');
  const campo = raiz.querySelector('.sim__campo');
  const ligacoes = raiz.querySelectorAll('[name="ligacao"]');
  const botao = raiz.querySelector('.sim__whats');
  const grade = raiz.querySelector('.sim__placas');
  const barraDepois = raiz.querySelector('.sim__barra-depois');
  const out = Object.fromEntries(
    [...raiz.querySelectorAll('[data-out]')].map((el) => [el.dataset.out, el]),
  );

  range.min = S.contaMin; range.max = S.contaMax; range.step = 10;
  range.value = S.contaPadrao; campo.value = S.contaPadrao;

  // Cada número segue o alvo com mola (interrompível, parte do valor atual)
  const molas = {};
  let alvo = calcular(S.contaPadrao);

  const formatos = {
    economiaMes: brl,
    economia25: brl,
    kwp: (v) => num(v, 1) + ' kWp',
    placas: (v) => num(Math.round(v)),
    area: (v) => num(Math.round(v)) + ' m²',
    payback: (v) => num(v, 1) + ' anos',
    co2Ano: (v) => num(v, 1) + ' t/ano',
    contaDepois: brl,
  };

  function ligacao() {
    return [...ligacoes].find((r) => r.checked)?.value || 'bi';
  }

  function atualizar(conta) {
    conta = Math.min(S.contaMax, Math.max(S.contaMin, Number(conta) || S.contaMin));
    alvo = calcular(conta, ligacao());
    alvo.conta = conta;
    if (reduzido) for (const k in formatos) if (out[k]) out[k].textContent = formatos[k](alvo[k]);
    desenharPlacas(alvo.placas);
    barraDepois.style.setProperty('--k', Math.max(0.04, alvo.contaDepois / conta));
    botao.href = linkWhatsApp(
      `Olá! Fiz a simulação no site: conta de ${brl(conta)}, sistema de ${num(alvo.kwp, 1)} kWp ` +
      `(${alvo.placas} placas), economia estimada de ${brl(alvo.economiaMes)}/mês. Quero um orçamento.`,
    );
  }

  function desenharPlacas(n) {
    n = Math.min(n, 40);
    while (grade.children.length < n) {
      const i = document.createElement('i');
      i.style.setProperty('--d', `${grade.children.length * 18}ms`);
      grade.appendChild(i);
    }
    [...grade.children].forEach((c, i) => c.classList.toggle('on', i < n));
  }

  range.addEventListener('input', () => { campo.value = range.value; atualizar(range.value); });
  campo.addEventListener('input', () => { range.value = campo.value; atualizar(campo.value); });
  ligacoes.forEach((r) => r.addEventListener('change', () => atualizar(range.value)));

  if (!reduzido) {
    tick((dt) => {
      for (const k in formatos) {
        if (!out[k]) continue;
        const m = (molas[k] ||= { x: 0, v: 0 });
        const antes = m.x;
        springStep(m, alvo[k], dt, 1, 11);
        if (m.x !== antes) out[k].textContent = formatos[k](m.x);
      }
    });
  }

  atualizar(S.contaPadrao);
}
