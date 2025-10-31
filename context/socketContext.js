// Socket context removed - project now uses HTTP polling from ESP32.
// This file is kept as a small compatibility stub so imports won't break during the cleanup.

export const useSocket = () => ({
  isConnected: false,
  esp32Connected: false,
  ecgData: null,
  heartRate: null,
  reconnect: () => {},
});

export const SocketProvider = ({ children }) => children;
