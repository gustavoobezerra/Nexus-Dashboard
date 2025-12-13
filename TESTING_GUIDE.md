# Guia de Testes - Nexus Dashboard v4.0

## 🧪 Plano de Testes Completo

### 1. Testes de Funcionalidade Básica

#### 1.1 Carregamento de Dados
- [ ] Carregar exemplo de dados
- [ ] Importar CSV válido
- [ ] Rejeitar CSV inválido
- [ ] Validar estrutura de CSV
- [ ] Tratar CSV com caracteres especiais

**Teste Manual**:
```javascript
// Abrir console (F12)
// Gerar dados de exemplo
generateExampleData();

// Verificar se dados foram carregados
console.log(window.currentData?.length); // Deve ser > 0
console.log(window.stats); // Deve ter dados
```

#### 1.2 Gráficos Básicos
- [ ] Renderizar gráfico de linha
- [ ] Renderizar gráfico de barras
- [ ] Renderizar gráfico de pizza
- [ ] Renderizar gráfico de rosca
- [ ] Todos os gráficos respondem ao tema (dark/light)

**Teste Manual**:
```javascript
// Verificar se gráficos foram criados
console.log(window.charts); // Deve ter 4+ gráficos

// Testar mudança de tema
toggleTheme();
// Verificar se cores mudaram
```

#### 1.3 Filtros
- [ ] Filtro de 7 dias funciona
- [ ] Filtro de 30 dias funciona
- [ ] Filtro de todos os dados funciona
- [ ] Filtros avançados funcionam
- [ ] Múltiplos filtros podem ser aplicados
- [ ] Limpar filtros funciona

**Teste Manual**:
```javascript
// Testar filtro de 7 dias
filterByDate(7);
console.log(window.currentData?.length); // Deve ser menor

// Testar filtro avançado
openFiltersModal();
// Preencher filtros e aplicar
applyAdvancedFilters();
```

### 2. Testes de Novos Gráficos

#### 2.1 Scatter Plot
- [ ] Gráfico renderiza sem erros
- [ ] Dados são exibidos corretamente
- [ ] Tooltip mostra valores
- [ ] Responsivo em mobile

**Teste Manual**:
```javascript
window.createScatterChart('scatterChart', window.currentData);
// Verificar se gráfico aparece
// Passar mouse sobre pontos para ver tooltip
```

#### 2.2 Box Plot
- [ ] Gráfico renderiza sem erros
- [ ] Quartis são calculados corretamente
- [ ] Outliers são identificados
- [ ] Cores estão corretas

**Teste Manual**:
```javascript
window.createBoxPlotChart('boxPlotChart', window.currentData);
// Verificar se as 5 barras aparecem
// Mediana deve estar entre Q1 e Q3
```

#### 2.3 Radar Chart
- [ ] Gráfico renderiza sem erros
- [ ] Todas as categorias aparecem
- [ ] Múltiplas séries são diferenciadas por cor
- [ ] Legenda funciona

**Teste Manual**:
```javascript
window.createRadarChart('radarChart', window.currentData);
// Verificar se eixos estão corretos
// Verificar se cores são diferentes por categoria
```

#### 2.4 Heatmap
- [ ] Gráfico renderiza sem erros
- [ ] Correlações são mostradas
- [ ] Cores representam intensidade
- [ ] Tooltip mostra valores

**Teste Manual**:
```javascript
window.createHeatmapChart('heatmapChart', window.currentData);
// Verificar se matriz é quadrada
// Cores mais intensas = valores maiores
```

### 3. Testes de Análises Estatísticas

#### 3.1 Tendências
- [ ] Regressão linear calcula corretamente
- [ ] R² está entre 0 e 1
- [ ] Detecta tendência crescente
- [ ] Detecta tendência decrescente
- [ ] Detecta mudanças de tendência

**Teste Manual**:
```javascript
const values = [10, 12, 14, 16, 18, 20]; // Crescente
const trend = window.TrendAnalysis.linearTrend([], values);
console.log(trend.slope > 0); // true
console.log(trend.trend); // 'crescente'
```

#### 3.2 Sazonalidade
- [ ] Detecta padrões sazonais
- [ ] Calcula força da sazonalidade
- [ ] Retorna índices sazonais

**Teste Manual**:
```javascript
const values = [10, 20, 10, 20, 10, 20, 10, 20]; // Padrão claro
const seasonality = window.SeasonalityAnalysis.detectSeasonality([], values, 2);
console.log(seasonality.hasSeasonality); // true
console.log(seasonality.strength > 0.3); // true
```

#### 3.3 Anomalias
- [ ] Detecta outliers por IQR
- [ ] Detecta outliers por Z-score
- [ ] Detecta changepoints
- [ ] Severity é calculado

