const express = require('express');
const { saveSchedule, getSchedule, generateSchedule } = require('../controllers/scheduleController');
const router = express.Router();

router.post('/save', saveSchedule);
router.post('/generate', generateSchedule);
router.get('/', getSchedule);

module.exports = router;
