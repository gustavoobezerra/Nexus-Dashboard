// Feito por Gustavo Bezerra - Chat Panel Premium
import { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import { useStore } from '@/hooks/useStore';
import { useGemini } from '@/hooks/useGemini';

export function ChatPanel() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { chatOpen, toggleChat, chatHistory, clearChatHistory } = useStore();
  const { sendMessage, isLoading } = useGemini();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');

    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Chat error:', error);
    }
  };

  const quickQuestions = [
    { icon: 'chart-line', text: 'Analise a tendência de vendas' },
    { icon: 'trophy', text: 'Qual o melhor produto?' },
    { icon: 'wand-magic-sparkles', text: 'Previsão para próxima semana' },
    { icon: 'lightbulb', text: 'Sugestões de melhoria' },
  ];

  return (
    <>
      {/* Overlay */}
      {chatOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleChat}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-gray-200/50 dark:border-slate-700/50 shadow-2xl z-50 transform transition-all duration-500 ease-out ${
          chatOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="relative overflow-hidden border-b border-gray-200/50 dark:border-slate-700/50">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10" />
            
            <div className="relative flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <i className="fa-solid fa-robot text-white text-lg"></i>
                  </div>
                  {/* Online indicator */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Assistente BI</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    Powered by Gemini AI
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChatHistory}
                  className="p-2.5 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                  title="Limpar histórico"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
                <button
                  onClick={toggleChat}
                  className="p-2.5 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                >
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Welcome message */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-2xl border border-purple-100 dark:border-purple-800/30">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl" />
              <div className="relative flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-sparkles text-white text-xs"></i>
                </div>
                <div>
                  <p className="text-sm text-purple-800 dark:text-purple-200 font-medium mb-1">
                    Olá! Sou seu assistente de BI.
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-300">
                    Pergunte sobre tendências, anomalias ou previsões dos seus dados.
                  </p>
                </div>
              </div>
            </div>

            {/* Chat history */}
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                    <i className="fa-solid fa-robot text-white text-xs"></i>
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }}
                    />
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
                
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center ml-2 flex-shrink-0 mt-1">
                    <i className="fa-solid fa-user text-white text-xs"></i>
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-2 flex-shrink-0">
                  <i className="fa-solid fa-robot text-white text-xs"></i>
                </div>
                <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Analisando...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions */}
          {chatHistory.length === 0 && (
            <div className="px-4 pb-4">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                <i className="fa-solid fa-lightbulb text-amber-500"></i>
                Sugestões rápidas
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(q.text)}
                    className="flex items-center gap-2 text-xs px-3 py-2.5 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200/50 dark:border-slate-700/50 hover:border-purple-300 dark:hover:border-purple-700 transition-all group"
                  >
                    <i className={`fa-solid fa-${q.icon} text-purple-500 group-hover:text-purple-600 transition-colors`}></i>
                    <span className="truncate">{q.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input form */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200/50 dark:border-slate-700/50 bg-gray-50/50 dark:bg-slate-800/50">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua pergunta..."
                  disabled={isLoading}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 disabled:opacity-50 transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <i className="fa-solid fa-message text-gray-300 dark:text-gray-600"></i>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 disabled:hover:scale-100"
              >
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
