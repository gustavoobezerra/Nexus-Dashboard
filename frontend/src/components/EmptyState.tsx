// Feito por Gustavo Bezerra

interface EmptyStateProps {
  onSampleData: () => void;
}

export function EmptyState({ onSampleData }: EmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
          <i className="fa-solid fa-chart-pie text-4xl text-indigo-600 dark:text-indigo-400"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Bem-vindo ao Nexus Dashboard
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Importe seus dados CSV ou use os dados de demonstração para começar a explorar insights poderosos.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onSampleData}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
          >
            <i className="fa-solid fa-play"></i>
            Carregar Dados Demo
          </button>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <i className="fa-solid fa-chart-line text-emerald-600 dark:text-emerald-400"></i>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Gráficos Interativos</p>
          </div>
          <div>
            <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <i className="fa-solid fa-robot text-purple-600 dark:text-purple-400"></i>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Assistente IA</p>
          </div>
          <div>
            <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <i className="fa-solid fa-wand-magic-sparkles text-amber-600 dark:text-amber-400"></i>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Previsões</p>
          </div>
        </div>
      </div>
    </div>
  );
}
