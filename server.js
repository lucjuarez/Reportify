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

// --- BENCHMARKS DE REPORTADS ---
const BENCHMARK_ARS = {
    message: { acceptable: 1000, high: 2000 },
    purchase: { acceptable: 20000, high: 40000 },
    lpv: { acceptable: 500, high: 1200 }
};

// --- FUNCIÓN DE DETECCIÓN DE OBJETIVOS (Tu lógica de ReportAds) ---
function detectarObjetivo(campName) {
    const name = campName.toUpperCase();
    if (name.includes("MENSAJE") || name.includes("WSP") || name.includes("WHA")) return "message";
    if (name.includes("COMPRA") || name.includes("PURCHASE")) return "purchase";
    return "lpv";
}

app.post("/api/reportify", async (req, res) => {
    const { accountId, accessToken, since, until } = req.body;

    try {
        // 1. CONEXIÓN A META (Lo que Reportify necesita)
        const metaUrl = `https://graph.facebook.com/v19.0/act_${accountId}/insights?level=adset&fields=adset_name,campaign_name,spend,inline_link_click_ctr,actions&time_range={"since":"${since}","until":"${until}"}&access_token=${accessToken}`;
        
        const metaRes = await fetch(metaUrl);
        const metaData = await metaRes.json();

        if (metaData.error) throw new Error(metaData.error.message);

        // 2. PROCESAMIENTO CON LÓGICA DE REPORTADS
        const rows = metaData.data.map(item => {
            const obj = detectarObjetivo(item.campaign_name);
            const messages = item.actions?.find(a => a.action_type.includes("messaging"))?.value || 0;
            
            return {
                campaña: item.campaign_name,
                inversion: parseFloat(item.spend) || 0,
                mensajes: parseInt(messages),
                ctr: parseFloat(item.inline_link_click_ctr) || 0,
                objetivo_ia: obj
            };
        });

        // 3. CEREBRO IA (Estilo Luciano Juarez)
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Actúa como Luciano Federico Juarez, Director de Estrategia. Explica los resultados de forma ejecutiva." },
                { role: "user", content: `Analiza estos datos de Meta Ads: ${JSON.stringify(rows)}` }
            ],
            temperature: 0.2
        });

        res.json({
            success: true,
            data: rows,
            aiSummary: completion.choices[0].message.content
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(process.env.PORT || 3000, () => console.log("🚀 Reportify Engine Live"));
