# LabelLens: Package Compliance Scanner

LabelLens is an SIH26034 prototype that turns a photograph of a packaged product label into a transparent screening report. It is **not** an official government compliance score or a substitute for legal review.

## Proposed solution and features

- Image upload with type and size validation, preview, and responsive inspection workflow.
- Tesseract.js OCR for visible English declaration text.
- Optional Grok normalization through the Node.js backend only. The model extracts fields; it does not decide compliance.
- Configurable deterministic checks for MRP, net quantity, manufacturer/packer, date, and consumer care information.
- Rule-by-rule PASS/FAIL evidence, OCR confidence, prototype score, and downloadable text report.
- Local fallback extraction means the demo still works when `GROK_API_KEY` is empty.

## Architecture

The browser posts `multipart/form-data` to `POST /api/inspection/analyze`. Express validates the image, Tesseract reads it, and the extraction service optionally sends only OCR text to Grok. The compliance service evaluates normalized fields against `rules/complianceRules.json`, calculates a percentage, and returns the result. No database is used; the current inspection is held in browser session storage.

## Tech stack

Node.js 18+, Express, Helmet, CORS, Multer, Tesseract.js, vanilla HTML/CSS/JavaScript, and the xAI Grok REST API.

## Installation and running

```bash
npm install
cp .env.example .env
npm start
```

Open http://localhost:3000. `GROK_API_KEY` is optional for the local fallback; add an xAI key to enable Grok field extraction. `PORT` defaults to `3000`.

## API

`POST /api/inspection/analyze` accepts an image field named `image` (`jpeg`, `png`, or `webp`, maximum 8 MB). It returns `fields`, `ocrText`, `confidence`, `score`, `status`, `violations`, `ruleResults`, and an image data URL. Errors return `{ "success": false, "error": "..." }` with a 4xx status.

`POST /api/inspection/report` accepts inspection JSON and returns a plain-text report payload.

## How it works

Tesseract.js recognizes the uploaded image in the backend. A small extraction prompt asks Grok to normalize label fields and use `null` when a declaration is absent. Local pattern extraction is merged as a resilience fallback. The deterministic engine considers a field present only when it has a non-empty value. PASS earns the rule's points; missing required declarations earn zero. The five current rules total 100 points.

## Limitations and future improvements

This prototype checks presence and basic readability, not statutory font sizes, quantity tolerances, lot/batch traceability, language requirements, country-specific exceptions, or image bounding boxes. OCR quality varies with glare, rotation, handwriting, and small print. Future work could add Hindi and regional language OCR, image preprocessing and confidence heatmaps, richer rule validators, persistent audit storage, and reviewer correction of extracted fields.