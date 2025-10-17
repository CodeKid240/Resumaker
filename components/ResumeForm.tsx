import React, { useState } from 'react';
import type { UserData, Experience, Education, Project } from '../types';
import { JOB_FIELDS, PRESET_TECHNICAL_SKILLS, PRESET_SOFT_SKILLS } from '../constants';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { SignaturePad } from './SignaturePad';

interface ResumeFormProps {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  onSubmit: () => void;
  isLoading: boolean;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
    <h2 className="text-2xl font-semibold mb-4 text-slate-100 border-b border-slate-700 pb-2">{title}</h2>
    {children}
  </div>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-400 mb-1">{label}</label>
    <input
      id={id}
      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-slate-500"
      {...props}
    />
  </div>
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-400 mb-1">{label}</label>
    <textarea
      id={id}
      rows={4}
      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-slate-500"
      {...props}
    />
  </div>
);


export const ResumeForm: React.FC<ResumeFormProps> = ({ userData, setUserData, onSubmit, isLoading }) => {
  const [currentTechnicalSkill, setCurrentTechnicalSkill] = useState('');
  const [currentSoftSkill, setCurrentSoftSkill] = useState('');

  const handleChange = <T,>(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, index?: number, section?: keyof UserData) => {
      const { name, value } = e.target;
      if (index !== undefined && section && Array.isArray(userData[section])) {
          const sectionData = [...(userData[section] as any[])];
          sectionData[index] = { ...sectionData[index], [name]: value };
          setUserData(prev => ({ ...prev, [section]: sectionData }));
      } else {
          setUserData(prev => ({ ...prev, [name]: value }));
      }
  };

  const handleSignatureChange = (newSignature: string) => {
    setUserData(prev => ({ ...prev, signature: newSignature }));
  };

  const addSkill = (skill: string, type: 'technical' | 'soft') => {
    if (!skill) return;
    const skillKey = type === 'technical' ? 'technicalSkills' : 'softSkills';
    const skills = userData[skillKey];
    if (!skills.includes(skill)) {
      setUserData(prev => ({ ...prev, [skillKey]: [...skills, skill] }));
    }
  };

  const handleAddTechnicalSkill = () => {
    addSkill(currentTechnicalSkill.trim(), 'technical');
    setCurrentTechnicalSkill('');
  };

  const handleAddSoftSkill = () => {
    addSkill(currentSoftSkill.trim(), 'soft');
    setCurrentSoftSkill('');
  };

  const removeSkill = (skillToRemove: string, type: 'technical' | 'soft') => {
    const skillKey = type === 'technical' ? 'technicalSkills' : 'softSkills';
    setUserData(prev => ({ ...prev, [skillKey]: prev[skillKey].filter(skill => skill !== skillToRemove) }));
  };
  
  const addExperience = () => {
      setUserData(prev => ({
          ...prev,
          experience: [...prev.experience, { id: Date.now().toString(), title: '', company: '', startDate: '', endDate: '', description: '' }]
      }));
  };

  const removeExperience = (id: string) => {
      setUserData(prev => ({ ...prev, experience: prev.experience.filter(exp => exp.id !== id) }));
  };
  
  const addEducation = () => {
      setUserData(prev => ({
          ...prev,
          education: [...prev.education, { id: Date.now().toString(), institution: '', degree: '', gradDate: '' }]
      }));
  };

  const removeEducation = (id: string) => {
      setUserData(prev => ({ ...prev, education: prev.education.filter(edu => edu.id !== id) }));
  };

  const addProject = () => {
      setUserData(prev => ({
          ...prev,
          projects: [...prev.projects, { id: Date.now().toString(), name: '', url: '', description: '' }]
      }));
  };

  const removeProject = (id: string) => {
      setUserData(prev => ({ ...prev, projects: prev.projects.filter(proj => proj.id !== id) }));
  };

  return (
    <div className="space-y-6">
      <Section title="Target Role">
        <div className="space-y-4">
          <div>
            <label htmlFor="targetRole" className="block text-sm font-medium text-slate-400 mb-1">What job are you applying for?</label>
            <select
              id="targetRole"
              name="targetRole"
              value={userData.targetRole}
              onChange={(e) => setUserData(prev => ({ ...prev, targetRole: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {JOB_FIELDS.map(field => <option key={field} value={field}>{field}</option>)}
            </select>
          </div>
          {userData.targetRole === 'Other' && (
             <Input 
                label="Please specify the role" 
                id="customTargetRole" 
                name="customTargetRole" 
                value={userData.customTargetRole} 
                onChange={handleChange} 
                placeholder="e.g., Blockchain Developer" 
              />
          )}
        </div>
      </Section>

      <Section title="Personal Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Full Name" id="name" name="name" value={userData.name} onChange={handleChange} placeholder="Jane Doe" />
          <Input label="Email" id="email" name="email" type="email" value={userData.email} onChange={handleChange} placeholder="jane.doe@example.com" />
          <Input label="Phone" id="phone" name="phone" type="tel" value={userData.phone} onChange={handleChange} placeholder="(123) 456-7890" />
          <Input label="LinkedIn Profile URL" id="linkedin" name="linkedin" value={userData.linkedin} onChange={handleChange} placeholder="linkedin.com/in/janedoe" />
        </div>
      </Section>

      <Section title="Skills">
        <div className="space-y-6">
          {/* --- Technical Skills --- */}
          <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-3">Technical Skills</h3>
            <div className="flex items-center gap-2 mb-3">
              <Input
                label="Add a technical skill"
                id="technical-skill-input"
                value={currentTechnicalSkill}
                onChange={(e) => setCurrentTechnicalSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTechnicalSkill()}
                placeholder="e.g., React"
              />
              <button type="button" onClick={handleAddTechnicalSkill} className="mt-6 shrink-0 bg-slate-700 text-slate-200 p-2 rounded-md hover:bg-slate-600 border border-slate-600">
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1 mb-4">
                {PRESET_TECHNICAL_SKILLS.map(skill => (
                    <button key={skill} onClick={() => addSkill(skill, 'technical')} className="text-xs bg-slate-700/50 border border-slate-600 text-slate-300 px-2 py-1 rounded-md hover:bg-slate-600 hover:text-white transition-colors">
                        {skill}
                    </button>
                ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {userData.technicalSkills.map(skill => (
                <span key={skill} className="flex items-center bg-blue-900/50 text-blue-300 text-sm font-medium px-2.5 py-1 rounded-full border border-blue-700">
                  {skill}
                  <button onClick={() => removeSkill(skill, 'technical')} className="ml-2 text-blue-400 hover:text-blue-200">
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
          
          <hr className="border-slate-700" />

          {/* --- Soft Skills --- */}
          <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-3">Soft Skills</h3>
            <div className="flex items-center gap-2 mb-3">
              <Input
                label="Add a soft skill"
                id="soft-skill-input"
                value={currentSoftSkill}
                onChange={(e) => setCurrentSoftSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSoftSkill()}
                placeholder="e.g., Communication"
              />
              <button type="button" onClick={handleAddSoftSkill} className="mt-6 shrink-0 bg-slate-700 text-slate-200 p-2 rounded-md hover:bg-slate-600 border border-slate-600">
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1 mb-4">
                {PRESET_SOFT_SKILLS.map(skill => (
                    <button key={skill} onClick={() => addSkill(skill, 'soft')} className="text-xs bg-slate-700/50 border border-slate-600 text-slate-300 px-2 py-1 rounded-md hover:bg-slate-600 hover:text-white transition-colors">
                        {skill}
                    </button>
                ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {userData.softSkills.map(skill => (
                <span key={skill} className="flex items-center bg-teal-900/50 text-teal-300 text-sm font-medium px-2.5 py-1 rounded-full border border-teal-700">
                  {skill}
                  <button onClick={() => removeSkill(skill, 'soft')} className="ml-2 text-teal-400 hover:text-teal-200">
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Work Experience">
        <div className="space-y-4">
          {userData.experience.map((exp, index) => (
            <div key={exp.id} className="p-4 border border-slate-700 rounded-md relative">
               <button onClick={() => removeExperience(exp.id)} className="absolute top-2 right-2 text-slate-500 hover:text-red-500">
                  <TrashIcon className="w-5 h-5"/>
               </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Job Title" id={`exp-title-${index}`} name="title" value={exp.title} onChange={(e) => handleChange(e, index, 'experience')} />
                <Input label="Company" id={`exp-company-${index}`} name="company" value={exp.company} onChange={(e) => handleChange(e, index, 'experience')} />
                <Input label="Start Date" id={`exp-startDate-${index}`} name="startDate" value={exp.startDate} onChange={(e) => handleChange(e, index, 'experience')} placeholder="e.g., Jan 2020" />
                <Input label="End Date" id={`exp-endDate-${index}`} name="endDate" value={exp.endDate} onChange={(e) => handleChange(e, index, 'experience')} placeholder="e.g., Present" />
              </div>
              <div className="mt-4">
                <Textarea label="Description / Achievements" id={`exp-description-${index}`} name="description" value={exp.description} onChange={(e) => handleChange(e, index, 'experience')} placeholder="- Led a team of 5 engineers..." />
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addExperience} className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300">
          <PlusIcon className="w-4 h-4" /> Add Experience
        </button>
      </Section>

      <Section title="Personal Projects">
        <div className="space-y-4">
          {userData.projects.map((proj, index) => (
            <div key={proj.id} className="p-4 border border-slate-700 rounded-md relative">
               <button onClick={() => removeProject(proj.id)} className="absolute top-2 right-2 text-slate-500 hover:text-red-500">
                  <TrashIcon className="w-5 h-5"/>
               </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Project Name" id={`proj-name-${index}`} name="name" value={proj.name} onChange={(e) => handleChange(e, index, 'projects')} />
                <Input label="Project URL (Optional)" id={`proj-url-${index}`} name="url" value={proj.url} onChange={(e) => handleChange(e, index, 'projects')} />
              </div>
              <div className="mt-4">
                <Textarea label="Description" id={`proj-description-${index}`} name="description" value={proj.description} onChange={(e) => handleChange(e, index, 'projects')} placeholder="- Developed a web app using React and Firebase..." />
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addProject} className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300">
          <PlusIcon className="w-4 h-4" /> Add Project
        </button>
      </Section>

      <Section title="Education">
        <div className="space-y-4">
          {userData.education.map((edu, index) => (
            <div key={edu.id} className="p-4 border border-slate-700 rounded-md relative">
               <button onClick={() => removeEducation(edu.id)} className="absolute top-2 right-2 text-slate-500 hover:text-red-500">
                  <TrashIcon className="w-5 h-5"/>
               </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Institution" id={`edu-institution-${index}`} name="institution" value={edu.institution} onChange={(e) => handleChange(e, index, 'education')} />
                <Input label="Degree / Field of Study" id={`edu-degree-${index}`} name="degree" value={edu.degree} onChange={(e) => handleChange(e, index, 'education')} />
                <Input label="Graduation Date" id={`edu-gradDate-${index}`} name="gradDate" value={edu.gradDate} onChange={(e) => handleChange(e, index, 'education')} placeholder="e.g., May 2018" />
              </div>
            </div>
          ))}
        </div>
         <button type="button" onClick={addEducation} className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300">
          <PlusIcon className="w-4 h-4" /> Add Education
        </button>
      </Section>

      <Section title="Signature">
        <SignaturePad onSignatureChange={handleSignatureChange} />
      </Section>

      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="w-full flex justify-center items-center gap-3 bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing...
          </>
        ) : (
          <>
            <SparklesIcon className="w-5 h-5" />
            Analyze & Generate Resume
          </>
        )}
      </button>
    </div>
  );
};