# 🚀 Como Rodar o Nexus Dashboard Localmente

## Pré-requisitos
- ✅ Python 3.8+ instalado
- ✅ Ambiente virtual Python criado (pasta `venv` já existe)
- ✅ API Key do Google Gemini

## Passo 1: Configurar a API Key

1. Abra o arquivo `.env` na raiz do projeto
2. Substitua `SUA_CHAVE_AQUI` pela sua chave real da API Gemini
3. Obtenha sua chave em: https://makersuite.google.com/app/apikey

Exemplo do arquivo `.env`:
```
GEMINI_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
```

## Passo 2: Iniciar o Servidor Local

### Opção 1: Script Automático (Windows)
```bash
# Execute o arquivo start-local.bat
start-local.bat
```

### Opção 2: Manual
```bash
# 1. Ativar ambiente virtual
venv\Scripts\activate

# 2. Instalar dependências (se necessário)
pip install flask flask-cors python-dotenv

# 3. Iniciar servidor
python proxy_server.py
```

## Passo 3: Abrir o Dashboard

1. **O servidor estará rodando em:** `http://localhost:5000`
2. **Abra o arquivo** `index.html` no seu navegador
3. **O dashboard irá automaticamente conectar ao localhost:5000**

## Testando

1. Faça upload de um arquivo CSV de vendas
2. Use o chatbot para fazer perguntas sobre os dados
3. Verifique os gráficos e KPIs gerados

## Troubleshooting

### Erro: "Failed to fetch" ou "Network Error"
- ✅ Verifique se o servidor Flask está rodando (`python proxy_server.py`)
- ✅ Confirme que está usando `http://localhost:5000` (não HTTPS)

### Erro: "API Key inválida" ou "403 Forbidden"
- ✅ Verifique se a chave no arquivo `.env` está correta
- ✅ Confirme que a chave tem permissões no Google AI Studio

### Erro: "Module not found"
- ✅ Ative o ambiente virtual: `venv\Scripts\activate`
- ✅ Reinstale as dependências: `pip install -r requirements.txt`

## Estrutura do Projeto

```
nexus-dashboard/
├── index.html           # Frontend (dashboard)
├── fixes.js             # Correções e integrações
├── proxy_server.py      # Backend (Flask proxy)
├── .env                 # Configurações (API Key)
├── start-local.bat      # Script de inicialização (Windows)
└── venv/                # Ambiente virtual Python
```

## Deploy em Produção

Para usar em produção (GitHub Pages + Render):
1. Frontend: Push para branch `main` → GitHub Pages
2. Backend: Push para branch `backend` → Render.com
3. Configure a variável de ambiente `GEMINI_API_KEY` no Render

---

📌 **Dica:** Use o modo escuro/claro no canto superior direito do dashboard!
