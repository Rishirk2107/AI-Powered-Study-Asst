const Material = require('../models/Material');
const Flashcard = require('../models/flashCard');
const extractFlashcards=require('../utils/extractFlashcards');
const { v4: uuidv4 } = require('uuid');
const { uploadFileToCloudinary } = require('../utils/cloudinaryUpload');

let flidCounter = 1;

exports.uploadMaterial = async (req, res) => {
  const { username } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const uniqueName = uuidv4();
    const fileExtension = require('path').extname(file.originalname);
    const newFileName = `${uniqueName}${fileExtension}`;

    // Upload file to Cloudinary
    const cloudinaryResponse = await uploadFileToCloudinary(file.buffer, newFileName);
    const fileUrl = cloudinaryResponse.secure_url;

    await Material.create({
      username,
      file_id: uniqueName,
      file_name: file.originalname,
      cloudinary_url: fileUrl,
      public_id: cloudinaryResponse.public_id,
    });

    const flashcards = await extractFlashcards(fileUrl);

    await Flashcard.create({
      flid: flidCounter++,
      username,
      file_id: uniqueName,
      file_name: file.originalname,
      flash_card: flashcards['flashcards'],
      tags: [],
    });

    res.status(201).json({ message: 'File uploaded and flashcards created', file_id: uniqueName });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Error uploading file to Cloudinary' });
  }
};

exports.getMaterials = async (req, res) => {
  const materials = await Material.find().sort({ upload_date: -1 });
  res.json(materials);
};