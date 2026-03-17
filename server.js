import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Tus Benchmarks de Tucumán/Argentina
const BENCHMARKS = {
    message: { acceptable: 1000, high: 2000 },
    purchase: { acceptable: 20000, high: 40000 }
};

app.post("/analizar", async (req, res) => {
    const { campañas_detalle } = req.body;

    const prompt = `Actúa como Luciano Juárez, estratega senior. Analiza estos datos de Meta Ads para un cliente en Argentina. Da un diagnóstico crudo y estratégico. Datos: ${JSON.stringify(campañas_detalle)}`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.1,
            messages: [{ role: "system", content: "Eres Luciano Juárez. Estratega de Reportify." }, { role: "user", content: prompt }]
        });
        
        const aiRes = JSON.parse(response.choices[0].message.content.replace(/```json|```/g, ""));
        res.json(aiRes);
    } catch (error) {
        res.status(500).json({ error: "Fallo en el motor de IA" });
    }
});

app.listen(process.env.PORT || 3000, () => console.log("🚀 Reportify Engine Ready"));
