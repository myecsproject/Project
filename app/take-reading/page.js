"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Play, 
  Pause, 
  Square,
  Heart,
  Clock,
  Zap,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function TakeReadingPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentReading, setCurrentReading] = useState(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Dummy ECG data generator
  const generateECGData = () => {
    const data = [];
    const time = Date.now() / 1000;
    for (let i = 0; i < 500; i++) {
      const x = i;
      // Create ECG-like waveform with P, QRS, T waves
      let y = 0;
      
      // Heart rate simulation (60-100 BPM)
      const heartRate = 75; // BPM
      const cycleLength = 60 / heartRate * 100; // samples per cycle
      const position = (x + time * 50) % cycleLength;
      
      // P wave
      if (position < 10) {
        y += Math.sin((position / 10) * Math.PI) * 0.2;
      }
      // QRS complex
      else if (position > 20 && position < 35) {
        const qrsPos = (position - 20) / 15;
        if (qrsPos < 0.3) {
          y -= qrsPos * 0.5; // Q wave
        } else if (qrsPos < 0.7) {
          y += (qrsPos - 0.3) * 3; // R wave
        } else {
          y -= (qrsPos - 0.7) * 1.5; // S wave
        }
      }
      // T wave
      else if (position > 50 && position < 80) {
        y += Math.sin(((position - 50) / 30) * Math.PI) * 0.4;
      }
      
      // Add some noise
      y += (Math.random() - 0.5) * 0.05;
      
      data.push({ x: i, y: 150 + y * 50 });
    }
    return data;
  };

  // Draw ECG waveform
  const drawECG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.lineWidth = 0.5;
    
    // Vertical lines
    for (let x = 0; x < width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw ECG waveform
    const data = generateECGData();
    ctx.strokeStyle = isRecording ? '#ef4444' : '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.forEach((point, index) => {
      const x = (point.x / 500) * width;
      const y = point.y;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
  };

  // Animation loop
  const animate = () => {
    drawECG();
    if (isRecording) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  // Recording timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      animate();
    } else {
      clearInterval(interval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    
    return () => {
      clearInterval(interval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    setCurrentReading(null);
  };

  const stopRecording = () => {
    setIsRecording(false);
    
    // Simulate analysis results
    setTimeout(() => {
      const results = [
        { status: 'Normal', confidence: 98.5, risk: 'Low' },
        { status: 'Atrial Fibrillation', confidence: 94.2, risk: 'High' },
        { status: 'Bradycardia', confidence: 89.7, risk: 'Medium' },
        { status: 'PVC Detected', confidence: 92.1, risk: 'Low' },
      ];
      
      const randomResult = results[Math.floor(Math.random() * results.length)];
      setCurrentReading({
        ...randomResult,
        timestamp: new Date().toISOString(),
        duration: recordingTime,
        heartRate: Math.floor(Math.random() * 40) + 60,
      });
    }, 2000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
      case 'Medium': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'High': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Heart Reading Monitor
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Place your finger on the sensor and start recording your heart rhythm
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ECG Display */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <Activity className="h-6 w-6 mr-2 text-blue-600" />
                  ECG Waveform
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {isRecording ? 'Recording' : 'Standby'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {formatTime(recordingTime)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900 dark:bg-black rounded-lg p-4 mb-6">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={300}
                  className="w-full h-auto"
                />
              </div>

              {/* Controls */}
              <div className="flex justify-center space-x-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    <Play className="h-5 w-5" />
                    <span>Start Reading</span>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-rose-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    <Square className="h-5 w-5" />
                    <span>Stop Reading</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {/* Current Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Live Stats
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span className="font-medium text-gray-900 dark:text-white">Heart Rate</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {isRecording ? Math.floor(Math.random() * 40) + 60 : '--'} BPM
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium text-gray-900 dark:text-white">Signal Quality</span>
                  </div>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {isRecording ? 'Excellent' : 'No Signal'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-purple-500" />
                    <span className="font-medium text-gray-900 dark:text-white">Rhythm</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {isRecording ? 'Regular' : '--'}
                  </span>
                </div>
              </div>
            </div>

            {/* Analysis Results */}
            {currentReading && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Analysis Results
                </h3>
                
                <div className="space-y-4">
                  <div className="text-center">
                    {currentReading.status === 'Normal' ? (
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-2" />
                    ) : (
                      <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-2" />
                    )}
                    
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currentReading.status}
                    </h4>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Confidence: {currentReading.confidence}%
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg ${getRiskColor(currentReading.risk)}`}>
                    <div className="text-center">
                      <span className="font-semibold">Risk Level: {currentReading.risk}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatTime(currentReading.duration)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Heart Rate:</span>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {currentReading.heartRate} BPM
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Reading taken on {new Date(currentReading.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                How to Take a Reading
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="block w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Sit comfortably and remain still</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="block w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Place your finger on the sensor</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="block w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Press "Start Reading" and wait</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="block w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Keep still for at least 30 seconds</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}