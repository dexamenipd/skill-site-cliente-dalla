// Checagem automática antes do push (parte de references/checklist.md).
// Uso: npm run checar   (sai com erro se algum item obrigatório falhar)
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';

const ler = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
const html = ler('index.html');
const config = ler('src/config.js');
const vercel = ler('vercel.json');
const robots = ler('public/robots.txt');
const semComentario = html.replace(/<!--[\s\S]*?-->/g, '');
const final = /PREVIA\s*=\s*false/.test(config);

let falhas = 0;
const ok = (cond, msg, obrigatorio = true) => {
  if (cond) return console.log(`[OK]    ${msg}`);
  if (obrigatorio) falhas++;
  console.log(`${obrigatorio ? '[FALHA]' : '[AVISO]'} ${msg}`);
};

console.log(final ? 'Modo: versão final\n' : 'Modo: prévia\n');
if (!final) {
  ok(/PREVIA\s*=\s*true/.test(config), 'PREVIA = true em src/config.js');
  ok(html.includes('class="previa"'), 'faixa "Prévia Dalla Labs" no index.html');
  ok(/<meta name="robots" content="noindex, nofollow">/.test(html), 'meta robots noindex no index.html');
  ok(/Disallow:\s*\/\s*$/m.test(robots), 'robots.txt com Disallow: /');
  ok(vercel.includes('X-Robots-Tag'), 'vercel.json com X-Robots-Tag noindex');
}

ok(!/cliente-dalla-labs-N\b/.test(html), 'og:url e og:image com o número N real (não "cliente-dalla-labs-N")');
ok(existsSync('public/og.jpg'), 'public/og.jpg existe (cartão do link no WhatsApp)');
ok(!/whatsapp:\s*'5511900000000'/.test(config), 'WhatsApp real em src/config.js');
ok(/whatsapp:\s*'55\d{10,11}'/.test(config), 'WhatsApp só com dígitos: 55 + DDD + número');
ok(!/empresa:\s*'\[PREENCHER/.test(config), 'nome da empresa em src/config.js');
ok(!/\[(Cidade|Empresa)\]/.test(semComentario), 'sem [Cidade] ou [Empresa] sobrando no index.html');
ok(existsSync('public/favicon.png') && existsSync('public/apple-touch-icon.png'), 'favicon e apple-touch-icon', false);
ok(existsSync('public/img/logo.webp'), 'logo em public/img/logo.webp (sem ele o header mostra o nome em texto)', false);

const titulo = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
ok(titulo.length >= 30 && titulo.length <= 65, `<title> com ${titulo.length} caracteres (30 a 65)`, false);
const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
ok(desc.length >= 120 && desc.length <= 160 && !desc.includes('PREENCHER'), `meta description com ${desc.length} caracteres (120 a 160)`, false);
ok((semComentario.match(/<h1[\s>]/g) || []).length === 1, 'um H1 só');

const pendentes = (semComentario.match(/\[PREENCHER[^\]]*\]/g) || []).length + (config.match(/\[PREENCHER[^\]]*\]/g) || []).length;
ok(pendentes === 0, `${pendentes} placeholders [PREENCHER] (liste no ENTREGA.md)`, final);

const altVazio = (semComentario.match(/alt="\[PREENCHER[^"]*"/g) || []).length;
ok(!altVazio, `${altVazio} fotos com alt "[PREENCHER]" (descreva a foto quando ela chegar)`, false);

let pesadas = [];
if (existsSync('public/img')) {
  pesadas = readdirSync('public/img').filter((n) => statSync('public/img/' + n).size > 450 * 1024);
}
ok(pesadas.length === 0, `imagens até 450 KB${pesadas.length ? ': ' + pesadas.join(', ') : ''}`, false);

const segredo = /(ghp_|github_pat_|sk-[a-zA-Z0-9]{20}|AKIA[0-9A-Z]{16}|vercel_[a-zA-Z0-9]{20})/;
ok(!segredo.test(html + config + vercel), 'nenhum token ou segredo no código');

console.log(falhas ? `\n${falhas} item(ns) obrigatório(s) falhando.` : '\nObrigatórios ok.');
process.exit(falhas ? 1 : 0);
