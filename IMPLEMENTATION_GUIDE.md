# ECG Implementation Guide

## 🎯 What Was Implemented

### 1. **60-Second Auto Recording**
- When user clicks "Start Heart Reading", recording begins
- Automatically stops after exactly 60 seconds
- Shows countdown timer: "Recording: 0:05 / 1:00"
- Collects all ECG data points during this period

### 2. **Real-Time BPM Display**
- Large, prominent BPM display in the sidebar (60pt font)
- Updates continuously from ESP32 data
- Shows current heart rate in real-time
- Visual heartbeat animation when recording

### 3. **Live ECG Graph**
- Canvas-based scrolling waveform visualization
- Shows last 500 data points from R-wave values
- Green glow effect when recording
- Grid background for professional medical look
- Updates smoothly in real-time

### 4. **Data Collection & Storage**
- Collects data every 500ms during recording
- Stores in array format: `[{ecg: {p, q, r, s, t}, bpm: number, timestamp: number}, ...]`
- Calculates statistics: avg BPM, max BPM, min BPM, wave averages
- All data preserved for 60-second duration

### 5. **Supabase Integration**
- Saves complete reading data when user clicks "Save to History"
- Stores as JSONB array in `reading_data` column
- Includes user_id (from auth context)
- Saves analysis results and metadata

---

## 📊 Database Schema

### Table: `ecg_readings`

The Supabase table stores:
- **user_id** (UUID): Links to authenticated user
- **reading_data** (JSONB): Complete array of all data points from 60-second recording
- **status**: AI analysis result (e.g., "Normal Sinus Rhythm")
- **risk_level**: Low/Medium/High/Unknown
- **avg_heart_rate**: Average BPM
- **max_heart_rate**: Peak BPM during recording
- **min_heart_rate**: Lowest BPM during recording
- **duration**: Recording length (60 seconds)
- **samples_count**: Number of data points collected
- **avg_wave_data**: Average P, Q, R, S, T wave values

---

## 🚀 Setup Instructions

### Step 1: Create Supabase Table

1. Go to your Supabase Dashboard
2. Navigate to: **SQL Editor**
3. Click "New Query"
4. Open the file: `supabase_schema.sql`
5. Copy and paste the entire contents
6. Click **RUN** to execute
7. Verify in: **Database > Tables** that `ecg_readings` exists

### Step 2: Verify Environment Variables

Ensure your `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLIC_KEY=your-anon-key
```

### Step 3: Test the Flow

1. **Start Recording**:
   - Click "Start Heart Reading" button
   - Ensure ESP32 is sending data
   - Watch BPM update in real-time
   - See ECG graph scrolling

2. **Watch Auto-Stop**:
   - Recording automatically stops at 60 seconds
   - Analysis begins automatically
   - Results display after 3 seconds

3. **Save to Database**:
   - Click "Save to History" button
   - Data saves to Supabase with your user_id
   - Check success message

---

## 🔄 How Data Flows

```
ESP32 → POST /api/ecg-data → In-Memory Store
                                      ↓
                          Frontend polls GET /api/ecg-data
                                      ↓
                          Updates graph + BPM display
                                      ↓
                          If recording: adds to recordedData[]
                                      ↓
                          After 60s: Auto-stop & analyze
                                      ↓
                          User clicks "Save" → Supabase
```

---

## 📱 User Experience

### During Recording:
- ✅ Large BPM counter (e.g., "75 BPM")
- ✅ Timer showing progress: "0:45 / 1:00"
- ✅ Green glowing ECG waveform
- ✅ Pulsing heart icon
- ✅ "Recording" status indicator

### After Recording:
- ✅ Analysis results with AI diagnosis
- ✅ Risk level assessment
- ✅ Average, max, min heart rates
- ✅ Wave data (P, Q, R, S, T averages)
- ✅ "Save to History" button

---

## 🔍 Data Structure Examples

### Reading Data (JSONB):
```json
[
  {
    "ecg": {
      "p": 0.52,
      "q": -0.18,
      "r": 1.24,
      "s": -0.31,
      "t": 0.45
    },
    "bpm": 75,
    "timestamp": 1699200123000
  },
  {
    "ecg": {
      "p": 0.51,
      "q": -0.19,
      "r": 1.22,
      "s": -0.29,
      "t": 0.44
    },
    "bpm": 76,
    "timestamp": 1699200123500
  }
  // ... ~120 more entries for 60 seconds at 500ms intervals
]
```

### Complete Record:
```json
{
  "id": "uuid-here",
  "user_id": "user-uuid",
  "reading_data": [...], // Array above
  "status": "Normal Sinus Rhythm",
  "risk_level": "Low",
  "confidence": 96,
  "avg_heart_rate": 75,
  "max_heart_rate": 82,
  "min_heart_rate": 68,
  "duration": 60,
  "samples_count": 120,
  "avg_wave_data": {
    "p": "0.52",
    "q": "-0.18",
    "r": "1.23",
    "s": "-0.30",
    "t": "0.44"
  },
  "recorded_at": "2025-11-05T10:30:00Z",
  "created_at": "2025-11-05T10:30:05Z"
}
```

---

## 🎨 UI Features

### BPM Display:
- Location: Right sidebar, top card
- Size: 6xl font (very large)
- Color: Red gradient theme
- Updates: Real-time (every 500ms)
- Shows: Current BPM + recording progress

### ECG Graph:
- Canvas: 800x300 pixels
- Grid: 20px squares with blue lines
- Waveform: Green (recording) / Blue (idle)
- Effect: Glow/shadow for medical aesthetic
- Data: Last 500 points scrolling left

### Recording Timer:
- Format: "M:SS / M:SS" (e.g., "0:45 / 1:00")
- Location: Below BPM in sidebar
- Updates: Every second
- Auto-stop: At exactly 60 seconds

---

## 🛠️ Troubleshooting

### No BPM Showing:
- Check ESP32 is sending data
- Verify `/api/ecg-data` returns recent readings
- Open browser console for errors
- Check connection status indicator

### Graph Not Moving:
- Ensure data is being received
- Check `ecgDataPoints` state in React DevTools
- Verify canvas is rendering (check ref)

### Save Button Not Working:
- Check user is logged in (`user` from authContext)
- Verify Supabase credentials in .env
- Check browser console for errors
- Ensure RLS policies are set correctly

### Auto-Stop Not Working:
- Check `MAX_RECORDING_TIME` constant (should be 60)
- Verify timer useEffect is running
- Check console for any errors

---

## 📈 Future Enhancements

Consider adding:
- Download reading as PDF report
- Share reading with doctor
- Compare with previous readings
- Export data as CSV
- Real-time alerts for abnormal rhythms
- Historical trends and charts
- Multiple device support

---

## 🔐 Security Notes

- ✅ Row Level Security (RLS) enabled
- ✅ Users can only see/edit their own readings
- ✅ User ID from authenticated session
- ✅ Data validated before saving
- ✅ Timestamps tracked automatically

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify Supabase table exists
3. Test API endpoint directly: `http://localhost:3000/api/ecg-data`
4. Check ESP32 is sending data correctly
5. Review RLS policies in Supabase

---

**Version**: 1.0  
**Last Updated**: November 5, 2025  
**Status**: ✅ Ready for Production
