import React, { useState, useRef } from 'react';
import { View, StyleSheet, Image, ScrollView, Alert, Platform } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { ocrService } from '../services/ocr';
import { NutritionFacts } from '../types/nutrition';
import { WebCamera } from '../components/WebCamera';
import { ImageCropper } from '../components/ImageCropper';

type AddItemScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddItem'>;
};

const isWeb = Platform.OS === 'web';

export const AddItemScreen: React.FC<AddItemScreenProps> = ({ navigation }) => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [processing, setProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });

        if (photo?.uri) {
          setCapturedImage(photo.uri);
          await processImage(photo.uri);
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const processImage = async (uri: string) => {
    console.log('=== STARTING IMAGE PROCESSING ===');
    console.log('Image URI length:', uri.length);
    console.log('Image URI prefix:', uri.substring(0, 50));
    console.log('Timestamp:', new Date().toISOString());

    setProcessing(true);

    try {
      console.log('Calling ocrService.processImage...');
      const parsedData = await ocrService.processImage(uri);
      console.log('OCR completed successfully');
      console.log('Parsed data keys:', Object.keys(parsedData));

      // Check if enough data was found
      const hasEnoughData = parsedData.calories !== undefined ||
                           parsedData.protein !== undefined ||
                           parsedData.totalFat !== undefined;

      if (!hasEnoughData) {
        console.warn('Not enough nutrition data extracted from OCR');
        Alert.alert(
          'Poor Quality',
          'Could not extract nutrition information. Please try again with better lighting or angle.',
          [
            { text: 'Retry', onPress: () => { setCapturedImage(null); setProcessing(false); } },
            { text: 'Edit Manually', onPress: () => {
              // Allow manual entry even with no OCR data
              const itemData: Partial<NutritionFacts> = {
                ...parsedData,
                photoUri: uri,
                timestamp: new Date().toISOString(),
              };
              navigation.navigate('EditItem', {
                itemId: 'new',
                initialData: itemData
              } as any);
            }}
          ]
        );
        setProcessing(false);
        return;
      }

      // Navigate to edit form with parsed data
      const itemData: Partial<NutritionFacts> = {
        ...parsedData,
        photoUri: uri,
        timestamp: new Date().toISOString(),
      };

      console.log('=== NAVIGATION TO EDIT SCREEN ===');
      console.log('Item data prepared, navigating...');
      navigation.navigate('EditItem', {
        itemId: 'new',
        initialData: itemData
      } as any);

    } catch (error) {
      console.error('=== ERROR IN PROCESSING ===');
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Full error:', error);

      Alert.alert(
        'Processing Failed',
        `${error instanceof Error ? error.message : 'Unknown error'}\n\nWould you like to try again or enter data manually?`,
        [
          { text: 'Retry', onPress: () => { setCapturedImage(null); setProcessing(false); } },
          { text: 'Manual Entry', onPress: () => {
            const itemData: Partial<NutritionFacts> = {
              photoUri: uri,
              timestamp: new Date().toISOString(),
            };
            navigation.navigate('EditItem', {
              itemId: 'new',
              initialData: itemData
            } as any);
          }}
        ]
      );
      setProcessing(false);
    }
  };

  const handleWebCapture = async (imageDataUrl: string) => {
    console.log('handleWebCapture called, data URL length:', imageDataUrl.length);
    setCapturedImage(imageDataUrl);
    setShowCropper(true);
  };

  const handleCrop = async (croppedImageUri: string) => {
    console.log('handleCrop called, cropped URI length:', croppedImageUri.length);
    setShowCropper(false);
    await processImage(croppedImageUri);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setCapturedImage(null);
  };

  const handleWebError = (error: string) => {
    Alert.alert('Camera Error', error);
  };

  const retake = () => {
    setCapturedImage(null);
    setShowCropper(false);
  };

  // Show cropper for web after capture
  if (showCropper && capturedImage) {
    return <ImageCropper imageUri={capturedImage} onCrop={handleCrop} onCancel={handleCropCancel} />;
  }

  // Show processing screen
  if (capturedImage && processing) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color="#6200ee" />
            <Text variant="titleMedium" style={styles.processingText}>
              Processing nutrition label...
            </Text>
            <Text variant="bodySmall" style={styles.processingSubtext}>
              This may take up to 30 seconds
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Use WebCamera for web platform (including mobile browsers)
  if (isWeb) {
    return <WebCamera onCapture={handleWebCapture} onError={handleWebError} />;
  }

  // Use Expo Camera for native platforms
  if (!permission) {
    return <View style={styles.container}><ActivityIndicator /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to use the camera</Text>
        <Button onPress={requestPermission} mode="contained">Grant Permission</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.cameraOverlay}>
          <View style={styles.guidebox} />
        </View>
      </CameraView>

      <View style={styles.controls}>
        <Text variant="bodyMedium" style={styles.instructionText}>
          Position the nutrition label within the frame
        </Text>
        <View style={styles.buttonRow}>
          <Button
            mode="contained"
            onPress={takePicture}
            style={styles.captureButton}
            icon="camera"
          >
            Capture
          </Button>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: '#fff',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guidebox: {
    width: '80%',
    height: '60%',
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  controls: {
    backgroundColor: '#fff',
    padding: 20,
  },
  instructionText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    flex: 1,
  },
  captureButton: {
    paddingVertical: 8,
  },
  previewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  previewImage: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    marginTop: 16,
  },
  processingSubtext: {
    color: '#ccc',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
