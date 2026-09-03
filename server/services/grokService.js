async function extractWithGrok(ocrText) {
  if (!process.env.GROK_API_KEY) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.GROK_API_KEY}` }, signal: controller.signal,
      body: JSON.stringify({ model: 'grok-3-mini', temperature: 0, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: 'Extract package label fields from OCR. Return only JSON with fields productName, mrp, netQuantity, manufacturer, manufacturingDate, consumerCare, otherDeclarations. Use null when absent. Never decide compliance.' }, { role: 'user', content: ocrText }] })
    });
    if (!response.ok) throw new Error(`Grok API returned ${response.status}.`);
    const payload = await response.json();
    return JSON.parse(payload.choices?.[0]?.message?.content || '{}');
  } finally { clearTimeout(timeout); }
}

module.exports = { extractWithGrok };