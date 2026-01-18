const express = require('express');
const { saveSchedule, getSchedule, generateSchedule, markCompleted, getTopicContent } = require('../controllers/scheduleController');
const router = express.Router();

router.post('/save', saveSchedule);
router.post('/generate', generateSchedule);
router.get('/', getSchedule);
router.get('/topic/:id', getTopicContent);

router.put('/:id/completed', markCompleted);

module.exports = router;
