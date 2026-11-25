// Vercel serverless function: POST /api/policy  { "question": "..." }  — answers travel-policy questions from docs/policies (RAG)
import fs from 'node:fs';
import path from 'node:path';
import { createRag } from '../lib/rag.js';
import { geminiDeps } from '../lib/gemini.js';

const chunks = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'policy-chunks.json'), 'utf8'));
let ask = null;

// Best-effort limit per warm instance: 20 questions per minute per IP.
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter(t => now - t < 60_000);
  list.push(now); hits.set(ip, list);
  return list.length > 20;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'GEMINI_API_KEY is not set on the server.' });
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || 'local';
  if (limited(ip)) return res.status(429).json({ error: 'Too many questions. Please wait a minute.' });
  try {
    ask ||= createRag(chunks, geminiDeps(key));
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const out = await ask(body.question);
    if (out.error) return res.status(400).json(out);
    res.status(200).json(out);
  } catch (e) {
    res.status(502).json({ error: 'The AI service did not respond. Please try again.', detail: String(e.message || e) });
  }
}
