import React from 'react';
import type { CareerStep } from '../types';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { ListBulletIcon } from './icons/ListBulletIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { BuildingOffice2Icon } from './icons/BuildingOffice2Icon';

interface CareerRoadmapProps {
  steps: CareerStep[];
}

export const CareerRoadmap: React.FC<CareerRoadmapProps> = ({ steps }) => {
  return (
    <div className="relative border-l-2 border-slate-700 pl-6 space-y-8">
      {steps.map((step, index) => (
        <div key={index} className="relative">
          <div className="absolute -left-[34px] top-1 h-4 w-4 rounded-full bg-blue-500 border-4 border-slate-900"></div>
          <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <BriefcaseIcon className="w-6 h-6 text-blue-400 shrink-0" />
              <h3 className="text-lg font-semibold text-slate-100">{step.role}</h3>
            </div>
            
            <div className="pl-9 space-y-4">
               <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-1">
                    <ListBulletIcon className="w-4 h-4" />
                    <span>Key Responsibilities</span>
                  </div>
                  <p className="text-sm text-slate-300">{step.description}</p>
              </div>

               <div>
                   <div className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                    <LightbulbIcon className="w-4 h-4" />
                    <span>Skills to Develop</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {step.skillsToDevelop.map(skill => (
                      <span key={skill} className="bg-slate-700 text-slate-300 text-xs font-medium px-2 py-1 rounded-md">
                        {skill}
                      </span>
                    ))}
                  </div>
              </div>

              {step.companies && step.companies.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                    <BuildingOffice2Icon className="w-4 h-4" />
                    <span>Example Companies</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    {step.companies.map(company => (
                      <div key={company.domain} className="flex items-center gap-2 bg-slate-700/50 p-2 rounded-md">
                        <img 
                          src={`https://logo.clearbit.com/${company.domain}`} 
                          alt={`${company.name} logo`}
                          className="w-5 h-5 object-contain rounded-full bg-white"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none'; // Hide broken images
                          }}
                        />
                        <span className="text-xs font-medium text-slate-300">{company.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};