

# Nexus ERP Analytics v4.0

O **Nexus ERP Analytics** é um dashboard de Business Intelligence (BI) de última geração, desenvolvido como uma Single Page Application (SPA). Foi desenhado para transformar dados brutos (CSV) em insights acionáveis através de visualizações avançadas, análise estatística profunda e Inteligência Artificial (Google Gemini).

Esta versão **v4.0** introduz uma arquitetura modular, suporte a múltiplos tipos de dados (não apenas vendas) e ferramentas estatísticas robustas.

## 🚀 Novidades da Versão 4.0

  * **Arquitetura Modular:** Código otimizado e dividido em módulos especializados (`nexus-unified.js`, `advanced-charts.js`, `statistical-analysis.js`).
  * **Múltiplos Templates de Dados:** Suporte nativo para **Vendas, Estoque, Finanças, Jurídico e Educação**.
  * **Análise Estatística Avançada:** Deteção automática de anomalias (Outliers), sazonalidade e tendências lineares.
  * **Novos Gráficos:** Scatter Plots, Heatmaps, Radar Charts e Box Plots para distribuição de dados.
  * **Persistência de Dados:** Utilização de **IndexedDB** para salvar grandes volumes de dados localmente no navegador.
  * **Tabelas Virtuais:** Renderização otimizada para datasets com milhares de linhas.

## 📊 Funcionalidades Principais

### 1\. Dashboard Inteligente e Dinâmico

  * **KPIs Contextuais:** Os cartões de indicadores adaptam-se ao template escolhido (ex: "Receita" para Vendas vs. "Total de Processos" para Jurídico).
  * **Visualização de Dados:**
      * Evolução temporal (Linha).
      * Comparação de categorias (Barras).
      * Distribuição de status (Donut).
      * Dispersão e Correlação (Scatter/Heatmap).
  * **Temas:** Suporte total a **Modo Claro** e **Modo Escuro** com deteção automática de preferência do sistema.

### 2\. Sistema de Templates

O sistema reconhece e formata automaticamente os dados para diferentes verticais:

| Template | Foco | Métricas Exemplo |
| :--- | :--- | :--- |
| **🛒 Vendas** | Comércio | Receita, Ticket Médio, Top Produtos |
| **📦 Estoque** | Logística | Quantidade, Movimentações, Média Diária |
| **💰 Finanças** | Contabilidade | Saldo, Receitas vs Despesas, Centros de Custo |
| **⚖️ Jurídico** | Legal | Valor da Causa, Fases do Processo, Honorários |
| **🎓 Educação** | Académico | Notas, Frequência, Total de Alunos |

### 3\. Consultor IA (Google Gemini)

  * **Chatbot Integrado:** Painel lateral para conversar com os seus dados.
  * **Insights Contextuais:** Botões "Insight" em cada gráfico enviam os dados estatísticos específicos daquele gráfico para a IA gerar uma análise detalhada.
  * **Proxy Seguro:** A comunicação com a API é feita através de um servidor proxy seguro, protegendo as chaves de API.

### 4\. Ferramentas de Análise

  * **Forecasting (Previsão):** Algoritmos de regressão linear e médias móveis para prever os próximos 7, 14 ou 30 dias.
  * **Deteção de Anomalias:** Identificação estatística de valores atípicos (Z-Score e IQR).
  * **Relatórios:** Geração de relatórios de validação de dados com identificação de erros e duplicados.

## 🛠️ Tecnologias Utilizadas

O projeto não requer instalação complexa (npm/node), utilizando bibliotecas modernas via CDN para máxima portabilidade:

  * **Core:** HTML5, CSS3, JavaScript (ES6+).
  * **UI/UX:** Tailwind CSS, FontAwesome.
  * **Dados & Lógica:**
      * `PapaParse`: Processamento de ficheiros CSV.
      * `Luxon`: Manipulação avançada de datas e fusos horários.
      * `Simple Statistics`: Cálculos estatísticos complexos.
  * **Visualização:** Chart.js (com plugins de zoom e anotações).
  * **IA:** Integração com Google Gemini Pro via API REST.

## 📖 Guia de Utilização

### 1\. Carregar Dados

Pode utilizar o botão **"Demo"** para gerar dados fictícios ou **"CSV"** para carregar o seu ficheiro. O sistema aceita ficheiros `.csv` com cabeçalhos.

O sistema de **Mapeamento Inteligente** tentará identificar as colunas automaticamente. Exemplos de colunas reconhecidas:

  * **Data:** `data`, `date`, `dt_venda`, `criado_em`
  * **Valor:** `valor`, `value`, `total`, `preço`, `nota`
  * **Categoria:** `categoria`, `category`, `setor`, `curso`, `área`
  * **Produto/Item:** `produto`, `product`, `item`, `aluno`, `processo`

### 2\. Atalhos de Teclado

Aumente a produtividade com atalhos rápidos:

  * `1`, `2`, `3`: Alternar entre Dashboard, Previsões e Chat IA.
  * `Ctrl + I`: Importar ficheiro CSV.
  * `Ctrl + E`: Exportar dados (CSV/Excel/PDF).
  * `Ctrl + F`: Abrir filtros avançados.
  * `D`: Alternar Modo Escuro/Claro.
  * `?`: Ver lista completa de atalhos.

### 3\. Filtros Avançados

Clique no botão "Filtros" para aceder a segmentação granular:

  * Intervalo de datas personalizado.
  * Filtragem por valor mínimo/máximo.
  * Seleção múltipla de categorias ou status.

## 📂 Estrutura do Projeto

  * `index.html`: Ponto de entrada da aplicação e estrutura DOM.
  * `nexus-unified.js`: Núcleo do sistema (Rate limits, Storage, Chatbot, Utils).
  * `nexus-improvements.js`: Melhorias de performance, limpeza de memória e filtros (v4.0).
  * `advanced-charts.js`: Implementação de gráficos complexos (Scatter, Radar, BoxPlot).
  * `statistical-analysis.js`: Motor de cálculo estatístico (Tendências, Sazonalidade).
  * `template-formatter.js`: Lógica de formatação inteligente baseada no template ativo.
  * `template-validator.js`: Validação de integridade dos dados importados.

## ⚠️ Notas de Segurança e Performance

1.  **Dados Locais:** Todos os dados carregados são processados no navegador e guardados no **IndexedDB** do utilizador. Nada é enviado para servidores externos, exceto os resumos estatísticos anonimizados enviados para a IA (Google Gemini) quando solicita um insight.
2.  **API Key:** A chave da API do Gemini não está exposta no código cliente; o sistema espera um servidor proxy configurado no endpoint definido em `CONFIG.API_BASE_URL`.

## 📄 Licença

Distribuído sob a licença **MIT**. Sinta-se à vontade para utilizar, modificar e distribuir.

-----
