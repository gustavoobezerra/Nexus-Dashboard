// Feito por Gustavo Bezerra - Forecast Premium
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
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
            <i className="fa-solid fa-chart-line text-4xl text-purple-600 dark:text-purple-400"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Previsões Inteligentes
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Carregue dados para visualizar previsões baseadas em análise de tendências
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
        fill: true,
      },
      {
        label: 'Previsão',
        data: forecastPadded,
        borderColor: '#ec4899',
        backgroundColor: 'transparent',
        borderDash: [8, 4],
        fill: false,
      },
    ],
  };

  const kpiCards = [
    {
      icon: 'chart-line',
      label: 'Previsão Total (7 dias)',
      value: forecastData.totalForecast,
      gradient: 'from-purple-500 to-violet-600',
      shadow: 'shadow-purple-500/20',
    },
    {
      icon: 'calculator',
      label: 'Média Diária Prevista',
      value: forecastData.avgForecast,
      gradient: 'from-blue-500 to-cyan-600',
      shadow: 'shadow-blue-500/20',
    },
    {
      icon: forecastData.growth >= 0 ? 'arrow-trend-up' : 'arrow-trend-down',
      label: 'Tendência',
      value: forecastData.growth,
      isPercentage: true,
      gradient: forecastData.growth >= 0 ? 'from-emerald-500 to-teal-600' : 'from-red-500 to-rose-600',
      shadow: forecastData.growth >= 0 ? 'shadow-emerald-500/20' : 'shadow-red-500/20',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 p-6 sm:p-8">
        {/* Padrão de fundo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Círculos decorativos */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <i className="fa-solid fa-wand-magic-sparkles text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Previsões Inteligentes
              </h1>
              <p className="text-white/80 text-sm sm:text-base">
                Análise preditiva baseada em tendências históricas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {kpiCards.map((card) => (
          <div 
            key={card.label}
            className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 group"
          >
            {/* Background gradient on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            
            {/* Decorative circle */}
            <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full bg-gradient-to-br ${card.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg ${card.shadow}`}>
                  <i className={`fa-solid fa-${card.icon} text-white`}></i>
                </div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {card.label}
                </span>
              </div>
              
              <p className={`text-2xl sm:text-3xl font-bold ${
                card.isPercentage 
                  ? forecastData.growth >= 0 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-red-600 dark:text-red-400'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {card.isPercentage 
                  ? `${forecastData.growth >= 0 ? '+' : ''}${forecastData.growth.toFixed(1)}%`
                  : formatCurrency(card.value as number)
                }
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300">
        <Chart
          type="line"
          title="Previsão de Vendas (Próximos 7 Dias)"
          labels={chartData.labels}
          datasets={chartData.datasets}
          height={380}
        />
      </div>

      {/* Forecast Table */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <i className="fa-solid fa-calendar-days text-white"></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Detalhamento da Previsão
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Projeção diária para os próximos 7 dias
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-slate-700">
                <th className="pb-4 pr-4 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Dia
                </th>
                <th className="pb-4 pr-4 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Data
                </th>
                <th className="pb-4 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                  Previsão
                </th>
                <th className="pb-4 pl-4 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                  % da Média
                </th>
              </tr>
            </thead>
            <tbody>
              {forecastData.futureDates.map((date, idx) => {
                const dayOfWeek = DateTime.fromISO(date).toFormat('ccc', { locale: 'pt-BR' });
                const formattedDate = DateTime.fromISO(date).toFormat('dd/MM/yyyy');
                const percentOfAvg = (forecastData.forecastValues[idx] / forecastData.avgForecast) * 100;
                const isAboveAvg = percentOfAvg >= 100;
                
                return (
                  <tr 
                    key={date} 
                    className="border-b border-gray-100 dark:border-slate-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="py-4 pr-4">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-semibold text-sm">
                        {dayOfWeek}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-gray-900 dark:text-white font-medium">
                        {formattedDate}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        {formatCurrency(forecastData.forecastValues[idx])}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              isAboveAvg 
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                                : 'bg-gradient-to-r from-amber-500 to-orange-500'
                            }`}
                            style={{ width: `${Math.min(percentOfAvg, 100)}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium w-14 text-right ${
                          isAboveAvg 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-amber-600 dark:text-amber-400'
                        }`}>
                          {percentOfAvg.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <i className="fa-solid fa-info text-white"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Metodologia de Previsão
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Média móvel ponderada com análise de tendência
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-gray-600 dark:text-gray-400">Histórico</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-500" />
                <span className="text-gray-600 dark:text-gray-400">Previsão</span>
              </div>
            </div>
          </div>
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
