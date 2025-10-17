import type { UserData } from '../types';

// These libraries are loaded from CDN in index.html.
// We access them via the `window` object to avoid ReferenceErrors in a module context.

export const PDF_STYLES = ['Modern', 'Classic', 'Elegant', 'Minimalist', 'Professional', 'Tech'];

interface StyleConfig {
  layout: {
    isTwoColumn: boolean;
    pageMargin: number;
    sidebarWidth?: number;
    gutter?: number;
    mainContentX?: number;
  };
  colors: {
    sidebarBg?: string;
    sidebarText?: string;
    sidebarHead?: string;
    mainBg: string;
    mainHead: string;
    mainSubhead: string;
    mainText: string;
    accent: string;
  };
  fonts: {
    nameSize: number;
    titleSize: number;
    sectionTitleSize: number;
    bodyBoldSize: number;
    bodySize: number;
    smallSize: number;
    family: 'helvetica' | 'times' | 'courier';
    headerAlign?: 'left' | 'center';
  };
}

const STYLE_CONFIGS: { [key: string]: StyleConfig } = {
  Modern: {
    layout: { isTwoColumn: true, pageMargin: 40, sidebarWidth: 180, gutter: 20 },
    colors: { sidebarBg: '#0f172a', sidebarText: '#cbd5e1', sidebarHead: '#ffffff', mainBg: '#ffffff', mainHead: '#1e293b', mainSubhead: '#475569', mainText: '#334155', accent: '#2563eb' },
    fonts: { nameSize: 27, titleSize: 12, sectionTitleSize: 17, bodyBoldSize: 12, bodySize: 12, smallSize: 11, family: 'helvetica' }
  },
  Classic: {
    layout: { isTwoColumn: false, pageMargin: 50 },
    colors: { mainBg: '#ffffff', mainHead: '#000000', mainSubhead: '#333333', mainText: '#333333', accent: '#000000' },
    fonts: { nameSize: 28, titleSize: 14, sectionTitleSize: 14, bodyBoldSize: 11, bodySize: 11, smallSize: 10, family: 'times', headerAlign: 'center' }
  },
  Elegant: {
    layout: { isTwoColumn: false, pageMargin: 60 },
    colors: { mainBg: '#ffffff', mainHead: '#2c3e50', mainSubhead: '#7f8c8d', mainText: '#34495e', accent: '#95a5a6' },
    fonts: { nameSize: 26, titleSize: 13, sectionTitleSize: 12, bodyBoldSize: 11, bodySize: 11, smallSize: 10, family: 'times', headerAlign: 'left' }
  },
  Minimalist: {
    layout: { isTwoColumn: false, pageMargin: 60 },
    colors: { mainBg: '#ffffff', mainHead: '#333333', mainSubhead: '#555555', mainText: '#444444', accent: '#cccccc' },
    fonts: { nameSize: 24, titleSize: 12, sectionTitleSize: 11, bodyBoldSize: 10, bodySize: 10, smallSize: 9, family: 'helvetica', headerAlign: 'left' }
  },
  Professional: {
    layout: { isTwoColumn: true, pageMargin: 40, sidebarWidth: 180, gutter: 20 },
    colors: { sidebarBg: '#f1f5f9', sidebarText: '#475569', sidebarHead: '#0f172a', mainBg: '#ffffff', mainHead: '#1e293b', mainSubhead: '#475569', mainText: '#334155', accent: '#0ea5e9' },
    fonts: { nameSize: 27, titleSize: 12, sectionTitleSize: 17, bodyBoldSize: 12, bodySize: 12, smallSize: 11, family: 'helvetica' }
  },
  Tech: {
    layout: { isTwoColumn: false, pageMargin: 50 },
    colors: { mainBg: '#1e293b', mainHead: '#f1f5f9', mainSubhead: '#94a3b8', mainText: '#cbd5e1', accent: '#10b981' },
    fonts: { nameSize: 26, titleSize: 13, sectionTitleSize: 13, bodyBoldSize: 11, bodySize: 11, smallSize: 10, family: 'courier', headerAlign: 'left' }
  }
};


