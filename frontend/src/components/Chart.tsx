// Feito por Gustavo Bezerra
import { useEffect, useRef } from 'react';
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
}

export function Chart({ type, title, labels, datasets, height = 300 }: ChartProps) {
  const { theme } = useStore();
  const chartRef = useRef<ChartJS | null>(null);

  const isDark = theme === 'dark';
  const textColor = isDark ? '#e2e8f0' : '#374151';
  const gridColor = isDark ? '#334155' : '#e5e7eb';

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: textColor, padding: 12, usePointStyle: true },
      },
      title: {
        display: true,
        text: title,
        color: textColor,
        font: { size: 14, weight: 'bold' as const },
      },
    },
  };

  const lineBarOptions: ChartOptions<'line'> | ChartOptions<'bar'> = {
    ...commonOptions,
    scales: {
      x: { grid: { color: gridColor }, ticks: { color: textColor, maxRotation: 45, minRotation: 0 } },
      y: { grid: { color: gridColor }, ticks: { color: textColor }, beginAtZero: true },
    },
  };

  const doughnutOptions: ChartOptions<'doughnut'> = {
    ...commonOptions,
    cutout: '60%',
  };

  const data = { labels, datasets };

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  const chartStyle = { height: `${height}px` };

  switch (type) {
    case 'line':
      return (
        <div style={chartStyle}>
          <Line data={data} options={lineBarOptions as ChartOptions<'line'>} />
        </div>
      );
    case 'bar':
      return (
        <div style={chartStyle}>
          <Bar data={data} options={lineBarOptions as ChartOptions<'bar'>} />
        </div>
      );
    case 'doughnut':
      return (
        <div style={chartStyle}>
          <Doughnut data={data} options={doughnutOptions} />
        </div>
      );
    default:
      return null;
  }
}
