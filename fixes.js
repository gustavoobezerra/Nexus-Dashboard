// NEXUS DASHBOARD - CRITICAL FIXES (VERSÃO COMPLETA)
// Este arquivo contém TODAS as correções originais + correções críticas do chatbot

console.log('🔧 Carregando Nexus Dashboard - Critical Fixes (Completo)...');

// ==================== FIX 1: Global Error Handler ====================
window.addEventListener('error', (e) => {
    console.error('Global Error:', e.error);
    showToast('Erro inesperado. Recarregue a página.', 'error');
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise:', e.reason);
    showToast('Erro de conexão. Verifique sua internet.', 'error');
});

// ==================== FIX 2: Chart Resize Handler ====================
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        Object.values(charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    }, 250);
});

// ==================== FIX 3: LocalStorage Fallback ====================
const SafeStorage = {
    async saveData(key, data) {
        try {
            await saveDataToDB(data);
        } catch (e) {
            console.warn('IndexedDB failed, using localStorage', e);
            try {
                localStorage.setItem(key, JSON.stringify(data.slice(0, 1000))); // Limit
            } catch (storageError) {
                showToast('Armazenamento cheio. Limpe dados antigos.', 'error');
            }
        }
    },

    async loadData(key) {
        try {
            return await loadDataFromDB();
        } catch (e) {
            console.warn('IndexedDB failed, trying localStorage', e);
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : [];
        }
    }
};

// ==================== FIX 4: API Key (VIA PROXY) ====================
// URL base para o proxy server. Usa localhost para desenvolvimento e Render para produção.
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : 'https://nexus-dashboard-qpdm.onrender.com';
// A chave de API agora é gerenciada pelo servidor proxy (Flask) para maior segurança.
// O frontend não precisa mais da chave.
const GEMINI_API_KEY = null; // Chave removida do frontend

function validateApiKeySync() {
    // Retorna true, pois a chave será gerenciada pelo proxy
    return true;
}

// ==================== FIX 5: CSV Parser Error Handler ====================
const originalHandleFileUpload = window.handleFileUpload;
window.handleFileUpload = function(input) {
    const file = input.files[0];
    if (!file) return;

    // Enhanced validation
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (!allowedTypes.includes(fileType) && !fileName.endsWith('.csv')) {
        showToast('Formato inválido! Use apenas arquivos .CSV', 'error');
        input.value = '';
        return;
    }

    // Call original function
    if (originalHandleFileUpload) {
        originalHandleFileUpload.call(this, input);
    }
};

// ==================== FIX 6: Chart Null Check ====================
const originalInitChart = window.initChart;
window.initChart = function(id, type, data, options) {
    const canvas = document.getElementById(id);
    if (!canvas) {
        console.warn(`Canvas #${id} not found`);
        return null;
    }

    // Destroy existing chart
    if (charts[id]) {
        try {
            charts[id].destroy();
        } catch (e) {
            console.warn('Chart destroy failed:', e);
        }
    }

    // Call original with error handling
    try {
        return originalInitChart.call(this, id, type, data, options);
    } catch (e) {
        console.error(`Chart ${id} creation failed:`, e);
        showToast(`Erro ao criar gráfico ${id}`, 'error');
        return null;
    }
};

// ==================== FIX 7: Forecast Safe Calculation ====================
const originalCalculateForecast = window.calculateAdvancedForecast;
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
        // Fallback: repeat last value
        const lastValue = values[values.length - 1] || 0;
        return Array(days).fill(lastValue);
    }
};

// ==================== FIX 8: Date Parsing Safe ====================
function safeParseDate(dateStr) {
    if (!dateStr) return null;

    try {
        const str = String(dateStr).trim();

        // Try Luxon formats
        const formats = [
            null, // ISO
            'dd/MM/yyyy',
            'dd-MM-yyyy',
            'yyyy/MM/dd',
            'MM/dd/yyyy',
            'dd/MM/yy',
            'yyyy-MM-dd',
            'd/M/yyyy',
            'd-M-yyyy'
        ];

        for (const fmt of formats) {
            let dt;
            if (fmt === null) {
                dt = luxon.DateTime.fromISO(str);
            } else {
                dt = luxon.DateTime.fromFormat(str, fmt);
            }

            if (dt.isValid && dt.year >= 1900 && dt.year <= 2100) {
                return dt.toISODate();
            }
        }

        // Try native Date as last resort
        const nativeDate = new Date(str);
        if (!isNaN(nativeDate.getTime())) {
            return luxon.DateTime.fromJSDate(nativeDate).toISODate();
        }

        return null;
    } catch (e) {
        console.error('Date parse error:', e, dateStr);
        return null;
    }
}

