import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import fetch from "node-fetch";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.')); 

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Benchmarks para el mercado de Argentina (ARS)
const BENCHMARK_ARS = {
    message: { acceptable: 1000, high: 2000 },
    purchase: { acceptable: 20000, high: 40000 },
    lpv: { acceptable: 500, high: 1200 }
};

// Lógica de detección de objetivos de Luciano
function detectarObjetivo(campName) {
    const name = campName.toUpperCase();
    if (name.includes("MENSAJE") || name.includes("WSP") || name.includes("WHA")) return "message";
    if (name.includes("COMPRA") || name.includes("PURCHASE")) return "purchase";
    return "lpv";
}

// ENDPOINT 1: Obtener cuentas de anuncios del usuario
app.get("/api/accounts", async (req, res) => {
    const { accessToken } = req.query;
    try {
        const response = await fetch(`https://graph.facebook.com/v25.0/me/adaccounts?fields=name,account_id&access_token=${accessToken}`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Error al traer cuentas" });
    }
});

// ENDPOINT 2: Generar Reporte e IA
app.post("/api/reportify", async (req, res) => {
    const { accountId, accessToken, since, until } = req.body;
    try {
        const metaUrl = `https://graph.facebook.com/v25.0/act_${accountId}/insights?level=adset&fields=adset_name,campaign_name,spend,inline_link_click_ctr,actions,reach&time_range={"since":"${since}","until":"${until}"}&access_token=${accessToken}`;
        
        const metaRes = await fetch(metaUrl);
        const metaData = await metaRes.json();
        if (metaData.error) throw new Error(metaData.error.message);

        const rows = metaData.data.map(item => {
            const obj = detectarObjetivo(item.campaign_name);
            const messages = item.actions?.find(a => a.action_type.includes("messaging"))?.value || 0;
            return {
                campaña: item.campaign_name,
                adset: item.adset_name,
                inversion: parseFloat(item.spend) || 0,
                mensajes: parseInt(messages),
                ctr: parseFloat(item.inline_link_click_ctr) || 0,
                alcance: parseInt(item.reach) || 0,
                objetivo: obj
            };
        });

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Actúa como Luciano Federico Juarez, Estratega Senior. Analiza los datos de Argentina y da 3 consejos breves." },
                { role: "user", content: `Datos: ${JSON.stringify(rows)}` }
            ],
            temperature: 0.3
        });

        res.json({ success: true, data: rows, aiSummary: completion.choices[0].message.content });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(process.env.PORT || 3000, () => console.log("🚀 Reportify Engine Live v25.0"));
