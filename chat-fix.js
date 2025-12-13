// =====================================================================
// NEXUS DASHBOARD - CORREÇÃO DO CHAT IA
// =====================================================================
// Corrige o erro "could not fetch" fazendo o chat usar o proxy

(function() {
    'use strict';

    console.log('🔧 Carregando correção do chat IA...');

    // =====================================================================
    // CONFIGURAÇÃO
    // =====================================================================

    const CHAT_CONFIG = {
        proxyUrl: 'http://localhost:5000/api/gemini-proxy',
        directApiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
        useProxy: true, // Preferir proxy por padrão
        timeout: 30000, // 30 segundos
        maxRetries: 2
    };

    // =====================================================================
    // FUNÇÃO MELHORADA DE ENVIO DE MENSAGEM
    // =====================================================================

    window.sendMessageToAI = async function(text) {
        if (!text || !text.trim()) {
            showToast?.('Digite uma mensagem primeiro!', 'warning');
            return;
        }

        const apiKey = localStorage.getItem('geminiApiKey');
        
        // Validar API Key
        if (!apiKey || apiKey === 'SUA_CHAVE_AQUI' || apiKey.length < 20) {
            showToast?.('❌ Configure sua API Key do Gemini primeiro!', 'error');
            
            // Abrir modal de configuração se existir
            const configBtn = document.querySelector('[onclick*="openConfigModal"]');
            if (configBtn) {
                setTimeout(() => configBtn.click(), 500);
            }
            return;
        }

        const historyEl = document.getElementById('chat-history');
        const inputEl = document.getElementById('chat-input');

        if (!historyEl) {
            console.error('Elemento chat-history não encontrado');
            return;
        }

        // Adicionar mensagem do usuário
        historyEl.innerHTML += `<div class="chat-bubble chat-user">${escapeHtml(text)}</div>`;
        if (inputEl) inputEl.value = '';
        historyEl.scrollTop = historyEl.scrollHeight;

        // Adicionar indicador de carregamento
        const loadingId = `loading-${Date.now()}`;
        historyEl.innerHTML += `<div id="${loadingId}" class="chat-bubble chat-ai italic">
            <i class="fa-solid fa-circle-notch fa-spin"></i> Pensando...
        </div>`;
        historyEl.scrollTop = historyEl.scrollHeight;

        try {
            // Preparar contexto
            const ctx = typeof stats !== 'undefined' ? stats : {};
            
            // Preparar payload
            const payload = {
                contents: [{
                    parts: [{
                        text: `Você é um Analista de ERP especializado em Business Intelligence. 

Contexto dos dados:
${JSON.stringify(ctx, null, 2)}

Pergunta do usuário: "${text}"

Instruções:
- Responda de forma concisa e prática
- Use Markdown para formatação
- Forneça insights acionáveis
- Se relevante, sugira análises adicionais
- Mantenha tom profissional mas acessível

Responda em português do Brasil:`
                    }]
                }]
            };

            let response;
            let aiReply;

            // Tentar usar proxy primeiro
            if (CHAT_CONFIG.useProxy) {
                try {
                    console.log('🔄 Tentando via proxy...');
                    response = await fetchWithTimeout(CHAT_CONFIG.proxyUrl, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(payload)
                    }, CHAT_CONFIG.timeout);

                    if (response.ok) {
                        console.log('✅ Resposta via proxy recebida');
                        const data = await response.json();
                        aiReply = extractAIReply(data);
                    } else {
                        throw new Error(`Proxy retornou status ${response.status}`);
                    }
                } catch (proxyError) {
                    console.warn('⚠️ Proxy falhou, tentando API direta...', proxyError.message);
                    
                    // Fallback para API direta
                    response = await fetchWithTimeout(
                        `${CHAT_CONFIG.directApiUrl}?key=${encodeURIComponent(apiKey)}`,
                        {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify(payload)
                        },
                        CHAT_CONFIG.timeout
                    );

                    if (response.ok) {
                        console.log('✅ Resposta via API direta recebida');
                        const data = await response.json();
                        aiReply = extractAIReply(data);
                    } else {
                        const errorText = await response.text();
                        throw new Error(`API Error: ${response.status} - ${errorText}`);
                    }
                }
            } else {
                // Usar API direta
                console.log('🔄 Usando API direta...');
                response = await fetchWithTimeout(
                    `${CHAT_CONFIG.directApiUrl}?key=${encodeURIComponent(apiKey)}`,
                    {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(payload)
                    },
                    CHAT_CONFIG.timeout
                );

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`API Error: ${response.status} - ${errorText}`);
                }

                const data = await response.json();
                aiReply = extractAIReply(data);
            }

            // Remover loading
            const loadingElement = document.getElementById(loadingId);
            if (loadingElement) {
                loadingElement.remove();
            }

            // Renderizar resposta com Markdown
            const renderedReply = typeof marked !== 'undefined' 
                ? marked.parse(aiReply) 
                : aiReply.replace(/\n/g, '<br>');

            historyEl.innerHTML += `<div class="chat-bubble chat-ai">${renderedReply}</div>`;
            historyEl.scrollTop = historyEl.scrollHeight;

        } catch (error) {
            console.error('❌ Erro no chat:', error);

            // Remover loading
            const loadingElement = document.getElementById(loadingId);
            if (loadingElement) {
                loadingElement.remove();
            }

            // Mensagem de erro personalizada
            let errorMessage = '❌ Erro ao processar sua mensagem.';
            let errorDetails = '';

            if (error.name === 'AbortError' || error.message.includes('timeout')) {
                errorMessage = '⏱️ Tempo limite excedido.';
                errorDetails = 'A IA demorou muito para responder. Tente novamente com uma pergunta mais simples.';
            } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                errorMessage = '🔌 Erro de conexão.';
                errorDetails = `
                    <strong>Possíveis causas:</strong><br>
                    1. Proxy não está rodando - Execute <code>python proxy_server.py</code><br>
                    2. Sem conexão com internet<br>
                    3. API Key inválida<br>
                    <br>
                    <strong>Como resolver:</strong><br>
                    1. Abra um terminal na pasta do projeto<br>
                    2. Execute: <code>python proxy_server.py</code><br>
                    3. Mantenha o terminal aberto<br>
                    4. Tente novamente
                `;
            } else if (error.message.includes('API Error: 400')) {
                errorMessage = '⚠️ Requisição inválida.';
                errorDetails = 'Verifique se sua API Key está correta nas configurações.';
            } else if (error.message.includes('API Error: 401') || error.message.includes('API Error: 403')) {
                errorMessage = '🔑 API Key inválida ou sem permissão.';
                errorDetails = `
                    <strong>Como resolver:</strong><br>
                    1. Verifique se sua API Key está correta<br>
                    2. Obtenha uma nova em: <a href="https://makersuite.google.com/app/apikey" target="_blank">Google AI Studio</a><br>
                    3. Configure nas configurações do dashboard
                `;
            } else if (error.message.includes('API Error: 429')) {
                errorMessage = '⏸️ Limite de requisições excedido.';
                errorDetails = 'Aguarde alguns minutos antes de tentar novamente.';
            } else if (error.message.includes('API Error: 500') || error.message.includes('API Error: 503')) {
                errorMessage = '🔧 Erro no servidor do Google.';
                errorDetails = 'O serviço está temporariamente indisponível. Tente novamente em alguns minutos.';
            } else {
                errorDetails = `<code>${escapeHtml(error.message)}</code>`;
            }

            historyEl.innerHTML += `
                <div class="chat-bubble chat-ai" style="background-color: #fee; border-left: 4px solid #f44;">
                    <strong>${errorMessage}</strong><br>
                    ${errorDetails}
                </div>
            `;
            historyEl.scrollTop = historyEl.scrollHeight;

            showToast?.(errorMessage, 'error');
        }
    };

    // =====================================================================
    // FUNÇÕES AUXILIARES
    // =====================================================================

    /**
     * Fetch com timeout
     */
    function fetchWithTimeout(url, options, timeout) {
        return new Promise((resolve, reject) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
                reject(new Error('Request timeout'));
            }, timeout);

            fetch(url, {
                ...options,
                signal: controller.signal
            })
            .then(response => {
                clearTimeout(timeoutId);
                resolve(response);
            })
            .catch(error => {
                clearTimeout(timeoutId);
                reject(error);
            });
        });
    }

    /**
     * Extrair resposta da IA do JSON retornado
     */
    function extractAIReply(data) {
        // Validação robusta da resposta
        if (!data) {
            throw new Error('Resposta vazia da API');
        }

        if (data.error) {
            throw new Error(data.error.message || 'Erro desconhecido da API');
        }

        if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
            throw new Error('Nenhum candidato de resposta retornado');
        }

        const candidate = data.candidates[0];

        if (!candidate.content || !candidate.content.parts || !Array.isArray(candidate.content.parts)) {
            throw new Error('Estrutura de resposta inválida');
        }

        const part = candidate.content.parts[0];

        if (!part || !part.text) {
            throw new Error('Texto de resposta não encontrado');
        }

        return part.text.trim();
    }

    /**
     * Escapar HTML para prevenir XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // =====================================================================
    // SUBSTITUIR FUNÇÃO ORIGINAL
    // =====================================================================

    // Salvar função original se existir
    if (typeof window.originalSendMessage === 'undefined' && typeof window.sendMessage !== 'undefined') {
        window.originalSendMessage = window.sendMessage;
    }

    // Substituir função global
    window.sendMessage = window.sendMessageToAI;

    // =====================================================================
    // ADICIONAR LISTENER NO INPUT
    // =====================================================================

    document.addEventListener('DOMContentLoaded', function() {
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-chat-btn');

        if (chatInput) {
            // Enter para enviar
            chatInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const text = chatInput.value.trim();
                    if (text) {
                        window.sendMessageToAI(text);
                    }
                }
            });
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', function() {
                const text = chatInput ? chatInput.value.trim() : '';
                if (text) {
                    window.sendMessageToAI(text);
                }
            });
        }
    });

    // =====================================================================
    // DIAGNÓSTICO E AJUDA
    // =====================================================================

    window.diagnoseChatIssue = function() {
        console.log('🔍 Diagnóstico do Chat IA:');
        console.log('----------------------------');
        
        const apiKey = localStorage.getItem('geminiApiKey');
        console.log('1. API Key:', apiKey ? `${apiKey.substring(0, 20)}...` : '❌ NÃO CONFIGURADA');
        
        console.log('2. Proxy URL:', CHAT_CONFIG.proxyUrl);
        console.log('3. Usar Proxy:', CHAT_CONFIG.useProxy ? '✅ Sim' : '❌ Não');
        
        console.log('\n4. Testando conexão com proxy...');
        fetch(CHAT_CONFIG.proxyUrl.replace('/api/gemini-proxy', ''))
            .then(() => console.log('   ✅ Proxy acessível'))
            .catch(() => console.log('   ❌ Proxy NÃO acessível - Execute: python proxy_server.py'));
        
        console.log('\n5. Elementos do DOM:');
        console.log('   chat-history:', document.getElementById('chat-history') ? '✅' : '❌');
        console.log('   chat-input:', document.getElementById('chat-input') ? '✅' : '❌');
        console.log('   send-chat-btn:', document.getElementById('send-chat-btn') ? '✅' : '❌');
        
        console.log('\n💡 Para resolver problemas:');
        console.log('   1. Execute: python proxy_server.py');
        console.log('   2. Configure sua API Key nas configurações');
        console.log('   3. Recarregue a página');
        console.log('----------------------------');
    };

    // Executar diagnóstico automaticamente se houver problemas
    setTimeout(() => {
        const apiKey = localStorage.getItem('geminiApiKey');
        if (!apiKey || apiKey === 'SUA_CHAVE_AQUI') {
            console.warn('⚠️ API Key não configurada. Execute diagnoseChatIssue() para mais informações.');
        }
    }, 2000);

    console.log('✅ Correção do chat IA carregada!');
    console.log('💡 Use diagnoseChatIssue() para diagnosticar problemas');

})();
