// Natural voice: POST /api/tts { text, style } -> { audio: base64 WAV, mime, model, voice }
// Uses Gemini text-to-speech. Model and voice can be changed with TTS_MODELS and TTS_VOICE in Vercel.
const MODELS = (process.env.TTS_MODELS || 'gemini-3.8-flash-lite-tts,gemini-3.8-flash-tts').split(',').map(s => s.trim()).filter(Boolean);
const VOICE = process.env.TTS_VOICE || 'Sulafat'; // Gemini voice described as "Warm"
const TIMEOUT_MS = 8000;  // per attempt
const BUDGET_MS = 13000;  // whole chain; the page waits 14 s
const cache = new Map(); // repeated lines (greeting, "Is there anything else?") are served from memory

function pcmToWav(pcm, rate = 24000) {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

// Two request shapes: the current documented one, and the older prebuiltVoiceConfig one as a fallback.
function bodies(text, style) {
  return [
    { contents: [{ role: 'user', parts: [{ text, speech_metadata: { style } }] }],
      generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { voice: VOICE } } } },
    { contents: [{ role: 'user', parts: [{ text: `Say this ${style}: ${text}` }] }],
      generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } } } },
  ];
}

async function callTTS(model, body, key) {
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(body), signal: ctrl.signal,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, status: r.status, error: data?.error?.message || `TTS HTTP ${r.status}` };
    const part = (data?.candidates?.[0]?.content?.parts || []).find(p => p.inlineData?.data);
    if (!part) return { ok: false, status: 502, error: 'No audio in response' };
    let buf = Buffer.from(part.inlineData.data, 'base64');
    if (buf.subarray(0, 4).toString() !== 'RIFF') {
      const rate = Number((part.inlineData.mimeType || '').match(/rate=(\d+)/)?.[1] || 24000);
      buf = pcmToWav(buf, rate);
    }
    return { ok: true, audio: buf.toString('base64') };
  } catch (e) {
    return { ok: false, status: 504, error: e?.name === 'AbortError' ? 'TTS timed out' : (e?.message || 'Network error') };
  } finally { clearTimeout(t); }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });
  // Optional: TTS_API_KEY from a second Google project gives the voice its own quota,
  // so voice and language understanding don't use up the same free-tier limit.
  const key = process.env.TTS_API_KEY || process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'GEMINI_API_KEY is not set.' });
  const { text, style } = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body) || {};
  const clean = String(text || '').slice(0, 700).trim();
  if (!clean) return res.status(400).json({ error: 'Missing text' });
  const sty = String(style || 'in a warm, calm and natural way').slice(0, 200);
  const ck = `${VOICE}|${sty}|${clean}`;
  if (cache.has(ck)) return res.status(200).json({ ...cache.get(ck), cached: true });
  const tried = [];
  const started = Date.now();
  for (const model of MODELS) {
    for (const body of bodies(clean, sty)) {
      if (Date.now() - started > BUDGET_MS - 4000) { tried.push(`${model}: skipped (time budget used up)`); break; }
      const r = await callTTS(model, body, key);
      if (r.ok) {
        const out = { audio: r.audio, mime: 'audio/wav', model, voice: VOICE };
        if (cache.size > 100) cache.delete(cache.keys().next().value);
        cache.set(ck, out);
        return res.status(200).json(out);
      }
      tried.push(`${model}: ${r.status} ${r.error}`);
      if (r.status !== 400) break; // only a 400 suggests trying the other request shape
    }
  }
  return res.status(502).json({ error: 'Natural voice unavailable', tried });
}
