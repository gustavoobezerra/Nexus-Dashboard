// Feito por Gustavo Bezerra
import { useMemo } from 'react';
import { useStore } from '@/hooks/useStore';
import { Chart } from '@/components/Chart';
import { formatDateShort, formatCurrency } from '@/utils/formatters';
import { DateTime } from 'luxon';

export function Forecast() {
  const { stats, timeSeriesData } = useStore();

  const forecastData = useMemo(() => {
    if (!stats || !timeSeriesData || timeSeriesData.dates.length < 3) {
      return null;
    }

    const dates = timeSeriesData.dates;
    const values = dates.map((d) => stats.dailySales[d] || 0);
    const forecastDays = 7;

    const forecast = calculateForecast(values, forecastDays);
    const lastDate = DateTime.fromISO(dates[dates.length - 1]);
    const futureDates = Array.from({ length: forecastDays }, (_, i) =>
      lastDate.plus({ days: i + 1 }).toISODate()!
    );

    const totalForecast = forecast.reduce((a, b) => a + b, 0);
    const avgForecast = totalForecast / forecastDays;
    const lastWeekAvg = values.slice(-7).reduce((a, b) => a + b, 0) / Math.min(7, values.length);
    const growth = lastWeekAvg > 0 ? ((avgForecast - lastWeekAvg) / lastWeekAvg) * 100 : 0;

    return {
      historicalDates: dates,
      historicalValues: values,
      futureDates,
      forecastValues: forecast,
      totalForecast,
      avgForecast,
      growth,
    };
  }, [stats, timeSeriesData]);

  if (!forecastData) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <i className="fa-solid fa-chart-line text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-600 dark:text-gray-400">
            Carregue dados para visualizar previsões
          </p>
        </div>
      </div>
    );
  }

  const allDates = [...forecastData.historicalDates, ...forecastData.futureDates];
  const historicalPadded = [...forecastData.historicalValues, ...Array(forecastData.futureDates.length).fill(null)];
  const forecastPadded = [
    ...Array(forecastData.historicalDates.length - 1).fill(null),
    forecastData.historicalValues[forecastData.historicalValues.length - 1],
    ...forecastData.forecastValues,
  ];

  const chartData = {
    labels: allDates.map(formatDateShort),
    datasets: [
      {
        label: 'Histórico',
        data: historicalPadded,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
      },
      {
        label: 'Previsão',
        data: forecastPadded,
        borderColor: '#ec4899',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
      },
    ],
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <i className="fa-solid fa-chart-line text-purple-600 dark:text-purple-400"></i>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Previsão Total (7 dias)</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(forecastData.totalForecast)}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <i className="fa-solid fa-calculator text-blue-600 dark:text-blue-400"></i>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Média Diária Prevista</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(forecastData.avgForecast)}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              forecastData.growth >= 0 
                ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              <i className={`fa-solid fa-arrow-trend-${forecastData.growth >= 0 ? 'up' : 'down'} ${
                forecastData.growth >= 0 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}></i>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Tendência</span>
          </div>
          <p className={`text-2xl font-bold ${
            forecastData.growth >= 0 
              ? 'text-emerald-600 dark:text-emerald-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {forecastData.growth >= 0 ? '+' : ''}{forecastData.growth.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
        <Chart
          type="line"
          title="Previsão de Vendas (Próximos 7 Dias)"
          labels={chartData.labels}
          datasets={chartData.datasets}
          height={350}
        />
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Detalhamento da Previsão
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-slate-700">
                <th className="pb-3 font-medium">Data</th>
                <th className="pb-3 font-medium text-right">Previsão</th>
              </tr>
            </thead>
            <tbody>
              {forecastData.futureDates.map((date, idx) => (
                <tr key={date} className="border-b border-gray-100 dark:border-slate-800 last:border-0">
                  <td className="py-3 text-sm text-gray-900 dark:text-white">
                    {DateTime.fromISO(date).toFormat('dd/MM/yyyy (ccc)', { locale: 'pt-BR' })}
                  </td>
                  <td className="py-3 text-sm font-medium text-purple-600 dark:text-purple-400 text-right">
                    {formatCurrency(forecastData.forecastValues[idx])}
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

function calculateForecast(values: number[], days: number): number[] {
  const n = values.length;
  if (n < 3) return Array(days).fill(values[n - 1] || 0);

  const window = Math.min(7, Math.floor(n / 2));
  const recentValues = values.slice(-window);
  const avg = recentValues.reduce((a, b) => a + b, 0) / window;

  let trend = 0;
  if (n >= 2) {
    const firstHalf = values.slice(0, Math.floor(n / 2));
    const secondHalf = values.slice(Math.floor(n / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    trend = (secondAvg - firstAvg) / firstAvg;
  }

  const forecast: number[] = [];
  for (let i = 0; i < days; i++) {
    const predicted = avg * (1 + trend * 0.1 * (i + 1));
    forecast.push(Math.max(0, predicted));
  }

  return forecast;
}
