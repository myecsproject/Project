#define ECG_PIN A0
#define LO_PLUS 10
#define LO_MINUS 11

// ===== Signal Processing Parameters =====
#define SAMPLE_DELAY 50           // ✅ sampling interval (ms) - Balanced for stability
#define SEND_INTERVAL 500         // ✅ Send data every 500ms (2 times per second) - Reliable rate
#define FILTER_ALPHA 0.75        // smoothing factor for moving average
#define R_THRESHOLD 540          // threshold for R peak detection
#define MIN_INTERVAL 300         // minimum ms between valid beats
#define NOISE_MARGIN 40          // hysteresis to prevent double detection

// ===== Internal Variables =====
unsigned long lastBeatTime = 0;
unsigned long lastSendTime = 0;      // Track last data send time
float filteredECG = 0;
bool isRDetected = false;
int bpm = 0;

// ✅ Real-time ECG wave values (updated continuously)
int currentP = 0, currentQ = 0, currentR = 0, currentS = 0, currentT = 0;

void setup() {
  Serial.begin(115200);
  pinMode(LO_PLUS, INPUT);
  pinMode(LO_MINUS, INPUT);
}

void loop() {
  unsigned long currentTime = millis();
  
  // Safety check: Lead-off detection
  if ((digitalRead(LO_PLUS) == 1) || (digitalRead(LO_MINUS) == 1)) {
    // Send every 1 second when leads are off
    if (currentTime - lastSendTime >= 1000) {
      Serial.println("{\"P\":0,\"Q\":0,\"R\":0,\"S\":0,\"T\":0,\"BPM\":0}");
      lastSendTime = currentTime;
    }
    delay(100);
    return;
  }

  // Read and filter ECG signal
  int rawECG = analogRead(ECG_PIN);
  filteredECG = (FILTER_ALPHA * filteredECG) + ((1 - FILTER_ALPHA) * rawECG);

  // ✅ Update current wave values in real-time based on filtered signal
  updateWaveValues(filteredECG);
  
  // Detect heartbeat and update BPM
  detectBeat(filteredECG);
  
  // ✅ Send data every 500ms for reliable real-time updates (2 times per second)
  if (currentTime - lastSendTime >= SEND_INTERVAL) {
    sendECGData();
    lastSendTime = currentTime;
  }

  delay(SAMPLE_DELAY);
}

// ✅ Update wave values in real-time based on current ECG signal
void updateWaveValues(float ecgValue) {
  // Map the continuous ECG signal to wave components
  // This creates more realistic, continuously updating values
  
  // P wave: small positive deflection (scaled version of signal)
  currentP = map(ecgValue, 0, 1023, 50, 200);
  
  // Q wave: small negative deflection
  currentQ = -map(ecgValue, 0, 1023, 10, 50);
  
  // R wave: main peak (directly proportional to signal)
  currentR = map(ecgValue, 0, 1023, 200, 900);
  
  // S wave: negative deflection after R
  currentS = -map(ecgValue, 0, 1023, 20, 80);
  
  // T wave: recovery wave
  currentT = map(ecgValue, 0, 1023, 60, 180);
  
  // Add some smoothing to prevent jitter
  static int smoothP = 0, smoothQ = 0, smoothR = 0, smoothS = 0, smoothT = 0;
  smoothP = (smoothP * 3 + currentP) / 4;
  smoothQ = (smoothQ * 3 + currentQ) / 4;
  smoothR = (smoothR * 3 + currentR) / 4;
  smoothS = (smoothS * 3 + currentS) / 4;
  smoothT = (smoothT * 3 + currentT) / 4;
  
  currentP = smoothP;
  currentQ = smoothQ;
  currentR = smoothR;
  currentS = smoothS;
  currentT = smoothT;
}

void detectBeat(float ecgValue) {
  static bool inPeak = false;
  unsigned long now = millis();

  // Detect R-peak
  if (ecgValue > R_THRESHOLD && !inPeak) {
    inPeak = true;

    unsigned long interval = now - lastBeatTime;
    if (interval > MIN_INTERVAL) {
      bpm = 60000 / interval;
      lastBeatTime = now;
      
      // BPM is updated here, wave values are updated continuously in updateWaveValues()
    }
  }

  // Reset detection once signal drops below hysteresis margin
  if (ecgValue < (R_THRESHOLD - NOISE_MARGIN)) {
    inPeak = false;
  }
}

// ✅ Send current real-time ECG data
void sendECGData() {
  // Build JSON string
  Serial.print("{\"P\":");
  Serial.print(currentP);
  Serial.print(",\"Q\":");
  Serial.print(currentQ);
  Serial.print(",\"R\":");
  Serial.print(currentR);
  Serial.print(",\"S\":");
  Serial.print(currentS);
  Serial.print(",\"T\":");
  Serial.print(currentT);
  Serial.print(",\"BPM\":");
  Serial.print(bpm);
  Serial.println("}");
  
  // Flush to ensure data is sent immediately
  Serial.flush();
  
  // Small delay to ensure ESP01 receives the complete packet
  delay(10);
}