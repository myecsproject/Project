"use client";

import Link from 'next/link';
import { 
  Heart, 
  Shield, 
  Activity, 
  Users, 
  ArrowRight,
  CheckCircle,
  Zap,
  Clock
} from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: Activity,
      title: 'Real-time ECG Analysis',
      description: 'Advanced algorithms analyze your heart rhythm in real-time for immediate insights.',
    },
    {
      icon: Shield,
      title: 'Early Detection',
      description: 'Detect potential heart abnormalities before they become serious health issues.',
    },
    {
      icon: Clock,
      title: '24/7 Monitoring',
      description: 'Continuous monitoring ensures your heart health is always protected.',
    },
    {
      icon: Users,
      title: 'Professional Care',
      description: 'Connect with healthcare professionals for expert consultation and guidance.',
    },
  ];

  const stats = [
    { number: '99.8%', label: 'Accuracy Rate' },
    { number: '50K+', label: 'Users Protected' },
    { number: '24/7', label: 'Monitoring' },
    { number: '5min', label: 'Quick Scan' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-full mb-8">
            <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              AI-Powered Heart Protection
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Protect Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-600">
              Heart Health
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Advanced AI-powered heart abnormality detection system that provides real-time analysis, 
            early warning signs, and personalized health insights to keep your heart beating strong.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/take-reading"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <Activity className="h-5 w-5 mr-2" />
              Start Heart Scan
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
            
            <Link
              href="/instructions"
              className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200"
            >
              Learn How It Works
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 sm:px-6 mt-14 lg:px-8 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose HeartGuard?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our advanced technology combines medical expertise with AI precision to provide 
              unmatched heart health monitoring.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white">
            <Heart className="h-16 w-16 mx-auto mb-6 text-pink-200" />
            <h2 className="text-4xl font-bold mb-4">
              Ready to Protect Your Heart?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of users who trust HeartGuard for their heart health monitoring.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-200"
            >
              Get Started Today
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}