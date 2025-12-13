// =====================================================================
// NEXUS DASHBOARD - SISTEMA INTELIGENTE DE FORMATAÇÃO POR TEMPLATE
// =====================================================================
// Corrige inconsistências entre templates e formatação de dados

(function() {
    'use strict';

    console.log('🎨 Carregando sistema inteligente de formatação...');

    // =====================================================================
    // CONFIGURAÇÕES DE FORMATAÇÃO POR TEMPLATE
    // =====================================================================

    window.TemplateFormatConfig = {
        vendas: {
            name: 'Vendas',
            valueType: 'currency', // moeda
            valueLabel: 'Valor',
            valuePrefix: 'R$ ',
            valueSuffix: '',
            decimals: 2,
            kpiLabels: {
                total: 'Receita Total',
                count: 'Volume de Vendas',
                average: 'Ticket Médio',
                top: 'Top Categoria'
            },
            chartTitles: {
                line: 'Evolução de Vendas ao Longo do Tempo',
                bar: 'Vendas por Categoria',
                doughnut: 'Distribuição de Vendas por Categoria',
                payment: 'Vendas por Forma de Pagamento'
            },
            tooltipFormat: (value) => `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
        },

        estoque: {
            name: 'Estoque',
            valueType: 'quantity', // quantidade
            valueLabel: 'Quantidade',
            valuePrefix: '',
            valueSuffix: ' un',
            decimals: 0,
            kpiLabels: {
                total: 'Total de Itens',
                count: 'Movimentações',
                average: 'Média Diária',
                top: 'Top Produto'
            },
            chartTitles: {
                line: 'Movimentação de Estoque ao Longo do Tempo',
                bar: 'Quantidade por Produto',
                doughnut: 'Distribuição de Estoque por Categoria',
                payment: 'Movimentações por Tipo'
            },
            tooltipFormat: (value) => `${Math.round(value)} unidades`
        },

        financas: {
            name: 'Finanças',
            valueType: 'currency',
            valueLabel: 'Valor',
            valuePrefix: 'R$ ',
            valueSuffix: '',
            decimals: 2,
            kpiLabels: {
                total: 'Saldo Total',
                count: 'Lançamentos',
                average: 'Média por Lançamento',
                top: 'Top Categoria'
            },
            chartTitles: {
                line: 'Fluxo de Caixa ao Longo do Tempo',
                bar: 'Valores por Centro de Custo',
                doughnut: 'Distribuição Financeira por Categoria',
                payment: 'Receitas vs Despesas'
            },
            tooltipFormat: (value) => `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
        },

        juridico: {
            name: 'Jurídico',
            valueType: 'currency',
            valueLabel: 'Valor da Causa',
            valuePrefix: 'R$ ',
            valueSuffix: '',
            decimals: 2,
            kpiLabels: {
                total: 'Valor Total em Causas',
                count: 'Total de Processos',
                average: 'Média por Processo',
                top: 'Top Área Jurídica'
            },
            chartTitles: {
                line: 'Evolução de Processos ao Longo do Tempo',
                bar: 'Valor por Área Jurídica',
                doughnut: 'Distribuição de Processos por Tipo',
                payment: 'Processos por Fase/Instância'
            },
            tooltipFormat: (value) => `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
        },

        educacao: {
            name: 'Educação',
            valueType: 'mixed', // pode ser nota ou valor
            valueLabel: 'Nota/Valor',
            valuePrefix: '',
            valueSuffix: '',
            decimals: 2,
            kpiLabels: {
                total: 'Total de Alunos',
                count: 'Avaliações',
                average: 'Média Geral',
                top: 'Top Curso'
            },
            chartTitles: {
                line: 'Desempenho ao Longo do Tempo',
                bar: 'Notas por Curso/Turma',
                doughnut: 'Distribuição de Alunos por Curso',
                payment: 'Avaliações por Tipo'
            },
            tooltipFormat: (value, context) => {
                // Detectar se é nota (0-10) ou valor monetário
                if (value <= 10) {
                    return `Nota: ${value.toFixed(2)}`;
                } else {
                    return `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
                }
            }
        },

        custom: {
            name: 'Personalizado',
            valueType: 'number',
            valueLabel: 'Valor',
            valuePrefix: '',
            valueSuffix: '',
            decimals: 2,
            kpiLabels: {
                total: 'Total',
                count: 'Quantidade',
                average: 'Média',
                top: 'Top Item'
            },
            chartTitles: {
                line: 'Evolução ao Longo do Tempo',
                bar: 'Valores por Categoria',
                doughnut: 'Distribuição por Categoria',
                payment: 'Valores por Agrupamento'
            },
            tooltipFormat: (value) => value.toFixed(2)
        }
    };

    // =====================================================================
    // FORMATADOR INTELIGENTE
    // =====================================================================

    window.SmartFormatter = {
        /**
         * Formata valor de acordo com o template atual
         */
        formatValue(value, templateKey = null) {
            const template = templateKey || window.currentTemplate || 'vendas';
            const config = window.TemplateFormatConfig[template];

            if (!config) return value;

            const numValue = parseFloat(value) || 0;

            switch (config.valueType) {
                case 'currency':
                    return this.formatCurrency(numValue);
                case 'quantity':
                    return this.formatQuantity(numValue);
                case 'percentage':
                    return this.formatPercentage(numValue);
                case 'mixed':
                    return this.formatMixed(numValue, template);
                default:
                    return this.formatNumber(numValue, config.decimals);
            }
        },

        /**
         * Formata como moeda brasileira
         */
        formatCurrency(value) {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(value);
        },

        /**
         * Formata como quantidade
         */
        formatQuantity(value) {
            return `${Math.round(value)} un`;
        },

        /**
         * Formata como porcentagem
         */
        formatPercentage(value) {
            return `${value.toFixed(2)}%`;
        },

        /**
         * Formata número genérico
         */
        formatNumber(value, decimals = 2) {
            return value.toFixed(decimals).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        },

        /**
         * Formata valor misto (educação)
         */
        formatMixed(value, template) {
            if (template === 'educacao') {
                // Se valor <= 10, é nota
                if (value <= 10) {
                    return `${value.toFixed(2)}`;
                }
                // Senão, é valor monetário
                return this.formatCurrency(value);
            }
            return this.formatNumber(value);
        },

        /**
         * Obtém configuração de formatação do template
         */
        getConfig(templateKey = null) {
            const template = templateKey || window.currentTemplate || 'vendas';
            return window.TemplateFormatConfig[template];
        },

        /**
         * Obtém label do KPI
         */
        getKPILabel(kpiType, templateKey = null) {
            const config = this.getConfig(templateKey);
            return config.kpiLabels[kpiType] || kpiType;
        },

        /**
         * Obtém título do gráfico
         */
        getChartTitle(chartType, templateKey = null) {
            const config = this.getConfig(templateKey);
            return config.chartTitles[chartType] || 'Gráfico';
        },

        /**
         * Formata tooltip do gráfico
         */
        formatTooltip(value, templateKey = null, context = null) {
            const config = this.getConfig(templateKey);
            if (config.tooltipFormat) {
                return config.tooltipFormat(value, context);
            }
            return this.formatValue(value, templateKey);
        }
    };

    // =====================================================================
    // INTEGRAÇÃO COM GRÁFICOS
    // =====================================================================

    /**
     * Atualiza formatação de todos os gráficos
     */
    window.updateChartsFormatting = function() {
        const template = window.currentTemplate || 'vendas';
        const config = window.TemplateFormatConfig[template];

        if (!config) return;

        // Atualizar cada gráfico
        if (typeof charts !== 'undefined' && charts) {
            Object.entries(charts).forEach(([id, chart]) => {
                if (!chart || typeof chart.update !== 'function') return;

                try {
                    // Atualizar título do gráfico
                    const chartType = id.replace('Chart', '');
                    if (config.chartTitles[chartType]) {
                        if (chart.options.plugins && chart.options.plugins.title) {
                            chart.options.plugins.title.text = config.chartTitles[chartType];
                        }
                    }

                    // Atualizar formatação do tooltip
                    if (chart.options.plugins && chart.options.plugins.tooltip) {
                        chart.options.plugins.tooltip.callbacks = {
                            ...chart.options.plugins.tooltip.callbacks,
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                const value = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
                                label += window.SmartFormatter.formatTooltip(value, template, context);
                                return label;
                            }
                        };
                    }

                    // Atualizar formatação dos eixos
                    if (chart.options.scales && chart.options.scales.y) {
                        chart.options.scales.y.ticks = {
                            ...chart.options.scales.y.ticks,
                            callback: function(value) {
                                return window.SmartFormatter.formatValue(value, template);
                            }
                        };
                    }

                    chart.update('none');
                } catch (e) {
                    console.warn(`Erro ao atualizar formatação do gráfico ${id}:`, e);
                }
            });
        }

        console.log(`✅ Formatação atualizada para template: ${config.name}`);
    };

    // =====================================================================
    // INTEGRAÇÃO COM KPIs
    // =====================================================================

    /**
     * Atualiza formatação dos KPIs
     */
    window.updateKPIsFormatting = function() {
        const template = window.currentTemplate || 'vendas';
        const config = window.TemplateFormatConfig[template];

        if (!config || typeof stats === 'undefined') return;

        // Atualizar labels dos KPIs
        const kpiElements = {
            'total-value': { type: 'total', value: stats.totalValue },
            'total-count': { type: 'count', value: stats.totalCount },
            'avg-value': { type: 'average', value: stats.avgValue },
            'top-category': { type: 'top', value: stats.topCategory }
        };

        Object.entries(kpiElements).forEach(([id, data]) => {
            const element = document.getElementById(id);
            if (!element) return;

            // Atualizar label
            const labelElement = element.querySelector('.text-sm, .text-xs');
            if (labelElement) {
                labelElement.textContent = config.kpiLabels[data.type];
            }

            // Atualizar valor formatado
            const valueElement = element.querySelector('.text-2xl, .text-3xl, .text-4xl');
            if (valueElement && typeof data.value === 'number') {
                valueElement.textContent = window.SmartFormatter.formatValue(data.value, template);
            }
        });

        console.log(`✅ KPIs atualizados para template: ${config.name}`);
    };

    // =====================================================================
    // HOOK NO SISTEMA DE TEMPLATES
    // =====================================================================

    // Interceptar mudança de template
    const originalSelectTemplate = window.selectTemplate;
    if (originalSelectTemplate) {
        window.selectTemplate = function(templateKey) {
            // Chamar função original
            originalSelectTemplate.call(this, templateKey);

            // Atualizar formatação
            setTimeout(() => {
                window.updateChartsFormatting();
                window.updateKPIsFormatting();
            }, 500);
        };
    }

    // Interceptar renderização de gráficos
    const originalRenderDashboardCharts = window.renderDashboardCharts;
    if (originalRenderDashboardCharts) {
        window.renderDashboardCharts = function() {
            // Chamar função original
            originalRenderDashboardCharts.call(this);

            // Atualizar formatação
            setTimeout(() => {
                window.updateChartsFormatting();
                window.updateKPIsFormatting();
            }, 300);
        };
    }

    // =====================================================================
    // VALIDAÇÃO DE CONSISTÊNCIA
    // =====================================================================

    window.validateTemplateConsistency = function() {
        const template = window.currentTemplate || 'vendas';
        const config = window.TemplateFormatConfig[template];
        const issues = [];

        if (!config) {
            issues.push('Template não encontrado');
            return issues;
        }

        // Verificar se formatação está correta nos gráficos
        if (typeof charts !== 'undefined' && charts) {
            Object.entries(charts).forEach(([id, chart]) => {
                if (!chart) return;

                const chartType = id.replace('Chart', '');
                
                // Verificar título
                if (chart.options.plugins && chart.options.plugins.title) {
                    const currentTitle = chart.options.plugins.title.text;
                    const expectedTitle = config.chartTitles[chartType];
                    
                    if (expectedTitle && !currentTitle.includes(config.name)) {
                        issues.push(`Gráfico ${chartType}: título inconsistente`);
                    }
                }

                // Verificar formatação de valores
                if (chart.data && chart.data.datasets) {
                    chart.data.datasets.forEach(dataset => {
                        if (dataset.data && dataset.data.length > 0) {
                            const sampleValue = dataset.data[0];
                            if (typeof sampleValue === 'number') {
                                // Verificar se formatação faz sentido
                                if (config.valueType === 'currency' && sampleValue > 0 && sampleValue < 1) {
                                    issues.push(`Gráfico ${chartType}: valores parecem estar em formato errado (esperado moeda)`);
                                }
                            }
                        }
                    });
                }
            });
        }

        if (issues.length > 0) {
            console.warn('⚠️ Problemas de consistência encontrados:', issues);
        } else {
            console.log('✅ Template consistente');
        }

        return issues;
    };

    // =====================================================================
    // INICIALIZAÇÃO
    // =====================================================================

    console.log('✅ Sistema inteligente de formatação carregado!');

    // Expor globalmente
    window.TemplateFormatter = {
        config: window.TemplateFormatConfig,
        formatter: window.SmartFormatter,
        updateChartsFormatting: window.updateChartsFormatting,
        updateKPIsFormatting: window.updateKPIsFormatting,
        validateConsistency: window.validateTemplateConsistency
    };

    // Aplicar formatação ao carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                window.updateChartsFormatting();
                window.updateKPIsFormatting();
            }, 1000);
        });
    } else {
        setTimeout(() => {
            window.updateChartsFormatting();
            window.updateKPIsFormatting();
        }, 1000);
    }

})();
