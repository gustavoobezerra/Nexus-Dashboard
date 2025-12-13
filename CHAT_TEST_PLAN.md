# Plano de Testes - Correção do Chat IA

## 🎯 Objetivo

Validar que a correção do chat IA resolve o erro "could not fetch" em todos os cenários possíveis.

---

## 📋 Cenários de Teste

### ✅ Teste 1: Chat Funcionando com Proxy

**Pré-requisitos**:
- Proxy rodando (`python proxy_server.py`)
- API Key configurada
- Dashboard aberto

**Passos**:
1. Abrir chat
2. Digitar: "Olá, qual foi o total de vendas?"
3. Pressionar Enter
4. Aguardar resposta

**Resultado Esperado**:
- ✅ Mensagem do usuário aparece
- ✅ Indicador de "Pensando..." aparece
- ✅ Resposta da IA aparece em Markdown
- ✅ Console mostra: "✅ Resposta via proxy recebida"
- ✅ Sem erros no console

---

### ✅ Teste 2: Fallback para API Direta

**Pré-requisitos**:
- Proxy **NÃO** rodando
- API Key configurada
- Dashboard aberto

**Passos**:
1. Abrir chat
2. Digitar: "Teste de fallback"
3. Pressionar Enter
4. Aguardar resposta

**Resultado Esperado**:
- ✅ Console mostra: "⚠️ Proxy falhou, tentando API direta..."
- ✅ Console mostra: "✅ Resposta via API direta recebida"
- ✅ Resposta da IA aparece normalmente
- ✅ Funciona mesmo sem proxy

---

### ✅ Teste 3: Validação de API Key

**Pré-requisitos**:
- API Key **NÃO** configurada
- Dashboard aberto

**Passos**:
1. Abrir console (F12)
2. Executar: `localStorage.removeItem('geminiApiKey')`
3. Abrir chat
4. Digitar: "Teste"
5. Pressionar Enter

**Resultado Esperado**:
- ✅ Toast aparece: "Configure sua API Key do Gemini primeiro!"
- ✅ Modal de configuração abre automaticamente
- ✅ Mensagem não é enviada
- ✅ Sem erro no console

---

### ✅ Teste 4: API Key Inválida

**Pré-requisitos**:
- API Key inválida configurada
- Dashboard aberto

**Passos**:
1. Configurar API Key inválida: "CHAVE_INVALIDA_123"
2. Abrir chat
3. Digitar: "Teste"
4. Pressionar Enter
5. Aguardar resposta

**Resultado Esperado**:
- ✅ Erro aparece no chat: "🔑 API Key inválida ou sem permissão"
- ✅ Instruções de como resolver aparecem
- ✅ Link para obter nova chave aparece
- ✅ Console mostra erro 401 ou 403

---

### ✅ Teste 5: Timeout

**Pré-requisitos**:
- Proxy rodando
- API Key configurada
- Dashboard aberto

**Passos**:
1. Modificar timeout para 1 segundo (para teste):
   ```javascript
   CHAT_CONFIG.timeout = 1000;
   ```
2. Abrir chat
3. Digitar pergunta complexa
4. Aguardar

**Resultado Esperado**:
- ✅ Após 1 segundo, erro aparece
- ✅ Mensagem: "⏱️ Tempo limite excedido"
- ✅ Sugestão: "Tente novamente com uma pergunta mais simples"
- ✅ Console mostra: "Request timeout"

---

### ✅ Teste 6: Sem Conexão com Internet

**Pré-requisitos**:
- Desconectar internet
- Dashboard aberto

**Passos**:
1. Desconectar internet
2. Abrir chat
3. Digitar: "Teste"
4. Pressionar Enter

**Resultado Esperado**:
- ✅ Erro aparece: "🔌 Erro de conexão"
- ✅ Instruções aparecem:
  - "Proxy não está rodando"
  - "Sem conexão com internet"
  - "API Key inválida"
