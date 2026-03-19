import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

// Carga de variables de entorno (Ya no necesitamos OpenAI key aquí)
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

//////////////////////////////////////////////////////////
// 1. CONFIGURACIÓN ESTRATÉGICA Y DIVISAS
//////////////////////////////////////////////////////////

let exchangeCache = {
    rate: 1,
    currency: "ARS",
    timestamp: 0
};

const n = (v) => Number(v) || 0;

async function obtenerTipoCambio(currency) {
    if (currency === "ARS") return 1;

    const now = Date.now();
    if (exchangeCache.currency === currency && now - exchangeCache.timestamp < 3600000) {
        return exchangeCache.rate;
    }

    try {
        const res = await fetch(`https://api.exchangerate.host/latest?base=${currency}&symbols=ARS`);
        const data = await res.json();
        const rate = data?.rates?.ARS || 1;

        exchangeCache = { rate, currency, timestamp: now };
        return rate;
    } catch (e) {
        console.log("⚠️ Error en API de divisas, usando 1:1");
        return 1;
    }
}

//////////////////////////////////////////////////////////
// 2. ENDPOINTS Y SERVIDOR (Motor de Datos Simplificado)
//////////////////////////////////////////////////////////

// El backend ahora solo procesa y estructura los datos recibidos (con desglose semanal),
// convierte la inversión a ARS si es necesario, y devuelve la estructura limpia al front.
app.post("/analizar", async (req, res) => {
    try {
        const data = req.body;
        const targetCurrency = data.currency || "ARS";
        const rate = await obtenerTipoCambio(targetCurrency);

        // data.weeks = [ { label, rawCampaigns: [ { campaignData, adsets: [ { adsetData } ] } ] } ]
        
        // El frontend enviará una estructura jerárquica con los datos desglosados semanalmente.
        // Aquí simplemente confirmamos que los costos estén convertidos si aplica
        // o pasamos la tasa de conversión para que el front la maneje.
        
        res.json({ ...data, conversionRateToARS: rate }); // Devolvemos los datos procesados jerárquicamente
    } catch (err) {
        res.status(500).json({ error: "Fallo en motor estratégico simplificado" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Reportify Master Auditor Senior activo en puerto ${PORT}`);
});
