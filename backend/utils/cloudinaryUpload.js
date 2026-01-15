const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

// Ensure environment variables are loaded
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file buffer to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} fileName - The original file name
 * @returns {Promise<Object>} - Cloudinary upload response with url and public_id
 */
exports.uploadFileToCloudinary = async (fileBuffer, fileName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        public_id: `flashcards/${fileName.split('.')[0]}`,
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - The public ID of the file
 * @returns {Promise<Object>} - Cloudinary deletion response
 */
exports.deleteFileFromCloudinary = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};
