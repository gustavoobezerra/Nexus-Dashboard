# 🚨 CORREÇÃO RÁPIDA - NEXUS DASHBOARD

## ❌ **ERRO: "Failed to fetch" ao usar IA**

### **Causa:**
Backend Python não está rodando ou dependências não instaladas.

### **Solução:**

#### **PASSO 1: Instalar Dependências**

**Windows:**
```cmd
python -m pip install Flask flask-cors requests python-dotenv
```

**Se der erro "No module named pip":**
```cmd
python -m ensurepip --default-pip
python -m pip install Flask flask-cors requests python-dotenv
```

#### **PASSO 2: Iniciar Backend**

**Opção A - Automático (Recomendado):**
```cmd
start-local.bat
```

**Opção B - Manual:**
```cmd
python proxy_server.py
```

**DEVE APARECER:**
```
═══════════════════════════════════════════════════════════════════
✅ Nexus Dashboard - Proxy Server Iniciado!
═══════════════════════════════════════════════════════════════════

🔑 API Key carregada: AIzaSyCx7j-ViLMmzchjJ...Yxk
🌐 Servidor rodando em: http://localhost:5000
📝 Endpoint: http://localhost:5000/api/gemini-proxy
```

#### **PASSO 3: Abrir Frontend**

**Em OUTRO terminal/janela:**
```cmd
python -m http.server 8000
```

**Acesse:** http://localhost:8000

---

## ❌ **ERRO: Gráficos mal formatados**

### **Causas possíveis:**

1. **Dados insuficientes** - Gráficos avançados precisam de pelo menos 3 registros
2. **CSV sem categorias** - Alguns gráficos precisam da coluna "category"
3. **CSV sem payment** - Heatmap precisa da coluna "payment"

### **Solução:**

#### **Formato esperado do CSV:**

```csv
date,product,category,value,payment,status,quantity
2024-01-01,Produto A,Software,150.50,Crédito,Aprovado,2
2024-01-02,Produto B,Móveis,300.00,Débito,Aprovado,1
2024-01-03,Produto C,Eletrônicos,450.75,PIX,Aprovado,3
```

**Colunas obrigatórias:**
- ✅ `date` - Data (formato: YYYY-MM-DD)
- ✅ `value` - Valor numérico
- ✅ `category` - Categoria do produto
- ✅ `payment` - Forma de pagamento (para heatmap)

#### **Verificar Console do Navegador:**

Abra DevTools (F12) e veja se há erros:
- ✅ Se aparecer: `"Dados insuficientes para gráficos avançados"` - Adicione mais linhas ao CSV
- ✅ Se aparecer: `"Canvas #scatterChart não encontrado"` - Recarregue a página

---

## 🔧 **CHECKLIST DE VALIDAÇÃO**

### **Backend:**
- [ ] Python instalado (versão 3.8+)
- [ ] Dependências instaladas (Flask, requests, etc.)
- [ ] Arquivo `.env` com API Key configurada
- [ ] Servidor rodando na porta 5000
- [ ] Aparece mensagem "✅ Proxy Server Iniciado!"

### **Frontend:**
- [ ] Arquivo `index.html` aberto
- [ ] Todos os scripts carregados (veja console F12)
- [ ] CSV carregado com dados válidos
- [ ] Mínimo de 3 linhas de dados
- [ ] Colunas obrigatórias presentes

### **Teste de Integração:**
- [ ] Carregar CSV de exemplo
- [ ] Todos os gráficos renderizam
- [ ] Botão "Insight IA" funciona
- [ ] Não há erros no console

---

## 📝 **CSV DE EXEMPLO**

Crie um arquivo `vendas-exemplo.csv`:

```csv
date,product,category,value,payment,status,quantity
2024-12-01,Notebook Dell,Eletrônicos,3500.00,Crédito,Aprovado,1
2024-12-02,Mouse Gamer,Eletrônicos,150.50,PIX,Aprovado,2
2024-12-03,Teclado Mecânico,Eletrônicos,450.00,Débito,Aprovado,1
2024-12-04,Monitor 27,Eletrônicos,1200.00,Crédito,Aprovado,1
2024-12-05,Webcam HD,Eletrônicos,280.00,PIX,Aprovado,1
2024-12-06,Headset RGB,Eletrônicos,320.00,Crédito,Aprovado,2
2024-12-07,Mesa Escritório,Móveis,850.00,Boleto,Aprovado,1
2024-12-08,Cadeira Gamer,Móveis,1100.00,Crédito,Aprovado,1
2024-12-09,Luminária LED,Móveis,180.00,PIX,Aprovado,3
2024-12-10,Suporte Monitor,Acessórios,95.00,Débito,Aprovado,2
```

**Use este CSV para testar!**

---

## ⚡ **SOLUÇÃO RÁPIDA (1 comando)**

Se você tiver problemas, execute:

```cmd
cd C:\Users\User\Desktop\nexus-dashboard
python -m pip install Flask flask-cors requests python-dotenv && python proxy_server.py
```

Em outro terminal:
```cmd
cd C:\Users\User\Desktop\nexus-dashboard
python -m http.server 8000
```

Acesse: http://localhost:8000

---

## 🆘 **AINDA COM PROBLEMAS?**

### **Erro: "ModuleNotFoundError: No module named 'requests'"**
```cmd
python -m pip install requests
```

### **Erro: "Address already in use (porta 5000)"**
```cmd
# Matar processo na porta 5000
netstat -ano | findstr :5000
taskkill /PID [NÚMERO_DO_PID] /F
```

### **Erro: "Failed to fetch"**
1. Verifique se backend está rodando (porta 5000)
2. Verifique se API Key está no arquivo `.env`
3. Teste: http://localhost:5000/api/gemini-proxy

### **Erro: "CORS policy blocked"**
- Backend já tem CORS configurado
- Certifique-se de abrir pelo servidor HTTP (não file://)

---

## ✅ **TUDO FUNCIONANDO?**

Se o backend iniciou corretamente, você deve ver:

**Backend:**
```
✅ Nexus Dashboard - Proxy Server Iniciado!
🔑 API Key carregada: AIza...Yxk
🌐 Servidor rodando em: http://localhost:5000
```

**Frontend (Console F12):**
```
📊 Carregando gráficos avançados...
✅ Gráficos avançados carregados com sucesso!
✅ Sistema inteligente de formatação carregado!
✅ Validador de templates carregado!
```

---

**Nexus Dashboard v4.0** - © 2025
