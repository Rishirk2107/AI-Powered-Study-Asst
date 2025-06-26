const axios = require('axios');

module.exports = extractFlashcards = async (path) => {
    const response = await axios.post("https://api.byteblazeverse.space/api/flashcards", { Path: path });
    console.log(response.data);
    return response.data;
}
