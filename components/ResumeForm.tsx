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

  const addReference = () => {
      setUserData(prev => ({
          ...prev,
          references: [...prev.references, { id: Date.now().toString(), name: '', company: '', title: '', email: '', phone: '' }]
      }));
  };

  const removeReference = (id: string) => {
      setUserData(prev => ({ ...prev, references: prev.references.filter(ref => ref.id !== id) }));
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Technical Skills</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentTechnicalSkill}
                onChange={(e) => setCurrentTechnicalSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTechnicalSkill()}
                placeholder="e.g., React"
                className="flex-grow px-3 py-2 bg-slate-800 border border-slate-600 text-slate-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-slate-500"
              />
              <button onClick={handleAddTechnicalSkill} className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"><PlusIcon className="w-5 h-5"/></button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESET_TECHNICAL_SKILLS.filter(s => !userData.technicalSkills.includes(s)).slice(0, 5).map(skill => (
                <button key={skill} onClick={() => addSkill(skill, 'technical')} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full hover:bg-slate-600">+ {skill}</button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {userData.technicalSkills.map(skill => (
                <span key={skill} className="flex items-center gap-1 bg-blue-900/50 text-blue-200 text-sm font-medium px-3 py-1 rounded-full">
                  {skill}
                  <button onClick={() => removeSkill(skill, 'technical')} className="text-blue-300 hover:text-white"><TrashIcon className="w-3 h-3"/></button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Soft Skills</h3>
             <div className="flex gap-2">
              <input
                type="text"
                value={currentSoftSkill}
                onChange={(e) => setCurrentSoftSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSoftSkill()}
                placeholder="e.g., Teamwork"
                className="flex-grow px-3 py-2 bg-slate-800 border border-slate-600 text-slate-100 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-slate-500"
              />
              <button onClick={handleAddSoftSkill} className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"><PlusIcon className="w-5 h-5"/></button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESET_SOFT_SKILLS.filter(s => !userData.softSkills.includes(s)).slice(0, 5).map(skill => (
                <button key={skill} onClick={() => addSkill(skill, 'soft')} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full hover:bg-slate-600">+ {skill}</button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {userData.softSkills.map(skill => (
                <span key={skill} className="flex items-center gap-1 bg-sky-900/50 text-sky-200 text-sm font-medium px-3 py-1 rounded-full">
                  {skill}
                  <button onClick={() => removeSkill(skill, 'soft')} className="text-sky-300 hover:text-white"><TrashIcon className="w-3 h-3"/></button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Work Experience">
          <div className="space-y-4">
              {userData.experience.map((exp, index) => (
                  <div key={exp.id} className="p-4 bg-slate-800 border border-slate-700 rounded-lg space-y-3 relative">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input label="Job Title" name="title" value={exp.title} onChange={(e) => handleChange(e, index, 'experience')} placeholder="Software Engineer" />
                          <Input label="Company" name="company" value={exp.company} onChange={(e) => handleChange(e, index, 'experience')} placeholder="Tech Solutions Inc." />
                          <Input label="Start Date" name="startDate" value={exp.startDate} onChange={(e) => handleChange(e, index, 'experience')} placeholder="Jan 2021" />
                          <Input label="End Date" name="endDate" value={exp.endDate} onChange={(e) => handleChange(e, index, 'experience')} placeholder="Present" />
                      </div>
                      <Textarea label="Description" name="description" value={exp.description} onChange={(e) => handleChange(e, index, 'experience')} placeholder="- Use bullet points to describe your achievements." />
                      <button type="button" onClick={() => removeExperience(exp.id)} className="absolute top-2 right-2 text-slate-500 hover:text-red-400" aria-label="Remove Experience"><TrashIcon className="w-5 h-5" /></button>
                  </div>
              ))}
              <button type="button" onClick={addExperience} className="flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300">
                  <PlusIcon className="w-5 h-5" />
                  Add Experience
              </button>
          </div>
      </Section>

      <Section title="Personal Projects">
          <div className="space-y-4">
              {userData.projects.map((proj, index) => (
                  <div key={proj.id} className="p-4 bg-slate-800 border border-slate-700 rounded-lg space-y-3 relative">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input label="Project Name" name="name" value={proj.name} onChange={(e) => handleChange(e, index, 'projects')} placeholder="Project Pulse" />
                          <Input label="Project URL" name="url" value={proj.url} onChange={(e) => handleChange(e, index, 'projects')} placeholder="github.com/user/project" />
                      </div>
                      <Textarea label="Description" name="description" value={proj.description} onChange={(e) => handleChange(e, index, 'projects')} placeholder="- Describe what the project does and the technologies used." />
                      <button type="button" onClick={() => removeProject(proj.id)} className="absolute top-2 right-2 text-slate-500 hover:text-red-400" aria-label="Remove Project"><TrashIcon className="w-5 h-5" /></button>
                  </div>
              ))}
              <button type="button" onClick={addProject} className="flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300">
                  <PlusIcon className="w-5 h-5" />
                  Add Project
              </button>
          </div>
      </Section>

      <Section title="Education">
          <div className="space-y-4">
              {userData.education.map((edu, index) => (
                  <div key={edu.id} className="p-4 bg-slate-800 border border-slate-700 rounded-lg space-y-3 relative">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Input label="Institution" name="institution" value={edu.institution} onChange={(e) => handleChange(e, index, 'education')} placeholder="University of Technology" />
                          <Input label="Degree" name="degree" value={edu.degree} onChange={(e) => handleChange(e, index, 'education')} placeholder="B.S. in Computer Science" />
                          <Input label="Graduation Date" name="gradDate" value={edu.gradDate} onChange={(e) => handleChange(e, index, 'education')} placeholder="May 2018" />
                      </div>
                      <button type="button" onClick={() => removeEducation(edu.id)} className="absolute top-2 right-2 text-slate-500 hover:text-red-400" aria-label="Remove Education"><TrashIcon className="w-5 h-5" /></button>
                  </div>
              ))}
              <button type="button" onClick={addEducation} className="flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300">
                  <PlusIcon className="w-5 h-5" />
                  Add Education
              </button>
          </div>
      </Section>

      <Section title="References">
        <div className="space-y-4">
          {userData.references.map((ref, index) => (
            <div key={ref.id} className="p-4 bg-slate-800 border border-slate-700 rounded-lg space-y-3 relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Reference Name" name="name" value={ref.name} onChange={(e) => handleChange(e, index, 'references')} placeholder="Dr. Emily Carter" />
                <Input label="Title" name="title" value={ref.title} onChange={(e) => handleChange(e, index, 'references')} placeholder="CTO" />
                <div className="md:col-span-2">
                    <Input label="Company" name="company" value={ref.company} onChange={(e) => handleChange(e, index, 'references')} placeholder="Tech Solutions Inc." />
                </div>
                <Input label="Email" name="email" value={ref.email} onChange={(e) => handleChange(e, index, 'references')} placeholder="emily.c@techsolutions.com" />
                <Input label="Phone (Optional)" name="phone" value={ref.phone} onChange={(e) => handleChange(e, index, 'references')} placeholder="(555) 123-4567" />
              </div>
              <button
                type="button"
                onClick={() => removeReference(ref.id)}
                className="absolute top-2 right-2 text-slate-500 hover:text-red-400"
                aria-label="Remove Reference"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button type="button" onClick={addReference} className="flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300">
            <PlusIcon className="w-5 h-5" />
            Add Reference
          </button>
        </div>
      </Section>

      <Section title="Signature">
        <SignaturePad onSignatureChange={handleSignatureChange} />
      </Section>
      
      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
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