import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { NutritionFacts } from '../types/nutrition';
import { db } from '../services/database';

type EditItemScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EditItem'>;
  route: RouteProp<RootStackParamList, 'EditItem'>;
};

export const EditItemScreen: React.FC<EditItemScreenProps> = ({ navigation, route }) => {
  const { itemId, initialData } = route.params as any;
  const isNewItem = itemId === 'new';

  const [formData, setFormData] = useState<Partial<NutritionFacts>>({
    productName: '',
    calories: undefined,
    totalFat: undefined,
    sodium: undefined,
    totalCarb: undefined,
    totalSugars: undefined,
    addedSugars: undefined,
    protein: undefined,
    servingSize: '',
    servingsConsumed: 1, // Default to 1 serving
    ...initialData,
  });

  useEffect(() => {
    if (!isNewItem) {
      loadItem();
    }
  }, [itemId]);

  const loadItem = async () => {
    try {
      await db.init();
      const item = await db.getItem(itemId);
      if (item) {
        setFormData(item);
      }
    } catch (error) {
      console.error('Error loading item:', error);
      Alert.alert('Error', 'Failed to load item');
    }
  };

  const updateField = (field: keyof NutritionFacts, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateNumberField = (field: keyof NutritionFacts, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    setFormData(prev => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const handleSave = async () => {
    if (!formData.productName?.trim()) {
      Alert.alert('Missing Information', 'Please enter a product name');
      return;
    }

    try {
      await db.init();

      const itemToSave: NutritionFacts = {
        id: isNewItem ? Date.now().toString() : itemId,
        productName: formData.productName,
        timestamp: formData.timestamp || new Date().toISOString(),
        photoUri: formData.photoUri,
        rawOcrText: formData.rawOcrText,
        servingsConsumed: formData.servingsConsumed || 1, // Ensure default is 1
        calories: formData.calories,
        totalFat: formData.totalFat,
        sodium: formData.sodium,
        totalCarb: formData.totalCarb,
        totalSugars: formData.totalSugars,
        addedSugars: formData.addedSugars,
        protein: formData.protein,
        servingSize: formData.servingSize,
        servingsPerContainer: formData.servingsPerContainer,
        saturatedFat: formData.saturatedFat,
        transFat: formData.transFat,
        cholesterol: formData.cholesterol,
        dietaryFiber: formData.dietaryFiber,
        vitaminD: formData.vitaminD,
        calcium: formData.calcium,
        iron: formData.iron,
        potassium: formData.potassium,
      };

      if (isNewItem) {
        await db.addItem(itemToSave);
      } else {
        await db.updateItem(itemToSave);
      }

      navigation.navigate('Home');
    } catch (error) {
      console.error('Error saving item:', error);
      Alert.alert('Error', 'Failed to save item');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {formData.photoUri && (
          <Image source={{ uri: formData.photoUri }} style={styles.photo} />
        )}

        {formData.rawOcrText && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                OCR Debug Info
              </Text>
              <Text variant="bodySmall" style={styles.debugText}>
                Raw text extracted from image:
              </Text>
              <View style={styles.debugBox}>
                <Text variant="bodySmall" style={styles.debugContent}>
                  {formData.rawOcrText}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Product Information
            </Text>

            <TextInput
              label="Product Name *"
              value={formData.productName}
              onChangeText={(value) => updateField('productName', value)}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Serving Size"
              value={formData.servingSize}
              onChangeText={(value) => updateField('servingSize', value)}
              style={styles.input}
              mode="outlined"
              placeholder="e.g., 1 cup (240ml)"
            />

            <TextInput
              label="Servings Consumed *"
              value={formData.servingsConsumed?.toString() || '1'}
              onChangeText={(value) => updateNumberField('servingsConsumed', value)}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
              placeholder="How many servings did you eat?"
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Nutrition Facts (per serving)
            </Text>
            <Text variant="bodySmall" style={styles.helperText}>
              Values below are per serving. Daily totals will be multiplied by servings consumed.
            </Text>

            <TextInput
              label="Calories"
              value={formData.calories?.toString() || ''}
              onChangeText={(value) => updateNumberField('calories', value)}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Total Fat (g)"
              value={formData.totalFat?.toString() || ''}
              onChangeText={(value) => updateNumberField('totalFat', value)}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Sodium (mg)"
              value={formData.sodium?.toString() || ''}
              onChangeText={(value) => updateNumberField('sodium', value)}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Total Carbohydrate (g)"
              value={formData.totalCarb?.toString() || ''}
              onChangeText={(value) => updateNumberField('totalCarb', value)}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Total Sugars (g)"
              value={formData.totalSugars?.toString() || ''}
              onChangeText={(value) => updateNumberField('totalSugars', value)}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Incl. Added Sugars (g)"
              value={formData.addedSugars?.toString() || ''}
              onChangeText={(value) => updateNumberField('addedSugars', value)}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Protein (g)"
              value={formData.protein?.toString() || ''}
              onChangeText={(value) => updateNumberField('protein', value)}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          icon="content-save"
        >
          {isNewItem ? 'Save' : 'Update'}
        </Button>

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
  content: {
    padding: 16,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    resizeMode: 'contain',
    backgroundColor: '#000',
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  helperText: {
    marginBottom: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  input: {
    marginBottom: 12,
  },
  saveButton: {
    paddingVertical: 8,
    marginTop: 8,
  },
  bottomPadding: {
    height: 40,
  },
  debugText: {
    marginBottom: 8,
    color: '#666',
  },
  debugBox: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 200,
  },
  debugContent: {
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 16,
  },
});
