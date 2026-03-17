import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// TUS BENCHMARKS DE ARGENTINA (ARS)
const BENCHMARK_ARS = {
    message: { acceptable: 1000, high: 2000 },
    lead: { acceptable: 15000, high: 30000 },
    purchase: { acceptable: 20000, high: 40000 },
    lpv: { acceptable: 500, high: 1200 }
};

app.post("/analizar", async (req, res) => {
    try {
        const { campañas_detalle } = req.body;
        
        // Aquí corre todo tu motor de score matemático (5.5 inicial, premios y penalizaciones)
        // ... (Tu lógica de ReportAds)

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.1,
            messages: [
                { role: "system", content: "Eres Luciano Federico Juarez. Estratega senior. Explica propósitos estratégicos de Reportify." },
                { role: "user", content: `Analiza estos datos: ${JSON.stringify(campañas_detalle)}` }
            ]
        });

        res.json(JSON.parse(completion.choices[0].message.content));
    } catch (err) {
        res.status(500).json({ error: "Error en el motor de Reportify" });
    }
});

app.listen(process.env.PORT || 3000, () => console.log("🚀 Reportify Senior Auditor Live"));
