// Mark a schedule entry as completed or not
exports.markCompleted = async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  const userId = req.user.userId;

  if (typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Completed must be boolean' });
  }

  try {
    const schedule = await Schedule.findOneAndUpdate(
      { _id: id, userId },
      { completed },
      { new: true }
    );
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule entry not found' });
    }
    res.json({ message: 'Schedule updated', schedule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
};
const Schedule = require('../models/Calendar'); // Now Schedule model
const axiosInstance = require('../utils/axiosInstance');

const generateAISchedule = async (userMessage) => {
  try {
    const response = await axiosInstance.post('/api/schedule', {
      userMessage: userMessage
    });

    return response.data;
  } catch (error) {
    console.error('Error calling GenAI API:', error);
    throw error;
  }
};

exports.generateSchedule = async (req, res) => {
  const { userMessage } = req.body;
  const userId = req.user.userId;

  if (!userMessage) {
    return res.status(400).json({ error: 'User message is required' });
  }

  try {
    const generatedSchedule = await generateAISchedule(userMessage);

    console.log('Generated Schedule:', generatedSchedule);

    if (!Array.isArray(generatedSchedule)) {
      return res.status(500).json({ error: 'Invalid schedule format received from AI' });
    }

    const formatted = generatedSchedule.map(item => ({
      userId,
      date: new Date(item.date),
      topic: item.topic,
      duration: Number(item.duration),
      details:
        item.details ||
        item.description ||
        item.detail ||
        null,
      subtopics: Array.isArray(item.subtopics)
        ? item.subtopics
        : Array.isArray(item.sub_topics)
        ? item.sub_topics
        : Array.isArray(item.subTopics)
        ? item.subTopics
        : [],
      completed: false,
      delayed: false
    }));

    // Insert all schedule entries for this user
    await Schedule.insertMany(formatted);

    res.json({
      message: 'Schedule generated and saved successfully',
      schedule: formatted
    });
  } catch (err) {
    console.error('Schedule generation error:', err);
    res.status(500).json({ error: 'Failed to generate schedule' });
  }
};

exports.saveSchedule = async (req, res) => {
  const { schedule } = req.body;
  const userId = req.user.userId;

  if (!Array.isArray(schedule)) {
    return res.status(400).json({ error: 'Valid schedule array required' });
  }

  try {
    const formatted = schedule.map(item => ({
      userId,
      date: new Date(item.date),
      topic: item.topic,
      duration: Number(item.duration),
      details:
        item.details ||
        item.description ||
        item.detail ||
        null,
      subtopics: Array.isArray(item.subtopics)
        ? item.subtopics
        : Array.isArray(item.sub_topics)
        ? item.sub_topics
        : Array.isArray(item.subTopics)
        ? item.subTopics
        : [],
      completed: false,
      delayed: false
    }));

    await Schedule.insertMany(formatted);

    res.json({ message: 'Schedule saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getSchedule = async (req, res) => {
  const userId = req.user.userId;

  try {
    const schedule = await Schedule.find({ userId });
    res.json(schedule);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
};
