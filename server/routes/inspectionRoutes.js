const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const { analyze, report, sample } = require('../controllers/inspectionController');

const router = express.Router();
router.post('/analyze', upload.single('image'), analyze);
router.post('/report', report);
router.get('/sample/:caseName', sample);
module.exports = router;