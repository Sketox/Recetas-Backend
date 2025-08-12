const express = require("express");
const axios = require("axios");
const router = express.Router();
require("dotenv").config();

const apiClient = axios.create({
  baseURL: "https://api.deepseek.com/v1",
  timeout: 90000, // ↑ antes 30000, el 500 "aborted" era por timeout
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

const DIFFICULTIES = new Set(["Fácil", "Intermedio", "Difícil"]);
const CATEGORIES = new Set(["Desayuno", "Almuerzo", "Cena", "Postre", "Snack"]);

function normalize(r) {
  const now = new Date().toISOString();
  const num = (x, min = 1) => (typeof x === "number" && x > 0 ? x : min);
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, Number(x) || lo));
  const difficulty = DIFFICULTIES.has(r?.difficulty)
    ? r.difficulty
    : "Intermedio";
  const category = CATEGORIES.has(r?.category) ? r.category : "Almuerzo";
  const imageUrl =
    typeof r?.imageUrl === "string" && r.imageUrl.trim()
      ? r.imageUrl
      : "/images/ai/placeholder.jpg";

  return {
    title:
      String(r?.title ?? "")
        .trim()
        .slice(0, 120) || "Receta sin título",
    description:
      String(r?.description ?? "").trim() || "Receta generada por IA.",
    ingredients: Array.isArray(r?.ingredients) ? r.ingredients.map(String) : [],
    instructions: Array.isArray(r?.instructions)
      ? r.instructions.map(String)
      : [],
    prepTime: num(r?.prepTime),
    cookTime: num(r?.cookTime),
    servings: num(r?.servings),
    difficulty,
    category,
    imageUrl,
    rating: clamp(r?.rating ?? 4.5, 0, 5),
    userId: String(r?.userId ?? "ai"),
    createdAt: r?.createdAt ?? now,
    updatedAt: r?.updatedAt ?? now,
  };
}

router.post("/", async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message)
      return res.status(400).json({ error: "El mensaje es requerido" });
    if (!process.env.DEEPSEEK_API_KEY) {
      return res
        .status(500)
        .json({ error: "Falta DEEPSEEK_API_KEY en el backend" });
    }

    const system = `
Eres un chef profesional. Devuelve EXCLUSIVAMENTE JSON válido.
Genera EXACTAMENTE 3 recetas (español) con este esquema:
{
  "title": "string",
  "description": "string",
  "ingredients": ["string"],
  "instructions": ["Paso 1...", "Paso 2..."],
  "prepTime": number (>0),
  "cookTime": number (>0),
  "servings": number (>0),
  "difficulty": "Fácil" | "Intermedio" | "Difícil",
  "category": "Desayuno" | "Almuerzo" | "Cena" | "Postre" | "Snack",
  "imageUrl": "/images/ai/placeholder.jpg",
  "rating": number (0..5),
  "userId": "ai"
}
Responde SOLO:
{ "recipes": [ ...3 objetos... ] }
`.trim();

    const ds = await apiClient.post(
      "/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          { role: "system", content: system },
          { role: "user", content: `Usa este tema/ingredientes: ${message}` },
        ],
        temperature: 0.7,
        max_tokens: 1200,
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

    const raw = Array.isArray(parsed?.recipes)
      ? parsed.recipes
      : Array.isArray(parsed?.recetas)
      ? parsed.recetas
      : [];

    const normalized = raw.map(normalize).slice(0, 3);
    return res.json({ success: true, recipes: normalized });
  } catch (error) {
    console.error("DeepSeek error:", {
      code: error.code,
      msg: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    if (error.code === "ECONNABORTED") {
      return res.status(504).json({ error: "Timeout con la API de IA" });
    }
    return res.status(500).json({
      error: "Error interno",
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;
