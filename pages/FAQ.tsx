
import React, { useState, useEffect } from 'react';
import { useApp } from '../context';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleGenAI, Type } from "@google/genai";

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

interface FAQItem {
    question: string;
    answer: string;
}

export const FAQ = () => {
    const { language, t } = useApp();
    const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [openIdx, setOpenIdx] = useState<number | null>(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFAQ = async () => {
            if (!process.env.API_KEY) {
                setLoading(false);
                setError(true);
                return;
            }

            setLoading(true);
            setError(false);

            try {
                const ai = getAIClient();
                const langName = language === 'tr' ? 'Turkish' : language === 'fr' ? 'French' : 'English';
                
                const prompt = `Act as a customer support manager for Mazora Auctions. 
                Generate a list of 10 comprehensive frequently asked questions and professional answers in ${langName}.
                
                The FAQ should naturally cover essential topics for an auction marketplace:
                - The bidding process and how to participate.
                - Payment security and collection methods.
                - Seller verification standards.
                - Rules regarding bid extensions and closing times.
                - Buyer and seller commissions.
                - Delivery logistics and shipping responsibilities.
                
                FORMAT: JSON ONLY: {"faqs": [{"question": "...", "answer": "..."}]}.`;

                const response = await ai.models.generateContent({
                    model: "gemini-3-flash-preview", 
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                faqs: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            question: { type: Type.STRING },
                                            answer: { type: Type.STRING }
                                        },
                                        required: ["question", "answer"]
                                    }
                                }
                            },
                            required: ["faqs"]
                        }
                    }
                });

                if (response.text) {
                    const data = JSON.parse(response.text);
                    setFaqItems(data.faqs || []);
                }
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchFAQ();
    }, [language]);

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in min-h-[70vh] text-left">
            <div className="w-full flex justify-start mb-8">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest hover:underline">
                    ← {t('common.back')}
                </button>
            </div>

            <h1 className="text-3xl md:text-5xl font-display font-black text-gray-900 mb-4 uppercase tracking-tighter text-center italic">
                {t('legal.faqTitle') || 'FAQ'}
            </h1>
            <p className="text-center text-gray-500 font-bold uppercase text-[10px] md:text-xs tracking-widest mb-16">
                MAZORA MEZAT REHBERİ VE YARDIM MERKEZİ
            </p>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-6">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-900 font-black uppercase text-sm tracking-widest animate-pulse">{t('legal.preparing')}</p>
                </div>
            ) : error ? (
                <div className="text-center p-12 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    <h3 className="font-black text-gray-900 uppercase mb-2">Error connecting</h3>
                    <button onClick={() => window.location.reload()} className="bg-primary text-white font-black px-10 py-3 rounded-xl text-xs uppercase">{t('common.retry')}</button>
                </div>
            ) : (
                <div className="space-y-4">
                    {faqItems.map((item, idx) => {
                        const isOpen = openIdx === idx;
                        return (
                            <div key={idx} className={`bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden transition-all ${isOpen ? 'ring-2 ring-primary/5 shadow-xl' : 'hover:border-primary/20'}`}>
                                <button 
                                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                                    className="w-full px-6 py-5 md:px-10 md:py-8 flex justify-between items-center text-left"
                                >
                                    <h3 className={`text-sm md:text-xl font-black uppercase italic tracking-tight ${isOpen ? 'text-primary' : 'text-gray-900'}`}>
                                        {item.question}
                                    </h3>
                                    <span className={`text-xl md:text-2xl transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-gray-300'}`}>
                                        {isOpen ? '−' : '+'}
                                    </span>
                                </button>
                                <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 pb-8 md:pb-12 px-6 md:px-10' : 'max-h-0 opacity-0'}`}>
                                    <div className="w-full h-[1px] bg-gray-50 mb-6 md:mb-8"></div>
                                    <p className="text-sm md:text-lg text-gray-600 font-medium leading-relaxed font-sans italic pl-2 md:pl-4 border-l-4 border-primary/10">
                                        {item.answer}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="mt-20 bg-indigo-950 rounded-[2.5rem] md:rounded-[4rem] p-10 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <h3 className="text-2xl md:text-4xl font-display font-black uppercase italic mb-6">SORUNUZ MU VAR?</h3>
                <p className="text-sm md:text-xl text-indigo-200 font-bold mb-10 max-w-xl mx-auto uppercase">EKİBİMİZ SİZE YARDIMCI OLMAK İÇİN BURADA.</p>
                <Link to="/help" className="bg-white text-indigo-950 px-12 py-4 rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all text-xs md:text-sm uppercase tracking-widest inline-block">MÜŞTERİ DESTEĞİNE YAZIN 💬</Link>
            </div>
        </div>
    );
};
