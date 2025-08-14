const express = require("express");
const axios = require("axios");
const https = require("https");
const router = express.Router();
require("dotenv").config();

const agent = new https.Agent({
  keepAlive: true,
  timeout: 120000,
  rejectUnauthorized: true,
});

const api = axios.create({
  baseURL: "https://api.deepseek.com/v1",
  httpsAgent: agent,
  timeout: 120000,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

const SYSTEM_PROMPT = `
Eres el chef mas arrecho que hay, chef costeño de Ecuador (Guayas + Manabí), batracio arrecho y experto en cocina tradicional (viche, corviche, encocado, bolón, tonga, cazuela, menestra, mariscos).
Reglas:
- Respuestas breves (1-2 frases) por defecto.
- Tono profesional, directo y alegre; jerga costeña moderada (mi llave, ñaño, bacán).
- Prioriza recetas de la Costa; si no aplica, ofrece alternativa internacional y versión costeña cuando sea posible.
- Usa términos culinarios precisos y sistema métrico; sugiere sustitutos comunes en Ecuador.
- Si piden receta/paso a paso: porciones, tiempo, ingredientes (g/ml), pasos numerados, tips y acompañamientos costeños.
- Incluye exactamente 1 emoji apropiado al final.
- No uses *, cursivas, tablas ni adornos; nada de “embellecer” el texto.
`.trim();

function normalizeMsgs(arr = []) {
  // acepta {role, content} o {sender, text}
  return arr
    .map((m) => ({
      role: m.role || (m.sender === "bot" ? "assistant" : "user"),
      content: m.content || m.text || "",
    }))
    .filter((m) => m.content && (m.role === "user" || m.role === "assistant"))
    .slice(-12); // limita contexto
}

router.post("/", async (req, res) => {
  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "messages debe ser un array" });
    }
    if (!process.env.DEEPSEEK_API_KEY) {
      return res
        .status(500)
        .json({ success: false, error: "Falta DEEPSEEK_API_KEY" });
    }

    const dsMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...normalizeMsgs(messages),
    ];

    const r = await api.post(
      "/chat/completions",
      {
        model: "deepseek-chat",
        messages: dsMessages,
        temperature: 0.6,
        max_tokens: 300,
      },
      { headers: { Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}` } }
    );

    const reply =
      r.data?.choices?.[0]?.message?.content?.trim() ||
      "Hmm… no he oído bien, repite s’il vous plaît. 🥖";
    return res.json({ success: true, reply });
  } catch (error) {
    console.error("chef-voice error:", {
      code: error.code,
      msg: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    if (error.code === "ECONNABORTED") {
      return res
        .status(504)
        .json({ success: false, error: "Timeout con la IA" });
    }
    return res.status(500).json({ success: false, error: "Error interno" });
  }
});

module.exports = router;
