# Policy Q&A (RAG) added to the voice assistant

The voice bot now answers **travel policy questions** (baggage, check-in, ID, name corrections, class of travel, approval limits, hotel limits and times, refunds, meal allowance, cabs, insurance) from the policy documents, instead of handing every such question to the travel desk.

## How it fits the existing bot
- The bot stays a **task bot**: rules still decide every action (cancel, reschedule, refund). The new layer only **explains policy**. It never acts on a booking.
- Gemini's language-understanding step has a new intent, **POLICY**. The rule-based fallback also recognises policy questions, so it works even when the AI is down.
- `POST /api/policy` runs the RAG pipeline:
  1. The 15 policy sections (`docs/policies/*.md` → `data/policy-chunks.json`) are embedded with **gemini-embedding-001**.
  2. The question is embedded and matched by **cosine similarity**; the top 3 sections are kept.
  3. **Guardrail:** if the best match is below `MIN_SCORE` (default 0.55), the model is not called, and the bot hands over to the travel desk with a `policy_not_covered` ticket.
  4. Only sections above the bar go into the prompt (≈1,500-token budget). The model (same list as `api/gemini.js`, with automatic fallback) answers in 1 to 3 spoken sentences, using only those sections.
  5. If the model says the sections don't answer the question, that is also treated as "not covered" and handed over.
- **If `/api/policy` is down**, the page falls back to keyword matching over the same sections, so policy answers still work.
- In Hinglish mode, the answer goes through the existing Hinglish rewrite with the number guard, so amounts and limits never change.
- The agent console has a new **Policy lookup (RAG)** card showing the sections found, their scores, the model, tokens, estimated cost, time and why it refused.

## Files added or changed
- `index.html`: POLICY intent, `policyAnswer()`, keyword fallback, console card, help panel row, greeting
- `api/policy.js`, `lib/rag.js`, `lib/gemini.js`: RAG service
- `policies.html`: a page listing every policy section the bot answers from (linked from the help panel and the console card)
- `docs/policies/*.md`: **sample** policy for "ABC Company" (made-up data, like the bookings)
- `scripts/build-policy-chunks.mjs`, `data/policy-chunks.json`
- `tests/policy.test.mjs` (offline, `npm test`), `scripts/policy-eval.mjs` + `tests/policy-eval-set.json` (live, 18 questions)
- `package.json`, `vercel.json`

## Test it
- Offline: `npm test`
- Live (needs `GEMINI_API_KEY`): `node scripts/policy-eval.mjs`. Lower `MIN_SCORE` if good questions are refused; raise it if off-topic ones get answered. Set `MIN_SCORE` in Vercel's environment variables.
- If Google renames the models, set `POLICY_MODELS` (comma-separated) and `EMBED_MODEL` in Vercel.

---

# Natural voice and call ambience

## What changed
- **Natural voice:** replies are spoken by Gemini text-to-speech (`api/tts.js`) instead of the browser voice. Default model `gemini-3.8-flash-lite-tts` (Google's lower-latency option for voice agents), with `gemini-3.8-flash-tts` as fallback, and the voice **Sulafat** (described by Google as "Warm"). Change them with `TTS_MODELS` and `TTS_VOICE` in Vercel. Repeated lines are cached in memory, so they cost nothing the second time.
- **Pronunciation:** before speaking, booking references are read letter by letter (A B C 1 0 0 1), BLR/DEL/BOM/HYD become city names, ₹6,000 becomes "6,000 rupees", 13:45 becomes "1:45 PM", 2026-10-07 becomes "7 October", kg becomes "kilos", and option lists become "Option 1, …".
- **Natural pauses:** `<short pause>` tags between paragraphs and before the closing question, plus a style instruction: warm, calm, relaxed pace, small pauses between sentences.
- **Call ambience** (toggle): a faint office room tone and murmur, made in the browser with the Web Audio API (no audio files), and keyboard typing sounds while the assistant looks things up. This also covers the 1–2 second wait for the voice.
- **Phone-line sound** (toggle): filters the voice to sound like a phone call.
- **Fallback:** if `/api/tts` fails, the browser voice is used and the decision trail notes it.
- **Interrupting:** pressing Speak while the bot is talking stops the natural voice, just like before.
- **Disclosure:** the greeting now says "I'm the virtual assistant". A human-sounding voice should never hide that the caller is talking to a bot.

## Test it
Deploy and click **Start call**: the greeting should come in the natural voice, with faint background sound. Try "What is the baggage allowance?" and "Move my Hyderabad flight to next week". If you hear the browser voice instead, the decision trail shows the reason (for example a wrong model name). Set `TTS_MODELS` to a model your key can use.
