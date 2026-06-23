import { useState, useMemo } from "react";
import { Text, View, TouchableOpacity, FlatList, TextInput, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useFinance } from "@/lib/finance-context";
import { useColors } from "@/hooks/use-colors";
import { CATEGORIES, INCOME_CATEGORIES, Transaction } from "@/types/finance";
import { IconSymbol } from "@/components/ui/icon-symbol";

type FilterType = 'all' | 'income' | 'expense';
type PeriodType = 'week' | 'month' | 'year' | 'all';

export default function TransactionsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { state, deleteTransaction } = useFinance();
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [period, setPeriod] = useState<PeriodType>('month');
  const [searchQuery, setSearchQuery] = useState('');

  const allCategories = [...CATEGORIES, ...INCOME_CATEGORIES];

  const getCategoryById = (id: string) => {
    return allCategories.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ' + state.settings.currency;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const filteredTransactions = useMemo(() => {
    let result = [...state.transactions];

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(t => t.type === filterType);
    }

    // Filter by period
    const now = new Date();
    if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      result = result.filter(t => new Date(t.date) >= weekAgo);
    } else if (period === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      result = result.filter(t => new Date(t.date) >= monthStart);
    } else if (period === 'year') {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      result = result.filter(t => new Date(t.date) >= yearStart);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.description.toLowerCase().includes(query) ||
        getCategoryById(t.categoryId).nameRu.toLowerCase().includes(query)
      );
    }

    // Sort by date (newest first)
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return result;
  }, [state.transactions, filterType, period, searchQuery]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: { date: string; transactions: Transaction[] }[] = [];
    let currentDate = '';

    filteredTransactions.forEach(transaction => {
      const dateStr = transaction.date.split('T')[0];
      if (dateStr !== currentDate) {
        currentDate = dateStr;
        groups.push({ date: dateStr, transactions: [transaction] });
      } else {
        groups[groups.length - 1].transactions.push(transaction);
      }
    });

    return groups;
  }, [filteredTransactions]);

  if (state.isLoading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  const FilterButton = ({ label, value, current, onPress }: { label: string; value: string; current: string; onPress: () => void }) => (
    <TouchableOpacity
      className="px-4 py-2 rounded-full mr-2"
      style={{ 
        backgroundColor: current === value ? colors.primary : colors.surface,
        borderWidth: 1,
        borderColor: current === value ? colors.primary : colors.border,
      }}
      onPress={onPress}
    >
      <Text 
        className="font-medium text-sm"
        style={{ color: current === value ? '#FFFFFF' : colors.foreground }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const category = getCategoryById(item.categoryId);
    const isIncome = item.type === 'income';

    return (
      <TouchableOpacity 
        className="flex-row items-center py-3 px-4 bg-surface mb-2 rounded-xl border border-border"
        onLongPress={() => {
          // TODO: Show delete confirmation
          deleteTransaction(item.id);
        }}
      >
        <View 
          className="w-12 h-12 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: category.color + '20' }}
        >
          <IconSymbol 
            name={category.icon as any} 
            size={24} 
            color={category.color} 
          />
        </View>
        <View className="flex-1">
          <Text className="text-foreground font-medium text-base" numberOfLines={1}>
            {item.description}
          </Text>
          <Text className="text-muted text-sm">
            {category.nameRu}
          </Text>
        </View>
        <Text 
          className="font-semibold text-base"
          style={{ color: isIncome ? colors.success : colors.error }}
        >
          {isIncome ? '+' : '-'}{formatAmount(item.amount)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderDateGroup = ({ item }: { item: { date: string; transactions: Transaction[] } }) => (
    <View className="mb-4">
      <Text className="text-muted text-sm mb-2 px-1">{formatDate(item.date)}</Text>
      {item.transactions.map(transaction => (
        <View key={transaction.id}>
          {renderTransaction({ item: transaction })}
        </View>
      ))}
    </View>
  );

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-4 pt-2 pb-4">
        <Text className="text-2xl font-bold text-foreground mb-4">Операции</Text>

        {/* Search */}
        <View className="flex-row items-center bg-surface rounded-xl px-4 py-3 mb-4 border border-border">
          <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
          <TextInput
            className="flex-1 ml-2 text-foreground text-base"
            placeholder="Поиск операций..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>

        {/* Type Filter */}
        <View className="flex-row mb-3">
          <FilterButton label="Все" value="all" current={filterType} onPress={() => setFilterType('all')} />
          <FilterButton label="Доходы" value="income" current={filterType} onPress={() => setFilterType('income')} />
          <FilterButton label="Расходы" value="expense" current={filterType} onPress={() => setFilterType('expense')} />
        </View>

        {/* Period Filter */}
        <View className="flex-row">
          <FilterButton label="Неделя" value="week" current={period} onPress={() => setPeriod('week')} />
          <FilterButton label="Месяц" value="month" current={period} onPress={() => setPeriod('month')} />
          <FilterButton label="Год" value="year" current={period} onPress={() => setPeriod('year')} />
          <FilterButton label="Все" value="all" current={period} onPress={() => setPeriod('all')} />
        </View>
      </View>

      {/* Transactions List */}
      {groupedTransactions.length === 0 ? (
        <View className="flex-1 items-center justify-center px-4">
          <IconSymbol name="list.bullet" size={48} color={colors.muted} />
          <Text className="text-muted text-center mt-4 text-base">
            Нет операций за выбранный период
          </Text>
        </View>
      ) : (
        <FlatList
          data={groupedTransactions}
          renderItem={renderDateGroup}
          keyExtractor={item => item.date}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        style={{ backgroundColor: colors.primary }}
        onPress={() => router.push('/add-transaction' as any)}
      >
        <IconSymbol name="plus.circle.fill" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </ScreenContainer>
  );
}
