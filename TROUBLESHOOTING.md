# Troubleshooting Guide

## Camera Issues

### Black Screen on Safari (iOS/Desktop)

**Problem**: Camera shows a black screen when accessing the app on Safari (especially mobile Safari).

**Solution**: The app now uses a web-specific camera implementation that works with Safari. Make sure:

1. **USE HTTPS FOR LOCAL NETWORK TESTING** ⚠️

   **If accessing from iPhone over local network (e.g., http://192.168.x.x:8081):**

   Browsers require HTTPS for camera access. Use Expo's tunnel feature:

   ```bash
   npm run tunnel
   ```

   This creates an HTTPS URL (like `https://abc123.exp.direct`) that works with the camera!

   See [LOCAL_NETWORK_HTTPS.md](LOCAL_NETWORK_HTTPS.md) for detailed setup instructions.

2. **Camera permissions are granted**:
   - iOS Safari: Go to Settings > Safari > Camera > Allow
   - Desktop Safari: Safari > Preferences > Websites > Camera > Allow

3. **You're using HTTPS** (required for camera access):
   - Local development on `localhost` works fine (HTTP ok)
   - **Local network (192.168.x.x): MUST use tunnel or HTTPS**
   - For production, ensure your site uses HTTPS
   - GitHub Pages, Netlify, Vercel all provide HTTPS automatically

4. **Clear browser cache**:
   - Settings > Safari > Clear History and Website Data
   - Or use Private Browsing mode to test

5. **Try these steps**:
   - Refresh the page
   - Force quit Safari and reopen
   - Restart your device if the issue persists

### Camera Not Working on Desktop Browsers

**Chrome/Edge**:
1. Check permissions: Click the camera icon in the address bar
2. Go to Settings > Privacy and security > Site Settings > Camera
3. Make sure your camera is selected and the site is allowed

**Firefox**:
1. Click the camera icon in the address bar
2. Check "Remember this decision"
3. Select "Allow"

### Camera Permission Denied

If you accidentally denied camera permission:

**iOS Safari**:
1. Settings > Safari > Camera
2. Set to "Ask" or "Allow"

**Chrome**:
1. Click the lock/info icon in address bar
2. Click "Site settings"
3. Change Camera to "Allow"

**Firefox**:
1. Click the info icon in address bar
2. Click "Clear permissions"
3. Refresh and allow when prompted

## OCR Issues

### "Poor Quality" Error

If OCR can't read the nutrition label:

1. **Better lighting**: Use bright, even lighting
2. **Reduce glare**: Avoid reflective surfaces
3. **Focus**: Make sure the label is clear and in focus
4. **Orientation**: Hold the camera straight, not at an angle
5. **Distance**: Get close enough to read the text clearly
6. **Frame properly**: Keep the entire nutrition facts panel within the guidebox

### Incorrect Values Extracted

The OCR parsing isn't perfect. If values are wrong:

1. Use the **Edit** screen to manually correct values
2. Make sure the product name is correct
3. Double-check before saving

### Slow OCR Processing

First-time OCR can be slow (10-30 seconds) because:
- Tesseract.js downloads language data
- Subsequent scans will be faster
- Be patient on the first scan

## Database Issues

### Items Not Saving

1. Check browser console for errors (F12)
2. IndexedDB might be disabled:
   - Check browser settings
   - Try incognito/private mode
   - Clear site data and try again

### Data Lost After Browser Update

IndexedDB data is stored locally:
- Clearing browser data will delete items
- Use Export feature (future enhancement) to backup
- For now, items are device-specific

## Performance Issues

### App Running Slow

1. **Clear browser cache**
2. **Close other tabs** using camera
3. **Check device storage** - ensure you have space
4. **Update browser** to the latest version

### High Memory Usage

- Tesseract.js can use significant memory
- Close the app when not in use
- Restart browser if it becomes sluggish

## Installation Issues (PWA)

### Can't Install as App

**iOS Safari**:
1. Tap the Share button
2. Scroll down and tap "Add to Home Screen"
3. Name the app and tap "Add"

**Chrome (Android)**:
1. Tap the menu (three dots)
2. Tap "Install app" or "Add to Home screen"

**Chrome (Desktop)**:
1. Click the install icon in the address bar
2. Or: Menu > Install NutritionOCR

## Development Issues

### Metro Bundler Errors

```bash
# Clear cache and restart
npx expo start -c
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
# Check for errors
npx tsc --noEmit

# Restart TypeScript server in VSCode
Ctrl+Shift+P > "Restart TypeScript Server"
```

## Platform-Specific Issues

### iOS Native App (Expo Go)

If camera doesn't work in Expo Go:
- Make sure you granted camera permission when prompted
- Reinstall Expo Go app
- Try building a development client instead

### Android Native App

- Enable camera permission in Android settings
- If using emulator, make sure webcam is enabled
- Check that your device/emulator has a camera

## Still Having Issues?

1. **Check browser console** (F12 > Console) for error messages
2. **Try a different browser** to isolate the issue
3. **Update your browser** to the latest version
4. **Test on a different device** to see if it's device-specific
5. **Report the issue** with:
   - Device and OS version
   - Browser and version
   - Steps to reproduce
   - Console error messages (if any)

## Known Limitations

1. **OCR Accuracy**: Not 100% accurate, always review extracted data
2. **Web Only**: Camera features work best on web, native apps need Expo Go or dev client
3. **Browser Support**: Best on Chrome, Edge, Firefox. Safari works but may have quirks
4. **Offline**: OCR requires initial download, then works offline
5. **Image Storage**: Photos are stored as data URLs, may use storage
