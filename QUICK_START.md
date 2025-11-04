# 🚀 Quick Start - Supabase Setup

## Step-by-Step Instructions

### 1️⃣ Create the Database Table

1. **Open Supabase Dashboard**
   - Go to https://supabase.com
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query" button

3. **Run the Schema**
   - Open the file: `supabase_schema.sql` in this project
   - Copy ALL the contents (entire file)
   - Paste into the SQL Editor
   - Click **"RUN"** button (or press F5)

4. **Verify Creation**
   - Go to "Database" → "Tables" in sidebar
   - You should see `ecg_readings` table
   - Click on it to view columns

---

## 2️⃣ What the Table Looks Like

| Column Name      | Type      | Description                           |
|------------------|-----------|---------------------------------------|
| id               | UUID      | Primary key (auto-generated)          |
| user_id          | UUID      | References auth.users(id)             |
| reading_data     | JSONB     | Array of all ECG data points          |
| status           | TEXT      | "Normal Sinus Rhythm", etc.           |
| risk_level       | TEXT      | "Low", "Medium", "High", "Unknown"    |
| confidence       | INTEGER   | 0-100 AI confidence score             |
| avg_heart_rate   | INTEGER   | Average BPM                           |
| max_heart_rate   | INTEGER   | Maximum BPM                           |
| min_heart_rate   | INTEGER   | Minimum BPM                           |
| duration         | INTEGER   | Recording duration (60 seconds)       |
| samples_count    | INTEGER   | Number of data points                 |
| avg_wave_data    | JSONB     | {p, q, r, s, t} averages              |
| recorded_at      | TIMESTAMP | When reading was taken                |
| created_at       | TIMESTAMP | When record was created (auto)        |
| updated_at       | TIMESTAMP | Last update time (auto)               |

---

## 3️⃣ How to Test

### Test the Recording Flow:

1. **Start the app**:
   ```bash
   npm run dev
   ```

2. **Make sure you're logged in**
   - The app needs a user session
   - Check that `user` exists in auth context

3. **Go to "Take Reading" page**

4. **Click "Start Heart Reading"**
   - Recording begins
   - Timer starts: 0:00 / 1:00
   - BPM displays in large numbers
   - Graph shows live waveform
   - Watch it auto-stop at 60 seconds

5. **Wait for Analysis**
   - Analysis runs automatically after 60 seconds
   - Results display after 3 seconds

6. **Click "Save to History"**
   - Data saves to Supabase
   - You'll see a success message ✅

### Verify Data in Supabase:

1. Go to Supabase Dashboard
2. Click "Table Editor"
3. Select `ecg_readings` table
4. You should see your saved reading!
5. Click on a row to see the JSONB data

---

## 4️⃣ Example Queries

### View all your readings:
```sql
SELECT * FROM ecg_readings 
WHERE user_id = auth.uid() 
ORDER BY recorded_at DESC;
```

### Count total readings:
```sql
SELECT COUNT(*) as total 
FROM ecg_readings 
WHERE user_id = auth.uid();
```

### Get high-risk readings:
```sql
SELECT * FROM ecg_readings 
WHERE user_id = auth.uid() 
AND risk_level = 'High';
```

### View latest reading data:
```sql
SELECT 
  recorded_at,
  status,
  avg_heart_rate,
  jsonb_array_length(reading_data) as data_points
FROM ecg_readings 
WHERE user_id = auth.uid() 
ORDER BY recorded_at DESC 
LIMIT 1;
```

---

## 5️⃣ Troubleshooting

### ❌ Error: "relation ecg_readings does not exist"
**Solution**: Run the SQL schema from `supabase_schema.sql`

### ❌ Error: "new row violates row-level security policy"
**Solution**: Make sure RLS policies were created. Re-run the SQL schema.

### ❌ Error: "null value in column user_id"
**Solution**: User must be logged in. Check auth context.

### ❌ "Save to History" button does nothing
**Solution**: 
- Check browser console for errors
- Verify user is logged in
- Check Supabase credentials in .env.local

### ❌ BPM shows "--"
**Solution**:
- ESP32 must be sending data
- Check `/api/ecg-data` endpoint
- Verify data in network tab

---

## 6️⃣ What Happens During Recording?

```
┌─────────────────────────────────────────────┐
│  User clicks "Start Heart Reading"          │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Recording starts (isRecording = true)      │
│  Timer: 0 seconds                           │
│  recordedData: []                           │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Every 500ms:                               │
│  1. Fetch latest ECG data from ESP32        │
│  2. Update BPM display                      │
│  3. Add data point to recordedData[]        │
│  4. Update graph visualization              │
└──────────────────┬──────────────────────────┘
                   │
                   │ (Repeat for 60 seconds)
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Timer reaches 60 seconds                   │
│  Auto-stop recording                        │
│  recordedData: ~120 entries                 │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Analysis begins (3 seconds)                │
│  Calculate: avg BPM, max, min, waves        │
│  Determine: status, risk level, confidence  │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Results displayed                          │
│  "Save to History" button enabled           │
└──────────────────┬──────────────────────────┘
                   │
                   ▼ (User clicks "Save")
┌─────────────────────────────────────────────┐
│  Data sent to Supabase:                     │
│  - user_id                                  │
│  - reading_data (JSONB array)               │
│  - All analysis results                     │
└─────────────────────────────────────────────┘
```

---

## ✅ Success Checklist

- [ ] SQL schema executed in Supabase
- [ ] `ecg_readings` table exists
- [ ] RLS policies are active
- [ ] Environment variables set (.env.local)
- [ ] User is logged in
- [ ] ESP32 is sending data
- [ ] BPM displays on website
- [ ] Graph shows waveform
- [ ] Recording auto-stops at 60s
- [ ] Save button works
- [ ] Data appears in Supabase table

---

## 📊 Expected Data Volume

For a 60-second recording:
- Data points: ~120 (collected every 500ms)
- JSON size: ~15-20 KB per reading
- Storage: ~20 KB per user per reading

Example: 100 readings = ~2 MB per user

---

## 🎉 You're All Set!

Your ECG monitoring system is now fully integrated with:
- ✅ Real-time BPM display
- ✅ Live ECG graph visualization  
- ✅ 60-second auto-recording
- ✅ Automatic analysis
- ✅ Supabase database storage
- ✅ User-specific data with RLS

**Next Steps**:
1. Test the complete flow
2. View data in Supabase
3. Consider adding a "Past Readings" page to view history
