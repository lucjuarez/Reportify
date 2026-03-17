import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import OpenAI from "openai";

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Middlewares
app.use(cors()); // Permite peticiones desde cualquier origen (Frontend)
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.')); // Sirve archivos estáticos (index.html, script.js) desde la raíz

// Inicialización de OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * ENDPOINT: /api/reportify
 * Recibe credenciales de Meta, extrae métricas y las analiza con GPT-4o-mini
 */
app.post("/api/reportify", async (req, res) => {
    const { accountId, accessToken, since, until } = req.body;

    // Validación básica de entrada
    if (!accountId || !accessToken || !since || !until) {
        return res.status(400).json({ 
            error: "Faltan parámetros obligatorios: accountId, accessToken, since o until." 
        });
    }

    try {
        console.log(`📊 Procesando reporte para la cuenta: ${accountId} (${since} al ${until})`);

        // 1. Petición a Meta Ads API
        // Nota: Asegúrate de que el accountId venga sin el prefijo "act_"
        const metaUrl = `https://graph.facebook.com/v19.0/act_${accountId}/insights` +
            `?level=adset` +
            `&fields=adset_id,adset_name,campaign_name,reach,impressions,frequency,spend,inline_link_clicks,inline_link_click_ctr,cost_per_inline_link_click,actions` +
            `&time_range={"since":"${since}","until":"${until}"}` +
            `&time_increment=1` + 
            `&access_token=${accessToken}` +
            `&limit=5000`;

        const metaRes = await fetch(metaUrl);
        const metaData = await metaRes.json();

        if (metaData.error) {
            throw new Error(`Meta API Error: ${metaData.error.message}`);
        }

        // 2. Formateo de datos para la tabla y la IA
        const rawRows = metaData.data.map(item => {
            // Extraer mensajes (soporta diferentes tipos de atribución de Meta)
            const messages = item.actions?.find(a => 
                a.action_type === "onsite_conversion.messaging_conversation_started_7d" || 
                a.action_type === "messaging_conversation_started_7d"
            )?.value || 0;

            return {
                fecha: item.date_start,
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

        // 3. Generación de Resumen con IA
        let aiSummary = "No se pudo generar el análisis de IA.";
        
        if (process.env.OPENAI_API_KEY && rawRows.length > 0) {
            try {
                const completion = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        { 
                            role: "system", 
                            content: "Eres un analista experto en Meta Ads para el mercado de Argentina. Luciano Juárez te envía datos. Resumí los resultados en 3 frases potentes. Sé directo sobre qué campaña está funcionando mejor y por qué." 
                        },
                        { 
                            role: "user", 
                            content: `Analiza estos datos de la semana: ${JSON.stringify(rawRows.slice(0, 15))}` 
                        }
                    ],
                    temperature: 0.7,
                });
                aiSummary = completion.choices[0].message.content;
            } catch (aiErr) {
                console.error("Error en OpenAI:", aiErr.message);
                aiSummary = "Error al conectar con el cerebro de IA.";
            }
        }

        // 4. Respuesta al Frontend
        res.json({
            success: true,
            count: rawRows.length,
            data: rawRows,
            aiSummary: aiSummary
        });

    } catch (err) {
        console.error("❌ Error General:", err.message);
        res.status(500).json({ 
            success: false, 
            error: err.message 
        });
    }
});

// Arrancar el servidor
app.listen(PORT, () => {
    console.log(`
    ---------------------------------------------------
    🚀 Reportify Backend Activo
    📍 Puerto: ${PORT}
    🔗 URL local: http://localhost:${PORT}
    ---------------------------------------------------
    `);
});
