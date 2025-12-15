// Feito por Gustavo Bezerra

export interface SalesData {
  id: string;
  date: string;
  category: string;
  product: string;
  value: number;
  payment: string;
  status: string;
}

export interface Stats {
  revenue: number;
  sales: number;
  avgTicket: number;
  topCategory: string;
  topCategoryShare: number;
  topProducts: ProductStat[];
  payBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  dailySales: Record<string, number>;
  oldestDate: string;
  newestDate: string;
  trends: TrendData;
}

export interface ProductStat {
  name: string;
  qty: number;
  total: number;
}

export interface TrendData {
  revenue: number;
  sales: number;
  avgTicket: number;
}

export interface TimeSeriesData {
  dates: string[];
  categories: Record<string, Record<string, number>>;
  payments: Record<string, Record<string, number>>;
  status: Record<string, Record<string, number>>;
}

export interface FilterState {
  dateStart: string | null;
  dateEnd: string | null;
  category: string;
  product: string;
  payment: string;
  status: string;
  valueMin: number | null;
  valueMax: number | null;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Template {
  name: string;
  icon: string;
  color: string;
  fields: TemplateField[];
  kpis: string[];
}

export interface TemplateField {
  key: string;
  label: string;
  required: boolean;
  patterns: string[];
}

export interface ColumnMapping {
  [key: string]: string;
}

export type ViewType = 'dashboard' | 'forecast';
export type ThemeType = 'light' | 'dark';
export type DateFilterType = 7 | 30 | 'all' | 'custom';
