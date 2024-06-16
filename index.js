const express = require("express");
const bodyParser = require("body-parser");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Ensure the API key is available
if (!process.env.OPENAI_API_KEY) {
  console.error("API key is missing. Please add it to the .env file.");
  process.exit(1);
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

app.post("/summary", async (req, res) => {
  const { title, author } = req.body;

  if (!title || !author) {
    return res.status(400).send({ error: "Title and author are required" });
  }

  const prompt = `Provide a brief summary of the book titled "${title}" by "${author}" in less than 100 words.`;

  try {
    const response = await openai.createCompletion({
      model: "gpt-4-turbo",
      prompt: prompt,
      max_tokens: 333
    });

    const summary = response.data.choices[0].text;
    res.json({ summary });
  } catch (error) {
    if (error.response) {
      // The API responded with an error status
      console.error(
        "API response error:",
        error.response.status,
        error.response.data
      );
      res.status(error.response.status).send(error.response.data);
    } else if (error.request) {
      // No response was received from the API
      console.error("API request error:", error.request);
      res.status(500).send({ error: "No response from OpenAI API." });
    } else {
      // Error setting up the request
      console.error("API setup error:", error.message);
      res
        .status(500)
        .send({ error: "An error occurred while setting up the request." });
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
