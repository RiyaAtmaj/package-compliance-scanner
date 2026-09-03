const { createWorker } = require('tesseract.js');

async function recognize(buffer) {
  const worker = await createWorker('eng');
  try {
    const result = await worker.recognize(buffer);
    const text = result.data.text.trim();
    if (!text) throw new Error('No readable text was found. Try a clearer, well-lit package image.');
    return { text, confidence: Math.round(result.data.confidence || 0) };
  } finally {
    await worker.terminate();
  }
}

module.exports = { recognize };