const parseResumeText = (resumeText: string) => {
    const lines = resumeText.split('\n').filter(line => line.trim() !== '');
    
    const sections: { [key: string]: string[] } = {
        name: [],
        contact: [],
        summary: [],
        'technical skills': [],
        'soft skills': [],
        'work experience': [],
        'personal projects': [],
        education: [],
        references: [],
    };
    let currentSection: keyof typeof sections | null = null;

    const sectionKeywords = [
        'summary', 
        'technical skills', 
        'soft skills', 
        'work experience', 
        'personal projects', 
        'education',
        'references',
    ];

    // First two lines are always name and contact
    sections.name.push(lines.shift() || '');
    sections.contact.push(lines.shift() || '');

    lines.forEach(line => {
        const lowerLine = line.trim().toLowerCase();
        const keyword = sectionKeywords.find(k => lowerLine === k);

        if (keyword) {
            currentSection = keyword as keyof typeof sections;
        } else if (currentSection) {
            sections[currentSection].push(line.trim());
        }
    });

    return sections;
};


export const generatePdf = (resumeText: string, userData: UserData, styleName: string) => {
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF('p', 'pt', 'letter');
    const sections = parseResumeText(resumeText);
    
    const config = STYLE_CONFIGS[styleName] || STYLE_CONFIGS.Modern;
    const { layout, colors, fonts } = config;
    
    // --- Style & Layout Constants ---
    const PAGE_MARGIN = layout.pageMargin;
    const PAGE_WIDTH = doc.internal.pageSize.getWidth();
    const PAGE_HEIGHT = doc.internal.pageSize.getHeight();

    let MAIN_CONTENT_X = PAGE_MARGIN;
    let MAIN_CONTENT_WIDTH = PAGE_WIDTH - (2 * PAGE_MARGIN);
    
    if (layout.isTwoColumn && layout.sidebarWidth && layout.gutter) {
        MAIN_CONTENT_X = PAGE_MARGIN + layout.sidebarWidth + layout.gutter;
        MAIN_CONTENT_WIDTH = PAGE_WIDTH - MAIN_CONTENT_X - PAGE_MARGIN;
    }

    let y = 0; // Global Y position tracker

    const addNewPage = () => {
        doc.addPage();
        if (layout.isTwoColumn) {
            drawSidebar();
        } else {
            doc.setFillColor(colors.mainBg);
            doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');
        }
        y = PAGE_MARGIN;
    };

    const checkPageBreak = (spaceNeeded: number) => {
        if (y + spaceNeeded > PAGE_HEIGHT - PAGE_MARGIN) {
            addNewPage();
        }
    };

    const drawSidebar = () => {
        if (!layout.isTwoColumn || !layout.sidebarWidth || !colors.sidebarBg) return;
        
        doc.setFillColor(colors.sidebarBg);
        doc.rect(0, 0, layout.sidebarWidth + PAGE_MARGIN, PAGE_HEIGHT, 'F');
        
        let sidebarY = PAGE_MARGIN;
        const sidebarContentX = PAGE_MARGIN;
        const sidebarContentWidth = layout.sidebarWidth;

        // --- Name ---
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(fonts.nameSize);
        doc.setTextColor(colors.sidebarHead!);
        const nameLines = doc.splitTextToSize(userData.name, sidebarContentWidth);
        doc.text(nameLines, sidebarContentX, sidebarY);
        sidebarY += (nameLines.length * fonts.nameSize * 0.8) + 10;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(fonts.titleSize);
        doc.setTextColor(colors.accent);
        const roleText = userData.targetRole === 'Other' ? userData.customTargetRole : userData.targetRole;
        doc.text(roleText, sidebarContentX, sidebarY);
        sidebarY += fonts.sectionTitleSize * 2;
        
        // --- Contact ---
        doc.setFontSize(fonts.bodyBoldSize);
        doc.setTextColor(colors.sidebarHead!);
        doc.text('CONTACT', sidebarContentX, sidebarY);
        sidebarY += fonts.bodySize * 1.5;

        doc.setFontSize(fonts.smallSize);
        doc.setTextColor(colors.sidebarText!);
        const contactInfo = [userData.email, userData.phone, userData.linkedin];
        contactInfo.forEach(info => {
             const infoLines = doc.splitTextToSize(info, sidebarContentWidth);
             doc.text(infoLines, sidebarContentX, sidebarY);
             sidebarY += (infoLines.length * fonts.smallSize * 1.2) + 5;
        });
        sidebarY += fonts.sectionTitleSize;

        // --- Skills ---
        const drawSkills = (title: string, skills: string[]) => {
            if (!skills || skills.length === 0) return;
            doc.setFontSize(fonts.bodyBoldSize);
            doc.setTextColor(colors.sidebarHead!);
            doc.text(title.toUpperCase(), sidebarContentX, sidebarY);
            sidebarY += fonts.bodySize * 1.5;

            doc.setFontSize(fonts.smallSize);
            doc.setTextColor(colors.sidebarText!);
            skills.forEach(skill => {
                doc.text(`• ${skill}`, sidebarContentX, sidebarY);
                sidebarY += fonts.smallSize * 1.5;
            });
            sidebarY += fonts.sectionTitleSize;
        }
        drawSkills('Technical Skills', userData.technicalSkills);
        drawSkills('Soft Skills', userData.softSkills);

        // --- Education ---
        if (userData.education && userData.education.length > 0) {
            doc.setFontSize(fonts.bodyBoldSize);
            doc.setTextColor(colors.sidebarHead!);
            doc.text('EDUCATION', sidebarContentX, sidebarY);
            sidebarY += fonts.bodySize * 1.5;
            
            userData.education.forEach(edu => {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(fonts.smallSize);
                doc.setTextColor(colors.sidebarText!);
                doc.text(edu.degree, sidebarContentX, sidebarY);
                sidebarY += fonts.smallSize * 1.2;
                
                doc.setFont('helvetica', 'normal');
                doc.text(edu.institution, sidebarContentX, sidebarY);
                sidebarY += fonts.smallSize * 1.2;
                doc.text(edu.gradDate, sidebarContentX, sidebarY);
                sidebarY += fonts.smallSize * 2;
            });
        }
        
        // --- Signature ---
        if (userData.signature) {
             const sigWidth = 100;
             const sigHeight = (sigWidth / 150) * 40; // Maintain aspect ratio
             const sigY = PAGE_HEIGHT - PAGE_MARGIN - sigHeight - fonts.smallSize - 10;
             if (sidebarY < sigY) {
                doc.addImage(userData.signature, 'PNG', sidebarContentX, sigY, sigWidth, sigHeight);
                doc.setDrawColor(colors.sidebarText!);
                doc.line(sidebarContentX, sigY + sigHeight + 2, sidebarContentX + sigWidth, sigY + sigHeight + 2);
                doc.setFontSize(fonts.smallSize);
                doc.setTextColor(colors.sidebarText!);
                doc.text(userData.name, sidebarContentX, sigY + sigHeight + fonts.smallSize + 4);
             }
        }
    };

    const drawSectionTitle = (title: string) => {
        checkPageBreak(fonts.sectionTitleSize * 2);
        doc.setFont(fonts.family, 'bold');
        doc.setFontSize(fonts.sectionTitleSize);
        doc.setTextColor(colors.mainHead);
        doc.text(title.toUpperCase(), MAIN_CONTENT_X, y);
        y += fonts.sectionTitleSize / 2;
        doc.setDrawColor(colors.accent);
        doc.setLineWidth(styleName === 'Elegant' || styleName === 'Minimalist' ? 0.5 : 1.5);
        doc.line(MAIN_CONTENT_X, y, PAGE_WIDTH - PAGE_MARGIN, y);
        y += fonts.sectionTitleSize * 1.5;
    };
    
    // --- Initial Page Setup ---
    doc.setFillColor(colors.mainBg);
    doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');
    if (layout.isTwoColumn) {
        drawSidebar();
    }
    y = PAGE_MARGIN;

    // --- Main Content ---
    if (!layout.isTwoColumn) {
        // Draw single-column header
        const headerX = fonts.headerAlign === 'center' ? PAGE_WIDTH / 2 : PAGE_MARGIN;
        doc.setFont(fonts.family, 'bold');
        doc.setFontSize(fonts.nameSize);
        doc.setTextColor(colors.mainHead);
        doc.text(userData.name, headerX, y, { align: fonts.headerAlign });
        y += fonts.nameSize;
        
        doc.setFont(fonts.family, 'normal');
        doc.setFontSize(fonts.smallSize);
        doc.setTextColor(colors.mainSubhead);
        const contactInfo = [userData.email, userData.phone, userData.linkedin].join(' | ');
        doc.text(contactInfo, headerX, y, { align: fonts.headerAlign });
        y += fonts.smallSize * 2;
    }
    
    // Summary
    if (sections.summary && sections.summary.length > 0) {
        if(!layout.isTwoColumn) y+= fonts.sectionTitleSize;
        drawSectionTitle('Summary');
        doc.setFont(fonts.family, 'normal');
        doc.setFontSize(fonts.bodySize);
        doc.setTextColor(colors.mainText);
        const summaryText = doc.splitTextToSize(sections.summary.join(' '), MAIN_CONTENT_WIDTH);
        checkPageBreak(summaryText.length * fonts.bodySize * 1.2);
        doc.text(summaryText, MAIN_CONTENT_X, y);
        y += (summaryText.length * fonts.bodySize * 1.2) + fonts.sectionTitleSize;
    }

    const drawEntry = (item: {title: string, company?: string, date?: string, url?: string, description: string[]}) => {
         const spaceNeeded = fonts.bodyBoldSize * 2.5 + (item.description.length * fonts.bodySize * 1.5);
         checkPageBreak(spaceNeeded);
         doc.setFont(fonts.family, 'bold');
         doc.setFontSize(fonts.bodyBoldSize);
         doc.setTextColor(colors.mainHead);
         doc.text(item.title, MAIN_CONTENT_X, y);
         
         doc.setFont(fonts.family, 'normal');
         doc.setTextColor(colors.mainSubhead);
         if(item.date) doc.text(item.date, PAGE_WIDTH - PAGE_MARGIN, y, { align: 'right' });
         if(item.url) doc.textWithLink(item.url, PAGE_WIDTH - PAGE_MARGIN, y, { align: 'right', url: `http://${item.url}`});
         y += fonts.bodyBoldSize * 1.2;

         if (item.company) {
            doc.setFont(fonts.family, 'italic');
            doc.text(item.company, MAIN_CONTENT_X, y);
            y += fonts.bodyBoldSize * 1.5;
         }

         doc.setFont(fonts.family, 'normal');
         doc.setTextColor(colors.mainText);
         item.description.forEach((bullet: string) => {
             const bulletLines = doc.splitTextToSize(bullet, MAIN_CONTENT_WIDTH - 15);
             checkPageBreak(bulletLines.length * fonts.bodySize * 1.2 + 5);
             doc.text('•', MAIN_CONTENT_X + 5, y);
             doc.text(bulletLines, MAIN_CONTENT_X + 15, y);
             y += bulletLines.length * fonts.bodySize * 1.2 + 5;
         });
         y += fonts.bodySize;
    }
    
    // Work Experience
    if (sections['work experience'] && sections['work experience'].length > 0) {
        drawSectionTitle('Work Experience');
        const jobs: any[] = [];
        let currentJob: any = null;
        sections['work experience'].forEach(line => {
             if (line.includes('|')) {
                if (currentJob) jobs.push(currentJob);
                const parts = line.split('|').map(p => p.trim());
                currentJob = { title: parts[0], company: parts[1], date: '', description: [] };
            } else if (currentJob && !line.startsWith('-')) {
                currentJob.date = line;
            } else if (currentJob && line.startsWith('-')) {
                currentJob.description.push(line.substring(1).trim());
            }
        });
        if(currentJob) jobs.push(currentJob);
        jobs.forEach(job => drawEntry(job));
    }
    
    // Personal Projects
    if (sections['personal projects'] && sections['personal projects'].length > 0) {
        drawSectionTitle('Personal Projects');
        const projects: any[] = [];
        let currentProject: any = null;
        sections['personal projects'].forEach(line => {
            if (line.includes('|')) {
                if (currentProject) projects.push(currentProject);
                const parts = line.split('|').map(p => p.trim());
                currentProject = { title: parts[0], url: parts[1], description: [] };
            } else if (currentProject && line.startsWith('-')) {
                currentProject.description.push(line.substring(1).trim());
            }
        });
        if (currentProject) projects.push(currentProject);
        projects.forEach(proj => drawEntry(proj));
    }

    const drawSkillsAndEducationSingleColumn = () => {
        const hasTechSkills = userData.technicalSkills && userData.technicalSkills.length > 0;
        const hasSoftSkills = userData.softSkills && userData.softSkills.length > 0;
        const hasEducation = userData.education && userData.education.length > 0;

        if (hasTechSkills) {
            drawSectionTitle('Technical Skills');
            doc.setFont(styleName === 'Tech' ? 'courier' : fonts.family, 'normal');
            doc.setFontSize(fonts.bodySize);
            doc.setTextColor(colors.mainText);
            const skillsText = doc.splitTextToSize(userData.technicalSkills.join(', '), MAIN_CONTENT_WIDTH);
            doc.text(skillsText, MAIN_CONTENT_X, y);
            y += (skillsText.length * fonts.bodySize * 1.2) + fonts.sectionTitleSize;
        }
        if (hasSoftSkills) {
            drawSectionTitle('Soft Skills');
            doc.setFont(fonts.family, 'normal');
            doc.setFontSize(fonts.bodySize);
            doc.setTextColor(colors.mainText);
            const skillsText = doc.splitTextToSize(userData.softSkills.join(', '), MAIN_CONTENT_WIDTH);
            doc.text(skillsText, MAIN_CONTENT_X, y);
            y += (skillsText.length * fonts.bodySize * 1.2) + fonts.sectionTitleSize;
        }
        if (hasEducation) {
            drawSectionTitle('Education');
            userData.education.forEach(edu => {
                drawEntry({
                    title: edu.degree,
                    company: edu.institution,
                    date: edu.gradDate,
                    description: []
                });
            });
        }
    };
    
    const drawReferences = () => {
        if (userData.references && userData.references.length > 0) {
            drawSectionTitle('References');
            userData.references.forEach(ref => {
                const nameAndTitle = `${ref.name}, ${ref.title} at ${ref.company}`;
                
                let contactInfo = ref.email;
                if (ref.phone) {
                    contactInfo += ` | ${ref.phone}`;
                }

                const spaceNeeded = (fonts.bodyBoldSize * 1.5) + (fonts.bodySize * 1.5); // Two lines
                checkPageBreak(spaceNeeded);
                
                // Line 1: Name, Title at Company
                doc.setFont(fonts.family, 'bold');
                doc.setFontSize(fonts.bodyBoldSize);
                doc.setTextColor(colors.mainHead);
                doc.text(nameAndTitle, MAIN_CONTENT_X, y);
                y += fonts.bodyBoldSize * 1.5;

                // Line 2: Contact Info (underneath)
                doc.setFont(fonts.family, 'normal');
                doc.setFontSize(fonts.bodySize);
                doc.setTextColor(colors.mainSubhead);
                doc.text(contactInfo, MAIN_CONTENT_X, y);
                y += fonts.bodySize * 2; // Add space before the next reference
            });
        }
    };

    if (layout.isTwoColumn) {
        // For two-column layouts, References are in the main column.
        // Skills and Education are in the sidebar.
        drawReferences();
    } else {
        // For single-column layouts, draw Skills and Education first.
        drawSkillsAndEducationSingleColumn();
        // Then, draw References at the very end.
        drawReferences();
        
        // --- Signature for Single Column ---
        if (userData.signature) {
            const sigWidth = 100;
            const sigHeight = (sigWidth / 150) * 40; // Maintain aspect ratio
            const sigX = PAGE_MARGIN;
            const signatureBlockHeight = sigHeight + fonts.smallSize + 10;
            const sigY = PAGE_HEIGHT - PAGE_MARGIN - signatureBlockHeight;

            // If the current content (`y`) would overlap with the signature, add a new page.
            if (y > sigY) {
                addNewPage();
            }

            doc.addImage(userData.signature, 'PNG', sigX, sigY, sigWidth, sigHeight);
            doc.setDrawColor(colors.mainSubhead);
            doc.line(sigX, sigY + sigHeight + 2, sigX + sigWidth, sigY + sigHeight + 2);
            
            doc.setFont(fonts.family, 'normal');
            doc.setFontSize(fonts.smallSize);
            doc.setTextColor(colors.mainText);
            doc.text(userData.name, sigX, sigY + sigHeight + fonts.smallSize + 4);
        }
    }

    doc.save(`${userData.name.replace(' ', '_')}_${styleName}_Resume.pdf`);
};