import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, Settings, CATEGORIES, INCOME_CATEGORIES } from '@/types/finance';

// Storage keys
const TRANSACTIONS_KEY = 'finance_transactions';
const SETTINGS_KEY = 'finance_settings';

// Default settings
const DEFAULT_SETTINGS: Settings = {
  currency: '₽',
  monthlyBudget: 50000,
  theme: 'system',
};

// State type
interface FinanceState {
  transactions: Transaction[];
  settings: Settings;
  isLoading: boolean;
}

// Action types
type FinanceAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_SETTINGS'; payload: Settings }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> };

// Reducer
function financeReducer(state: FinanceState, action: FinanceAction): FinanceState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    default:
      return state;
  }
}

// Context type
interface FinanceContextType {
  state: FinanceState;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  getBalance: () => number;
  getMonthlyStats: (month?: string) => { income: number; expense: number; byCategory: Record<string, number> };
  categorizeTransaction: (description: string, type: 'income' | 'expense') => string;
  getForecast: () => { predictedExpense: number; byCategory: Record<string, number> };
}

// Create context
const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Provider component
export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(financeReducer, {
    transactions: [],
    settings: DEFAULT_SETTINGS,
    isLoading: true,
  });

  // Load data from AsyncStorage on mount
  useEffect(() => {
    loadData();
  }, []);

  // Save transactions when they change
  useEffect(() => {
    if (!state.isLoading) {
      AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(state.transactions));
    }
  }, [state.transactions, state.isLoading]);

  // Save settings when they change
  useEffect(() => {
    if (!state.isLoading) {
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
    }
  }, [state.settings, state.isLoading]);

  async function loadData() {
    try {
      const [transactionsJson, settingsJson] = await Promise.all([
        AsyncStorage.getItem(TRANSACTIONS_KEY),
        AsyncStorage.getItem(SETTINGS_KEY),
      ]);

      if (transactionsJson) {
        dispatch({ type: 'SET_TRANSACTIONS', payload: JSON.parse(transactionsJson) });
      }

      if (settingsJson) {
        dispatch({ type: 'SET_SETTINGS', payload: { ...DEFAULT_SETTINGS, ...JSON.parse(settingsJson) } });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }

  // Generate unique ID
  function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Add transaction
  async function addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>) {
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
  }

  // Update transaction
  async function updateTransaction(transaction: Transaction) {
    dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction });
  }

  // Delete transaction
  async function deleteTransaction(id: string) {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  }

  // Update settings
  async function updateSettings(settings: Partial<Settings>) {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }

  // Calculate balance
  function getBalance(): number {
    return state.transactions.reduce((acc, t) => {
      return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);
  }

  // Get monthly statistics
  function getMonthlyStats(month?: string) {
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    const monthTransactions = state.transactions.filter((t) =>
      t.date.startsWith(targetMonth)
    );

    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);

    const expense = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    const byCategory: Record<string, number> = {};
    monthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        byCategory[t.categoryId] = (byCategory[t.categoryId] || 0) + t.amount;
      });

    return { income, expense, byCategory };
  }

  // Categorize transaction based on description
  function categorizeTransaction(description: string, type: 'income' | 'expense'): string {
    const lowerDesc = description.toLowerCase();
    const categories = type === 'income' ? INCOME_CATEGORIES : CATEGORIES;

    for (const category of categories) {
      for (const keyword of category.keywords) {
        if (lowerDesc.includes(keyword.toLowerCase())) {
          return category.id;
        }
      }
    }

    return type === 'income' ? 'other_income' : 'other';
  }

  // Calculate forecast using moving average
  function getForecast() {
    const now = new Date();
    const months: string[] = [];
    
    // Get last 3 months
    for (let i = 1; i <= 3; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(date.toISOString().slice(0, 7));
    }

    // Calculate average expenses per category
    const categoryTotals: Record<string, number[]> = {};
    
    months.forEach((month) => {
      const stats = getMonthlyStats(month);
      Object.entries(stats.byCategory).forEach(([catId, amount]) => {
        if (!categoryTotals[catId]) {
          categoryTotals[catId] = [];
        }
        categoryTotals[catId].push(amount);
      });
    });

    // Calculate averages
    const byCategory: Record<string, number> = {};
    let predictedExpense = 0;

    Object.entries(categoryTotals).forEach(([catId, amounts]) => {
      const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      byCategory[catId] = Math.round(avg);
      predictedExpense += Math.round(avg);
    });

    // If no historical data, use budget as estimate
    if (predictedExpense === 0) {
      predictedExpense = state.settings.monthlyBudget;
    }

    return { predictedExpense, byCategory };
  }

  const value: FinanceContextType = {
    state,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateSettings,
    getBalance,
    getMonthlyStats,
    categorizeTransaction,
    getForecast,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}

// Hook to use finance context
export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
