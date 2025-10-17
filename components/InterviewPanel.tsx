import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import type { UserData, ConversationTurn, InterviewFeedback } from '../types';
import { startInterviewSession, getInterviewFeedback } from '../services/geminiService';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { StopCircleIcon } from './icons/StopCircleIcon';
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';
import { SendIcon } from './icons/SendIcon';

interface InterviewPanelProps {
    userData: UserData;
    onEndInterview: () => void;
}

type InterviewStatus = 'idle' | 'connecting' | 'in_progress' | 'processing' | 'finished';
type InterviewMode = 'voice' | 'text';

const encode = (bytes: Uint8Array): string => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

export const InterviewPanel: React.FC<InterviewPanelProps> = ({ userData, onEndInterview }) => {
    const [status, setStatus] = useState<InterviewStatus>('idle');
    const [mode, setMode] = useState<InterviewMode | null>(null);
    const [conversation, setConversation] = useState<ConversationTurn[]>([]);
    const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const chatRef = useRef<Chat | null>(null);
    const sessionRef = useRef<any>(null);
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const conversationEndRef = useRef<HTMLDivElement>(null);
    const isStoppingRef = useRef(false);
    
    // Use a ref to hold the latest conversation state to avoid stale closures in callbacks
    const conversationRef = useRef(conversation);
    useEffect(() => {
        conversationRef.current = conversation;
    }, [conversation]);


    const addTurn = (turn: ConversationTurn) => {
        setConversation(prev => [...prev, turn]);
    };

    useEffect(() => {
        conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation]);

    const handleStartVoice = () => {
        setMode('voice');
        startVoiceSession();
    };
    
    const handleStartText = () => {
        setMode('text');
        startTextSession();
    };

    const startVoiceSession = async () => {
        isStoppingRef.current = false;
        setStatus('connecting');
        setError(null);
        setConversation([]);
        setFeedback(null);
        try {
            const sessionPromise = startInterviewSession(userData, addTurn);
            sessionPromiseRef.current = sessionPromise;

            sessionPromise.then(session => {
                sessionRef.current = session;
                setStatus('in_progress');
            }).catch(err => {
                console.error("Failed to start interview session:", err);
                setError("Could not connect to the interview service. Please check your API key and try again.");
                setStatus('idle');
            });
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            audioContextRef.current = audioContext;
            const source = audioContext.createMediaStreamSource(stream);
            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const l = inputData.length;
                const int16 = new Int16Array(l);
                for (let i = 0; i < l; i++) {
                    int16[i] = inputData[i] * 32768;
                }
                const base64Data = encode(new Uint8Array(int16.buffer));

                if (sessionPromiseRef.current) {
                    sessionPromiseRef.current.then(session => {
                        session.sendRealtimeInput({ media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' } });
                    });
                }
            };
            
            source.connect(processor);
            processor.connect(audioContext.destination);
            audioProcessorRef.current = processor;
            
        } catch (err) {
            console.error("Failed to get microphone:", err);
            setError("Could not access microphone. Please check your browser permissions and try again.");
            setStatus('idle');
        }
    };

    const startTextSession = async () => {
        isStoppingRef.current = false;
        setStatus('connecting');
        setError(null);
        setConversation([]);
        setFeedback(null);
        try {
            const role = userData.targetRole === 'Other' ? userData.customTargetRole : userData.targetRole;
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const chat = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: `You are a friendly but professional hiring manager conducting an interview for a "${role}" position. Start with a brief greeting, then ask the first technical or behavioral question. Keep your questions and responses concise. Wait for the user to respond before asking the next question.`,
                },
            });
            chatRef.current = chat;
            setStatus('in_progress');

            // Get the first message from the AI
            const response = await chat.sendMessage({ message: "Hello, I'm ready to begin." });
            addTurn({ speaker: 'ai', text: response.text });
        } catch (err) {
            console.error("Failed to start text interview:", err);
            setError("Could not connect to the interview service. Please check your API key and try again.");
            setStatus('idle');
        }
    };

    const handleSendTextMessage = async () => {
        if (!currentMessage.trim() || !chatRef.current || isSending) return;

        const userMessage = currentMessage.trim();
        addTurn({ speaker: 'user', text: userMessage });
        setCurrentMessage('');
        setIsSending(true);

        try {
            const response = await chatRef.current.sendMessage({ message: userMessage });
            addTurn({ speaker: 'ai', text: response.text });
        } catch (err) {
            console.error("Error sending message:", err);
            addTurn({ speaker: 'ai', text: "I'm sorry, I encountered an error. Could you please repeat that?" });
        } finally {
            setIsSending(false);
        }
    };

    const stopSession = useCallback(async () => {
        if (isStoppingRef.current) return;
        isStoppingRef.current = true;

        setStatus('processing');

        if (mode === 'voice') {
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (audioProcessorRef.current) {
                audioProcessorRef.current.disconnect();
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
            if (sessionRef.current) {
                sessionRef.current.close();
            }
            sessionRef.current = null;
            sessionPromiseRef.current = null;
        }
        
        chatRef.current = null;

        try {
            const finalFeedback = await getInterviewFeedback(conversationRef.current);
            setFeedback(finalFeedback);
        } catch(err) {
            console.error("Failed to get feedback:", err);
            setError("Could not generate feedback for the interview.");
        } finally {
            setStatus('finished');
        }
    }, [mode]);
    
    useEffect(() => {
        // This effect now correctly handles cleanup ONLY on component unmount.
        // The `stopSession` function is stable because it no longer depends on `conversation` state.
        return () => {
            if (status === 'in_progress' || status === 'connecting') {
                stopSession();
            }
        };
    }, [status, stopSession]);

    const renderContent = () => {
        switch (status) {
            case 'idle':
                return (
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-4 text-slate-100">Mock Interview Practice</h2>
                        <p className="mb-6 text-slate-400">Practice for your <span className="font-bold text-blue-400">{userData.targetRole === 'Other' ? userData.customTargetRole : userData.targetRole}</span> interview. Choose your preferred method below.</p>
                        {error && <p className="text-red-400 mb-4">{error}</p>}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button onClick={handleStartVoice} className="w-full sm:w-auto bg-blue-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                                <MicrophoneIcon className="w-6 h-6" /> Start Voice Interview
                            </button>
                            <button onClick={handleStartText} className="w-full sm:w-auto bg-slate-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-600 transition-colors">
                                <ChatBubbleLeftRightIcon className="w-6 h-6" /> Use Text Instead
                            </button>
                        </div>
                    </div>
                );
            case 'connecting':
                return <p className="text-center text-slate-400">Connecting and setting up session...</p>;
            case 'in_progress':
                return (
                     <div>
                        <div className="h-96 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg p-4 mb-4 space-y-4">
                            {conversation.map((turn, index) => (
                                <div key={index} className={`flex ${turn.speaker === 'ai' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-md p-3 rounded-lg ${turn.speaker === 'ai' ? 'bg-slate-700 text-slate-200' : 'bg-blue-600 text-white'}`}>
                                        <p className="font-bold capitalize">{turn.speaker === 'ai' ? 'Interviewer' : 'You'}</p>
                                        <p>{turn.text}</p>
                                    </div>
                                </div>
                            ))}
                            {conversation.length === 0 && <p className="text-center text-slate-500">The interviewer is ready. Start speaking or type your answer.</p>}
                             <div ref={conversationEndRef} />
                        </div>
                        {mode === 'text' && (
                             <form onSubmit={(e) => { e.preventDefault(); handleSendTextMessage(); }} className="flex items-center gap-2 mb-4">
                                <input
                                    type="text"
                                    value={currentMessage}
                                    onChange={(e) => setCurrentMessage(e.target.value)}
                                    placeholder="Type your answer..."
                                    disabled={isSending}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-slate-100 rounded-md focus:ring-blue-500 focus:border-blue-500 placeholder-slate-500"
                                />
                                <button type="submit" disabled={isSending || !currentMessage.trim()} className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-slate-600">
                                    {isSending ? (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <SendIcon className="w-5 h-5" />
                                    )}
                                </button>
                            </form>
                        )}
                        <button onClick={stopSession} className="bg-red-600 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 mx-auto hover:bg-red-700 transition-colors">
                           <StopCircleIcon className="w-6 h-6" /> End Interview & Get Feedback
                        </button>
                    </div>
                );
            case 'processing':
                return <p className="text-center text-slate-400">Interview ended. Analyzing your performance and generating feedback...</p>;
            case 'finished':
                return (
                    <div>
                        <h2 className="text-3xl font-bold mb-4 text-slate-100">Interview Feedback Report</h2>
                        {feedback ? (
                            <div className="space-y-6">
                                <div className="p-4 bg-blue-900/50 border border-blue-800 rounded-lg">
                                    <h3 className="font-bold text-lg text-slate-200">Overall Score: <span className="text-blue-400">{feedback.overallScore}/100</span></h3>
                                    <p className="mt-1 text-slate-300">{feedback.overallSummary}</p>
                                </div>
                                {feedback.answerAnalysis.length > 0 ? (
                                    feedback.answerAnalysis.map((item, index) => (
                                    <div key={index} className="p-4 border border-slate-700 rounded-lg">
                                        <p className="font-semibold text-slate-200">Q: {item.question}</p>
                                        <p className="italic text-slate-400 my-2">Your Answer: "{item.answer}"</p>
                                        <p className="text-sm text-slate-300"><span className="font-semibold text-slate-200">Feedback:</span> {item.feedback}</p>
                                    </div>
                                    ))
                                ) : (
                                    <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
                                         <p className="text-slate-400">No questions were answered, so no specific feedback can be provided.</p>
                                    </div>
                                )}
                            </div>
                        ) : <p className="text-center text-red-400">{error || "Could not load feedback."}</p>}
                    </div>
                );
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-700 p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
           {renderContent()}
        </div>
    );
};