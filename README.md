<div align="center">

# 🚀 Nexus Dashboard

### Dashboard de Business Intelligence com Inteligência Artificial

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

<p align="center">
  <strong>Uma plataforma completa para análise de dados de vendas com visualizações interativas e assistente de IA integrado.</strong>
</p>

[🌐 Demo ao Vivo](https://nexus-dashboard-qpdm.onrender.com) · [📖 Documentação](#-como-funciona) · [🛠️ Instalação](#-instalação-local)

</div>

---

## 📋 Sobre o Projeto

O **Nexus Dashboard** é uma aplicação full-stack de Business Intelligence desenvolvida para transformar dados brutos de vendas em insights acionáveis. O projeto combina visualizações de dados interativas com um assistente de IA powered by Google Gemini, permitindo que usuários façam perguntas em linguagem natural sobre seus dados.

### ✨ Principais Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| 📊 **Dashboard Interativo** | Visualize KPIs, gráficos de tendência, distribuição por categoria e métodos de pagamento em tempo real |
| 🤖 **Assistente de IA** | Converse com seus dados usando linguagem natural. Pergunte sobre tendências, anomalias e previsões |
| 📈 **Previsão de Vendas** | Algoritmo de forecasting que projeta vendas para os próximos 7 dias baseado em dados históricos |
| 📁 **Importação de CSV** | Importe seus próprios dados de vendas com mapeamento automático de colunas |
| 🌙 **Tema Dark/Light** | Interface adaptável com suporte completo a modo escuro |
| 📱 **100% Responsivo** | Experiência otimizada para desktop, tablet e dispositivos móveis |

---

## 🛠️ Stack Tecnológica

### Frontend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **React** | 18.3 | Biblioteca para construção de interfaces componentizadas e reativas |
| **TypeScript** | 5.9 | Superset do JavaScript com tipagem estática para maior segurança e produtividade |
| **Vite** | 5.4 | Build tool moderna e extremamente rápida para desenvolvimento |
| **TailwindCSS** | 3.4 | Framework CSS utility-first para estilização rápida e consistente |
| **Zustand** | 5.0 | Gerenciamento de estado minimalista e performático |
| **Chart.js** | 4.5 | Biblioteca de gráficos interativos e responsivos |
| **React-Chartjs-2** | 5.3 | Wrapper React para Chart.js |
| **Luxon** | 3.6 | Manipulação de datas moderna e imutável |
| **PapaParse** | 5.5 | Parser de CSV de alta performance |
| **Marked** | 15.0 | Renderização de Markdown para respostas da IA |

### Backend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Python** | 3.11 | Linguagem de programação do servidor |
| **Flask** | 3.0 | Microframework web leve e flexível |
| **Flask-CORS** | 5.0 | Gerenciamento de Cross-Origin Resource Sharing |
| **Gunicorn** | 23.0 | Servidor WSGI de produção para aplicações Python |
| **Google Gemini API** | - | Modelo de linguagem para o assistente de IA |

### DevOps & Infraestrutura

| Tecnologia | Propósito |
|------------|-----------|
| **Render** | Plataforma de deploy para backend e frontend |
| **GitHub** | Controle de versão e CI/CD |
| **pnpm** | Gerenciador de pacotes rápido e eficiente |

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   React     │  │  TypeScript │  │  TailwindCSS│              │
│  │ Components  │  │    Types    │  │   Styling   │              │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘              │
│         │                │                                       │
│         ▼                ▼                                       │
│  ┌─────────────────────────────────────┐                        │
│  │           Zustand Store             │                        │
│  │  (Estado Global da Aplicação)       │                        │
│  └──────────────────┬──────────────────┘                        │
│                     │                                            │
└─────────────────────┼────────────────────────────────────────────┘
                      │ HTTPS
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│  ┌─────────────────────────────────────┐                        │
│  │           Flask API                 │                        │
│  │  • Rate Limiting                    │                        │
│  │  • CORS Protection                  │                        │
│  │  • Input Validation                 │                        │
│  │  • Security Headers                 │                        │
│  └──────────────────┬──────────────────┘                        │
│                     │                                            │
└─────────────────────┼────────────────────────────────────────────┘
                      │ API Request
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GOOGLE GEMINI API                             │
│              (Processamento de Linguagem Natural)                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📂 Estrutura do Projeto

```
nexus-dashboard/
├── 📁 backend/                    # API Flask
│   ├── app.py                     # Servidor principal com endpoints
│   └── requirements.txt           # Dependências Python
│
├── 📁 frontend/                   # Aplicação React
│   ├── 📁 src/
│   │   ├── 📁 components/         # Componentes reutilizáveis
│   │   │   ├── Chart.tsx          # Gráficos interativos
│   │   │   ├── ChatPanel.tsx      # Painel do assistente IA
│   │   │   ├── Header.tsx         # Cabeçalho com filtros
│   │   │   ├── KPICard.tsx        # Cards de indicadores
│   │   │   ├── Sidebar.tsx        # Menu lateral
│   │   │   └── Toast.tsx          # Notificações
│   │   │
│   │   ├── 📁 hooks/              # Custom hooks
│   │   │   ├── useGemini.ts       # Integração com IA
│   │   │   ├── useStats.ts        # Cálculos estatísticos
│   │   │   └── useStore.ts        # Estado global (Zustand)
│   │   │
│   │   ├── 📁 pages/              # Páginas da aplicação
│   │   │   ├── Dashboard.tsx      # Página principal
│   │   │   └── Forecast.tsx       # Página de previsões
│   │   │
│   │   ├── 📁 types/              # Definições TypeScript
│   │   │   └── index.ts           # Interfaces e tipos
│   │   │
│   │   ├── 📁 utils/              # Funções utilitárias
│   │   │   ├── formatters.ts      # Formatação de valores
│   │   │   └── parsers.ts         # Parsing de dados
│   │   │
│   │   ├── App.tsx                # Componente raiz
│   │   └── main.tsx               # Ponto de entrada
│   │
│   ├── package.json               # Dependências Node.js
│   ├── tailwind.config.js         # Configuração Tailwind
│   ├── tsconfig.json              # Configuração TypeScript
│   └── vite.config.ts             # Configuração Vite
│
├── render.yaml                    # Configuração de deploy
└── README.md                      # Este arquivo
```

---

## 🔒 Segurança

O backend implementa múltiplas camadas de segurança:

- **🛡️ CORS Configurado**: Apenas origens autorizadas podem acessar a API
- **⏱️ Rate Limiting**: Limite de 10 requisições por minuto por IP
- **✅ Validação de Payload**: Todas as requisições são validadas antes do processamento
- **🧹 Sanitização de Input**: Proteção contra XSS e injeção de código
- **🔐 Variáveis de Ambiente**: Chaves de API nunca são expostas no código
- **📋 Security Headers**: Headers HTTP de segurança em todas as respostas

---

## 🚀 Instalação Local

### Pré-requisitos

- Node.js 18+ e pnpm
- Python 3.11+
- Chave de API do Google Gemini

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configurar variável de ambiente
export GEMINI_API_KEY="sua-chave-aqui"

# Iniciar servidor
python app.py
```

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Acesse `http://localhost:5173` no navegador.

---

## 📊 Como Usar

1. **Importe seus dados**: Clique em "Importar CSV" e selecione um arquivo com dados de vendas
2. **Explore o dashboard**: Visualize KPIs, gráficos e tendências automaticamente gerados
3. **Filtre por período**: Use os botões 7D, 30D ou Todos para ajustar o período de análise
4. **Converse com a IA**: Abra o chat e faça perguntas como:
   - "Qual foi o melhor dia de vendas?"
   - "Analise a tendência do último mês"
   - "Qual categoria tem melhor desempenho?"
5. **Veja previsões**: Acesse a página de Forecast para ver projeções de vendas

---

## 🌐 Deploy

O projeto está configurado para deploy automático no Render através do arquivo `render.yaml`. Basta conectar o repositório e configurar as variáveis de ambiente.

**URLs de Produção:**
- Frontend: https://nexus-dashboard-qpdm.onrender.com
- Backend: https://nexus-dashboard-api-795g.onrender.com

---

## 👨‍💻 Autor

**Gustavo Bezerra**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/gustavo-bezerradev/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/gustavoobezerra)

---

<div align="center">

Feito com ❤️ por Gustavo Bezerra

</div>
