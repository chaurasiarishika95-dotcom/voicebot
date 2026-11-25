// Thin wrappers around the Gemini REST API (no SDK needed).
import { CONFIG } from './rag.js';
const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

async function call(path, body, key) {
  const r = await fetch(`${BASE}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error?.message || `Gemini HTTP ${r.status}`);
  return data;
}

export function geminiDeps(key) {
  const embed = async (texts, taskType) => {
    const out = [];
    for (let i = 0; i < texts.length; i += 100) { // API limit: 100 per batch
      const data = await call(`${CONFIG.embedModel}:batchEmbedContents`, {
        requests: texts.slice(i, i + 100).map(text => ({
          model: `models/${CONFIG.embedModel}`,
          content: { parts: [{ text }] },
          taskType,
          outputDimensionality: CONFIG.dims,
        })),
      }, key);
      out.push(...data.embeddings.map(e => e.values));
    }
    return out;
  };
  return {
    embedDocs: (texts) => embed(texts, 'RETRIEVAL_DOCUMENT'),
    embedQuery: async (text) => (await embed([text], 'RETRIEVAL_QUERY'))[0],
    generate: async (model, system, user) => {
      const data = await call(`${model}:generateContent`, {
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 400 },
      }, key);
      const text = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
      if (!text) throw new Error('Empty response');
      return { text, usage: data.usageMetadata };
    },
  };
}
