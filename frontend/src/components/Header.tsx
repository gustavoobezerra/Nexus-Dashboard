// Feito por Gustavo Bezerra
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

  const filterButtons: { value: DateFilterType; label: string }[] = [
    { value: 7, label: '7D' },
    { value: 30, label: '30D' },
    { value: 'all', label: 'Todos' },
  ];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-3 sticky top-0 z-30">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <i className="fa-solid fa-bars text-gray-600 dark:text-gray-400"></i>
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <i className="fa-solid fa-upload"></i>
              <span className="hidden sm:inline">Importar CSV</span>
            </button>
            <button
              onClick={onSampleData}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
            >
              <i className="fa-solid fa-database"></i>
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

        {stats && (
          <div className="flex items-center gap-2 sm:ml-auto">
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">Período:</span>
            <div className="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
              {filterButtons.map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setDateFilter(btn.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    dateFilter === btn.value
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
