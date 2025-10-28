'use client';

import { useState } from 'react';

export default function TestApi() {
  const [getResponse, setGetResponse] = useState('');
  const [postResponse, setPostResponse] = useState('');

  const handleGet = async () => {
    try {
      const res = await fetch('/api/dataapi');
      const data = await res.json();
      setGetResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setGetResponse('Error: ' + error.message);
    }
  };

  const handlePost = async () => {
    try {
      const res = await fetch('/api/dataapi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' })
      });
      const data = await res.json();
      setPostResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setPostResponse('Error: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test API Page</h1>
      <button onClick={handleGet} style={{ marginRight: '10px' }}>Test GET</button>
      <button onClick={handlePost}>Test POST</button>
      <div style={{ marginTop: '20px' }}>
        <h2>GET Response:</h2>
        <pre>{getResponse}</pre>
      </div>
      <div style={{ marginTop: '20px' }}>
        <h2>POST Response:</h2>
        <pre>{postResponse}</pre>
      </div>
    </div>
  );
}
