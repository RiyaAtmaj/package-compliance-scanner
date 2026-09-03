function makeReport(data) {
  const lines = ['PACKAGE COMPLIANCE SCANNER', 'Prototype inspection report', '', `Status: ${data.status}`, `Prototype Compliance Score: ${data.score}%`, `OCR confidence: ${data.confidence ?? 'n/a'}%`, '', 'EXTRACTED INFORMATION'];
  Object.entries(data.fields || {}).forEach(([key, value]) => lines.push(`${key}: ${Array.isArray(value) ? value.join('; ') : value || 'Not detected'}`));
  lines.push('', 'RULE RESULTS');
  (data.ruleResults || []).forEach(item => lines.push(`${item.ruleId} | ${item.rule} | ${item.status} | ${item.explanation}`));
  lines.push('', 'OCR TEXT', data.ocrText || 'None', '', data.prototypeNotice || 'Prototype only.');
  return lines.join('\n');
}
module.exports = { makeReport };