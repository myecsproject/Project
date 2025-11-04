#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

// ==========================
// CONFIGURATION
// ==========================
const char* ssid = "TANISH";
const char* password = "hello123456789";
const char* esp32Url = "http://192.168.137.236:5000/data"; // <-- change to your ESP32's IP

WiFiClient client;

// Buffer for incoming data
String dataBuffer = "";

void setup() {
  Serial.begin(115200);
  
  // Disable Serial output to avoid conflicts with Arduino data
  Serial.setDebugOutput(false);
  
  WiFi.begin(ssid, password);
  
  // Wait for WiFi without Serial prints (will just take a moment)
  while (WiFi.status() != WL_CONNECTED) {
    delay(250);
  }
  
  // Small delay to ensure WiFi is stable
  delay(500);
}

void loop() {
  // Read all available serial data quickly
  while (Serial.available()) {
    char c = Serial.read();
    
    if (c == '\n') {
      // Complete JSON line received
      dataBuffer.trim();
      
      if (dataBuffer.length() > 10 && dataBuffer.startsWith("{")) {
        // Valid JSON, send to ESP32
        sendToESP32(dataBuffer);
      }
      
      // Clear buffer for next reading
      dataBuffer = "";
    } else {
      // Build the JSON string
      dataBuffer += c;
    }
  }
  
  // Small delay to prevent watchdog issues
  delay(1);
}

// Fast, non-blocking send function
void sendToESP32(String jsonData) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.setTimeout(2000);  // Shorter timeout for faster response
    
    if (http.begin(client, esp32Url)) {
      http.addHeader("Content-Type", "application/json");
      http.POST(jsonData);  // Send without waiting for detailed response
      http.end();
    }
  }
}