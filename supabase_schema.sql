-- =====================================================
-- ECG Readings Table Schema for Supabase
-- =====================================================
-- This table stores ECG (electrocardiogram) readings from users
-- Each reading contains 60 seconds of data stored as JSONB

-- Create the ecg_readings table
CREATE TABLE IF NOT EXISTS ecg_readings (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign key to auth.users (Supabase built-in users table)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- ECG data stored as JSONB array
  -- Each element in the array contains: {ecg: {p, q, r, s, t}, bpm: number, timestamp: number}
  reading_data JSONB NOT NULL,
  
  -- Analysis results
  status TEXT NOT NULL,                    -- e.g., "Normal Sinus Rhythm", "Bradycardia Detected"
  risk_level TEXT NOT NULL,                -- "Low", "Medium", "High", "Unknown"
  confidence INTEGER,                      -- 0-100 confidence score from AI analysis
  
  -- Heart rate metrics
  avg_heart_rate INTEGER NOT NULL,         -- Average BPM during recording
  max_heart_rate INTEGER,                  -- Maximum BPM during recording
  min_heart_rate INTEGER,                  -- Minimum BPM during recording
  
  -- Recording metadata
  duration INTEGER NOT NULL,               -- Duration in seconds (should be 60)
  samples_count INTEGER NOT NULL,          -- Number of data points collected
  
  -- Average ECG wave data
  avg_wave_data JSONB,                     -- {p, q, r, s, t} average values
  
  -- Timestamps
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,  -- When the reading was taken
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- When record was created in DB
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()  -- Last update time
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Index on user_id for fast lookups of user's readings
CREATE INDEX IF NOT EXISTS idx_ecg_readings_user_id 
ON ecg_readings(user_id);

-- Index on recorded_at for chronological queries
CREATE INDEX IF NOT EXISTS idx_ecg_readings_recorded_at 
ON ecg_readings(recorded_at DESC);

-- Index on risk_level for filtering high-risk readings
CREATE INDEX IF NOT EXISTS idx_ecg_readings_risk_level 
ON ecg_readings(risk_level);

-- Composite index for user + timestamp queries
CREATE INDEX IF NOT EXISTS idx_ecg_readings_user_recorded 
ON ecg_readings(user_id, recorded_at DESC);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE ecg_readings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own readings
CREATE POLICY "Users can view own readings" 
ON ecg_readings 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own readings
CREATE POLICY "Users can insert own readings" 
ON ecg_readings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own readings
CREATE POLICY "Users can update own readings" 
ON ecg_readings 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own readings
CREATE POLICY "Users can delete own readings" 
ON ecg_readings 
FOR DELETE 
USING (auth.uid() = user_id);

-- =====================================================
-- Trigger for updated_at timestamp
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_ecg_readings_updated_at
BEFORE UPDATE ON ecg_readings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Helper Views (Optional but Useful)
-- =====================================================

-- View for recent readings summary
CREATE OR REPLACE VIEW recent_readings_summary AS
SELECT 
  id,
  user_id,
  status,
  risk_level,
  avg_heart_rate,
  duration,
  samples_count,
  recorded_at,
  created_at
FROM ecg_readings
ORDER BY recorded_at DESC;

-- View for high-risk readings
CREATE OR REPLACE VIEW high_risk_readings AS
SELECT 
  id,
  user_id,
  status,
  avg_heart_rate,
  max_heart_rate,
  min_heart_rate,
  confidence,
  recorded_at
FROM ecg_readings
WHERE risk_level = 'High'
ORDER BY recorded_at DESC;

-- =====================================================
-- Sample Query Examples
-- =====================================================

-- Example 1: Get all readings for a specific user
-- SELECT * FROM ecg_readings WHERE user_id = 'user-uuid-here' ORDER BY recorded_at DESC;

-- Example 2: Get latest 10 readings for current user
-- SELECT * FROM ecg_readings WHERE user_id = auth.uid() ORDER BY recorded_at DESC LIMIT 10;

-- Example 3: Get readings with high risk
-- SELECT * FROM ecg_readings WHERE user_id = auth.uid() AND risk_level = 'High';

-- Example 4: Get average heart rate over time
-- SELECT DATE(recorded_at) as date, AVG(avg_heart_rate) as avg_bpm 
-- FROM ecg_readings 
-- WHERE user_id = auth.uid() 
-- GROUP BY DATE(recorded_at) 
-- ORDER BY date DESC;

-- Example 5: Count total readings per user
-- SELECT user_id, COUNT(*) as total_readings 
-- FROM ecg_readings 
-- GROUP BY user_id;

-- =====================================================
-- Notes for Implementation
-- =====================================================

-- 1. The reading_data JSONB field stores an array like:
--    [
--      {
--        "ecg": {"p": 0.5, "q": -0.2, "r": 1.2, "s": -0.3, "t": 0.4},
--        "bpm": 75,
--        "timestamp": 1699200000000
--      },
--      ...
--    ]

-- 2. You can query inside JSONB with:
--    SELECT reading_data->0->'bpm' as first_bpm FROM ecg_readings;

-- 3. To get the size of reading_data array:
--    SELECT jsonb_array_length(reading_data) as data_points FROM ecg_readings;

-- 4. To extract all BPM values from reading_data:
--    SELECT jsonb_array_elements(reading_data)->'bpm' as bpm_values FROM ecg_readings;

-- =====================================================
-- How to Use This File
-- =====================================================

-- 1. Go to your Supabase Dashboard
-- 2. Navigate to: SQL Editor
-- 3. Create a "New Query"
-- 4. Copy and paste this entire file
-- 5. Click "Run" to execute
-- 6. Verify table creation in: Database > Tables

-- =====================================================
