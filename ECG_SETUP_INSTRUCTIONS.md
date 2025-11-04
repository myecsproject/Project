# ECG Hardware to Next.js Backend Setup

## 🔧 System Architecture

```
Arduino Uno (ECG Sensor) 
    ↓ (Serial @ 115200)
ESP-01 (WiFi Bridge)
    ↓ (HTTP POST to local IP)
ESP32 (Data Forwarder)
    ↓ (HTTP POST to Next.js)
Next.js Backend API (/api/ecg-data)
```

## 📝 Setup Steps

### 1. Find Your PC's IP Address

Open Command Prompt and run:
```cmd
ipconfig
```

Look for your WiFi adapter's IPv4 address (e.g., `192.168.137.1` or `192.168.1.x`)

### 2. Update ESP32 Code

In `esp32.ino`, update line 10:
```cpp
const char* backendUrl = "http://YOUR_PC_IP:3000/api/ecg-data";
```

Replace `YOUR_PC_IP` with your actual IP address from step 1.

**Example:**
```cpp
const char* backendUrl = "http://192.168.137.1:3000/api/ecg-data";
```

### 3. Start Your Next.js Server

Open terminal in your project folder and run:
```cmd
npm run dev
```

Your backend API will be available at: `http://localhost:3000/api/ecg-data`

### 4. Upload Firmware to Hardware

1. **Arduino Uno**: Upload `ardruino.ino` (already working ✓)
2. **ESP-01**: Upload `esp01.ino` (already working ✓)
3. **ESP32**: Upload the updated `esp32.ino`

### 5. Test the Connection

Open your browser and visit:
```
http://localhost:3000/api/ecg-data
```

You should see:
```json
{
  "status": "ok",
  "message": "ECG data endpoint is running",
  "timestamp": "2025-11-05T..."
}
```

## 📊 Monitor Real-Time ECG Data

Once all hardware is connected and powered on, open your terminal where Next.js is running. You should see console logs like:

```
📊 ECG Data Received: {
  timestamp: '2025-11-05T12:34:56.789Z',
  P: 120,
  Q: -30,
  R: 650,
  S: -50,
  T: 100,
  BPM: 72
}
```

## 🔍 Troubleshooting

### ESP32 can't connect to Next.js
- Make sure your PC and ESP32 are on the same WiFi network
- Check if Windows Firewall is blocking port 3000
- Try disabling firewall temporarily to test

### No data showing in console
- Check ESP32 Serial Monitor (115200 baud) for error messages
- Verify ESP-01 is sending data to ESP32
- Make sure Arduino is connected to ESP-01 via serial

### Wrong IP address
- Your PC's IP might change after restart
- Update ESP32 code with new IP and re-upload

## 🚀 Next Steps

- Store ECG data in a database (Supabase is already set up in your project)
- Create a real-time dashboard to visualize ECG waveforms
- Add user authentication to link ECG readings to user accounts
- Implement data analysis for health insights

## 📁 Files Modified

- **Created**: `/app/api/ecg-data/route.js` - Next.js API endpoint
- **Modified**: `/hardware codes/esp32/esp32.ino` - Updated backend URL and WiFi client

## 🔒 Security Note

For production deployment:
- Use HTTPS instead of HTTP
- Add API authentication
- Validate and sanitize all incoming data
- Consider rate limiting to prevent abuse
