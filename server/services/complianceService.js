const rules = require('../../rules/complianceRules.json');

function evaluate(fields, ocrText, source) {
  const results = rules.map(rule => {
    const value = fields[rule.field];
    const present = typeof value === 'string' ? value.trim().length > 0 : Array.isArray(value) ? value.length > 0 : Boolean(value);
    const status = present ? 'PASS' : 'FAIL';
    return { ruleId: rule.id, rule: rule.name, status, explanation: present ? `${rule.name} detected in the extracted information.` : `${rule.description} No matching declaration was detected.`, evidence: present ? String(value) : 'No matching OCR evidence', field: rule.field };
  });
  const score = Math.round(results.reduce((total, item, index) => total + (item.status === 'PASS' ? rules[index].points : 0), 0) / rules.reduce((total, rule) => total + rule.points, 0) * 100);
  return { score, status: score >= 80 ? 'PASS' : score >= 50 ? 'WARNING' : 'FAIL', violations: results.filter(item => item.status !== 'PASS'), ruleResults: results, extractionSource: source, prototypeNotice: 'This is a prototype screening score, not an official government compliance determination.' };
}
module.exports = { evaluate };