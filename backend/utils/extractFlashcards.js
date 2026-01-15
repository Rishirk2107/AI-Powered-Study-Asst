const axiosInstance = require('./axiosInstance');

module.exports = extractFlashcards = async (path) => {
    const response = await axiosInstance.post('/api/flashcards', { Path: path });
    console.log(response.data);
    return response.data;
}
