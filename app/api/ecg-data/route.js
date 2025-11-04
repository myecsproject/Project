import { NextResponse } from 'next/server';
import { addReading, getRecentReadings } from '@/lib/ecgStore';

// This endpoint receives ECG data from ESP32
export async function POST(request) {
  try {
    const data = await request.json();
    
    // Create reading object
    const reading = {
      p: data.p,
      q: data.q,
      r: data.r,
      s: data.s,
      t: data.t,
      bpm: data.bpm
    };
    
    // Store in memory
    addReading(reading);
    
    // Log the received ECG data in real-time
    console.log('📊 ECG Data Received:', {
      timestamp: new Date().toISOString(),
      P: reading.p,
      Q: reading.q,
      R: reading.r,
      S: reading.s,
      T: reading.t,
      BPM: reading.bpm
    });

    // You can add data validation here
    if (typeof reading.bpm !== 'number' || reading.bpm < 0 || reading.bpm > 300) {
      console.warn('⚠️ Unusual BPM value:', reading.bpm);
    }

    // Return success response
    return NextResponse.json({ 
      status: 'success',
      message: 'ECG data received',
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error processing ECG data:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'Failed to process ECG data',
      error: error.message 
    }, { status: 500 });
  }
}

// Handle GET requests to retrieve recent readings
export async function GET() {
  try {
    const readings = getRecentReadings();
    return NextResponse.json({ 
      status: 'ok',
      message: 'ECG data endpoint is running',
      timestamp: new Date().toISOString(),
      readingsCount: readings.length,
      recentReadings: readings
    });
  } catch (error) {
    console.error('❌ Error fetching readings:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'Failed to fetch readings',
      error: error.message 
    }, { status: 500 });
  }
}
