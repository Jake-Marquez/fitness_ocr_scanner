import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { Text, Button, Card, Divider, ActivityIndicator } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { NutritionFacts } from '../types/nutrition';
import { db } from '../services/database';

type ItemDetailsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ItemDetails'>;
  route: RouteProp<RootStackParamList, 'ItemDetails'>;
};

export const ItemDetailsScreen: React.FC<ItemDetailsScreenProps> = ({ navigation, route }) => {
  const { itemId } = route.params;
  const [item, setItem] = useState<NutritionFacts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItem();
  }, [itemId]);

  const loadItem = async () => {
    try {
      await db.init();
      const loadedItem = await db.getItem(itemId);
      setItem(loadedItem || null);
    } catch (error) {
      console.error('Error loading item:', error);
      Alert.alert('Error', 'Failed to load item');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditItem', { itemId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await db.init();
              await db.deleteItem(itemId);
              navigation.navigate('Home');
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

  if (!item) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Item not found</Text>
      </View>
    );
  }

  const NutrientRow = ({ label, value, unit = '' }: { label: string; value?: number; unit?: string }) => {
    if (value === undefined) return null;

    return (
      <View style={styles.nutrientRow}>
        <Text variant="bodyLarge">{label}</Text>
        <Text variant="bodyLarge" style={styles.nutrientValue}>
          {value}{unit}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {item.photoUri && (
          <Image source={{ uri: item.photoUri }} style={styles.photo} />
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.productName}>
              {item.productName}
            </Text>
            <Text variant="bodyMedium" style={styles.timestamp}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Serving Information
            </Text>
            {item.servingSize && (
              <Text variant="bodyLarge">Serving Size: {item.servingSize}</Text>
            )}
            {item.servingsPerContainer && (
              <Text variant="bodyLarge">
                Servings per Container: {item.servingsPerContainer}
              </Text>
            )}
            <Text variant="bodyLarge" style={styles.servingsConsumed}>
              Servings Consumed: {item.servingsConsumed || 1}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.sectionTitle}>
              Nutrition Facts (per serving)
            </Text>
            <Text variant="bodySmall" style={styles.helperText}>
              Daily totals = values below × {item.servingsConsumed || 1} serving{(item.servingsConsumed || 1) !== 1 ? 's' : ''}
            </Text>

            <NutrientRow label="Calories" value={item.calories} />
            <Divider style={styles.divider} />

            <NutrientRow label="Total Fat" value={item.totalFat} unit="g" />
            {item.saturatedFat !== undefined && (
              <View style={styles.indented}>
                <NutrientRow label="Saturated Fat" value={item.saturatedFat} unit="g" />
              </View>
            )}
            {item.transFat !== undefined && (
              <View style={styles.indented}>
                <NutrientRow label="Trans Fat" value={item.transFat} unit="g" />
              </View>
            )}

            <NutrientRow label="Cholesterol" value={item.cholesterol} unit="mg" />
            <NutrientRow label="Sodium" value={item.sodium} unit="mg" />

            <NutrientRow label="Total Carbohydrate" value={item.totalCarb} unit="g" />
            {item.dietaryFiber !== undefined && (
              <View style={styles.indented}>
                <NutrientRow label="Dietary Fiber" value={item.dietaryFiber} unit="g" />
              </View>
            )}
            {item.totalSugars !== undefined && (
              <View style={styles.indented}>
                <NutrientRow label="Total Sugars" value={item.totalSugars} unit="g" />
                {item.addedSugars !== undefined && (
                  <View style={styles.indented}>
                    <NutrientRow label="Incl. Added Sugars" value={item.addedSugars} unit="g" />
                  </View>
                )}
              </View>
            )}

            <Divider style={styles.divider} />
            <NutrientRow label="Protein" value={item.protein} unit="g" />

            {(item.vitaminD !== undefined ||
              item.calcium !== undefined ||
              item.iron !== undefined ||
              item.potassium !== undefined) && (
              <>
                <Divider style={styles.divider} />
                <NutrientRow label="Vitamin D" value={item.vitaminD} unit="mcg" />
                <NutrientRow label="Calcium" value={item.calcium} unit="mg" />
                <NutrientRow label="Iron" value={item.iron} unit="mg" />
                <NutrientRow label="Potassium" value={item.potassium} unit="mg" />
              </>
            )}
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleEdit}
            style={styles.button}
            icon="pencil"
          >
            Edit
          </Button>
          <Button
            mode="outlined"
            onPress={handleDelete}
            style={styles.button}
            buttonColor="#ffebee"
            textColor="#c62828"
            icon="delete"
          >
            Delete
          </Button>
        </View>

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
  photo: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 16,
    resizeMode: 'contain',
    backgroundColor: '#000',
  },
  card: {
    marginBottom: 16,
  },
  productName: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  timestamp: {
    color: '#666',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  helperText: {
    marginBottom: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  servingsConsumed: {
    fontWeight: '600',
    color: '#6200ee',
    marginTop: 4,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  nutrientValue: {
    fontWeight: '600',
  },
  indented: {
    marginLeft: 20,
  },
  divider: {
    marginVertical: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 6,
  },
  bottomPadding: {
    height: 40,
  },
});
