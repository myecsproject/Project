#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>

// ======================
// ⚙️ CONFIGURATION
// ======================
const char* ssid = "TANISH";
const char* password = "hello123456789";
// Update this URL to your Next.js backend URL
// For local development: http://YOUR_PC_IP:3000/api/ecg-data
// For production: https://yourdomain.com/api/ecg-data
const char* backendUrl = "http://172.18.168.154:3000/api/ecg-data";

WebServer server(5000);

// ✅ Throttling to prevent overwhelming backend
unsigned long lastForwardTime = 0;
const unsigned long FORWARD_THROTTLE = 400; // Minimum 400ms between forwards

// ======================
// 🔧 Forward to Backend (Next.js)
// ======================
void forwardToBackend(const String& body) {
  unsigned long currentTime = millis();
  
  // ✅ Throttle: Don't forward too frequently
  if (currentTime - lastForwardTime < FORWARD_THROTTLE) {
    Serial.println("⏭️ Throttled - skipping send");
    return;
  }
  
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ WiFi lost! Reconnecting...");
    WiFi.reconnect();
    unsigned long start = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - start < 5000) {
      delay(200);
      Serial.print(".");
    }
    Serial.println();
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("❌ Still not connected, skipping send.");
      return;
    }
  }

  WiFiClient client;

  HTTPClient http;
  http.setTimeout(5000); // ✅ Increased timeout for reliability
  http.begin(client, backendUrl);
  http.addHeader("Content-Type", "application/json");

  int httpCode = http.POST(body);

  if (httpCode > 0) {
    String response = http.getString();
    Serial.printf("✅ Sent to Next.js [%d]: %s\n", httpCode, body.c_str());
    lastForwardTime = currentTime; // ✅ Update last forward time
  } else {
    Serial.printf("❌ POST to Next.js failed: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
  delay(50); // ✅ Small delay for network stability
}

// ======================
// 📩 Handle Data from ESP01
// ======================
void handleData() {
  if (!server.hasArg("plain")) {
    server.send(400, "application/json", "{\"error\":\"no body\"}");
    return;
  }

  String body = server.arg("plain");
  body.trim();

  if (body.length() < 10) {
    server.send(400, "application/json", "{\"error\":\"invalid data\"}");
    return;
  }

  Serial.print("📩 Received raw: ");
  Serial.println(body);

  // Normalize JSON keys to lowercase
  body.replace("\"P\"", "\"p\"");
  body.replace("\"Q\"", "\"q\"");
  body.replace("\"R\"", "\"r\"");
  body.replace("\"S\"", "\"s\"");
  body.replace("\"T\"", "\"t\"");
  body.replace("\"BPM\"", "\"bpm\"");

  Serial.print("🔤 Normalized JSON: ");
  Serial.println(body);

  // Send immediate response to ESP01 (don't make it wait)
  server.send(200, "application/json", "{\"status\":\"ok\"}");

  // Forward to backend in background
  forwardToBackend(body);
}

// ======================
// 🚀 SETUP
// ======================
void setup() {
  Serial.begin(115200);
  Serial.println("\n🚀 ECG Forwarder Starting...");

  // ✅ Configure WiFi with better settings
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false); // Disable WiFi sleep for better reliability
  WiFi.setAutoReconnect(true);
  WiFi.begin(ssid, password);
  Serial.print("🌐 Connecting to WiFi");

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 40) {
    delay(500);
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ Connected to WiFi!");
    Serial.print("📶 IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("📶 Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println("\n❌ Failed to connect to WiFi — restarting...");
    delay(3000);
    ESP.restart();
  }

  server.on("/data", HTTP_POST, handleData);
  server.begin();
  Serial.println("📡 ESP32 Web Server started on port 5000");
  Serial.println("📡 Endpoint: /data");
  Serial.println("✅ System ready!");
}

// ======================
// 🔁 LOOP
// ======================
void loop() {
  server.handleClient();
  
  // ✅ Check WiFi connection periodically
  static unsigned long lastWiFiCheck = 0;
  if (millis() - lastWiFiCheck > 10000) { // Every 10 seconds
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("⚠️ WiFi disconnected, reconnecting...");
      WiFi.reconnect();
    }
    lastWiFiCheck = millis();
  }
  
  delay(10); // ✅ Small delay for stability
}