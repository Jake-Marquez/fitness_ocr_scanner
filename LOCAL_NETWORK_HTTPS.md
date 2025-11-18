# Local Network HTTPS Setup

The camera requires HTTPS to work on mobile Safari. Here are several solutions for testing on your iPhone over the local network:

## Option 1: Use Expo Tunnel (Easiest - RECOMMENDED)

This creates an HTTPS tunnel automatically using ngrok:

```bash
npm start -- --tunnel
```

Then:
1. Open Expo Dev Tools in your browser
2. You'll see an HTTPS URL like `https://abc123.exp.direct`
3. Open this URL on your iPhone Safari
4. Camera will work! 🎉

**Pros**: Automatic HTTPS, works anywhere
**Cons**: Slightly slower than LAN, requires internet connection

---

## Option 2: Use Your Computer's Hostname

Instead of the IP address, try using your computer's hostname:

1. **Find your computer name**:
   - Windows: `hostname` in command prompt
   - Mac: System Preferences > Sharing > Computer Name

2. **Start Expo normally**:
   ```bash
   npm start
   ```

3. **Access on iPhone using hostname**:
   ```
   http://YOUR-COMPUTER-NAME.local:8081
   ```

**Note**: This still uses HTTP, so camera might not work. Try the tunnel option instead.

---

## Option 3: Generate Self-Signed SSL Certificate (Advanced)

For a proper local HTTPS setup:

### Step 1: Install mkcert

**Windows** (using Chocolatey):
```bash
choco install mkcert
```

**Mac**:
```bash
brew install mkcert
brew install nss # if you use Firefox
```

### Step 2: Setup Local CA
```bash
mkcert -install
```

### Step 3: Generate Certificates
In your project directory:
```bash
mkdir .cert
cd .cert
mkcert localhost 127.0.0.1 ::1 YOUR-LOCAL-IP
```

Replace `YOUR-LOCAL-IP` with your actual local IP (e.g., `192.168.1.100`)

### Step 4: Configure Expo

Create/edit `metro.config.js`:

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const fs = require('fs');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add HTTPS support
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
```

### Step 5: Run with HTTPS

This is complex with Expo. The tunnel option is much easier!

---

## Option 4: Use Localtunnel (Alternative to ngrok)

```bash
npm install -g localtunnel
```

In one terminal:
```bash
npm start
```

In another terminal:
```bash
lt --port 8081
```

You'll get an HTTPS URL like `https://xyz.loca.lt`

---

## RECOMMENDED SOLUTION

**Use the Expo Tunnel** - it's the simplest and most reliable:

```bash
npm start -- --tunnel
```

Or add a script to package.json:

```json
"scripts": {
  "start": "expo start",
  "tunnel": "expo start --tunnel",
  "web": "expo start --web"
}
```

Then run:
```bash
npm run tunnel
```

### Troubleshooting Tunnel

If tunnel fails:
1. Make sure you have internet connection
2. Try restarting: `npx expo start --tunnel`
3. Clear Expo cache: `npx expo start -c --tunnel`
4. The first time may be slow (setting up ngrok)

---

## Quick Comparison

| Method | HTTPS | Speed | Setup |
|--------|-------|-------|-------|
| Tunnel | ✅ Yes | Medium | Easy ⭐ |
| LAN (IP) | ❌ No | Fast | Easy |
| Hostname | ❌ No | Fast | Easy |
| Self-signed | ✅ Yes | Fast | Hard |
| Localtunnel | ✅ Yes | Medium | Medium |

**Winner**: Use `npm start -- --tunnel` for HTTPS with minimal setup! 🏆
