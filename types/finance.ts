// Типы данных для приложения управления финансами

export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  nameRu: string;
  icon: string;
  color: string;
  keywords: string[];
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  categoryId: string;
  date: string; // ISO string
  createdAt: string; // ISO string
}

export interface MonthlyStats {
  month: string; // YYYY-MM
  totalIncome: number;
  totalExpense: number;
  byCategory: Record<string, number>;
}

export interface Forecast {
  month: string; // YYYY-MM
  predictedExpense: number;
  byCategory: Record<string, number>;
  confidence: number; // 0-1
}

export interface Settings {
  currency: string;
  monthlyBudget: number;
  theme: 'light' | 'dark' | 'system';
}

// Категории расходов
export const CATEGORIES: Category[] = [
  {
    id: 'groceries',
    name: 'Groceries',
    nameRu: 'Продукты',
    icon: 'cart.fill',
    color: '#22C55E',
    keywords: ['пятерочка', 'магнит', 'перекресток', 'ашан', 'лента', 'дикси', 'продукты', 'супермаркет', 'гипермаркет', 'вкусвилл', 'азбука вкуса', 'metro', 'окей', 'spar'],
  },
  {
    id: 'transport',
    name: 'Transport',
    nameRu: 'Транспорт',
    icon: 'car.fill',
    color: '#3B82F6',
    keywords: ['яндекс такси', 'uber', 'метро', 'автобус', 'бензин', 'заправка', 'лукойл', 'газпром', 'роснефть', 'такси', 'каршеринг', 'делимобиль', 'ситидрайв', 'парковка', 'мосметро'],
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    nameRu: 'Развлечения',
    icon: 'film.fill',
    color: '#A855F7',
    keywords: ['кино', 'театр', 'netflix', 'spotify', 'игры', 'steam', 'playstation', 'xbox', 'концерт', 'музей', 'выставка', 'парк', 'аттракционы', 'боулинг', 'бильярд'],
  },
  {
    id: 'restaurants',
    name: 'Restaurants',
    nameRu: 'Рестораны',
    icon: 'fork.knife',
    color: '#F97316',
    keywords: ['ресторан', 'кафе', 'макдональдс', 'kfc', 'бургер кинг', 'доставка еды', 'яндекс еда', 'delivery club', 'самокат', 'бар', 'пиццерия', 'суши', 'шаурма', 'столовая'],
  },
  {
    id: 'health',
    name: 'Health',
    nameRu: 'Здоровье',
    icon: 'heart.fill',
    color: '#EF4444',
    keywords: ['аптека', 'врач', 'клиника', 'анализы', 'больница', 'стоматолог', 'медицина', 'лекарства', 'витамины', 'фитнес', 'спортзал', 'тренажерный зал'],
  },
  {
    id: 'clothing',
    name: 'Clothing',
    nameRu: 'Одежда',
    icon: 'tshirt.fill',
    color: '#EC4899',
    keywords: ['zara', 'h&m', 'одежда', 'обувь', 'uniqlo', 'massimo dutti', 'bershka', 'pull&bear', 'reserved', 'gloria jeans', 'спортмастер', 'декатлон'],
  },
  {
    id: 'utilities',
    name: 'Utilities',
    nameRu: 'Коммунальные услуги',
    icon: 'house.lodge.fill',
    color: '#06B6D4',
    keywords: ['квартплата', 'электричество', 'интернет', 'связь', 'мобильная связь', 'мтс', 'билайн', 'мегафон', 'теле2', 'ростелеком', 'газ', 'вода', 'отопление', 'жкх'],
  },
  {
    id: 'other',
    name: 'Other',
    nameRu: 'Другое',
    icon: 'ellipsis.circle.fill',
    color: '#6B7280',
    keywords: [],
  },
];

// Категории доходов
export const INCOME_CATEGORIES: Category[] = [
  {
    id: 'salary',
    name: 'Salary',
    nameRu: 'Зарплата',
    icon: 'banknote.fill',
    color: '#22C55E',
    keywords: ['зарплата', 'аванс', 'оклад', 'премия'],
  },
  {
    id: 'freelance',
    name: 'Freelance',
    nameRu: 'Фриланс',
    icon: 'creditcard.fill',
    color: '#3B82F6',
    keywords: ['фриланс', 'подработка', 'заказ', 'проект'],
  },
  {
    id: 'investment',
    name: 'Investment',
    nameRu: 'Инвестиции',
    icon: 'chart.line.uptrend.xyaxis',
    color: '#A855F7',
    keywords: ['дивиденды', 'проценты', 'вклад', 'инвестиции', 'акции'],
  },
  {
    id: 'other_income',
    name: 'Other Income',
    nameRu: 'Другой доход',
    icon: 'ellipsis.circle.fill',
    color: '#6B7280',
    keywords: [],
  },
];
