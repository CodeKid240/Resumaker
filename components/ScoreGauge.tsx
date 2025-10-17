import React from 'react';

interface ScoreGaugeProps {
  score: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getTextColor = (s: number) => {
    if (s < 50) return 'text-red-500';
    if (s < 80) return 'text-yellow-500';
    return 'text-green-500';
  };
  const textColorClass = getTextColor(score);
  
  return (
    <div className="relative flex items-center justify-center w-40 h-40 mx-auto">
      <svg className="w-full h-full" viewBox="0 0 140 140">
        <circle
          className="text-slate-700"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="70"
          cy="70"
        />
        <circle
          className="text-blue-500 transition-all duration-1000 ease-out"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="70"
          cy="70"
          transform="rotate(-90 70 70)"
        />
      </svg>
      <span className={`absolute text-4xl font-bold font-sans ${textColorClass}`}>
        {score}
      </span>
    </div>
  );
};