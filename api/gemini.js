// Gemini proxy with automatic model fallback.
// Tries the model the page asked for first, then the others in MODELS order.
// Moves to the next model only when a model is missing, overloaded, rate-limited or times out;
// errors that would fail on every model (no key, bad request) return straight away.
const MODELS = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];
const RETRY_NEXT = new Set([404, 408, 429, 500, 502, 503, 504]);
const TIMEOUT_MS = 8000;

async function callModel(model, prompt, apiKey) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctrl.signal,
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0, responseMimeType: 'application/json' } })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const msg = data?.error?.message || 'Gemini request failed';
      // An unknown or unsupported model name can come back as 400 too, so treat that as "try the next model".
      const modelProblem = response.status === 400 && /model|not found|not supported|unsupported/i.test(msg);
      return { ok: false, status: response.status, error: msg, next: RETRY_NEXT.has(response.status) || modelProblem };
    }
    const raw = data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
    try { return { ok: true, result: JSON.parse(raw.replace(/^```json\s*/i, '').replace(/\s*```$/, '')) }; }
    catch { return { ok: false, status: 502, error: 'Gemini returned invalid JSON', next: true }; }
  } catch (e) {
    return { ok: false, status: 504, error: e?.name === 'AbortError' ? 'Gemini timed out' : (e?.message || 'Network error'), next: true };
  } finally { clearTimeout(timer); }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in Vercel.' });
  const { prompt, model } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
  const first = MODELS.includes(model) ? model : MODELS[0];
  const order = [first, ...MODELS.filter(m => m !== first)];
  const tried = [];
  for (const m of order) {
    const r = await callModel(m, prompt, apiKey);
    if (r.ok) return res.status(200).json({ result: r.result, modelUsed: m, tried });
    tried.push(`${m}: ${r.status} ${r.error}`);
    if (!r.next) return res.status(r.status).json({ error: r.error, tried });
  }
  return res.status(503).json({ error: `All Gemini models failed (${tried.join(' | ')})`, tried });
}
