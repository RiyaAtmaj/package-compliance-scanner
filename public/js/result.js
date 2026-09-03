const data = JSON.parse(sessionStorage.getItem('inspection') || 'null');

if (!data) {
  location.href = '/inspection.html';
} else {
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  const labels = { productName: 'Product name', mrp: 'MRP', visiblePrice: 'Visible price', netQuantity: 'Net quantity', manufacturer: 'Manufacturer / packer / importer', manufacturingDate: 'Manufacturing / packing date', expiryBestBefore: 'Expiry / best before', batchLot: 'Batch / lot number', consumerCare: 'Consumer care', otherDeclarations: 'Other declarations' };
  const valueText = value => Array.isArray(value) ? value.join(', ') : value || 'Not detected';
  document.querySelector('#resultImage').src = data.image;
  document.querySelector('#modeBadge').textContent = data.mode === 'sample' ? 'SAMPLE DEMONSTRATION' : 'LIVE ANALYSIS';
  document.querySelector('#inspectionId').textContent = data.inspectionId || 'Inspection ID unavailable';
  document.querySelector('#inspectionDate').textContent = data.timestamp ? new Date(data.timestamp).toLocaleString() : '';
  document.querySelector('#score').textContent = `${data.score}%`;
  document.querySelector('#status').textContent = data.status;
  document.querySelector('#status').className = `status-value ${data.status.toLowerCase()}`;
  document.querySelector('#ruleSummary').textContent = `${data.passedRules}/${data.rulesChecked}`;
  document.querySelector('#confidence').textContent = `${data.confidence}%`;
  document.querySelector('#extractionSource').textContent = data.extractionSource;
  document.querySelector('#notice').textContent = data.prototypeNotice;
  document.querySelector('#ocr').textContent = data.ocrText || 'No OCR text available.';
  document.querySelector('#confidenceWarning').hidden = !data.lowConfidence;
  document.querySelector('#fields').innerHTML = Object.entries(data.fields || {}).map(([key, value]) => `<div class="field"><label>${escapeHtml(labels[key] || key)}</label><div>${escapeHtml(valueText(value))}${key === 'mrp' && !value && data.fields.visiblePrice ? '<small>Visible price found, but no explicit MRP label was detected.</small>' : ''}</div></div>`).join('');
  document.querySelector('#rules').innerHTML = (data.ruleResults || []).map(rule => `<article class="rule ${rule.status.toLowerCase()}"><div class="rule-top"><span><b>${escapeHtml(rule.ruleId)}</b> ${escapeHtml(rule.rule)}</span><strong>${escapeHtml(rule.status)}</strong></div><p>${escapeHtml(rule.explanation)}</p><dl><div><dt>Detected</dt><dd>${escapeHtml(rule.detectedValue)}</dd></div><div><dt>Expected</dt><dd>${escapeHtml(rule.expectedRequirement)}</dd></div><div><dt>OCR evidence</dt><dd>${escapeHtml(rule.evidence)}</dd></div></dl></article>`).join('');
  document.querySelector('#download').onclick = () => {
    const report = `<html><head><meta charset="utf-8"><title>LabelLens inspection ${escapeHtml(data.inspectionId)}</title><style>body{font:14px Arial;color:#17221e;max-width:900px;margin:32px auto}img{max-width:100%;max-height:420px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccd5cc;padding:8px;text-align:left}h1{margin-bottom:4px}.notice{background:#f2eee2;padding:12px}.fail{color:#a42c24}</style></head><body><h1>Package Compliance Scanner</h1><p>${escapeHtml(data.inspectionId)} · ${escapeHtml(new Date(data.timestamp).toLocaleString())} · ${escapeHtml(data.mode === 'sample' ? 'Sample Demonstration' : 'Live Analysis')}</p><img src="${data.image}" alt="Inspected package"><h2>Status: ${escapeHtml(data.status)} · Prototype Compliance Score: ${data.score}/100</h2><p>OCR confidence: ${data.confidence}%</p><h2>Extracted fields</h2><table>${Object.entries(data.fields || {}).map(([key, value]) => `<tr><th>${escapeHtml(labels[key] || key)}</th><td>${escapeHtml(valueText(value))}</td></tr>`).join('')}</table><h2>Rules and evidence</h2>${(data.ruleResults || []).map(rule => `<h3 class="${rule.status === 'FAIL' ? 'fail' : ''}">${escapeHtml(rule.ruleId)} · ${escapeHtml(rule.rule)} · ${escapeHtml(rule.status)}</h3><p>${escapeHtml(rule.explanation)}<br>Detected: ${escapeHtml(rule.detectedValue)}<br>Expected: ${escapeHtml(rule.expectedRequirement)}<br>OCR evidence: ${escapeHtml(rule.evidence)}</p>`).join('')}<h2>Disclaimer</h2><p class="notice">AI-assisted prototype screening tool. This report is not official certification or a substitute for legal review.</p></body></html>`;
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([report], { type: 'text/html' })); link.download = `${data.inspectionId || 'inspection'}-report.html`; link.click();
  };
}