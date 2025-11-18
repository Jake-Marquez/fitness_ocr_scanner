import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Divider, ActivityIndicator, List } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { DaySummary } from '../types/nutrition';
import { db } from '../services/database';

type DaySummaryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DaySummary'>;
  route: RouteProp<RootStackParamList, 'DaySummary'>;
};

export const DaySummaryScreen: React.FC<DaySummaryScreenProps> = ({ navigation, route }) => {
  const { date } = route.params;
  const [summary, setSummary] = useState<DaySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, [date]);

  const loadSummary = async () => {
    try {
      await db.init();
      const daySummary = await db.getDaySummary(date);
      setSummary(daySummary);
    } catch (error) {
      console.error('Error loading summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No data available</Text>
      </View>
    );
  }

  const SummaryRow = ({ label, value, unit = '' }: { label: string; value: number; unit?: string }) => {
    return (
      <View style={styles.summaryRow}>
        <Text variant="titleMedium">{label}</Text>
        <Text variant="titleMedium" style={styles.summaryValue}>
          {value.toFixed(1)}{unit}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.dateTitle}>
              {formatDate(date)}
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Daily Summary
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.sectionTitle}>
              Total Nutrition
            </Text>

            <SummaryRow label="Calories" value={summary.totalCalories} />
            <Divider style={styles.divider} />

            <SummaryRow label="Total Fat" value={summary.totalFat} unit="g" />
            <SummaryRow label="Sodium" value={summary.totalSodium} unit="mg" />
            <SummaryRow label="Total Carbohydrate" value={summary.totalCarb} unit="g" />
            <View style={styles.indented}>
              <SummaryRow label="Total Sugars" value={summary.totalSugars} unit="g" />
              <View style={styles.indented}>
                <SummaryRow label="Incl. Added Sugars" value={summary.totalAddedSugars} unit="g" />
              </View>
            </View>

            <Divider style={styles.divider} />
            <SummaryRow label="Protein" value={summary.totalProtein} unit="g" />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Items ({summary.items.length})
            </Text>
          </Card.Content>

          <List.Section>
            {summary.items.map((item) => (
              <List.Item
                key={item.id}
                title={item.productName || 'Unnamed Product'}
                description={`${formatTime(item.timestamp)} • ${item.calories || 0} cal`}
                left={props => <List.Icon {...props} icon="food-apple" />}
                onPress={() => navigation.navigate('ItemDetails', { itemId: item.id })}
                style={styles.listItem}
              />
            ))}
          </List.Section>
        </Card>

        <View style={styles.bottomPadding} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  dateTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#666',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  summaryValue: {
    fontWeight: '700',
    color: '#2196F3',
  },
  indented: {
    marginLeft: 20,
  },
  divider: {
    marginVertical: 8,
  },
  listItem: {
    paddingHorizontal: 16,
  },
  bottomPadding: {
    height: 40,
  },
});
