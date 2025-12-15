// Feito por Gustavo Bezerra - Header Premium
import { useRef } from 'react';
import { useStore } from '@/hooks/useStore';
import type { DateFilterType } from '@/types';

interface HeaderProps {
  onMenuClick: () => void;
  onFileUpload: (file: File) => void;
  onSampleData: () => void;
}

export function Header({ onMenuClick, onFileUpload, onSampleData }: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { dateFilter, setDateFilter, stats } = useStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      e.target.value = '';
    }
  };

  const filterButtons: { value: DateFilterType; label: string; icon: string }[] = [
    { value: 7, label: '7D', icon: 'calendar-week' },
    { value: 30, label: '30D', icon: 'calendar' },
    { value: 'all', label: 'Todos', icon: 'calendar-check' },
  ];

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 px-4 sm:px-6 py-4 sticky top-0 z-30">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Menu Button (Mobile) */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <i className="fa-solid fa-bars text-gray-600 dark:text-gray-400"></i>
          </button>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3">
            {/* Import CSV Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="group relative flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-sm font-medium transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-105"
            >
              <i className="fa-solid fa-upload group-hover:animate-bounce"></i>
              <span className="hidden sm:inline">Importar CSV</span>
              
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 blur-xl opacity-0 group-hover:opacity-50 transition-opacity -z-10" />
            </button>

            {/* Demo Data Button */}
            <button
              onClick={onSampleData}
              className="group flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <i className="fa-solid fa-database text-indigo-500 group-hover:text-indigo-600 transition-colors"></i>
              <span className="hidden sm:inline">Dados Demo</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Right Section - Date Filter */}
        {stats && (
          <div className="flex items-center gap-3 sm:ml-auto">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 hidden sm:inline">
              Período:
            </span>
            
            <div className="flex bg-gray-100/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-1.5 shadow-inner">
              {filterButtons.map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setDateFilter(btn.value)}
                  className={`relative px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${
                    dateFilter === btn.value
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <span className="relative z-10">{btn.label}</span>
                  
                  {/* Active indicator */}
                  {dateFilter === btn.value && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500" />
                  )}
                </button>
              ))}
            </div>

            {/* Stats Badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-700/50">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                {stats.sales.toLocaleString('pt-BR')} registros
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
