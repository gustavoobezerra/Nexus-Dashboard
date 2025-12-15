// Feito por Gustavo Bezerra
import { useStore } from '@/hooks/useStore';
import type { ViewType } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { view, setView, toggleTheme, theme, toggleChat, clearAllData, stats } = useStore();

  const menuItems: { id: ViewType; icon: string; label: string }[] = [
    { id: 'dashboard', icon: 'chart-pie', label: 'Dashboard' },
    { id: 'forecast', icon: 'chart-line', label: 'Previsões' },
  ];

  const handleNavClick = (viewId: ViewType) => {
    setView(viewId);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:z-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <i className="fa-solid fa-chart-line text-white"></i>
              </div>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-white">Nexus</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Dashboard v4.0</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  view === item.id
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <i className={`fa-solid fa-${item.icon} w-5`}></i>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-slate-800 space-y-2">
            <button
              onClick={toggleChat}
              disabled={!stats}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <i className="fa-solid fa-robot w-5"></i>
              <span className="font-medium">Assistente IA</span>
            </button>

            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <i className={`fa-solid fa-${theme === 'dark' ? 'sun' : 'moon'} w-5`}></i>
              <span className="font-medium">{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
            </button>

            <button
              onClick={clearAllData}
              disabled={!stats}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <i className="fa-solid fa-trash w-5"></i>
              <span className="font-medium">Limpar Dados</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
