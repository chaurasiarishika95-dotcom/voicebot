export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in Vercel.' });
  try {
    const { prompt, model = 'gemini-3.8-flash' } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
    const allowedModels = new Set(['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite']);
    const safeModel = allowedModels.has(model) ? model : 'gemini-3.8-flash';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(safeModel)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0, responseMimeType: 'application/json' } })
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || 'Gemini request failed' });
    const raw = data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
    let result;
    try { result = JSON.parse(raw.replace(/^```json\s*/i, '').replace(/\s*```$/, '')); }
    catch { return res.status(502).json({ error: 'Gemini returned invalid JSON' }); }
    return res.status(200).json({ result });
  } catch (error) { return res.status(500).json({ error: error?.message || 'Server error' }); }
}
