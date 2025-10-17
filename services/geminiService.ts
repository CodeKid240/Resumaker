import { GoogleGenAI, Type, Modality, LiveServerMessage } from "@google/genai";
// FIX: Use `import type` for type-only imports, which now correctly resolve from the fixed `types.ts`.
import type { UserData, AiSuggestion, ConversationTurn, InterviewFeedback, CareerStep, Company } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        score: {
            type: Type.INTEGER,
            description: "A score from 0-100 evaluating the resume's strength for the target role. Scores should be scaled encouragingly: <50 for major gaps, 50-75 for a good start, and 75+ for a strong profile."
        },
        summary: {
            type: Type.STRING,
            description: "A professional 2-3 sentence summary for the resume."
        },
        suggestions: {
            type: Type.OBJECT,
            properties: {
                skills: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3-5 specific skills (technical or soft) missing but crucial for the target role."
                },
                experience: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Suggestions to rephrase experience with action verbs and quantify achievements."
                },
                certifications: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "1-2 relevant courses or certifications to boost the profile."
                },
                projects: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Suggestions to improve project descriptions or new project ideas relevant to the role."
                }
            },
            required: ["skills", "experience", "certifications", "projects"]
        },
        careerRoadmap: {
            type: Type.ARRAY,
            description: "A 3-5 step career progression roadmap starting from the user's target role.",
            items: {
                type: Type.OBJECT,
                properties: {
                    role: { type: Type.STRING, description: "The job title for this career step (e.g., 'Senior Software Engineer')." },
                    description: { type: Type.STRING, description: "A brief description of the key responsibilities and expectations at this stage." },
                    skillsToDevelop: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "A list of 3-4 key skills (technical or soft) to acquire to reach this career step."
                    },
                    companies: {
                        type: Type.ARRAY,
                        description: "A list of 2-3 example companies for this role.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING, description: "The name of the company (e.g., 'Google')." },
                                domain: { type: Type.STRING, description: "The company's website domain (e.g., 'google.com')." }
                            },
                            required: ["name", "domain"]
                        }
                    }
                },
                required: ["role", "description", "skillsToDevelop", "companies"]
            }
        }
    },
    required: ["score", "summary", "suggestions", "careerRoadmap"]
};

export const analyzeResume = async (userData: UserData): Promise<{ score: number; summary: string; suggestions: AiSuggestion; careerRoadmap: CareerStep[] } | null> => {
    const prompt = `
        You are an expert career coach and professional resume writer.
        Analyze the following user data for a resume targeting the "${userData.targetRole}" role.
        Provide a resume strength score, a professional summary, concrete suggestions, and a detailed career progression roadmap.

        User Data:
        ${JSON.stringify({ ...userData, customTargetRole: undefined }, null, 2)}

        Instructions:
        1.  Analyze the provided resume details for the role of "${userData.targetRole}". Note the distinction between technical and soft skills.
        2.  Provide a resume strength score from 0 to 100. Be encouraging but realistic. A score below 50 should indicate significant gaps, 50-75 means a solid foundation but needs improvement, and 75+ is a strong resume for the target role. Avoid extremely low scores unless the resume is completely empty or irrelevant.
        3.  Generate a professional, concise resume summary (2-3 sentences).
        4.  Provide a list of concrete, actionable suggestions for improvement for skills, experience, certifications, and projects.
        5.  Based on the user's qualifications and target role, generate a realistic 3-5 step career progression roadmap.
        6.  For each step in the roadmap, provide the future job title, a brief description of responsibilities, a list of key skills to develop, and a list of 2-3 example companies with their name and website domain (e.g., 'google.com').
        7.  Return the entire response in the specified JSON format.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error analyzing resume:", error);
        return null;
    }
};

export const generateFullResume = async (userData: UserData, summary: string): Promise<string | null> => {
    const prompt = `
        You are a professional resume writer.
        Generate a complete, well-formatted, ATS-friendly resume in plain text based on the user's details.

        User Data:
        ${JSON.stringify({ ...userData, summary, customTargetRole: undefined }, null, 2)}

        Instructions:
        - Generate a professional resume using the provided data. The target role is "${userData.targetRole}".
        - Follow this structure:
            1. Full Name
            2. Contact Info (Email | Phone | LinkedIn URL)
            3. Summary
            4. Technical Skills
            5. Soft Skills
            6. Work Experience (most recent first)
            7. Personal Projects
            8. Education
        - For Work Experience, use the format:
            Job Title | Company
            Start Date - End Date
            - Bullet point 1
            - Bullet point 2
        - For Personal Projects, use the format:
            Project Name | Project URL (if provided)
            - Bullet point description
        - For Education, use the format:
            Institution Name | Degree / Field of Study | Graduation Date
        - For Technical Skills, list them as a comma-separated string under the heading "Technical Skills".
        - For Soft Skills, list them as a comma-separated string under the heading "Soft Skills".
        - If either skills category is empty, omit that section entirely.
        - Ensure the formatting is clean, professional, and easy to read.
        - Do not include any introductory text like "Here is the resume:". Just output the resume text directly.
        - The name should be on the first line. Contact info on the second. Summary section starts with "Summary". The sections for skills, experience, projects, and education should start with their respective titles.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating full resume:", error);
        return null;
    }
};

