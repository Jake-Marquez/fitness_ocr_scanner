# Quick Start Guide

## Test on iPhone (RECOMMENDED)

```bash
# 1. Install dependencies
npm install

# 2. Start with HTTPS tunnel (for camera support)
npm run tunnel

# 3. Wait for the HTTPS URL to appear
# Look for: https://abc123.exp.direct

# 4. Open that URL on your iPhone's Safari

# 5. Grant camera permission when prompted

# 6. Done! Camera should work perfectly ✅
```

## Test on Your Computer

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm start

# 3. Press 'w' for web browser

# 4. Open http://localhost:8081

# 5. Grant camera permission

# 6. Done! ✅
```

## Available Commands

| Command | Purpose | HTTPS | Camera Works? |
|---------|---------|-------|---------------|
| `npm start` | Standard dev server | ❌ | Only localhost |
| `npm run tunnel` | HTTPS tunnel | ✅ | Everywhere! ⭐ |
| `npm run web` | Web only | ❌ | Only localhost |

## Troubleshooting

### Camera not working on iPhone?
👉 Make sure you're using `npm run tunnel` (not `npm start`)

### Tunnel is slow?
- First load is always slower (setting up tunnel)
- Subsequent loads are faster
- Worth it for HTTPS camera access!

### Can't connect?
1. Check your internet connection
2. Try: `npx expo start -c --tunnel` (clear cache)
3. Restart the dev server

## Using the App

1. **Take a photo** of a nutrition facts label
2. **Crop the image** - drag the green box to frame just the nutrition facts section
3. **OCR processing** - the app extracts nutrition data automatically
4. **Review & edit** - verify the extracted data and add a product name
5. **Save** - your item is saved and added to your daily totals!

## Tips for Best Results

- **Crop tightly** around the nutrition facts label to improve OCR accuracy
- Use good lighting and avoid glare
- Hold camera steady and get close enough to read the text clearly
- The cropping step significantly improves OCR performance!

## Next Steps

- See [SETUP.md](SETUP.md) for full setup guide
- See [LOCAL_NETWORK_HTTPS.md](LOCAL_NETWORK_HTTPS.md) for HTTPS options
- See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for issues
- See [README.md](README.md) for features and usage
