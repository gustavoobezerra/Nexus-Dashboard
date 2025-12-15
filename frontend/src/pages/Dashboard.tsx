// Feito por Gustavo Bezerra
import { useStore } from '@/hooks/useStore';
import { KPICard } from '@/components/KPICard';
import { Chart } from '@/components/Chart';
import { formatDateShort } from '@/utils/formatters';

const CHART_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];

export function Dashboard() {
  const { stats, timeSeriesData } = useStore();

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
    labels: Object.keys(stats.categoryBreakdown).slice(0, 5),
    datasets: [{
      label: 'Por Categoria',
      data: Object.values(stats.categoryBreakdown).slice(0, 5),
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

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
          <Chart
            type="line"
            title="Tendência de Vendas"
            labels={lineChartData.labels}
            datasets={lineChartData.datasets}
            height={280}
          />
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
          <Chart
            type="bar"
            title="Vendas por Categoria"
            labels={categoryData.labels}
            datasets={categoryData.datasets}
            height={280}
          />
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
          <Chart
            type="doughnut"
            title="Métodos de Pagamento"
            labels={paymentData.labels}
            datasets={paymentData.datasets}
            height={280}
          />
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
          <Chart
            type="doughnut"
            title="Status dos Pedidos"
            labels={statusData.labels}
            datasets={statusData.datasets}
            height={280}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Top 5 Produtos
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-slate-700">
                <th className="pb-3 font-medium">Produto</th>
                <th className="pb-3 font-medium text-right">Qtd</th>
                <th className="pb-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {stats.topProducts.map((product, idx) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-slate-800 last:border-0">
                  <td className="py-3 text-sm text-gray-900 dark:text-white">{product.name}</td>
                  <td className="py-3 text-sm text-gray-600 dark:text-gray-400 text-right">{product.qty}</td>
                  <td className="py-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 text-right">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
