import type { UserData } from '../types';

// These libraries are loaded from CDN in index.html.
// We access them via the `window` object to avoid ReferenceErrors in a module context.

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
        education: []
    };
    let currentSection: keyof typeof sections | null = null;

    const sectionKeywords = [
        'summary', 
        'technical skills', 
        'soft skills', 
        'work experience', 
        'personal projects', 
        'education'
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


export const generatePdf = (resumeText: string, userData: UserData) => {
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF('p', 'pt', 'letter');
    const sections = parseResumeText(resumeText);
    
    // --- Style & Layout Constants ---
    const PAGE_MARGIN = 40;
    const PAGE_WIDTH = doc.internal.pageSize.getWidth();
    const PAGE_HEIGHT = doc.internal.pageSize.getHeight();

    // Layout
    const SIDEBAR_WIDTH = 180;
    const GUTTER = 20;
    const MAIN_CONTENT_X = PAGE_MARGIN + SIDEBAR_WIDTH + GUTTER;
    const MAIN_CONTENT_WIDTH = PAGE_WIDTH - MAIN_CONTENT_X - PAGE_MARGIN;

    // Colors
    const SIDEBAR_BG_COLOR = '#0f172a'; // slate-900
    const SIDEBAR_TEXT_COLOR = '#cbd5e1'; // slate-300
    const SIDEBAR_HEAD_COLOR = '#ffffff'; // white
    const MAIN_HEAD_COLOR = '#1e293b'; // slate-800
    const MAIN_SUBHEAD_COLOR = '#475569'; // slate-600
    const MAIN_TEXT_COLOR = '#334155'; // slate-700
    const ACCENT_COLOR = '#2563eb'; // blue-600

    // Font Sizes
    const NAME_SIZE = 27;
    const SECTION_TITLE_SIZE = 17;
    const BODY_BOLD_SIZE = 12;
    const BODY_SIZE = 12;
    const SMALL_SIZE = 11;

    let y = 0; // Global Y position tracker for the main column

    // --- Helper Functions ---
    const drawSidebar = () => {
        // Draw sidebar background
        doc.setFillColor(SIDEBAR_BG_COLOR);
        doc.rect(0, 0, SIDEBAR_WIDTH + PAGE_MARGIN, PAGE_HEIGHT, 'F');
        
        let sidebarY = PAGE_MARGIN;
        const sidebarContentX = PAGE_MARGIN;
        const sidebarContentWidth = SIDEBAR_WIDTH;

        // --- Name ---
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(NAME_SIZE);
        doc.setTextColor(SIDEBAR_HEAD_COLOR);
        const nameLines = doc.splitTextToSize(userData.name, sidebarContentWidth);
        doc.text(nameLines, sidebarContentX, sidebarY);
        sidebarY += (nameLines.length * NAME_SIZE * 0.8) + 10;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(BODY_BOLD_SIZE);
        doc.setTextColor(ACCENT_COLOR);
        const roleText = userData.targetRole === 'Other' ? userData.customTargetRole : userData.targetRole;
        doc.text(roleText, sidebarContentX, sidebarY);
        sidebarY += SECTION_TITLE_SIZE * 2;
        
        // --- Contact ---
        doc.setFontSize(BODY_BOLD_SIZE);
        doc.setTextColor(SIDEBAR_HEAD_COLOR);
        doc.text('CONTACT', sidebarContentX, sidebarY);
        sidebarY += BODY_SIZE * 1.5;

        doc.setFontSize(SMALL_SIZE);
        doc.setTextColor(SIDEBAR_TEXT_COLOR);
        const contactInfo = [userData.email, userData.phone, userData.linkedin];
        contactInfo.forEach(info => {
             const infoLines = doc.splitTextToSize(info, sidebarContentWidth);
             doc.text(infoLines, sidebarContentX, sidebarY);
             sidebarY += (infoLines.length * SMALL_SIZE * 1.2) + 5;
        });
        sidebarY += SECTION_TITLE_SIZE;

        // --- Skills ---
        const drawSkills = (title: string, skills: string[]) => {
            if (!skills || skills.length === 0) return;
            doc.setFontSize(BODY_BOLD_SIZE);
            doc.setTextColor(SIDEBAR_HEAD_COLOR);
            doc.text(title.toUpperCase(), sidebarContentX, sidebarY);
            sidebarY += BODY_SIZE * 1.5;

            doc.setFontSize(SMALL_SIZE);
            doc.setTextColor(SIDEBAR_TEXT_COLOR);
            skills.forEach(skill => {
                doc.text(`• ${skill}`, sidebarContentX, sidebarY);
                sidebarY += SMALL_SIZE * 1.5;
            });
            sidebarY += SECTION_TITLE_SIZE;
        }
        drawSkills('Technical Skills', userData.technicalSkills);
        drawSkills('Soft Skills', userData.softSkills);

        // --- Education ---
        if (sections.education && sections.education.length > 0) {
            doc.setFontSize(BODY_BOLD_SIZE);
            doc.setTextColor(SIDEBAR_HEAD_COLOR);
            doc.text('EDUCATION', sidebarContentX, sidebarY);
            sidebarY += BODY_SIZE * 1.5;
            
            sections.education.forEach(edu => {
                const parts = edu.split('|').map(p => p.trim());
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(SMALL_SIZE);
                doc.setTextColor(SIDEBAR_TEXT_COLOR);
                doc.text(parts[1] || '', sidebarContentX, sidebarY); // Degree
                sidebarY += SMALL_SIZE * 1.2;
                
                doc.setFont('helvetica', 'normal');
                doc.text(parts[0] || '', sidebarContentX, sidebarY); // Institution
                sidebarY += SMALL_SIZE * 1.2;
                doc.text(parts[2] || '', sidebarContentX, sidebarY); // Date
                sidebarY += SMALL_SIZE * 2;
            });
        }
        
        // --- Signature ---
        if (userData.signature) {
             const sigWidth = 100;
             const sigHeight = (sigWidth / 150) * 40; // Maintain aspect ratio
             const sigY = PAGE_HEIGHT - PAGE_MARGIN - sigHeight - SMALL_SIZE - 10;
             if (sidebarY < sigY) {
                doc.addImage(userData.signature, 'PNG', sidebarContentX, sigY, sigWidth, sigHeight);
                doc.setDrawColor(SIDEBAR_TEXT_COLOR);
                doc.line(sidebarContentX, sigY + sigHeight + 2, sidebarContentX + sigWidth, sigY + sigHeight + 2);
                doc.setFontSize(SMALL_SIZE);
                doc.setTextColor(SIDEBAR_TEXT_COLOR);
                doc.text(userData.name, sidebarContentX, sigY + sigHeight + SMALL_SIZE + 4);
             }
        }
    };

    const addNewPage = () => {
        doc.addPage();
        drawSidebar();
        y = PAGE_MARGIN;
    };

    const checkPageBreak = (spaceNeeded: number) => {
        if (y + spaceNeeded > PAGE_HEIGHT - PAGE_MARGIN) {
            addNewPage();
        }
    };
    
    const drawSectionTitle = (title: string) => {
        checkPageBreak(SECTION_TITLE_SIZE * 2);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(SECTION_TITLE_SIZE);
        doc.setTextColor(MAIN_HEAD_COLOR);
        doc.text(title.toUpperCase(), MAIN_CONTENT_X, y);
        y += SECTION_TITLE_SIZE / 2;
        doc.setDrawColor(ACCENT_COLOR);
        doc.setLineWidth(1.5);
        doc.line(MAIN_CONTENT_X, y, PAGE_WIDTH - PAGE_MARGIN, y);
        y += SECTION_TITLE_SIZE * 1.5;
    };

    // --- Initial Page Setup ---
    drawSidebar();
    y = PAGE_MARGIN;

    // --- Main Content ---
    
    // Summary
    if (sections.summary && sections.summary.length > 0) {
        doc.setFont('helvetica', 'normal');
        drawSectionTitle('Summary');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(BODY_SIZE);
        doc.setTextColor(MAIN_TEXT_COLOR);
        const summaryText = doc.splitTextToSize(sections.summary.join(' '), MAIN_CONTENT_WIDTH);
        checkPageBreak(summaryText.length * BODY_SIZE * 1.2);
        doc.text(summaryText, MAIN_CONTENT_X, y);
        y += (summaryText.length * BODY_SIZE * 1.2) + SECTION_TITLE_SIZE;
    }

    // Work Experience
    if (sections['work experience'] && sections['work experience'].length > 0) {
        doc.setFont('helvetica', 'normal');
        drawSectionTitle('Work Experience');
        doc.setFont('helvetica', 'normal');
        const jobs = [];
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

        jobs.forEach(job => {
            checkPageBreak(BODY_BOLD_SIZE * 2.5 + (job.description.length * BODY_SIZE * 1.5));
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(BODY_BOLD_SIZE);
            doc.setTextColor(MAIN_HEAD_COLOR);
            doc.text(job.title, MAIN_CONTENT_X, y);
            
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(MAIN_SUBHEAD_COLOR);
            doc.text(job.date, PAGE_WIDTH - PAGE_MARGIN, y, { align: 'right' });
            y += BODY_BOLD_SIZE * 1.2;

            doc.setFont('helvetica', 'italic');
            doc.text(job.company, MAIN_CONTENT_X, y);
            y += BODY_BOLD_SIZE * 1.5;
            
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(MAIN_TEXT_COLOR);
            job.description.forEach((bullet: string) => {
                const bulletLines = doc.splitTextToSize(bullet, MAIN_CONTENT_WIDTH - 15);
                checkPageBreak(bulletLines.length * BODY_SIZE * 1.2 + 5);
                doc.text('•', MAIN_CONTENT_X + 5, y);
                doc.text(bulletLines, MAIN_CONTENT_X + 15, y);
                y += bulletLines.length * BODY_SIZE * 1.2 + 5;
            });
            y += BODY_SIZE;
        });
    }

    // Personal Projects
    if (sections['personal projects'] && sections['personal projects'].length > 0) {
        drawSectionTitle('Personal Projects');
        const projects = [];
        let currentProject: any = null;
        sections['personal projects'].forEach(line => {
            if (line.includes('|')) {
                if (currentProject) projects.push(currentProject);
                const parts = line.split('|').map(p => p.trim());
                currentProject = { name: parts[0], url: parts[1], description: [] };
            } else if (currentProject && line.startsWith('-')) {
                currentProject.description.push(line.substring(1).trim());
            }
        });
        if (currentProject) projects.push(currentProject);

        projects.forEach(proj => {
            checkPageBreak(BODY_BOLD_SIZE * 2.5 + (proj.description.length * BODY_SIZE * 1.5));
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(BODY_BOLD_SIZE);
            doc.setTextColor(MAIN_HEAD_COLOR);
            doc.text(proj.name, MAIN_CONTENT_X, y);

            if (proj.url) {
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(ACCENT_COLOR);
                doc.textWithLink(proj.url, PAGE_WIDTH - PAGE_MARGIN, y, { align: 'right', url: `http://${proj.url}` });
            }
            y += BODY_BOLD_SIZE * 1.5;

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(MAIN_TEXT_COLOR);
            proj.description.forEach((bullet: string) => {
                const bulletLines = doc.splitTextToSize(bullet, MAIN_CONTENT_WIDTH - 15);
                checkPageBreak(bulletLines.length * BODY_SIZE * 1.2 + 5);
                doc.text('•', MAIN_CONTENT_X + 5, y);
                doc.text(bulletLines, MAIN_CONTENT_X + 15, y);
                y += bulletLines.length * BODY_SIZE * 1.2 + 5;
            });
            y += BODY_SIZE;
        });
    }


    doc.save(`${userData.name.replace(' ', '_')}_Resume.pdf`);
};
