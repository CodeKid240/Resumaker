import React, { useState } from 'react';
import type { AiResult, UserData } from '../types';
import { ScoreGauge } from './ScoreGauge';
import { SuggestionCard } from './SuggestionCard';
import { CareerRoadmap } from './CareerRoadmap';
import { SparklesIcon } from './icons/SparklesIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { generatePdf } from '../services/fileGenerator';
import { MicrophoneIcon } from './icons/MicrophoneIcon';


interface AiPanelProps {
  userData: UserData;
  aiResult: AiResult | null;
  isLoading: boolean;
  error: string | null;
  onStartInterview: () => void;
}

const LoadingSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-6">
    <div className="flex justify-center">
      <div className="w-40 h-40 bg-slate-700 rounded-full"></div>
    </div>
    <div className="space-y-4">
      <div className="h-6 bg-slate-700 rounded w-1/3"></div>
      <div className="h-4 bg-slate-700 rounded w-full"></div>
      <div className="h-4 bg-slate-700 rounded w-5/6"></div>
    </div>
    <div className="space-y-4">
      <div className="h-6 bg-slate-700 rounded w-1/3"></div>
      <div className="h-4 bg-slate-700 rounded w-full"></div>
      <div className="h-4 bg-slate-700 rounded w-4/6"></div>
    </div>
    <div className="space-y-4">
      <div className="h-6 bg-slate-700 rounded w-1/2"></div>
      <div className="h-24 bg-slate-700 rounded w-full"></div>
      <div className="h-24 bg-slate-700 rounded w-full"></div>
    </div>
  </div>
);

const WelcomeMessage: React.FC = () => (
    <div className="text-center h-full flex flex-col justify-center items-center">
        <SparklesIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-100">AI Assistant Panel</h3>
        <p className="text-slate-400 mt-2">
            Fill out your details on the left and click "Analyze" to see your resume score, get AI-powered suggestions, and generate your professional resume.
        </p>
    </div>
);

export const AiPanel: React.FC<AiPanelProps> = ({ userData, aiResult, isLoading, error, onStartInterview }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = () => {
    if(aiResult?.generatedResume) {
        navigator.clipboard.writeText(aiResult.generatedResume).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }, (err) => {
            console.error('Could not copy text: ', err);
            alert('Failed to copy resume.');
        });
    }
  };

  const handleDownloadPdf = () => {
    if (aiResult?.generatedResume) {
        generatePdf(aiResult.generatedResume, userData);
    }
  };
  
  return (
    <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 sticky top-24 h-[calc(100vh-7rem)] overflow-y-auto">
      {isLoading && <LoadingSkeleton />}
      {error && <div className="text-red-400 bg-red-900/30 border border-red-500 p-4 rounded-md">{error}</div>}
      {!isLoading && !error && !aiResult && <WelcomeMessage />}
      {!isLoading && !error && aiResult && (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-semibold text-center mb-4 text-slate-100">Resume Strength Score</h2>
                <ScoreGauge score={aiResult.score} />
            </div>

            <div className="text-center p-4 bg-slate-800 border-2 border-blue-800 rounded-lg">
                <h3 className="font-semibold text-blue-200 text-lg">Ready for the Next Step?</h3>
                <p className="text-sm text-blue-300 mt-1 mb-3">Your resume looks great! Now, let's practice for the interview.</p>
                <button
                    onClick={onStartInterview}
                    className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <MicrophoneIcon className="w-5 h-5" />
                    Practice Interview
                </button>
            </div>

            <div>
                <h2 className="text-2xl font-semibold mb-3 text-slate-100">AI-Powered Suggestions</h2>
                 <div className="space-y-4">
                     <SuggestionCard title="Professional Summary" items={[aiResult.summary]} />
                     {aiResult.suggestions.skills.length > 0 && <SuggestionCard title="Skills to Add" items={aiResult.suggestions.skills} />}
                     {aiResult.suggestions.experience.length > 0 && <SuggestionCard title="Experience Wording" items={aiResult.suggestions.experience} />}
                     {aiResult.suggestions.projects.length > 0 && <SuggestionCard title="Project Improvements" items={aiResult.suggestions.projects} />}
                     {aiResult.suggestions.certifications.length > 0 && <SuggestionCard title="Recommended Certifications" items={aiResult.suggestions.certifications} />}
                 </div>
            </div>
            
            {aiResult.careerRoadmap && aiResult.careerRoadmap.length > 0 && (
                <div>
                    <h2 className="text-2xl font-semibold mb-3 text-slate-100">Career Progression Roadmap</h2>
                    <CareerRoadmap steps={aiResult.careerRoadmap} />
                </div>
            )}

             <div>
                <h2 className="text-2xl font-semibold text-slate-100 mb-3">Generated Resume</h2>
                <pre className="bg-slate-800 p-4 rounded-md border border-slate-700 text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">{aiResult.generatedResume}</pre>
                
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                    <button 
                        onClick={handleDownloadPdf} 
                        className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        title="Download as PDF"
                    >
                        <DownloadIcon className="w-5 h-5"/>
                        Download PDF
                    </button>

                    <div className="flex items-center gap-4">
                        <button onClick={handleCopyToClipboard} className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-blue-400" title="Copy to Clipboard">
                            <ClipboardIcon className="w-4 h-4"/>
                            {copied ? 'Copied!' : 'Copy to Clipboard'}
                        </button>
                    </div>
                </div>
            </div>

        </div>
      )}
    </div>
  );
};