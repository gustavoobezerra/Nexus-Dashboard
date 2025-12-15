// Feito por Gustavo Bezerra - Dashboard Premium
import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { KPICard } from '@/components/KPICard';
import { Chart } from '@/components/Chart';
import { formatDateShort, formatCurrency } from '@/utils/formatters';

const CHART_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

export function Dashboard() {
  const { stats, timeSeriesData } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');

  if (!stats || !timeSeriesData) return null;

  const lineChartData = {
    labels: timeSeriesData.dates.map(formatDateShort),
    datasets: [{
      label: 'Vendas Diárias',
      data: timeSeriesData.dates.map((d) => stats.dailySales[d] || 0),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
    }],
  };

  const categoryData = {
    labels: Object.keys(stats.categoryBreakdown).slice(0, 6),
    datasets: [{
      label: 'Por Categoria',
      data: Object.values(stats.categoryBreakdown).slice(0, 6),
      backgroundColor: CHART_COLORS,
    }],
  };

  const paymentData = {
    labels: Object.keys(stats.payBreakdown),
    datasets: [{
      label: 'Pagamentos',
      data: Object.values(stats.payBreakdown),
      backgroundColor: CHART_COLORS,
    }],
  };

  const statusData = {
    labels: Object.keys(stats.statusBreakdown),
    datasets: [{
      label: 'Status',
      data: Object.values(stats.statusBreakdown),
      backgroundColor: CHART_COLORS,
    }],
  };

  // Calcular métricas adicionais
  const totalTransactions = stats.sales;
  const avgDailySales = stats.revenue / (timeSeriesData.dates.length || 1);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* Header Section com gradiente */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 sm:p-8">
        {/* Padrão de fundo animado */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Círculos decorativos */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <i className="fa-solid fa-chart-line text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Dashboard Analítico
              </h1>
              <p className="text-white/80 text-sm sm:text-base">
                Visão completa e inteligente do desempenho do seu negócio
              </p>
            </div>
          </div>
          
          {/* Quick stats no header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4">
              <p className="text-white/70 text-xs sm:text-sm">Período</p>
              <p className="text-white font-semibold text-sm sm:text-base">
                {timeSeriesData.dates.length} dias
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4">
              <p className="text-white/70 text-xs sm:text-sm">Transações</p>
              <p className="text-white font-semibold text-sm sm:text-base">
                {totalTransactions.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4">
              <p className="text-white/70 text-xs sm:text-sm">Média/Dia</p>
              <p className="text-white font-semibold text-sm sm:text-base">
                {formatCurrency(avgDailySales)}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4">
              <p className="text-white/70 text-xs sm:text-sm">Categorias</p>
              <p className="text-white font-semibold text-sm sm:text-base">
                {Object.keys(stats.categoryBreakdown).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KPICard
          icon="dollar-sign"
          label="Receita Total"
          value={stats.revenue}
          format="currency"
          color="indigo"
          trend={stats.trends.revenue}
        />
        <KPICard
          icon="cart-shopping"
          label="Total Vendas"
          value={stats.sales}
          format="number"
          color="emerald"
          trend={stats.trends.sales}
        />
        <KPICard
          icon="receipt"
          label="Ticket Médio"
          value={stats.avgTicket}
          format="currency"
          color="amber"
          trend={stats.trends.avgTicket}
        />
        <KPICard
          icon="crown"
          label="Top Categoria"
          value={`${stats.topCategory} (${stats.topCategoryShare.toFixed(0)}%)`}
          format="text"
          color="rose"
        />
      </div>

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Gráfico de Tendência */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300">
          <Chart
            type="line"
            title={`Tendência de Vendas (Últimos ${timeSeriesData.dates.length} Dias)`}
            labels={lineChartData.labels}
            datasets={lineChartData.datasets}
            height={300}
          />
        </div>

        {/* Gráfico de Categorias */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300">
          <Chart
            type="bar"
            title="Vendas por Categoria"
            labels={categoryData.labels}
            datasets={categoryData.datasets}
            height={300}
          />
        </div>

        {/* Gráfico de Pagamentos */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300">
          <Chart
            type="doughnut"
            title="Métodos de Pagamento"
            labels={paymentData.labels}
            datasets={paymentData.datasets}
            height={300}
          />
        </div>

        {/* Gráfico de Status */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300">
          <Chart
            type="doughnut"
            title="Status dos Pedidos"
            labels={statusData.labels}
            datasets={statusData.datasets}
            height={300}
          />
        </div>
      </div>

      {/* Tabela de Top Produtos */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <i className="fa-solid fa-trophy text-white"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Top 5 Produtos
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Produtos com melhor desempenho
              </p>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="hidden sm:flex bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'overview'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Resumo
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'details'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Detalhes
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-slate-700">
                <th className="pb-4 pr-4 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  #
                </th>
                <th className="pb-4 pr-4 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Produto
                </th>
                <th className="pb-4 pr-4 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
                  Quantidade
                </th>
                <th className="pb-4 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                  Total
                </th>
                {activeTab === 'details' && (
                  <th className="pb-4 pl-4 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                    % do Total
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {stats.topProducts.map((product, idx) => {
                const percentage = (product.total / stats.revenue) * 100;
                const medals = ['🥇', '🥈', '🥉'];
                
                return (
                  <tr 
                    key={idx} 
                    className="border-b border-gray-100 dark:border-slate-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="py-4 pr-4">
                      {idx < 3 ? (
                        <span className="text-xl">{medals[idx]}</span>
                      ) : (
                        <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400">
                          {idx + 1}
                        </span>
                      )}
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                          idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                          idx === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                          'bg-gray-100 dark:bg-slate-800'
                        }`}>
                          <i className={`fa-solid fa-box text-sm ${
                            idx < 3 ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                          }`}></i>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                        {product.qty.toLocaleString('pt-BR')}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(product.total)}
                      </span>
                    </td>
                    {activeTab === 'details' && (
                      <td className="py-4 pl-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
