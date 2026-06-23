import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useFinance } from "@/lib/finance-context";
import { useColors } from "@/hooks/use-colors";
import { CATEGORIES, INCOME_CATEGORIES } from "@/types/finance";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { state, getBalance, getMonthlyStats } = useFinance();

  if (state.isLoading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  const balance = getBalance();
  const monthStats = getMonthlyStats();
  const recentTransactions = state.transactions.slice(0, 5);
  const allCategories = [...CATEGORIES, ...INCOME_CATEGORIES];

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ' + state.settings.currency;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const getCategoryById = (id: string) => {
    return allCategories.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-muted text-base mb-1">Текущий баланс</Text>
          <Text 
            className="text-4xl font-bold"
            style={{ color: balance >= 0 ? colors.foreground : colors.error }}
          >
            {formatAmount(balance)}
          </Text>
        </View>

        {/* Income/Expense Cards */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
            <View className="flex-row items-center mb-2">
              <View 
                className="w-8 h-8 rounded-full items-center justify-center mr-2"
                style={{ backgroundColor: colors.success + '20' }}
              >
                <IconSymbol name="arrow.up.circle.fill" size={20} color={colors.success} />
              </View>
              <Text className="text-muted text-sm">Доходы</Text>
            </View>
            <Text className="text-xl font-semibold" style={{ color: colors.success }}>
              +{formatAmount(monthStats.income)}
            </Text>
          </View>

          <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
            <View className="flex-row items-center mb-2">
              <View 
                className="w-8 h-8 rounded-full items-center justify-center mr-2"
                style={{ backgroundColor: colors.error + '20' }}
              >
                <IconSymbol name="arrow.down.circle.fill" size={20} color={colors.error} />
              </View>
              <Text className="text-muted text-sm">Расходы</Text>
            </View>
            <Text className="text-xl font-semibold" style={{ color: colors.error }}>
              -{formatAmount(monthStats.expense)}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity 
            className="flex-1 rounded-2xl p-4 items-center"
            style={{ backgroundColor: colors.error }}
            onPress={() => router.push('/add-transaction?type=expense' as any)}
          >
            <IconSymbol name="minus.circle.fill" size={28} color="#FFFFFF" />
            <Text className="text-white font-semibold mt-2">Расход</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-1 rounded-2xl p-4 items-center"
            style={{ backgroundColor: colors.success }}
            onPress={() => router.push('/add-transaction?type=income' as any)}
          >
            <IconSymbol name="plus.circle.fill" size={28} color="#FFFFFF" />
            <Text className="text-white font-semibold mt-2">Доход</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View className="bg-surface rounded-2xl p-4 border border-border">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-foreground">Последние операции</Text>
            <TouchableOpacity onPress={() => router.push('/transactions' as any)}>
              <Text style={{ color: colors.primary }} className="font-medium">Все</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <View className="py-8 items-center">
              <Text className="text-muted text-center">
                Нет операций{'\n'}Добавьте первую транзакцию
              </Text>
            </View>
          ) : (
            recentTransactions.map((transaction, index) => {
              const category = getCategoryById(transaction.categoryId);
              const isIncome = transaction.type === 'income';

              return (
                <View 
                  key={transaction.id}
                  className={`flex-row items-center py-3 ${index < recentTransactions.length - 1 ? 'border-b border-border' : ''}`}
                >
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
                    <Text className="text-foreground font-medium" numberOfLines={1}>
                      {transaction.description}
                    </Text>
                    <Text className="text-muted text-sm">
                      {category.nameRu} • {formatDate(transaction.date)}
                    </Text>
                  </View>
                  <Text 
                    className="font-semibold"
                    style={{ color: isIncome ? colors.success : colors.error }}
                  >
                    {isIncome ? '+' : '-'}{formatAmount(transaction.amount)}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        {/* Budget Progress */}
        {state.settings.monthlyBudget > 0 && (
          <View className="bg-surface rounded-2xl p-4 border border-border mt-4">
            <Text className="text-lg font-semibold text-foreground mb-3">Бюджет на месяц</Text>
            <View className="mb-2">
              <View className="flex-row justify-between mb-1">
                <Text className="text-muted text-sm">
                  Потрачено: {formatAmount(monthStats.expense)}
                </Text>
                <Text className="text-muted text-sm">
                  Лимит: {formatAmount(state.settings.monthlyBudget)}
                </Text>
              </View>
              <View className="h-3 bg-border rounded-full overflow-hidden">
                <View 
                  className="h-full rounded-full"
                  style={{ 
                    width: `${Math.min((monthStats.expense / state.settings.monthlyBudget) * 100, 100)}%`,
                    backgroundColor: monthStats.expense > state.settings.monthlyBudget ? colors.error : colors.primary,
                  }}
                />
              </View>
            </View>
            {monthStats.expense > state.settings.monthlyBudget && (
              <View className="flex-row items-center mt-2">
                <IconSymbol name="exclamationmark.triangle.fill" size={16} color={colors.warning} />
                <Text className="text-warning text-sm ml-1">
                  Бюджет превышен на {formatAmount(monthStats.expense - state.settings.monthlyBudget)}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
