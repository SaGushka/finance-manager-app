import { useState, useEffect, useMemo } from "react";
import { 
  ScrollView, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform 
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFinance } from "@/lib/finance-context";
import { useColors } from "@/hooks/use-colors";
import { CATEGORIES, INCOME_CATEGORIES, TransactionType } from "@/types/finance";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";

export default function AddTransactionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { state, addTransaction, categorizeTransaction } = useFinance();

  const [type, setType] = useState<TransactionType>(
    (params.type as TransactionType) || 'expense'
  );
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = type === 'income' ? INCOME_CATEGORIES : CATEGORIES;

  // Auto-categorize when description changes
  useEffect(() => {
    if (description.trim()) {
      const suggestedCategory = categorizeTransaction(description, type);
      setCategoryId(suggestedCategory);
    }
  }, [description, type, categorizeTransaction]);

  // Reset category when type changes
  useEffect(() => {
    setCategoryId('');
  }, [type]);

  const selectedCategory = useMemo(() => {
    return categories.find(c => c.id === categoryId);
  }, [categoryId, categories]);

  const isValid = useMemo(() => {
    const amountNum = parseFloat(amount.replace(/\s/g, '').replace(',', '.'));
    return amountNum > 0 && description.trim() && categoryId;
  }, [amount, description, categoryId]);

  const handleAmountChange = (text: string) => {
    // Allow only numbers, spaces, commas, and dots
    const cleaned = text.replace(/[^\d\s,\.]/g, '');
    setAmount(cleaned);
  };

  const handleSave = async () => {
    if (!isValid) return;

    const amountNum = parseFloat(amount.replace(/\s/g, '').replace(',', '.'));
    
    await addTransaction({
      type,
      amount: amountNum,
      description: description.trim(),
      categoryId,
      date: new Date(date).toISOString(),
    });

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    router.back();
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
    >
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: colors.primary }} className="text-base">Отмена</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-foreground">
            {type === 'income' ? 'Новый доход' : 'Новый расход'}
          </Text>
          <TouchableOpacity 
            onPress={handleSave}
            disabled={!isValid}
            style={{ opacity: isValid ? 1 : 0.5 }}
          >
            <Text style={{ color: colors.primary }} className="text-base font-semibold">
              Сохранить
            </Text>
          </TouchableOpacity>
        </View>

        {/* Type Selector */}
        <View className="mx-4 mb-6">
          <View className="flex-row bg-surface rounded-xl p-1 border border-border">
            <TouchableOpacity
              className="flex-1 py-3 rounded-lg"
              style={{ backgroundColor: type === 'expense' ? colors.error : 'transparent' }}
              onPress={() => handleTypeChange('expense')}
            >
              <Text 
                className="text-center font-semibold"
                style={{ color: type === 'expense' ? '#FFFFFF' : colors.foreground }}
              >
                Расход
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 rounded-lg"
              style={{ backgroundColor: type === 'income' ? colors.success : 'transparent' }}
              onPress={() => handleTypeChange('income')}
            >
              <Text 
                className="text-center font-semibold"
                style={{ color: type === 'income' ? '#FFFFFF' : colors.foreground }}
              >
                Доход
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Amount Input */}
        <View className="mx-4 mb-6">
          <Text className="text-muted text-sm mb-2">Сумма</Text>
          <View className="flex-row items-center bg-surface rounded-xl px-4 py-4 border border-border">
            <TextInput
              className="flex-1 text-3xl font-bold text-foreground"
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.muted}
              returnKeyType="done"
              autoFocus
            />
            <Text className="text-2xl font-bold text-muted ml-2">
              {state.settings.currency}
            </Text>
          </View>
        </View>

        {/* Description Input */}
        <View className="mx-4 mb-6">
          <Text className="text-muted text-sm mb-2">Описание</Text>
          <View className="bg-surface rounded-xl px-4 py-4 border border-border">
            <TextInput
              className="text-base text-foreground"
              value={description}
              onChangeText={setDescription}
              placeholder="Например: Пятерочка, продукты"
              placeholderTextColor={colors.muted}
              returnKeyType="done"
            />
          </View>
          {selectedCategory && description.trim() && (
            <View className="flex-row items-center mt-2">
              <IconSymbol name="checkmark.circle.fill" size={16} color={colors.success} />
              <Text className="text-success text-sm ml-1">
                Автоматически определена категория: {selectedCategory.nameRu}
              </Text>
            </View>
          )}
        </View>

        {/* Date Input */}
        <View className="mx-4 mb-6">
          <Text className="text-muted text-sm mb-2">Дата</Text>
          <View className="bg-surface rounded-xl px-4 py-4 border border-border">
            <TextInput
              className="text-base text-foreground"
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.muted}
              returnKeyType="done"
            />
          </View>
        </View>

        {/* Category Selector */}
        <View className="mx-4 mb-6">
          <Text className="text-muted text-sm mb-3">Категория</Text>
          <View className="flex-row flex-wrap">
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                className="w-1/4 items-center mb-4"
                onPress={() => {
                  setCategoryId(category.id);
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
              >
                <View 
                  className="w-14 h-14 rounded-full items-center justify-center mb-2"
                  style={{ 
                    backgroundColor: categoryId === category.id 
                      ? category.color 
                      : category.color + '20',
                    borderWidth: categoryId === category.id ? 0 : 2,
                    borderColor: category.color + '40',
                  }}
                >
                  <IconSymbol 
                    name={category.icon as any} 
                    size={24} 
                    color={categoryId === category.id ? '#FFFFFF' : category.color} 
                  />
                </View>
                <Text 
                  className="text-xs text-center"
                  style={{ 
                    color: categoryId === category.id ? colors.foreground : colors.muted,
                    fontWeight: categoryId === category.id ? '600' : '400',
                  }}
                  numberOfLines={1}
                >
                  {category.nameRu}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View 
        className="absolute bottom-0 left-0 right-0 px-4 pb-4 bg-background"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <TouchableOpacity
          className="py-4 rounded-xl items-center"
          style={{ 
            backgroundColor: isValid ? colors.primary : colors.muted,
            opacity: isValid ? 1 : 0.5,
          }}
          onPress={handleSave}
          disabled={!isValid}
        >
          <Text className="text-white font-semibold text-lg">
            Сохранить {type === 'income' ? 'доход' : 'расход'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
