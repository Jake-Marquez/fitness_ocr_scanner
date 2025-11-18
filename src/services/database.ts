import { NutritionFacts, GroupedItems, DaySummary } from '../types/nutrition';

const DB_NAME = 'NutritionOCR';
const DB_VERSION = 1;
const STORE_NAME = 'nutritionFacts';

class DatabaseService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
          objectStore.createIndex('date', 'date', { unique: false });
        }
      };
    });
  }

  private ensureDB(): IDBDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }

  async addItem(item: NutritionFacts): Promise<void> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateItem(item: NutritionFacts): Promise<void> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteItem(id: string): Promise<void> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getItem(id: string): Promise<NutritionFacts | undefined> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllItems(): Promise<NutritionFacts[]> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getItemsByDate(date: string): Promise<NutritionFacts[]> {
    const allItems = await this.getAllItems();
    return allItems.filter(item => {
      const itemDate = new Date(item.timestamp).toLocaleDateString('en-CA'); // YYYY-MM-DD
      return itemDate === date;
    });
  }

  async getGroupedItems(): Promise<GroupedItems> {
    const allItems = await this.getAllItems();

    // Sort by timestamp (newest first)
    allItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const grouped: GroupedItems = {};

    allItems.forEach(item => {
      const date = new Date(item.timestamp).toLocaleDateString('en-CA'); // YYYY-MM-DD
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });

    return grouped;
  }

  async getDaySummary(date: string): Promise<DaySummary> {
    const items = await this.getItemsByDate(date);

    const summary: DaySummary = {
      date,
      totalCalories: 0,
      totalFat: 0,
      totalSodium: 0,
      totalCarb: 0,
      totalSugars: 0,
      totalAddedSugars: 0,
      totalProtein: 0,
      items,
    };

    items.forEach(item => {
      // Multiply each nutrient by servingsConsumed (default to 1 if not set)
      const servings = item.servingsConsumed || 1;

      summary.totalCalories += (item.calories || 0) * servings;
      summary.totalFat += (item.totalFat || 0) * servings;
      summary.totalSodium += (item.sodium || 0) * servings;
      summary.totalCarb += (item.totalCarb || 0) * servings;
      summary.totalSugars += (item.totalSugars || 0) * servings;
      summary.totalAddedSugars += (item.addedSugars || 0) * servings;
      summary.totalProtein += (item.protein || 0) * servings;
    });

    return summary;
  }
}

export const db = new DatabaseService();
