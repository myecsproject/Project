// Simple in-memory store for recent ECG readings (for demo purposes)
// In production, you should use a database like Supabase
let recentReadings = [];
const MAX_READINGS = 50; // Keep last 50 readings

export function addReading(reading) {
  recentReadings.push({
    ...reading,
    timestamp: new Date().toISOString()
  });
  
  // Keep only the last MAX_READINGS
  if (recentReadings.length > MAX_READINGS) {
    recentReadings = recentReadings.slice(-MAX_READINGS);
  }
}

export function getRecentReadings() {
  return recentReadings;
}

export function clearReadings() {
  recentReadings = [];
}
