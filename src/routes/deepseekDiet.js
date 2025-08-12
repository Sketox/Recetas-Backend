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

const apiClient = axios.create({
  baseURL: "https://api.deepseek.com/v1",
  httpsAgent: agent,
  timeout: 120000,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

const DAY_MAP = new Map([
  ["lunes", "Lunes"],
  ["martes", "Martes"],
  ["miercoles", "Miércoles"],
  ["miércoles", "Miércoles"],
  ["jueves", "Jueves"],
  ["viernes", "Viernes"],
  ["sabado", "Sábado"],
  ["sábado", "Sábado"],
  ["domingo", "Domingo"],
]);

function emptyMeals() {
  return { desayuno: "", snack: "", almuerzo: "", merienda: "", cena: "" };
}

function normalizeDiet(parsed) {
  // Esperamos parsed = { week_plan: [ { day, meals: {desayuno, snack, almuerzo, merienda, cena} } ], notes? }
  const diet = {
    Lunes: emptyMeals(),
    Martes: emptyMeals(),
    Miércoles: emptyMeals(),
    Jueves: emptyMeals(),
    Viernes: emptyMeals(),
    Sábado: emptyMeals(),
    Domingo: emptyMeals(),
  };

  const arr = Array.isArray(parsed?.week_plan) ? parsed.week_plan : [];
  for (const item of arr) {
    const dayKey = String(item?.day || "")
      .trim()
      .toLowerCase();
    const day = DAY_MAP.get(dayKey);
    if (!day) continue;

    const m = item?.meals || {};
    diet[day] = {
      desayuno: String(m.desayuno ?? m.breakfast ?? ""),
      snack: String(m.snack ?? ""),
      almuerzo: String(m.almuerzo ?? m.lunch ?? ""),
      merienda: String(m.merienda ?? ""),
      cena: String(m.cena ?? m.dinner ?? ""),
    };
  }

  return { diet, notes: String(parsed?.notes || "") };
}

router.post("/", async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message?.trim()) {
      return res
        .status(400)
        .json({ error: "Proporciona una descripción dietética" });
    }
    if (!process.env.DEEPSEEK_API_KEY) {
      return res
        .status(500)
        .json({ error: "Falta DEEPSEEK_API_KEY en el backend" });
    }

    const system = `
Eres un nutricionista. Devuelve EXCLUSIVAMENTE JSON válido (sin texto extra).
Genera un plan de 7 días (Lunes..Domingo) en español, con este esquema:
{
  "week_plan": [
    {
      "day": "Lunes|Martes|Miércoles|Jueves|Viernes|Sábado|Domingo",
      "meals": {
        "desayuno": "string",
        "snack": "string",
        "almuerzo": "string",
        "merienda": "string",
        "cena": "string"
      }
    }
  ],
  "notes": "Recomendaciones y tips"
}
`.trim();

    const user = `Crea la dieta semanal según: ${message}`;

    const ds = await apiClient.post(
      "/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.7,
        max_tokens: 1600,
        response_format: { type: "json_object" },
      },
      { headers: { Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}` } }
    );

    const content = ds.data?.choices?.[0]?.message?.content ?? "{}";
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return res
        .status(502)
        .json({ error: "La IA no devolvió JSON válido", raw: content });
    }

    const { diet, notes } = normalizeDiet(parsed);
    return res.json({ success: true, diet, notes });
  } catch (error) {
    console.error("Diet AI error:", {
      code: error.code,
      msg: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    if (error.code === "ECONNABORTED") {
      return res.status(504).json({ error: "Timeout con la API de IA" });
    }
    return res
      .status(500)
      .json({
        error: "Error al generar la dieta",
        details: error.response?.data || error.message,
      });
  }
});

module.exports = router;
