const rules = require('../../rules/complianceRules.json');

function validValue(value, validation) {
  if (typeof value !== 'string' || !value.trim()) return false;
  if (validation === 'quantity') return /\b\d+(?:\.\d+)?\s*(g|kg|ml|l|litre|liter)\b/i.test(value);
  if (validation === 'date') return /\b(?:0?[1-9]|[12]\d|3[01])[/-](?:0?[1-9]|1[0-2])[/-](?:20)?\d{2}\b|\b(?:0?[1-9]|1[0-2])[/-](?:20)?\d{2}\b/i.test(value);
  return true;
}

function evaluate(fields, ocrText, source, confidence) {
  const lines = ocrText.split(/\n+/).map(line => line.trim()).filter(Boolean);
  const results = rules.map(rule => {
    const value = fields[rule.field];
    const present = validValue(value, rule.validation);
    const status = present ? 'PASS' : 'FAIL';
    const evidence = lines.find(line => rule.evidencePatterns.some(pattern => new RegExp(pattern, 'i').test(line)));
    return { ruleId: rule.id, rule: rule.name, status, severity: rule.severity, explanation: present ? `${rule.name} detected in the extracted information.` : `${rule.requirement} No matching declaration was detected.`, detectedValue: present ? String(value) : 'Not detected', expectedRequirement: rule.requirement, evidence: evidence || `No matching ${rule.name.toLowerCase()} detected in OCR text.`, field: rule.field, points: present ? rule.points : 0 };
  });
  const score = Math.round(results.reduce((total, item) => total + item.points, 0) / rules.reduce((total, rule) => total + rule.points, 0) * 100);
  const lowConfidence = confidence < 55;
  const status = score === 100 ? 'PASS' : score >= 50 ? 'WARNING' : 'FAIL';
  return { score, status: lowConfidence && status === 'PASS' ? 'WARNING' : status, lowConfidence, violations: results.filter(item => item.status !== 'PASS'), ruleResults: results, rulesChecked: rules.length, passedRules: results.filter(item => item.status === 'PASS').length, extractionSource: source, prototypeNotice: 'Prototype Compliance Score is an AI-assisted prototype screening result, not official government certification.' };
}
module.exports = { evaluate };