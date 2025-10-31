#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi Configuration
const char* ssid = "ESP32Test";
const char* password = "12345678";
const char* serverURL = "http://10.39.92.22:3000/api/ecg-data";

// ECG Data Structure
struct ECGData {
  float p_wave;
  float q_wave;
  float r_wave;
  float s_wave;
  float t_wave;
  int bpm;
};

// Timing and connection tracking
unsigned long lastDataSend = 0;
unsigned long lastConnectionCheck = 0;
const unsigned long DATA_SEND_INTERVAL = 1000; // 1 second between readings
const unsigned long CONNECTION_CHECK_INTERVAL = 5000; // Check WiFi every 5 seconds
int consecutiveErrors = 0;
const int MAX_CONSECUTIVE_ERRORS = 5;

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n=================================");
  Serial.println("ESP32 ECG Monitor v2.0");
  Serial.println("Optimized HTTP Communication");
  Serial.println("=================================");
  
  connectWiFi();
}

void loop() {
  // Periodic WiFi check
  if (millis() - lastConnectionCheck > CONNECTION_CHECK_INTERVAL) {
    lastConnectionCheck = millis();
    checkWiFiConnection();
  }
  
  // Send ECG data at regular intervals
  if (millis() - lastDataSend > DATA_SEND_INTERVAL) {
    lastDataSend = millis();
    
    if (WiFi.status() == WL_CONNECTED) {
      ECGData data = generateDummyData();
      sendECGData(data);
    } else {
      Serial.println("⚠️ WiFi Disconnected - Attempting reconnection...");
      connectWiFi();
    }
  }
  
  // If too many errors, restart ESP32
  if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
    Serial.println("❌ Too many consecutive errors. Restarting...");
    delay(2000);
    ESP.restart();
  }
}

void connectWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("   IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("   Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    Serial.print("   Server URL: ");
    Serial.println(serverURL);
    Serial.println("=================================");
    consecutiveErrors = 0; // Reset error counter on successful connection
  } else {
    Serial.println("\n❌ WiFi Connection Failed!");
    Serial.println("Will retry in next cycle...");
  }
}

void checkWiFiConnection() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ WiFi Lost Connection!");
    connectWiFi();
  }
}

ECGData generateDummyData() {
  ECGData data;
  // Generate realistic ECG wave values
  data.p_wave = 0.15 + (random(-10, 10) / 100.0);
  data.q_wave = -0.05 + (random(-5, 5) / 100.0);
  data.r_wave = 1.2 + (random(-20, 20) / 100.0);
  data.s_wave = -0.1 + (random(-5, 5) / 100.0);
  data.t_wave = 0.3 + (random(-10, 10) / 100.0);
  data.bpm = 75 + random(-5, 15); // Heart rate 70-90 BPM
  return data;
}

void sendECGData(ECGData data) {
  HTTPClient http;
  
  // Begin HTTP connection
  if (!http.begin(serverURL)) {
    Serial.println("❌ Failed to begin HTTP connection");
    consecutiveErrors++;
    return;
  }
  
  // Set timeout and headers
  http.setTimeout(5000); // 5 second timeout
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON payload
  DynamicJsonDocument doc(256);
  doc["p"] = data.p_wave;
  doc["q"] = data.q_wave;
  doc["r"] = data.r_wave;
  doc["s"] = data.s_wave;
  doc["t"] = data.t_wave;
  doc["bpm"] = data.bpm;
  doc["type"] = "esp32";
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Send POST request
  int httpCode = http.POST(jsonString);
  
  if (httpCode > 0) {
    if (httpCode == HTTP_CODE_OK || httpCode == 200) {
      Serial.println("✅ ECG Data Sent Successfully!");
      Serial.printf("   P:%.2f Q:%.2f R:%.2f S:%.2f T:%.2f | BPM:%d\n",
                    data.p_wave, data.q_wave, data.r_wave, 
                    data.s_wave, data.t_wave, data.bpm);
      consecutiveErrors = 0; // Reset error counter on success
    } else {
      Serial.printf("⚠️ HTTP Response Code: %d\n", httpCode);
      String response = http.getString();
      Serial.printf("   Response: %s\n", response.c_str());
      consecutiveErrors++;
    }
  } else {
    Serial.printf("❌ HTTP Request Failed: %s\n", http.errorToString(httpCode).c_str());
    consecutiveErrors++;
  }
  
  http.end();
}
