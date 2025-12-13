// =====================================================================
// NEXUS DASHBOARD - GRÁFICOS AVANÇADOS v1.0
// =====================================================================
// Novos tipos de gráficos para análise profunda de dados
// Requer Chart.js e plugins adicionais

(function() {
    'use strict';

    console.log('📊 Carregando gráficos avançados...');

    // =====================================================================
    // GRÁFICO 1: Scatter Plot (Dispersão)
    // =====================================================================

    window.createScatterChart = function(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn(`Canvas #${canvasId} não encontrado`);
            return null;
        }

        // Preparar dados para scatter
        const scatterData = data.map((item, idx) => ({
            x: item.category || idx,
            y: parseFloat(item.value) || 0,
            r: Math.sqrt(parseFloat(item.quantity) || 1) * 5 // Tamanho da bolha
        }));

        const ctx = canvas.getContext('2d');
        
        // Destruir gráfico anterior se existir
        if (window.charts && window.charts[canvasId]) {
            try {
                window.charts[canvasId].destroy();
            } catch (e) { }
        }

        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: { usePointStyle: true }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Valor: R$ ${context.raw.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Valor (R$)' }
                },
                x: {
                    title: { display: true, text: 'Categoria' }
                }
            }
        };

        const chart = new Chart(ctx, {
            type: 'bubble',
            data: {
                datasets: [{
                    label: 'Vendas por Categoria',
                    data: scatterData,
                    backgroundColor: 'rgba(99, 102, 241, 0.6)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 2
                }]
            },
            options: { ...defaultOptions, ...options }
        });

        if (!window.charts) window.charts = {};
        window.charts[canvasId] = chart;
        return chart;
    };

    // =====================================================================
    // GRÁFICO 2: Heatmap (Mapa de Calor)
    // =====================================================================

    window.createHeatmapChart = function(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn(`Canvas #${canvasId} não encontrado`);
            return null;
        }

        // Preparar dados para heatmap (matriz)
        const categories = [...new Set(data.map(d => d.category))];
        const payments = [...new Set(data.map(d => d.payment))];
        
        const heatmapData = [];
        
        categories.forEach((cat, catIdx) => {
            payments.forEach((pay, payIdx) => {
                const value = data
                    .filter(d => d.category === cat && d.payment === pay)
                    .reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0);
                
                heatmapData.push({
                    x: payIdx,
                    y: catIdx,
                    v: value
                });
            });
        });

        // Normalizar valores para cores
        const maxValue = Math.max(...heatmapData.map(d => d.v));
        const minValue = Math.min(...heatmapData.map(d => d.v));
        const range = maxValue - minValue || 1;

        const ctx = canvas.getContext('2d');
        
        if (window.charts && window.charts[canvasId]) {
            try {
                window.charts[canvasId].destroy();
            } catch (e) { }
        }

        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: () => 'Correlação',
                        label: function(context) {
                            const item = heatmapData[context.dataIndex];
                            return `${categories[item.y]} - ${payments[item.x]}: R$ ${item.v.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'category',
                    labels: payments,
                    ticks: { autoSkip: false }
                },
                y: {
                    type: 'category',
                    labels: categories,
                    ticks: { autoSkip: false }
                }
            }
        };

        // Usar bubble chart como heatmap
        const chart = new Chart(ctx, {
            type: 'bubble',
            data: {
                datasets: [{
                    label: 'Correlação Categoria x Pagamento',
                    data: heatmapData.map(d => ({
                        x: d.x,
                        y: d.y,
                        r: 15
                    })),
                    backgroundColor: heatmapData.map(d => {
                        const normalized = (d.v - minValue) / range;
                        return `rgba(99, 102, 241, ${normalized})`; // Opacidade baseada no valor
                    }),
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 1
                }]
            },
            options: { ...defaultOptions, ...options }
        });

        if (!window.charts) window.charts = {};
        window.charts[canvasId] = chart;
        return chart;
    };

    // =====================================================================
    // GRÁFICO 3: Box Plot (Distribuição)
    // =====================================================================

    window.createBoxPlotChart = function(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn(`Canvas #${canvasId} não encontrado`);
            return null;
        }

        // Calcular quartis por categoria
        const categories = [...new Set(data.map(d => d.category))];
        const boxPlotData = [];

        categories.forEach(cat => {
            const values = data
                .filter(d => d.category === cat)
                .map(d => parseFloat(d.value) || 0)
                .sort((a, b) => a - b);

            if (values.length === 0) return;

            const q1Idx = Math.floor(values.length * 0.25);
            const q2Idx = Math.floor(values.length * 0.5);
            const q3Idx = Math.floor(values.length * 0.75);

            boxPlotData.push({
                label: cat,
                min: Math.min(...values),
                q1: values[q1Idx],
                median: values[q2Idx],
                q3: values[q3Idx],
                max: Math.max(...values),
                mean: values.reduce((a, b) => a + b, 0) / values.length
            });
        });

        const ctx = canvas.getContext('2d');
        
        if (window.charts && window.charts[canvasId]) {
            try {
                window.charts[canvasId].destroy();
            } catch (e) { }
        }

        // Usar bar chart para visualizar quartis
        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: { display: true, text: 'Valor (R$)' }
                }
            }
        };

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: boxPlotData.map(d => d.label),
                datasets: [
                    {
                        label: 'Mínimo',
                        data: boxPlotData.map(d => d.min),
                        backgroundColor: 'rgba(239, 68, 68, 0.3)',
                        borderColor: 'rgba(239, 68, 68, 1)'
                    },
                    {
                        label: 'Q1',
                        data: boxPlotData.map(d => d.q1),
                        backgroundColor: 'rgba(251, 146, 60, 0.3)',
                        borderColor: 'rgba(251, 146, 60, 1)'
                    },
                    {
                        label: 'Mediana',
                        data: boxPlotData.map(d => d.median),
                        backgroundColor: 'rgba(34, 197, 94, 0.3)',
                        borderColor: 'rgba(34, 197, 94, 1)',
                        borderWidth: 2
                    },
                    {
                        label: 'Q3',
                        data: boxPlotData.map(d => d.q3),
                        backgroundColor: 'rgba(59, 130, 246, 0.3)',
                        borderColor: 'rgba(59, 130, 246, 1)'
                    },
                    {
                        label: 'Máximo',
                        data: boxPlotData.map(d => d.max),
                        backgroundColor: 'rgba(139, 92, 246, 0.3)',
                        borderColor: 'rgba(139, 92, 246, 1)'
                    }
                ]
            },
            options: { ...defaultOptions, ...options }
        });

        if (!window.charts) window.charts = {};
        window.charts[canvasId] = chart;
        return chart;
    };

    // =====================================================================
    // GRÁFICO 4: Radar Chart (Comparação Multivariada)
    // =====================================================================

    window.createRadarChart = function(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn(`Canvas #${canvasId} não encontrado`);
            return null;
        }

        // Calcular métricas por categoria
        const categories = [...new Set(data.map(d => d.category))];
        const metrics = ['Total', 'Média', 'Máximo', 'Contagem'];

        const radarData = categories.map(cat => {
            const catData = data.filter(d => d.category === cat).map(d => parseFloat(d.value) || 0);
            return {
                label: cat,
                total: catData.reduce((a, b) => a + b, 0),
                average: catData.reduce((a, b) => a + b, 0) / catData.length,
                max: Math.max(...catData),
                count: catData.length
            };
        });

        const ctx = canvas.getContext('2d');
        
        if (window.charts && window.charts[canvasId]) {
            try {
                window.charts[canvasId].destroy();
            } catch (e) { }
        }

        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        };

        const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b'];

        const chart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: metrics,
                datasets: radarData.map((item, idx) => ({
                    label: item.label,
                    data: [
                        item.total / 100,
                        item.average,
                        item.max / 100,
                        item.count
                    ],
                    borderColor: colors[idx % colors.length],
                    backgroundColor: colors[idx % colors.length] + '33',
                    fill: true,
                    tension: 0.4
                }))
            },
            options: { ...defaultOptions, ...options }
        });

        if (!window.charts) window.charts = {};
        window.charts[canvasId] = chart;
        return chart;
    };

    // =====================================================================
    // GRÁFICO 5: Análise de Correlação
    // =====================================================================

    window.calculateCorrelation = function(data, var1Key, var2Key) {
        const values1 = data.map(d => parseFloat(d[var1Key]) || 0);
        const values2 = data.map(d => parseFloat(d[var2Key]) || 0);

        if (values1.length === 0 || values2.length === 0) return 0;

        const mean1 = values1.reduce((a, b) => a + b, 0) / values1.length;
        const mean2 = values2.reduce((a, b) => a + b, 0) / values2.length;

        let numerator = 0;
        let denominator1 = 0;
        let denominator2 = 0;

        for (let i = 0; i < values1.length; i++) {
            const diff1 = values1[i] - mean1;
            const diff2 = values2[i] - mean2;
            numerator += diff1 * diff2;
            denominator1 += diff1 * diff1;
            denominator2 += diff2 * diff2;
        }

        const denominator = Math.sqrt(denominator1 * denominator2);
        return denominator === 0 ? 0 : numerator / denominator;
    };

    window.createCorrelationMatrix = function(data, variables) {
        const matrix = [];
        
        for (let i = 0; i < variables.length; i++) {
            const row = [];
            for (let j = 0; j < variables.length; j++) {
                if (i === j) {
                    row.push(1);
                } else {
                    row.push(window.calculateCorrelation(data, variables[i], variables[j]));
                }
            }
            matrix.push(row);
        }

        return matrix;
    };

    // =====================================================================
    // GRÁFICO 6: Gauge Chart (KPI)
    // =====================================================================

    window.createGaugeChart = function(canvasId, value, max = 100, label = 'KPI', options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn(`Canvas #${canvasId} não encontrado`);
            return null;
        }

        const percentage = (value / max) * 100;
        const ctx = canvas.getContext('2d');
        
        if (window.charts && window.charts[canvasId]) {
            try {
                window.charts[canvasId].destroy();
            } catch (e) { }
        }

        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            circumference: 180,
            rotation: 270,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        };

        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [label, 'Restante'],
                datasets: [{
                    data: [percentage, 100 - percentage],
                    backgroundColor: [
                        percentage > 75 ? '#10b981' : percentage > 50 ? '#f59e0b' : '#ef4444',
                        '#e5e7eb'
                    ],
                    borderWidth: 0
                }]
            },
            options: { ...defaultOptions, ...options }
        });

        if (!window.charts) window.charts = {};
        window.charts[canvasId] = chart;
        return chart;
    };

    // =====================================================================
    // ANÁLISE ESTATÍSTICA
    // =====================================================================

    window.StatisticalAnalysis = {
        mean(values) {
            if (values.length === 0) return 0;
            return values.reduce((a, b) => a + b, 0) / values.length;
        },

        median(values) {
            const sorted = [...values].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        },

        stdDev(values) {
            const mean = this.mean(values);
            const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
            return Math.sqrt(variance);
        },

        variance(values) {
            const mean = this.mean(values);
            return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        },

        percentile(values, p) {
            const sorted = [...values].sort((a, b) => a - b);
            const index = Math.ceil((p / 100) * sorted.length) - 1;
            return sorted[Math.max(0, index)];
        },

        outliers(values, stdDevThreshold = 2) {
            const mean = this.mean(values);
            const stdDev = this.stdDev(values);
            return values.filter(v => Math.abs(v - mean) > stdDev * stdDevThreshold);
        }
    };

    // =====================================================================
    // INICIALIZAÇÃO
    // =====================================================================

    console.log('✅ Gráficos avançados carregados com sucesso!');

    window.AdvancedCharts = {
        createScatterChart: window.createScatterChart,
        createHeatmapChart: window.createHeatmapChart,
        createBoxPlotChart: window.createBoxPlotChart,
        createRadarChart: window.createRadarChart,
        calculateCorrelation: window.calculateCorrelation,
        createCorrelationMatrix: window.createCorrelationMatrix,
        createGaugeChart: window.createGaugeChart,
        StatisticalAnalysis: window.StatisticalAnalysis
    };

})();
