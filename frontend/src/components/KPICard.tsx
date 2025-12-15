// Feito por Gustavo Bezerra
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';

interface KPICardProps {
  icon: string;
  label: string;
  value: number | string;
  trend?: number;
  format?: 'currency' | 'number' | 'percentage' | 'text';
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'blue' | 'purple';
}

export function KPICard({ icon, label, value, trend, format = 'text', color = 'indigo' }: KPICardProps) {
  const colorClasses = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  };

  const formatValue = () => {
    if (typeof value === 'string') return value;
    switch (format) {
      case 'currency': return formatCurrency(value);
      case 'number': return formatNumber(value);
      case 'percentage': return formatPercentage(value);
      default: return String(value);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <i className={`fa-solid fa-${icon} text-lg sm:text-xl`}></i>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{label}</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
            {formatValue()}
          </p>
          {trend !== undefined && (
            <p className={`text-xs ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              <i className={`fa-solid fa-arrow-${trend >= 0 ? 'up' : 'down'} mr-1`}></i>
              {Math.abs(trend).toFixed(1)}%
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
