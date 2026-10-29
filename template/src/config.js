// Dados do cliente. Preencha só com o que está em informações-relevantes-do-cliente.md.
// O que faltar fica como "[PREENCHER: ...]" e entra no relatório.

// Faixa "Prévia Dalla Labs". Só o usuário desliga, depois do Pix.
export const PREVIA = true;

export const CLIENTE = {
  empresa: '[PREENCHER: nome da empresa]',
  cidade: 'Atibaia',
  regiao: 'Atibaia e região',
  // Só dígitos: 55 + DDD + número
  whatsapp: '5511900000000',
  instagram: '',
  crea: '',
};

// Números de confiança. Apague o item que não tiver fonte no .md.
export const NUMEROS = [
  { valor: 0, sufixo: '+', label: 'anos instalando energia solar' },
  { valor: 0, sufixo: '', label: 'obras entregues' },
  { valor: 0, sufixo: ' kWp', label: 'instalados na região' },
];

// Simulador: constantes de references/solar.md. O .md do cliente pode trocar.
export const SIMULADOR = {
  tarifa: 0.95,
  hsp: 4.8,
  perdas: 0.8,
  custoKwp: 4000,
  minimo: { mono: 30, bi: 50, tri: 100 },
  fatorFioB: 0.85,
  areaPorKwp: 5,
  kgCo2PorKwh: 0.07,
  potenciaPlaca: 550,
  contaPadrao: 450,
  contaMin: 100,
  contaMax: 3000,
};

export function linkWhatsApp(texto) {
  return `https://wa.me/${CLIENTE.whatsapp}?text=${encodeURIComponent(texto)}`;
}
