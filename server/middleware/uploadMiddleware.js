const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) return callback(new Error('Only JPEG, PNG, or WebP images are accepted.'));
    callback(null, true);
  }
});

module.exports = upload;