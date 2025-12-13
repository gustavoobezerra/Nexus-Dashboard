# Testes de Validação - Correção de Templates

## 🧪 Plano de Testes

### Objetivo
Garantir que templates e formatação sejam sempre consistentes, eliminando problemas como "R$ alunos" ou "unidades" em valores monetários.

---

## ✅ Testes Funcionais

### Teste 1: Formatação de Vendas

**Passos:**
1. Carregar dados de vendas (valores monetários)
2. Selecionar template "Vendas"
3. Verificar KPIs
4. Verificar gráficos

**Resultado Esperado:**
```
✅ KPI "Receita Total": R$ 50.000,00
✅ KPI "Volume de Vendas": 150 vendas
✅ KPI "Ticket Médio": R$ 333,33
✅ Gráfico: "Evolução de Vendas ao Longo do Tempo"
✅ Tooltip: "R$ 1.234,56"
✅ Eixo Y: "R$ 10.000"
```

**Teste Manual:**
```javascript
// Abrir console (F12)
console.log(SmartFormatter.formatValue(50000, 'vendas'));
// Esperado: "R$ 50.000,00"

console.log(SmartFormatter.getKPILabel('total', 'vendas'));
// Esperado: "Receita Total"

console.log(SmartFormatter.getChartTitle('line', 'vendas'));
// Esperado: "Evolução de Vendas ao Longo do Tempo"
```

---

### Teste 2: Formatação de Estoque

**Passos:**
1. Carregar dados de estoque (quantidades)
2. Selecionar template "Estoque"
3. Verificar KPIs
4. Verificar gráficos

**Resultado Esperado:**
```
✅ KPI "Total de Itens": 1500 un
✅ KPI "Movimentações": 45 movimentações
✅ KPI "Média Diária": 50 un
✅ Gráfico: "Movimentação de Estoque ao Longo do Tempo"
✅ Tooltip: "1234 unidades"
✅ Eixo Y: "1000 un"
```

**Teste Manual:**
```javascript
console.log(SmartFormatter.formatValue(1500, 'estoque'));
// Esperado: "1500 un"

console.log(SmartFormatter.getKPILabel('total', 'estoque'));
// Esperado: "Total de Itens"

console.log(SmartFormatter.getChartTitle('line', 'estoque'));
// Esperado: "Movimentação de Estoque ao Longo do Tempo"
```

---

### Teste 3: Formatação de Educação (Misto)

**Passos:**
1. Carregar dados de educação (notas 0-10)
2. Selecionar template "Educação"
3. Verificar formatação de notas
4. Carregar dados de mensalidades
5. Verificar formatação de valores

**Resultado Esperado:**
```
✅ Nota: 8,50 (sem R$)
✅ Mensalidade: R$ 850,00 (com R$)
✅ KPI "Média Geral": 7,85
✅ Gráfico: "Desempenho ao Longo do Tempo"
```

**Teste Manual:**
```javascript
// Nota
console.log(SmartFormatter.formatValue(8.5, 'educacao'));
// Esperado: "8,50" (se valor <= 10)

// Mensalidade
console.log(SmartFormatter.formatValue(850, 'educacao'));
// Esperado: "R$ 850,00" (se valor > 10)
```

---

### Teste 4: Troca de Template

**Passos:**
1. Carregar dados de vendas
2. Verificar formatação (R$)
3. Trocar para template "Estoque"
4. Verificar formatação (un)
5. Verificar se KPIs mudaram
6. Verificar se títulos mudaram

**Resultado Esperado:**
```
✅ Formatação atualizada automaticamente
✅ KPIs com novos labels
✅ Gráficos com novos títulos
✅ Tooltips com nova formatação
```

**Teste Manual:**
```javascript
// Antes (Vendas)
console.log(document.getElementById('total-value').textContent);
// "R$ 50.000,00"

// Trocar template
selectTemplate('estoque');

// Aguardar 1 segundo
setTimeout(() => {
    console.log(document.getElementById('total-value').textContent);
    // "50000 un"
}, 1000);
```

---

### Teste 5: Validação de Dados

**Passos:**
1. Carregar dados com valores muito baixos (< R$ 1)
2. Selecionar template "Vendas"
3. Verificar avisos no console

**Resultado Esperado:**
```
⚠️ "Valores parecem muito baixos para moeda. Verifique se os dados estão corretos."
```

