# OCR Configuration Guide

This app supports two OCR providers for extracting nutrition facts from photos:

## OCR Providers

### 1. OCR.space (Default - Recommended)

**Pros:**
- More accurate text recognition
- Better handling of various fonts and lighting conditions
- No client-side processing (faster)
- Free tier: 25,000 requests/month

**Cons:**
- Requires internet connection
- API rate limits on free tier
- Sends images to external service

**Setup:**

1. Get a free API key (optional - demo key included):
   - Visit https://ocr.space/ocrapi
   - Sign up for a free account
   - Copy your API key

2. Configure in `.env` file:
   ```env
   EXPO_PUBLIC_OCR_PROVIDER=ocrspace
   EXPO_PUBLIC_OCRSPACE_API_KEY=your_api_key_here
   ```

### 2. Tesseract.js (Offline Fallback)

**Pros:**
- 100% offline - no internet required
- Unlimited usage - no rate limits
- Privacy - images never leave your device
- No API key needed

**Cons:**
- Less accurate than cloud-based OCR
- Slower processing (runs in browser)
- Larger download on first use (~2MB language data)

**Setup:**

Configure in `.env` file:
```env
EXPO_PUBLIC_OCR_PROVIDER=tesseract
```

## Configuration

### Using Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file:
   ```env
   # Choose provider: 'ocrspace' or 'tesseract'
   EXPO_PUBLIC_OCR_PROVIDER=ocrspace

   # OCR.space API key (only needed if using ocrspace)
   EXPO_PUBLIC_OCRSPACE_API_KEY=K87899142388957
   ```

3. Restart the development server:
   ```bash
   npm start
   ```

### Switching Providers at Runtime

The app automatically falls back to Tesseract if OCR.space fails (e.g., network issues, rate limit exceeded).

## Recommended Settings

### For Best Accuracy (Internet Required)
```env
EXPO_PUBLIC_OCR_PROVIDER=ocrspace
EXPO_PUBLIC_OCRSPACE_API_KEY=your_api_key_here
```

### For Offline/Privacy
```env
EXPO_PUBLIC_OCR_PROVIDER=tesseract
```

## Tips for Better OCR Results

Regardless of provider:

1. **Use good lighting** - Avoid shadows and glare
2. **Hold camera steady** - Blurry images reduce accuracy
3. **Crop tightly** - Frame only the nutrition facts label
4. **Get close** - Ensure text is readable to the eye
5. **High contrast** - Black text on white background works best
6. **Avoid angles** - Position camera perpendicular to label

## Troubleshooting

### OCR.space Issues

**"Rate limit exceeded":**
- You've used your monthly quota (25,000 on free tier)
- Get your own API key at https://ocr.space/ocrapi
- Or switch to Tesseract temporarily

**"Network error":**
- Check internet connection
- App will automatically fall back to Tesseract

**"No text extracted":**
- Ensure good photo quality
- Try recropping the image more tightly
- Check lighting conditions

### Tesseract Issues

**"Loading language data" (slow first time):**
- Normal - Tesseract downloads ~2MB on first use
- Subsequent uses are much faster

**"Poor accuracy":**
- Tesseract is less accurate than OCR.space
- Try using better lighting and cropping
- Consider switching to OCR.space provider

## API Key Limits

### Free Tier Limits:
- OCR.space: 25,000 requests/month
- Tesseract: Unlimited (offline)

### Getting More Requests:
If you exceed the free tier, you can:
1. Upgrade to paid plan at https://ocr.space/ocrapi
2. Switch to Tesseract (unlimited but less accurate)
3. Create multiple free accounts (not recommended)

## Privacy Considerations

**OCR.space:**
- Images are sent to OCR.space servers
- Processed according to their privacy policy: https://ocr.space/privacypolicy
- Images are not stored permanently

**Tesseract:**
- 100% local processing
- Images never leave your device
- Best for privacy-sensitive use cases