**Teste Manual**:
```javascript
const values = [10, 12, 11, 13, 100, 12, 11]; // 100 é outlier
const outliers = window.AnomalyDetection.detectOutliersIQR(values);
console.log(outliers.outliers.length > 0); // true
console.log(outliers.outliers[0].value); // 100
```

#### 3.4 Análise de Pareto
- [ ] Identifica itens do 80%
- [ ] Calcula percentagem corretamente
- [ ] Ordena por valor

**Teste Manual**:
```javascript
const data = [
    { category: 'A', value: 100 },
    { category: 'B', value: 50 },
    { category: 'C', value: 30 },
    { category: 'D', value: 20 }
];
const pareto = window.PerformanceAnalysis.paretoAnalysis(data, 'value');
console.log(pareto.items.length); // 2 ou 3 (80%)
```

### 4. Testes de Performance

#### 4.1 Carregamento de Dados Grandes
- [ ] Carregar 10k registros sem travamento
- [ ] Carregar 50k registros com feedback
- [ ] Gráficos renderizam em tempo razoável
- [ ] Memória é liberada após limpeza

**Teste Manual**:
```javascript
// Monitorar memória
console.log(performance.memory.usedJSHeapSize / 1048576); // MB

// Gerar 10k registros
const largeData = Array(10000).fill(0).map((_, i) => ({
    date: new Date(2024, 0, (i % 365) + 1).toISOString().split('T')[0],
    value: Math.random() * 1000,
    category: ['A', 'B', 'C'][i % 3],
    product: 'P' + (i % 10),
    payment: ['PIX', 'Crédito', 'Débito'][i % 3],
    status: ['Concluído', 'Pendente'][i % 2]
}));

// Processar dados
window.currentData = largeData;
renderDashboardCharts();

// Verificar memória novamente
console.log(performance.memory.usedJSHeapSize / 1048576); // MB
```

#### 4.2 Limpeza de Memória
- [ ] `cleanupMemory()` remove gráficos
- [ ] `cleanupMemory()` libera dados
- [ ] Memória diminui após limpeza

**Teste Manual**:
```javascript
// Antes
console.log(Object.keys(window.charts).length);
console.log(performance.memory.usedJSHeapSize / 1048576);

// Limpar
window.cleanupMemory();

// Depois
console.log(Object.keys(window.charts).length); // Deve ser 0
console.log(performance.memory.usedJSHeapSize / 1048576); // Deve diminuir
```

### 5. Testes de Interface

#### 5.1 Responsividade
- [ ] Desktop (1920x1080) - Todos os elementos visíveis
- [ ] Tablet (768x1024) - Layout ajustado
- [ ] Mobile (375x667) - Funcional e usável
- [ ] Sidebar colapsa em mobile
- [ ] Chat funciona em mobile

**Teste Manual**:
```
1. Abrir DevTools (F12)
2. Ativar modo responsivo (Ctrl+Shift+M)
3. Testar em diferentes resoluções
4. Verificar se todos os botões são clicáveis
5. Verificar se texto não fica cortado
```

#### 5.2 Dark Mode
- [ ] Tema claro é o padrão
- [ ] Tema escuro pode ser ativado
- [ ] Cores são legíveis em ambos os temas
- [ ] Gráficos se adaptam ao tema
- [ ] Preferência é salva

**Teste Manual**:
```javascript
// Ativar dark mode
toggleTheme();

// Verificar se classe 'dark' foi adicionada
console.log(document.documentElement.classList.contains('dark'));

// Recarregar página
location.reload();

// Verificar se tema foi mantido
console.log(document.documentElement.classList.contains('dark'));
```

#### 5.3 Acessibilidade
- [ ] Navegação por teclado funciona
- [ ] Tab order está correto
- [ ] Botões têm aria-labels
- [ ] Contraste está WCAG AA
- [ ] Screen reader consegue ler conteúdo

**Teste Manual**:
```javascript
// Verificar acessibilidade
window.AccessibilityChecker.check();

// Navegar com Tab
// Verificar se foco é visível
// Verificar se ordem faz sentido
```

### 6. Testes de Segurança

#### 6.1 CSV Injection Prevention
- [ ] CSV com `=` no início é escapado
- [ ] CSV com `+` no início é escapado
- [ ] CSV com `@` no início é escapado
- [ ] Dados são sanitizados ao exportar

**Teste Manual**:
```javascript
// Testar com dados perigosos
const dangerousData = [
    { date: '2024-01-01', value: '=1+1', category: 'Test' }
];

// Exportar
const sanitized = window.CSVSecurity.sanitizeDataset(dangerousData);
console.log(sanitized[0].value); // Deve ter ' no início
```

