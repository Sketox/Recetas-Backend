const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();

router.post("/chef-voice", async (req, res) => {
  try {
    // Validar método HTTP
    if (req.method !== "POST") {
      return res.status(405).json({ response: "Método no permitido" });
    }

    const { message } = req.body;

    // Validar entrada
    if (!message || typeof message !== "string") {
      return res.status(400).json({ response: "El mensaje es requerido" });
    }

    // Configurar personalidad del chef
    const chefPersonality = `Eres Chef Pierre, un chef francés que habla español con un toque de acento francés.
      Reglas:
      1. Respuestas muy breves (1-2 frases máximo)
      2. Usa ocasionalmente palabras francesas (oui, merci, chef)
      3. Mantén un tono profesional pero amable
      4. Usa términos culinarios precisos
      5. Incluye 1 emoji relevante por respuesta (🥖🍷🍳)
      
      Ejemplos:
      - "Para el soufflé, la clé es batir bien las claras, voilà! 🍳"
      - "Oui, puedes sustituir la mantequilla, mon ami 🧈"
      - "La température idéal es 180°C exactement! 🌡️"`;

    // Llamar a la API de DeepSeek
    const deepseekResponse = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: chefPersonality,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    const chefResponse = deepseekResponse.data.choices[0].message.content;

    // Responder al frontend
    res.status(200).json({
      success: true,
      response: chefResponse,
    });
  } catch (error) {
    console.error("Error en el servidor:", error);

    // Manejo detallado de errores
    let errorMessage =
      "Oh là là! Un problème est survenu en cuisine. Réessayez plus tard!";
    let statusCode = 500;

    if (error.response) {
      // Error de la API de DeepSeek
      statusCode = error.response.status;
      errorMessage = error.response.data.error?.message || errorMessage;
    } else if (error.request) {
      // No se recibió respuesta
      errorMessage = "Le serveur culinaire ne répond pas. Réessayez!";
    }

    res.status(statusCode).json({
      success: false,
      response: errorMessage,
    });
  }
});

module.exports = router;
