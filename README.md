# NutritionOCR

An OCR-powered nutrition tracking app built with React Native and Expo. Scan nutrition labels with your camera and track your daily nutrition intake.

## Features

- 📸 Camera-based nutrition label scanning (works on iOS Safari, Chrome, all browsers!)
- 🤖 Dual OCR engines: OCR.space (accurate, online) and Tesseract.js (offline fallback)
- ✂️ Interactive image cropping for better OCR accuracy
- 📊 Daily nutrition summaries
- 💾 Local storage with IndexedDB
- ✏️ Edit and manage scanned items
- 📱 PWA-ready for mobile and web
- 🌐 Web-optimized camera for mobile browsers with high-resolution capture

## Tech Stack

- **React Native** - Cross-platform mobile and web framework
- **Expo** - Development platform for React Native
- **TypeScript** - Type-safe development
- **React Native Paper** - Material Design UI components
- **OCR.space API** - Accurate cloud-based OCR (with Tesseract.js fallback)
- **IndexedDB** - Local data storage
- **React Navigation** - Navigation library

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on different platforms:
- **Web**: Press `w` or run `npm run web`
- **iOS**: Press `i` or run `npm run ios` (requires macOS)
- **Android**: Press `a` or run `npm run android` (requires Android Studio)
- **iPhone/Mobile (HTTPS)**: Run `npm run tunnel` for camera access

4. (Optional) Configure OCR provider:
   - See [OCR_SETUP.md](OCR_SETUP.md) for detailed OCR configuration
   - Default uses OCR.space (more accurate, requires internet)
   - Can switch to Tesseract (offline, less accurate)

## Quick Start

For the fastest setup on iPhone or mobile:
```bash
npm run tunnel
```
Then open the HTTPS URL on your device. See [QUICK_START.md](QUICK_START.md) for details.

## Usage

### Scanning a Nutrition Label

1. Tap the **+** button on the home screen
2. Point your camera at a nutrition facts label
3. Tap **Capture** to take a photo
4. **Crop the image** - drag the green box to frame just the nutrition facts section
5. Tap **Crop & Continue** to process with OCR
6. The OCR will extract nutrition data (uses OCR.space by default)
7. Review and edit the extracted data
8. Enter a product name
9. Tap **Save** to add the item

### Viewing Daily Summaries

1. On the home screen, items are grouped by day
2. Tap the **chart icon** next to any day header
3. View aggregated totals for all tracked nutrients
4. See a list of all items for that day

### Editing or Deleting Items

1. Tap on any item from the home screen
2. View detailed nutrition information
3. Tap **Edit** to modify the data
4. Tap **Delete** to remove the item

## Tracked Nutrients

The app automatically aggregates these nutrients per day:
- Calories
- Total Fat
- Sodium
- Total Carbohydrate
- Total Sugars
- Added Sugars
- Protein

Additional nutrients are also captured and stored when available.

## Project Structure

```
nutrition_facts_ocr/
├── src/
│   ├── navigation/
│   │   └── types.ts          # Navigation type definitions
│   ├── screens/
│   │   ├── HomeScreen.tsx    # Main screen with item list
│   │   ├── AddItemScreen.tsx # Camera and capture screen
│   │   ├── EditItemScreen.tsx # Form for editing nutrition data
│   │   ├── ItemDetailsScreen.tsx # View item details
│   │   └── DaySummaryScreen.tsx # Daily summary view
│   ├── services/
│   │   ├── database.ts       # IndexedDB operations
│   │   └── ocr.ts           # OCR processing (OCR.space + Tesseract)
│   ├── components/
│   │   ├── WebCamera.tsx     # Web-compatible camera component
│   │   └── ImageCropper.tsx  # Interactive image cropping tool
│   └── types/
│       └── nutrition.ts      # TypeScript type definitions
├── App.tsx                   # Main app component
├── app.json                  # Expo configuration
├── package.json
└── tsconfig.json
```

## PWA Configuration

The app is configured as a Progressive Web App with:
- Standalone display mode
- Custom theme color (#6200ee)
- Offline-capable with IndexedDB storage
- Responsive design for mobile and desktop

## Future Enhancements

- Barcode scanning for quick product lookup
- Integration with nutrition databases
- Daily goals and tracking
- Meal categorization (breakfast, lunch, dinner)
- Export data to CSV
- Dark mode support
- Multi-language support

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
