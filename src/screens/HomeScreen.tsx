import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, FAB, Card, IconButton, List } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import { db } from '../services/database';
import { GroupedItems } from '../types/nutrition';
import { RootStackParamList } from '../navigation/types';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [groupedItems, setGroupedItems] = useState<GroupedItems>({});
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  const loadData = async () => {
    try {
      await db.init();
      const items = await db.getGroupedItems();
      setGroupedItems(items);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = date.toLocaleDateString('en-CA');
    const todayOnly = today.toLocaleDateString('en-CA');
    const yesterdayOnly = yesterday.toLocaleDateString('en-CA');

    if (dateOnly === todayOnly) {
      return 'Today';
    } else if (dateOnly === yesterdayOnly) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const sortedDates = Object.keys(groupedItems).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {sortedDates.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text variant="titleMedium" style={styles.emptyText}>
              No items yet
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Tap the + button to scan your first nutrition label
            </Text>
          </View>
        ) : (
          sortedDates.map((date) => (
            <View key={date} style={styles.daySection}>
              <View style={styles.dayHeader}>
                <Text variant="titleLarge" style={styles.dayTitle}>
                  {formatDate(date)}
                </Text>
                <IconButton
                  icon="chart-box"
                  size={24}
                  onPress={() => navigation.navigate('DaySummary', { date })}
                />
              </View>
              {groupedItems[date].map((item) => (
                <Card
                  key={item.id}
                  style={styles.card}
                  onPress={() => navigation.navigate('ItemDetails', { itemId: item.id })}
                >
                  <Card.Content>
                    <View style={styles.cardHeader}>
                      <Text variant="titleMedium">{item.productName || 'Unnamed Product'}</Text>
                      <Text variant="bodySmall" style={styles.timeText}>
                        {formatTime(item.timestamp)}
                      </Text>
                    </View>
                    <View style={styles.nutritionPreview}>
                      {item.calories !== undefined && (
                        <Text variant="bodyMedium">Calories: {item.calories}</Text>
                      )}
                      {item.protein !== undefined && (
                        <Text variant="bodySmall">Protein: {item.protein}g</Text>
                      )}
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddItem')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyText: {
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#666',
  },
  daySection: {
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dayTitle: {
    fontWeight: 'bold',
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    color: '#666',
  },
  nutritionPreview: {
    gap: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
