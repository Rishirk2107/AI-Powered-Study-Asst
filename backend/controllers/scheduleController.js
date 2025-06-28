const Calendar = require('../models/Calendar');
const generateAISchedule = async (userMessage) => {
  try {
    const response = await fetch('http://localhost:8000/api/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage: userMessage
      })
    });

    if (!response.ok) {
      throw new Error(`GenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
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
    
    if (!Array.isArray(generatedSchedule)) {
      return res.status(500).json({ error: 'Invalid schedule format received from AI' });
    }

    const formatted = generatedSchedule.map(item => ({
      date: new Date(item.date),
      topic: item.topic,
      duration: Number(item.duration)
    }));

    let calendar = await Calendar.findOne({ userId });

    if (calendar) {
      calendar.entries.push(...formatted);
      await calendar.save();
    } else {
      await Calendar.create({ userId, entries: formatted });
    }

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
      date: new Date(item.date),
      topic: item.topic,
      duration: Number(item.duration)
    }));

    let calendar = await Calendar.findOne({ userId });

    if (calendar) {
      calendar.entries.push(...formatted);
      await calendar.save();
    } else {
      await Calendar.create({ userId, entries: formatted });
    }

    res.json({ message: 'Schedule saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getSchedule = async (req, res) => {
  const userId = req.user.userId; 

  try {
    const calendar = await Calendar.findOne({ userId });
    res.json(calendar ? calendar.entries : []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
};
