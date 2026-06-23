import { useMemo } from "react";
import { ScrollView, Text, View, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useFinance } from "@/lib/finance-context";
import { useColors } from "@/hooks/use-colors";
import { CATEGORIES } from "@/types/finance";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function ForecastScreen() {
  const colors = useColors();
  const { state, getForecast, getMonthlyStats } = useFinance();

  const forecast = useMemo(() => getForecast(), [state.transactions]);
  const currentMonthStats = useMemo(() => getMonthlyStats(), [state.transactions]);

  // Get last 6 months of data for trend
  const monthlyTrend = useMemo(() => {
    const now = new Date();
    const months: { month: string; label: string; expense: number }[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = date.toISOString().slice(0, 7);
      const stats = getMonthlyStats(monthStr);
      
      months.push({
        month: monthStr,
        label: date.toLocaleDateString('ru-RU', { month: 'short' }),
        expense: stats.expense,
      });
    }
    
    return months;
  }, [state.transactions, getMonthlyStats]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ' + state.settings.currency;
  };

  const getCategoryById = (id: string) => {
    return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
  };

  // Calculate trend direction
  const trendDirection = useMemo(() => {
    const recentMonths = monthlyTrend.slice(-3);
    if (recentMonths.length < 2) return 'stable';
    
    const avg1 = recentMonths.slice(0, 2).reduce((a, b) => a + b.expense, 0) / 2;
    const avg2 = recentMonths.slice(-2).reduce((a, b) => a + b.expense, 0) / 2;
    
    if (avg2 > avg1 * 1.1) return 'up';
    if (avg2 < avg1 * 0.9) return 'down';
    return 'stable';
  }, [monthlyTrend]);

  // Generate recommendations
  const recommendations = useMemo(() => {
    const recs: { icon: string; text: string; type: 'warning' | 'success' | 'info' }[] = [];
    
    // Budget warning
    if (forecast.predictedExpense > state.settings.monthlyBudget) {
      recs.push({
        icon: 'exclamationmark.triangle.fill',
        text: `Прогнозируемые расходы превышают бюджет на ${formatAmount(forecast.predictedExpense - state.settings.monthlyBudget)}`,
        type: 'warning',
      });
    }
    
    // Top spending category
    const topCategories = Object.entries(forecast.byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    if (topCategories.length > 0) {
      const topCat = getCategoryById(topCategories[0][0]);
      recs.push({
        icon: 'info.circle.fill',
        text: `Основная статья расходов — "${topCat.nameRu}". Рассмотрите возможность оптимизации.`,
        type: 'info',
      });
    }
    
    // Trend-based recommendation
    if (trendDirection === 'up') {
      recs.push({
        icon: 'chart.line.uptrend.xyaxis',
        text: 'Расходы растут. Рекомендуем пересмотреть бюджет.',
        type: 'warning',
      });
    } else if (trendDirection === 'down') {
      recs.push({
        icon: 'checkmark.circle.fill',
        text: 'Отличная работа! Ваши расходы снижаются.',
        type: 'success',
      });
    }
    
    // Savings potential
    if (currentMonthStats.income > currentMonthStats.expense) {
      const savings = currentMonthStats.income - currentMonthStats.expense;
      recs.push({
        icon: 'banknote.fill',
        text: `Потенциал сбережений в этом месяце: ${formatAmount(savings)}`,
        type: 'success',
      });
    }
    
    return recs;
  }, [forecast, state.settings.monthlyBudget, trendDirection, currentMonthStats]);

  if (state.isLoading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  // Simple bar chart
  const maxExpense = Math.max(...monthlyTrend.map(m => m.expense), forecast.predictedExpense, 1);

  return (
    <ScreenContainer className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="px-4 pt-2 pb-4">
          <Text className="text-2xl font-bold text-foreground">Прогноз</Text>
          <Text className="text-muted mt-1">На основе данных за последние 3 месяца</Text>
        </View>

        {/* Forecast Card */}
        <View className="mx-4 bg-surface rounded-2xl p-5 border border-border mb-6">
          <Text className="text-muted text-sm mb-2">Прогноз расходов на следующий месяц</Text>
          <Text className="text-3xl font-bold text-foreground mb-3">
            {formatAmount(forecast.predictedExpense)}
          </Text>
          
          <View className="flex-row items-center">
            <View 
              className="px-3 py-1 rounded-full flex-row items-center"
              style={{ 
                backgroundColor: forecast.predictedExpense <= state.settings.monthlyBudget 
                  ? colors.success + '20' 
                  : colors.warning + '20' 
              }}
            >
              <IconSymbol 
                name={forecast.predictedExpense <= state.settings.monthlyBudget 
                  ? 'checkmark.circle.fill' 
                  : 'exclamationmark.triangle.fill'} 
                size={16} 
                color={forecast.predictedExpense <= state.settings.monthlyBudget 
                  ? colors.success 
                  : colors.warning} 
              />
              <Text 
                className="ml-1 text-sm font-medium"
                style={{ 
                  color: forecast.predictedExpense <= state.settings.monthlyBudget 
                    ? colors.success 
                    : colors.warning 
                }}
              >
                {forecast.predictedExpense <= state.settings.monthlyBudget 
                  ? 'В рамках бюджета' 
                  : 'Превышает бюджет'}
              </Text>
            </View>
          </View>
        </View>

        {/* Trend Chart */}
        <View className="mx-4 bg-surface rounded-2xl p-4 border border-border mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">Тренд расходов</Text>
          
          <View className="flex-row items-end justify-between h-32 mb-2">
            {monthlyTrend.map((month, index) => (
              <View key={month.month} className="flex-1 items-center mx-1">
                <View 
                  className="w-full rounded-t-lg"
                  style={{ 
                    height: `${(month.expense / maxExpense) * 100}%`,
                    backgroundColor: colors.primary,
                    minHeight: 4,
                  }}
                />
              </View>
            ))}
            {/* Forecast bar */}
            <View className="flex-1 items-center mx-1">
              <View 
                className="w-full rounded-t-lg"
                style={{ 
                  height: `${(forecast.predictedExpense / maxExpense) * 100}%`,
                  backgroundColor: colors.primary + '60',
                  borderWidth: 2,
                  borderColor: colors.primary,
                  borderStyle: 'dashed',
                  minHeight: 4,
                }}
              />
            </View>
          </View>
          
          {/* Labels */}
          <View className="flex-row justify-between">
            {monthlyTrend.map((month) => (
              <View key={month.month} className="flex-1 items-center mx-1">
                <Text className="text-muted text-xs">{month.label}</Text>
              </View>
            ))}
            <View className="flex-1 items-center mx-1">
              <Text className="text-xs" style={{ color: colors.primary }}>Прогноз</Text>
            </View>
          </View>
        </View>

        {/* Forecast by Category */}
        <View className="mx-4 bg-surface rounded-2xl p-4 border border-border mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">Прогноз по категориям</Text>
          
          {Object.keys(forecast.byCategory).length === 0 ? (
            <Text className="text-muted text-center py-4">
              Недостаточно данных для прогноза по категориям
            </Text>
          ) : (
            Object.entries(forecast.byCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([categoryId, amount]) => {
                const category = getCategoryById(categoryId);
                const percentage = (amount / forecast.predictedExpense) * 100;
                
                return (
                  <View key={categoryId} className="flex-row items-center py-3 border-b border-border last:border-b-0">
                    <View 
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: category.color + '20' }}
                    >
                      <IconSymbol 
                        name={category.icon as any} 
                        size={20} 
                        color={category.color} 
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-foreground font-medium">{category.nameRu}</Text>
                      <Text className="text-muted text-sm">{percentage.toFixed(1)}% от общих расходов</Text>
                    </View>
                    <Text className="font-semibold text-foreground">{formatAmount(amount)}</Text>
                  </View>
                );
              })
          )}
        </View>

        {/* Recommendations */}
        <View className="mx-4 bg-surface rounded-2xl p-4 border border-border">
          <Text className="text-lg font-semibold text-foreground mb-4">Рекомендации</Text>
          
          {recommendations.length === 0 ? (
            <Text className="text-muted text-center py-4">
              Добавьте больше транзакций для получения персональных рекомендаций
            </Text>
          ) : (
            recommendations.map((rec, index) => (
              <View 
                key={index} 
                className="flex-row items-start py-3 border-b border-border last:border-b-0"
              >
                <View 
                  className="w-8 h-8 rounded-full items-center justify-center mr-3 mt-0.5"
                  style={{ 
                    backgroundColor: rec.type === 'warning' 
                      ? colors.warning + '20' 
                      : rec.type === 'success' 
                        ? colors.success + '20' 
                        : colors.primary + '20' 
                  }}
                >
                  <IconSymbol 
                    name={rec.icon as any} 
                    size={16} 
                    color={rec.type === 'warning' 
                      ? colors.warning 
                      : rec.type === 'success' 
                        ? colors.success 
                        : colors.primary} 
                  />
                </View>
                <Text className="flex-1 text-foreground leading-5">{rec.text}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
