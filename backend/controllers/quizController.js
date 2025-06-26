const path = require('path');
const axios = require('axios');

exports.uploadQuizPDF = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filePath = path.resolve(req.file.path);
    console.log(filePath)

    const response = await axios.post('https://ai.byteblazeverse.space/api/quizbot/', {
      Path: filePath,
    });

    console.log(response.data);

    res.json({ questions: response.data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Quiz generation failed' });
  }
};
