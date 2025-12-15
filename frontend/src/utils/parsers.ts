// Feito por Gustavo Bezerra
import { DateTime } from 'luxon';

export function safeParseNumber(val: string | number | null | undefined): number {
  if (typeof val === 'number' && !isNaN(val)) return val;
  if (!val) return 0;

  const str = String(val).trim();
  
  const cleaned = str
    .replace(/[R$\s€£¥]/gi, '')
    .replace(/\./g, '')
    .replace(',', '.');

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function safeParseDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;

  const str = String(dateStr).trim();
  const formats = [
    'yyyy-MM-dd',
    'dd/MM/yyyy',
    'dd-MM-yyyy',
    'yyyy/MM/dd',
    'MM/dd/yyyy',
    'd/M/yyyy',
  ];

  for (const fmt of formats) {
    const dt = DateTime.fromFormat(str, fmt);
    if (dt.isValid && dt.year >= 1900 && dt.year <= 2100) {
      return dt.toISODate();
    }
  }

  const isoDate = DateTime.fromISO(str);
  if (isoDate.isValid) {
    return isoDate.toISODate();
  }

  return null;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
