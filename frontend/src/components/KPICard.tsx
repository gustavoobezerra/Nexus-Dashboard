// Feito por Gustavo Bezerra - Design Premium com Glassmorphism
import { useState } from 'react';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';

interface KPICardProps {
  icon: string;
  label: string;
  value: number | string;
  trend?: number;
  format?: 'currency' | 'number' | 'percentage' | 'text';
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'blue' | 'purple' | 'cyan' | 'teal';
  subtitle?: string;
}

const colorConfig = {
  indigo: {
    gradient: 'from-indigo-500 to-purple-600',
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    glow: 'shadow-indigo-500/20',
    border: 'border-indigo-500/20',
    iconBg: 'bg-gradient-to-br from-indigo-500 to-purple-600',
  },
  emerald: {
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    glow: 'shadow-emerald-500/20',
    border: 'border-emerald-500/20',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
  },
  amber: {
    gradient: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    glow: 'shadow-amber-500/20',
    border: 'border-amber-500/20',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
  },
  rose: {
    gradient: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-600 dark:text-rose-400',
    glow: 'shadow-rose-500/20',
    border: 'border-rose-500/20',
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600',
  },
  blue: {
    gradient: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    glow: 'shadow-blue-500/20',
    border: 'border-blue-500/20',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
  },
  purple: {
    gradient: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400',
    glow: 'shadow-purple-500/20',
    border: 'border-purple-500/20',
    iconBg: 'bg-gradient-to-br from-purple-500 to-violet-600',
  },
  cyan: {
    gradient: 'from-cyan-500 to-blue-600',
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    text: 'text-cyan-600 dark:text-cyan-400',
    glow: 'shadow-cyan-500/20',
    border: 'border-cyan-500/20',
    iconBg: 'bg-gradient-to-br from-cyan-500 to-blue-600',
  },
  teal: {
    gradient: 'from-teal-500 to-emerald-600',
    bg: 'bg-teal-500/10 dark:bg-teal-500/20',
    text: 'text-teal-600 dark:text-teal-400',
    glow: 'shadow-teal-500/20',
    border: 'border-teal-500/20',
    iconBg: 'bg-gradient-to-br from-teal-500 to-emerald-600',
  },
};

export function KPICard({ 
  icon, 
  label, 
  value, 
  trend, 
  format = 'text', 
  color = 'indigo',
  subtitle 
}: KPICardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const config = colorConfig[color];

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
    <div 
      className={`
        relative overflow-hidden
        bg-white/80 dark:bg-slate-900/80 
        backdrop-blur-xl
        p-5 sm:p-6 
        rounded-2xl 
        border border-gray-200/50 dark:border-slate-700/50
        transition-all duration-500 ease-out
        ${isHovered ? `shadow-xl ${config.glow} scale-[1.02] -translate-y-1` : 'shadow-sm'}
        group cursor-default
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Efeito de brilho no hover */}
      <div className={`
        absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
        bg-gradient-to-br ${config.gradient}
      `} style={{ opacity: isHovered ? 0.03 : 0 }} />

      {/* Círculo decorativo de fundo */}
      <div className={`
        absolute -right-8 -top-8 w-32 h-32 rounded-full
        bg-gradient-to-br ${config.gradient}
        opacity-5 group-hover:opacity-10 
        transition-all duration-500
        ${isHovered ? 'scale-150' : 'scale-100'}
      `} />

      <div className="relative flex items-start gap-4">
        {/* Ícone com gradiente */}
        <div className={`
          relative w-12 h-12 sm:w-14 sm:h-14 
          rounded-2xl 
          ${config.iconBg}
          flex items-center justify-center
          shadow-lg ${config.glow}
          transition-all duration-500
          ${isHovered ? 'scale-110 rotate-3' : ''}
        `}>
          <i className={`fa-solid fa-${icon} text-white text-lg sm:text-xl`}></i>
          
          {/* Brilho interno do ícone */}
          <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 truncate">
            {label}
          </p>
          
          <p className={`
            text-xl sm:text-2xl lg:text-3xl font-bold 
            text-gray-900 dark:text-white 
            truncate
            transition-all duration-300
            ${isHovered ? 'tracking-tight' : ''}
          `}>
            {formatValue()}
          </p>

          {/* Trend indicator */}
          {trend !== undefined && (
            <div className={`
              inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-semibold
              transition-all duration-300
              ${trend >= 0 
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }
              ${isHovered ? 'scale-105' : ''}
            `}>
              <i className={`fa-solid fa-arrow-${trend >= 0 ? 'up' : 'down'} text-[10px]`}></i>
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}

          {subtitle && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Linha de destaque inferior */}
      <div className={`
        absolute bottom-0 left-0 right-0 h-1
        bg-gradient-to-r ${config.gradient}
        transform origin-left transition-transform duration-500
        ${isHovered ? 'scale-x-100' : 'scale-x-0'}
      `} />
    </div>
  );
}
