const axios = require('axios');

module.exports = extractFlashcards = async (path) => {
    const response = await axios.post("http://localhost:8000/api/flashcards", { Path: path });
    console.log(response.data);
    return response.data;
}