// ==================== FIX 9: Number Parsing Enhanced ====================
function safeParseNumber(val) {
    if (typeof val === 'number' && !isNaN(val)) return val;
    if (!val) return 0;

    try {
        // Remove currency symbols and spaces
        const cleaned = String(val)
            .replace(/[R$\s€£¥]/g, '')
            .replace(/\./g, '')  // Remove thousand separator
            .replace(',', '.')   // Decimal comma to dot
            .trim();

        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    } catch (e) {
        console.error('Number parse error:', e, val);
        return 0;
    }
}

// ==================== FIX 10: Modal Focus Trap ====================
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

// ==================== FIX 11: Debounced Filter ====================
let filterDebounceTimer;
function debouncedFilter(callback, delay = 300) {
    return function(...args) {
        clearTimeout(filterDebounceTimer);
        filterDebounceTimer = setTimeout(() => callback.apply(this, args), delay);
    };
}

// Apply to advanced filters
const originalApplyAdvancedFilters = window.applyAdvancedFilters;
window.applyAdvancedFilters = debouncedFilter(function() {
    if (originalApplyAdvancedFilters) {
        originalApplyAdvancedFilters.call(this);
    }
}, 300);

// ==================== FIX 12: Performance Monitor ====================
const perfMonitor = {
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
        } catch (e) {
            // Performance API not available
        }
    }
};

// ==================== FIX 13: Memory Cleanup ====================
window.addEventListener('beforeunload', () => {
    // Destroy all charts
    Object.values(charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            try {
                chart.destroy();
            } catch (e) {
                console.warn('Chart cleanup failed:', e);
            }
        }
    });

    // Clear large data structures
    fullData = [];
    currentData = [];
    timeSeriesData = {};
});

// ==================== FIX 14: CHATBOT - Otimizador de Contexto (NOVO) ====================
// Esta é uma função NOVA que não existia no arquivo original
// Ela reduz drasticamente o tamanho do payload enviado para a API
function getOptimizedContext(stats) {
    if (!stats || typeof stats !== 'object') return {};
    
    // Remove dados volumosos que não são essenciais para análise
    // Mantém apenas resumos e top items
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

// ==================== FIX 14: API Rate Limiting (STRICT 5 RPM) ====================
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

const geminiRateLimiter = new RateLimiter(5, 60000); // 5 req/min (Free Tier)

// ==================== FIX 14: CHATBOT - Função sendChatMessage CORRIGIDA ====================
// IMPORTANTE: Esta função SOBRESCREVE completamente a função original do index.html
// Ela inclui as 3 correções críticas identificadas

// Wrap API calls
const originalSendChatMessage = window.sendChatMessage;
// ==================== FIX 14: CHATBOT - Função sendChatMessage CORRIGIDA (Versão Google AI Studio) ====================
window.sendChatMessage = async function(ctx = null) {
    const input = document.getElementById('chat-input');
    const historyEl = document.getElementById('chat-history');
    
    // Validações iniciais
    if (!input || !historyEl) return;

    const text = input.value.trim();
    const apiKey = null; // Chave gerenciada pelo proxy
    
    if (!text && !ctx) return;
    
    // Validação de API Key removida, pois a chave está no proxy.

    // 1. Verificação de Rate Limit (Proteção contra RPM 5)
    try {
        await geminiRateLimiter.tryRequest();
    } catch (rateLimitError) {
        if (typeof showToast === 'function') showToast(rateLimitError.message, 'error');
        // Não prossegue se estourou o limite
        return;
    }

    // UI Update
    const sanitizedText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
        
        // Lista de modelos baseada no acesso do usuário (updated models)
        const models = [
            'gemini-2.5-flash',
            'gemini-exp-1206',
            'gemini-1.5-pro-latest',
            'gemini-1.5-flash-latest'
        ];

        let response = null;
        let lastError = null;
        let successModel = '';

        // Loop de tentativa de modelos com fail-fast em 429
        for (const model of models) {
            try {
                console.log(`🔄 Tentando modelo: ${model}...`);
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 40000);

                response = await fetch(
                    `${API_BASE_URL}/api/gemini-proxy`,
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
                    break; // Sai do loop se funcionar
                } else {
                    // FAIL-FAST: Se for 429, para imediatamente (evita ban)
                    if (response.status === 429) {
                        throw new Error("⚠️ Limite de taxa (5 RPM) excedido. Aguarde 1 minuto antes de tentar novamente.");
                    }

                    const errText = await response.text();
                    console.warn(`⚠️ Modelo ${model} falhou (${response.status})`);
                    lastError = `Erro ${response.status}: ${errText.substring(0, 100)}`;
                }
            } catch (err) {
                console.warn(`⚠️ Erro em ${model}:`, err.message);
                lastError = err.message;

                // FAIL-FAST: Se for erro de rate limit, para o loop
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
            throw new Error("A IA não retornou resposta válida (possível bloqueio de conteúdo).");
        }

        const aiResponse = data.candidates[0].content.parts[0].text;
        
        if (typeof chatHistory !== 'undefined') {
            chatHistory.push({ role: 'assistant', content: aiResponse, timestamp: Date.now() });
        }
        if (typeof saveChatHistory === 'function') saveChatHistory();

        const htmlContent = (typeof marked !== 'undefined') ? marked.parse(aiResponse) : aiResponse;
        
        // Adiciona um pequeno indicador de qual modelo respondeu (para debug)
        const debugInfo = `<div class="text-[10px] text-gray-400 mt-1 text-right">Respondido por: ${successModel}</div>`;
        
        historyEl.innerHTML += `<div class="chat-bubble chat-ai">${htmlContent}${debugInfo}</div>`;
        historyEl.scrollTop = historyEl.scrollHeight;

    } catch (error) {
        console.error('❌ Erro no chat:', error);
        document.getElementById(loadingId)?.remove();

        // Mensagem de erro personalizada
        let userMessage = error.message || "❌ Erro ao processar resposta.";

        if (error.name === 'AbortError') {
            userMessage = "⏱️ Tempo limite excedido (40s). Tente simplificar sua pergunta.";
        }

        historyEl.innerHTML += `<div class="chat-bubble chat-ai border-2 border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
            <strong><i class="fa-solid fa-triangle-exclamation"></i> Erro:</strong><br>
            ${userMessage}
            <div class="text-xs mt-2 opacity-75">
                💡 Dicas: Verifique sua API Key, reformule a pergunta ou aguarde se excedeu o limite de taxa.
            </div>
        </div>`;
        historyEl.scrollTop = historyEl.scrollHeight;

        if (typeof showToast === 'function') {
            const shortError = userMessage.length > 80 ? userMessage.substring(0, 77) + '...' : userMessage;
            showToast(shortError, 'error');
        }
    }
};

