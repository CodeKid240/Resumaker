import React from 'react';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface SuggestionCardProps {
  title: string;
  items: string[];
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ title, items }) => {
  return (
    <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg">
      <h3 className="font-semibold text-slate-100 mb-2">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
            <CheckCircleIcon className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};