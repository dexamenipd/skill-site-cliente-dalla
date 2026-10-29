// Versão final, DEPOIS DO PIX. Só o dono da Dalla Labs roda este script; a skill nunca roda.
// Uso: npm run versao-final -- --confirmo-pix
// Tira a faixa de prévia e o noindex (index.html, config, robots.txt, vercel.json),
// cria o sitemap, roda o build e, se for um repositório Git, faz commit e push
// (a Vercel publica sozinha a partir do push).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

if (!process.argv.includes('--confirmo-pix')) {
  console.error('Só depois do Pix. Rode: npm run versao-final -- --confirmo-pix');
  process.exit(1);
}

const trocar = (arq, fn) => {
  const antes = readFileSync(arq, 'utf8');
  const depois = fn(antes);
  if (depois !== antes) { writeFileSync(arq, depois); console.log(`ok ${arq}`); }
};

let html = readFileSync('index.html', 'utf8');
const url = ((html.match(/<meta property="og:url" content="([^"]+)"/) || [])[1] || '').replace(/\/$/, '');
if (!url || /cliente-dalla-labs-N\b/.test(url)) {
  console.error('og:url ainda não tem o link real. Corrija no index.html antes.');
  process.exit(1);
}

// Versão final não sai com placeholder: confere antes de mexer em qualquer arquivo
const textos = html.replace(/<!--[\s\S]*?-->/g, '') + readFileSync('src/config.js', 'utf8');
const pendentes = [...new Set(textos.match(/\[(PREENCHER[^\]]*|Cidade|Empresa)\]/g) || [])];
if (pendentes.length) {
  console.error(`Ainda há ${pendentes.length} placeholder(s). Preencha antes da versão final:\n- ${pendentes.join('\n- ')}`);
  process.exit(1);
}

const rodar = (cmd, erro) => {
  try { execSync(cmd, { stdio: 'inherit' }); } catch { console.error(`\n${erro}`); process.exit(1); }
};

trocar('src/config.js', (s) => s.replace(/PREVIA\s*=\s*true/, 'PREVIA = false'));
trocar('index.html', (s) => s
  .replace(/\s*<!-- Prévia:[^>]*-->/, '')
  .replace(/\s*<meta name="robots" content="noindex, nofollow">/, '')
  .replace(/\s*<div class="previa"[^>]*>[\s\S]*?<\/div>/, '')
  .replace('Site em prévia por Dalla Labs', 'Site por Dalla Labs'));
trocar('public/robots.txt', () => `User-agent: *\nAllow: /\n\nSitemap: ${url}/sitemap.xml\n`);
trocar('vercel.json', (s) => {
  const j = JSON.parse(s);
  for (const r of j.headers || []) r.headers = r.headers.filter((h) => h.key !== 'X-Robots-Tag');
  return JSON.stringify(j, null, 2) + '\n';
});
const hoje = new Date().toISOString().slice(0, 10);
writeFileSync('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${url}/</loc><lastmod>${hoje}</lastmod></url>\n</urlset>\n`);
console.log('ok public/sitemap.xml');

// Build antes de qualquer push: build quebrado não sobe
rodar('npm run build', 'Build falhou: nada foi enviado. Corrija e rode de novo.');
rodar('node scripts/checar.mjs', 'Checagem falhou: nada foi enviado. Corrija e rode de novo.');

if (existsSync('.git')) {
  rodar('git add -A', 'git add falhou.');
  rodar('git commit -m "Versão final: tira a prévia e libera indexação"', 'git commit falhou.');
  rodar('git push', 'git push falhou: o commit ficou local.');
  console.log(`\nPublicado. Confira ${url} em aba anônima e cadastre no Search Console.`);
} else {
  console.log('\nSem Git nesta pasta: publique com "npx vercel@latest deploy --prod".');
}
