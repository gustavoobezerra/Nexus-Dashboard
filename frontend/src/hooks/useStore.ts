// Feito por Gustavo Bezerra
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SalesData, Stats, FilterState, ChatMessage, ViewType, ThemeType, DateFilterType, TimeSeriesData } from '@/types';

interface AppState {
  theme: ThemeType;
  view: ViewType;
  fullData: SalesData[];
  currentData: SalesData[];
  stats: Stats | null;
  timeSeriesData: TimeSeriesData | null;
  filters: FilterState;
  dateFilter: DateFilterType;
  chatHistory: ChatMessage[];
  chatOpen: boolean;
  isLoading: boolean;

  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  setView: (view: ViewType) => void;
  setFullData: (data: SalesData[]) => void;
  setCurrentData: (data: SalesData[]) => void;
  setStats: (stats: Stats) => void;
  setTimeSeriesData: (data: TimeSeriesData) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  setDateFilter: (filter: DateFilterType) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChatHistory: () => void;
  toggleChat: () => void;
  setLoading: (loading: boolean) => void;
  clearAllData: () => void;
}

const initialFilters: FilterState = {
  dateStart: null,
  dateEnd: null,
  category: '',
  product: '',
  payment: '',
  status: '',
  valueMin: null,
  valueMax: null,
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      view: 'dashboard',
      fullData: [],
      currentData: [],
      stats: null,
      timeSeriesData: null,
      filters: initialFilters,
      dateFilter: 'all',
      chatHistory: [],
      chatOpen: false,
      isLoading: false,

      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setView: (view) => set({ view }),
      setFullData: (data) => set({ fullData: data }),
      setCurrentData: (data) => set({ currentData: data }),
      setStats: (stats) => set({ stats }),
      setTimeSeriesData: (data) => set({ timeSeriesData: data }),
      setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
      resetFilters: () => set({ filters: initialFilters }),
      setDateFilter: (filter) => set({ dateFilter: filter }),
      addChatMessage: (message) => set((state) => ({ chatHistory: [...state.chatHistory, message] })),
      clearChatHistory: () => set({ chatHistory: [] }),
      toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),
      setLoading: (loading) => set({ isLoading: loading }),
      clearAllData: () => set({ fullData: [], currentData: [], stats: null, timeSeriesData: null, filters: initialFilters }),
    }),
    {
      name: 'nexus-storage',
      partialize: (state) => ({
        theme: state.theme,
        fullData: state.fullData,
        chatHistory: state.chatHistory,
      }),
    }
  )
);
