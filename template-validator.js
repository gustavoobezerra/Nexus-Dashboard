// =====================================================================
// NEXUS DASHBOARD - VALIDADOR DE TEMPLATES
// =====================================================================
// Valida consistência entre dados, templates e formatação

(function() {
    'use strict';

    console.log('🔍 Carregando validador de templates...');

    // =====================================================================
    // VALIDADOR DE TEMPLATES
    // =====================================================================

    window.TemplateValidator = {
        /**
         * Valida se os dados são compatíveis com o template selecionado
         */
        validateDataForTemplate(data, templateKey) {
            const issues = [];
            const warnings = [];
            const config = window.TemplateFormatConfig?.[templateKey];

            if (!config) {
                issues.push('Template não encontrado');
                return { valid: false, issues, warnings };
            }

            if (!data || data.length === 0) {
                issues.push('Nenhum dado para validar');
                return { valid: false, issues, warnings };
            }

            // Validar valores numéricos
            const values = data.map(d => parseFloat(d.value)).filter(v => !isNaN(v));

            if (values.length === 0) {
                issues.push('Nenhum valor numérico válido encontrado');
                return { valid: false, issues, warnings };
            }

            const minValue = Math.min(...values);
            const maxValue = Math.max(...values);
            const avgValue = values.reduce((a, b) => a + b, 0) / values.length;

            // Validações específicas por tipo de template
            switch (templateKey) {
                case 'vendas':
                case 'financas':
                case 'juridico':
                    // Valores devem ser monetários (geralmente > 1)
                    if (maxValue < 1) {
                        warnings.push('Valores parecem muito baixos para moeda. Verifique se os dados estão corretos.');
                    }
                    if (minValue < 0) {
                        warnings.push('Valores negativos detectados. Isso é esperado para este template?');
                    }
                    if (avgValue < 10) {
                        warnings.push('Média de valores muito baixa. Verifique a unidade dos dados.');
                    }
                    break;

                case 'estoque':
                    // Valores devem ser quantidades (inteiros positivos)
                    const hasDecimals = values.some(v => v % 1 !== 0);
                    if (hasDecimals) {
                        warnings.push('Valores decimais detectados em estoque. Esperado: números inteiros.');
                    }
                    if (minValue < 0) {
                        warnings.push('Quantidades negativas detectadas. Verifique os dados.');
                    }
                    if (maxValue > 1000000) {
                        warnings.push('Quantidades muito altas. Verifique se não são valores monetários.');
                    }
                    break;

                case 'educacao':
                    // Pode ser nota (0-10) ou valor monetário
                    const likelyGrades = values.filter(v => v >= 0 && v <= 10).length;
                    const likelyMoney = values.filter(v => v > 10).length;

                    if (likelyGrades > 0 && likelyMoney > 0) {
                        warnings.push('Dados mistos detectados: notas e valores monetários. Isso é esperado?');
                    }

                    if (likelyGrades === values.length && maxValue > 10) {
                        warnings.push('Valores acima de 10 detectados. Se são notas, verifique a escala.');
                    }
                    break;
            }

            // Validar datas
            const dates = data.map(d => d.date).filter(d => d);
            if (dates.length === 0) {
                issues.push('Nenhuma data válida encontrada');
            }

            // Validar categorias
            const categories = [...new Set(data.map(d => d.category).filter(c => c))];
            if (categories.length === 0) {
                warnings.push('Nenhuma categoria encontrada. Análises por categoria não estarão disponíveis.');
            }
            if (categories.length > 50) {
                warnings.push(`Muitas categorias (${categories.length}). Considere agrupar algumas.`);
            }

            return {
                valid: issues.length === 0,
                issues,
                warnings,
                stats: {
                    dataPoints: data.length,
                    minValue,
                    maxValue,
                    avgValue,
                    categories: categories.length,
                    dates: dates.length
                }
            };
        },

        /**
         * Sugere o melhor template para os dados
         */
        suggestTemplate(data) {
            if (!data || data.length === 0) return null;

            const values = data.map(d => parseFloat(d.value)).filter(v => !isNaN(v));
            if (values.length === 0) return null;

            const minValue = Math.min(...values);
            const maxValue = Math.max(...values);
            const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
            const hasDecimals = values.some(v => v % 1 !== 0);

            // Analisar headers para detectar tipo
            const firstRow = data[0];
            const headers = Object.keys(firstRow).map(h => h.toLowerCase());

            // Score para cada template
            const scores = {
                vendas: 0,
                estoque: 0,
                financas: 0,
                juridico: 0,
                educacao: 0
            };

            // Análise por palavras-chave nos headers
            headers.forEach(header => {
                if (header.includes('venda') || header.includes('produto') || header.includes('cliente')) {
                    scores.vendas += 3;
                }
                if (header.includes('estoque') || header.includes('quantidade') || header.includes('qtd')) {
                    scores.estoque += 3;
                }
                if (header.includes('receita') || header.includes('despesa') || header.includes('financ')) {
                    scores.financas += 3;
                }
                if (header.includes('processo') || header.includes('causa') || header.includes('juridico')) {
                    scores.juridico += 3;
                }
                if (header.includes('aluno') || header.includes('nota') || header.includes('curso')) {
                    scores.educacao += 3;
                }
            });

            // Análise por características dos valores
            if (avgValue > 100 && hasDecimals) {
                scores.vendas += 2;
                scores.financas += 2;
                scores.juridico += 1;
            }

            if (!hasDecimals && maxValue < 10000) {
                scores.estoque += 2;
            }

            if (maxValue <= 10 && minValue >= 0) {
                scores.educacao += 3;
            }

            // Encontrar template com maior score
            let bestTemplate = 'custom';
            let bestScore = 0;

            Object.entries(scores).forEach(([template, score]) => {
                if (score > bestScore) {
                    bestScore = score;
                    bestTemplate = template;
                }
            });

            return {
                suggested: bestTemplate,
                confidence: bestScore > 5 ? 'high' : bestScore > 2 ? 'medium' : 'low',
                scores
            };
        },

        /**
         * Valida formatação atual dos gráficos
         */
        validateCurrentFormatting() {
            const template = window.currentTemplate || 'vendas';
            const config = window.TemplateFormatConfig?.[template];
            const issues = [];

            if (!config) {
                issues.push('Configuração de template não encontrada');
                return { valid: false, issues };
            }

            // Verificar KPIs
            const kpiElements = [
                { id: 'total-value', expectedLabel: config.kpiLabels.total },
                { id: 'total-count', expectedLabel: config.kpiLabels.count },
                { id: 'avg-value', expectedLabel: config.kpiLabels.average },
                { id: 'top-category', expectedLabel: config.kpiLabels.top }
            ];

            kpiElements.forEach(({ id, expectedLabel }) => {
                const element = document.getElementById(id);
                if (element) {
                    const labelElement = element.querySelector('.text-sm, .text-xs');
                    if (labelElement) {
                        const currentLabel = labelElement.textContent.trim();
                        if (currentLabel !== expectedLabel) {
                            issues.push(`KPI "${id}": label incorreto. Esperado: "${expectedLabel}", Atual: "${currentLabel}"`);
                        }
                    }
                }
            });

            // Verificar gráficos
            if (typeof charts !== 'undefined' && charts) {
                Object.entries(charts).forEach(([id, chart]) => {
                    if (!chart) return;

                    const chartType = id.replace('Chart', '');
                    const expectedTitle = config.chartTitles[chartType];

                    if (expectedTitle && chart.options.plugins && chart.options.plugins.title) {
                        const currentTitle = chart.options.plugins.title.text;
                        if (currentTitle !== expectedTitle) {
                            issues.push(`Gráfico "${chartType}": título incorreto. Esperado: "${expectedTitle}"`);
                        }
                    }
                });
            }

            return {
                valid: issues.length === 0,
                issues,
                template: config.name
            };
        },

        /**
         * Corrige automaticamente problemas de formatação
         */
        autoFix() {
            console.log('🔧 Corrigindo formatação automaticamente...');

            // Atualizar formatação de gráficos
            if (typeof window.updateChartsFormatting === 'function') {
                window.updateChartsFormatting();
            }

            // Atualizar formatação de KPIs
            if (typeof window.updateKPIsFormatting === 'function') {
                window.updateKPIsFormatting();
            }

            // Validar novamente
            const validation = this.validateCurrentFormatting();

            if (validation.valid) {
                console.log('✅ Formatação corrigida com sucesso!');
                window.showToast?.('Formatação corrigida automaticamente', 'success');
            } else {
                console.warn('⚠️ Alguns problemas não puderam ser corrigidos:', validation.issues);
                window.showToast?.('Alguns problemas de formatação persistem', 'warning');
            }

            return validation;
        },

        /**
         * Gera relatório de validação
         */
        generateReport() {
            const template = window.currentTemplate || 'vendas';
            const config = window.TemplateFormatConfig?.[template];

            if (!config) {
                return { error: 'Template não encontrado' };
            }

            const dataValidation = typeof currentData !== 'undefined' && currentData.length > 0
                ? this.validateDataForTemplate(currentData, template)
                : { valid: false, issues: ['Nenhum dado carregado'], warnings: [] };

            const formattingValidation = this.validateCurrentFormatting();

            return {
                template: config.name,
                timestamp: new Date().toISOString(),
                data: dataValidation,
                formatting: formattingValidation,
                overall: dataValidation.valid && formattingValidation.valid ? 'VÁLIDO' : 'INVÁLIDO'
            };
        }
    };

    // =====================================================================
    // INTEGRAÇÃO COM SISTEMA DE TEMPLATES
    // =====================================================================

    // Hook ao carregar dados
    const originalProcessCSV = window.processCSV;
    if (originalProcessCSV) {
        window.processCSV = function(results, templateKey) {
            // Validar dados antes de processar
            const validation = window.TemplateValidator.validateDataForTemplate(results.data, templateKey);

            // Mostrar avisos
            if (validation.warnings.length > 0) {
                validation.warnings.forEach(warning => {
                    console.warn('⚠️', warning);
                });

                // Mostrar primeiro aviso ao usuário
                window.showToast?.(validation.warnings[0], 'warning');
            }

            // Bloquear se houver erros críticos
            if (!validation.valid) {
                validation.issues.forEach(issue => {
                    console.error('❌', issue);
                });
                window.showToast?.(`Erro: ${validation.issues[0]}`, 'error');
                return;
            }

            // Sugerir template se apropriado
            if (templateKey === 'custom') {
                const suggestion = window.TemplateValidator.suggestTemplate(results.data);
                if (suggestion && suggestion.confidence === 'high') {
                    console.log(`💡 Sugestão: Template "${suggestion.suggested}" parece mais adequado`);
                }
            }

            // Processar normalmente
            originalProcessCSV.call(this, results, templateKey);

            // Validar formatação após processar
            setTimeout(() => {
                const formattingValidation = window.TemplateValidator.validateCurrentFormatting();
                if (!formattingValidation.valid) {
                    console.warn('⚠️ Problemas de formatação detectados. Corrigindo...');
                    window.TemplateValidator.autoFix();
                }
            }, 1000);
        };
    }

    // =====================================================================
    // COMANDO DE CONSOLE PARA VALIDAÇÃO
    // =====================================================================

    window.validateTemplate = function() {
        const report = window.TemplateValidator.generateReport();
        console.log('📊 Relatório de Validação:', report);
        return report;
    };

    window.fixTemplate = function() {
        return window.TemplateValidator.autoFix();
    };

    // =====================================================================
    // INICIALIZAÇÃO
    // =====================================================================

    console.log('✅ Validador de templates carregado!');
    console.log('💡 Use validateTemplate() para verificar consistência');
    console.log('💡 Use fixTemplate() para corrigir automaticamente');

    // Expor globalmente
    window.TemplateValidation = {
        validator: window.TemplateValidator,
        validate: window.validateTemplate,
        fix: window.fixTemplate
    };

})();
