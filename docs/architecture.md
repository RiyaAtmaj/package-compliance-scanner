# Architecture

```text
Browser upload -> Express/Multer -> Tesseract.js -> optional Grok -> local fallback
             -> deterministic rules -> score/evidence JSON -> result/report
```

The API key is read from `process.env.GROK_API_KEY` in `server/services/grokService.js`; it never reaches the browser. The application is stateless and intentionally has no authentication or database in this MVP.