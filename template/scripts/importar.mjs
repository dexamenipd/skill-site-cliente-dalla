// Importa as fotos da pasta do cliente para os espaços do site.
// Uso: npm run importar -- "<pasta do cliente>" [--mapa mapa.json]
// - Arquivo com o nome do espaço (hero.jpg, obra-1.png...) entra sozinho.
// - Outros nomes: passe um mapa.json {"IMG_1234.jpg": "obra-1"} depois de olhar as fotos.
// Gera public/img/<espaço>.webp (até 1600 px) e <espaço>-800.webp, o logo,
// favicon, apple-touch-icon e public/og.jpg (cartão do link no WhatsApp).
import { readFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const pasta = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--mapa');
const iMapa = args.indexOf('--mapa');
const mapa = iMapa >= 0 ? JSON.parse(readFileSync(args[iMapa + 1], 'utf8')) : {};
if (!pasta || !existsSync(pasta)) {
  console.error('Uso: npm run importar -- "<pasta do cliente>" [--mapa mapa.json]');
  process.exit(1);
}

const html = readFileSync('index.html', 'utf8').replace(/<!--[\s\S]*?-->/g, '');
const espacos = [...html.matchAll(/data-slot="([^"]+)"/g)].map((m) => m[1]);
const validos = new Set([...espacos, 'logo']);

const EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.avif']);
const normal = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/[\s_]+/g, '-');
function listar(dir, fundo = 0) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return fundo < 1 && n !== 'site' ? listar(p, fundo + 1) : [];
    return EXT.has(extname(n).toLowerCase()) ? [p] : [];
  });
}

const ff = (...a) => execFileSync('ffmpeg', ['-y', '-v', 'error', ...a], { stdio: 'inherit' });
mkdirSync('public/img', { recursive: true });

const feitos = new Map();
const sobra = [];
for (const arq of listar(pasta)) {
  const nome = basename(arq);
  const alvo = mapa[nome] || normal(basename(arq, extname(arq)));
  if (!validos.has(alvo)) { sobra.push(nome); continue; }
  if (feitos.has(alvo)) { console.warn(`! ${nome}: o espaço ${alvo} já recebeu ${feitos.get(alvo)}, ignorado`); continue; }
  if (alvo === 'logo') {
    ff('-i', arq, '-vf', "scale=-2:'min(160,ih)'", '-q:v', '90', 'public/img/logo.webp');
    ff('-i', arq, '-vf', 'scale=64:64:force_original_aspect_ratio=decrease,pad=64:64:-1:-1:color=0x00000000', 'public/favicon.png');
    ff('-i', arq, '-vf', 'scale=150:150:force_original_aspect_ratio=decrease,pad=180:180:-1:-1:color=white', 'public/apple-touch-icon.png');
  } else {
    ff('-i', arq, '-vf', "scale='min(1600,iw)':-2", '-q:v', '78', `public/img/${alvo}.webp`);
    ff('-i', arq, '-vf', "scale='min(800,iw)':-2", '-q:v', '74', `public/img/${alvo}-800.webp`);
  }
  feitos.set(alvo, nome);
  console.log(`ok ${alvo} <- ${nome}`);
}

// Cartão do link (1200x630): a melhor foto disponível, recortada no centro
const capa = ['hero', 'obra-1', 'depois', 'final'].find((e) => feitos.has(e));
if (capa) {
  ff('-i', `public/img/${capa}.webp`, '-vf', 'scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630', '-q:v', '3', 'public/og.jpg');
  console.log(`ok og.jpg <- ${capa}`);
} else {
  console.warn('! sem foto para o og.jpg: o link no WhatsApp vai aparecer sem imagem');
}

if (sobra.length) console.log(`\nSem espaço (renomeie ou use --mapa): ${sobra.join(', ')}`);
const faltam = espacos.filter((e) => !feitos.has(e));
console.log(`\n${feitos.size} importadas. Espaços reservados (sem foto): ${faltam.join(', ') || 'nenhum'}`);
