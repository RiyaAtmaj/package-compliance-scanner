const { recognize } = require('../services/ocrService');
const { extract } = require('../services/extractionService');
const { evaluate } = require('../services/complianceService');
const { makeReport } = require('../utils/reportGenerator');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const sampleCases = {
  compliant: 'sample-data/compliant/full-declarations.txt',
  'missing-mrp': 'sample-data/violations/missing-mrp.txt',
  'missing-date': 'sample-data/violations/missing-date.txt',
  'multiple-violations': 'sample-data/violations/multiple-missing.txt'
};

async function analyze(req, res) {
  if (!req.file) return res.status(400).json({ success: false, error: 'Please upload a package image.' });
  try {
    const ocr = await recognize(req.file.buffer);
    const extraction = await extract(ocr.text);
    const compliance = evaluate(extraction.fields, ocr.text, extraction.source, ocr.confidence);
    const timestamp = new Date().toISOString();
    const inspectionId = `INS-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    res.json({ success: true, mode: 'live', inspectionId, timestamp, image: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, ocrText: ocr.text, confidence: ocr.confidence, ...extraction, ...compliance });
  } catch (error) {
    console.error('Inspection error:', error.message);
    res.status(422).json({ success: false, error: error.message || 'Could not read this image.' });
  }
}

function report(req, res) {
  if (!req.body || !req.body.fields) return res.status(400).json({ success: false, error: 'Inspection data is required.' });
  res.json({ success: true, report: makeReport(req.body) });
}

async function sample(req, res) {
  const relativePath = sampleCases[req.params.caseName];
  if (!relativePath) return res.status(404).json({ success: false, error: 'Unknown sample inspection.' });
  try {
    const ocrText = await fs.readFile(path.join(__dirname, '..', '..', relativePath), 'utf8');
    const extraction = await extract(ocrText);
    const compliance = evaluate(extraction.fields, ocrText, 'prepared sample fixture', 96);
    const timestamp = new Date().toISOString();
    const inspectionId = `SAMPLE-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const image = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="650" viewBox="0 0 900 650"><rect width="900" height="650" fill="#e8eee6"/><rect x="150" y="70" width="600" height="510" rx="8" fill="#fff" stroke="#1e3027" stroke-width="4"/><text x="450" y="170" text-anchor="middle" font-family="sans-serif" font-size="34" fill="#1e3027">PREPARED SAMPLE</text><text x="450" y="225" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#607268">${req.params.caseName}</text><text x="450" y="350" text-anchor="middle" font-family="monospace" font-size="18" fill="#607268">OCR fixture loaded from sample-data</text></svg>`)}`;
    res.json({ success: true, mode: 'sample', inspectionId, timestamp, image, ocrText, confidence: 96, ...extraction, ...compliance });
  } catch (error) {
    console.error('Sample inspection error:', error.message);
    res.status(500).json({ success: false, error: 'The prepared sample could not be loaded.' });
  }
}

module.exports = { analyze, report, sample };