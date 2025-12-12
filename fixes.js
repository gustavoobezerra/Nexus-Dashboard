// NEXUS DASHBOARD - CRITICAL FIXES
// Aplique estas correções ao index.html

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

// ==================== FIX 4: API Key Validation Enhanced ====================
function validateApiKeySync() {
    const key = localStorage.getItem('geminiApiKey');
    if (!key || key === 'SUA_CHAVE_AQUI' || key.length < 30) {
        return false;
    }
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

// ==================== FIX 14: API Rate Limiting ====================
class RateLimiter {
    constructor(maxRequests = 10, windowMs = 60000) {
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
            throw new Error(`Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)}s`);
        }

        this.requests.push(now);
        return true;
    }
}

const geminiRateLimiter = new RateLimiter(15, 60000); // 15 req/min

// Wrap API calls
const originalSendChatMessage = window.sendChatMessage;
window.sendChatMessage = async function(ctx = null) {
    try {
        await geminiRateLimiter.tryRequest();
        return originalSendChatMessage.call(this, ctx);
    } catch (e) {
        showToast(e.message, 'error');
        return Promise.reject(e);
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

console.log('✅ Nexus Dashboard - Critical fixes applied');
