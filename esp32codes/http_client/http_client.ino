/*
 * ESP32 ECG Monitor - HTTP POST Method
 * This bypasses Socket.IO and uses simple HTTP POST requests
 * Much more reliable and simpler!
 */

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

unsigned long lastDataSend = 0;
const unsigned long DATA_SEND_INTERVAL = 1000; // 1 second

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n=================================");
  Serial.println("ESP32 ECG Monitor - HTTP Method");
  Serial.println("=================================");
  
  // Connect WiFi
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("   IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("   Signal: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    Serial.println("=================================");
  } else {
    Serial.println("\n❌ WiFi Failed!");
    ESP.restart();
  }
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ WiFi Lost!");
    delay(1000);
    return;
  }
  
  if (millis() - lastDataSend > DATA_SEND_INTERVAL) {
    lastDataSend = millis();
    
    // Generate dummy ECG data
    ECGData data = generateDummyData();
    
    // Send via HTTP POST
    sendECGData(data);
  }
}

ECGData generateDummyData() {
  ECGData data;
  data.p_wave = 0.15 + (random(-10, 10) / 100.0);
  data.q_wave = -0.05 + (random(-5, 5) / 100.0);
  data.r_wave = 1.2 + (random(-20, 20) / 100.0);
  data.s_wave = -0.1 + (random(-5, 5) / 100.0);
  data.t_wave = 0.3 + (random(-10, 10) / 100.0);
  data.bpm = 75 + random(-5, 15);
  return data;
}

void sendECGData(ECGData data) {
  HTTPClient http;
  
  http.begin(serverURL);
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON
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
  
  int httpCode = http.POST(jsonString);
  
  if (httpCode > 0) {
    if (httpCode == 200) {
      Serial.println("✅ Data sent successfully!");
      Serial.printf("   P:%.2f Q:%.2f R:%.2f S:%.2f T:%.2f | BPM:%d\n",
                    data.p_wave, data.q_wave, data.r_wave, 
                    data.s_wave, data.t_wave, data.bpm);
    } else {
      Serial.printf("⚠️ HTTP %d: %s\n", httpCode, http.getString().c_str());
    }
  } else {
    Serial.printf("❌ HTTP Error: %s\n", http.errorToString(httpCode).c_str());
  }
  
  http.end();
}
