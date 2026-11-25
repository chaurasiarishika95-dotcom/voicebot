// Splits docs/policies/*.md into chunks by "## " section and writes data/policy-chunks.json.
// Run: node scripts/build-policy-chunks.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const docsDir = path.join(root, 'docs', 'policies');
const MAX_WORDS = 180;
const chunks = [];

for (const file of fs.readdirSync(docsDir).filter(f => f.endsWith('.md')).sort()) {
  const text = fs.readFileSync(path.join(docsDir, file), 'utf8');
  const title = (text.match(/^# (.+)$/m) || [, file])[1].trim();
  const sections = text.split(/^## /m).slice(1);
  for (const sec of sections) {
    const [headLine, ...rest] = sec.split('\n');
    const body = rest.join('\n').trim().replace(/\n+/g, ' ');
    const words = body.split(/\s+/);
    for (let i = 0; i < words.length; i += MAX_WORDS) {
      const part = words.slice(i, i + MAX_WORDS).join(' ');
      chunks.push({
        id: `${file.replace('.md', '')}#${chunks.length}`,
        source: title,
        section: headLine.trim(),
        text: `${title} — ${headLine.trim()}: ${part}`,
      });
    }
  }
}
fs.mkdirSync(path.join(root, 'data'), { recursive: true });
fs.writeFileSync(path.join(root, 'data', 'policy-chunks.json'), JSON.stringify(chunks, null, 2));
console.log(`Wrote ${chunks.length} chunks`);
