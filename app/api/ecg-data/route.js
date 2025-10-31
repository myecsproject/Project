import { NextResponse } from 'next/server';

// Store latest data in memory for polling
let latestData = {
  ecg: null,
  heartRate: null,
  timestamp: null
};

export async function POST(request) {
  try {
    const data = await request.json();
    
    console.log('📊 ECG Data received from ESP32:', {
      waves: { 
        p: data.p, 
        q: data.q, 
        r: data.r, 
        s: data.s, 
        t: data.t 
      },
      bpm: data.bpm,
      timestamp: new Date().toISOString()
    });
    
    // Store latest data
    latestData = {
      ecg: {
        p: data.p,
        q: data.q,
        r: data.r,
        s: data.s,
        t: data.t
      },
      heartRate: {
        bpm: data.bpm
      },
      timestamp: Date.now()
    };
    
    return NextResponse.json({ 
      success: true, 
      message: 'Data received and stored',
      timestamp: Date.now()
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
  return NextResponse.json({
    success: true,
    data: latestData
  });
}
