// Feito por Gustavo Bezerra - Sidebar Premium
import { useStore } from '@/hooks/useStore';
import type { ViewType } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { view, setView, toggleTheme, theme, toggleChat, clearAllData, stats } = useStore();

  const menuItems: { id: ViewType; icon: string; label: string; description: string }[] = [
    { id: 'dashboard', icon: 'chart-pie', label: 'Dashboard', description: 'Visão geral' },
    { id: 'forecast', icon: 'chart-line', label: 'Previsões', description: 'Análise preditiva' },
  ];

  const handleNavClick = (viewId: ViewType) => {
    setView(viewId);
    onClose();
  };

  return (
    <>
      {/* Overlay com blur */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-slate-700/50 z-50 transform transition-all duration-300 ease-out ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:z-0 lg:shadow-none`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-5 border-b border-gray-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <i className="fa-solid fa-chart-line text-white text-xl"></i>
                </div>
                {/* Pulse effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-ping opacity-20" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Nexus
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Dashboard v4.0
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <p className="px-4 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Menu Principal
            </p>
            
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                  view === item.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  view === item.id
                    ? 'bg-white/20'
                    : 'bg-gray-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30'
                }`}>
                  <i className={`fa-solid fa-${item.icon} ${
                    view === item.id 
                      ? 'text-white' 
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                  } transition-colors`}></i>
                </div>
                <div className="text-left">
                  <span className={`font-semibold block ${
                    view === item.id ? 'text-white' : ''
                  }`}>
                    {item.label}
                  </span>
                  <span className={`text-xs ${
                    view === item.id ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {item.description}
                  </span>
                </div>
                {view === item.id && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  </div>
                )}
              </button>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-200/50 dark:border-slate-700/50 space-y-2">
            <p className="px-4 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Ferramentas
            </p>
            
            {/* Assistente IA */}
            <button
              onClick={toggleChat}
              disabled={!stats}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 dark:hover:from-purple-500/20 dark:hover:to-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-disabled:shadow-none group-disabled:opacity-50">
                <i className="fa-solid fa-robot text-white"></i>
              </div>
              <div className="text-left">
                <span className="font-medium block group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Assistente IA
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Análise inteligente
                </span>
              </div>
              {stats && (
                <div className="ml-auto">
                  <span className="px-2 py-1 text-[10px] font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                    AI
                  </span>
                </div>
              )}
            </button>

            {/* Tema */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800/80 transition-all duration-300 group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                theme === 'dark' 
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20' 
                  : 'bg-gradient-to-br from-slate-700 to-slate-900 shadow-lg shadow-slate-500/20'
              }`}>
                <i className={`fa-solid fa-${theme === 'dark' ? 'sun' : 'moon'} text-white transition-transform duration-500 ${
                  theme === 'dark' ? 'rotate-0' : 'rotate-180'
                }`}></i>
              </div>
              <div className="text-left">
                <span className="font-medium block">
                  {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Alternar aparência
                </span>
              </div>
            </button>

            {/* Limpar Dados */}
            <button
              onClick={clearAllData}
              disabled={!stats}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors group-disabled:opacity-50">
                <i className="fa-solid fa-trash text-red-500 dark:text-red-400"></i>
              </div>
              <div className="text-left">
                <span className="font-medium block">Limpar Dados</span>
                <span className="text-xs text-red-400 dark:text-red-500">
                  Remover todos os dados
                </span>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
              <span>Feito com</span>
              <i className="fa-solid fa-heart text-red-500 animate-pulse"></i>
              <span>por Gustavo Bezerra</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