// --- Interview Feature Functions ---

// Helper functions for audio decoding
function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

let currentInputTranscription = '';
let currentOutputTranscription = '';

export const startInterviewSession = (
    userData: UserData,
    addTurn: (turn: ConversationTurn) => void
) => {
    const role = userData.targetRole === 'Other' ? userData.customTargetRole : userData.targetRole;
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    let nextStartTime = 0;

    const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: () => {
                console.log('Interview session opened.');
            },
            onmessage: async (message: LiveServerMessage) => {
                if (message.serverContent?.inputTranscription) {
                    currentInputTranscription += message.serverContent.inputTranscription.text;
                }
                if (message.serverContent?.outputTranscription) {
                    currentOutputTranscription += message.serverContent.outputTranscription.text;
                }
                if (message.serverContent?.turnComplete) {
                    if (currentInputTranscription.trim()) {
                        addTurn({ speaker: 'user', text: currentInputTranscription.trim() });
                    }
                    if (currentOutputTranscription.trim()) {
                        addTurn({ speaker: 'ai', text: currentOutputTranscription.trim() });
                    }
                    currentInputTranscription = '';
                    currentOutputTranscription = '';
                }

                const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (base64Audio) {
                    nextStartTime = Math.max(
                        nextStartTime,
                        outputAudioContext.currentTime,
                    );

                    const decodedAudio = decode(base64Audio);
                    const audioBuffer = await decodeAudioData(
                        decodedAudio,
                        outputAudioContext,
                        24000,
                        1,
                    );
                    
                    const source = outputAudioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(outputAudioContext.destination);
                    source.start(nextStartTime);
                    nextStartTime += audioBuffer.duration;
                }
            },
            onerror: (e: ErrorEvent) => {
                console.error('Interview session error:', e);
            },
            onclose: () => {
                console.log('Interview session closed.');
            },
        },
        config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            systemInstruction: `You are a friendly but professional hiring manager conducting an interview for a "${role}" position. Start with a brief greeting, then ask the first technical or behavioral question. Keep your questions and responses concise. Wait for the user to respond before asking the next question.`,
        },
    });
    return sessionPromise;
};

const feedbackSchema = {
    type: Type.OBJECT,
    properties: {
        overallScore: {
            type: Type.INTEGER,
            description: "An overall score for the interview from 0 to 100."
        },
        overallSummary: {
            type: Type.STRING,
            description: "A 2-3 sentence summary of the candidate's performance, highlighting strengths and key areas for improvement."
        },
        answerAnalysis: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "The question that was asked." },
                    answer: { type: Type.STRING, description: "The candidate's answer." },
                    feedback: { type: Type.STRING, description: "Specific, constructive feedback on the answer." }
                },
                required: ["question", "answer", "feedback"]
            },
        }
    },
    required: ["overallScore", "overallSummary", "answerAnalysis"]
};

export const getInterviewFeedback = async (conversation: ConversationTurn[]): Promise<InterviewFeedback | null> => {
    if (conversation.length === 0) {
        return {
            overallScore: 0,
            overallSummary: "No conversation was recorded, so no feedback can be provided.",
            answerAnalysis: []
        };
    }

    const formattedConversation = conversation.map(turn => `${turn.speaker === 'ai' ? 'Interviewer' : 'Candidate'}: ${turn.text}`).join('\n');
    
    const prompt = `
        You are an expert career coach providing feedback on a job interview.
        Analyze the following interview transcript and provide a detailed performance review.

        Interview Transcript:
        ${formattedConversation}

        Instructions:
        1.  Provide an overall score from 0-100.
        2.  Write a concise overall summary of the candidate's performance.
        3.  For each question and answer pair, provide specific, constructive feedback. Identify what was good and what could be improved.
        4.  The candidate's turns are marked 'Candidate', and the interviewer's are marked 'Interviewer'. The interviewer's text provides the questions.
        5.  Return the response in the specified JSON format.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: feedbackSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error getting interview feedback:", error);
        return null;
    }
};