const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { uploadMaterial, getMaterials } = require('../controllers/materialController');

router.get('/', getMaterials);
router.post('/upload', upload.single('file'), uploadMaterial);

module.exports = router;
