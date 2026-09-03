# LabelLens: Package Compliance Scanner

LabelLens is the SIH26034 hackathon MVP for screening declarations printed on packaged goods against a small, configurable subset of Indian Legal Metrology requirements. It turns a package image into structured fields, deterministic rule results, evidence, and a downloadable inspection report.

This is an AI-assisted prototype screening tool. It is not official certification, a government score, or a substitute for legal review.

## Problem and solution

Declaration checks are often manual, slow, and difficult to audit. LabelLens combines image preprocessing and OCR with optional Grok-assisted normalization, then keeps the legal decision in a deterministic JSON-driven rule engine. AI extracts information; rules decide whether the selected declaration requirements are met.

## Architecture

```text
User -> Vanilla JS frontend -> Express API -> image preprocessing -> Tesseract OCR
                                                     -> Grok extraction (optional)
                                                     -> deterministic rule engine
                                                     -> score, status, evidence, report
```

See [docs/architecture.md](docs/architecture.md) for boundaries, fallback behavior, and future extension points.

## Technology stack

- Node.js 18+, Express, Helmet, CORS, and Multer
- Tesseract.js with Sharp preprocessing
- Optional xAI Grok REST API, called only by the backend
- Vanilla HTML, CSS, and JavaScript
- JSON configuration for selected compliance rules
- No database or authentication in this MVP

## Installation

```bash
npm install
cp .env.example .env
npm start
```

Open `http://localhost:3000`.

Environment variables:

```text
PORT=3000
GROK_API_KEY=
```

`GROK_API_KEY` is optional. Without it, local OCR pattern extraction remains available. Never put the key in frontend files or browser requests; `.env` is ignored by Git.

## API

`POST /api/inspection/analyze` accepts multipart form data with an `image` field. Accepted types are JPEG, PNG, and WebP up to 8 MB. The response includes an inspection ID, timestamp, image data URL, OCR text and confidence, structured fields, rule results, score, status, and evidence.

`GET /api/inspection/sample/:caseName` loads an explicitly labeled prepared demonstration fixture. Available cases are `compliant`, `missing-mrp`, `missing-date`, and `multiple-violations`. This path does not pretend to be live OCR.

`POST /api/inspection/report` remains available for plain-text report consumers. The dashboard download creates an HTML report containing the uploaded image, fields, score, rules, evidence, timestamp, and prototype disclaimer.

## Compliance methodology

The current selected subset is configured in [rules/complianceRules.json](rules/complianceRules.json): MRP declaration, net quantity, manufacturer/packer/importer, manufacturing or packing date, and consumer care information. Each rule has an ID, field, requirement, evidence patterns, severity, and points.

The Prototype Compliance Score is deterministic: passed rule points divided by total rule points, multiplied by 100. Each of the five current rules is worth 20 points. `100` is PASS, `50-99` is WARNING, and below `50` is FAIL. OCR confidence below 55% downgrades a PASS to WARNING and displays a review warning. These thresholds are product decisions, not government scoring criteria.

MRP is only populated when an explicit MRP or Maximum Retail Price label is detected. An unlabeled currency amount is retained as `visiblePrice`, so the UI can say “MRP: Not detected” without treating every price as MRP.

## Demo instructions

1. Start the app and open `/inspection.html`.
2. Upload a clear declaration-panel image for **Live Analysis**.
3. Show preprocessing, OCR confidence, extracted fields, and rule evidence on the result dashboard.
4. Use **Demo recovery** to load `Mostly compliant package`, `Missing MRP`, `Missing or invalid date`, or `Multiple violations`.
5. Point out the `LIVE ANALYSIS` or `SAMPLE DEMONSTRATION` badge, inspection ID, timestamp, transparent score, and downloadable report.

Text fixtures and expected scenarios are listed in [sample-data/README.md](sample-data/README.md).

## Limitations

The MVP checks declaration presence and basic patterns. It does not verify statutory font size, quantity tolerances, price correctness, date validity against product type, batch traceability, language requirements, regional exceptions, or reliable image coordinates. English OCR is enabled by default; glare, rotation, blur, small print, and regional scripts can reduce confidence. Grok availability depends on network access and a valid server-side key.

## Future scope

The service boundaries support multilingual OCR, batch scanning, persistent history, inspector accounts, reviewer corrections, localized evidence coordinates, expanded rules, and analytics without requiring a rewrite of the core flow.