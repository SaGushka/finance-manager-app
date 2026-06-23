import { useState, useMemo } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useFinance } from "@/lib/finance-context";
import { useColors } from "@/hooks/use-colors";
import { CATEGORIES } from "@/types/finance";
import { IconSymbol } from "@/components/ui/icon-symbol";

type PeriodType = 'week' | 'month' | 'year';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const colors = useColors();
  const { state, getMonthlyStats } = useFinance();
  const [period, setPeriod] = useState<PeriodType>('month');

  const stats = useMemo(() => {
    const now = new Date();
    
    if (period === 'week') {
      // Get transactions from last 7 days
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const weekTransactions = state.transactions.filter(t => new Date(t.date) >= weekAgo);
      
      const income = weekTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const expense = weekTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
      
      const byCategory: Record<string, number> = {};
      weekTransactions.filter(t => t.type === 'expense').forEach(t => {
        byCategory[t.categoryId] = (byCategory[t.categoryId] || 0) + t.amount;
      });
      
      return { income, expense, byCategory };
    } else if (period === 'year') {
      // Get transactions from current year
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const yearTransactions = state.transactions.filter(t => new Date(t.date) >= yearStart);
      
      const income = yearTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const expense = yearTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
      
      const byCategory: Record<string, number> = {};
      yearTransactions.filter(t => t.type === 'expense').forEach(t => {
        byCategory[t.categoryId] = (byCategory[t.categoryId] || 0) + t.amount;
      });
      
      return { income, expense, byCategory };
    }
    
    return getMonthlyStats();
  }, [state.transactions, period, getMonthlyStats]);

  const categoryStats = useMemo(() => {
    const entries = Object.entries(stats.byCategory)
      .map(([categoryId, amount]) => {
        const category = CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
        return { category, amount };
      })
      .sort((a, b) => b.amount - a.amount);
    
    const total = entries.reduce((acc, e) => acc + e.amount, 0);
    
    return entries.map(e => ({
      ...e,
      percentage: total > 0 ? (e.amount / total) * 100 : 0,
    }));
  }, [stats.byCategory]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ' + state.settings.currency;
  };

  if (state.isLoading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  const periodLabels: Record<PeriodType, string> = {
    week: 'Неделя',
    month: 'Месяц',
    year: 'Год',
  };

  // Simple pie chart visualization
  const PieChart = () => {
    if (categoryStats.length === 0) {
      return (
        <View className="items-center justify-center py-8">
          <View 
            className="w-40 h-40 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border }}
          >
            <Text className="text-muted text-center">Нет данных</Text>
          </View>
        </View>
      );
    }

    // Create pie segments using conic gradient simulation with overlapping circles
    let currentAngle = 0;
    const size = 160;
    const radius = size / 2;

    return (
      <View className="items-center py-4">
        <View style={{ width: size, height: size, position: 'relative' }}>
          {/* Background circle */}
          <View 
            style={{ 
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: radius,
              backgroundColor: colors.surface,
            }}
          />
          
          {/* Pie segments as colored arcs */}
          {categoryStats.map((item, index) => {
            const angle = (item.percentage / 100) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;
            
            // Use View with border to create arc effect
            const rotation = startAngle + angle / 2;
            
            return (
              <View
                key={item.category.id}
                style={{
                  position: 'absolute',
                  width: size,
                  height: size,
                  borderRadius: radius,
                  borderWidth: 20,
                  borderColor: 'transparent',
                  borderTopColor: item.category.color,
                  transform: [{ rotate: `${rotation}deg` }],
                  opacity: 0.9,
                }}
              />
            );
          })}
          
          {/* Center circle */}
          <View 
            style={{ 
              position: 'absolute',
              top: 30,
              left: 30,
              width: size - 60,
              height: size - 60,
              borderRadius: (size - 60) / 2,
              backgroundColor: colors.background,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text className="text-muted text-xs">Всего</Text>
            <Text className="text-foreground font-bold text-sm">
              {formatAmount(stats.expense)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="px-4 pt-2 pb-4">
          <Text className="text-2xl font-bold text-foreground mb-4">Аналитика</Text>

          {/* Period Selector */}
          <View className="flex-row bg-surface rounded-xl p-1 border border-border">
            {(['week', 'month', 'year'] as PeriodType[]).map((p) => (
              <TouchableOpacity
                key={p}
                className="flex-1 py-2 rounded-lg"
                style={{ backgroundColor: period === p ? colors.primary : 'transparent' }}
                onPress={() => setPeriod(p)}
              >
                <Text 
                  className="text-center font-medium"
                  style={{ color: period === p ? '#FFFFFF' : colors.foreground }}
                >
                  {periodLabels[p]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Summary Cards */}
        <View className="flex-row px-4 gap-3 mb-6">
          <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-muted text-sm mb-1">Доходы</Text>
            <Text className="text-xl font-bold" style={{ color: colors.success }}>
              +{formatAmount(stats.income)}
            </Text>
          </View>
          <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-muted text-sm mb-1">Расходы</Text>
            <Text className="text-xl font-bold" style={{ color: colors.error }}>
              -{formatAmount(stats.expense)}
            </Text>
          </View>
        </View>

        {/* Balance */}
        <View className="mx-4 bg-surface rounded-2xl p-4 border border-border mb-6">
          <Text className="text-muted text-sm mb-1">Баланс за период</Text>
          <Text 
            className="text-2xl font-bold"
            style={{ color: stats.income - stats.expense >= 0 ? colors.success : colors.error }}
          >
            {stats.income - stats.expense >= 0 ? '+' : ''}{formatAmount(stats.income - stats.expense)}
          </Text>
        </View>

        {/* Pie Chart */}
        <View className="mx-4 bg-surface rounded-2xl p-4 border border-border mb-6">
          <Text className="text-lg font-semibold text-foreground mb-2">Расходы по категориям</Text>
          <PieChart />
          
          {/* Legend */}
          <View className="mt-4">
            {categoryStats.slice(0, 5).map((item) => (
              <View key={item.category.id} className="flex-row items-center py-2">
                <View 
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: item.category.color }}
                />
                <Text className="flex-1 text-foreground">{item.category.nameRu}</Text>
                <Text className="text-muted mr-2">{item.percentage.toFixed(1)}%</Text>
                <Text className="font-semibold text-foreground">{formatAmount(item.amount)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Categories */}
        <View className="mx-4 bg-surface rounded-2xl p-4 border border-border">
          <Text className="text-lg font-semibold text-foreground mb-4">Топ категорий</Text>
          
          {categoryStats.length === 0 ? (
            <Text className="text-muted text-center py-4">Нет данных о расходах</Text>
          ) : (
            categoryStats.map((item, index) => (
              <View key={item.category.id} className="mb-4">
                <View className="flex-row items-center mb-2">
                  <View 
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: item.category.color + '20' }}
                  >
                    <IconSymbol 
                      name={item.category.icon as any} 
                      size={20} 
                      color={item.category.color} 
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground font-medium">{item.category.nameRu}</Text>
                    <Text className="text-muted text-sm">{item.percentage.toFixed(1)}%</Text>
                  </View>
                  <Text className="font-semibold text-foreground">{formatAmount(item.amount)}</Text>
                </View>
                
                {/* Progress bar */}
                <View className="h-2 bg-border rounded-full overflow-hidden ml-13">
                  <View 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${item.percentage}%`,
                      backgroundColor: item.category.color,
                    }}
                  />
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
