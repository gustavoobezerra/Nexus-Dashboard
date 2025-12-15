// Feito por Gustavo Bezerra
import { useCallback } from 'react';
import { useStore } from './useStore';
import type { SalesData, Stats, TimeSeriesData } from '@/types';

export function useStats() {
  const { setStats, setTimeSeriesData, setCurrentData, fullData, filters, dateFilter } = useStore();

  const calculateStats = useCallback((data: SalesData[]): Stats => {
    const totalRev = data.reduce((sum, item) => sum + item.value, 0);
    const counts: Record<string, number> = {};
    const payments: Record<string, number> = {};
    const statusCount: Record<string, number> = {};
    const dateMap: Record<string, number> = {};
    const productSales: Record<string, { qty: number; total: number }> = {};

    data.forEach((d) => {
      counts[d.category] = (counts[d.category] || 0) + d.value;
      payments[d.payment] = (payments[d.payment] || 0) + 1;
      statusCount[d.status] = (statusCount[d.status] || 0) + 1;
      dateMap[d.date] = (dateMap[d.date] || 0) + d.value;

      if (!productSales[d.product]) {
        productSales[d.product] = { qty: 0, total: 0 };
      }
      productSales[d.product].qty += 1;
      productSales[d.product].total += d.value;
    });

    const sortedCategories = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const topCat = sortedCategories[0]?.[0] || '-';
    const topCatValue = sortedCategories[0]?.[1] || 0;
    const topCatShare = totalRev > 0 ? (topCatValue / totalRev) * 100 : 0;

    const topProducts = Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const dates = data.map((d) => d.date).sort();

    return {
      revenue: totalRev,
      sales: data.length,
      avgTicket: data.length > 0 ? totalRev / data.length : 0,
      topCategory: topCat,
      topCategoryShare: topCatShare,
      topProducts,
      payBreakdown: payments,
      statusBreakdown: statusCount,
      categoryBreakdown: counts,
      dailySales: dateMap,
      oldestDate: dates[0] || '',
      newestDate: dates[dates.length - 1] || '',
      trends: { revenue: 0, sales: 0, avgTicket: 0 },
    };
  }, []);

  const calculateTimeSeries = useCallback((data: SalesData[]): TimeSeriesData => {
    const uniqueDates = [...new Set(data.map((d) => d.date))].sort();
    const categories: Record<string, Record<string, number>> = {};
    const payments: Record<string, Record<string, number>> = {};
    const status: Record<string, Record<string, number>> = {};

    data.forEach((d) => {
      if (!categories[d.category]) categories[d.category] = {};
      categories[d.category][d.date] = (categories[d.category][d.date] || 0) + d.value;

      if (!payments[d.payment]) payments[d.payment] = {};
      payments[d.payment][d.date] = (payments[d.payment][d.date] || 0) + d.value;

      if (!status[d.status]) status[d.status] = {};
      status[d.status][d.date] = (status[d.status][d.date] || 0) + 1;
    });

    return { dates: uniqueDates, categories, payments, status };
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...fullData];

    if (dateFilter !== 'all' && dateFilter !== 'custom' && filtered.length > 0) {
      const sortedDates = filtered.map((d) => d.date).sort();
      const mostRecent = new Date(sortedDates[sortedDates.length - 1]);
      const startDate = new Date(mostRecent);
      startDate.setDate(startDate.getDate() - (dateFilter as number) + 1);

      filtered = filtered.filter((d) => {
        const itemDate = new Date(d.date);
        return itemDate >= startDate && itemDate <= mostRecent;
      });
    }

    if (filters.dateStart) {
      filtered = filtered.filter((d) => d.date >= filters.dateStart!);
    }
    if (filters.dateEnd) {
      filtered = filtered.filter((d) => d.date <= filters.dateEnd!);
    }
    if (filters.category) {
      filtered = filtered.filter((d) => d.category === filters.category);
    }
    if (filters.product) {
      filtered = filtered.filter((d) => d.product === filters.product);
    }
    if (filters.payment) {
      filtered = filtered.filter((d) => d.payment === filters.payment);
    }
    if (filters.status) {
      filtered = filtered.filter((d) => d.status === filters.status);
    }
    if (filters.valueMin !== null) {
      filtered = filtered.filter((d) => d.value >= filters.valueMin!);
    }
    if (filters.valueMax !== null) {
      filtered = filtered.filter((d) => d.value <= filters.valueMax!);
    }

    setCurrentData(filtered);
    setStats(calculateStats(filtered));
    setTimeSeriesData(calculateTimeSeries(filtered));
  }, [fullData, filters, dateFilter, setCurrentData, setStats, setTimeSeriesData, calculateStats, calculateTimeSeries]);

  return { calculateStats, calculateTimeSeries, applyFilters };
}
