# Setup Guide

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create placeholder assets** (optional - app will work without these):

   Create the following files in the `assets/` directory:
   - `icon.png` (1024x1024 px) - App icon
   - `splash.png` (2048x2048 px) - Splash screen
   - `adaptive-icon.png` (1024x1024 px) - Android adaptive icon
   - `favicon.png` (48x48 px) - Web favicon

   You can use any image editing tool or generate placeholder images online.

3. **Start the development server**:

   **For local testing on your computer:**
   ```bash
   npm start
   ```
   Then press `w` for web browser

   **For testing on iPhone/mobile device over network (RECOMMENDED):**
   ```bash
   npm run tunnel
   ```
   This creates an HTTPS tunnel so the camera works on your phone!
   Open the HTTPS URL (like `https://abc123.exp.direct`) on your phone.

4. **Run the app**:
   - Press `w` for web
   - Press `i` for iOS simulator (macOS only)
   - Press `a` for Android emulator
   - For iPhone testing: Use `npm run tunnel` (see above)

## Web Development

For web-only development:
```bash
npm run web
```

The app will open in your browser at `http://localhost:8081` (or another port).

### Camera Access on Web

- The app requires camera permissions to scan nutrition labels
- Modern browsers require HTTPS for camera access (except localhost)
- **For iPhone testing over local network**: Use `npm run tunnel` to get HTTPS
- If deploying to production, ensure you have HTTPS configured

### Testing on iPhone/Mobile Devices

**IMPORTANT**: Camera requires HTTPS when accessing from mobile devices over the network.

**Option 1 - Expo Tunnel (RECOMMENDED)**:
```bash
npm run tunnel
```
- Creates an HTTPS URL automatically
- Works with camera on all devices
- Slower than LAN but most reliable

**Option 2 - Local Network (HTTP - Camera won't work)**:
```bash
npm start
```
- Faster but camera will NOT work on mobile Safari
- Only use for non-camera features

See [LOCAL_NETWORK_HTTPS.md](LOCAL_NETWORK_HTTPS.md) for detailed HTTPS setup options.

## Mobile Development

### iOS (macOS only)

1. Install Xcode from the App Store
2. Install Xcode Command Line Tools:
   ```bash
   xcode-select --install
   ```
3. Run:
   ```bash
   npm run ios
   ```

### Android

1. Install Android Studio
2. Set up an Android Virtual Device (AVD) or connect a physical device
3. Run:
   ```bash
   npm run android
   ```

### Using Expo Go

1. Install Expo Go on your mobile device:
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. Start the development server:
   ```bash
   npm start
   ```

3. Scan the QR code with your device camera (iOS) or Expo Go app (Android)

## Troubleshooting

### TypeScript Errors

Run type checking:
```bash
npx tsc --noEmit
```

### Clear Cache

If you encounter issues:
```bash
npx expo start -c
```

### Module Not Found Errors

Clean install:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Camera Not Working on Web

- Ensure you're using HTTPS or localhost
- Check browser permissions (chrome://settings/content/camera)
- Try a different browser (Chrome/Edge recommended)

## Building for Production

### Web (PWA)

```bash
npx expo export:web
```

The build output will be in the `web-build/` directory. Deploy this to any static hosting service (Netlify, Vercel, GitHub Pages, etc.).

### iOS

```bash
eas build --platform ios
```

### Android

```bash
eas build --platform android
```

Note: Building for iOS and Android requires setting up EAS Build: https://docs.expo.dev/build/setup/

## Environment Notes

- **IndexedDB**: Used for local storage (web only). On mobile, React Native's AsyncStorage could be used instead.
- **Tesseract.js**: OCR processing happens client-side. First load may be slow as it downloads language data.
- **Camera**: Uses Expo Camera API. Falls back to file input on unsupported platforms.

## Next Steps

After setup, refer to [README.md](README.md) for usage instructions and feature documentation.
