// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 */
const MAPPING = {
  // Navigation icons
  "house.fill": "home",
  "list.bullet": "list",
  "chart.pie.fill": "pie-chart",
  "chart.line.uptrend.xyaxis": "trending-up",
  "gear": "settings",
  
  // Action icons
  "plus.circle.fill": "add-circle",
  "minus.circle.fill": "remove-circle",
  "arrow.up.circle.fill": "arrow-upward",
  "arrow.down.circle.fill": "arrow-downward",
  "trash.fill": "delete",
  "pencil": "edit",
  "checkmark.circle.fill": "check-circle",
  "xmark.circle.fill": "cancel",
  
  // Category icons
  "cart.fill": "shopping-cart",
  "car.fill": "directions-car",
  "film.fill": "movie",
  "fork.knife": "restaurant",
  "heart.fill": "favorite",
  "tshirt.fill": "checkroom",
  "house.lodge.fill": "home",
  "ellipsis.circle.fill": "more-horiz",
  "creditcard.fill": "credit-card",
  "banknote.fill": "payments",
  
  // Other icons
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "calendar": "calendar-today",
  "magnifyingglass": "search",
  "person.fill": "person",
  "info.circle.fill": "info",
  "exclamationmark.triangle.fill": "warning",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
