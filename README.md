# Nexus ERP Analytics

**Nexus ERP Analytics** é um dashboard de Business Intelligence (BI) interativo e moderno, projetado para visualização de dados de vendas, previsão de tendências (Forecasting) e consultoria estratégica através de Inteligência Artificial (Google Gemini).

Desenvolvido como uma Single Page Application (SPA), o projeto utiliza tecnologias web nativas e bibliotecas leves para oferecer alta performance sem a necessidade de um backend complexo.

## 🚀 Funcionalidades

### 📊 Dashboard Interativo
- **KPIs em Tempo Real**: Visualize Receita Total, Volume de Vendas, Ticket Médio e Top Categorias.
- **Gráficos Dinâmicos**: Acompanhe o fluxo de vendas diário, métodos de pagamento, desempenho por categoria e status dos pedidos.
- **Listagens**: Tabelas de "Top Produtos" e "Transações Recentes".
- **Filtros Temporais**: Filtre os dados por 7 dias, 30 dias ou período total.

### 🔮 Previsão de Vendas (Forecasting)
- **Algoritmo de Regressão Linear**: Projeta tendências futuras para os próximos 7 dias.
- **Múltiplas Visões**: Analise projeções gerais, por categoria, por método de pagamento ou por status do pedido.

### 🤖 Consultor IA (Google Gemini)
- **Assistente Integrado**: Chatbot lateral capaz de analisar os dados carregados no dashboard.
- **Insights Contextuais**: Botões "Insight" e "Analisar" nos gráficos enviam automaticamente o contexto dos dados para a IA gerar explicações detalhadas.

### ⚙️ Utilitários
- **Importação de CSV**: Carregue seus próprios dados de vendas (compatível com CSVs contendo colunas como `date`, `value`, `category`, etc.).
- **Exportação de Dados**: Baixe os dados filtrados em formato CSV.
- **Temas**: Suporte completo a Modo Claro e Modo Escuro (Dark Mode).
- **Gerador de Dados de Exemplo**: Popula o dashboard com dados fictícios para demonstração.

## 🛠️ Tecnologias Utilizadas

*   **HTML5 & CSS3**: Estrutura e estilização.
*   **JavaScript (ES6+)**: Lógica da aplicação (sem frameworks pesados).
*   **Tailwind CSS**: Framework CSS utilitário para design responsivo e temas.
*   **Chart.js**: Biblioteca para renderização de gráficos interativos.
*   **PapaParse**: Parser de CSV rápido e robusto.
*   **Google Gemini API**: Modelo de linguagem para o assistente de IA.
*   **FontAwesome**: Ícones vetoriais.

## 📦 Instalação e Configuração

Como o projeto é uma aplicação estática (client-side), não há necessidade de instalação de dependências via npm ou servidores complexos.

1.  **Clone o repositório**:
    ```bash
    git clone https://github.com/seu-usuario/nexus-erp-analytics.git
    cd nexus-erp-analytics
    ```

2.  **Configuração da API Key (Opcional)**:
    *   O projeto vem com uma chave de API de demonstração no código (`index.html`).
    *   Para uso em produção ou pessoal, obtenha sua própria chave no [Google AI Studio](https://aistudio.google.com/).
    *   Substitua a constante `apiKey` no início do bloco `<script>` no arquivo `index.html`.

3.  **Executar**:
    *   Basta abrir o arquivo `index.html` em qualquer navegador moderno.

## 📖 Como Usar

1.  **Carregar Dados**:
    *   Ao abrir, clique em **"Exemplo"** no topo para gerar dados fictícios.
    *   Ou clique em **"CSV"** para fazer upload do seu arquivo de vendas.
2.  **Navegação**:
    *   Use a barra lateral para alternar entre **"Visão Geral"** (Dashboard) e **"Previsões Futuras"** (Forecasting).
3.  **IA**:
    *   Clique em **"Consultor IA"** na barra lateral ou nos botões de "Insight" nos gráficos para abrir o chat e interagir com o assistente.
4.  **Temas**:
    *   Clique no ícone de Lua/Sol no topo para alternar entre os modos Claro e Escuro.

## 📄 Formato do CSV

Para importar seus próprios dados, o arquivo CSV deve conter cabeçalhos. O sistema tenta identificar automaticamente colunas com nomes comuns (em português ou inglês), como:

*   **Data**: `date`, `data`, `Data`
*   **Categoria**: `category`, `categoria`
*   **Produto**: `product`, `produto`
*   **Valor**: `value`, `valor`
*   **Pagamento**: `payment`, `pagamento`
*   **Status**: `status`

Exemplo:
```csv
data,produto,categoria,valor,pagamento,status
2023-10-01,Notebook,Eletrônicos,3500.00,Crédito,Concluído
2023-10-01,Mesa,Móveis,450.00,PIX,Pendente
```

## 📝 Licença

Este projeto está sob a licença MIT. Sinta-se à vontade para usar e modificar.
