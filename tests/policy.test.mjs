// Offline tests for the policy RAG layer, with a fake embedder (no API key needed). Run: npm test
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createRag, CONFIG, REFUSAL } from '../lib/rag.js';

const chunks = JSON.parse(fs.readFileSync(new URL('../data/policy-chunks.json', import.meta.url)));
const STOP = new Set('the a an and of to in on for with is are was what how can i my do does it be or at by from much many when'.split(' '));
const fakeEmbed = (t) => { const v = new Array(256).fill(0); for (const w of t.toLowerCase().match(/[a-z0-9]+/g) || []) { if (STOP.has(w)) continue; let h = 0; for (const c of w) h = (h * 31 + c.charCodeAt(0)) >>> 0; v[h % 256] += 1; } return v; };
let calls = [];
const deps = (opts = {}) => ({
  embedDocs: async (ts) => ts.map(fakeEmbed),
  embedQuery: async (t) => fakeEmbed(t),
  generate: async (model) => {
    calls.push(model);
    if (opts.failFirst && model === CONFIG.models[0]) throw new Error('boom');
    return { text: opts.reply || 'You can carry a 7 kg cabin bag and check in 15 kg.', usage: { promptTokenCount: 400, candidatesTokenCount: 30 } };
  },
});
let pass = 0;
const test = async (name, fn) => { await fn(); pass++; console.log('PASS', name); };

await test('baggage question finds the baggage section', async () => {
  CONFIG.minScore = 0.1;
  const out = await createRag(chunks, deps())('baggage allowance cabin bag kg');
  assert.equal(out.trace.retrieved[0].section, 'Baggage allowance (luggage)');
});
await test('hotel check-in question finds the hotel times section', async () => {
  const out = await createRag(chunks, deps())('hotel check-in check-out time');
  assert.equal(out.trace.retrieved[0].section, 'Hotel check-in and check-out times');
});
await test('off-topic question is refused without calling the model', async () => {
  CONFIG.minScore = 0.99; calls = [];
  const out = await createRag(chunks, deps())('can I bring my dog');
  assert.equal(out.refused, true); assert.equal(out.answer, REFUSAL); assert.equal(calls.length, 0);
});
await test('model saying the context lacks the answer is treated as a refusal', async () => {
  CONFIG.minScore = 0.1;
  const out = await createRag(chunks, deps({ reply: REFUSAL }))('visa rules for travel abroad');
  assert.equal(out.refused, true);
});
await test('falls back to the second model', async () => {
  calls = [];
  const out = await createRag(chunks, deps({ failFirst: true }))('web check-in opens');
  assert.deepEqual(calls, CONFIG.models.slice(0, 2)); assert.equal(out.trace.fallbackUsed, true);
});
console.log(`\n${pass} tests passed`);
