// =====================================================================
// NEXUS DASHBOARD - ANÁLISES ESTATÍSTICAS AVANÇADAS v1.0
// =====================================================================
// Análises profundas de dados com métricas estatísticas

(function() {
    'use strict';

    console.log('📈 Carregando análises estatísticas avançadas...');

    // =====================================================================
    // ANÁLISE DE TENDÊNCIAS
    // =====================================================================

    window.TrendAnalysis = {
        /**
         * Calcula a tendência usando regressão linear
         */
        linearTrend(dates, values) {
            if (values.length < 2) return { slope: 0, intercept: 0, r2: 0 };

            const n = values.length;
            const xValues = Array.from({ length: n }, (_, i) => i);
            
            const xMean = xValues.reduce((a, b) => a + b, 0) / n;
            const yMean = values.reduce((a, b) => a + b, 0) / n;

            let numerator = 0;
            let denominator = 0;

            for (let i = 0; i < n; i++) {
                numerator += (xValues[i] - xMean) * (values[i] - yMean);
                denominator += Math.pow(xValues[i] - xMean, 2);
            }

            const slope = denominator === 0 ? 0 : numerator / denominator;
            const intercept = yMean - slope * xMean;

            // Calcular R²
            const yPredicted = xValues.map(x => slope * x + intercept);
            const ssRes = values.reduce((sum, y, i) => sum + Math.pow(y - yPredicted[i], 2), 0);
            const ssTot = values.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
            const r2 = ssTot === 0 ? 0 : 1 - (ssRes / ssTot);

            return { slope, intercept, r2, trend: slope > 0 ? 'crescente' : slope < 0 ? 'decrescente' : 'estável' };
        },

        /**
         * Detecta mudanças significativas na tendência
         */
        detectTrendChange(values, windowSize = 7) {
            if (values.length < windowSize * 2) return [];

            const changes = [];
            const windows = [];

            for (let i = 0; i <= values.length - windowSize; i++) {
                const window = values.slice(i, i + windowSize);
                const trend = this.linearTrend([], window);
                windows.push({ index: i, slope: trend.slope });
            }

            for (let i = 1; i < windows.length; i++) {
                const diff = Math.abs(windows[i].slope - windows[i - 1].slope);
                if (diff > 0.5) {
                    changes.push({
                        date: i + windowSize,
                        previousSlope: windows[i - 1].slope,
                        newSlope: windows[i].slope,
                        magnitude: diff
                    });
                }
            }

            return changes;
        },

        /**
         * Calcula velocidade de mudança (aceleração)
         */
        acceleration(values) {
            if (values.length < 3) return 0;

            const firstDiff = [];
            for (let i = 1; i < values.length; i++) {
                firstDiff.push(values[i] - values[i - 1]);
            }

            const secondDiff = [];
            for (let i = 1; i < firstDiff.length; i++) {
                secondDiff.push(firstDiff[i] - firstDiff[i - 1]);
            }

            return secondDiff.reduce((a, b) => a + b, 0) / secondDiff.length;
        }
    };

    // =====================================================================
    // ANÁLISE DE SAZONALIDADE
    // =====================================================================

    window.SeasonalityAnalysis = {
        /**
         * Detecta padrões sazonais
         */
        detectSeasonality(dates, values, seasonLength = 7) {
            if (values.length < seasonLength * 2) {
                return { hasSeasonality: false, strength: 0 };
            }

            const seasons = [];
            for (let i = 0; i < seasonLength; i++) {
                const seasonValues = [];
                for (let j = i; j < values.length; j += seasonLength) {
                    seasonValues.push(values[j]);
                }
                seasons.push(seasonValues);
            }

            // Calcular variância dentro de cada estação
            const seasonalVariances = seasons.map(season => {
                const mean = season.reduce((a, b) => a + b, 0) / season.length;
                return season.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / season.length;
            });

            const avgVariance = seasonalVariances.reduce((a, b) => a + b, 0) / seasonalVariances.length;
            const totalVariance = this.calculateVariance(values);

            const strength = totalVariance === 0 ? 0 : 1 - (avgVariance / totalVariance);

            return {
                hasSeasonality: strength > 0.3,
                strength: strength,
                seasonLength: seasonLength,
                pattern: seasons
            };
        },

        /**
         * Calcula índices sazonais
         */
        seasonalIndices(values, seasonLength = 7) {
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const indices = [];

            for (let i = 0; i < seasonLength; i++) {
                const seasonValues = [];
                for (let j = i; j < values.length; j += seasonLength) {
                    seasonValues.push(values[j]);
                }
                const seasonMean = seasonValues.reduce((a, b) => a + b, 0) / seasonValues.length;
                indices.push(seasonMean / mean);
            }

            return indices;
        },

        calculateVariance(values) {
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        }
    };

    // =====================================================================
    // ANÁLISE DE ANOMALIAS
    // =====================================================================

    window.AnomalyDetection = {
        /**
         * Detecta outliers usando IQR (Interquartile Range)
         */
        detectOutliersIQR(values) {
            const sorted = [...values].sort((a, b) => a - b);
            const q1Idx = Math.floor(sorted.length * 0.25);
            const q3Idx = Math.floor(sorted.length * 0.75);

            const q1 = sorted[q1Idx];
            const q3 = sorted[q3Idx];
            const iqr = q3 - q1;

            const lowerBound = q1 - 1.5 * iqr;
            const upperBound = q3 + 1.5 * iqr;

            const outliers = [];
            values.forEach((val, idx) => {
                if (val < lowerBound || val > upperBound) {
                    outliers.push({
                        index: idx,
                        value: val,
                        type: val < lowerBound ? 'baixo' : 'alto',
                        severity: Math.abs(val - (val < lowerBound ? lowerBound : upperBound))
                    });
                }
            });

            return { outliers, bounds: { lower: lowerBound, upper: upperBound } };
        },

        /**
         * Detecta anomalias usando Z-score
         */
        detectOutliersZScore(values, threshold = 2.5) {
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
            const stdDev = Math.sqrt(variance);

            const anomalies = [];
            values.forEach((val, idx) => {
                const zScore = stdDev === 0 ? 0 : (val - mean) / stdDev;
                if (Math.abs(zScore) > threshold) {
                    anomalies.push({
                        index: idx,
                        value: val,
                        zScore: zScore,
                        severity: Math.abs(zScore)
                    });
                }
            });

            return anomalies;
        },

        /**
         * Detecta mudanças abruptas (changepoint detection)
         */
        detectChangepoints(values, minSegmentLength = 3) {
            if (values.length < minSegmentLength * 2) return [];

            const changepoints = [];
            const windowSize = Math.max(3, Math.floor(values.length / 10));

            for (let i = windowSize; i < values.length - windowSize; i++) {
                const before = values.slice(i - windowSize, i);
                const after = values.slice(i, i + windowSize);

                const meanBefore = before.reduce((a, b) => a + b, 0) / before.length;
                const meanAfter = after.reduce((a, b) => a + b, 0) / after.length;

                const diff = Math.abs(meanAfter - meanBefore);
                const threshold = Math.max(meanBefore, meanAfter) * 0.2; // 20% de mudança

                if (diff > threshold) {
                    changepoints.push({
                        index: i,
                        magnitude: diff,
                        percentageChange: (diff / meanBefore) * 100
                    });
                }
            }

            return changepoints;
        }
    };

    // =====================================================================
    // ANÁLISE COMPARATIVA
    // =====================================================================

    window.ComparativeAnalysis = {
        /**
         * Compara dois períodos
         */
        comparePeriods(data1, data2) {
            const sum1 = data1.reduce((a, b) => a + b, 0);
            const sum2 = data2.reduce((a, b) => a + b, 0);
            const mean1 = sum1 / data1.length;
            const mean2 = sum2 / data2.length;

            const percentChange = sum1 === 0 ? 0 : ((sum2 - sum1) / sum1) * 100;
            const meanChange = mean1 === 0 ? 0 : ((mean2 - mean1) / mean1) * 100;

            return {
                period1: { sum: sum1, mean: mean1, count: data1.length },
                period2: { sum: sum2, mean: mean2, count: data2.length },
                change: {
                    absolute: sum2 - sum1,
                    percentage: percentChange,
                    meanChange: meanChange,
                    trend: percentChange > 0 ? 'crescimento' : percentChange < 0 ? 'queda' : 'estável'
                }
            };
        },

        /**
         * Análise Year-over-Year (YoY)
         */
        yoyAnalysis(currentYear, previousYear) {
            return this.comparePeriods(previousYear, currentYear);
        },

        /**
         * Análise Month-over-Month (MoM)
         */
        momAnalysis(currentMonth, previousMonth) {
            return this.comparePeriods(previousMonth, currentMonth);
        },

        /**
         * Teste de hipótese simples (t-test aproximado)
         */
        compareSignificance(data1, data2) {
            const mean1 = data1.reduce((a, b) => a + b, 0) / data1.length;
            const mean2 = data2.reduce((a, b) => a + b, 0) / data2.length;

            const var1 = data1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) / data1.length;
            const var2 = data2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0) / data2.length;

            const pooledVar = (var1 + var2) / 2;
            const se = Math.sqrt(pooledVar * (1 / data1.length + 1 / data2.length));

            const tStatistic = se === 0 ? 0 : (mean2 - mean1) / se;
            const isSignificant = Math.abs(tStatistic) > 1.96; // 95% confidence

            return {
                mean1, mean2,
                tStatistic,
                isSignificant,
                confidence: isSignificant ? '95%' : '<95%',
                interpretation: isSignificant ? 'Diferença significativa' : 'Sem diferença significativa'
            };
        }
    };

    // =====================================================================
    // ANÁLISE DE PERFORMANCE
    // =====================================================================

    window.PerformanceAnalysis = {
        /**
         * Calcula KPIs principais
         */
        calculateKPIs(data) {
            const values = data.map(d => parseFloat(d.value) || 0);
            const quantities = data.map(d => parseFloat(d.quantity) || 1);

            const totalRevenue = values.reduce((a, b) => a + b, 0);
            const totalQuantity = quantities.reduce((a, b) => a + b, 0);
            const avgValue = totalRevenue / values.length;
            const avgQuantity = totalQuantity / quantities.length;

            // Calcular eficiência (receita por unidade)
            const efficiency = totalQuantity === 0 ? 0 : totalRevenue / totalQuantity;

            return {
                totalRevenue,
                totalQuantity,
                averageValue: avgValue,
                averageQuantity: avgQuantity,
                efficiency: efficiency,
                revenuePerItem: efficiency
            };
        },

        /**
         * Análise de Pareto (80/20 rule)
         */
        paretoAnalysis(data, sortBy = 'value') {
            const sorted = [...data].sort((a, b) => {
                const aVal = parseFloat(a[sortBy]) || 0;
                const bVal = parseFloat(b[sortBy]) || 0;
                return bVal - aVal;
            });

            const total = sorted.reduce((sum, item) => sum + (parseFloat(item[sortBy]) || 0), 0);
            let cumulative = 0;
            const paretoData = [];

            for (const item of sorted) {
                const value = parseFloat(item[sortBy]) || 0;
                cumulative += value;
                const percentage = (cumulative / total) * 100;

                paretoData.push({
                    ...item,
                    cumulativePercentage: percentage,
                    isIn80: percentage <= 80
                });

                if (percentage > 80) break;
            }

            return {
                total: paretoData.length,
                percentage: (paretoData.length / sorted.length) * 100,
                items: paretoData
            };
        },

        /**
         * Calcula ROI e métricas de eficiência
         */
        efficiencyMetrics(revenue, costs) {
            const roi = costs === 0 ? 0 : ((revenue - costs) / costs) * 100;
            const profitMargin = revenue === 0 ? 0 : ((revenue - costs) / revenue) * 100;
            const breakeven = costs === 0 ? 0 : costs;

            return {
                revenue,
                costs,
                profit: revenue - costs,
                roi: roi,
                profitMargin: profitMargin,
                breakeven: breakeven,
                efficiency: roi > 0 ? 'Lucrativo' : 'Prejuízo'
            };
        }
    };

    // =====================================================================
    // GERADOR DE RELATÓRIOS
    // =====================================================================

    window.ReportGenerator = {
        /**
         * Gera relatório completo de análise
         */
        generateAnalysisReport(data, dates, values) {
            const report = {
                timestamp: new Date().toISOString(),
                summary: {},
                trends: {},
                anomalies: {},
                comparisons: {},
                recommendations: []
            };

            // Resumo
            const kpis = window.PerformanceAnalysis.calculateKPIs(data);
            report.summary = kpis;

            // Tendências
            const trend = window.TrendAnalysis.linearTrend(dates, values);
            const seasonality = window.SeasonalityAnalysis.detectSeasonality(dates, values);
            const acceleration = window.TrendAnalysis.acceleration(values);
            report.trends = { trend, seasonality, acceleration };

            // Anomalias
            const outliers = window.AnomalyDetection.detectOutliersIQR(values);
            const changepoints = window.AnomalyDetection.detectChangepoints(values);
            report.anomalies = { outliers, changepoints };

            // Recomendações
            if (trend.slope > 0) {
                report.recommendations.push('✅ Tendência positiva detectada - Manter estratégia atual');
            } else if (trend.slope < 0) {
                report.recommendations.push('⚠️ Tendência negativa - Revisar estratégia de vendas');
            }

            if (seasonality.hasSeasonality) {
                report.recommendations.push(`📊 Padrão sazonal detectado (força: ${(seasonality.strength * 100).toFixed(1)}%)`);
            }

            if (outliers.outliers.length > 0) {
                report.recommendations.push(`🔍 ${outliers.outliers.length} anomalias detectadas - Investigar causas`);
            }

            if (changepoints.length > 0) {
                report.recommendations.push(`📈 ${changepoints.length} mudanças abruptas detectadas`);
            }

            return report;
        },

        /**
         * Formata relatório para exibição
         */
        formatReportForDisplay(report) {
            let html = `
                <div class="report-container p-6 bg-white dark:bg-slate-900 rounded-2xl">
                    <h2 class="text-2xl font-bold mb-6">📊 Relatório de Análise</h2>
                    
                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div class="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                            <p class="text-sm text-gray-600 dark:text-gray-400">Receita Total</p>
                            <p class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                R$ ${report.summary.totalRevenue?.toFixed(2) || '0.00'}
                            </p>
                        </div>
                        <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                            <p class="text-sm text-gray-600 dark:text-gray-400">Valor Médio</p>
                            <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                R$ ${report.summary.averageValue?.toFixed(2) || '0.00'}
                            </p>
                        </div>
                    </div>

                    <div class="mb-6">
                        <h3 class="text-lg font-bold mb-3">Tendências</h3>
                        <p class="text-sm">
                            <strong>Direção:</strong> ${report.trends.trend?.trend || 'N/A'} 
                            (${report.trends.trend?.r2?.toFixed(3) || '0'} R²)
                        </p>
                        <p class="text-sm mt-2">
                            <strong>Sazonalidade:</strong> 
                            ${report.trends.seasonality?.hasSeasonality ? '✅ Detectada' : '❌ Não detectada'}
                        </p>
                    </div>

                    <div class="mb-6">
                        <h3 class="text-lg font-bold mb-3">Recomendações</h3>
                        <ul class="space-y-2">
                            ${report.recommendations.map(rec => `<li class="text-sm">• ${rec}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
            return html;
        }
    };

    // =====================================================================
    // INICIALIZAÇÃO
    // =====================================================================

    console.log('✅ Análises estatísticas avançadas carregadas com sucesso!');

    window.StatisticalAnalysis = {
        TrendAnalysis: window.TrendAnalysis,
        SeasonalityAnalysis: window.SeasonalityAnalysis,
        AnomalyDetection: window.AnomalyDetection,
        ComparativeAnalysis: window.ComparativeAnalysis,
        PerformanceAnalysis: window.PerformanceAnalysis,
        ReportGenerator: window.ReportGenerator
    };

})();
