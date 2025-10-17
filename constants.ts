import type { UserData } from './types';

export const JOB_FIELDS = [
  'Software Engineering',
  'Product Management',
  'Digital Marketing',
  'Data Science',
  'UX/UI Design',
  'Sales',
  'Human Resources',
  'Finance',
  'Project Management',
  'Other',
];

export const PRESET_TECHNICAL_SKILLS = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Git', 'CI/CD', 'Figma', 'Sketch', 'Google Analytics'];
export const PRESET_SOFT_SKILLS = ['Communication', 'Teamwork', 'Problem-Solving', 'Leadership', 'Time Management', 'Adaptability', 'Creativity', 'Critical Thinking', 'Stakeholder Management', 'User Research'];


export const SAMPLE_RESUMES: { label: string; data: UserData }[] = [
  {
    label: 'Senior Software Engineer',
    data: {
      name: 'Alex Johnson',
      email: 'alex.j@email.com',
      phone: '(555) 123-4567',
      linkedin: 'linkedin.com/in/alexjohnsondev',
      targetRole: 'Software Engineering',
      customTargetRole: '',
      technicalSkills: ['TypeScript', 'React', 'Node.js', 'Python', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'CI/CD'],
      softSkills: ['Agile Methodologies', 'Mentorship', 'Team Leadership'],
      experience: [
        { id: 'exp1', title: 'Senior Software Engineer', company: 'TechSolutions Inc.', startDate: 'Jan 2021', endDate: 'Present', description: '- Led the architecture and development of a new microservices-based platform, improving system scalability by 40% and reducing latency by 20%.\n- Mentored a team of 4 junior engineers, fostering best practices in code quality and testing.\n- Implemented a CI/CD pipeline using Jenkins and Docker, reducing deployment time by 75%.' },
        { id: 'exp2', title: 'Software Engineer', company: 'Innovate Co.', startDate: 'Jun 2018', endDate: 'Dec 2020', description: '- Developed and maintained key features for a high-traffic B2C SaaS product using React and Node.js.\n- Collaborated with product managers to translate requirements into technical specifications.\n- Reduced critical bug reports by 25% through the implementation of a comprehensive end-to-end testing suite.' }
      ],
      education: [
        { id: 'edu1', institution: 'University of Technology', degree: 'B.S. in Computer Science', gradDate: 'May 2018' }
      ],
      projects: [
        { id: 'proj1', name: 'Project Pulse', url: 'github.com/alexj/pulse', description: '- A real-time project management dashboard built with React, Node.js, and WebSockets.\n- Features collaborative task tracking, notifications, and progress visualization.' }
      ],
      references: [
        { id: 'ref1', name: 'Dr. Emily Carter', company: 'Innovate Co.', title: 'CTO', email: 'emily.c@innovate.co', phone: '(555) 111-2222' }
      ],
      signature: ''
    }
  },
  {
    label: 'Product Manager',
    data: {
      name: 'Samantha Lee',
      email: 'sam.lee@email.com',
      phone: '(555) 987-6543',
      linkedin: 'linkedin.com/in/samanthaleepm',
      targetRole: 'Product Management',
      customTargetRole: '',
      technicalSkills: ['JIRA', 'A/B Testing', 'Data Analysis', 'SQL'],
      softSkills: ['Product Roadmapping', 'Agile & Scrum', 'User Research', 'Market Analysis', 'Stakeholder Management'],
      experience: [
        { id: 'exp1', title: 'Product Manager', company: 'FutureGadget Labs', startDate: 'Aug 2019', endDate: 'Present', description: '- Led the product lifecycle for a mobile application from conception to launch, acquiring 500,000+ users in the first year.\n- Defined and analyzed metrics that informed the success of products, resulting in a 15% increase in user engagement.\n- Managed a cross-functional team of engineers, designers, and marketers.' },
        { id: 'exp2', title: 'Associate Product Manager', company: 'DataStream Corp.', startDate: 'Jul 2017', endDate: 'Jul 2019', description: '- Conducted user interviews and market research to identify customer needs and product opportunities.\n- Managed the product backlog and prioritized features based on strategic goals and user feedback.' }
      ],
      education: [
        { id: 'edu1', institution: 'State University', degree: 'B.A. in Business Administration', gradDate: 'May 2017' }
      ],
      projects: [
        { id: 'proj1', name: 'PM Portfolio Website', url: 'samlee-pm.com', description: '- Personal website showcasing product case studies, including problem statements, user research, and outcomes.' }
      ],
      references: [
        { id: 'ref1', name: 'David Chen', company: 'FutureGadget Labs', title: 'Head of Engineering', email: 'david.chen@futuregadget.com', phone: '(555) 222-3333' }
      ],
      signature: ''
    }
  },
  {
    label: 'UX/UI Designer',
    data: {
      name: 'Maria Garcia',
      email: 'maria.garcia@email.com',
      phone: '(555) 234-5678',
      linkedin: 'linkedin.com/in/mariagarciadesign',
      targetRole: 'UX/UI Design',
      customTargetRole: '',
      technicalSkills: ['Figma', 'Sketch', 'Adobe XD', 'HTML/CSS', 'Design Systems'],
      softSkills: ['User Research', 'Wireframing', 'Prototyping', 'Usability Testing', 'Empathy Mapping'],
      experience: [
        { id: 'exp1', title: 'Lead UX/UI Designer', company: 'Creative Solutions', startDate: 'Mar 2020', endDate: 'Present', description: '- Led the redesign of a major e-commerce platform, resulting in a 20% increase in conversion rates and a 30% reduction in cart abandonment.\n- Established and maintained a comprehensive design system, ensuring consistency across all products.\n- Mentored junior designers and conducted regular design critiques.' },
        { id: 'exp2', title: 'UX/UI Designer', company: 'BrightApp Co.', startDate: 'Jun 2018', endDate: 'Feb 2020', description: '- Designed user-centric interfaces for web and mobile applications, from wireframes to high-fidelity mockups.\n- Conducted usability testing sessions and synthesized findings into actionable design improvements.' }
      ],
      education: [
        { id: 'edu1', institution: 'Design Institute', degree: 'B.F.A. in Graphic Design', gradDate: 'May 2018' }
      ],
      projects: [
        { id: 'proj1', name: 'CityExplore App Concept', url: 'behance.net/mariagarcia/cityexplore', description: '- A mobile app concept designed to help tourists discover local attractions.\n- Project includes user personas, journey maps, wireframes, and a high-fidelity interactive prototype.' }
      ],
      references: [
        { id: 'ref1', name: 'John Miller', company: 'Creative Solutions', title: 'Head of Product', email: 'john.miller@creative.com', phone: '(555) 333-4444' }
      ],
      signature: ''
    }
  },
  {
    label: 'Digital Marketer',
    data: {
      name: 'David Chen',
      email: 'david.chen@email.com',
      phone: '(555) 876-5432',
      linkedin: 'linkedin.com/in/davidchenmarketing',
      targetRole: 'Digital Marketing',
      customTargetRole: '',
      technicalSkills: ['SEO/SEM', 'Google Analytics', 'Google Ads', 'HubSpot', 'A/B Testing'],
      softSkills: ['Content Marketing', 'Social Media Marketing', 'Email Marketing', 'Campaign Strategy'],
      experience: [
        { id: 'exp1', title: 'Digital Marketing Manager', company: 'GrowthHackers Agency', startDate: 'May 2019', endDate: 'Present', description: '- Developed and executed multi-channel marketing campaigns for SaaS clients, increasing organic traffic by an average of 150% YoY.\n- Managed a monthly ad budget of $50,000 across Google Ads and social media, achieving a 25% reduction in CPA.\n- Grew client email lists by over 200% through targeted lead generation strategies.' },
        { id: 'exp2', title: 'Marketing Coordinator', company: 'OnlineRetail Inc.', startDate: 'Jun 2017', endDate: 'Apr 2019', description: '- Managed social media accounts, increasing follower engagement by 50%.\n- Assisted in creating and scheduling email marketing campaigns.' }
      ],
      education: [
        { id: 'edu1', institution: 'Metropolitan University', degree: 'B.S. in Marketing', gradDate: 'May 2017' }
      ],
      projects: [
        { id: 'proj1', name: 'Personal Marketing Blog', url: 'marketmusings.com', description: '- A blog covering topics in SEO and content marketing, attracting over 10,000 monthly visitors.' }
      ],
      references: [
          { id: 'ref1', name: 'Sarah Lee', company: 'GrowthHackers Agency', title: 'CEO', email: 'sarah.lee@ghagency.com', phone: '(555) 444-5555' }
      ],
      signature: ''
    }
  }
];