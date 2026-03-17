import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Inicialización de OpenAI con la Key que configuraste en Render
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const PORT = process.env.PORT || 3000;

/**
 * ENDPOINT: /api/reportify
 * Procesa los datos de Meta y genera un resumen con IA
 */
app.post("/api/reportify", async (req, res) => {
    const { accountId, accessToken, since, until } = req.body;

    if (!accountId || !accessToken || !since || !until) {
        return res.status(400).json({ error: "Faltan parámetros: accountId, accessToken, since o until." });
    }

    try {
        // 1. Petición a Meta Ads API (Nivel AdSet + Desglose Diario)
        const metaUrl = `https://graph.facebook.com/v19.0/act_${accountId}/insights` +
            `?level=adset` +
            `&fields=adset_id,adset_name,campaign_name,reach,impressions,frequency,spend,inline_link_clicks,inline_link_click_ctr,cost_per_inline_link_click,actions` +
            `&time_range={"since":"${since}","until":"${until}"}` +
            `&time_increment=1` + 
            `&access_token=${accessToken}` +
            `&limit=5000`;

        const metaRes = await fetch(metaUrl);
        const metaData = await metaRes.json();

        if (metaData.error) throw new Error(metaData.error.message);

        // 2. Limpieza y formato de datos para la tabla
        const rawRows = metaData.data.map(item => {
            const messages = item.actions?.find(a => 
                a.action_type === "onsite_conversion.messaging_conversation_started_7d" || 
                a.action_type === "messaging_conversation_started_7d"
            )?.value || 0;

            return {
                semana_ref: item.date_start, // Usaremos esto en el front para agrupar
                campaña: item.campaign_name,
                adset: item.adset_name,
                alcance: parseInt(item.reach) || 0,
                impresiones: parseInt(item.impressions) || 0,
                frecuencia: parseFloat(item.frequency) || 0,
                clics: parseInt(item.inline_link_clicks) || 0,
                cpc: parseFloat(item.cost_per_inline_link_click) || 0,
                ctr: parseFloat(item.inline_link_click_ctr) || 0,
                inversion: parseFloat(item.spend) || 0,
                mensajes: parseInt(messages)
            };
        });

        // 3. Resumen opcional con ChatGPT (IA)
        // Le pasamos una versión resumida para no gastar tokens innecesarios
        let aiSummary = "Análisis de IA no solicitado.";
        
        if (process.env.OPENAI_API_KEY) {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "Eres un analista de performance experto. Tu tarea es resumir los resultados de esta tabla de Meta Ads en 3 frases cortas y directas para Luciano Juárez. Enfócate en el AdSet más eficiente." },
                    { role: "user", content: `Analiza estos datos de Ads: ${JSON.stringify(rawRows.slice(0, 10))}` }
                ],
                temperature: 0.5,
            });
            aiSummary = completion.choices[0].message.content;
        }

        // 4. Respuesta final
        res.json({
            data: rawRows,
            aiSummary: aiSummary
        });

    } catch (err) {
        console.error("Error en Reportify:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Reportify Backend corriendo en el puerto ${PORT}`);
});