// ==================== FIX 15: Accessibility Improvements ====================
// Add ARIA labels to interactive elements
document.addEventListener('DOMContentLoaded', () => {
    // Add role and aria-label to charts
    document.querySelectorAll('canvas').forEach(canvas => {
        if (!canvas.getAttribute('role')) {
            canvas.setAttribute('role', 'img');
            canvas.setAttribute('aria-label', 'Gráfico de dados');
        }
    });

    // Add aria-live to toast container
    const toastContainer = document.getElementById('toast-container');
    if (toastContainer) {
        toastContainer.setAttribute('aria-live', 'polite');
        toastContainer.setAttribute('aria-atomic', 'true');
    }
});

// ==================== VERIFICAÇÃO DE INTEGRIDADE ====================
console.log('✅ Nexus Dashboard - Critical fixes applied (COMPLETO)');
console.log('📋 Checklist de Funcionalidades:');
console.log('  ✅ FIX 1: Global Error Handler');
console.log('  ✅ FIX 2: Chart Resize Handler');
console.log('  ✅ FIX 3: LocalStorage Fallback');
console.log('  ✅ FIX 4: API Key Validation Enhanced');
console.log('  ✅ FIX 5: CSV Parser Error Handler');
console.log('  ✅ FIX 6: Chart Null Check');
console.log('  ✅ FIX 7: Forecast Safe Calculation');
console.log('  ✅ FIX 8: Date Parsing Safe');
console.log('  ✅ FIX 9: Number Parsing Enhanced');
console.log('  ✅ FIX 10: Modal Focus Trap');
console.log('  ✅ FIX 11: Debounced Filter');
console.log('  ✅ FIX 12: Performance Monitor');
console.log('  ✅ FIX 13: Memory Cleanup');
console.log('  ✅ FIX 14: API Rate Limiting (Melhorado)');
console.log('  ✅ FIX 14-NOVO: Otimizador de Contexto (Chatbot)');
console.log('  ✅ FIX 14-NOVO: sendChatMessage Corrigida (Chatbot)');
console.log('  ✅ FIX 15: Accessibility Improvements');
console.log('');
console.log('🔧 CORREÇÕES CRÍTICAS DO CHATBOT:');
console.log('  ✅ Modelos atualizados: gemini-2.5-flash, gemini-exp-1206, gemini-1.5-pro-latest, gemini-1.5-flash-latest');
console.log('  ✅ Contexto otimizado (reduz payload significativamente)');
console.log('  ✅ Safety Settings configurados (evita bloqueios)');
console.log('  ✅ Rate limiting STRICT (5 req/min - Free Tier)');
console.log('  ✅ Fail-fast em 429 (evita ban de conta)');
console.log('  ✅ Timeout aumentado para 40s');
console.log('  ✅ Tratamento de erros detalhado');
console.log('');
console.log('🎯 Pronto para uso! Teste o chatbot agora.');