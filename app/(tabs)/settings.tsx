import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useFinance } from "@/lib/finance-context";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

const CURRENCIES = [
  { code: '₽', name: 'Российский рубль' },
  { code: '$', name: 'Доллар США' },
  { code: '€', name: 'Евро' },
  { code: '₸', name: 'Казахстанский тенге' },
];

export default function SettingsScreen() {
  const colors = useColors();
  const { state, updateSettings } = useFinance();
  const [budgetInput, setBudgetInput] = useState(state.settings.monthlyBudget.toString());
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const handleBudgetChange = (text: string) => {
    setBudgetInput(text);
    const value = parseInt(text.replace(/\D/g, ''), 10);
    if (!isNaN(value) && value >= 0) {
      updateSettings({ monthlyBudget: value });
    }
  };

  const handleCurrencySelect = (currency: string) => {
    updateSettings({ currency });
    setShowCurrencyPicker(false);
  };

  const handleExportData = () => {
    const data = {
      transactions: state.transactions,
      settings: state.settings,
      exportDate: new Date().toISOString(),
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    
    if (Platform.OS === 'web') {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      Alert.alert(
        'Экспорт данных',
        'Данные готовы к экспорту. Всего транзакций: ' + state.transactions.length,
        [{ text: 'OK' }]
      );
    }
  };

  const SettingRow = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement 
  }: { 
    icon: string; 
    title: string; 
    subtitle?: string; 
    onPress?: () => void; 
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity 
      className="flex-row items-center py-4 border-b border-border"
      onPress={onPress}
      disabled={!onPress}
    >
      <View 
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: colors.primary + '20' }}
      >
        <IconSymbol name={icon as any} size={20} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-foreground font-medium text-base">{title}</Text>
        {subtitle && <Text className="text-muted text-sm mt-0.5">{subtitle}</Text>}
      </View>
      {rightElement || (onPress && (
        <IconSymbol name="chevron.right" size={20} color={colors.muted} />
      ))}
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="px-4 pt-2 pb-4">
          <Text className="text-2xl font-bold text-foreground">Настройки</Text>
        </View>

        {/* Budget Section */}
        <View className="mx-4 bg-surface rounded-2xl p-4 border border-border mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">Бюджет</Text>
          
          <View className="mb-4">
            <Text className="text-muted text-sm mb-2">Месячный бюджет</Text>
            <View className="flex-row items-center bg-background rounded-xl px-4 py-3 border border-border">
              <TextInput
                className="flex-1 text-foreground text-lg font-semibold"
                value={budgetInput}
                onChangeText={handleBudgetChange}
                keyboardType="numeric"
                placeholder="50000"
                placeholderTextColor={colors.muted}
                returnKeyType="done"
              />
              <Text className="text-foreground text-lg font-semibold ml-2">
                {state.settings.currency}
              </Text>
            </View>
          </View>
        </View>

        {/* Currency Section */}
        <View className="mx-4 bg-surface rounded-2xl p-4 border border-border mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">Валюта</Text>
          
          <TouchableOpacity 
            className="flex-row items-center justify-between py-3"
            onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
          >
            <Text className="text-foreground text-base">Текущая валюта</Text>
            <View className="flex-row items-center">
              <Text className="text-primary text-base font-semibold mr-2">
                {state.settings.currency} ({CURRENCIES.find(c => c.code === state.settings.currency)?.name || 'Рубль'})
              </Text>
              <IconSymbol 
                name={showCurrencyPicker ? 'chevron.left' : 'chevron.right'} 
                size={16} 
                color={colors.muted} 
              />
            </View>
          </TouchableOpacity>
          
          {showCurrencyPicker && (
            <View className="mt-2 border-t border-border pt-2">
              {CURRENCIES.map((currency) => (
                <TouchableOpacity
                  key={currency.code}
                  className="flex-row items-center justify-between py-3"
                  onPress={() => handleCurrencySelect(currency.code)}
                >
                  <Text className="text-foreground">{currency.code} — {currency.name}</Text>
                  {state.settings.currency === currency.code && (
                    <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Data Section */}
        <View className="mx-4 bg-surface rounded-2xl px-4 border border-border mb-6">
          <SettingRow
            icon="arrow.up.circle.fill"
            title="Экспорт данных"
            subtitle="Сохранить все транзакции в JSON файл"
            onPress={handleExportData}
          />
          <View className="border-b-0">
            <SettingRow
              icon="list.bullet"
              title="Всего транзакций"
              rightElement={
                <Text className="text-foreground font-semibold">{state.transactions.length}</Text>
              }
            />
          </View>
        </View>

        {/* About Section */}
        <View className="mx-4 bg-surface rounded-2xl p-4 border border-border">
          <Text className="text-lg font-semibold text-foreground mb-4">О приложении</Text>
          
          <View className="items-center py-4">
            <View 
              className="w-20 h-20 rounded-2xl items-center justify-center mb-4"
              style={{ backgroundColor: colors.primary }}
            >
              <IconSymbol name="banknote.fill" size={40} color="#FFFFFF" />
            </View>
            <Text className="text-foreground text-xl font-bold">Финансовый Менеджер</Text>
            <Text className="text-muted text-sm mt-1">Версия 1.0.0</Text>
            <Text className="text-muted text-center mt-4 px-4">
              Приложение для управления личными финансами с функцией автоматической категоризации расходов и построения прогнозов.
            </Text>
          </View>
          
          <View className="mt-4 pt-4 border-t border-border">
            <Text className="text-muted text-xs text-center">
              Разработано в рамках дипломного проекта{'\n'}
              © 2026 Все права защищены
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
