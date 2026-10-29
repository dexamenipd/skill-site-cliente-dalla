// Lista os espaços de foto do site e diz quais já têm arquivo em public/img.
// Uso: npm run fotos  (a saída vai para o ENTREGA.md, em "Fotos pedidas")
import { readFileSync, existsSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8').replace(/<!--[\s\S]*?-->/g, '');
const tag = /<[^>]*\bdata-slot="([^"]+)"[^>]*>/g;
const linhas = [];
let m;
while ((m = tag.exec(html))) {
  const pedido = (m[0].match(/data-pedido="([^"]*)"/) || [])[1] || '';
  const src = (html.slice(m.index + m[0].length).match(/<img[^>]*\bsrc="([^"]*)"/) || [])[1] || '';
  const ok = src && existsSync('public' + src) && existsSync('public' + src.replace(/\.webp$/, '-800.webp'));
  linhas.push(`- [${ok ? 'x' : ' '}] ${m[1]} (${src || 'sem src'}): ${pedido}`);
}
const faltam = linhas.filter((l) => l.startsWith('- [ ]')).length;
console.log(linhas.join('\n'));
console.log(`\n${linhas.length - faltam} de ${linhas.length} fotos no lugar, ${faltam} pedidas ao cliente.`);
