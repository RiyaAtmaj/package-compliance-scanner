const { recognize } = require('../services/ocrService');
const { extract } = require('../services/extractionService');
const { evaluate } = require('../services/complianceService');
const { makeReport } = require('../utils/reportGenerator');

async function analyze(req, res) {
  if (!req.file) return res.status(400).json({ success: false, error: 'Please upload a package image.' });
  try {
    const ocr = await recognize(req.file.buffer);
    const extraction = await extract(ocr.text);
    const compliance = evaluate(extraction.fields, ocr.text, extraction.source);
    res.json({ success: true, image: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, ocrText: ocr.text, confidence: ocr.confidence, ...extraction, ...compliance });
  } catch (error) {
    console.error('Inspection error:', error.message);
    res.status(422).json({ success: false, error: error.message || 'Could not read this image.' });
  }
}

function report(req, res) {
  if (!req.body || !req.body.fields) return res.status(400).json({ success: false, error: 'Inspection data is required.' });
  res.json({ success: true, report: makeReport(req.body) });
}

module.exports = { analyze, report };