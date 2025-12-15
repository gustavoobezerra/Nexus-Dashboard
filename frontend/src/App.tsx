// Feito por Gustavo Bezerra
import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { DateTime } from 'luxon';
import { useStore } from '@/hooks/useStore';
import { useStats } from '@/hooks/useStats';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ChatPanel } from '@/components/ChatPanel';
import { EmptyState } from '@/components/EmptyState';
import { ToastContainer, showToast } from '@/components/Toast';
import { Dashboard } from '@/pages/Dashboard';
import { Forecast } from '@/pages/Forecast';
import { safeParseNumber, safeParseDate, generateId } from '@/utils/parsers';
import type { SalesData } from '@/types';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, view, stats, setFullData, fullData, dateFilter } = useStore();
  const { applyFilters } = useStats();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (fullData.length > 0) {
      applyFilters();
    }
  }, [fullData, dateFilter, applyFilters]);

  const handleFileUpload = useCallback((file: File) => {
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast('Arquivo muito grande! Máximo: 10MB', 'error');
      return;
    }

    showToast('Processando arquivo...', 'info');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          showToast('Arquivo vazio ou inválido!', 'error');
          return;
        }

        const processed = processCSVData(results.data as Record<string, unknown>[]);
        if (processed.length === 0) {
          showToast('Nenhum dado válido encontrado!', 'error');
          return;
        }

        setFullData(processed);
        showToast(`${processed.length} registros importados!`, 'success');
      },
      error: (err) => {
        showToast(`Erro ao processar: ${err.message}`, 'error');
      },
    });
  }, [setFullData]);

  const handleSampleData = useCallback(() => {
    const sample = generateSampleData();
    setFullData(sample);
    showToast(`${sample.length} registros de exemplo carregados!`, 'success');
  }, [setFullData]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onFileUpload={handleFileUpload}
          onSampleData={handleSampleData}
        />

        <main className="flex-1 overflow-y-auto">
          {!stats ? (
            <EmptyState onSampleData={handleSampleData} />
          ) : view === 'dashboard' ? (
            <Dashboard />
          ) : (
            <Forecast />
          )}
        </main>
      </div>

      <ChatPanel />
      <ToastContainer />
    </div>
  );
}

function processCSVData(data: Record<string, unknown>[]): SalesData[] {
  const fieldMappings: Record<string, string[]> = {
    date: ['data', 'date', 'dt', 'dia', 'vencimento'],
    category: ['categoria', 'category', 'tipo', 'grupo'],
    product: ['produto', 'product', 'item', 'descricao', 'nome'],
    value: ['valor', 'value', 'total', 'preco', 'amount'],
    payment: ['pagamento', 'payment', 'forma_pagamento', 'metodo'],
    status: ['status', 'situacao', 'estado'],
  };

  const headers = Object.keys(data[0] || {});
  const mapping: Record<string, string> = {};

  for (const [field, patterns] of Object.entries(fieldMappings)) {
    for (const header of headers) {
      const headerLower = header.toLowerCase();
      if (patterns.some((p) => headerLower.includes(p))) {
        mapping[field] = header;
        break;
      }
    }
  }

  return data
    .map((row) => {
      const date = safeParseDate(row[mapping.date] as string);
      const value = safeParseNumber(row[mapping.value] as string | number);

      if (!date || value <= 0) return null;

      return {
        id: generateId(),
        date,
        category: String(row[mapping.category] || 'Outros'),
        product: String(row[mapping.product] || 'Produto'),
        value,
        payment: String(row[mapping.payment] || 'Outros'),
        status: String(row[mapping.status] || 'Concluído'),
      };
    })
    .filter((item): item is SalesData => item !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function generateSampleData(): SalesData[] {
  const categories = ['Eletrônicos', 'Roupas', 'Alimentos', 'Serviços', 'Outros'];
  const products = ['Smartphone', 'Notebook', 'Camiseta', 'Calça', 'Café', 'Consultoria', 'Suporte'];
  const payments = ['PIX', 'Cartão Crédito', 'Cartão Débito', 'Boleto', 'Dinheiro'];
  const statuses = ['Concluído', 'Pendente', 'Cancelado'];

  const data: SalesData[] = [];
  const today = DateTime.now();

  for (let i = 90; i >= 0; i--) {
    const date = today.minus({ days: i }).toISODate()!;
    const transactionsPerDay = Math.floor(Math.random() * 8) + 3;

    for (let j = 0; j < transactionsPerDay; j++) {
      data.push({
        id: generateId(),
        date,
        category: categories[Math.floor(Math.random() * categories.length)],
        product: products[Math.floor(Math.random() * products.length)],
        value: Math.round((Math.random() * 500 + 50) * 100) / 100,
        payment: payments[Math.floor(Math.random() * payments.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
      });
    }
  }

  return data;
}
