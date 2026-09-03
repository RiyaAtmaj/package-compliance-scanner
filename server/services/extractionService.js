const { extractWithGrok } = require('./grokService');

const empty = { productName: null, mrp: null, visiblePrice: null, netQuantity: null, manufacturer: null, manufacturingDate: null, expiryBestBefore: null, batchLot: null, consumerCare: null, otherDeclarations: [] };
function localExtract(text) {
  const lines = text.split(/\n+/).map(line => line.trim()).filter(Boolean);
  const find = (patterns) => lines.find(line => patterns.some(pattern => pattern.test(line))) || null;
  return { ...empty, productName: lines[0] || null, mrp: find([/m\.r\.p|\bmrp\b|maximum retail/i]), visiblePrice: find([/₹|rs\.?\s*\d+/i]), netQuantity: find([/net\s*(qty|quantity|weight)/i, /\b\d+(?:\.\d+)?\s*(g|kg|ml|l| litre|liter)\b/i]), manufacturer: find([/manufactur|marketed by|packed by|imported by/i]), manufacturingDate: find([/\b(mfg|mfd|packed on|date of pack)\b/i]), expiryBestBefore: find([/expiry|best before|use by/i]), batchLot: find([/batch|lot no/i]), consumerCare: find([/consumer care|helpline|customer care|contact us|@|\b(1800|[6-9]\d{9})\b/i]), otherDeclarations: lines.filter(line => /ingredients|lic|fssai|veg|non.?veg/i.test(line)) };
}

function normalize(value, array = false) {
  if (array) return Array.isArray(value) ? value.filter(item => typeof item === 'string').slice(0, 20) : [];
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 500) : null;
}

function validateFields(candidate) {
  return { ...empty, productName: normalize(candidate?.productName), mrp: normalize(candidate?.mrp), visiblePrice: normalize(candidate?.visiblePrice), netQuantity: normalize(candidate?.netQuantity), manufacturer: normalize(candidate?.manufacturer), manufacturingDate: normalize(candidate?.manufacturingDate), expiryBestBefore: normalize(candidate?.expiryBestBefore), batchLot: normalize(candidate?.batchLot), consumerCare: normalize(candidate?.consumerCare), otherDeclarations: normalize(candidate?.otherDeclarations, true) };
}

async function extract(ocrText) {
  let fields = null; let source = 'local OCR pattern extraction';
  try { fields = await extractWithGrok(ocrText); if (fields) source = 'Grok + OCR'; } catch (error) { console.warn('Grok unavailable, using local extraction:', error.message); }
  const localFields = localExtract(ocrText);
  fields = validateFields({ ...localFields, ...(fields || {}) });
  return { fields, source };
}

module.exports = { extract };