**Teste Manual:**
```javascript
const testData = [
    { date: '2024-01-01', value: 0.5, category: 'A' },
    { date: '2024-01-02', value: 0.8, category: 'B' }
];

const validation = TemplateValidator.validateDataForTemplate(testData, 'vendas');
console.log(validation.warnings);
// Esperado: ["Valores parecem muito baixos para moeda..."]
```

---

### Teste 6: Sugestão de Template

**Passos:**
1. Carregar dados com características de estoque
2. Sistema deve sugerir template "Estoque"

**Resultado Esperado:**
```
💡 Sugestão: Template "Estoque" parece mais adequado
```

**Teste Manual:**
```javascript
const stockData = [
    { date: '2024-01-01', value: 100, category: 'Produto A', quantidade: 100 },
    { date: '2024-01-02', value: 150, category: 'Produto B', quantidade: 150 }
];

const suggestion = TemplateValidator.suggestTemplate(stockData);
console.log(suggestion);
// Esperado: { suggested: 'estoque', confidence: 'high' }
```

---

### Teste 7: Correção Automática

**Passos:**
1. Carregar dados
2. Manualmente alterar label de KPI no HTML
3. Executar `fixTemplate()`
4. Verificar se label foi corrigido

**Resultado Esperado:**
```
🔧 Corrigindo formatação automaticamente...
✅ Formatação corrigida com sucesso!
```

**Teste Manual:**
```javascript
// Alterar manualmente
document.querySelector('#total-value .text-sm').textContent = 'Label Errado';

// Corrigir
fixTemplate();

// Verificar
console.log(document.querySelector('#total-value .text-sm').textContent);
// Esperado: "Receita Total" (ou label correto do template)
```

---

### Teste 8: Validação Completa

**Passos:**
1. Carregar dados
2. Executar `validateTemplate()`
3. Verificar relatório

**Resultado Esperado:**
```javascript
{
  template: "Vendas",
  timestamp: "2024-12-13T...",
  data: {
    valid: true,
    issues: [],
    warnings: [],
    stats: {
      dataPoints: 100,
      minValue: 10.50,
      maxValue: 5000.00,
      avgValue: 500.00,
      categories: 5,
      dates: 100
    }
  },
  formatting: {
    valid: true,
    issues: []
  },
  overall: "VÁLIDO"
}
```

**Teste Manual:**
```javascript
const report = validateTemplate();
console.log(report);
console.log(report.overall); // "VÁLIDO"
```

---

## 🔍 Testes de Consistência

### Teste 9: Consistência KPI

**Verificar:**
- [ ] Label do KPI corresponde ao template
- [ ] Valor está formatado corretamente
- [ ] Ícone faz sentido com o template

**Código:**
```javascript
const template = window.currentTemplate;
const config = TemplateFormatConfig[template];

// Verificar cada KPI
['total-value', 'total-count', 'avg-value', 'top-category'].forEach(id => {
    const element = document.getElementById(id);
    const label = element.querySelector('.text-sm').textContent;
    console.log(`${id}: ${label}`);
    // Deve corresponder a config.kpiLabels
});
```

---

### Teste 10: Consistência Gráficos

**Verificar:**
- [ ] Título do gráfico corresponde ao template
- [ ] Tooltip formatado corretamente
- [ ] Eixos formatados corretamente

**Código:**
```javascript
Object.entries(charts).forEach(([id, chart]) => {
    const title = chart.options.plugins.title.text;
    console.log(`${id}: ${title}`);
    // Deve corresponder a config.chartTitles
});
```

---

## 🐛 Testes de Casos Extremos

### Teste 11: Valores Negativos

**Dados:**
```javascript
const negativeData = [
    { date: '2024-01-01', value: -100, category: 'A' },
    { date: '2024-01-02', value: -50, category: 'B' }
];
```

**Resultado Esperado:**
```
⚠️ "Valores negativos detectados. Isso é esperado para este template?"
```

---

### Teste 12: Valores Muito Grandes

**Dados:**
```javascript
const largeData = [
    { date: '2024-01-01', value: 10000000, category: 'A' },
    { date: '2024-01-02', value: 20000000, category: 'B' }
];
```

**Resultado Esperado:**
```
✅ Formatação: "R$ 10.000.000,00" (vendas)
✅ Formatação: "10000000 un" (estoque)
⚠️ "Quantidades muito altas. Verifique se não são valores monetários." (estoque)
```

