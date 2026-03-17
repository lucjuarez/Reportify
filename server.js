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

// --- LÓGICA PURA DE REPORTADS (Benchmarks ARS) ---
const BENCHMARK_ARS = {
    message: { acceptable: 1000, high: 2000 },
    lead: { acceptable: 15000, high: 30000 },
    purchase: { acceptable: 20000, high: 40000 },
    lpv: { acceptable: 500, high: 1200 }
};

const n = (v) => Number(v) || 0;

function detectarObjetivo(campName) {
    const name = campName.toUpperCase();
    if (name.includes("MENSAJE") || name.includes("WSP") || name.includes("WHA") || name.includes("CHAT")) return "message";
    if (name.includes("COMPRA") || name.includes("PURCHASE") || name.includes("VENTA")) return "purchase";
    if (name.includes("LEAD") || name.includes("POTENCIAL")) return "lead";
    return "lpv";
}

// --- ENDPOINT PRINCIPAL ---
app.post("/api/reportify", async (req, res) => {
    const { accountId, accessToken, since, until } = req.body;

    try {
        // 1. Fetch directo a Meta (v25.0 como en tu Explorer)
        const metaUrl = `https://graph.facebook.com/v25.0/act_${accountId}/insights?level=adset&fields=adset_name,campaign_name,spend,inline_link_click_ctr,actions,reach,frequency&time_range={"since":"${since}","until":"${until}"}&access_token=${accessToken}&limit=500`;
        
        const metaRes = await fetch(metaUrl);
        const metaData = await metaRes.json();
        if (metaData.error) throw new Error(metaData.error.message);

        // 2. Procesamiento con tu lógica de Auditor
        const rawRows = metaData.data.map(item => {
            const obj = detectarObjetivo(item.campaign_name);
            const messages = item.actions?.find(a => a.action_type.includes("messaging"))?.value || 0;
            const spend = n(item.spend);
            const res_val = obj === "message" ? n(messages) : n(item.inline_link_clicks);
            
            return {
                campaña: item.campaign_name,
                inversion: spend,
                resultados: res_val,
                ctr: n(item.inline_link_click_ctr),
                objetivo: obj,
                frecuencia: n(item.frequency)
            };
        });

        // 3. Análisis de IA Persona: Luciano Juarez
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Eres Luciano Federico Juarez, Estratega Senior. Analiza los datos de Argentina y da un diagnóstico crudo y estratégico." },
                { role: "user", content: `Datos de la cuenta: ${JSON.stringify(rawRows)}` }
            ],
            temperature: 0.3
        });

        res.json({
            success: true,
            data: rawRows,
            aiSummary: completion.choices[0].message.content
        });

    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Reportify Engine en puerto ${PORT}`));
