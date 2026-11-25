// Live evaluation against the real Gemini API. Run: GEMINI_API_KEY=... node scripts/policy-eval.mjs
// Checks: did the right section come back in the top 4 (retrieval hit rate), and did the bot refuse when it should?
import fs from 'node:fs';
import { createRag, CONFIG } from '../lib/rag.js';
import { geminiDeps } from '../lib/gemini.js';

const key = process.env.GEMINI_API_KEY;
if (!key) { console.error('Set GEMINI_API_KEY first.'); process.exit(1); }
const chunks = JSON.parse(fs.readFileSync(new URL('../data/policy-chunks.json', import.meta.url)));
const cases = JSON.parse(fs.readFileSync(new URL('../tests/policy-eval-set.json', import.meta.url)));
const ask = createRag(chunks, geminiDeps(key));

let hit = 0, refuseOk = 0, refuseN = 0, answerN = 0, cost = 0, ms = 0;
for (const c of cases) {
  const out = await ask(c.q);
  const t = out.trace; cost += t.costUsd || 0; ms += t.latencyMs || 0;
  if (c.expect === 'refuse') { refuseN++; if (out.refused) refuseOk++; }
  else { answerN++; if (t.retrieved.slice(0, 4).some(r => r.section === c.expect)) hit++; }
  console.log(`${out.refused ? 'REFUSED' : 'ANSWERED'} | top ${t.retrieved[0].score} ${t.retrieved[0].section} | ${c.q}`);
}
console.log(`\nRetrieval hit rate (expected section in top 4): ${hit}/${answerN}`);
console.log(`Correct refusals on out-of-scope questions: ${refuseOk}/${refuseN}`);
console.log(`Total est. cost: $${cost.toFixed(5)} | Avg time: ${Math.round(ms / cases.length)} ms | Threshold: ${CONFIG.minScore}`);
console.log('Tip: if good questions are refused, lower MIN_SCORE; if off-topic ones get answered, raise it.');
