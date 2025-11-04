#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

// ==========================
// CONFIGURATION
// ==========================
const char* ssid = "TANISH";
const char* password = "hello123456789";
const char* esp32Url = "http://192.168.137.236:5000/data"; // ✅ Your ESP32's IP

WiFiClient client;

// Buffer for incoming data
String dataBuffer = "";
unsigned long lastSendTime = 0;
const unsigned long SEND_THROTTLE = 400; // Minimum 400ms between sends

void setup() {
  // Start serial communication with Arduino
  Serial.begin(115200);
  Serial.setTimeout(100);
  
  // Disable debug output - Serial is used ONLY for Arduino data
  Serial.setDebugOutput(false);
  
  // Connect to WiFi silently
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.begin(ssid, password);
  
  // Wait for WiFi connection (max 20 seconds)
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(500);
    attempts++;
  }
  
  // Small delay to ensure WiFi is stable
  if (WiFi.status() == WL_CONNECTED) {
    delay(2000); // Extra time for WiFi to stabilize
  }
}

void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    WiFi.reconnect();
    delay(1000);
    return;
  }
  
  // Read all available serial data from Arduino
  while (Serial.available() > 0) {
    char c = Serial.read();
    
    if (c == '\n' || c == '\r') {
      // Complete line received
      dataBuffer.trim();
      
      // Validate JSON format and minimum length
      if (dataBuffer.length() >= 20 && 
          dataBuffer.startsWith("{") && 
          dataBuffer.endsWith("}") &&
          dataBuffer.indexOf("BPM") > 0) {
        
        unsigned long currentTime = millis();
        
        // Throttle: Only send if enough time has passed
        if (currentTime - lastSendTime >= SEND_THROTTLE) {
          sendToESP32(dataBuffer);
          lastSendTime = currentTime;
        }
      }
      
      // Clear buffer for next reading
      dataBuffer = "";
    } 
    else if (c >= 32 && c <= 126) {
      // Only add printable ASCII characters
      if (dataBuffer.length() < 250) {
        dataBuffer += c;
      }
    }
  }
  
  // Small delay for stability
  delay(5);
}

// Optimized send function with better error handling
void sendToESP32(String jsonData) {
  HTTPClient http;
  http.setTimeout(4000); // 4 second timeout
  http.setReuse(false);  // Don't reuse connections
  
  if (http.begin(client, esp32Url)) {
    http.addHeader("Content-Type", "application/json");
    
    int httpCode = http.POST(jsonData);
    
    // Silently handle response (no Serial output to avoid interfering with Arduino data)
    // If you need to debug, temporarily enable Serial.println here
    
    http.end();
    
    // Small delay after sending
    delay(20);
  }
}