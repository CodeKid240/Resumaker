import React, { useState, useEffect, useRef } from 'react';
import type { UserData } from '../types';
import { SAMPLE_RESUMES } from '../constants';
import { SparklesIcon } from './icons/SparklesIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { AcademicCapIcon } from './icons/AcademicCapIcon';
import { AnimatedBackground } from './AnimatedBackground';

interface LandingPageProps {
  onGetStarted: () => void;
  onLoadSample: (sampleData: UserData) => void;
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  animationDelay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, children, animationDelay = 0 }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`bg-slate-800/60 backdrop-blur-md p-6 rounded-lg border border-slate-700 transition-all duration-300 scroll-animate ${isVisible ? 'is-visible' : ''}`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-900/50 border border-slate-700 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-100 mb-2">{title}</h3>
      <p className="text-slate-400">{children}</p>
    </div>
  );
};

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLoadSample }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);

  const handleStart = () => {
    setIsExiting(true);
    setTimeout(onGetStarted, 500); // Duration should match the animation
  };

  return (
    <div className={`min-h-screen ${isExiting ? 'animate-fade-out' : 'animate-fade-in'}`}>
      <AnimatedBackground />
      {/* Header */}
      <header className="bg-slate-900/70 backdrop-blur-md sticky top-0 z-10 border-b border-slate-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <SparklesIcon className="w-8 h-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-slate-100">Resumaker</h1>
            </div>
            <button
              onClick={() => setIsAboutUsOpen(true)}
              className="text-sm font-medium text-slate-400 hover:text-blue-400 transition-colors"
            >
              About Us
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="text-center py-20 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-0">
            <h2 className="text-5xl lg:text-7xl font-extrabold text-slate-100 mb-4">
              Build Your Dream Resume with AI
            </h2>
            <p className="text-lg lg:text-xl text-slate-400 max-w-3xl mx-auto mb-8">
              Go from profile to a professional, job-winning resume in minutes. Get AI-powered feedback, tailored content, and even practice for your interview.
            </p>
            <button
              onClick={handleStart}
              className="bg-blue-600 text-white font-semibold py-4 px-10 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-lg transition-transform transform hover:scale-105"
            >
              Start Building for Free
            </button>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
              <SparklesIcon className="w-4 h-4 text-blue-400" />
              <span>Powered by Gemini</span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 lg:py-24 bg-transparent">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-0">
            <div className="text-center mb-12">
              <h3 className="text-4xl lg:text-5xl font-bold text-slate-100">Why Choose Our AI Builder?</h3>
              <p className="text-slate-400 mt-2">Everything you need to land your next job interview.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard icon={<ChartBarIcon className="w-6 h-6 text-blue-400" />} title="AI Resume Analysis" animationDelay={0}>
                Get an instant strength score for your target role and receive concrete, actionable suggestions to improve your resume's impact.
              </FeatureCard>
              <FeatureCard icon={<DocumentTextIcon className="w-6 h-6 text-blue-400" />} title="Instant Resume Generation" animationDelay={150}>
                Automatically generate a complete, well-formatted, and ATS-friendly resume based on your profile details and our AI's recommendations.
              </FeatureCard>
              <FeatureCard icon={<MicrophoneIcon className="w-6 h-6 text-blue-400" />} title="Mock Interview Simulator" animationDelay={300}>
                Practice common interview questions with an AI hiring manager, and get detailed feedback on your answers to build your confidence.
              </FeatureCard>
            </div>
          </div>
        </section>

        {/* Sample Resumes Section */}
        <section className="py-20 lg:py-24 bg-transparent">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-0">
            <div className="text-center mb-12">
              <h3 className="text-4xl lg:text-5xl font-bold text-slate-100">Explore High-Scoring Examples</h3>
              <p className="text-slate-400 mt-2">Click a sample to see how a great resume looks and get it analyzed instantly.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {SAMPLE_RESUMES.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => onLoadSample(sample.data)}
                  className="bg-slate-800/60 backdrop-blur-md p-6 rounded-lg border border-slate-700 text-left hover:bg-slate-700/80 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 bg-slate-700 p-2 rounded-md">
                        <AcademicCapIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-100">{sample.label}</h4>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-transparent border-t border-slate-800 relative z-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-slate-500">
          {/* Copyright removed */}
        </div>
      </footer>

      {/* About Us Modal */}
      {isAboutUsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4 animate-fade-in">
          <div className="bg-slate-900 p-8 rounded-lg shadow-2xl border border-slate-700 relative max-w-md w-full">
            <button
              onClick={() => setIsAboutUsOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
              aria-label="Close"
            >
              <XIcon className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-slate-100 mb-6">About Us</h2>
            <div className="text-slate-300 space-y-4">
              <div>
                <p className="font-semibold text-slate-100">School:</p>
                <p>Bal Bharati Public School GRH Marg</p>
              </div>
              <div>
                <p className="font-semibold text-slate-100">Participants:</p>
                <p>Aarav Parashar, Anhad Singh Sethi</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
