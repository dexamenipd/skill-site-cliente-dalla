# Solar: seções, copy e simulador

## A dor que o site resolve

Vem do script de abordagem da Dalla Labs. O site existe para isto:
- Lead do Google/Instagram esfria porque o time está na obra e ninguém responde em 5 min. O site responde por eles: simulação em 1 toque e WhatsApp com a conta já preenchida.
- Cliente residencial quer confiança antes de pedir orçamento: CREA, fotos de telhado reais, tempo de empresa, obras feitas.
- Anúncio caindo em bio do Instagram ou Linktree não converte. O site é a página de destino com prova social e payback.
- Concorrente com CTA claro ("Simulação grátis") rouba o lead. Aqui o CTA aparece em toda tela.

Nunca escreva "você não tinha site". O tom é de empresa local séria, que fala de economia e confiança.

## Seções (nesta ordem, celular primeiro)

1. **Faixa Prévia Dalla Labs** (fixa, fina, topo).
2. **Header translúcido**: logo + botão "Simular economia". Sem menu hambúrguer com 6 itens: no máximo âncoras para Simulador, Obras, Contato.
3. **Hero guiada por scroll** (ver `motion.md`): história em 3 a 4 passos, do telhado vazio à conta de luz caindo. Título com a promessa local: "Energia solar em [Cidade] com projeto, instalação e homologação". CTA primário "Simular minha economia" (rola até o simulador). CTA secundário WhatsApp.
4. **Números de confiança**: anos de empresa, obras, kWp instalados, cidades atendidas. Contadores animados. Só números do `.md`.
5. **Simulador de economia** (seção principal de conversão, ver abaixo).
6. **Antes e depois**: o mesmo telhado antes e com as placas, mesmo ângulo. O scroll abre a comparação, o dedo arrasta. Legenda com bairro, kWp e conta antes/depois quando o `.md` tiver.
7. **Como funciona**: 4 passos (visita técnica, projeto, instalação, homologação com a distribuidora), uma foto real por passo. Linha que se desenha com o scroll.
8. **Obras**: mosaico de 6 fotos reais (uma larga a cada três), legenda com cidade e kWp quando houver.
9. **Quem faz**: foto da equipe, retrato do responsável técnico com CREA, garantias, financiamento se o `.md` citar, cidades atendidas. Marcas de equipamento só em texto (sem logo de terceiro).
10. **Depoimentos**: só reais do `.md`, com foto do cliente se houver. Sem eles, troque por "Avaliações no Google" com link, ou corte.
11. **FAQ**: payback, dias nublados, manutenção, Lei 14.300 (fio B), financiamento, quanto tempo leva. Respostas curtas, sem promessa garantida.
12. **CTA final + rodapé**: foto de obra que abre até a borda, WhatsApp, cidade e região atendida, CNPJ se houver, Instagram, "Site em prévia por Dalla Labs".
13. **Botão flutuante do WhatsApp** (pulso suave, não cobre o rodapé).

## Fotos reais (espaços reservados)

O site é feito para muitas fotos reais: 16 espaços no template (hero, antes, depois, 4 passos, 6 obras, equipe, responsável, final). Cada espaço é um `[data-slot]` com `data-pedido` dizendo que foto vai ali.
- `npm run importar -- "<pasta>"` põe sozinho as fotos nomeadas como o espaço (lista em `modelo-informacoes.md`). Foto com outro nome: abra, escolha o espaço cujo pedido ela atende melhor e passe no `--mapa`. Uma foto não se repete em dois espaços.
- Toda foto tem duas versões (`x.webp` 1600 px e `x-800.webp`) por causa do `srcset`; o importador gera as duas. Copiar só uma faz o espaço aparecer vazio no celular.
- Quando a foto entra, troque o `alt="[PREENCHER]"` por uma descrição real (o que aparece, cidade).
- Foto que ainda não chegou: **mantenha o espaço**, não corte a seção. Sem arquivo, o site mostra sozinho o quadro listrado "Sua foto real aqui" com o pedido. Isso vende a prévia: o cliente vê onde entram as fotos dele.
- Nunca preencha com banco de imagem nem imagem gerada por IA como se fosse obra do cliente.
- `npm run fotos` lista os espaços com e sem foto. Cole a saída em `ENTREGA.md`, em "Fotos pedidas".
- Depoimento com foto e logo são os únicos que somem sem dado: sem depoimento real, remova a seção; sem logo, o header mostra o nome em texto.

## Copy

- PT-BR, frases curtas, verbo no começo do CTA ("Simular", "Falar no WhatsApp", "Ver obras").
- Palavras que o cliente usa: conta de luz, economia, placas, telhado, orçamento, simulação. Evite jargão (kWp só como detalhe, com explicação).
- Proibido: "o melhor", "garantido", "economia de 95%" sem fonte. Use "até", "estimativa", "média da região".
- `<title>`: "Energia solar em [Cidade] | [Empresa]". Meta description com cidade e chamada para simulação.

## Simulador de economia (sem backend)

Entrada: valor médio da conta de luz (R$), com slider e campo numérico. Opcional: tipo de ligação (mono, bi, tri).

Constantes em `src/config.js` (o `.md` do cliente pode trocar):

| Constante | Padrão | Observação |
|---|---|---|
| `tarifa` | 0.95 R$/kWh | com impostos, região SP interior |
| `hsp` | 4.8 h/dia | irradiação média Atibaia e região |
| `perdas` | 0.80 | rendimento do sistema |
| `custoKwp` | 4000 R$/kWp | faixa de mercado residencial, estimativa |
| `minimo` | mono 30, bi 50, tri 100 kWh | custo de disponibilidade |
| `fatorFioB` | 0.85 | parcela da economia após a Lei 14.300 |
| `areaPorKwp` | 5 m² | aproximado |
| `kgCo2PorKwh` | 0.07 | fator médio do grid brasileiro, aproximado |

Cálculo:
```
consumo   = conta / tarifa                      // kWh/mês
compensar = max(consumo - minimo, 0)
geracaoKwp = hsp * 30 * perdas                  // kWh/mês por kWp
kwp       = compensar / geracaoKwp
economiaMes = compensar * tarifa * fatorFioB
investimento = kwp * custoKwp
paybackAnos = investimento / (economiaMes * 12)
economia25 = economiaMes * 12 * 25 * 0.9       // margem de degradação
placas    = ceil(kwp * 1000 / 550)             // painel de 550 W
```

Saída animada (números contam ao mudar o slider, com mola): economia por mês, economia em 25 anos, sistema em kWp, número de placas, área de telhado, payback em anos, CO2 evitado. Uma barra "conta hoje vs depois" que encolhe.

Botão "Receber simulação no WhatsApp": abre `wa.me/55DDDNUMERO?text=` com a mensagem codificada:
```
Olá! Fiz a simulação no site: conta de R$ X, sistema de Y kWp (Z placas), economia estimada de R$ W/mês. Quero um orçamento.
```

Aviso abaixo do resultado, sempre visível: "Estimativa para referência. O valor final depende da visita técnica, do telhado e da tarifa da distribuidora."
