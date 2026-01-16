const express = require('express');
const { saveSchedule, getSchedule, generateSchedule, markCompleted } = require('../controllers/scheduleController');
const router = express.Router();

router.post('/save', saveSchedule);
router.post('/generate', generateSchedule);
router.get('/', getSchedule);

// Mark a schedule entry as completed or not
router.put('/:id/completed', markCompleted);

module.exports = router;
