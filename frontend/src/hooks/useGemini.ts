// Feito por Gustavo Bezerra
import { useState, useCallback } from 'react';
import { useStore } from './useStore';
import type { Stats } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || '';

export function useGemini() {
  const [isLoading, setIsLoading] = useState(false);
  const { addChatMessage, stats } = useStore();

  const sendMessage = useCallback(async (message: string): Promise<string> => {
    setIsLoading(true);

    addChatMessage({
      role: 'user',
      content: message,
      timestamp: Date.now(),
    });

    try {
      const context = stats ? buildContext(stats) : {};

      const response = await fetch(`${API_URL}/api/gemini-proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-2.5-flash',
          contents: [{
            parts: [{
              text: `Você é um Especialista em Business Intelligence.

CONTEXTO DOS DADOS:
${JSON.stringify(context, null, 2)}

PERGUNTA DO USUÁRIO:
"${message}"

INSTRUÇÕES:
1. Responda em Português do Brasil
2. Use formatação Markdown
3. Seja direto e objetivo
4. Foque em insights práticos`,
            }],
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem resposta';

      addChatMessage({
        role: 'assistant',
        content: aiResponse,
        timestamp: Date.now(),
      });

      return aiResponse;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      addChatMessage({
        role: 'assistant',
        content: `Erro: ${errorMsg}`,
        timestamp: Date.now(),
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addChatMessage, stats]);

  return { sendMessage, isLoading };
}

function buildContext(stats: Stats) {
  return {
    resumo: {
      receita_total: stats.revenue,
      total_vendas: stats.sales,
      ticket_medio: stats.avgTicket,
      categoria_principal: stats.topCategory,
    },
    top_produtos: stats.topProducts.slice(0, 5),
    pagamentos: stats.payBreakdown,
    status: stats.statusBreakdown,
  };
}