#### 6.2 XSS Prevention
- [ ] HTML é escapado em inputs
- [ ] Scripts não são executados
- [ ] Dados do usuário são sanitizados

**Teste Manual**:
```javascript
// Testar com HTML malicioso
const maliciousData = [
    { date: '2024-01-01', value: 100, category: '<img src=x onerror="alert(1)">' }
];

// Sanitizar
const sanitized = window.HTMLSecurity.sanitize(maliciousData[0].category);
console.log(sanitized); // Deve ter < e > escapados
```

### 7. Testes de Chat IA

#### 7.1 Envio de Mensagens
- [ ] Mensagem é enviada corretamente
- [ ] Resposta da IA é recebida
- [ ] Histórico é mantido
- [ ] Rate limiting funciona

**Teste Manual**:
```javascript
// Abrir chat
toggleChatPanel();

// Enviar mensagem
const input = document.getElementById('chat-input');
input.value = 'Qual é a tendência de vendas?';
sendChatMessage();

// Verificar resposta
// Deve aparecer em alguns segundos
```

#### 7.2 Análise de Gráficos
- [ ] Botão "Analisar" envia contexto
- [ ] IA fornece insights relevantes
- [ ] Análise é baseada nos dados

**Teste Manual**:
```javascript
// Clicar em "Analisar" em um gráfico
// Verificar se mensagem foi enviada ao chat
// Verificar se IA respondeu com insights
```

### 8. Testes de Exportação

#### 8.1 Exportação CSV
- [ ] CSV é gerado corretamente
- [ ] Headers estão corretos
- [ ] Dados são separados por ponto-e-vírgula
- [ ] Arquivo é baixado com nome correto
- [ ] Arquivo pode ser aberto em Excel

**Teste Manual**:
```javascript
// Exportar dados
exportToCSV();

// Verificar arquivo baixado
// Abrir em Excel/Sheets
// Verificar se dados estão corretos
```

### 9. Testes de Validação

#### 9.1 Validação de Filtros
- [ ] Data início > data fim é rejeitada
- [ ] Valor mín > valor máx é rejeitado
- [ ] Intervalo muito grande é alertado

**Teste Manual**:
```javascript
// Testar validação
window.FilterManager.set('dateStart', '2024-12-31');
window.FilterManager.set('dateEnd', '2024-01-01');

const isValid = window.validateFilters();
console.log(isValid); // false

// Toast deve aparecer
```

#### 9.2 Validação de CSV
- [ ] CSV vazio é rejeitado
- [ ] CSV sem headers é rejeitado
- [ ] CSV com >50% linhas vazias é rejeitado
- [ ] Arquivo muito grande é rejeitado

**Teste Manual**:
```javascript
// Tentar fazer upload de CSV inválido
// Verificar se erro aparece
// Verificar mensagem de erro
```

## 📊 Matriz de Testes

| Funcionalidade | Desktop | Tablet | Mobile | Dark | Light |
|---|---|---|---|---|---|
| Gráficos Básicos | ✅ | ✅ | ✅ | ✅ | ✅ |
| Gráficos Avançados | ✅ | ✅ | ⚠️ | ✅ | ✅ |
| Filtros | ✅ | ✅ | ✅ | ✅ | ✅ |
| Chat IA | ✅ | ✅ | ⚠️ | ✅ | ✅ |
| Exportação | ✅ | ✅ | ✅ | ✅ | ✅ |
| Análises | ✅ | ✅ | ⚠️ | ✅ | ✅ |

**Legenda**: ✅ Totalmente funcional | ⚠️ Funcional com limitações | ❌ Não funcional

## 🐛 Relatório de Bugs Encontrados

Ao encontrar um bug, registre:

```markdown
### Bug #[número]
**Título**: [Descrição breve]
**Severidade**: [Crítico/Moderado/Menor]
**Passos para reproduzir**:
1. ...
2. ...
3. ...

**Resultado esperado**: ...
**Resultado atual**: ...
**Ambiente**: [Browser, SO, Resolução]
```

## ✅ Checklist de Validação Final

- [ ] Todos os gráficos renderizam corretamente
- [ ] Filtros funcionam em combinação
- [ ] Análises estatísticas são precisas
- [ ] Performance é aceitável (< 3s para 10k registros)
- [ ] Memória é liberada corretamente
- [ ] Mobile é funcional
- [ ] Dark mode funciona
- [ ] Acessibilidade está OK
- [ ] Segurança está OK
- [ ] Chat IA responde
- [ ] Exportação funciona
- [ ] Documentação está completa

## 🎉 Pronto para Produção!

Quando todos os testes passarem, o dashboard está pronto para ser deployado.
