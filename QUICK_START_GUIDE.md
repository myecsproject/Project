# 🚀 Quick Start Guide - ESP32 ECG Monitor

## 📋 Prerequisites

- ✅ ESP32 development board
- ✅ Arduino IDE with ESP32 support
- ✅ ArduinoJson library installed
- ✅ Node.js and npm installed
- ✅ WiFi network

---

## ⚡ 3-Minute Setup

### **Step 1: Start the Server** (30 seconds)
```bash
cd d:\ECS\Project
npm install    # First time only
npm run dev
```
✅ Server running on `http://localhost:3000`

### **Step 2: Configure ESP32** (1 minute)
1. Open `esp32codes/http_client/http_client.ino`
2. Update these lines:
   ```cpp
   const char* ssid = "YOUR_WIFI_NAME";
   const char* password = "YOUR_WIFI_PASSWORD";
   const char* serverURL = "http://YOUR_COMPUTER_IP:3000/api/ecg-data";
   ```
3. Find your computer's IP:
   - Windows: Run `ipconfig` → look for "IPv4 Address"
   - Mac/Linux: Run `ifconfig` → look for "inet"

### **Step 3: Upload to ESP32** (1 minute)
1. Connect ESP32 via USB
2. In Arduino IDE: Tools → Board → ESP32 Dev Module
3. Click Upload ⬆️
4. Open Serial Monitor (115200 baud)
5. Wait for "✅ WiFi Connected!"

### **Step 4: View Live Data** (30 seconds)
1. Go to `http://localhost:3000/take-reading`
2. Wait for "Signal Quality: Excellent" 🟢
3. Click **"Start Heart Reading"**
4. Watch the live ECG! ❤️

---

## 🔍 Verify It's Working

### **Check ESP32 Serial Monitor:**
```
✅ WiFi Connected!
   IP Address: 192.168.1.100
   Signal Strength: -45 dBm
   Server URL: http://192.168.1.50:3000/api/ecg-data
✅ ECG Data Sent Successfully!
   P:0.15 Q:-0.05 R:1.22 S:-0.10 T:0.31 | BPM:78
```

### **Check Server Console:**
```
📊 ECG Data received: {
  waves: { p: '0.150', q: '-0.050', r: '1.220', s: '-0.100', t: '0.310' },
  bpm: 78,
  source: 'esp32',
  timestamp: '2025-10-31T12:30:32.100Z'
}
```

### **Check Frontend:**
- 🟢 Green "Signal Quality: Excellent"
- ❤️ Live heart rate displayed (e.g., "78 BPM")
- 📈 ECG waveform animating smoothly

---

## 🐛 Common Issues

### ❌ "WiFi Connection Failed" on ESP32
**Fix:**
- Double-check SSID and password (case-sensitive!)
- Ensure WiFi is 2.4GHz (ESP32 doesn't support 5GHz)
- Move ESP32 closer to router

### ❌ "No Signal" on Frontend
**Fix:**
1. Check ESP32 Serial Monitor - is it sending data?
2. Verify server URL in ESP32 code matches your computer's IP
3. Check if server is running (`npm run dev`)
4. Test API: `http://localhost:3000/testapi`

### ❌ "Connection timeout" Error
**Fix:**
- Firewall might be blocking port 3000
- Try using computer's actual IP instead of `localhost` on frontend too
- Ensure ESP32 and computer are on same network

### ❌ ESP32 Keeps Restarting
**Fix:**
- Power issue - use external 5V power supply (not just USB)
- Check Serial Monitor for error messages
- Update server URL if it's incorrect

---

## 🎯 Quick Tests

### **Test 1: API Endpoint**
```bash
# Open browser or use curl:
curl http://localhost:3000/api/ecg-data
```
**Expected:** JSON with `success: true` and data

### **Test 2: Send Test Data**
1. Go to `http://localhost:3000/testapi`
2. Click "Test POST"
3. Should see `"success": true` response

### **Test 3: ESP32 Connection**
1. Open Serial Monitor
2. Should see ✅ marks every second
3. No ❌ error messages

---

## 📞 Need Help?

1. **Check the detailed docs:** `ESP32_OPTIMIZATION_COMPLETE.md`
2. **View ESP32 serial output:** Should show clear status messages
3. **Check browser console:** Press F12 to see network requests
4. **Test the API:** Use `/testapi` page to isolate issues

---

## 🎉 You're All Set!

Once you see:
- ✅ ESP32 sending data every second
- ✅ Server receiving and logging data
- ✅ Frontend showing "Excellent" signal
- ✅ Live ECG waveform animating

**You're ready to record and analyze heart rhythms!** ❤️

Start a recording, wait 30+ seconds, stop, and view your AI-powered analysis! 🚀
