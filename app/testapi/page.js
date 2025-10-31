'use client';

import { useState } from 'react';

export default function TestApi() {
  const [getResponse, setGetResponse] = useState('');
  const [postResponse, setPostResponse] = useState('');

  const handleGet = async () => {
    try {
      const res = await fetch('/api/ecg-data');
      const data = await res.json();
      setGetResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setGetResponse('Error: ' + error.message);
    }
  };

  const handlePost = async () => {
    try {
      const res = await fetch('/api/ecg-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          p: 0.15,
          q: -0.05,
          r: 1.2,
          s: -0.1,
          t: 0.3,
          bpm: 75,
          type: 'test'
        })
      });
      const data = await res.json();
      setPostResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setPostResponse('Error: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test ECG API</h1>
      <p style={{ marginBottom: '20px', color: '#666' }}>Test the ECG data API endpoint</p>
      <button onClick={handleGet} style={{ marginRight: '10px', padding: '10px 20px', cursor: 'pointer' }}>Test GET (Fetch Latest Data)</button>
      <button onClick={handlePost} style={{ padding: '10px 20px', cursor: 'pointer' }}>Test POST (Send ECG Data)</button>
      <div style={{ marginTop: '20px' }}>
        <h2>GET Response:</h2>
        <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto' }}>{getResponse}</pre>
      </div>
      <div style={{ marginTop: '20px' }}>
        <h2>POST Response:</h2>
        <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto' }}>{postResponse}</pre>
      </div>
    </div>
  );
}