- ✅ Console mostra: "Failed to fetch"

---

### ✅ Teste 7: Limite de Requisições (429)

**Pré-requisitos**:
- Fazer muitas requisições rapidamente
- Dashboard aberto

**Passos**:
1. Enviar 10+ mensagens rapidamente
2. Aguardar erro 429

**Resultado Esperado**:
- ✅ Erro aparece: "⏸️ Limite de requisições excedido"
- ✅ Sugestão: "Aguarde alguns minutos"
- ✅ Console mostra erro 429

---

### ✅ Teste 8: Erro do Servidor (500/503)

**Pré-requisitos**:
- Simular erro do servidor (modificar proxy para retornar 500)

**Passos**:
1. Modificar proxy_server.py para retornar 500
2. Abrir chat
3. Digitar: "Teste"
4. Pressionar Enter

**Resultado Esperado**:
- ✅ Erro aparece: "🔧 Erro no servidor do Google"
- ✅ Sugestão: "Tente novamente em alguns minutos"
- ✅ Console mostra erro 500 ou 503

---

### ✅ Teste 9: Diagnóstico

**Pré-requisitos**:
- Dashboard aberto
- Console aberto (F12)

**Passos**:
1. Executar: `diagnoseChatIssue()`
2. Ler saída

**Resultado Esperado**:
```
🔍 Diagnóstico do Chat IA:
----------------------------
1. API Key: AIzaSyAbCdEfGhIjKlMn...
2. Proxy URL: http://localhost:5000/api/gemini-proxy
3. Usar Proxy: ✅ Sim
4. Testando conexão com proxy...
   ✅ Proxy acessível (ou ❌ Proxy NÃO acessível)
5. Elementos do DOM:
   chat-history: ✅
   chat-input: ✅
   send-chat-btn: ✅
```

---

### ✅ Teste 10: Markdown Rendering

**Pré-requisitos**:
- Proxy rodando
- API Key configurada
- Dashboard aberto

**Passos**:
1. Abrir chat
2. Digitar: "Me dê uma lista de 3 dicas em Markdown"
3. Aguardar resposta

**Resultado Esperado**:
- ✅ Resposta renderizada com Markdown
- ✅ Listas aparecem formatadas
- ✅ **Negrito** funciona
- ✅ *Itálico* funciona
- ✅ `Código` funciona
- ✅ Links funcionam

---

### ✅ Teste 11: XSS Protection

**Pré-requisitos**:
- Dashboard aberto

**Passos**:
1. Abrir chat
2. Digitar: `<script>alert('XSS')</script>`
3. Pressionar Enter

**Resultado Esperado**:
- ✅ Script é escapado
- ✅ Aparece como texto: `<script>alert('XSS')</script>`
- ✅ Alert **NÃO** executa
- ✅ Sem vulnerabilidade XSS

---

### ✅ Teste 12: Múltiplas Mensagens

**Pré-requisitos**:
- Proxy rodando
- API Key configurada
- Dashboard aberto

**Passos**:
1. Enviar mensagem 1: "Olá"
2. Aguardar resposta
3. Enviar mensagem 2: "Qual foi o total?"
4. Aguardar resposta
5. Enviar mensagem 3: "E o ticket médio?"
6. Aguardar resposta

**Resultado Esperado**:
- ✅ Todas as 3 mensagens aparecem
- ✅ Todas as 3 respostas aparecem
- ✅ Histórico mantém ordem correta
- ✅ Scroll automático funciona
- ✅ Sem duplicação de mensagens

---

### ✅ Teste 13: Contexto dos Dados

**Pré-requisitos**:
- Dados carregados no dashboard
- Proxy rodando
- API Key configurada

**Passos**:
1. Carregar CSV com dados de vendas
2. Abrir chat
3. Digitar: "Qual foi o total de vendas?"
4. Aguardar resposta

