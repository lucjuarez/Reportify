import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

// Carga de variables de entorno (Ya no necesitamos OpenAI para esta versión de Dashboard)
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

// Función para obtener la tasa de cambio si la cuenta publicitaria no está en pesos
async function obtenerTipoCambio(currency) {
    if (currency === "ARS") return 1;

    const now = Date.now();
    // Usa caché por 1 hora para no saturar la API
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

/* El backend ahora es súper liviano. Solo recibe la petición del frontend, 
  verifica si necesita convertir la moneda a ARS, y le devuelve la tasa 
  de conversión exacta para que el frontend arme la tabla visual.
*/
app.post("/analizar", async (req, res) => {
    try {
        const data = req.body;
        const targetCurrency = data.currency || "ARS";
        const rate = await obtenerTipoCambio(targetCurrency);
        
        // Devolvemos los datos con la tasa de conversión lista para usar
        res.json({ ...data, conversionRateToARS: rate }); 
    } catch (err) {
        res.status(500).json({ error: "Fallo en motor de dashboard simplificado" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Reportify Dashboard Server activo en puerto ${PORT}`);
});