---

### Teste 13: Valores Decimais em Estoque

**Dados:**
```javascript
const decimalStock = [
    { date: '2024-01-01', value: 100.5, category: 'A' },
    { date: '2024-01-02', value: 150.75, category: 'B' }
];
```

**Resultado Esperado:**
```
⚠️ "Valores decimais detectados em estoque. Esperado: números inteiros."
```

---

### Teste 14: Muitas Categorias

**Dados:**
```javascript
const manyCategories = Array(100).fill(0).map((_, i) => ({
    date: '2024-01-01',
    value: 100,
    category: `Categoria ${i}`
}));
```

**Resultado Esperado:**
```
⚠️ "Muitas categorias (100). Considere agrupar algumas."
```

---

## 📊 Matriz de Testes

| Template | Tipo Valor | Formato Esperado | Status |
|----------|-----------|------------------|--------|
| Vendas | 1234.56 | R$ 1.234,56 | ✅ |
| Estoque | 1234 | 1234 un | ✅ |
| Finanças | 1234.56 | R$ 1.234,56 | ✅ |
| Jurídico | 1234.56 | R$ 1.234,56 | ✅ |
| Educação (nota) | 8.5 | 8,50 | ✅ |
| Educação (valor) | 850 | R$ 850,00 | ✅ |
| Custom | 1234.56 | 1234,56 | ✅ |

---

## ✅ Checklist de Validação

### Formatação
- [ ] Valores monetários com "R$"
- [ ] Quantidades com "un"
- [ ] Notas sem prefixo/sufixo
- [ ] Decimais corretos (2 para moeda, 0 para quantidade)
- [ ] Separadores corretos (. para milhares, , para decimais)

### Labels
- [ ] KPIs com labels contextuais
- [ ] Gráficos com títulos descritivos
- [ ] Tooltips formatados corretamente
- [ ] Eixos com formatação apropriada

### Validação
- [ ] Avisos para dados inconsistentes
- [ ] Sugestão de template quando apropriado
- [ ] Correção automática funciona
- [ ] Relatório de validação completo

### Integração
- [ ] Atualização automática ao trocar template
- [ ] Atualização automática ao carregar dados
- [ ] Atualização automática ao renderizar gráficos
- [ ] Compatibilidade com dark mode

---

## 🎯 Critérios de Aceitação

### Obrigatório
1. ✅ Nunca mostrar "R$" para quantidades
2. ✅ Nunca mostrar "un" para valores monetários
3. ✅ Labels sempre contextuais ao template
4. ✅ Títulos sempre descritivos
5. ✅ Formatação sempre consistente

### Desejável
1. ✅ Avisos para dados inconsistentes
2. ✅ Sugestão inteligente de template
3. ✅ Correção automática de problemas
4. ✅ Validação em tempo real
5. ✅ Relatório detalhado de validação

---

## 🚀 Execução dos Testes

### Teste Rápido (5 minutos)
```javascript
// 1. Carregar dados de exemplo
generateExampleData();

// 2. Validar
const report = validateTemplate();
console.log(report.overall); // Deve ser "VÁLIDO"

// 3. Trocar template
selectTemplate('estoque');

// 4. Validar novamente
setTimeout(() => {
    const report2 = validateTemplate();
    console.log(report2.overall); // Deve ser "VÁLIDO"
}, 1000);
```

### Teste Completo (30 minutos)
1. Executar todos os 14 testes acima
2. Verificar matriz de testes
3. Validar checklist
4. Documentar problemas encontrados

---

## 📝 Relatório de Testes

### Template de Relatório

```markdown
## Teste: [Nome do Teste]
**Data**: [Data]
**Executor**: [Nome]

### Resultado
- [ ] Passou
- [ ] Falhou
- [ ] Parcial

### Observações
[Descrever o que foi observado]

### Problemas Encontrados
[Listar problemas, se houver]

### Screenshots
[Anexar screenshots, se relevante]
```

---

## ✅ Conclusão

Todos os testes devem passar para garantir que:
1. Templates e formatação são sempre consistentes
2. Usuário nunca vê formatação incorreta
3. Sistema é inteligente e ajuda o usuário
4. Experiência é profissional e confiável

**Status**: ✅ Pronto para Testes
