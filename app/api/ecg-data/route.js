import { NextResponse } from 'next/server';

// Store latest data in memory for polling
let latestData = {
  ecg: null,
  heartRate: null,
  timestamp: null
};

// Data expiry time (5 seconds - if no new data, consider connection lost)
const DATA_EXPIRY_MS = 5000;

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (typeof data.p !== 'number' || 
        typeof data.q !== 'number' || 
        typeof data.r !== 'number' || 
        typeof data.s !== 'number' || 
        typeof data.t !== 'number' || 
        typeof data.bpm !== 'number') {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid data format. Required: p, q, r, s, t (numbers), bpm (number)' 
      }, { status: 400 });
    }

    // Validate data ranges
    if (data.bpm < 30 || data.bpm > 250) {
      console.warn('⚠️ BPM out of normal range:', data.bpm);
    }
    
    console.log('📊 ECG Data received:', {
      waves: { 
        p: data.p.toFixed(3), 
        q: data.q.toFixed(3), 
        r: data.r.toFixed(3), 
        s: data.s.toFixed(3), 
        t: data.t.toFixed(3) 
      },
      bpm: data.bpm,
      source: data.type || 'unknown',
      timestamp: new Date().toISOString()
    });
    
    // Store latest data with timestamp
    const now = Date.now();
    latestData = {
      ecg: {
        p: parseFloat(data.p.toFixed(3)),
        q: parseFloat(data.q.toFixed(3)),
        r: parseFloat(data.r.toFixed(3)),
        s: parseFloat(data.s.toFixed(3)),
        t: parseFloat(data.t.toFixed(3))
      },
      heartRate: {
        bpm: Math.round(data.bpm)
      },
      timestamp: now
    };
    
    return NextResponse.json({ 
      success: true, 
      message: 'ECG data received and stored',
      timestamp: now
    });
    
  } catch (error) {
    console.error('❌ Error processing ECG data:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

// GET endpoint for frontend to poll data
export async function GET() {
  const now = Date.now();
  const isDataFresh = latestData.timestamp && (now - latestData.timestamp) < DATA_EXPIRY_MS;
  
  return NextResponse.json({
    success: true,
    data: isDataFresh ? latestData : {
      ecg: null,
      heartRate: null,
      timestamp: null
    },
    connected: isDataFresh,
    lastUpdate: latestData.timestamp ? new Date(latestData.timestamp).toISOString() : null
  });
}
