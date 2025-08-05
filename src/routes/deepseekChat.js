const express = require("express");
const axios = require("axios");
const router = express.Router();
require("dotenv").config();

// Configuración mejorada de Axios
const apiClient = axios.create({
  baseURL: "https://api.deepseek.com/v1",
  timeout: 30000, // 30 segundos timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "El mensaje es requerido" });
    }

    console.log("Preparando petición a DeepSeek API...");

    const response = await apiClient.post(
      "/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: `Proporciona 3 recetas usando: ${message}. Devuelve solo JSON con: título, ingredientes, instrucciones`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
      }
    );

    console.log("Respuesta recibida. Status:", response.status);

    const content = response.data.choices[0].message.content;
    const recipes = JSON.parse(content);

    return res.json({ success: true, recipes });
  } catch (error) {
    console.error("Error detallado:", {
      code: error.code,
      message: error.message,
      responseStatus: error.response?.status,
      responseData: error.response?.data,
      stack: error.stack,
    });

    if (error.code === "ECONNABORTED") {
      return res.status(504).json({
        error: "La API tardó demasiado en responder",
        solution: "Intenta nuevamente o reduce la complejidad de la petición",
      });
    }

    return res.status(500).json({
      error: "Error interno del servidor",
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;
