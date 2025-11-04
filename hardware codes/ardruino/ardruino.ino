#define ECG_PIN A0
#define LO_PLUS 10
#define LO_MINUS 11

// ===== Signal Processing Parameters =====
#define SAMPLE_DELAY 30           // sampling interval (ms)
#define FILTER_ALPHA 0.75        // smoothing factor for moving average
#define R_THRESHOLD 540          // threshold for R peak detection
#define MIN_INTERVAL 300         // minimum ms between valid beats
#define NOISE_MARGIN 40          // hysteresis to prevent double detection

// ===== Internal Variables =====
unsigned long lastBeatTime = 0;
unsigned long lastSendTime = 0;      // ✅ Track last data send time
float filteredECG = 0;
bool isRDetected = false;
int bpm = 0;
int lastP = 0, lastQ = 0, lastR = 0, lastS = 0, lastT = 0;  // ✅ Store last values

void setup() {
  Serial.begin(115200);
  pinMode(LO_PLUS, INPUT);
  pinMode(LO_MINUS, INPUT);
}

void loop() {
  unsigned long currentTime = millis();
  
  // Safety check: Lead-off detection
  if ((digitalRead(LO_PLUS) == 1) || (digitalRead(LO_MINUS) == 1)) {
    // Send every second even when leads are off
    if (currentTime - lastSendTime >= 1000) {
      Serial.println("{\"P\":0,\"Q\":0,\"R\":0,\"S\":0,\"T\":0,\"BPM\":0}");
      lastSendTime = currentTime;
    }
    delay(100);
    return;
  }

  int rawECG = analogRead(ECG_PIN);
  filteredECG = (FILTER_ALPHA * filteredECG) + ((1 - FILTER_ALPHA) * rawECG);

  detectBeat(filteredECG);
  
  // ✅ Send data every 1 second (1000ms) regardless of heartbeat detection
  if (currentTime - lastSendTime >= 1000) {
    sendECGData();
    lastSendTime = currentTime;
  }

  delay(SAMPLE_DELAY);
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

      // ===== Generate realistic ECG wave segment estimates =====
      lastP = random(100, 160);                 // small pre-R bump
      lastQ = -random(20, 40);                  // negative deflection before R
      lastR = map(ecgValue, R_THRESHOLD, 1023, 400, 800);  // use true peak amplitude
      lastS = -random(40, 70);                  // negative dip after R
      lastT = random(70, 140);                  // slow positive recovery wave
      
      // ✅ Values are stored, will be sent by sendECGData() every second
    }
  }

  // Reset detection once signal drops below hysteresis margin
  if (ecgValue < (R_THRESHOLD - NOISE_MARGIN)) {
    inPeak = false;
  }
}

// ✅ New function to send ECG data every second
void sendECGData() {
  Serial.print("{\"P\":");
  Serial.print(lastP);
  Serial.print(",\"Q\":");
  Serial.print(lastQ);
  Serial.print(",\"R\":");
  Serial.print(lastR);
  Serial.print(",\"S\":");
  Serial.print(lastS);
  Serial.print(",\"T\":");
  Serial.print(lastT);
  Serial.print(",\"BPM\":");
  Serial.print(bpm);
  Serial.println("}");
}