**Resultado Esperado**:
- ✅ IA usa contexto dos dados carregados
- ✅ Resposta menciona valores reais do CSV
- ✅ Resposta é relevante aos dados
- ✅ Console mostra contexto enviado

---

### ✅ Teste 14: Enter vs Shift+Enter

**Pré-requisitos**:
- Dashboard aberto

**Passos**:
1. Abrir chat
2. Digitar: "Linha 1"
3. Pressionar Shift+Enter
4. Digitar: "Linha 2"
5. Pressionar Enter

**Resultado Esperado**:
- ✅ Shift+Enter adiciona quebra de linha
- ✅ Enter envia a mensagem
- ✅ Mensagem enviada contém 2 linhas
- ✅ Input limpa após enviar

---

### ✅ Teste 15: Botão de Enviar

**Pré-requisitos**:
- Dashboard aberto

**Passos**:
1. Abrir chat
2. Digitar: "Teste"
3. Clicar no botão de enviar (ao invés de Enter)

**Resultado Esperado**:
- ✅ Mensagem é enviada
- ✅ Funciona igual ao Enter
- ✅ Input limpa
- ✅ Resposta aparece

---

## 📊 Matriz de Testes

| # | Teste | Status | Observações |
|---|-------|--------|-------------|
| 1 | Com Proxy | ⬜ | |
| 2 | Fallback API Direta | ⬜ | |
| 3 | Validação API Key | ⬜ | |
| 4 | API Key Inválida | ⬜ | |
| 5 | Timeout | ⬜ | |
| 6 | Sem Internet | ⬜ | |
| 7 | Limite 429 | ⬜ | |
| 8 | Erro Servidor 500 | ⬜ | |
| 9 | Diagnóstico | ⬜ | |
| 10 | Markdown | ⬜ | |
| 11 | XSS Protection | ⬜ | |
| 12 | Múltiplas Mensagens | ⬜ | |
| 13 | Contexto Dados | ⬜ | |
| 14 | Enter vs Shift+Enter | ⬜ | |
| 15 | Botão Enviar | ⬜ | |

**Legenda**: ⬜ Não testado | ✅ Passou | ❌ Falhou | ⚠️ Parcial

---

## 🎯 Critérios de Aceitação

### Obrigatório (Todos devem passar)
- ✅ Teste 1: Com Proxy
- ✅ Teste 2: Fallback API Direta
- ✅ Teste 3: Validação API Key
- ✅ Teste 11: XSS Protection
- ✅ Teste 12: Múltiplas Mensagens

### Importante (Maioria deve passar)
- ✅ Teste 4: API Key Inválida
- ✅ Teste 6: Sem Internet
- ✅ Teste 9: Diagnóstico
- ✅ Teste 10: Markdown
- ✅ Teste 13: Contexto Dados

### Desejável (Bom se passar)
- ✅ Teste 5: Timeout
- ✅ Teste 7: Limite 429
- ✅ Teste 8: Erro Servidor 500
- ✅ Teste 14: Enter vs Shift+Enter
- ✅ Teste 15: Botão Enviar

---

## 🐛 Registro de Bugs

### Template de Bug

```markdown
**Bug #**: [número]
**Teste**: [nome do teste]
**Severidade**: CRÍTICO | ALTO | MÉDIO | BAIXO
**Descrição**: [o que aconteceu]
**Esperado**: [o que deveria acontecer]
**Passos para Reproduzir**:
1. [passo 1]
2. [passo 2]
3. [passo 3]
**Screenshot**: [se aplicável]
**Console Log**: [se aplicável]
```

---

## ✅ Checklist Final

Antes de considerar a correção completa:

- [ ] Todos os testes obrigatórios passaram
- [ ] Maioria dos testes importantes passaram
- [ ] Bugs críticos foram corrigidos
- [ ] Documentação atualizada
- [ ] Código commitado no GitHub
- [ ] Usuário testou e aprovou

---

**Versão**: 1.0  
**Data**: Dezembro 2024  
**Status**: Pronto para Testes
