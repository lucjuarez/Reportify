import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const BENCHMARK_ARS = {
    message: { acceptable: 1000, high: 2000 },
    lead: { acceptable: 15000, high: 30000 },
    purchase: { acceptable: 20000, high: 40000 },
    cart: { acceptable: 8000, high: 15000 },
    profile_visit: { acceptable: 500, high: 1200 },
    lpv: { acceptable: 500, high: 1200 }
};

let exchangeCache = { rate: 1, currency: "ARS", timestamp: 0 };
const n = (v) => Number(v) || 0;

async function obtenerTipoCambio(currency) {
    if (currency === "ARS") return 1;
    const now = Date.now();
    if (exchangeCache.currency === currency && now - exchangeCache.timestamp < 3600000) return exchangeCache.rate;
    try {
        const res = await fetch(`https://api.exchangerate.host/latest?base=${currency}&symbols=ARS`);
        const data = await res.json();
        const rate = data?.rates?.ARS || 1;
        exchangeCache = { rate, currency, timestamp: now };
        return rate;
    } catch (e) { return 1; }
}

function detectarObjetivo(c) {
    const objective = (c.objective || "").toUpperCase();
    const optGoal = (c.optimization_goal || "").toUpperCase();
    const convLocation = (c.conversion_location || "").toUpperCase();
    const perfGoal = (c.performance_goal || "").toUpperCase();
    const convEvent = (c.conversion_event || "").toUpperCase();
    const campName = (c.name || "").toUpperCase(); 

    if (convEvent === "PURCHASE" || convEvent === "COMPRA") return "purchase";
    if (convEvent === "ADD_TO_CART" || convEvent === "CARRITO") return "cart";
    if (convEvent === "LEAD" || convEvent === "CONTACTO") return "lead";
    if (convEvent === "VIEW_CONTENT" || convEvent === "CONTENT_VIEW") return "lpv";
    if (perfGoal.includes("INSTAGRAM_PROFILE_VISIT") || perfGoal.includes("PROFILE_VISIT")) return "profile_visit";
    if (convLocation.includes("WHATSAPP") || convLocation.includes("INSTAGRAM_DIRECT") || convLocation.includes("MESSENGER")) return "message";
    if (optGoal.includes("LANDING_PAGE_VIEWS")) return "lpv";
    if (campName.includes("MENSAJE") || campName.includes("WSP") || campName.includes("WHA") || campName.includes("CHAT")) return "message";
    if (campName.includes("IG") || campName.includes("INSTA") || campName.includes("PERFIL")) return "profile_visit";
    if (campName.includes("COMPRA") || campName.includes("PURCHASE")) return "purchase";
    if (campName.includes("LEAD") || campName.includes("POTENCIAL")) return "lead";
    if (campName.includes("WEB") || campName.includes("LPV")) return "lpv";
    if (objective.includes("TRAFFIC")) return "lpv";
    if (objective.includes("LEADS")) return "lead";
    if (objective.includes("SALES")) return "purchase";
    if (objective.includes("MESSAGES")) return "message";
    return "unknown";
}

function evaluarCalidadCosto(objetivo, costoARS) {
    const ref = BENCHMARK_ARS[objetivo];
    if (!ref || costoARS === null || costoARS === 0) return "neutral";
    if (costoARS <= ref.acceptable) return "success";
    if (costoARS > ref.high) return "danger";
    return "warning";
}

function analizarPublicoPorCampaña(data) {
    const campañas = data.campañas_detalle || [];
    return campañas.map(c => {
        const edades = {}, generos = {}, paises = {}, ciudadesPorPais = {};
        (c.breakdowns || []).forEach(b => {
            const resultados = n(b.resultados);
            if (b.age) edades[b.age] = (edades[b.age] || 0) + resultados;
            if (b.gender) generos[b.gender] = (generos[b.gender] || 0) + resultados;
            if (b.country) {
                paises[b.country] = (paises[b.country] || 0) + resultados;
                if (!ciudadesPorPais[b.country]) ciudadesPorPais[b.country] = {};
                if (b.city) ciudadesPorPais[b.country][b.city] = (ciudadesPorPais[b.country][b.city] || 0) + resultados;
            }
        });
        const topPaises = Object.entries(paises).sort((a,b)=>b[1]-a[1]).slice(0,3).map(p=>p[0]);
        const topCiudadesPorPais = {};
        topPaises.forEach(pais => { topCiudadesPorPais[pais] = Object.entries(ciudadesPorPais[pais] || {}).sort((a,b)=>b[1]-a[1]).slice(0,3).map(ci=>ci[0]); });
        return { id: c.id, mejor_segmento_edad: Object.entries(edades).sort((a,b)=>b[1]-a[1])[0]?.[0] || null, mejor_genero: Object.entries(generos).sort((a,b)=>b[1]-a[1])[0]?.[0] || null, top_3_paises: topPaises, top_3_ciudades_por_pais: topCiudadesPorPais };
    });
}

