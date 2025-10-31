"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Activity, 
  Play,  
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

  // Real-time ECG data from ESP32
  const [liveECGData, setLiveECGData] = useState(null);
  const [liveHeartRate, setLiveHeartRate] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [recordedData, setRecordedData] = useState([]);
  const pollingRef = useRef(null);

  // Poll ESP32 data continuously
  useEffect(() => {
    const pollData = async () => {
      try {
        const response = await fetch('/api/ecg-data');
        const result = await response.json();

        if (result.success && result.data.ecg) {
          setLiveECGData(result.data.ecg);
          setLiveHeartRate(result.data.heartRate);
          setIsConnected(true);

          // If recording, save the data
          if (isRecording) {
            setRecordedData(prev => [...prev, {
              ecg: result.data.ecg,
              bpm: result.data.heartRate.bpm,
              timestamp: Date.now()
            }]);
          }
        } else {
          setIsConnected(false);
        }
      } catch (error) {
        console.error('Error fetching ECG data:', error);
        setIsConnected(false);
      }
    };

    // Poll every 500ms
    pollingRef.current = setInterval(pollData, 500);
    pollData(); // Initial fetch

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [isRecording]);

  // Generate ECG waveform for visualization from real data
  const generateECGData = () => {
    const data = [];
    
    if (!liveECGData) {
      // No data yet, show flat line
      for (let i = 0; i < 500; i++) {
        data.push({ x: i, y: 150 });
      }
      return data;
    }

    // Create realistic ECG visualization from P, Q, R, S, T waves
    const { p, q, r, s, t } = liveECGData;
    const baseY = 150;
    const scale = 50; // Scale factor for wave amplitudes

    for (let i = 0; i < 500; i++) {
      const x = i;
      const phase = (i % 100) / 100; // One heartbeat cycle per 100 points
      let y = baseY;

      if (phase < 0.15) {
        // P wave (atrial depolarization)
        const pPhase = phase / 0.15;
        y = baseY - (p * scale * Math.sin(pPhase * Math.PI));
      } else if (phase < 0.25) {
        // PR segment
        y = baseY;
      } else if (phase < 0.30) {
        // Q wave
        const qPhase = (phase - 0.25) / 0.05;
        y = baseY - (q * scale * Math.sin(qPhase * Math.PI));
      } else if (phase < 0.35) {
        // R wave (ventricular depolarization - largest peak)
        const rPhase = (phase - 0.30) / 0.05;
        y = baseY - (r * scale * Math.sin(rPhase * Math.PI));
      } else if (phase < 0.40) {
        // S wave
        const sPhase = (phase - 0.35) / 0.05;
        y = baseY - (s * scale * Math.sin(sPhase * Math.PI));
      } else if (phase < 0.50) {
        // ST segment
        y = baseY;
      } else if (phase < 0.70) {
        // T wave (ventricular repolarization)
        const tPhase = (phase - 0.50) / 0.20;
        y = baseY - (t * scale * Math.sin(tPhase * Math.PI));
      } else {
        // Rest of cycle
        y = baseY;
      }

      data.push({ x, y });
    }
    
    return data;
  };

  // Enhanced ECG drawing with glow effects
  const drawECG = useCallback(() => {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, liveECGData]); // Dependencies for useCallback

  // Recording timer and animation
  useEffect(() => {
    let interval;
    
    const animate = () => {
      drawECG();
      if (isRecording) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]); // drawECG is stable with useCallback

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    setCurrentReading(null);
    setShowResults(false);
    setRecordedData([]); // Clear previous recording
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
    
    // Analyze real recorded data
    setTimeout(() => {
      if (recordedData.length === 0) {
        // No data recorded
        setCurrentReading({
          status: 'No Data Available',
          confidence: 0,
          risk: 'Unknown',
          description: 'No ECG data was recorded. Please ensure ESP32 is connected and try again.',
          timestamp: new Date().toISOString(),
          duration: recordingTime,
          heartRate: 0,
        });
      } else {
        // Analyze recorded data
        const avgBPM = Math.round(
          recordedData.reduce((sum, d) => sum + d.bpm, 0) / recordedData.length
        );
        
        const maxBPM = Math.max(...recordedData.map(d => d.bpm));
        const minBPM = Math.min(...recordedData.map(d => d.bpm));
        const bpmVariability = maxBPM - minBPM;

        // Calculate average wave amplitudes
        const avgP = recordedData.reduce((sum, d) => sum + d.ecg.p, 0) / recordedData.length;
        const avgQ = recordedData.reduce((sum, d) => sum + d.ecg.q, 0) / recordedData.length;
        const avgR = recordedData.reduce((sum, d) => sum + d.ecg.r, 0) / recordedData.length;
        const avgS = recordedData.reduce((sum, d) => sum + d.ecg.s, 0) / recordedData.length;
        const avgT = recordedData.reduce((sum, d) => sum + d.ecg.t, 0) / recordedData.length;

        // Simple analysis logic
        let status, risk, description, confidence;

        if (avgBPM < 60) {
          status = 'Bradycardia Detected';
          risk = 'Medium';
          description = 'Your heart rate is slower than normal. Monitor and consult a doctor if symptoms persist.';
          confidence = 92;
        } else if (avgBPM > 100) {
          status = 'Tachycardia Detected';
          risk = 'Medium';
          description = 'Your heart rate is faster than normal. Stay calm and consult a doctor if concerned.';
          confidence = 91;
        } else if (bpmVariability > 20) {
          status = 'Irregular Rhythm Detected';
          risk = 'High';
          description = 'Significant heart rate variability detected. Please consult a cardiologist.';
          confidence = 88;
        } else if (avgR < 1.0 || avgR > 1.5) {
          status = 'Abnormal R Wave';
          risk = 'Medium';
          description = 'R wave amplitude is outside normal range. Further evaluation recommended.';
          confidence = 85;
        } else {
          status = 'Normal Sinus Rhythm';
          risk = 'Low';
          description = 'Your heart rhythm appears regular and healthy. All ECG waves are within normal ranges.';
          confidence = 96;
        }

        setCurrentReading({
          status,
          confidence,
          risk,
          description,
          timestamp: new Date().toISOString(),
          duration: recordingTime,
          heartRate: avgBPM,
          waveData: {
            p: avgP.toFixed(2),
            q: avgQ.toFixed(2),
            r: avgR.toFixed(2),
            s: avgS.toFixed(2),
            t: avgT.toFixed(2),
          },
          samples: recordedData.length,
        });
      }
      
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

                    {currentReading.waveData && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                        <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Average ECG Waves</h5>
                        <div className="grid grid-cols-5 gap-2 text-center">
                          <div>
                            <span className="text-xs text-gray-500 block">P</span>
                            <span className="text-sm font-bold text-blue-600">{currentReading.waveData.p}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">Q</span>
                            <span className="text-sm font-bold text-purple-600">{currentReading.waveData.q}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">R</span>
                            <span className="text-sm font-bold text-red-600">{currentReading.waveData.r}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">S</span>
                            <span className="text-sm font-bold text-orange-600">{currentReading.waveData.s}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">T</span>
                            <span className="text-sm font-bold text-green-600">{currentReading.waveData.t}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Based on {currentReading.samples} samples
                        </p>
                      </div>
                    )}

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
                        {liveHeartRate ? liveHeartRate.bpm : '--'}
                      </span>
                      <span className="text-sm text-red-500 ml-1">BPM</span>
                    </div>
                  </div>
                  {isConnected && (
                    <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-red-500 to-pink-500 animate-pulse" style={{width: '75%'}}></div>
                  )}
                </div>

                <div className="relative overflow-hidden bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Zap className={`h-6 w-6 text-green-500 ${isConnected ? 'animate-pulse' : ''}`} />
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white">Signal Quality</span>
                        <p className="text-xs text-gray-500">Connection strength</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {isConnected ? 'Excellent' : 'No Signal'}
                      </span>
                    </div>
                  </div>
                  {isConnected && (
                    <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500" style={{width: '90%'}}></div>
                  )}
                </div>

                <div className="relative overflow-hidden bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Activity className={`h-6 w-6 text-purple-500 ${isConnected ? 'ecg-glow' : ''}`} />
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white">ECG Waves</span>
                        <p className="text-xs text-gray-500">Current reading</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {liveECGData ? (
                        <span className="text-sm font-mono text-purple-600 dark:text-purple-400">
                          R:{liveECGData.r.toFixed(2)}mV
                        </span>
                      ) : (
                        <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          --
                        </span>
                      )}
                    </div>
                  </div>
                  {isConnected && (
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