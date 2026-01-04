import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context';
import { askMazoraAssistant } from '../services/geminiService';

const HelpdeskPremiumIcon = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Main Chat/Help Circle */}
        <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 13.4876 3.36093 14.891 4 16.1272L3 21L7.87279 20C9.10896 20.6391 10.5124 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Support Question Mark with a Dot */}
        <path d="M10 9C10 7.89543 10.8954 7 12 7C13.1046 7 14 7.89543 14 9C14 10.3333 12 11 12 11V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="16" r="1" fill="currentColor"/>
        {/* Premium Sparkles */}
        <path d="M18.5 4.5L19 6L20.5 6.5L19 7L18.5 8.5L18 7L16.5 6.5L18 6L18.5 4.5Z" fill="currentColor" />
        <path d="M5.5 4.5L6 6L7.5 6.5L6 7L5.5 8.5L5 7L3.5 6.5L5 6L5.5 4.5Z" fill="currentColor" fillOpacity="0.6" />
    </svg>
);

export const AIChatBot = () => {
    const { language, t } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
        { role: 'model', text: language === 'tr' ? 'Merhaba! Mazora VIP Asistanınız hizmetinizde. Ücretler ve kurallar hakkında size nasıl yardımcı olabilirim?' : 'Hello! Your Mazora VIP Assistant is here. How can I assist you with fees and rules?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-ai-chat', handleOpen);
        return () => window.removeEventListener('open-ai-chat', handleOpen);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async (e?: React.FormEvent, textOverride?: string) => {
        if (e) e.preventDefault();
        const text = textOverride || input;
        if (!text.trim() || isLoading) return;

        const newMessages = [...messages, { role: 'user' as const, text }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await askMazoraAssistant(text, messages.slice(1));
            setMessages([...newMessages, { role: 'model', text: response }]);
        } catch (error) {
            setMessages([...newMessages, { role: 'model', text: language === 'tr' ? "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin." : "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const suggestions = language === 'tr' 
        ? ["500 TL Ücret Nedir?", "İade Şartları", "Kargo Kuralları", "Escrow Güvencesi"]
        : ["What is the 500 TL Fee?", "Refund Terms", "Shipping Rules", "Escrow Protection"];

    return (
        <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-[100] flex flex-col items-end">
            {isOpen && (
                <div className="w-[320px] md:w-[380px] h-[520px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden flex flex-col mb-4 animate-slide-up ring-1 ring-black/5">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-primary-900 to-indigo-950 p-4 text-white flex justify-between items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#cca458] to-[#9a7d3a] rounded-full flex items-center justify-center text-white shadow-inner">
                                <HelpdeskPremiumIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-display font-black text-xs md:text-sm tracking-widest uppercase">Mazora Assistant</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></span>
                                    <span className="text-[9px] text-[#cca458] uppercase font-black tracking-tighter">Premium Support</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)} 
                            className="hover:bg-white/10 p-2 rounded-xl transition-colors relative z-10"
                        >
                            <svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar bg-gray-50/50">
                        {messages.map((m, idx) => (
                            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs font-bold leading-relaxed shadow-sm transition-all ${
                                    m.role === 'user' 
                                        ? 'bg-primary text-white rounded-br-none' 
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-4 rounded-2xl border border-gray-100 rounded-bl-none shadow-sm flex gap-1.5 items-center">
                                    <div className="w-1.5 h-1.5 bg-[#cca458] rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-[#cca458] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-1.5 h-1.5 bg-[#cca458] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Suggestions Area */}
                    {!isLoading && messages.length < 8 && (
                        <div className="px-4 pb-2 flex flex-wrap gap-2 bg-gray-50/50">
                            {suggestions.map((s, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={() => handleSend(undefined, s)}
                                    className="text-[9px] font-black bg-white border border-gray-200 text-gray-500 px-3 py-2 rounded-lg hover:border-[#cca458] hover:text-[#9a7d3a] transition-all shadow-sm uppercase tracking-tighter"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={language === 'tr' ? 'Size nasıl yardımcı olabilirim?' : 'How can I assist you?'}
                            className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-[#cca458]/30 focus:bg-white transition-all outline-none text-gray-700"
                        />
                        <button 
                            type="submit" 
                            disabled={isLoading || !input.trim()}
                            className="bg-gradient-to-br from-[#cca458] to-[#9a7d3a] text-white p-3 rounded-xl hover:shadow-lg disabled:opacity-50 transition-all active:scale-95 shadow-md flex items-center justify-center"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <div className="relative group">
                {/* Visual Label to indicate "Click here" */}
                {!isOpen && (
                    <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 hidden md:block whitespace-nowrap">
                        <div className="bg-primary-900/90 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[#cca458]">Premium</span> Helpdesk
                        </div>
                    </div>
                )}
                
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center transition-all transform hover:scale-110 active:scale-90 relative overflow-hidden group ${
                        isOpen ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-primary to-primary-900 text-[#cca458]'
                    }`}
                >
                    {/* Glow Effect */}
                    <div className={`absolute inset-0 bg-[#cca458] opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                    
                    {isOpen ? (
                        <svg className="w-6 h-6 md:w-8 md:h-8 transition-transform duration-300 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <div className="relative">
                            <HelpdeskPremiumIcon className="w-7 h-7 md:w-9 md:h-9 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
                            <span className="absolute -top-2 -right-2 bg-[#cca458] text-primary text-[8px] font-black px-1 py-0.5 rounded border-2 border-primary shadow-sm animate-bounce">
                                VIP
                            </span>
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
};