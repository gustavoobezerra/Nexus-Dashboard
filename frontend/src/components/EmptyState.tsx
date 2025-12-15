// Feito por Gustavo Bezerra - Empty State Premium

interface EmptyStateProps {
  onSampleData: () => void;
}

export function EmptyState({ onSampleData }: EmptyStateProps) {
  const features = [
    {
      icon: 'chart-line',
      title: 'Gráficos Interativos',
      description: 'Visualizações dinâmicas e responsivas',
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/20',
    },
    {
      icon: 'robot',
      title: 'Assistente IA',
      description: 'Análises inteligentes com Gemini',
      color: 'from-purple-500 to-pink-600',
      shadow: 'shadow-purple-500/20',
    },
    {
      icon: 'wand-magic-sparkles',
      title: 'Previsões',
      description: 'Projeções baseadas em dados',
      color: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/20',
    },
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
      <div className="text-center max-w-2xl">
        {/* Animated Logo */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-spin-slow opacity-20 blur-xl" />
          
          {/* Inner circle */}
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center shadow-2xl">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse">
              <i className="fa-solid fa-chart-pie text-4xl text-white"></i>
            </div>
          </div>
          
          {/* Floating particles */}
          <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="absolute -bottom-2 -left-2 w-3 h-3 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-1/2 -right-4 w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '1s' }} />
        </div>

        {/* Title */}
        <h2 className="text-3xl sm:text-4xl font-bold mb-3">
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            Bem-vindo ao Nexus
          </span>
        </h2>
        
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Importe seus dados CSV ou use os dados de demonstração para começar a explorar insights poderosos.
        </p>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={onSampleData}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-2xl font-semibold text-lg transition-all duration-300 shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-105"
          >
            <i className="fa-solid fa-play group-hover:animate-pulse"></i>
            <span>Carregar Dados Demo</span>
            
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 blur-2xl opacity-0 group-hover:opacity-40 transition-opacity -z-10" />
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg ${feature.shadow} group-hover:scale-110 transition-transform duration-300`}>
                <i className={`fa-solid fa-${feature.icon} text-white text-xl`}></i>
              </div>
              
              {/* Content */}
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {feature.description}
              </p>

              {/* Hover gradient overlay */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 flex items-center justify-center gap-6 text-sm text-gray-400 dark:text-gray-500">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-shield-check text-emerald-500"></i>
            <span>Dados seguros</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-bolt text-amber-500"></i>
            <span>Processamento rápido</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-cloud text-blue-500"></i>
            <span>100% local</span>
          </div>
        </div>
      </div>
    </div>
  );
}
