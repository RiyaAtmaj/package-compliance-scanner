const sharp = require('sharp');
const { createWorker } = require('tesseract.js');

async function preprocess(buffer) {
  return sharp(buffer, { failOn: 'error' })
    .rotate()
    .resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: false })
    .grayscale()
    .normalize()
    .sharpen({ sigma: 1 })
    .median(3)
    .png()
    .toBuffer();
}

async function recognize(buffer) {
  const processedImage = await preprocess(buffer);
  const worker = await createWorker('eng');
  try {
    const result = await worker.recognize(processedImage);
    const text = result.data.text.trim();
    if (!text) throw new Error('No readable text was found. Try a clearer, well-lit package image.');
    const confidence = Math.round(result.data.confidence || 0);
    return { text, confidence, lowConfidence: confidence < 55 };
  } finally {
    await worker.terminate();
  }
}

module.exports = { recognize };