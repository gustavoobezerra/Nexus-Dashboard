// NEXUS DASHBOARD - UNIFIED v3.0
// Arquivo consolidado que substitui fixes.js, enhancements.js e patches.js
// Todas as funcionalidades em um único arquivo otimizado

(function() {
    'use strict';

    console.log('🚀 Nexus Dashboard Unified v3.0 - Carregando...');

    // =====================================================================
    // CONFIGURAÇÕES GLOBAIS
    // =====================================================================

    const CONFIG = {
        API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:5000'
            : 'https://nexus-dashboard-qpdm.onrender.com',
        RATE_LIMIT: { maxRequests: 5, windowMs: 60000 },
        TOAST_DURATION: { normal: 4000, error: 6000 },
        RESIZE_DEBOUNCE: 250,
        FILTER_DEBOUNCE: 300,
        CHAT_TIMEOUT: 40000,
        MAX_TOASTS: 5
    };

    // =====================================================================
    // UTILITÁRIOS
    // =====================================================================

    const Utils = {
        // Debounce genérico
        debounce(fn, delay) {
            let timer;
            return function(...args) {
                clearTimeout(timer);
                timer = setTimeout(() => fn.apply(this, args), delay);
            };
        },

        // Throttle genérico
        throttle(fn, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    fn.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        // Parse seguro de data
        safeParseDate(dateStr) {
            if (!dateStr) return null;
            try {
                const str = String(dateStr).trim();
                const formats = [
                    null, 'dd/MM/yyyy', 'dd-MM-yyyy', 'yyyy/MM/dd',
                    'MM/dd/yyyy', 'dd/MM/yy', 'yyyy-MM-dd', 'd/M/yyyy', 'd-M-yyyy'
                ];

                for (const fmt of formats) {
                    let dt = fmt === null
                        ? luxon.DateTime.fromISO(str)
                        : luxon.DateTime.fromFormat(str, fmt);

                    if (dt.isValid && dt.year >= 1900 && dt.year <= 2100) {
                        return dt.toISODate();
                    }
                }

                const nativeDate = new Date(str);
                if (!isNaN(nativeDate.getTime())) {
                    return luxon.DateTime.fromJSDate(nativeDate).toISODate();
                }
                return null;
            } catch (e) {
                console.error('Date parse error:', e, dateStr);
                return null;
            }
        },

        // Parse seguro de número
        safeParseNumber(val) {
            if (typeof val === 'number' && !isNaN(val)) return val;
            if (!val) return 0;
            try {
                const cleaned = String(val)
                    .replace(/[R$\s€£¥]/g, '')
                    .replace(/\./g, '')
                    .replace(',', '.')
                    .trim();
                const parsed = parseFloat(cleaned);
                return isNaN(parsed) ? 0 : parsed;
            } catch (e) {
                return 0;
            }
        },

        // Detecta mobile
        isMobile() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        }
    };

    // =====================================================================
    // SEGURANÇA
    // =====================================================================

    const Security = {
        // Caracteres perigosos para CSV
        dangerousChars: ['=', '+', '-', '@', '\t', '\r'],

        // Sanitiza para CSV (previne CSV Injection)
        sanitizeForCSV(value) {
            if (typeof value !== 'string') return value;
            const trimmed = value.trim();
            if (this.dangerousChars.some(char => trimmed.startsWith(char))) {
                return "'" + trimmed;
            }
            return trimmed;
        },

        // Sanitiza dataset completo
        sanitizeDataset(data) {
            return data.map(row => {
                const sanitized = {};
                for (const [key, value] of Object.entries(row)) {
                    sanitized[key] = this.sanitizeForCSV(String(value));
                }
                return sanitized;
            });
        },

        // Sanitiza HTML (previne XSS)
        sanitizeHTML(str) {
            if (typeof str !== 'string') return String(str);
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }
    };

    // Expor globalmente
    window.CSVSecurity = Security;
    window.HTMLSecurity = { sanitize: Security.sanitizeHTML.bind(Security) };

    // =====================================================================
    // RATE LIMITER
    // =====================================================================

    class RateLimiter {
        constructor(maxRequests = 5, windowMs = 60000) {
            this.maxRequests = maxRequests;
            this.windowMs = windowMs;
            this.requests = [];
        }

        async tryRequest() {
            const now = Date.now();
            this.requests = this.requests.filter(time => now - time < this.windowMs);

            if (this.requests.length >= this.maxRequests) {
                const oldestRequest = this.requests[0];
                const waitTime = this.windowMs - (now - oldestRequest);
                throw new Error(`Limite de requisições excedido. Aguarde ${Math.ceil(waitTime / 1000)}s`);
            }

            this.requests.push(now);
            return true;
        }
    }

    const geminiRateLimiter = new RateLimiter(CONFIG.RATE_LIMIT.maxRequests, CONFIG.RATE_LIMIT.windowMs);

    // =====================================================================
    // STORAGE SEGURO (com fallback para localStorage)
    // =====================================================================

    const SafeStorage = {
        async saveData(key, data) {
            try {
                if (typeof saveDataToDB === 'function') {
                    await saveDataToDB(data);
                }
            } catch (e) {
                console.warn('IndexedDB failed, using localStorage', e);
                try {
                    localStorage.setItem(key, JSON.stringify(data.slice(0, 1000)));
                } catch (storageError) {
                    window.showToast?.('Armazenamento cheio. Limpe dados antigos.', 'error');
                }
            }
        },

        async loadData(key) {
            try {
                if (typeof loadDataFromDB === 'function') {
                    return await loadDataFromDB();
                }
            } catch (e) {
                console.warn('IndexedDB failed, trying localStorage', e);
                const stored = localStorage.getItem(key);
                return stored ? JSON.parse(stored) : [];
            }
            return [];
        }
    };

    window.SafeStorage = SafeStorage;

    // =====================================================================
    // TOAST SYSTEM (unificado)
    // =====================================================================

    const ToastSystem = {
        show(message, type = 'info') {
            const container = document.getElementById('toast-container');
            if (!container) {
                console.warn('Toast container não encontrado');
                return;
            }

            // Limita número de toasts
            const existingToasts = container.querySelectorAll('.toast');
            if (existingToasts.length >= CONFIG.MAX_TOASTS) {
                existingToasts[0].remove();
            }

            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.setAttribute('role', 'alert');
            toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

            const icons = {
                success: '<i class="fa-solid fa-circle-check text-green-500"></i>',
                error: '<i class="fa-solid fa-circle-xmark text-red-500"></i>',
                info: '<i class="fa-solid fa-circle-info text-blue-500"></i>',
                warning: '<i class="fa-solid fa-triangle-exclamation text-yellow-500"></i>'
            };

            const sanitizedMessage = Security.sanitizeHTML(message);
            toast.innerHTML = `
                ${icons[type] || icons.info}
                <span class="text-sm flex-1">${sanitizedMessage}</span>
                <button onclick="this.parentElement.remove()" class="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1" aria-label="Fechar notificação">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            `;

            container.appendChild(toast);

            // Animação de entrada
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    toast.classList.add('show');
                });
            });

            // Auto-remove
            const duration = type === 'error' ? CONFIG.TOAST_DURATION.error : CONFIG.TOAST_DURATION.normal;
            const autoRemoveTimeout = setTimeout(() => {
                toast.style.transform = 'translateX(120%)';
                toast.style.opacity = '0';
                setTimeout(() => toast.parentElement && toast.remove(), 300);
            }, duration);

            // Clique para fechar
            toast.addEventListener('click', (e) => {
                if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'I') {
                    clearTimeout(autoRemoveTimeout);
                    toast.remove();
                }
            });

            // Anuncia para screen readers
            this.announce(message, type === 'error' ? 'assertive' : 'polite');
        },

        announce(message, priority = 'polite') {
            const announcer = document.createElement('div');
            announcer.setAttribute('role', 'status');
            announcer.setAttribute('aria-live', priority);
            announcer.setAttribute('aria-atomic', 'true');
            announcer.style.cssText = `
                position: absolute; width: 1px; height: 1px; padding: 0;
                margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0);
                white-space: nowrap; border: 0;
            `;
            document.body.appendChild(announcer);
            setTimeout(() => { announcer.textContent = message; }, 100);
            setTimeout(() => { announcer.remove(); }, 1000);
        }
    };

    // Sobrescreve showToast global
    window.showToast = ToastSystem.show.bind(ToastSystem);

    // =====================================================================
    // PERFORMANCE MONITOR
    // =====================================================================

    const PerfMonitor = {
        start(label) {
            performance.mark(`${label}-start`);
        },

        end(label) {
            performance.mark(`${label}-end`);
            try {
                performance.measure(label, `${label}-start`, `${label}-end`);
                const measure = performance.getEntriesByName(label)[0];
                if (measure && measure.duration > 1000) {
                    console.warn(`Slow operation: ${label} took ${measure.duration.toFixed(2)}ms`);
                }
            } catch (e) { /* Performance API not available */ }
        }
    };

    // =====================================================================
    // ERROR HANDLERS
    // =====================================================================

    window.addEventListener('error', (e) => {
        console.error('Global Error:', e.error);
        window.showToast?.('Erro inesperado. Recarregue a página.', 'error');
    });

    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled Promise:', e.reason);
        window.showToast?.('Erro de conexão. Verifique sua internet.', 'error');
    });

    // =====================================================================
    // CHART HANDLERS
    // =====================================================================

    // Resize com debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (typeof charts !== 'undefined') {
                Object.values(charts).forEach(chart => {
                    if (chart && typeof chart.resize === 'function') {
                        chart.resize();
                    }
                });
            }
        }, CONFIG.RESIZE_DEBOUNCE);
    });

    // Cleanup de memória ao sair
    window.addEventListener('beforeunload', () => {
        if (typeof charts !== 'undefined') {
            Object.values(charts).forEach(chart => {
                if (chart && typeof chart.destroy === 'function') {
                    try { chart.destroy(); } catch (e) { }
                }
            });
        }
        if (typeof fullData !== 'undefined') fullData = [];
        if (typeof currentData !== 'undefined') currentData = [];
        if (typeof timeSeriesData !== 'undefined') timeSeriesData = {};
    });

    // =====================================================================
    // FUNCTION WRAPPERS (sobrescrevem funções originais com melhorias)
    // =====================================================================

    // Aguarda DOM estar pronto
    const initWrappers = () => {
        // Wrapper para initChart
        const originalInitChart = window.initChart;
        if (typeof originalInitChart === 'function') {
            window.initChart = function(id, type, data, options) {
                const canvas = document.getElementById(id);
                if (!canvas) {
                    console.warn(`Canvas #${id} not found`);
                    return null;
                }

                if (typeof charts !== 'undefined' && charts[id]) {
                    try { charts[id].destroy(); } catch (e) { }
                }

                try {
                    return originalInitChart.call(this, id, type, data, options);
                } catch (e) {
                    console.error(`Chart ${id} creation failed:`, e);
                    window.showToast?.(`Erro ao criar gráfico ${id}`, 'error');
                    return null;
                }
            };
        }

        // Wrapper para calculateAdvancedForecast
        const originalCalculateForecast = window.calculateAdvancedForecast;
        if (typeof originalCalculateForecast === 'function') {
            window.calculateAdvancedForecast = function(dates, values, days = 7) {
                if (!dates || !values || dates.length === 0 || values.length === 0) {
                    console.warn('Empty data for forecast');
                    return Array(days).fill(0);
                }

                if (dates.length !== values.length) {
                    console.error('Date/Value length mismatch');
                    return Array(days).fill(values[values.length - 1] || 0);
                }

                try {
                    return originalCalculateForecast.call(this, dates, values, days);
                } catch (e) {
                    console.error('Forecast calculation failed:', e);
                    const lastValue = values[values.length - 1] || 0;
                    return Array(days).fill(lastValue);
                }
            };
        }

        // Wrapper para applyAdvancedFilters com debounce
        const originalApplyAdvancedFilters = window.applyAdvancedFilters;
        if (typeof originalApplyAdvancedFilters === 'function') {
            window.applyAdvancedFilters = Utils.debounce(function() {
                originalApplyAdvancedFilters.call(this);
            }, CONFIG.FILTER_DEBOUNCE);
        }

        // Wrapper para handleFileUpload
        const originalHandleFileUpload = window.handleFileUpload;
        if (typeof originalHandleFileUpload === 'function') {
            window.handleFileUpload = function(input) {
                const file = input?.files?.[0];
                if (!file) return;

                // Validação de tipo
                const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
                const fileName = file.name.toLowerCase();

                if (!allowedTypes.includes(file.type) && !fileName.endsWith('.csv')) {
                    window.showToast?.('Formato inválido! Use apenas arquivos .CSV', 'error');
                    input.value = '';
                    return;
                }

                // Mostra progresso
                const progressContainer = document.createElement('div');
                progressContainer.id = 'upload-progress';
                progressContainer.className = 'fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm';
                progressContainer.innerHTML = `
                    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl w-80 text-center">
                        <div class="mb-4">
                            <i class="fa-solid fa-file-csv text-4xl text-indigo-600 mb-2"></i>
                            <p class="font-medium text-gray-800 dark:text-gray-200">Processando arquivo...</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">${Security.sanitizeHTML(file.name)}</p>
                        </div>
                        <div class="progress-bar bg-gray-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div class="progress-bar-fill h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300" style="width: 0%"></div>
                        </div>
                        <p class="text-xs text-gray-400 mt-2" id="upload-status">Lendo arquivo...</p>
                    </div>
                `;
                document.body.appendChild(progressContainer);

                const progressBar = progressContainer.querySelector('.progress-bar-fill');
                const statusText = progressContainer.querySelector('#upload-status');
                let progress = 0;

                const progressInterval = setInterval(() => {
                    if (progress < 90) {
                        progress += Math.random() * 15;
                        progressBar.style.width = `${Math.min(progress, 90)}%`;
                        if (progress > 30) statusText.textContent = 'Validando dados...';
                        if (progress > 60) statusText.textContent = 'Processando registros...';
                    }
                }, 200);

                const complete = () => {
                    clearInterval(progressInterval);
                    progressBar.style.width = '100%';
                    statusText.textContent = 'Concluído!';
                    setTimeout(() => {
                        progressContainer.style.opacity = '0';
                        setTimeout(() => progressContainer.remove(), 300);
                    }, 500);
                };

                try {
                    originalHandleFileUpload.call(this, input);
                    setTimeout(complete, 1000);
                } catch (error) {
                    clearInterval(progressInterval);
                    progressContainer.remove();
                    window.showToast?.('Erro ao processar arquivo: ' + error.message, 'error');
                }
            };
        }

        // Wrapper para switchView
        const originalSwitchView = window.switchView;
        if (typeof originalSwitchView === 'function') {
            window.switchView = function(view) {
                // Limpa gráficos da view anterior
                if (typeof charts !== 'undefined') {
                    Object.entries(charts).forEach(([id, chart]) => {
                        if (chart && typeof chart.destroy === 'function') {
                            try {
                                const canvas = document.getElementById(id);
                                if (canvas) {
                                    const parentView = canvas.closest('[id^="view-"]');
                                    if (parentView && !parentView.id.includes(view)) {
                                        chart.destroy();
                                        charts[id] = null;
                                    }
                                }
                            } catch (e) { }
                        }
                    });
                }
                return originalSwitchView.call(this, view);
            };
        }

        // Wrapper para exportToCSV
        const originalExportToCSV = window.exportToCSV;
        if (typeof originalExportToCSV === 'function') {
            window.exportToCSV = function() {
                if (typeof currentData === 'undefined' || !currentData.length) {
                    return window.showToast?.('Nenhum dado para exportar!', 'error');
                }

                const sanitizedData = Security.sanitizeDataset(currentData);
                const headers = ['Data', 'Categoria', 'Produto', 'Valor', 'Pagamento', 'Status'];
                const rows = sanitizedData.map(d => [
                    d.date, d.category, d.product,
                    parseFloat(d.value).toFixed(2), d.payment, d.status
                ]);

                const csvContent = [headers, ...rows].map(row => row.join(';')).join('\n');
                const BOM = '\uFEFF';
                const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `nexus_export_${luxon.DateTime.now().toFormat('yyyy-MM-dd_HHmm')}.csv`;
                link.click();
                URL.revokeObjectURL(link.href);

                window.showToast?.('CSV exportado com segurança!', 'success');
            };
        }
    };

    // =====================================================================
    // CHATBOT OTIMIZADO
    // =====================================================================

    function getOptimizedContext(stats) {
        if (!stats || typeof stats !== 'object') return {};
        return {
            resumo_financeiro: {
                receita_total: stats.revenue || 0,
                total_vendas: stats.sales || 0,
                ticket_medio: stats.avgTicket || 0,
                categoria_principal: stats.topCategory || 'N/A',
                participacao_categoria: stats.topCategoryShare || 0
            },
            top_5_produtos: (stats.topProducts || []).slice(0, 5),
            distribuicao_pagamento: stats.payBreakdown || {},
            distribuicao_status: stats.statusBreakdown || {},
            periodo_analisado: {
                registros_totais: stats.sales || 0,
                data_mais_antiga: stats.oldestDate || 'N/A',
                data_mais_recente: stats.newestDate || 'N/A'
            }
        };
    }

    window.sendChatMessage = async function(ctx = null) {
        const input = document.getElementById('chat-input');
        const historyEl = document.getElementById('chat-history');

        if (!input || !historyEl) return;

        const text = input.value.trim();
        if (!text && !ctx) return;

        // Rate limit
        try {
            await geminiRateLimiter.tryRequest();
        } catch (rateLimitError) {
            window.showToast?.(rateLimitError.message, 'error');
            return;
        }

        // UI Update
        const sanitizedText = Security.sanitizeHTML(text);
        if (typeof chatHistory !== 'undefined') {
            chatHistory.push({ role: 'user', content: text, timestamp: Date.now() });
        }
        historyEl.innerHTML += `<div class="chat-bubble chat-user">${sanitizedText}</div>`;
        input.value = '';
        historyEl.scrollTop = historyEl.scrollHeight;

        const loadingId = 'load-' + Date.now();
        historyEl.innerHTML += `<div id="${loadingId}" class="chat-bubble chat-ai italic"><i class="fa-solid fa-circle-notch fa-spin"></i> Analisando...</div>`;
        historyEl.scrollTop = historyEl.scrollHeight;

        try {
            const rawStats = ctx || (typeof stats !== 'undefined' ? stats : {});
            const optimizedStats = getOptimizedContext(rawStats);

            const models = [
                'gemini-2.5-flash',
                'gemini-exp-1206',
                'gemini-1.5-pro-latest',
                'gemini-1.5-flash-latest'
            ];

            let response = null;
            let lastError = null;
            let successModel = '';

            for (const model of models) {
                try {
                    console.log(`🔄 Tentando modelo: ${model}...`);
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), CONFIG.CHAT_TIMEOUT);

                    response = await fetch(
                        `${CONFIG.API_BASE_URL}/api/gemini-proxy`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                contents: [{
                                    parts: [{
                                        text: `Você é um Especialista em Business Intelligence.

CONTEXTO DOS DADOS (JSON Resumido):
${JSON.stringify(optimizedStats, null, 2)}

PERGUNTA DO USUÁRIO:
"${text}"

INSTRUÇÕES:
1. Responda em Português do Brasil de forma profissional
2. Use formatação Markdown (negrito, listas)
3. Seja direto e objetivo, focando em insights práticos
4. Se os dados forem insuficientes, avise o usuário`
                                    }]
                                }],
                                safetySettings: [
                                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                                ],
                                generationConfig: {
                                    temperature: 0.7,
                                    maxOutputTokens: 1000,
                                    topP: 0.95,
                                    topK: 40
                                }
                            }),
                            signal: controller.signal
                        }
                    );

                    clearTimeout(timeoutId);

                    if (response.ok) {
                        console.log(`✅ Sucesso com ${model}!`);
                        successModel = model;
                        break;
                    } else {
                        if (response.status === 429) {
                            throw new Error("⚠️ Limite de taxa (5 RPM) excedido. Aguarde 1 minuto.");
                        }
                        const errText = await response.text();
                        console.warn(`⚠️ Modelo ${model} falhou (${response.status})`);
                        lastError = `Erro ${response.status}: ${errText.substring(0, 100)}`;
                    }
                } catch (err) {
                    console.warn(`⚠️ Erro em ${model}:`, err.message);
                    lastError = err.message;
                    if (err.message.includes("Limite de taxa") || err.message.includes("429")) {
                        throw err;
                    }
                }
            }

            if (!response || !response.ok) {
                throw new Error(`Falha na IA. Motivo: ${lastError}`);
            }

            const data = await response.json();
            document.getElementById(loadingId)?.remove();

            if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]) {
                throw new Error("A IA não retornou resposta válida.");
            }

            const aiResponse = data.candidates[0].content.parts[0].text;

            if (typeof chatHistory !== 'undefined') {
                chatHistory.push({ role: 'assistant', content: aiResponse, timestamp: Date.now() });
            }
            if (typeof saveChatHistory === 'function') saveChatHistory();

            const htmlContent = (typeof marked !== 'undefined') ? marked.parse(aiResponse) : aiResponse;
            const debugInfo = `<div class="text-[10px] text-gray-400 mt-1 text-right">Respondido por: ${successModel}</div>`;

            historyEl.innerHTML += `<div class="chat-bubble chat-ai">${htmlContent}${debugInfo}</div>`;
            historyEl.scrollTop = historyEl.scrollHeight;

        } catch (error) {
            console.error('❌ Erro no chat:', error);
            document.getElementById(loadingId)?.remove();

            let userMessage = error.message || "❌ Erro ao processar resposta.";
            if (error.name === 'AbortError') {
                userMessage = "⏱️ Tempo limite excedido. Tente simplificar sua pergunta.";
            }

            historyEl.innerHTML += `<div class="chat-bubble chat-ai border-2 border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
                <strong><i class="fa-solid fa-triangle-exclamation"></i> Erro:</strong><br>
                ${userMessage}
            </div>`;
            historyEl.scrollTop = historyEl.scrollHeight;
            window.showToast?.(userMessage.substring(0, 80), 'error');
        }
    };

    // =====================================================================
    // ACESSIBILIDADE
    // =====================================================================

    const A11y = {
        enhance() {
            // KPI Cards
            document.querySelectorAll('.card').forEach(card => {
                card.setAttribute('role', 'region');
                const title = card.querySelector('p.text-sm');
                if (title) card.setAttribute('aria-label', title.textContent);
            });

            // Gráficos
            document.querySelectorAll('canvas').forEach(canvas => {
                if (!canvas.getAttribute('role')) {
                    canvas.setAttribute('role', 'img');
                    canvas.setAttribute('aria-label', 'Gráfico de dados');
                }
            });

            // Navegação
            document.querySelectorAll('.nav-item').forEach(nav => {
                nav.setAttribute('role', 'menuitem');
                const text = nav.querySelector('span');
                if (text) nav.setAttribute('aria-label', text.textContent);
            });

            // Toast container
            const toastContainer = document.getElementById('toast-container');
            if (toastContainer) {
                toastContainer.setAttribute('aria-live', 'polite');
                toastContainer.setAttribute('aria-atomic', 'true');
            }

            // Chat
            const chatHistory = document.getElementById('chat-history');
            if (chatHistory) {
                chatHistory.setAttribute('role', 'log');
                chatHistory.setAttribute('aria-live', 'polite');
            }

            // Focus visible
            const style = document.createElement('style');
            style.textContent = `
                *:focus-visible {
                    outline: 2px solid #6366f1 !important;
                    outline-offset: 2px !important;
                }
                .dark *:focus-visible {
                    outline-color: #818cf8 !important;
                }
            `;
            document.head.appendChild(style);
        }
    };

    // =====================================================================
    // MOBILE EXPERIENCE
    // =====================================================================

    const MobileEnhancements = {
        init() {
            if (!Utils.isMobile()) return;

            document.documentElement.classList.add('is-mobile');

            const mobileStyles = document.createElement('style');
            mobileStyles.textContent = `
                .is-mobile .card:hover { transform: none !important; }
                .is-mobile #ai-chat-panel { width: 100% !important; }
                .is-mobile .nav-item span { font-size: 0.75rem; }
                .is-mobile button, .is-mobile .nav-item { min-height: 44px; min-width: 44px; }
                .is-mobile * { -webkit-overflow-scrolling: touch; }
            `;
            document.head.appendChild(mobileStyles);

            // Fecha chat ao clicar fora
            document.addEventListener('click', (e) => {
                const chatPanel = document.getElementById('ai-chat-panel');
                if (!chatPanel) return;
                if (!chatPanel.classList.contains('translate-x-full')) {
                    if (!chatPanel.contains(e.target) && !e.target.closest('[onclick*="toggleChatPanel"]')) {
                        chatPanel.classList.add('translate-x-full');
                    }
                }
            });
        }
    };

    // =====================================================================
    // CONNECTION STATUS
    // =====================================================================

    const ConnectionMonitor = {
        wasOffline: false,

        init() {
            window.addEventListener('online', () => {
                if (this.wasOffline) {
                    window.showToast?.('Conexão restaurada!', 'success');
                    this.wasOffline = false;
                }
            });

            window.addEventListener('offline', () => {
                this.wasOffline = true;
                window.showToast?.('Você está offline. Algumas funcionalidades podem não funcionar.', 'warning');
            });

            if (!navigator.onLine) {
                setTimeout(() => window.showToast?.('Sem conexão com a internet.', 'warning'), 2000);
            }
        }
    };

    // =====================================================================
    // MODAL FOCUS TRAP
    // =====================================================================

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            const activeModal = document.querySelector('.fixed.inset-0:not(.hidden)');
            if (activeModal) {
                const focusable = activeModal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusable.length === 0) return;

                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        last.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === last) {
                        first.focus();
                        e.preventDefault();
                    }
                }
            }
        }
    });

    // =====================================================================
    // ESTILOS ADICIONAIS
    // =====================================================================

    const injectStyles = () => {
        const styles = document.createElement('style');
        styles.id = 'nexus-unified-styles';
        styles.textContent = `
            /* Skeleton Loading */
            @keyframes skeleton-shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }

            .skeleton-loader {
                background: linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.10) 50%, rgba(0,0,0,0.06) 75%);
                background-size: 200% 100%;
                animation: skeleton-shimmer 1.5s infinite;
            }

            .dark .skeleton-loader {
                background: linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.06) 75%);
                background-size: 200% 100%;
            }

            /* Card transitions */
            .card {
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }

            .card:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
            }

            .dark .card:hover {
                box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
            }

            /* Modal animations */
            [id$="-modal"] > div {
                animation: modal-enter 0.3s ease-out;
            }

            @keyframes modal-enter {
                from { opacity: 0; transform: scale(0.95) translateY(-10px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }

            /* Toast animations */
            .toast {
                animation: toast-slide-in 0.3s ease-out;
            }

            @keyframes toast-slide-in {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }

            /* Chat bubble animations */
            .chat-bubble {
                animation: bubble-appear 0.3s ease-out;
            }

            @keyframes bubble-appear {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            /* Progress bar */
            .progress-bar {
                height: 4px;
                background: #e5e7eb;
                border-radius: 2px;
                overflow: hidden;
            }

            .progress-bar-fill {
                height: 100%;
                border-radius: 2px;
                transition: width 0.5s ease;
            }

            /* Better scrollbar */
            ::-webkit-scrollbar { width: 10px; height: 10px; }
            ::-webkit-scrollbar-track { background: transparent; border-radius: 5px; }
            ::-webkit-scrollbar-thumb {
                background: linear-gradient(180deg, #cbd5e1, #94a3b8);
                border-radius: 5px;
                border: 2px solid transparent;
                background-clip: padding-box;
            }
            ::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(180deg, #94a3b8, #64748b);
                background-clip: padding-box;
            }
            .dark ::-webkit-scrollbar-thumb {
                background: linear-gradient(180deg, #475569, #334155);
                background-clip: padding-box;
            }

            /* Validation messages */
            .validation-msg {
                color: #ef4444;
                font-size: 0.75rem;
                margin-top: 0.25rem;
            }

            /* FAB Help Button */
            .fab-help {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                color: white;
                border: none;
                box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                transition: all 0.3s ease;
                z-index: 40;
            }

            .fab-help:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
            }

            @media (max-width: 768px) {
                .fab-help { width: 48px; height: 48px; font-size: 20px; bottom: 70px; }
            }

            /* KPI Value Animation */
            .kpi-animate {
                animation: kpi-count 0.8s ease-out;
            }

            @keyframes kpi-count {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            /* Improved Button States */
            .btn-interactive {
                position: relative;
                overflow: hidden;
            }

            .btn-interactive::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                transition: width 0.3s, height 0.3s;
            }

            .btn-interactive:active::after {
                width: 200px;
                height: 200px;
            }

            /* Data Highlight Effect */
            .highlight-new {
                animation: highlight-fade 2s ease-out;
            }

            @keyframes highlight-fade {
                0% { background-color: rgba(99, 102, 241, 0.3); }
                100% { background-color: transparent; }
            }

            /* Empty State */
            .empty-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px 20px;
                text-align: center;
                color: #9ca3af;
            }

            .empty-state i {
                font-size: 48px;
                margin-bottom: 16px;
                opacity: 0.5;
            }

            /* Loading Overlay */
            .loading-overlay {
                position: absolute;
                inset: 0;
                background: rgba(255, 255, 255, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10;
            }

            .dark .loading-overlay {
                background: rgba(15, 23, 42, 0.8);
            }

            /* Spinner */
            .spinner {
                width: 32px;
                height: 32px;
                border: 3px solid rgba(99, 102, 241, 0.2);
                border-top-color: #6366f1;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            /* Notification Badge */
            .notification-badge {
                position: absolute;
                top: -4px;
                right: -4px;
                min-width: 18px;
                height: 18px;
                background: linear-gradient(135deg, #ef4444, #dc2626);
                color: white;
                font-size: 10px;
                font-weight: 600;
                border-radius: 9px;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0 5px;
                box-shadow: 0 2px 4px rgba(239, 68, 68, 0.4);
            }

            /* Improved Input Focus */
            input:focus, select:focus, textarea:focus {
                outline: none;
                border-color: #6366f1;
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }

            .dark input:focus, .dark select:focus, .dark textarea:focus {
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
            }

            /* Status Indicators */
            .status-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                display: inline-block;
            }

            .status-dot.online {
                background: #10b981;
                box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
            }

            .status-dot.offline {
                background: #ef4444;
                box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
            }

            .status-dot.pending {
                background: #f59e0b;
                box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
            }

            /* Gradient Text */
            .gradient-text {
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            /* Glass Effect */
            .glass {
                background: rgba(255, 255, 255, 0.7);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .dark .glass {
                background: rgba(30, 41, 59, 0.7);
                border-color: rgba(255, 255, 255, 0.1);
            }

            /* Improved Table Hover */
            .table-row-hover:hover {
                background: linear-gradient(90deg, rgba(99, 102, 241, 0.05), transparent);
            }

            .dark .table-row-hover:hover {
                background: linear-gradient(90deg, rgba(99, 102, 241, 0.1), transparent);
            }
        `;
        document.head.appendChild(styles);
    };

    // =====================================================================
    // INICIALIZAÇÃO
    // =====================================================================

    document.addEventListener('DOMContentLoaded', () => {
        console.log('🎨 Inicializando Nexus Unified...');

        // Injeta estilos
        injectStyles();

        // Inicializa wrappers
        initWrappers();

        // Inicializa módulos
        setTimeout(() => {
            A11y.enhance();
            MobileEnhancements.init();
            ConnectionMonitor.init();
            DataValidator.init();
            UnsavedChangesTracker.init();

            // Adiciona botão de ajuda
            if (!document.querySelector('.fab-help')) {
                const fabHelp = document.createElement('button');
                fabHelp.className = 'fab-help no-print';
                fabHelp.innerHTML = '<i class="fa-solid fa-keyboard"></i>';
                fabHelp.title = 'Atalhos de Teclado (?)';
                fabHelp.setAttribute('aria-label', 'Ver atalhos de teclado');
                fabHelp.onclick = () => {
                    if (typeof showKeyboardShortcuts === 'function') {
                        showKeyboardShortcuts();
                    }
                };
                document.body.appendChild(fabHelp);
            }

            // Adiciona indicador de status de conexão
            const statusIndicator = document.createElement('div');
            statusIndicator.id = 'connection-status';
            statusIndicator.className = 'fixed top-4 right-4 z-50 hidden items-center gap-2 px-3 py-2 rounded-full text-sm font-medium shadow-lg transition-all duration-300';
            statusIndicator.innerHTML = `
                <span class="status-dot"></span>
                <span class="status-text"></span>
            `;
            document.body.appendChild(statusIndicator);

            console.log('✅ Nexus Dashboard Unified v3.0 carregado!');
        }, 500);
    });

    // =====================================================================
    // KPI ANIMATIONS
    // =====================================================================

    const KPIAnimator = {
        animateValue(element, targetValue, duration = 800, prefix = '', suffix = '') {
            if (!element) return;

            const startValue = 0;
            const startTime = performance.now();

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const currentValue = startValue + (targetValue - startValue) * easeOut;

                if (typeof targetValue === 'number') {
                    if (targetValue % 1 !== 0) {
                        element.textContent = prefix + currentValue.toFixed(2) + suffix;
                    } else {
                        element.textContent = prefix + Math.round(currentValue).toLocaleString('pt-BR') + suffix;
                    }
                }

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    element.classList.add('kpi-animate');
                }
            };

            requestAnimationFrame(animate);
        }
    };

    // =====================================================================
    // SKELETON LOADER
    // =====================================================================

    const SkeletonLoader = {
        create(type = 'text', options = {}) {
            const skeleton = document.createElement('div');
            skeleton.className = 'skeleton-loader animate-pulse';
            const baseClasses = 'bg-gray-200 dark:bg-slate-700 rounded';

            switch(type) {
                case 'text':
                    skeleton.className += ` ${baseClasses} h-4 ${options.width || 'w-full'}`;
                    break;
                case 'title':
                    skeleton.className += ` ${baseClasses} h-8 ${options.width || 'w-3/4'}`;
                    break;
                case 'card':
                    skeleton.className += ` ${baseClasses} ${options.size || 'h-32 w-full'}`;
                    break;
                case 'chart':
                    skeleton.className += ` ${baseClasses} ${options.size || 'h-64 w-full'}`;
                    skeleton.innerHTML = `
                        <div class="flex items-end justify-around h-full p-4 gap-2">
                            <div class="bg-gray-300 dark:bg-slate-600 w-8 h-1/3 rounded-t animate-pulse"></div>
                            <div class="bg-gray-300 dark:bg-slate-600 w-8 h-1/2 rounded-t animate-pulse"></div>
                            <div class="bg-gray-300 dark:bg-slate-600 w-8 h-2/3 rounded-t animate-pulse"></div>
                            <div class="bg-gray-300 dark:bg-slate-600 w-8 h-1/4 rounded-t animate-pulse"></div>
                        </div>
                    `;
                    break;
            }
            return skeleton;
        },

        show(containerId, type = 'card', count = 1) {
            const container = document.getElementById(containerId);
            if (!container) return;
            container.innerHTML = '';
            for (let i = 0; i < count; i++) {
                const skeleton = this.create(type);
                skeleton.style.animationDelay = `${i * 0.1}s`;
                container.appendChild(skeleton);
            }
        },

        hide(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;
            const skeletons = container.querySelectorAll('.skeleton-loader');
            skeletons.forEach(s => s.remove());
        }
    };

    // =====================================================================
    // VIRTUAL TABLE (for large datasets)
    // =====================================================================

    const VirtualTable = {
        rowHeight: 48,
        visibleRows: 10,
        buffer: 5,

        create(containerId, data, columns, options = {}) {
            const container = document.getElementById(containerId);
            if (!container || !data || data.length === 0) return;

            this.rowHeight = options.rowHeight || 48;
            this.visibleRows = options.visibleRows || 10;

            // Para poucos dados, renderiza normalmente
            if (data.length <= this.visibleRows + this.buffer * 2) {
                return this.renderNormal(container, data, columns);
            }

            const totalHeight = data.length * this.rowHeight;
            const viewportHeight = this.visibleRows * this.rowHeight;

            const viewport = document.createElement('div');
            viewport.className = 'virtual-table-viewport';
            viewport.style.cssText = `height: ${viewportHeight}px; overflow-y: auto; position: relative;`;

            const content = document.createElement('div');
            content.className = 'virtual-table-content';
            content.style.cssText = `height: ${totalHeight}px; position: relative;`;

            const rowsContainer = document.createElement('div');
            rowsContainer.className = 'virtual-table-rows';
            rowsContainer.style.cssText = 'position: absolute; top: 0; left: 0; right: 0;';

            content.appendChild(rowsContainer);
            viewport.appendChild(content);
            container.innerHTML = '';
            container.appendChild(viewport);

            this.renderRows(rowsContainer, data, columns, 0);

            let ticking = false;
            viewport.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        const scrollTop = viewport.scrollTop;
                        const startIndex = Math.max(0, Math.floor(scrollTop / this.rowHeight) - this.buffer);
                        rowsContainer.style.top = `${startIndex * this.rowHeight}px`;
                        this.renderRows(rowsContainer, data, columns, startIndex);
                        ticking = false;
                    });
                    ticking = true;
                }
            });
        },

        renderRows(container, data, columns, startIndex) {
            const endIndex = Math.min(data.length, startIndex + this.visibleRows + this.buffer * 2);
            const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

            let html = '';
            for (let i = startIndex; i < endIndex; i++) {
                const row = data[i];
                html += `<div class="virtual-row flex items-center border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 table-row-hover" style="height: ${this.rowHeight}px">`;

                columns.forEach(col => {
                    let value = row[col.key];
                    if (col.format === 'currency') value = fmt.format(value);
                    html += `<div class="px-4 ${col.class || ''}">${Security.sanitizeHTML(String(value))}</div>`;
                });

                html += '</div>';
            }
            container.innerHTML = html;
        },

        renderNormal(container, data, columns) {
            const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

            let html = '<table class="min-w-full"><tbody>';
            data.forEach(row => {
                html += '<tr class="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 table-row-hover">';
                columns.forEach(col => {
                    let value = row[col.key];
                    if (col.format === 'currency') value = fmt.format(value);
                    html += `<td class="px-4 py-3 ${col.class || ''}">${Security.sanitizeHTML(String(value))}</td>`;
                });
                html += '</tr>';
            });
            html += '</tbody></table>';
            container.innerHTML = html;
        }
    };

    // =====================================================================
    // DATA VALIDATION
    // =====================================================================

    const DataValidator = {
        rules: {
            'config-min-value': { validate: (v) => v >= 0, message: 'Valor deve ser positivo' },
            'config-max-value': { validate: (v) => v > 0, message: 'Valor deve ser maior que zero' },
            'config-max-file': { validate: (v) => v >= 1 && v <= 100, message: 'Entre 1 e 100 MB' }
        },

        init() {
            Object.entries(this.rules).forEach(([id, rule]) => {
                const input = document.getElementById(id);
                if (!input) return;

                input.addEventListener('input', function() {
                    const value = parseFloat(this.value);
                    const isValid = !isNaN(value) && rule.validate(value);

                    this.classList.toggle('border-red-500', !isValid);
                    this.classList.toggle('border-green-500', isValid);

                    const existingMsg = this.parentElement?.querySelector('.validation-msg');
                    if (existingMsg) existingMsg.remove();

                    if (!isValid && this.value) {
                        const msg = document.createElement('p');
                        msg.className = 'validation-msg';
                        msg.textContent = rule.message;
                        this.parentElement?.appendChild(msg);
                    }
                });
            });
        }
    };

    // =====================================================================
    // UNSAVED CHANGES WARNING
    // =====================================================================

    const UnsavedChangesTracker = {
        hasUnsavedChanges: false,

        markDirty() { this.hasUnsavedChanges = true; },
        markClean() { this.hasUnsavedChanges = false; },

        init() {
            document.addEventListener('click', (e) => {
                if (e.target.closest('.filter-btn') || e.target.closest('[onclick*="filterByDate"]')) {
                    this.markDirty();
                }
            });

            window.addEventListener('beforeunload', (e) => {
                if (this.hasUnsavedChanges && typeof fullData !== 'undefined' && fullData.length > 0) {
                    e.preventDefault();
                    e.returnValue = 'Você tem alterações não salvas. Deseja realmente sair?';
                    return e.returnValue;
                }
            });
        }
    };

    // Expor utilitários globalmente
    window.NexusUtils = Utils;
    window.NexusSecurity = Security;
    window.A11y = { announce: ToastSystem.announce };
    window.SkeletonLoader = SkeletonLoader;
    window.VirtualTable = VirtualTable;
    window.KPIAnimator = KPIAnimator;

    // =====================================================================
    // LOG FINAL
    // =====================================================================
    console.log('📦 Nexus Unified v3.0 - Módulos carregados:');
    console.log('  ✅ Utils (debounce, throttle, parsers)');
    console.log('  ✅ Security (CSV/HTML sanitization)');
    console.log('  ✅ RateLimiter (5 req/min)');
    console.log('  ✅ SafeStorage (IndexedDB + localStorage fallback)');
    console.log('  ✅ ToastSystem (unified notifications)');
    console.log('  ✅ PerfMonitor (performance tracking)');
    console.log('  ✅ Error Handlers (global catch)');
    console.log('  ✅ Chart Handlers (resize, cleanup)');
    console.log('  ✅ Function Wrappers (improved originals)');
    console.log('  ✅ Chatbot (optimized Gemini integration)');
    console.log('  ✅ A11y (accessibility)');
    console.log('  ✅ Mobile Enhancements');
    console.log('  ✅ Connection Monitor');
    console.log('  ✅ Modal Focus Trap');

})();
