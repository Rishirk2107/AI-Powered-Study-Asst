const { v4: uuidv4 } = require('uuid');
const { uploadFileToCloudinary } = require('../utils/cloudinaryUpload');
const axiosInstance = require('../utils/axiosInstance');

exports.uploadQuizPDF = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const uniqueName = uuidv4();
    const fileExtension = require('path').extname(req.file.originalname);
    const newFileName = `${uniqueName}${fileExtension}`;

    // Upload file to Cloudinary
    const cloudinaryResponse = await uploadFileToCloudinary(req.file.buffer, newFileName);
    const fileUrl = cloudinaryResponse.secure_url;

    console.log('Cloudinary URL:', fileUrl);

    const response = await axiosInstance.post('/api/quizbot/', {
      Path: fileUrl,
    });

    console.log(response.data);

    res.json({ questions: response.data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Quiz generation failed' });
  }
};
