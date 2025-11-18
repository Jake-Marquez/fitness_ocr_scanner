import { createWorker } from 'tesseract.js';
import { NutritionFacts } from '../types/nutrition';

type OCRProvider = 'tesseract' | 'ocrspace';

interface OCRSpaceResponse {
  ParsedResults?: Array<{
    ParsedText: string;
    ErrorMessage?: string;
    ErrorDetails?: string;
  }>;
  ErrorMessage?: string;
  IsErroredOnProcessing?: boolean;
}

export class OCRService {
  private worker: Tesseract.Worker | null = null;
  private provider: OCRProvider;
  private ocrSpaceApiKey: string;

  constructor() {
    // Read from environment variables with fallback defaults
    this.provider = (process.env.EXPO_PUBLIC_OCR_PROVIDER as OCRProvider) || 'ocrspace';
    this.ocrSpaceApiKey = process.env.EXPO_PUBLIC_OCRSPACE_API_KEY || 'K87899142388957';

    console.log('OCR Service initialized with provider:', this.provider);
  }

  setProvider(provider: OCRProvider) {
    this.provider = provider;
  }

  async init(): Promise<void> {
    if (this.provider === 'tesseract') {
      this.worker = await createWorker('eng');
    }
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }

  async extractTextWithOCRSpace(imageUri: string): Promise<string> {
    console.log('Using OCR.space API for OCR...');
    console.log('Image URI prefix:', imageUri.substring(0, 50));
    console.log('Image size (bytes):', imageUri.length);

    // Create form data
    const formData = new FormData();
    formData.append('base64Image', imageUri);
    formData.append('apikey', this.ocrSpaceApiKey);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2'); // Engine 2 is more accurate

    try {
      console.log('Sending request to OCR.space...');
      const startTime = Date.now();

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const elapsed = Date.now() - startTime;
      console.log(`OCR.space request completed in ${elapsed}ms`);

      if (!ocrResponse.ok) {
        throw new Error(`HTTP ${ocrResponse.status}: ${ocrResponse.statusText}`);
      }

      const result: OCRSpaceResponse = await ocrResponse.json();
      console.log('OCR.space response status:', result.IsErroredOnProcessing ? 'ERROR' : 'SUCCESS');

      if (result.IsErroredOnProcessing) {
        throw new Error(result.ErrorMessage || 'OCR processing failed');
      }

      if (result.ParsedResults && result.ParsedResults.length > 0) {
        const parsedText = result.ParsedResults[0].ParsedText;
        console.log('OCR.space extracted text length:', parsedText.length);
        console.log('OCR.space text preview:', parsedText.substring(0, 100));
        return parsedText;
      }

      throw new Error('No text extracted from image');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('OCR.space timeout after 30 seconds');
        throw new Error('OCR request timed out. Please try again.');
      }
      console.error('OCR.space error:', error);
      throw new Error(`OCR.space failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async extractTextWithTesseract(imageUri: string): Promise<string> {
    if (!this.worker) {
      console.log('Initializing Tesseract worker...');
      await this.init();
    }

    console.log('Starting Tesseract OCR on image, URI length:', imageUri.length);

    try {
      const result = await this.worker!.recognize(imageUri);
      console.log('Tesseract OCR completed, text length:', result.data.text.length);
      return result.data.text;
    } catch (error) {
      console.error('Tesseract OCR error:', error);
      throw new Error(`Tesseract failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async extractText(imageUri: string): Promise<string> {
    console.log(`Using OCR provider: ${this.provider}`);
    const originalProvider = this.provider;

    if (this.provider === 'ocrspace') {
      try {
        return await this.extractTextWithOCRSpace(imageUri);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn('OCR.space failed:', errorMessage);

        // Check if it's a network/timeout error - only then fallback
        const isNetworkError = errorMessage.includes('timeout') ||
                              errorMessage.includes('network') ||
                              errorMessage.includes('HTTP') ||
                              errorMessage.includes('fetch');

        if (isNetworkError) {
          console.log('Network error detected, falling back to Tesseract (offline mode)...');
          try {
            const result = await this.extractTextWithTesseract(imageUri);
            console.log('Tesseract fallback succeeded');
            return result;
          } catch (tesseractError) {
            console.error('Tesseract fallback also failed:', tesseractError);
            throw new Error('Both OCR providers failed. Please check your internet connection and try again.');
          }
        } else {
          // If it's not a network error, don't fallback - just rethrow
          throw error;
        }
      } finally {
        // Restore original provider preference
        this.provider = originalProvider;
      }
    } else {
      return await this.extractTextWithTesseract(imageUri);
    }
  }

  parseNutritionFacts(text: string): Partial<NutritionFacts> {
    const parsed: Partial<NutritionFacts> = {
      rawOcrText: text,
    };

    // Helper to extract number from text
    const extractNumber = (pattern: RegExp): number | undefined => {
      const match = text.match(pattern);
      if (match && match[1]) {
        const num = parseFloat(match[1].replace(/,/g, ''));
        return isNaN(num) ? undefined : num;
      }
      return undefined;
    };

    // Helper to extract text value
    const extractText = (pattern: RegExp): string | undefined => {
      const match = text.match(pattern);
      return match ? match[1].trim() : undefined;
    };

    // Serving size
    parsed.servingSize = extractText(/serving size[:\s]+([^\n]+)/i);
    parsed.servingsPerContainer = extractText(/servings per container[:\s]+([^\n]+)/i);

    // Calories (most common patterns)
    parsed.calories = extractNumber(/calories[:\s]+(\d+)/i) ||
                     extractNumber(/amount per serving[:\s\S]*?(\d+)\s*calories/i);

    // Total Fat
    parsed.totalFat = extractNumber(/total fat[:\s]+(\d+\.?\d*)g/i);
    parsed.saturatedFat = extractNumber(/saturated fat[:\s]+(\d+\.?\d*)g/i);
    parsed.transFat = extractNumber(/trans fat[:\s]+(\d+\.?\d*)g/i);

    // Cholesterol
    parsed.cholesterol = extractNumber(/cholesterol[:\s]+(\d+\.?\d*)mg/i);

    // Sodium
    parsed.sodium = extractNumber(/sodium[:\s]+(\d+\.?\d*)mg/i);

    // Total Carbohydrate
    parsed.totalCarb = extractNumber(/total carbohydrate[:\s]+(\d+\.?\d*)g/i) ||
                      extractNumber(/total carb\.?[:\s]+(\d+\.?\d*)g/i);

    // Dietary Fiber
    parsed.dietaryFiber = extractNumber(/dietary fiber[:\s]+(\d+\.?\d*)g/i);

    // Sugars
    parsed.totalSugars = extractNumber(/total sugars[:\s]+(\d+\.?\d*)g/i) ||
                        extractNumber(/sugars[:\s]+(\d+\.?\d*)g/i);

    parsed.addedSugars = extractNumber(/(?:incl\.?|includes?)\s+(\d+\.?\d*)g?\s+added sugars/i) ||
                        extractNumber(/added sugars[:\s]+(\d+\.?\d*)g/i);

    // Protein
    parsed.protein = extractNumber(/protein[:\s]+(\d+\.?\d*)g/i);

    // Vitamins and minerals
    parsed.vitaminD = extractNumber(/vitamin d[:\s]+(\d+\.?\d*)/i);
    parsed.calcium = extractNumber(/calcium[:\s]+(\d+\.?\d*)/i);
    parsed.iron = extractNumber(/iron[:\s]+(\d+\.?\d*)/i);
    parsed.potassium = extractNumber(/potassium[:\s]+(\d+\.?\d*)/i);

    return parsed;
  }

  async processImage(imageUri: string): Promise<Partial<NutritionFacts>> {
    const text = await this.extractText(imageUri);
    return this.parseNutritionFacts(text);
  }
}

export const ocrService = new OCRService();
