const express = require("express");
const axios = require("axios");
const router = express.Router();
require("dotenv").config();

// Configuración mejorada con keep-alive
const https = require("https");
const agent = new https.Agent({
  keepAlive: true,
  timeout: 120000, // 120 segundos
  rejectUnauthorized: true,
});

const apiClient = axios.create({
  baseURL: "https://api.deepseek.com/v1",
  httpsAgent: agent,
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

router.post("/diet", async (req, res) => {
  try {
    const { message } = req.body;

    // Validación optimizada
    if (!message?.trim()) {
      return res
        .status(400)
        .json({ error: "Proporciona una descripción dietética" });
    }

    console.log(
      "🔍 Procesando solicitud para:",
      message.substring(0, 30) + "..."
    );

    const prompt = `Como nutricionista, genera una dieta semanal en JSON SIN texto adicional. Estructura requerida:
    {
      "week_plan": [{
        "day": "Lunes",
        "meals": {
          "desayuno": "...", 
          "media_mañana": "...",
          "almuerzo": "...",
          "merienda": "...",
          "cena": "..."
        }
      }],
      "notes": "Incluir recomendaciones adicionales sobre la dieta"
    }`;

    const startTime = Date.now();
    const response = await apiClient.post(
      "/chat/completions",
      {
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: "json_object" },
      },
      {
        headers: { Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}` },
      }
    );

    const processingTime = (Date.now() - startTime) / 1000;
    console.log(
      `✅ Respuesta recibida en ${processingTime}s. Longitud: ${response.data.choices[0].message.content.length}`
    );

    // Respuesta rápida al cliente
    res.set("Connection", "keep-alive");
    return res.json({
      success: true,
      diet: JSON.parse(response.data.choices[0].message.content),
    });
  } catch (error) {
    console.error("⛔ Error:", error.code || error.message);

    if (error.code === "ECONNABORTED") {
      return res.status(504).json({
        error: "La operación tardó demasiado",
        solution: "Intenta con solicitudes más específicas",
      });
    }

    return res.status(500).json({
      error: "Error al generar la dieta",
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;
