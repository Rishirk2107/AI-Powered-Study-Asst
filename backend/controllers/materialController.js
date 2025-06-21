const fs = require('fs');
const path = require('path');
const Material = require('../models/Material');
const Flashcard = require('../models/flashCard');
const extractFlashcards=require('../utils/extractFlashcards');
const { v4: uuidv4 } = require('uuid');

let flidCounter = 1;

exports.uploadMaterial = async (req, res) => {
  const { username } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const uniqueName = uuidv4();
  const uploadDir = path.join(__dirname, '../../uploads');
  fs.mkdirSync(uploadDir, { recursive: true });

  const fileExtension = path.extname(file.originalname);
  const newFileName = `${uniqueName}${fileExtension}`;
  const filePath = path.join(uploadDir, newFileName);

  fs.writeFileSync(filePath, file.buffer);

  await Material.create({
    username,
    file_id: newFileName,
    file_name: file.originalname, 
  });

  const flashcards = await extractFlashcards('../uploads/'+newFileName);

  await Flashcard.create({
    flid: flidCounter++,
    username,
    file_id: uniqueName,
    file_name: file.originalname, 
    flash_card: flashcards['flashcards'],
    tags: [],
  });

  res.status(201).json({ message: 'File uploaded and flashcards created', file_id: uniqueName });
};

exports.getMaterials = async (req, res) => {
  const materials = await Material.find().sort({ upload_date: -1 });
  res.json(materials);
};