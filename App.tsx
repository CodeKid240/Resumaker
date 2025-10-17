import React, { useState, useCallback, useEffect } from 'react';
import { ResumeForm } from './components/ResumeForm';
import { AiPanel } from './components/AiPanel';
import { InterviewPanel } from './components/InterviewPanel';
import { LandingPage } from './components/LandingPage';
import type { UserData, AiResult } from './types';
import { analyzeResume, generateFullResume } from './services/geminiService';
import { JOB_FIELDS } from './constants';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { ArrowLeftIcon } from './components/icons/ArrowLeftIcon';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [isExitingApp, setIsExitingApp] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    targetRole: JOB_FIELDS[0],
    customTargetRole: '',
    technicalSkills: [],
    softSkills: [],
    experience: [],
    education: [],
    projects: [],
    signature: ''
  });
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInterviewing, setIsInterviewing] = useState<boolean>(false);
  const [dataToAnalyze, setDataToAnalyze] = useState<UserData | null>(null);


  const handleAnalyze = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAiResult(null);

    try {
      const roleToAnalyze = userData.targetRole === 'Other' ? userData.customTargetRole : userData.targetRole;
      if (!roleToAnalyze) {
        throw new Error("Please specify a target role.");
      }
      
      const dataToAnalyze = { ...userData, targetRole: roleToAnalyze };

      const analysis = await analyzeResume(dataToAnalyze);
      if (!analysis) {
        throw new Error("Failed to get analysis from AI.");
      }
      
      const fullResume = await generateFullResume(dataToAnalyze, analysis.summary);
      if (!fullResume) {
        throw new Error("Failed to generate the full resume from AI.");
      }

      setAiResult({ ...analysis, generatedResume: fullResume });

    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "An unknown error occurred. Check your API key and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    // This effect runs after the component renders. If dataToAnalyze is set,
    // it means we've just switched views from the landing page and `userData` is now updated.
    // We can now safely call handleAnalyze, which will use the new `userData` state.
    if (dataToAnalyze) {
        handleAnalyze();
        setDataToAnalyze(null); // Reset the trigger
    }
  }, [dataToAnalyze, handleAnalyze]);

  const handleStartInterview = () => {
    setIsInterviewing(true);
  };
  
  const handleEndInterview = () => {
    setIsInterviewing(false);
  };

  const handleGetStarted = () => {
    setView('app');
  };

  const handleGoBackToLanding = () => {
    setIsExitingApp(true);
    setTimeout(() => {
      setView('landing');
      setUserData({
        name: '',
        email: '',
        phone: '',
        linkedin: '',
        targetRole: JOB_FIELDS[0],
        customTargetRole: '',
        technicalSkills: [],
        softSkills: [],
        experience: [],
        education: [],
        projects: [],
        signature: ''
      });
      setAiResult(null);
      setError(null);
      setIsExitingApp(false);
    }, 500); // Match animation duration
  };

  const handleLoadSample = (sampleData: UserData) => {
    setUserData(sampleData);
    setView('app');
    setDataToAnalyze(sampleData); // This will trigger the useEffect on the next render
  };


  if (view === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} onLoadSample={handleLoadSample} />;
  }

  return (
    <div className={`min-h-screen ${isExitingApp ? 'animate-fade-out' : 'animate-fade-in'}`}>
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SparklesIcon className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold text-slate-100">Resumaker</h1>
          </div>
          {isInterviewing ? (
            <button
              onClick={handleEndInterview}
              className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-blue-400 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Back to Resume
            </button>
          ) : (
            <button
              onClick={handleGoBackToLanding}
              className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-blue-400 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Back to Home
            </button>
          )}
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {isInterviewing ? (
          <InterviewPanel userData={userData} onEndInterview={handleEndInterview} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ResumeForm
              userData={userData}
              setUserData={setUserData}
              onSubmit={handleAnalyze}
              isLoading={isLoading}
            />
            <AiPanel
              userData={userData}
              aiResult={aiResult}
              isLoading={isLoading}
              error={error}
              onStartInterview={handleStartInterview}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;