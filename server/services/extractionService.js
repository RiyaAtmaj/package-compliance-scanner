const { extractWithGrok } = require('./grokService');

const empty = { productName: null, mrp: null, netQuantity: null, manufacturer: null, manufacturingDate: null, consumerCare: null, otherDeclarations: [] };
function localExtract(text) {
  const lines = text.split(/\n+/).map(line => line.trim()).filter(Boolean);
  const find = (patterns) => lines.find(line => patterns.some(pattern => pattern.test(line))) || null;
  return { ...empty, productName: lines[0] || null, mrp: find([/m\.r\.p|mrp|maximum retail/i, /₹|rs\.?\s*\d+/i]), netQuantity: find([/net\s*(qty|quantity|weight)/i, /\b\d+(?:\.\d+)?\s*(g|kg|ml|l| litre|liter)\b/i]), manufacturer: find([/manufactur|marketed by|packed by|imported by/i]), manufacturingDate: find([/mfg|manufactur|packed on|date of pack|best before/i]), consumerCare: find([/consumer care|helpline|customer care|contact us|@|\b(1800|[6-9]\d{9})\b/i]), otherDeclarations: lines.filter(line => /ingredients|lic|fssai|batch|veg|non.?veg|best before/i.test(line)) };
}

async function extract(ocrText) {
  let fields = null; let source = 'local OCR pattern extraction';
  try { fields = await extractWithGrok(ocrText); if (fields) source = 'Grok + OCR'; } catch (error) { console.warn('Grok unavailable, using local extraction:', error.message); }
  const localFields = localExtract(ocrText);
  const grokFields = Object.fromEntries(Object.entries(fields || {}).filter(([, value]) => value !== null && value !== undefined && value !== ''));
  fields = { ...empty, ...localFields, ...grokFields };
  return { fields, source };
}

module.exports = { extract };