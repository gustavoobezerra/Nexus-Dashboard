// Feito por Gustavo Bezerra - Melhorado com design premium
import { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useStore } from '@/hooks/useStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CHART_COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#ef4444', // Red
  '#84cc16', // Lime
];

interface ChartProps {
  type: 'line' | 'bar' | 'doughnut';
  title: string;
  labels: string[];
  datasets: {
    label: string;
    data: (number | null)[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderDash?: number[];
    fill?: boolean;
  }[];
  height?: number;
  showAnalyzeButton?: boolean;
  onAnalyze?: () => void;
}

export function Chart({ 
  type, 
  title, 
  labels, 
  datasets, 
  height = 300,
  showAnalyzeButton = true,
  onAnalyze 
}: ChartProps) {
  const { theme, toggleChat } = useStore();
  const chartRef = useRef<ChartJS | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const isDark = theme === 'dark';
  const textColor = isDark ? '#e2e8f0' : '#374151';
  const gridColor = isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(229, 231, 235, 0.8)';
  const tooltipBg = isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const tooltipBorder = isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)';

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart' as const,
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { 
          color: textColor, 
          padding: 16, 
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12,
            weight: 500,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: tooltipBg,
        titleColor: isDark ? '#f1f5f9' : '#1f2937',
        bodyColor: isDark ? '#cbd5e1' : '#4b5563',
        borderColor: tooltipBorder,
        borderWidth: 1,
        cornerRadius: 12,
        padding: 14,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: {
          size: 13,
          weight: 600,
        },
        bodyFont: {
          size: 12,
        },
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
    },
  };

  const lineBarOptions: ChartOptions<'line'> | ChartOptions<'bar'> = {
    ...commonOptions,
    scales: {
      x: { 
        grid: { 
          color: gridColor,
        }, 
        ticks: { 
          color: textColor, 
          maxRotation: 45, 
          minRotation: 0,
          font: {
            size: 11,
          },
          padding: 8,
        },
        border: {
          display: false,
        },
      },
      y: { 
        grid: { 
          color: gridColor,
        }, 
        ticks: { 
          color: textColor,
          font: {
            size: 11,
          },
          padding: 12,
          callback: function(value: any) {
            if (value >= 1000) {
              return (value / 1000).toFixed(0) + 'k';
            }
            return value;
          }
        }, 
        beginAtZero: true,
        border: {
          display: false,
        },
      },
    },
  };

  const doughnutOptions: ChartOptions<'doughnut'> = {
    ...commonOptions,
    cutout: '70%',
    plugins: {
      ...commonOptions.plugins,
      tooltip: {
        ...commonOptions.plugins.tooltip,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${new Intl.NumberFormat('pt-BR', { 
              style: 'currency', 
              currency: 'BRL' 
            }).format(value)} (${percentage}%)`;
          }
        }
      }
    },
  };

  // Processar datasets com cores premium
  const processedDatasets = datasets.map((dataset, index) => {
    const baseColor = CHART_COLORS[index % CHART_COLORS.length];
    
    if (type === 'line') {
      return {
        ...dataset,
        borderColor: dataset.borderColor || baseColor,
        backgroundColor: dataset.fill !== false ? `${baseColor}20` : 'transparent',
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: baseColor,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        tension: 0.4,
        fill: dataset.fill !== false,
      };
    }
    
    if (type === 'bar') {
      return {
        ...dataset,
        backgroundColor: Array.isArray(dataset.backgroundColor) 
          ? dataset.backgroundColor.map((_, i) => CHART_COLORS[i % CHART_COLORS.length])
          : baseColor,
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: Array.isArray(dataset.backgroundColor)
          ? dataset.backgroundColor.map((_, i) => `${CHART_COLORS[i % CHART_COLORS.length]}cc`)
          : `${baseColor}cc`,
      };
    }
    
    if (type === 'doughnut') {
      return {
        ...dataset,
        backgroundColor: CHART_COLORS.slice(0, dataset.data.length),
        borderColor: isDark ? '#0f172a' : '#ffffff',
        borderWidth: 3,
        hoverOffset: 8,
        hoverBorderWidth: 0,
      };
    }
    
    return dataset;
  });

  const data: ChartData<'line' | 'bar' | 'doughnut'> = { 
    labels, 
    datasets: processedDatasets as any 
  };

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  const chartStyle = { height: `${height}px` };

  const handleAnalyze = () => {
    if (onAnalyze) {
      onAnalyze();
    } else {
      toggleChat();
    }
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line data={data as ChartData<'line'>} options={lineBarOptions as ChartOptions<'line'>} />;
      case 'bar':
        return <Bar data={data as ChartData<'bar'>} options={lineBarOptions as ChartOptions<'bar'>} />;
      case 'doughnut':
        return <Doughnut data={data as ChartData<'doughnut'>} options={doughnutOptions} />;
      default:
        return null;
    }
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header do gráfico */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
            type === 'line' 
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600' 
              : type === 'bar'
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
              : 'bg-gradient-to-br from-pink-500 to-rose-600'
          } ${isHovered ? 'scale-110 shadow-lg' : ''}`}>
            <i className={`fa-solid ${
              type === 'line' ? 'fa-chart-line' : 
              type === 'bar' ? 'fa-chart-bar' : 
              'fa-chart-pie'
            } text-white text-sm`}></i>
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        
        {showAnalyzeButton && (
          <button
            onClick={handleAnalyze}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              isHovered 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 scale-105' 
                : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
            }`}
          >
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            <span>Analisar</span>
          </button>
        )}
      </div>

      {/* Container do gráfico */}
      <div 
        style={chartStyle} 
        className={`transition-all duration-300 ${isHovered ? 'scale-[1.01]' : ''}`}
      >
        {renderChart()}
      </div>
    </div>
  );
}
