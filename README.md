# Nexus Dashboard v4.0

Dashboard de Business Intelligence com React, TypeScript e Flask.

## Estrutura

```
NexusDashboard/
├── backend/          # API Flask
│   ├── app.py
│   └── requirements.txt
├── frontend/         # React + TypeScript
│   ├── src/
│   └── package.json
└── render.yaml       # Deploy config
```

## Desenvolvimento Local

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Configurar GEMINI_API_KEY
python app.py
```

### Frontend
```bash
cd frontend
pnpm install
pnpm dev
```

## Deploy no Render

1. Conecte o repositório no Render
2. Configure as variáveis de ambiente:
   - `GEMINI_API_KEY`: Sua chave da API Gemini
   - `FRONTEND_URL`: URL do frontend após deploy
3. O `render.yaml` configura automaticamente os dois serviços

## Autor

Gustavo Bezerra
