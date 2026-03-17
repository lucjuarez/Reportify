import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import fetch from "node-fetch";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 1. CONFIGURACIÓN DE BENCHMARKS (ARS)
const BENCHMARK_ARS = {
    message: { acceptable: 1000, high: 2000 },
    lead: { acceptable: 15000, high: 30000 },
    purchase: { acceptable: 20000, high: 40000 },
    cart: { acceptable: 8000, high: 15000 },
    profile_visit: { acceptable: 500, high: 1200 },
    lpv: { acceptable: 500, high: 1200 }
};

const n = (v) => Number(v) || 0;

// 2. DETECCIÓN DE OBJETIVOS (Sincronizado con Front)
function detectarObjetivo(c) {
    const convEvent = (c.conversion_event || "").toUpperCase();
    const campName = (c.name || "").toUpperCase(); 
    if (convEvent.includes("PURCHASE") || campName.includes("COMPRA")) return "purchase";
    if (convEvent.includes("LEAD") || campName.includes("LEAD")) return "lead";
    if (campName.includes("MENSAJE") || campName.includes("WSP")) return "message";
    return "lpv";
}

// 3. MOTOR DE SCORE (Tu lógica de ReportAds)
async function calcularScoreMatematico(campañas) {
    let score = 5.5; 
    campañas.forEach(c => {
        const spend = n(c.spend);
        const res = n(c.resultados_obj);
        if (spend > 0 && res === 0) score -= 1.8;
        if (n(c.freq) > 2.5) score -= 1.2;
        // Agregá aquí el resto de tus reglas de peso...
    });
    return Number(Math.min(10, Math.max(0, score)).toFixed(1));
}

app.post("/analizar", async (req, res) => {
    try {
        const { campañas_detalle, currency } = req.body;
        const scoreBase = await calcularScoreMatematico(campañas_detalle);
        
        const prompt = `Actúa como Luciano Federico Juarez, Director de Estrategia. PUNTAJE GLOBAL: ${scoreBase}. Analiza la arquitectura de la cuenta Reportify. Datos: ${JSON.stringify(campañas_detalle)}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.1,
            messages: [
                { role: "system", content: "Eres Luciano Juárez, estratega senior de Reportify." },
                { role: "user", content: prompt }
            ]
        });

        const aiRes = JSON.parse(response.choices[0].message.content.replace(/```json|```/g, ""));
        res.json({ ...aiRes, score: scoreBase });
    } catch (err) {
        res.status(500).json({ error: "Fallo en motor estratégico" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Reportify Senior Engine en puerto ${PORT}`));
