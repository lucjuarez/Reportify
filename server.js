<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reportify | Diagnósticos y Reportes de Meta Ads</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    
    <style>
        #mc-app-root { font-family: 'Inter', sans-serif; background-color: #ffffff; color: #000000; }
        .workbook-select, .workbook-date, .search-input { background: #F9FAFB !important; border: 1px solid #E5E7EB !important; border-bottom: 2px solid #000000 !important; padding: 0.75rem 1rem !important; border-radius: 4px !important; width: 100%; font-size: 0.9rem; }
        .search-input { border-bottom: 1px solid #E5E7EB !important; margin-bottom: 0.5rem; }
        .btn-primary { background-color: #000000 !important; color: #FFFFFF !important; border: 2px solid #000000 !important; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 900; cursor: pointer; transition: 0.2s; }
        .btn-fb { background-color: #1877f2 !important; color: white; padding: 1rem 2rem; border-radius: 0.5rem; font-weight: 700; cursor: pointer; }
        .btn-wp { background-color: #25D366 !important; color: white; padding: 1rem 2rem; border-radius: 0.5rem; font-weight: 700; transition: 0.2s; }
        .btn-wp:hover { background-color: #128C7E !important; }
        .hidden { display: none !important; }
        .list-container { max-height: 250px; overflow-y: auto; background: #F9FAFB; border: 1px solid #E5E7EB; border-bottom: 2px solid #000; padding: 1rem; }
        .checkbox-item { display: flex; align-items: center; margin-bottom: 0.75rem; cursor: pointer; font-size: 0.75rem; font-weight: 600; }
        .campaign-card { border: 1px solid #E2E8F0; border-left: 10px solid #000; padding: 2rem; background: #fff; border-radius: 4px; margin-bottom: 2.5rem; page-break-inside: avoid; }
        .feedback-box { padding: 1.5rem; margin-top: 1.5rem; border-radius: 4px; font-size: 0.95rem; border-left: 4px solid #fff; line-height: 1.6; }
        .feedback-neutral { background: #f8fafc; color: #1e293b; border-color: #64748b; }
        .feedback-danger { background: #FEF2F2 !important; color: #991B1B !important; border-color: #F87171 !important; }
        .feedback-warning { background: #FFFBEB !important; color: #92400E !important; border-color: #FBBF24 !important; }
        .feedback-success { background: #F0FDF4 !important; color: #166534 !important; border-color: #4ADE80 !important; }
        .filter-badge { background: #f3f4f6; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; display: flex; align-items: center; gap: 8px; cursor: pointer; border: 1px solid #e5e7eb; transition: 0.2s; }
        .filter-badge:hover { background: #e5e7eb; }
    </style>
</head>
<body class="bg-gray-50 min-h-screen flex justify-center items-start">

    <div id="mc-app-root" class="w-full max-w-6xl bg-white shadow-2xl min-h-screen flex flex-col">
        <nav class="w-full bg-white border-b border-gray-100 p-6 flex items-center justify-between">
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-black text-white flex items-center justify-center text-lg font-black shrink-0 rounded-md shadow-sm">RY</div>
                <div class="flex flex-col">
                    <span class="font-black text-xl leading-none tracking-tight">Report<span class="text-blue-600">ify</span></span>
                    <span class="font-bold text-[10px] uppercase text-gray-500 mt-1 leading-none tracking-wider">Sistema de Luciano Juárez</span>
                </div>
            </div>
            <div class="text-[10px] font-bold uppercase text-green-600 px-3 py-1 bg-green-50 rounded-full border border-green-200">SISTEMA CONECTADO</div>
        </nav>

        <main class="p-4 md:p-12 w-full">
            <div id="input-view" class="max-w-4xl mx-auto space-y-12">
                <div class="border-b-4 border-black pb-8">
                    <h1 class="text-5xl md:text-7xl font-black leading-none tracking-tighter">Report<span class="text-blue-600">ify</span></h1>
                    <p class="mt-4 text-lg md:text-xl font-medium text-gray-500 tracking-tight">Diagnósticos y Reportes de Meta Ads</p>
                </div>
                
                <div id="fb-login-section" class="py-12 bg-gray-50 text-center rounded-lg border border-gray-100">
                    <button id="btn-facebook-login" class="btn-fb shadow-lg">Vincular con Facebook Ads</button>
                </div>

                <div id="selectors-section" class="hidden space-y-12">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div>
                            <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Cuenta Publicitaria</label>
                            <input type="text" id="searchAccountInput" class="search-input" placeholder="🔍 Buscar por nombre..." onkeyup="filtrarCuentas()">
                            <select id="adAccountsDropdown" class="workbook-select" onchange="limpiarYcargar()">
                                <option value="">-- Elige cuenta --</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Periodo</label>
                            <select id="datePreset" class="workbook-select" onchange="toggleDateInputs()">
                                <option value="last_7d">Últimos 7 días</option>
                                <option value="last_30d" selected>Últimos 30 días</option>
                                <option value="this_month">Este mes</option>
                                <option value="custom">Calendario Personalizado...</option>
                            </select>
                        </div>
                    </div>
                    <div id="custom-date-inputs" class="hidden grid grid-cols-2 gap-4">
                        <input type="date" id="sinceDate" class="workbook-date" onchange="verificarCambioFiltros()">
                        <input type="date" id="untilDate" class="workbook-date" onchange="verificarCambioFiltros()">
                    </div>
                    
                    <div id="campaign-section" class="hidden space-y-10">
                        <div class="flex flex-col md:flex-row justify-between items-start md:items-end border-b pb-2 mb-4 gap-4">
                            <h3 class="text-sm font-black uppercase">1. Seleccionar Campañas</h3>
                            <div class="flex flex-wrap gap-2">
                                <label class="filter-badge"><input type="checkbox" id="onlyActiveFilter" onchange="aplicarFiltros()"> SOLO ACTIVAS</label>
                                <label class="filter-badge bg-blue-50 border-blue-200 text-blue-700"><input type="checkbox" id="withDeliveryFilter" onchange="aplicarFiltros()"> CON ENTREGA</label>
                            </div>
                        </div>
                        <div class="list-container" id="campaign-list"></div>
                        
                        <h3 class="text-sm font-black uppercase border-b pb-2 mb-4">2. Métricas de la Auditoría</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 p-6 bg-gray-50 rounded border">
                            <label class="checkbox-item"><input type="checkbox" value="resultados" class="metric-cb mr-2" checked> Resultados (Dinámico)</label>
                            <label class="checkbox-item"><input type="checkbox" value="cpr" class="metric-cb mr-2" checked> Costo por Resultado</label>
                            <label class="checkbox-item"><input type="checkbox" value="reach" class="metric-cb mr-2" checked> Alcance</label>
                            <label class="checkbox-item"><input type="checkbox" value="frequency" class="metric-cb mr-2" checked> Frecuencia</label>
                            <label class="checkbox-item"><input type="checkbox" value="ctr" class="metric-cb mr-2" checked> CTR (%)</label>
                            <label class="checkbox-item"><input type="checkbox" value="clicks" class="metric-cb mr-2" checked> Clics</label>
                            <label class="checkbox-item"><input type="checkbox" value="cpc" class="metric-cb mr-2" checked> Costo por Clic (CPC)</label>
                            <label class="checkbox-item"><input type="checkbox" value="messaging_conversation_started_7d" class="metric-cb mr-2" checked> Mensajes iniciados</label>
                            <label class="checkbox-item"><input type="checkbox" value="lead" class="metric-cb mr-2" checked> Leads (Formularios)</label>
                            <label class="checkbox-item"><input type="checkbox" value="cpl" class="metric-cb mr-2" checked> Costo por Lead (CPL)</label>
                            <label class="checkbox-item"><input type="checkbox" value="view_content" class="metric-cb mr-2" checked> Visitas Landing (LPV)</label>
                            <label class="checkbox-item"><input type="checkbox" value="cart" class="metric-cb mr-2" checked> Carritos</label>
                            <label class="checkbox-item"><input type="checkbox" value="checkout" class="metric-cb mr-2" checked> Pagos Iniciados</label>
                            <label class="checkbox-item"><input type="checkbox" value="purchase" class="metric-cb mr-2" checked> Compras</label>
                            <label class="checkbox-item"><input type="checkbox" value="cpp" class="metric-cb mr-2" checked> Costo Compra (CPA)</label>
                            <label class="checkbox-item"><input type="checkbox" value="val" class="metric-cb mr-2" checked> Valor de Conversión</label>
                            <label class="checkbox-item"><input type="checkbox" value="roas" class="metric-cb mr-2" checked> ROAS</label>
                            <label class="checkbox-item"><input type="checkbox" value="spend" class="metric-cb mr-2" checked disabled> Inversión Total</label>
                        </div>
                        <button onclick="ejecutarAuditoria()" class="w-full btn-primary py-5 rounded shadow-2xl flex items-center justify-center gap-3"><span>Generar Reporte Global Definitivo</span><i data-lucide="zap"></i></button>
                    </div>
                </div>
            </div>

            <div id="loading-view" class="hidden py-24 text-center">
                <div class="w-12 h-12 border-4 border-black border-t-transparent animate-spin rounded-full mx-auto mb-6"></div>
                <h2 class="text-2xl font-black uppercase tracking-tighter italic">Procesando Inteligencia Global...</h2>
            </div>

            <div id="results-view" class="hidden max-w-5xl mx-auto">
                <div id="pdf-content" class="p-6 bg-white">
                    <div class="border-b-8 border-black pb-8 mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div class="w-full md:w-auto">
                            <h2 class="text-4xl md:text-5xl font-black leading-none tracking-tighter">Hoja de Resultados<br>Report<span class="text-blue-600">ify</span></h2>
                            <div class="mt-4 space-y-1">
                                <p id="res-ui-account" class="text-xs font-black text-blue-600 uppercase tracking-widest break-words"></p>
                                <p id="res-ui-period" class="text-xs font-bold text-gray-400 uppercase tracking-tighter"></p>
                            </div>
                        </div>
                        <div class="w-full md:w-auto text-left md:text-right">
                            <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">Inversión Total Analizada</p>
                            <p id="res-spend-title" class="text-2xl md:text-3xl font-black leading-none text-black break-words">$ 0,00</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
                        <div class="md:col-span-4 bg-gray-50 p-8 border-l-8 border-black text-center flex flex-col justify-center items-center">
                            <span id="score-display" class="text-7xl font-black tracking-tighter text-blue-600 leading-none">0.0</span>
                            <div id="score-emoji" class="text-6xl my-4">🚀</div>
                            <div id="score-label" class="text-xl font-black uppercase tracking-tight italic">AUDITORÍA IA</div>
                        </div>
                        <div class="md:col-span-8 flex flex-col justify-center">
                            <h3 class="text-xs font-black text-gray-400 uppercase mb-4 tracking-widest">Diagnóstico Estratégico</h3>
                            <div id="general-diagnosis" class="text-lg font-light text-gray-800 leading-relaxed border-l-4 border-blue-600 pl-4"></div>
                        </div>
                    </div>

                    <div id="campaign-cards-container" class="space-y-12"></div>
                </div>

                <div id="action-buttons" class="mt-12 flex flex-wrap gap-4 justify-center items-center pb-24">
                    <button onclick="descargarPDF()" class="bg-red-600 text-white py-4 px-6 rounded flex items-center justify-center gap-2 font-bold uppercase hover:bg-red-700 shadow-xl transition-all text-xs">
                        <i data-lucide="file-text" class="w-5 h-5"></i> Descargar PDF
                    </button>
                    <button onclick="descargarExcelLooker()" class="bg-blue-600 text-white py-4 px-6 rounded flex items-center justify-center gap-2 font-bold uppercase hover:bg-blue-700 shadow-xl transition-all text-xs">
                        <i data-lucide="file-spreadsheet" class="w-5 h-5"></i> Descargar Excel Pro
                    </button>
                    <a href="https://wa.link/avi3aj" target="_blank" class="btn-wp flex items-center justify-center gap-2 shadow-xl text-xs uppercase">Hablar con Luciano</a>
                    <button onclick="reiniciarApp()" class="bg-gray-200 text-black py-4 px-8 rounded font-bold uppercase text-xs hover:bg-gray-300 transition-all">Nueva Auditoría</button>
                </div>
            </div>
        </main>
    </div>

    <script>
        // VARIABLES CONFIGURADAS EXACTAMENTE SEGÚN TUS CAPTURAS
        const APP_ID = '1261560592042504';
        const REDIRECT_URI = 'https://www.lucianojuarez.com.ar/reportify/';
        const RENDER_URL = 'https://reportify-80id.onrender.com/analizar';

        let reporteData = null;
        let todasLasCampanas = [];
        let todasLasCuentas = [];

        const formatMoney = (val, currencyCode = 'ARS') => {
            return new Intl.NumberFormat('es-AR', { style: 'currency', currency: currencyCode }).format(val || 0);
        };

        document.addEventListener('DOMContentLoaded', () => {
            try { lucide.createIcons(); } catch(e) {}
            const hash = window.location.hash.substring(1);
            const params = new URLSearchParams(hash);
            const token = params.get('access_token') || sessionStorage.getItem('fb_token');

            if (token) {
                sessionStorage.setItem('fb_token', token);
                document.getElementById('fb-login-section').classList.add('hidden');
                document.getElementById('selectors-section').classList.remove('hidden');
                obtenerCuentas(token);
                setTimeout(() => window.history.replaceState({}, document.title, window.location.pathname), 500);
            }

            document.getElementById('btn-facebook-login').onclick = () => {
                window.location.href = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=ads_read&response_type=token`;
            };
        });

        // --- JERARQUÍA: LO TÉCNICO (EL PÍXEL) MANDA ---
        function detectarObjetivoFrontend(c) {
            const objective = (c.objective || "").toUpperCase();
            const optGoal = (c.optimization_goal || "").toUpperCase();
            const convEvent = (c.conversion_event || "").toUpperCase();
            const convLocation = (c.conversion_location || "").toUpperCase();
            const perfGoal = (c.performance_goal || "").toUpperCase();
            const campName = (c.name || "").toUpperCase(); 

            // 1. EVENTOS TÉCNICOS EXPLÍCITOS (LA VERDAD ABSOLUTA DE META)
            if (convEvent === "PURCHASE" || convEvent === "COMPRA") return { key: "purchase", label: "Compras" };
            if (convEvent === "ADD_TO_CART" || convEvent === "CARRITO") return { key: "cart", label: "Carritos" };
            if (convEvent === "LEAD" || convEvent === "CONTACTO") return { key: "lead", label: "Leads" };
            if (convEvent === "VIEW_CONTENT" || convEvent === "CONTENT_VIEW") return { key: "lpv", label: "Visitas Web (View Content)" };
            
            // Metas de Rendimiento y Ubicación Clave
            if (perfGoal.includes("INSTAGRAM_PROFILE_VISIT") || perfGoal.includes("PROFILE_VISIT")) return { key: "profile_visit", label: "Visitas al Perfil" };
            if (convLocation.includes("WHATSAPP") || convLocation.includes("INSTAGRAM_DIRECT") || convLocation.includes("MESSENGER")) return { key: "message", label: "Mensajes" };
            if (optGoal.includes("LANDING_PAGE_VIEWS")) return { key: "lpv", label: "Visitas Web (LPV)" };

            // 2. NOMBRES DE CAMPAÑA (Plan B si Meta no devuelve el evento claro)
            if (campName.includes("MENSAJE") || campName.includes("WSP") || campName.includes("WHA") || campName.includes("CHAT") || campName.includes("DM")) return { key: "message", label: "Mensajes" };
            if (campName.includes("IG") || campName.includes("INSTA") || campName.includes("PERFIL")) return { key: "profile_visit", label: "Visitas al Perfil" };
            if (campName.includes("CARRITO") || campName.includes("CART")) return { key: "cart", label: "Carritos" };
            if (campName.includes("COMPRA") || campName.includes("PURCHASE") || campName.includes("VENTA")) return { key: "purchase", label: "Compras" };
            if (campName.includes("LEAD") || campName.includes("POTENCIAL") || campName.includes("FORMULARIO")) return { key: "lead", label: "Leads" };
            if (campName.includes("WEB") || campName.includes("VIEW CONTENT") || campName.includes("LPV") || campName.includes("LANDING") || campName.includes("TRAFICO")) return { key: "lpv", label: "Visitas Web (LPV)" };

            // 3. OBJETIVOS GENERALES DE CAMPAÑA (Último recurso)
            if (objective.includes("OUTCOME_TRAFFIC") || objective.includes("TRAFFIC")) return { key: "lpv", label: "Visitas Web" };
            if (objective.includes("OUTCOME_LEADS") || objective.includes("LEADS")) return { key: "lead", label: "Leads" };
            if (objective.includes("OUTCOME_SALES") || objective.includes("CONVERSIONS")) return { key: "purchase", label: "Compras" };
            if (objective.includes("OUTCOME_ENGAGEMENT") || objective.includes("MESSAGES")) return { key: "message", label: "Mensajes" };

            return { key: "unknown", label: "Clics / Otros" };
        }

        function obtenerCuentas(token) {
            fetch(`https://graph.facebook.com/v19.0/me/adaccounts?fields=name,account_id,currency&limit=200&access_token=${token}`)
                .then(res => res.json())
                .then(data => {
                    if (data.data) {
                        todasLasCuentas = data.data.sort((a, b) => (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase()));
                        renderizarDropdownCuentas(todasLasCuentas);
                    }
                });
        }

        function renderizarDropdownCuentas(cuentas) {
            const dropdown = document.getElementById('adAccountsDropdown');
            dropdown.innerHTML = '<option value="">-- Selecciona cuenta --</option>';
            cuentas.forEach(c => {
                const opt = new Option(c.name || c.id, c.account_id);
                opt.setAttribute('data-currency', c.currency || 'ARS');
                dropdown.add(opt);
            });
        }

        function filtrarCuentas() {
            const texto = document.getElementById('searchAccountInput').value.toLowerCase();
            renderizarDropdownCuentas(todasLasCuentas.filter(c => (c.name || '').toLowerCase().includes(texto)));
        }

        function limpiarYcargar() {
            const id = document.getElementById('adAccountsDropdown').value;
            if (id) cargarCampanas(id.replace('act_',''));
        }

        async function cargarCampanas(cuentaId) {
            const token = sessionStorage.getItem('fb_token');
            const res = await fetch(`https://graph.facebook.com/v19.0/act_${cuentaId}/campaigns?fields=name,status,effective_status,objective&limit=500&access_token=${token}`);
            const data = await res.json();
            if (data.data) {
                const camps = data.data.filter(c => 
                    c.status !== 'DELETED' && 
                    !c.name.toLowerCase().includes('publicación de instagram') &&
                    !c.name.toLowerCase().includes('instagram post')
                );
                
                const fullData = await Promise.all(camps.map(async c => {
                    const r = await fetch(`https://graph.facebook.com/v19.0/${c.id}/adsets?fields=optimization_goal,promoted_object,destination_type,performance_goal&limit=50&access_token=${token}`);
                    const adsets = await r.json();
                    return { ...c, adsets: adsets.data || [] };
                }));
                todasLasCampanas = fullData;
                aplicarFiltros(); 
                document.getElementById('campaign-section').classList.remove('hidden');
            }
        }

        async function aplicarFiltros() {
            const soloActivas = document.getElementById('onlyActiveFilter').checked;
            const conEntrega = document.getElementById('withDeliveryFilter').checked;
            
            let filtradas = todasLasCampanas;

            if (soloActivas) {
                filtradas = filtradas.filter(c => c.effective_status === 'ACTIVE');
            }

            if (conEntrega) {
                const token = sessionStorage.getItem('fb_token');
                const cuentaId = document.getElementById('adAccountsDropdown').value.replace('act_', '');
                if (!cuentaId) return;

                const periodoId = document.getElementById('datePreset').value;
                const since = document.getElementById('sinceDate').value;
                const until = document.getElementById('untilDate').value;
                
                if (periodoId === 'custom' && (!since || !until)) {
                    renderizarListaFiltrada(filtradas, false);
                    return;
                }

                let timeParams = periodoId === 'custom' 
                    ? `time_range=${JSON.stringify({since, until})}` 
                    : `date_preset=${periodoId}`;

                document.getElementById('campaign-list').innerHTML = '<div class="text-center text-xs p-6 text-blue-600 font-bold animate-pulse">Consultando entrega real en Meta...</div>';

                try {
                    const res = await fetch(`https://graph.facebook.com/v19.0/act_${cuentaId}/insights?level=campaign&fields=campaign_id&limit=500&${timeParams}&access_token=${token}`);
                    const data = await res.json();
                    const campañasConEntregaIDs = new Set((data.data || []).map(d => d.campaign_id));
                    
                    filtradas = filtradas.filter(c => campañasConEntregaIDs.has(c.id));
                } catch (e) {
                    console.error("Error al buscar entrega", e);
                }
            }

            renderizarListaFiltrada(filtradas, conEntrega);
        }

        function renderizarListaFiltrada(filtradasArray = todasLasCampanas, autoCheck = false) {
            document.getElementById('campaign-list').innerHTML = filtradasArray.map(c => `
                <label class="checkbox-item"><input type="checkbox" value="${c.id}" class="camp-cb mr-2" ${autoCheck ? 'checked' : ''}> ${c.name} 
                <span class="ml-2 text-[9px] ${c.effective_status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'} px-2 py-0.5 rounded uppercase font-bold">${c.effective_status}</span></label>
            `).join('');
        }

        function toggleDateInputs() {
            document.getElementById('custom-date-inputs').classList.toggle('hidden', document.getElementById('datePreset').value !== 'custom');
            verificarCambioFiltros();
        }

        function verificarCambioFiltros() {
            if (document.getElementById('withDeliveryFilter').checked) aplicarFiltros();
        }

        async function ejecutarAuditoria() {
            const selectedCamps = Array.from(document.querySelectorAll('.camp-cb:checked')).map(cb => cb.value);
            if (!selectedCamps.length) return alert("Selecciona campañas.");

            document.getElementById('input-view').classList.add('hidden');
            document.getElementById('loading-view').classList.remove('hidden');

            const token = sessionStorage.getItem('fb_token');
            const dropdown = document.getElementById('adAccountsDropdown');
            const accountCurrency = dropdown.options[dropdown.selectedIndex].getAttribute('data-currency');
            const periodoId = document.getElementById('datePreset').value;
            let timeParams = periodoId === 'custom' ? `time_range=${JSON.stringify({since: document.getElementById('sinceDate').value, until: document.getElementById('untilDate').value})}` : `date_preset=${periodoId}`;

            try {
                const urlGral = `https://graph.facebook.com/v19.0/act_${dropdown.value}/insights?level=campaign&fields=campaign_id,campaign_name,spend,impressions,reach,frequency,inline_link_clicks,inline_link_click_ctr,cost_per_inline_link_click,actions,action_values,cost_per_action_type,purchase_roas&filtering=${encodeURIComponent(JSON.stringify([{field:"campaign.id",operator:"IN",value:selectedCamps}]))}&${timeParams}&access_token=${token}`;
                const resGral = await fetch(urlGral);
                const dataGral = await resGral.json();

                const urlDemo = `https://graph.facebook.com/v19.0/act_${dropdown.value}/insights?level=campaign&breakdowns=age,gender&fields=campaign_id,actions&filtering=${encodeURIComponent(JSON.stringify([{field:"campaign.id",operator:"IN",value:selectedCamps}]))}&${timeParams}&access_token=${token}`;
                const resDemo = await fetch(urlDemo);
                const dataDemo = await resDemo.json();

                const urlGeo = `https://graph.facebook.com/v19.0/act_${dropdown.value}/insights?level=campaign&breakdowns=country,region&fields=campaign_id,actions&filtering=${encodeURIComponent(JSON.stringify([{field:"campaign.id",operator:"IN",value:selectedCamps}]))}&${timeParams}&access_token=${token}`;
                const resGeo = await fetch(urlGeo);
                const dataGeo = await resGeo.json();

                let processed = [];
                let totalSpend = 0;

                dataGral.data.forEach(camp => {
                    totalSpend += parseFloat(camp.spend || 0);
                    const base = todasLasCampanas.find(x => x.id === camp.campaign_id);
                    const adset = base?.adsets[0] || {};
                    
                    // EXTRAEMOS EL EVENTO DEL PÍXEL REAL
                    const promotedObj = adset.promoted_object || {};
                    const convEventReal = promotedObj.custom_event_type || promotedObj.pixel_rule || "";
                    
                    let c = {
                        id: camp.campaign_id, name: camp.campaign_name, spend: parseFloat(camp.spend),
                        objective: base.objective, optimization_goal: adset.optimization_goal,
                        conversion_location: adset.destination_type, performance_goal: adset.performance_goal,
                        conversion_event: convEventReal, 
                        status: base.status, effective_status: base.effective_status,
                        impr: parseInt(camp.impressions || 0), reach: parseInt(camp.reach || 0),
                        freq: parseFloat(camp.frequency || 0), 
                        ctr_meta: parseFloat(camp.inline_link_click_ctr || 0), 
                        cpc_meta: parseFloat(camp.cost_per_inline_link_click || 0),
                        clicks: parseInt(camp.inline_link_clicks || 0), 
                        msg:0, leads:0, pur:0, cart:0, lpv:0, val:0, checkout:0, view_content:0,
                        cpr_meta: 0, cpl_meta: 0, cpa_meta: 0, roas_meta: 0, cplpv_meta: 0, cp_cart_meta: 0, resultados_obj: 0,
                        breakdowns: []
                    };

                    const extraerValorMeta = (arr, keys) => {
                        if (!arr) return 0;
                        for (let k of keys) {
                            const a = arr.find(x => x.action_type === k || x.action_type.includes(k));
                            if (a) return parseFloat(a.value);
                        }
                        return 0;
                    };

                    if (camp.actions) {
                        c.msg = extraerValorMeta(camp.actions, ["onsite_conversion.messaging_conversation_started_7d", "onsite_conversion.messaging_first_reply", "messaging"]);
                        c.leads = extraerValorMeta(camp.actions, ["lead"]);
                        c.pur = extraerValorMeta(camp.actions, ["offsite_conversion.fb_pixel_purchase", "purchase"]);
                        c.cart = extraerValorMeta(camp.actions, ["add_to_cart"]);
                        c.lpv = extraerValorMeta(camp.actions, ["landing_page_view"]);
                        c.view_content = extraerValorMeta(camp.actions, ["view_content"]);
                        c.checkout = extraerValorMeta(camp.actions, ["initiate_checkout"]);
                    }
                    if (camp.action_values) c.val = extraerValorMeta(camp.action_values, ["purchase"]);

                    const obj = detectarObjetivoFrontend(c);
                    
                    // Asignación estricta de métricas
                    if (obj.key === "message") c.resultados_obj = c.msg;
                    else if (obj.key === "lead") c.resultados_obj = c.leads;
                    else if (obj.key === "purchase") c.resultados_obj = c.pur;
                    else if (obj.key === "cart") c.resultados_obj = c.cart;
                    else if (obj.key === "lpv") c.resultados_obj = c.view_content || c.lpv || c.clicks;
                    else if (obj.key === "profile_visit") c.resultados_obj = c.clicks;
                    else c.resultados_obj = c.clicks;

                    if (camp.cost_per_action_type) {
                        c.cpl_meta = extraerValorMeta(camp.cost_per_action_type, ["lead"]);
                        c.cpa_meta = extraerValorMeta(camp.cost_per_action_type, ["offsite_conversion.fb_pixel_purchase", "purchase"]);
                        c.cp_cart_meta = extraerValorMeta(camp.cost_per_action_type, ["add_to_cart"]);
                        c.cplpv_meta = extraerValorMeta(camp.cost_per_action_type, ["landing_page_view"]);
                        
                        if (obj.key === "message") c.cpr_meta = extraerValorMeta(camp.cost_per_action_type, ["onsite_conversion.messaging_conversation_started_7d", "onsite_conversion.messaging_first_reply", "messaging"]);
                        else if (obj.key === "lead") c.cpr_meta = c.cpl_meta;
                        else if (obj.key === "purchase") c.cpr_meta = c.cpa_meta;
                        else if (obj.key === "cart") c.cpr_meta = c.cp_cart_meta;
                        else if (obj.key === "lpv") c.cpr_meta = extraerValorMeta(camp.cost_per_action_type, ["view_content"]) || c.cplpv_meta || c.cpc_meta;
                        else c.cpr_meta = c.cpc_meta;
                    }

                    if (camp.purchase_roas) c.roas_meta = extraerValorMeta(camp.purchase_roas, ["purchase"]);

                    if(c.cpr_meta === 0 && c.resultados_obj > 0) c.cpr_meta = c.spend / c.resultados_obj;
                    if(c.cpl_meta === 0 && c.leads > 0) c.cpl_meta = c.spend / c.leads;
                    if(c.cpa_meta === 0 && c.pur > 0) c.cpa_meta = c.spend / c.pur;
                    if(c.roas_meta === 0 && c.spend > 0) c.roas_meta = c.val / c.spend;

                    const extraerDemograficos = (actionsArr) => {
                        return extraerValorMeta(actionsArr, ["onsite_conversion.messaging_conversation_started_7d", "onsite_conversion.messaging_first_reply", "messaging", "lead", "offsite_conversion.fb_pixel_purchase", "purchase", "add_to_cart", "landing_page_view", "link_click"]);
                    };

                    if(dataDemo.data) {
                        dataDemo.data.filter(b => b.campaign_id === camp.campaign_id).forEach(row => {
                            const res = extraerDemograficos(row.actions);
                            if(res > 0 && row.age && row.age !== 'unknown' && row.gender && row.gender !== 'unknown') {
                                c.breakdowns.push({ age: row.age, gender: row.gender, resultados: res });
                            }
                        });
                    }
                    
                    if(dataGeo.data) {
                        dataGeo.data.filter(b => b.campaign_id === camp.campaign_id).forEach(row => {
                            const res = extraerDemograficos(row.actions);
                            if(res > 0 && row.country && row.country !== 'unknown') {
                                const city = (row.region && row.region !== 'unknown') ? row.region : null;
                                c.breakdowns.push({ country: row.country, city: city, resultados: res });
                            }
                        });
                    }

                    processed.push(c);
                });

                const aiRes = await fetch(RENDER_URL, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ currency: accountCurrency, campañas_detalle: processed })
                });
                
                if (!aiRes.ok) throw new Error("Fallo en la IA");
                const iaResponse = await aiRes.json();
                
                reporteData = { iaResponse, camps: processed, totalSpend, nombreCuenta: dropdown.options[dropdown.selectedIndex].text, accountCurrency, textoPeriodo: document.getElementById('datePreset').options[document.getElementById('datePreset').selectedIndex].text, metricsSelected: Array.from(document.querySelectorAll('.metric-cb:checked')).map(cb => cb.value) };
                renderResults();
            } catch (e) { console.error(e); alert("Error procesando los datos. Revisa la consola."); reiniciarApp(); }
        }

        function renderResults() {
            const { iaResponse, camps, totalSpend, nombreCuenta, accountCurrency, textoPeriodo, metricsSelected } = reporteData;
            document.getElementById('loading-view').classList.add('hidden');
            document.getElementById('results-view').classList.remove('hidden');

            document.getElementById('res-spend-title').innerText = formatMoney(totalSpend, accountCurrency);
            document.getElementById('res-ui-account').innerText = `Cuenta: ${nombreCuenta} (${accountCurrency})`;
            document.getElementById('res-ui-period').innerText = `Periodo: ${textoPeriodo}`;
            
            const score = iaResponse?.score ? parseFloat(iaResponse.score).toFixed(1) : "0.0";
            let emoji = "⚖️";
            if(score !== "0.0") {
                if (score >= 9.0) emoji = "🚀";
                else if (score >= 7.5) emoji = "🔥";
                else if (score >= 4.5) emoji = "⚠️";
                else emoji = "🚨";
            }
            document.getElementById('score-display').innerText = score;
            document.getElementById('score-emoji').innerText = emoji;
            document.getElementById('score-label').innerText = iaResponse?.urgencia || "ESTABLE";
            document.getElementById('general-diagnosis').innerText = iaResponse?.diagnostico_general || "Análisis completado.";

            let html = "";
            camps.forEach(c => {
                const fbIA = iaResponse?.analisis_campañas?.find(a => a.id === c.id);
                const objDetectado = detectarObjetivoFrontend(c);
                
                const labelsMap = {
                    resultados: `Resultados (${objDetectado.label}): ${c.resultados_obj.toLocaleString()}`,
                    cpr: `Costo/Resultado (CPR): ${formatMoney(c.cpr_meta, accountCurrency)}`,
                    reach: `Alcance: ${c.reach.toLocaleString()}`,
                    frequency: `Frecuencia: ${c.freq.toFixed(2)}`,
                    ctr: `CTR: ${c.ctr_meta.toFixed(2)}%`,
                    clicks: `Clics: ${c.clicks.toLocaleString()}`,
                    cpc: `CPC: ${formatMoney(c.cpc_meta, accountCurrency)}`,
                    messaging_conversation_started_7d: `Mensajes: ${c.msg}`,
                    lead: `Leads: ${c.leads}`,
                    cpl: `CPL: ${formatMoney(c.cpl_meta, accountCurrency)}`,
                    view_content: `Visitas Landing (LPV): ${c.view_content || c.lpv}`,
                    cart: `Carritos: ${c.cart}`,
                    checkout: `Pagos Iniciados: ${c.checkout}`,
                    cpatc: `Costo Carrito: ${formatMoney(c.cp_cart_meta, accountCurrency)}`,
                    purchase: `Compras: ${c.pur}`,
                    cpp: `CPA: ${formatMoney(c.cpa_meta, accountCurrency)}`,
                    val: `Valor: ${formatMoney(c.val, accountCurrency)}`,
                    roas: `ROAS: ${c.roas_meta.toFixed(2)}x`,
                    spend: `Inversión: ${formatMoney(c.spend, accountCurrency)}`
                };

                let statusClass = "feedback-neutral";
                if (fbIA?.status_ia === "success") statusClass = "feedback-success";
                else if (fbIA?.status_ia === "warning") statusClass = "feedback-warning";
                else if (fbIA?.status_ia === "danger") statusClass = "feedback-danger";

                const activeBadge = c.effective_status === 'ACTIVE' 
                    ? `<span class="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded border border-green-200">ACTIVA</span>` 
                    : `<span class="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded border border-gray-200">PAUSADA</span>`;

                const pubData = iaResponse.analisis_publico_por_campaña?.find(p => p.id === c.id);
                let hasAudienceData = false;
                let topAge = null, topGender = null;
                let top3Countries = [];
                let topCitiesByCountry = {};

                if (pubData && (pubData.mejor_segmento_edad || (pubData.top_3_paises && pubData.top_3_paises.length > 0))) {
                    hasAudienceData = true;
                    topAge = pubData.mejor_segmento_edad;
                    topGender = pubData.mejor_genero;
                    top3Countries = pubData.top_3_paises || [];
                    topCitiesByCountry = pubData.top_3_ciudades_por_pais || {};
                }

                const mapGender = { 'female': 'Mujeres', 'male': 'Hombres', 'unknown': 'Público Mixto' };
                const displayGender = topGender ? (mapGender[topGender] || topGender) : 'Público Mixto';
                const displayAge = topAge ? `de ${topAge} años` : 'de todas las edades';

                let locHtml = '';
                if (top3Countries.length > 0) {
                    top3Countries.forEach(pais => {
                        const cities = topCitiesByCountry[pais] || [];
                        locHtml += `<strong>${pais}</strong> ${cities.length ? `(${cities.join(', ')})` : ''} <br>`;
                    });
                }

                let audienceHtml = '';
                if (hasAudienceData) {
                    audienceHtml = `
                    <div class="mt-6 p-5 bg-gray-50 border border-gray-200 rounded">
                        <h4 class="text-[10px] font-black text-blue-600 uppercase mb-2 tracking-widest flex items-center gap-2">
                            <i data-lucide="users" class="w-4 h-4"></i> Audiencia Destacada
                        </h4>
                        <p class="text-sm font-medium text-gray-800 leading-relaxed">
                            Principalmente <strong>${displayGender} ${displayAge}</strong>.<br>
                            Ubicaciones: ${locHtml}
                        </p>
                    </div>`;
                }

                html += `
                <div class="campaign-card">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 mb-6 gap-2">
                        <div class="flex items-center flex-wrap gap-2">
                            <h4 class="text-xl md:text-2xl font-black uppercase tracking-tighter">${c.name}</h4>
                            ${activeBadge}
                            <span class="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded border">${objDetectado.label.toUpperCase()}</span>
                        </div>
                        <span class="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full shrink-0">Gasto: ${formatMoney(c.spend, accountCurrency)}</span>
                    </div>
                    
                    <div class="mb-6">
                        <h5 class="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">INDICADORES DE META</h5>
                        <ul class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-bold text-gray-700">
                            ${metricsSelected.map(m => labelsMap[m] ? `<li>${labelsMap[m]}</li>` : '').join('')}
                        </ul>
                    </div>
                    
                    <div class="feedback-box ${statusClass}">
                        <h5 class="text-xs font-black uppercase mb-2">ANÁLISIS ESTRATÉGICO</h5>
                        <p class="text-sm font-medium italic">${fbIA?.feedback_ia || 'Analizado correctamente.'}</p>
                    </div>

                    ${audienceHtml}
                </div>`;
            });
            document.getElementById('campaign-cards-container').innerHTML = html;
            try { lucide.createIcons(); } catch(e) {}
        }

        async function descargarPDF() {
            const element = document.getElementById('pdf-content'); 
            const nombreCuenta = reporteData?.nombreCuenta || "Reporte";
            const opt = {
                margin: [10, 5, 10, 5],
                filename: `Reportify-${nombreCuenta.replace(/\s+/g, '-')}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };
            html2pdf().set(opt).from(element).save();
        }

        async function descargarExcelLooker() {
            if (!reporteData) return;
            const { camps, nombreCuenta, textoPeriodo, iaResponse, accountCurrency, totalSpend } = reporteData;
            
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('REPORTE ESTRATÉGICO');
            
            const columns = [{ header: 'MÉTRICA', key: 'metrica', width: 25 }];
            camps.forEach((c, i) => {
                columns.push({ header: c.name.toUpperCase(), key: `camp_${i}`, width: 40 });
            });
            columns.push({ header: 'TOTAL / GLOBAL', key: 'total', width: 45 });
            worksheet.columns = columns;

            worksheet.mergeCells(1, 1, 1, columns.length);
            const mainHeader = worksheet.getCell(1, 1);
            mainHeader.value = `REPORTIFY | CUENTA: ${nombreCuenta.toUpperCase()} | PERIODO: ${textoPeriodo.toUpperCase()}`;
            mainHeader.font = { name: 'Inter', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
            mainHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
            mainHeader.alignment = { vertical: 'middle', horizontal: 'center' };
            worksheet.getRow(1).height = 40;

            const headerRow = worksheet.getRow(2);
            headerRow.values = ['MÉTRICA', ...camps.map(c => c.name.toUpperCase()), 'TOTAL / GLOBAL'];
            headerRow.eachCell((cell) => {
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF374151' } }; 
                cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                cell.border = { bottom: {style:'thick', color: {argb: 'FF000000'}} };
            });
            headerRow.height = 30;

            const totalResultados = camps.reduce((a,c)=>a+c.resultados_obj, 0);
            const cprPromedio = totalResultados > 0 ? totalSpend / totalResultados : 0;
            const totalAlcance = camps.reduce((a,c)=>a+c.reach, 0);
            const totalClics = camps.reduce((a,c)=>a+c.clicks, 0);
            const totalMsg = camps.reduce((a,c)=>a+c.msg, 0);
            const totalLeads = camps.reduce((a,c)=>a+c.leads, 0);
            const totalLpv = camps.reduce((a,c)=>a+(c.view_content || c.lpv), 0);
            const totalCarritos = camps.reduce((a,c)=>a+c.cart, 0);
            const totalPagos = camps.reduce((a,c)=>a+c.checkout, 0);
            const totalCompras = camps.reduce((a,c)=>a+c.pur, 0);
            const totalValor = camps.reduce((a,c)=>a+c.val, 0);
            
            const cplGlobal = totalLeads > 0 ? totalSpend / totalLeads : 0;
            const cpaGlobal = totalCompras > 0 ? totalSpend / totalCompras : 0;
            const roasGlobal = totalSpend > 0 ? totalValor / totalSpend : 0;

            const filas = [
                ['ESTADO', ...camps.map(c => c.effective_status === 'ACTIVE' ? 'ACTIVA' : 'PAUSADA'), '-'],
                ['RESULTADOS', ...camps.map(c => c.resultados_obj), totalResultados],
                ['COSTO / RES.', ...camps.map(c => c.cpr_meta), cprPromedio],
                ['ALCANCE', ...camps.map(c => c.reach), totalAlcance],
                ['FRECUENCIA', ...camps.map(c => c.freq), '-'], 
                ['CTR (%)', ...camps.map(c => c.ctr_meta / 100), '-'],
                ['CLICS', ...camps.map(c => c.clicks), totalClics],
                ['CPC', ...camps.map(c => c.cpc_meta), '-'],
                ['MENSAJES', ...camps.map(c => c.msg), totalMsg],
                ['LEADS', ...camps.map(c => c.leads), totalLeads],
                ['CPL', ...camps.map(c => c.cpl_meta), cplGlobal],
                ['VISITAS LANDING', ...camps.map(c => c.view_content || c.lpv), totalLpv],
                ['CARRITOS', ...camps.map(c => c.cart), totalCarritos],
                ['PAGOS INICIADOS', ...camps.map(c => c.checkout), totalPagos],
                ['COMPRAS', ...camps.map(c => c.pur), totalCompras],
                ['CPA', ...camps.map(c => c.cpa_meta), cpaGlobal],
                ['VALOR DE CONVERSIÓN', ...camps.map(c => c.val), totalValor],
                ['ROAS', ...camps.map(c => c.roas_meta), roasGlobal],
                ['INVERSIÓN TOTAL', ...camps.map(c => c.spend), totalSpend],
                ['ANÁLISIS DE LA IA', ...camps.map(c => iaResponse?.analisis_campañas?.find(a => a.id === c.id)?.feedback_ia || 'Analizado.'), iaResponse?.diagnostico_general || '-']
            ];

            const moneyFormat = `[$$${accountCurrency}] #,##0.00`;

            filas.forEach((filaData, index) => {
                const row = worksheet.addRow(filaData);
                const metrica = filaData[0];
                
                row.eachCell((cell, colNumber) => {
                    cell.alignment = { vertical: 'middle', horizontal: colNumber === 1 ? 'left' : 'center', wrapText: true };
                    cell.border = { bottom: {style:'thin', color: {argb: 'FFE5E7EB'}} };
                    
                    if (index % 2 === 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
                    
                    if (colNumber === 1) { 
                        cell.font = { bold: true, color: { argb: 'FF1F2937' } };
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
                    }
                });

                if (metrica === 'ANÁLISIS DE LA IA') {
                    row.height = 160; 
                    row.eachCell((cell, colNum) => {
                        if (colNum > 1) cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
                    });
                } else {
                    row.height = 35;
                }

                const metricasMoneda = ['COSTO / RES.', 'CPC', 'CPL', 'CPA', 'VALOR DE CONVERSIÓN', 'INVERSIÓN TOTAL'];
                const metricasNumeros = ['RESULTADOS', 'ALCANCE', 'CLICS', 'MENSAJES', 'LEADS', 'VISITAS LANDING', 'CARRITOS', 'PAGOS INICIADOS', 'COMPRAS'];

                if (metricasMoneda.includes(metrica)) {
                    row.eachCell((cell, colNum) => { if (colNum > 1 && cell.value !== '-') cell.numFmt = moneyFormat; });
                } else if (metrica === 'CTR (%)') {
                    row.eachCell((cell, colNum) => { if (colNum > 1 && cell.value !== '-') cell.numFmt = '0.00%'; });
                } else if (metricasNumeros.includes(metrica)) {
                    row.eachCell((cell, colNum) => { if (colNum > 1 && cell.value !== '-') cell.numFmt = '#,##0'; });
                } else if (metrica === 'FRECUENCIA') {
                    row.eachCell((cell, colNum) => { if (colNum > 1 && cell.value !== '-') cell.numFmt = '0.00'; });
                } else if (metrica === 'ROAS') {
                    row.eachCell((cell, colNum) => { if (colNum > 1 && cell.value !== '-') cell.numFmt = '0.00"x"'; });
                }
            });

            worksheet.eachRow((r) => {
                if (r.getCell(1).value === 'INVERSIÓN TOTAL') r.font = { bold: true };
            });

            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), `Reportify-${nombreCuenta.replace(/\s+/g, '-')}.xlsx`);
        }

        function reiniciarApp() { window.scrollTo(0, 0); window.location.reload(); }
    </script>
</body>
</html>
