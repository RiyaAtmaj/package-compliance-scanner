const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const { analyze, report } = require('../controllers/inspectionController');

const router = express.Router();
router.post('/analyze', upload.single('image'), analyze);
router.post('/report', report);
module.exports = router;