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
  AlertTriangle,
  WifiOff,
  Wifi,
  TrendingUp,
  Shield,
  Users,
  Star
} from 'lucide-react';

export default function TakeReadingPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentReading, setCurrentReading] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const analyzeRef = useRef(null);

  // Dummy ECG data generator with improved algorithm
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

  // Enhanced ECG drawing with glow effects
  const drawECG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Enhanced grid with glow
    ctx.strokeStyle = isRecording ? 'rgba(34, 197, 94, 0.15)' : 'rgba(59, 130, 246, 0.1)';
    ctx.lineWidth = 0.5;
    
    // Draw grid
    for (let x = 0; x < width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw ECG waveform with glow effect
    const data = generateECGData();
    
    // Glow effect
    ctx.shadowColor = isRecording ? '#22c55e' : '#3b82f6';
    ctx.shadowBlur = isRecording ? 10 : 5;
    ctx.strokeStyle = isRecording ? '#22c55e' : '#3b82f6';
    ctx.lineWidth = 3;
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
    
    // Reset shadow
    ctx.shadowBlur = 0;
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
    setShowResults(false);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsAnalyzing(true);
    
    // Scroll to analyzing section
    setTimeout(() => {
      analyzeRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }, 100);
    
    // Simulate analysis with loading
    setTimeout(() => {
      const results = [
        { status: 'Normal Sinus Rhythm', confidence: 98.5, risk: 'Low', description: 'Your heart rhythm is regular and healthy.' },
        { status: 'Atrial Fibrillation', confidence: 94.2, risk: 'High', description: 'Irregular heart rhythm detected. Consult your doctor.' },
        { status: 'Bradycardia', confidence: 89.7, risk: 'Medium', description: 'Heart rate is slower than normal.' },
        { status: 'PVC Detected', confidence: 92.1, risk: 'Low', description: 'Premature ventricular contractions detected.' },
      ];
      
      const randomResult = results[Math.floor(Math.random() * results.length)];
      setCurrentReading({
        ...randomResult,
        timestamp: new Date().toISOString(),
        duration: recordingTime,
        heartRate: Math.floor(Math.random() * 40) + 60,
      });
      setIsAnalyzing(false);
      setShowResults(true);
    }, 3000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
      case 'Medium': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      case 'High': return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-12 slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6 float-animation">
            <Heart className="h-10 w-10 text-white heart-beat" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            AI Heart Monitor
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Advanced cardiac rhythm analysis powered by artificial intelligence
          </p>
          <div className="flex items-center justify-center space-x-6 mt-6">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Star className="h-4 w-4" />
              <span>98.5% Accuracy</span>
            </div>
          </div>
        </div>

        <div className="grid xl:grid-cols-4 lg:grid-cols-3 gap-8">
          {/* Enhanced ECG Display */}
          <div className="xl:col-span-3 lg:col-span-2 space-y-8">
            <div className="glass-effect rounded-3xl shadow-2xl p-8 border card-hover fade-in">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Activity className="h-8 w-8 text-blue-600 ecg-glow" />
                    {isRecording && (
                      <div className="absolute inset-0 rounded-full border-2 border-green-500 pulse-ring"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      ECG Waveform
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Real-time cardiac monitoring</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-3">
                    <div className={`relative w-4 h-4 rounded-full ${isRecording ? 'bg-green-500' : 'bg-gray-400'} transition-all duration-300`}>
                      {isRecording && <div className="absolute inset-0 rounded-full bg-green-500 pulse-ring"></div>}
                    </div>
                    <span className={`text-sm font-semibold transition-colors duration-300 ${isRecording ? 'text-green-600' : 'text-gray-500'}`}>
                      {isRecording ? 'Recording' : 'Standby'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-lg font-mono font-bold text-gray-700 dark:text-gray-300">
                      {formatTime(recordingTime)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Canvas Container */}
              <div className="relative bg-gray-900 dark:bg-black rounded-2xl p-6 mb-8 overflow-hidden">
                {/* Grid overlay effect */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `
                      linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                  }}></div>
                </div>
                
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={300}
                  className="w-full h-auto relative z-10"
                />
                
                {/* Signal quality indicator */}
                <div className="absolute top-4 right-4 flex items-center space-x-2">
                  {isRecording ? (
                    <Wifi className="h-5 w-5 text-green-500 animate-pulse" />
                  ) : (
                    <WifiOff className="h-5 w-5 text-gray-400" />
                  )}
                  <span className="text-xs font-medium text-white/80">
                    {isRecording ? 'Strong Signal' : 'No Signal'}
                  </span>
                </div>
              </div>

              {/* Enhanced Controls */}
              <div className="flex justify-center">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="group relative inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-base rounded-2xl hover:from-emerald-600 hover:to-green-600 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl border border-emerald-400/20"
                  >
                    <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Play className="h-6 w-6 transition-transform group-hover:scale-110 drop-shadow-sm" />
                    <span className="relative z-10 tracking-wide">Start Heart Reading</span>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/20 to-green-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="group relative inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold text-base rounded-2xl hover:from-red-600 hover:to-rose-600 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl border border-red-400/20"
                  >
                    <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Square className="h-6 w-6 transition-transform group-hover:scale-110 drop-shadow-sm" />
                    <span className="relative z-10 tracking-wide">Stop & Analyze</span>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-400/20 to-rose-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                )}
              </div>
            </div>

            {/* Analysis Status */}
            {isAnalyzing && (
              <div ref={analyzeRef} className="glass-effect rounded-2xl shadow-xl p-8 border bounce-in">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Activity className="h-10 w-10 text-white animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Analyzing...
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                    AI is processing your heart rhythm
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full animate-pulse" style={{width: '75%'}}></div>
                  </div>
                  <div className="flex justify-center space-x-2">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"
                        style={{animationDelay: `${i * 0.2}s`}}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Analysis Results */}
            {showResults && currentReading && (
              <div className="glass-effect rounded-2xl shadow-xl p-8 border bounce-in">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Analysis Complete
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">AI-powered cardiac assessment</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      {currentReading.status.includes('Normal') ? (
                        <CheckCircle className="h-24 w-24 text-emerald-500 mx-auto bounce-in" />
                      ) : (
                        <AlertTriangle className="h-24 w-24 text-amber-500 mx-auto bounce-in" />
                      )}
                    </div>
                    
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {currentReading.status}
                    </h4>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {currentReading.description}
                    </p>
                    
                    <div className="inline-flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 rounded-lg px-4 py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Confidence:</span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {currentReading.confidence}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className={`relative overflow-hidden rounded-xl p-6 border-2 ${getRiskColor(currentReading.risk)}`}>
                      <div className="text-center">
                        <span className="font-bold text-xl">Risk Level: {currentReading.risk}</span>
                        <div className="mt-3 w-full bg-white/50 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${
                              currentReading.risk === 'Low' ? 'bg-emerald-500' :
                              currentReading.risk === 'Medium' ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{
                              width: currentReading.risk === 'Low' ? '30%' : 
                                     currentReading.risk === 'Medium' ? '60%' : '90%'
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/30 dark:bg-gray-800/30 rounded-xl p-4 text-center">
                        <Clock className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 block">Duration</span>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatTime(currentReading.duration)}
                        </p>
                      </div>
                      <div className="bg-white/30 dark:bg-gray-800/30 rounded-xl p-4 text-center">
                        <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 block">Avg. Rate</span>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {currentReading.heartRate} BPM
                        </p>
                      </div>
                    </div>

                    <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105">
                      Save to History
                    </button>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-200/50 dark:border-gray-600/50">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Reading completed on {new Date(currentReading.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Live Stats */}
            <div className="glass-effect rounded-2xl shadow-xl p-6 border card-hover slide-up">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Live Vitals
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Real-time monitoring</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="relative overflow-hidden bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-red-100 dark:border-red-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Heart className={`h-6 w-6 text-red-500 ${isRecording ? 'heart-beat' : ''}`} />
                        
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white">Heart Rate</span>
                        <p className="text-xs text-gray-500">Beats per minute</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {isRecording ? Math.floor(Math.random() * 40) + 60 : '--'}
                      </span>
                      <span className="text-sm text-red-500 ml-1">BPM</span>
                    </div>
                  </div>
                  {isRecording && (
                    <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-red-500 to-pink-500 animate-pulse" style={{width: '75%'}}></div>
                  )}
                </div>

                <div className="relative overflow-hidden bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Zap className={`h-6 w-6 text-green-500 ${isRecording ? 'animate-pulse' : ''}`} />
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white">Signal Quality</span>
                        <p className="text-xs text-gray-500">Connection strength</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {isRecording ? 'Excellent' : 'No Signal'}
                      </span>
                    </div>
                  </div>
                  {isRecording && (
                    <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500" style={{width: '90%'}}></div>
                  )}
                </div>

                <div className="relative overflow-hidden bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Activity className={`h-6 w-6 text-purple-500 ${isRecording ? 'ecg-glow' : ''}`} />
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white">Rhythm</span>
                        <p className="text-xs text-gray-500">Heart pattern</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {isRecording ? 'Regular' : '--'}
                      </span>
                    </div>
                  </div>
                  {isRecording && (
                    <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 animate-pulse" style={{width: '85%'}}></div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Instructions */}
            <div className="glass-effect rounded-2xl p-6 border slide-up">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                  How to Use
                </h3>
              </div>
              <ul className="space-y-3">
                {[
                  'Sit comfortably in a quiet environment',
                  'Clean your finger and the sensor',
                  'Place finger gently on the sensor',
                  'Stay still for at least 30 seconds',
                  'Wait for AI analysis to complete'
                ].map((instruction, index) => (
                  <li key={index} className="flex items-start space-x-3 group">
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-200">
                      <span className="text-xs font-bold text-white">{index + 1}</span>
                    </div>
                    <span className="text-sm text-blue-800 dark:text-blue-200 group-hover:text-blue-600 dark:group-hover:text-blue-100 transition-colors duration-200">
                      {instruction}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}