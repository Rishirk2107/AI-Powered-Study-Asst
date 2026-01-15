
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { uploadFileToCloudinary } = require('../utils/cloudinaryUpload');

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const uniqueName = uuidv4();
    const fileExtension = require('path').extname(req.file.originalname);
    const newFileName = `${uniqueName}${fileExtension}`;

    // Upload file to Cloudinary
    const cloudinaryResponse = await uploadFileToCloudinary(req.file.buffer, newFileName);
    const fileUrl = cloudinaryResponse.secure_url;

    const response = await axios.post('http://localhost:8000/api/chatbot/upload', {
      Path: fileUrl,
    });

    res.status(200).json({
      message: 'File sent to AI API',
      botResponse: response.data.botResponse,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'File processing failed at AI server' });
  }
};

exports.askQuestion = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const response = await axios.post('http://localhost:8000/api/chatbot/chat', {
      userMessage: message,
    });

    console.log(response.data);

    res.status(200).json({
      answer: response.data.botResponse,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error querying AI API' });
  }
};
