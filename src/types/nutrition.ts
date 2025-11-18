export interface NutritionFacts {
  id: string;
  productName: string;
  timestamp: string; // ISO string with local timezone
  photoUri?: string;
  rawOcrText?: string;

  // Serving information
  servingSize?: string;
  servingsPerContainer?: string;
  servingsConsumed: number; // How many servings were actually consumed (default: 1)

  // Tracked nutrition values (per serving from label)
  calories?: number;
  totalFat?: number;
  sodium?: number;
  totalCarb?: number;
  totalSugars?: number;
  addedSugars?: number;
  protein?: number;

  // Additional fields captured by OCR
  saturatedFat?: number;
  transFat?: number;
  cholesterol?: number;
  dietaryFiber?: number;
  vitaminD?: number;
  calcium?: number;
  iron?: number;
  potassium?: number;
}

export interface DaySummary {
  date: string; // YYYY-MM-DD format
  totalCalories: number;
  totalFat: number;
  totalSodium: number;
  totalCarb: number;
  totalSugars: number;
  totalAddedSugars: number;
  totalProtein: number;
  items: NutritionFacts[];
}

export interface GroupedItems {
  [date: string]: NutritionFacts[];
}