async function calcularScoreMatematico(data, currency) {
    const rate = await obtenerTipoCambio(currency);
    let score = 5.5; 
    for (const c of data.campañas_detalle || []) {
        const spend = n(c.spend);
        const objetivo = detectarObjetivo(c);
        let resultados = (objetivo === "message") ? n(c.msg) : (objetivo === "lead") ? n(c.leads) : (objetivo === "purchase") ? n(c.pur) : (objetivo === "cart") ? n(c.cart) : (objetivo === "lpv") ? n(c.view_content || c.lpv || c.clicks) : n(c.clicks);
        const costoARS = resultados > 0 ? (spend / resultados) * rate : null;
        const nivel = evaluarCalidadCosto(objetivo, costoARS);
        if (nivel === "success") score += 0.8;
        if (nivel === "warning") score -= 0.4;
        if (nivel === "danger") score -= 1.2;
        if (spend > 0 && resultados === 0) score -= 1.8;
        const freq = n(c.freq);
        if (freq > 2.0 && freq <= 2.5) score -= 0.5; 
        if (freq > 2.5 && freq <= 3.0) score -= 1.2; 
        if (freq > 3.0) score -= 2.0; 
    }
    return Number(Math.min(10, Math.max(0, score)).toFixed(1));
}

async function analizarConIA(data, currency) {
    const scoreBase = await calcularScoreMatematico(data, currency);
    const publicoData = analizarPublicoPorCampaña(data);
    const campañasFiltradas = (data.campañas_detalle || []).map(c => {
        const obj = detectarObjetivo(c);
        let res = (obj === "message") ? n(c.msg) : (obj === "lead") ? n(c.leads) : (obj === "purchase") ? n(c.pur) : (obj === "cart") ? n(c.cart) : n(c.view_content || c.lpv || c.clicks);
        return { id: c.id, name: c.name, objetivo_asignado: obj, inversion: n(c.spend), frecuencia: n(c.freq), ctr: n(c.ctr_meta), resultado_principal: res, status: c.effective_status };
    });

    const prompt = `Actúa como Luciano Federico Juarez, Director de Estrategia Senior. Tu misión es EXPLICAR la lógica de la cuenta Reportify. PUNTAJE GLOBAL: ${scoreBase}. Escala 0-10. Diccionario: message, lpv, profile_visit, purchase, cart, lead. Reglas: No mezclar, No dar consejos de optimización, solo diagnosticar. Devuelve JSON con score, urgencia, diagnostico_general, analisis_campañas e insight_publico. DATOS: ${JSON.stringify(campañasFiltradas)}`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.1,
            messages: [{ role: "system", content: "Eres Luciano Federico Juarez. Estratega senior de Reportify." }, { role: "user", content: prompt }]
        });
        const aiRes = JSON.parse(response.choices[0].message.content.replace(/```json|```/g, ""));
        return { ...aiRes, analisis_publico_por_campaña: publicoData };
    } catch (error) { return { score: scoreBase, urgencia: "ESTABLE", diagnostico_general: "Error IA.", analisis_campañas: [], analisis_publico_por_campaña: publicoData }; }
}

app.post("/analizar", async (req, res) => {
    try {
        const resultado = await analizarConIA(req.body, req.body.currency || "ARS");
        res.json(resultado);
    } catch (err) { res.status(500).json({ error: "Fallo motor" }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`🚀 Reportify Master Auditor Senior activo en puerto ${PORT}`); });
