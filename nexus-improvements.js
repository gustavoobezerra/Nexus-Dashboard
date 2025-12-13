// =====================================================================
// NEXUS DASHBOARD - MELHORIAS E CORREÇÕES v4.0
// =====================================================================
// Arquivo com melhorias, novos gráficos e correções de bugs
// Deve ser carregado APÓS nexus-unified.js

(function() {
    'use strict';

    console.log('🚀 Nexus Dashboard Improvements v4.0 - Carregando...');

    // =====================================================================
    // CORREÇÃO: Validação Robusta em updateChartsTheme
    // =====================================================================

    const OriginalUpdateChartsTheme = window.updateChartsTheme;
    window.updateChartsTheme = function() {
        const isDark = document.documentElement.classList.contains('dark');
        const color = isDark ? '#e2e8f0' : '#334155';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        window.chartTheme = {
            color: color,
            gridColor: gridColor,
            font: { family: 'Inter', size: 12 },
            tooltip: {
                backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                titleColor: color,
                bodyColor: color,
                borderColor: isDark ? '#475569' : '#cbd5e1',
                borderWidth: 1,
            }
        };

        // Re-render all charts with new theme - COM VALIDAÇÃO
        if (typeof charts !== 'undefined' && charts) {
            Object.values(charts).forEach(chart => {
                if (!chart || typeof chart.update !== 'function') return;
                
                try {
                    // Atualizar apenas se existir escalas
                    if (chart.options.scales && chart.options.scales.y) {
                        chart.options.scales.y.ticks.color = window.chartTheme.color;
                        chart.options.scales.y.grid.color = window.chartTheme.gridColor;
                    }
                    if (chart.options.scales && chart.options.scales.x) {
                        chart.options.scales.x.ticks.color = window.chartTheme.color;
                        if (chart.options.scales.x.grid) {
                            chart.options.scales.x.grid.color = window.chartTheme.gridColor;
                        }
                    }
                    
                    // Atualizar tooltip
                    if (chart.options.plugins && chart.options.plugins.tooltip) {
                        chart.options.plugins.tooltip = window.chartTheme.tooltip;
                    }
                    
                    chart.options.color = window.chartTheme.color;
                    chart.update('none');
                } catch (e) {
                    console.warn('Erro ao atualizar tema do gráfico:', e);
                }
            });
        }
    };

    // =====================================================================
    // CORREÇÃO: Validação Robusta de CSV
    // =====================================================================

    window.validateCSVStructure = function(data) {
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('CSV vazio ou inválido');
        }

        const firstRow = data[0];
        if (!firstRow || typeof firstRow !== 'object') {
            throw new Error('Estrutura de CSV inválida');
        }

        const headers = Object.keys(firstRow);
        if (headers.length === 0) {
            throw new Error('CSV sem colunas');
        }

        // Validar tipos de dados
        const requiredFields = ['date', 'value', 'category'];
        const hasRequiredFields = requiredFields.some(field => 
            headers.some(h => h.toLowerCase().includes(field.toLowerCase()))
        );

        if (!hasRequiredFields) {
            console.warn('⚠️ CSV pode estar em formato não reconhecido. Tentando processar mesmo assim...');
        }

        // Validar que não há mais de 50% de linhas vazias
        const emptyRows = data.filter(row => 
            Object.values(row).every(v => !v || v === '')
        ).length;

        if (emptyRows / data.length > 0.5) {
            throw new Error('CSV contém muitas linhas vazias (>50%)');
        }

        return true;
    };

    // =====================================================================
    // MELHORIA: Sistema Unificado de Filtros
    // =====================================================================

    window.FilterManager = {
        filters: {
            dateStart: null,
            dateEnd: null,
            categories: [],
            products: [],
            payments: [],
            statuses: [],
            valueMin: 0,
            valueMax: Infinity
        },

        apply() {
            if (typeof applyAdvancedFilters === 'function') {
                applyAdvancedFilters();
            }
        },

        clear() {
            this.filters = {
                dateStart: null,
                dateEnd: null,
                categories: [],
                products: [],
                payments: [],
                statuses: [],
                valueMin: 0,
                valueMax: Infinity
            };
            this.apply();
        },

        set(key, value) {
            if (key in this.filters) {
                this.filters[key] = value;
                return true;
            }
            return false;
        },

        get(key) {
            return this.filters[key];
        },

        getActive() {
            return Object.entries(this.filters)
                .filter(([k, v]) => v && (Array.isArray(v) ? v.length > 0 : v !== null))
                .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
        }
    };

    // =====================================================================
    // MELHORIA: Validação de Filtros
    // =====================================================================

    window.validateFilters = function() {
        const filters = window.FilterManager.filters;
        
        if (filters.dateStart && filters.dateEnd) {
            const start = new Date(filters.dateStart);
            const end = new Date(filters.dateEnd);
            
            if (start > end) {
                window.showToast?.('Data inicial não pode ser maior que data final', 'error');
                return false;
            }
            
            const diffDays = (end - start) / (1000 * 60 * 60 * 24);
            if (diffDays > 3650) { // 10 anos
                window.showToast?.('Intervalo de datas muito grande (máx 10 anos)', 'warning');
            }
        }

        if (filters.valueMin > filters.valueMax) {
            window.showToast?.('Valor mínimo não pode ser maior que máximo', 'error');
            return false;
        }

        return true;
    };

    // =====================================================================
    // MELHORIA: Tratamento de Valores Nulos em Gráficos
    // =====================================================================

    window.sanitizeChartData = function(data) {
        if (!Array.isArray(data)) return [];
        
        return data.map(value => {
            if (value === null || value === undefined || value === '') {
                return 0;
            }
            const num = parseFloat(value);
            return isNaN(num) ? 0 : num;
        });
    };

    // =====================================================================
    // MELHORIA: Feedback Melhorado para Exportação
    // =====================================================================

    const OriginalExportToCSV = window.exportToCSV;
    window.exportToCSV = function() {
        try {
            if (typeof currentData === 'undefined' || !currentData.length) {
                window.showToast?.('Nenhum dado para exportar!', 'error');
                return;
            }

            // Mostrar loading
            const startTime = Date.now();
            window.showToast?.('Preparando exportação...', 'info');

            // Chamar função original
            OriginalExportToCSV.call(this);

            // Feedback de sucesso
            const duration = Date.now() - startTime;
            setTimeout(() => {
                window.showToast?.(
                    `✅ CSV exportado com sucesso! (${currentData.length} registros em ${duration}ms)`,
                    'success'
                );
            }, 500);
        } catch (error) {
            console.error('Erro na exportação:', error);
            window.showToast?.(`Erro ao exportar: ${error.message}`, 'error');
        }
    };

    // =====================================================================
    // MELHORIA: Debounce para Ações Frequentes
    // =====================================================================

    window.DebouncedActions = {
        filterTimeout: null,
        resizeTimeout: null,

        debounceFilter(fn, delay = 300) {
            clearTimeout(this.filterTimeout);
            this.filterTimeout = setTimeout(() => {
                fn();
            }, delay);
        },

        debounceResize(fn, delay = 250) {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                fn();
            }, delay);
        }
    };

    // =====================================================================
    // MELHORIA: Limpeza de Memória Melhorada
    // =====================================================================

    window.cleanupMemory = function() {
        console.log('🧹 Limpando memória...');
        
        // Destruir todos os gráficos
        if (typeof charts !== 'undefined' && charts) {
            Object.entries(charts).forEach(([id, chart]) => {
                if (chart && typeof chart.destroy === 'function') {
                    try {
                        chart.destroy();
                        charts[id] = null;
                    } catch (e) {
                        console.warn(`Erro ao destruir gráfico ${id}:`, e);
                    }
                }
            });
        }

        // Limpar dados globais
        if (typeof fullData !== 'undefined') fullData = [];
        if (typeof currentData !== 'undefined') currentData = [];
        if (typeof timeSeriesData !== 'undefined') timeSeriesData = {};
        if (typeof stats !== 'undefined') stats = {};

        // Forçar garbage collection (se disponível)
        if (window.gc) {
            window.gc();
        }

        console.log('✅ Memória limpa');
    };

    // =====================================================================
    // MELHORIA: Monitoramento de Performance
    // =====================================================================

    window.PerformanceMonitor = {
        metrics: {},

        start(label) {
            this.metrics[label] = {
                start: performance.now(),
                memory: performance.memory?.usedJSHeapSize || 0
            };
        },

        end(label) {
            if (!this.metrics[label]) return;

            const duration = performance.now() - this.metrics[label].start;
            const memoryDelta = (performance.memory?.usedJSHeapSize || 0) - this.metrics[label].memory;

            if (duration > 1000) {
                console.warn(`⚠️ Operação lenta: ${label} levou ${duration.toFixed(2)}ms`);
            }

            console.log(`📊 ${label}: ${duration.toFixed(2)}ms (Memória: ${(memoryDelta / 1024 / 1024).toFixed(2)}MB)`);

            delete this.metrics[label];
        },

        getReport() {
            return {
                timestamp: new Date().toISOString(),
                memory: performance.memory?.usedJSHeapSize || 0,
                charts: typeof charts !== 'undefined' ? Object.keys(charts).length : 0,
                dataPoints: typeof currentData !== 'undefined' ? currentData.length : 0
            };
        }
    };

    // =====================================================================
    // MELHORIA: Validação de Acessibilidade
    // =====================================================================

    window.AccessibilityChecker = {
        check() {
            const issues = [];

            // Verificar contraste
            document.querySelectorAll('[style*="color"]').forEach(el => {
                const color = window.getComputedStyle(el).color;
                const bgColor = window.getComputedStyle(el).backgroundColor;
                // Implementação simplificada
                if (color === bgColor) {
                    issues.push(`Elemento sem contraste: ${el.className}`);
                }
            });

            // Verificar ARIA labels
            document.querySelectorAll('button, a').forEach(el => {
                if (!el.getAttribute('aria-label') && !el.textContent.trim()) {
                    issues.push(`Elemento sem label acessível: ${el.className}`);
                }
            });

            if (issues.length > 0) {
                console.warn('⚠️ Problemas de acessibilidade encontrados:', issues);
            }

            return issues;
        }
    };

    // =====================================================================
    // MELHORIA: Tratamento de Erros Global Melhorado
    // =====================================================================

    window.ErrorHandler = {
        errors: [],

        handle(error, context = 'unknown') {
            const errorObj = {
                message: error.message || String(error),
                stack: error.stack,
                context,
                timestamp: new Date().toISOString()
            };

            this.errors.push(errorObj);

            // Manter apenas últimos 50 erros
            if (this.errors.length > 50) {
                this.errors.shift();
            }

            console.error(`❌ Erro em ${context}:`, error);

            // Não mostrar toast para erros muito frequentes
            const recentErrors = this.errors.filter(e => 
                e.context === context && 
                Date.now() - new Date(e.timestamp).getTime() < 5000
            );

            if (recentErrors.length <= 3) {
                window.showToast?.(
                    `Erro: ${error.message?.substring(0, 50)}...`,
                    'error'
                );
            }
        },

        getReport() {
            return {
                totalErrors: this.errors.length,
                errors: this.errors.slice(-10),
                contexts: [...new Set(this.errors.map(e => e.context))]
            };
        }
    };

    // =====================================================================
    // INICIALIZAÇÃO
    // =====================================================================

    console.log('✅ Nexus Dashboard Improvements v4.0 - Carregado com sucesso!');

    // Expor globalmente
    window.NexusImprovements = {
        validateCSVStructure: window.validateCSVStructure,
        FilterManager: window.FilterManager,
        validateFilters: window.validateFilters,
        sanitizeChartData: window.sanitizeChartData,
        cleanupMemory: window.cleanupMemory,
        PerformanceMonitor: window.PerformanceMonitor,
        AccessibilityChecker: window.AccessibilityChecker,
        ErrorHandler: window.ErrorHandler,
        DebouncedActions: window.DebouncedActions
    };

})();
