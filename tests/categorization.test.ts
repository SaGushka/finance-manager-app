import { describe, it, expect } from 'vitest';
import { CATEGORIES, INCOME_CATEGORIES } from '../types/finance';

// Функция категоризации (копия из finance-context.tsx для тестирования)
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

describe('Автоматическая категоризация расходов', () => {
  describe('Категория "Продукты"', () => {
    it('должна определять "Пятерочка" как продукты', () => {
      expect(categorizeTransaction('Пятерочка', 'expense')).toBe('groceries');
    });

    it('должна определять "Магнит" как продукты', () => {
      expect(categorizeTransaction('Магнит', 'expense')).toBe('groceries');
    });

    it('должна определять "Перекресток" как продукты', () => {
      expect(categorizeTransaction('Перекресток', 'expense')).toBe('groceries');
    });

    it('должна определять "Ашан" как продукты', () => {
      expect(categorizeTransaction('Ашан', 'expense')).toBe('groceries');
    });

    it('должна определять "ВкусВилл" как продукты', () => {
      expect(categorizeTransaction('ВкусВилл', 'expense')).toBe('groceries');
    });
  });

  describe('Категория "Транспорт"', () => {
    it('должна определять "Яндекс Такси" как транспорт', () => {
      expect(categorizeTransaction('Яндекс Такси', 'expense')).toBe('transport');
    });

    it('должна определять "Метро" как транспорт', () => {
      expect(categorizeTransaction('Метро', 'expense')).toBe('transport');
    });

    it('должна определять "Бензин" как транспорт', () => {
      expect(categorizeTransaction('Бензин', 'expense')).toBe('transport');
    });

    it('должна определять "Лукойл" как транспорт', () => {
      expect(categorizeTransaction('Лукойл', 'expense')).toBe('transport');
    });
  });

  describe('Категория "Развлечения"', () => {
    it('должна определять "Кино" как развлечения', () => {
      expect(categorizeTransaction('Кино', 'expense')).toBe('entertainment');
    });

    it('должна определять "Netflix" как развлечения', () => {
      expect(categorizeTransaction('Netflix', 'expense')).toBe('entertainment');
    });

    it('должна определять "Steam" как развлечения', () => {
      expect(categorizeTransaction('Steam', 'expense')).toBe('entertainment');
    });
  });

  describe('Категория "Рестораны"', () => {
    it('должна определять "Макдональдс" как рестораны', () => {
      expect(categorizeTransaction('Макдональдс', 'expense')).toBe('restaurants');
    });

    it('должна определять "Яндекс Еда" как рестораны', () => {
      expect(categorizeTransaction('Яндекс Еда', 'expense')).toBe('restaurants');
    });

    it('должна определять "Кафе" как рестораны', () => {
      expect(categorizeTransaction('Кафе', 'expense')).toBe('restaurants');
    });
  });

  describe('Категория "Здоровье"', () => {
    it('должна определять "Аптека" как здоровье', () => {
      expect(categorizeTransaction('Аптека', 'expense')).toBe('health');
    });

    it('должна определять "Врач" как здоровье', () => {
      expect(categorizeTransaction('Врач', 'expense')).toBe('health');
    });

    it('должна определять "Фитнес" как здоровье', () => {
      expect(categorizeTransaction('Фитнес', 'expense')).toBe('health');
    });
  });

  describe('Категория "Одежда"', () => {
    it('должна определять "Zara" как одежду', () => {
      expect(categorizeTransaction('Zara', 'expense')).toBe('clothing');
    });

    it('должна определять "H&M" как одежду', () => {
      expect(categorizeTransaction('H&M', 'expense')).toBe('clothing');
    });
  });

  describe('Категория "Коммунальные услуги"', () => {
    it('должна определять "Квартплата" как коммунальные услуги', () => {
      expect(categorizeTransaction('Квартплата', 'expense')).toBe('utilities');
    });

    it('должна определять "МТС" как коммунальные услуги', () => {
      expect(categorizeTransaction('МТС', 'expense')).toBe('utilities');
    });

    it('должна определять "Интернет" как коммунальные услуги', () => {
      expect(categorizeTransaction('Интернет', 'expense')).toBe('utilities');
    });
  });

  describe('Категория "Другое"', () => {
    it('должна определять неизвестные расходы как "Другое"', () => {
      expect(categorizeTransaction('Прочие расходы', 'expense')).toBe('other');
    });

    it('должна определять пустое описание как "Другое"', () => {
      expect(categorizeTransaction('', 'expense')).toBe('other');
    });
  });
});

describe('Автоматическая категоризация доходов', () => {
  it('должна определять "Зарплата" как зарплату', () => {
    expect(categorizeTransaction('Зарплата', 'income')).toBe('salary');
  });

  it('должна определять "Аванс" как зарплату', () => {
    expect(categorizeTransaction('Аванс', 'income')).toBe('salary');
  });

  it('должна определять "Премия" как зарплату', () => {
    expect(categorizeTransaction('Премия', 'income')).toBe('salary');
  });

  it('должна определять "Фриланс" как фриланс', () => {
    expect(categorizeTransaction('Фриланс', 'income')).toBe('freelance');
  });

  it('должна определять "Дивиденды" как инвестиции', () => {
    expect(categorizeTransaction('Дивиденды', 'income')).toBe('investment');
  });

  it('должна определять неизвестные доходы как "Другой доход"', () => {
    expect(categorizeTransaction('Подарок', 'income')).toBe('other_income');
  });
});

describe('Регистронезависимость', () => {
  it('должна работать с разным регистром', () => {
    expect(categorizeTransaction('ПЯТЕРОЧКА', 'expense')).toBe('groceries');
    expect(categorizeTransaction('пятерочка', 'expense')).toBe('groceries');
    expect(categorizeTransaction('Пятерочка', 'expense')).toBe('groceries');
  });
});
