@echo off
echo ========================================
echo Testing ESP32 ECG Data Endpoint
echo ========================================
echo.
echo Sending test data to ESP32...
echo URL: http://192.168.137.236:5000/data
echo.

curl -X POST http://192.168.137.236:5000/data -H "Content-Type: application/json" -d "{\"P\":100,\"Q\":-20,\"R\":500,\"S\":-40,\"T\":100,\"BPM\":75}"

echo.
echo.
echo ========================================
echo Check ESP32 Serial Monitor!
echo You should see:
echo   - Received raw: {...}
echo   - Normalized JSON: {...}
echo   - Sent to Next.js [200]
echo ========================================
echo.
pause
