
import React, { useState, useEffect } from 'react';
import { useApp } from '../context';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleGenAI, Type } from "@google/genai";
// Add missing import for FEE_STRUCTURE
import { FEE_STRUCTURE } from '../types';

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

interface LegalSection {
    title: string;
    body: string;
}

const FeePolicyCard = () => {
    const { t, formatPrice } = useApp();
    return (
        <div className="bg-primary/5 border-2 border-primary/20 rounded-[2rem] p-8 mb-12 shadow-inner text-center overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
            <span className="text-4xl mb-4 block">🤝</span>
            <h3 className="text-xl font-display font-black text-primary uppercase mb-4 tracking-tighter">ÜCRET VE ABONELİK POLİTİKASI</h3>
            <p className="text-sm md:text-lg text-gray-800 font-black uppercase italic leading-relaxed max-w-2xl mx-auto mb-6">
                Mazora şeffaf fiyatlandırma politikası ile çalışır. Online ödemeler sadece ilan girişi ve üyelik içindir.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white px-4 py-4 rounded-2xl shadow-sm border border-orange-100">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{t('workflow.fees.quickListing')}</p>
                    <p className="text-sm font-black text-orange-600">İlk İlan ÜCRETSİZ / ₺{FEE_STRUCTURE.QUICK_LISTING_FEE_TL}</p>
                </div>
                <div className="bg-white px-4 py-4 rounded-2xl shadow-sm border border-indigo-100">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{t('workflow.fees.weeklyRent')}</p>
                    <p className="text-sm font-black text-indigo-600">₺{FEE_STRUCTURE.ONAYLI_WEEKLY_RENT_TL} / Hafta</p>
                </div>
                <div className="bg-white px-4 py-4 rounded-2xl shadow-sm border border-primary/10">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">VİSİBİLİTY BOOST</p>
                    <p className="text-sm font-black text-primary">₺{FEE_STRUCTURE.BOOST_FEE_TL} (Opsiyonel)</p>
                </div>
                <div className="bg-gray-900 px-4 py-4 rounded-2xl shadow-sm border border-white/10">
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{t('workflow.fees.buyerCommission')}</p>
                    <p className="text-sm font-black text-white">%{(FEE_STRUCTURE.BUYER_MAZORA_FEE_PERCENT * 100).toFixed(0)} (Teslimatta)</p>
                </div>
                <div className="bg-gray-900 px-4 py-4 rounded-2xl shadow-sm border border-white/10">
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{t('workflow.fees.sellerCommission')}</p>
                    <p className="text-sm font-black text-white">%{(FEE_STRUCTURE.SELLER_MAZORA_FEE_PERCENT * 100).toFixed(0)} (Teslimatta)</p>
                </div>
            </div>
            <p className="mt-6 text-[10px] text-gray-400 font-bold uppercase italic leading-relaxed">
                * Kazanan teklif bedeli üzerinden %5 komisyon hem alıcı hem satıcı tarafından ayrı ayrı ödenir. Kargo ücreti taraflar arasında %50 oranında paylaşılır. Tüm bu bedeller sadece fiziki teslimat anında Mazora ekibine ödenir.
            </p>
        </div>
    );
};

const DynamicLegalContent: React.FC<{ type: 'terms' | 'contract', title: string, showDisclaimer?: boolean }> = ({ type, title, showDisclaimer }) => {
    const { language, t } = useApp();
    const [sections, setSections] = useState<LegalSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLegalContent = async () => {
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
                
                const isContract = type === 'contract';
                const prompt = `Act as a senior legal counsel for Mazora Auctions. 
                Generate a professional ${isContract ? 'Membership Contract' : 'Terms of Service'} in ${langName}.
                
                MANDATORY FEE STRUCTURE TO INCLUDE (CRITICAL):
                1. QUICK LISTING FEE: Non-verified/Individual sellers get the FIRST listing for FREE. Subsequent listings cost ${FEE_STRUCTURE.QUICK_LISTING_FEE_TL} TL per item listing paid via bank transfer (IBAN).
                2. VERIFIED (ONAYLI) SELLER SUBSCRIPTION: Verified sellers must subscribe for ${FEE_STRUCTURE.ONAYLI_WEEKLY_RENT_TL} TL per week (Weekly Rent) to list multiple items without per-item fees.
                3. BOOST FEE: Optional visibility boost is ${FEE_STRUCTURE.BOOST_FEE_TL} TL per item.
                4. POST-WIN COLLECTION (5% + 5% RULE): Mazora collects a 5% commission of the winning bid (hammer price) from the BUYER and a 5% commission from the SELLER separately. The bid price, total 10% platform commission (5% each), AND 50% split cargo cost (domestic) are paid ONLY AT PHYSICAL DELIVERY to the Mazora agent.
                
                OVERSEAS CARGO POLICY:
                - For international delivery, the BUYER is fully responsible for all cargo and customs costs. 
                - Domestic shipping costs are shared equally (50/50).
                
                PENALTY: Rejecting handover results in 10% penalty.
                
                FORMAT: JSON ONLY: {"sections": [{"title": "Article Title", "body": "Full text..."}]}. 
                Tone: Formal, authoritative, and legally binding. Ensure the 5% from Buyer AND 5% from Seller commission model based on hammer price is extremely clear in the articles regarding "Fees and Payments".`;

                const response = await ai.models.generateContent({
                    model: "gemini-3-flash-preview", 
                    contents: prompt,
                    config: {
                        thinkingConfig: { thinkingBudget: 0 }, 
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                sections: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            title: { type: Type.STRING },
                                            body: { type: Type.STRING }
                                        },
                                        required: ["title", "body"]
                                    }
                                }
                            },
                            required: ["sections"]
                        }
                    }
                });

                if (response.text) {
                    const data = JSON.parse(response.text);
                    setSections(data.sections || []);
                }
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchLegalContent();
    }, [language, type]);

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in min-h-[60vh]">
            <div className="w-full flex justify-start mb-8">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest hover:underline">
                    ← {t('common.back')}
                </button>
            </div>

            <h1 className="text-3xl md:text-5xl font-display font-black text-gray-900 mb-8 uppercase tracking-tighter text-center italic">
                {title}
            </h1>

            {showDisclaimer && (
                <div className="bg-red-600 text-white p-6 md:p-8 rounded-2xl mb-8 shadow-2xl border-4 border-red-700">
                    <p className="text-sm md:text-lg font-black text-center uppercase italic">
                        {t('legal.disclaimer')}
                    </p>
                </div>
            )}

            <FeePolicyCard />

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
                <div className="space-y-10">
                    {sections.map((section, idx) => (
                        <div key={idx} className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-2 h-full bg-primary/10 group-hover:bg-primary transition-colors"></div>
                            <h2 className="text-lg md:text-2xl font-black text-primary uppercase mb-6 flex items-center gap-4">
                                <span className="opacity-20 italic text-3xl font-display">{(idx + 1).toString().padStart(2, '0')}</span>
                                {section.title}
                            </h2>
                            <p className="text-sm md:text-base text-gray-600 font-medium font-sans leading-loose whitespace-pre-wrap text-justify">
                                {section.body}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const HelpCenter = () => {
    const { t, createTicket, user, showToast } = useApp();
    const navigate = useNavigate();
    const [isTicketFormOpen, setIsTicketFormOpen] = useState(false);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmitTicket = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        createTicket(subject, message, 'low');
        setIsTicketFormOpen(false);
        showToast("Ticket received.", "success");
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center text-center animate-fade-in pb-32">
            <div className="w-full flex justify-start mb-8">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-primary font-black uppercase text-xs hover:underline">
                    ← {t('nav.home')}
                </button>
            </div>

            <h1 className="text-xl md:text-5xl font-display font-black text-primary mb-10 uppercase tracking-tighter italic">{t('legal.helpCenter').toUpperCase()}</h1>
            
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 text-left">
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <h2 className="font-black text-primary mb-4 uppercase text-sm tracking-widest flex items-center gap-2"><span>🛡️</span> {t('legal.contact60')}</h2>
                    <p className="text-xs text-gray-500 font-bold leading-relaxed italic">{t('legal.contact60Desc')}</p>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <h2 className="font-black text-primary mb-4 uppercase text-sm tracking-widest flex items-center gap-2"><span>🚫</span> {t('legal.penaltyLabel')}</h2>
                    <p className="text-xs text-gray-500 font-bold leading-relaxed italic">{t('legal.penaltyDesc')}</p>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <h2 className="font-black text-primary mb-4 uppercase text-sm tracking-widest flex items-center gap-2"><span>🔒</span> {t('legal.reserveLabel')}</h2>
                    <p className="text-xs text-gray-500 font-bold leading-relaxed italic">{t('legal.reserveDesc')}</p>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                    <h2 className="font-black text-primary mb-4 uppercase text-sm tracking-widest flex items-center gap-2"><span>🚚</span> {t('legal.cargoLabel')}</h2>
                    <p className="text-xs text-gray-500 font-bold leading-relaxed italic">{t('legal.cargoDesc')}</p>
                </div>
            </div>

            <div className="bg-blue-900 text-white p-10 rounded-[3rem] shadow-2xl w-full max-w-2xl relative overflow-hidden">
                <h2 className="font-black text-white mb-6 uppercase text-sm tracking-[0.3em] relative z-10">Müşteri Destek Talebi</h2>
                {!isTicketFormOpen ? (
                    <button onClick={() => setIsTicketFormOpen(true)} className="bg-white text-primary font-black py-4 px-12 rounded-xl text-xs uppercase shadow-lg hover:bg-gray-50 transition-all relative z-10">Yeni Talep Oluştur</button>
                ) : (
                    <form onSubmit={handleSubmitTicket} className="w-full space-y-4 text-left relative z-10">
                        <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Konu" className="w-full border-none rounded-xl p-4 text-sm outline-none bg-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 font-bold" required />
                        <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Mesajınız..." rows={4} className="w-full border-none rounded-xl p-4 text-sm outline-none bg-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 font-bold" required />
                        <button type="submit" className="w-full bg-white text-primary font-black py-4 rounded-xl text-xs uppercase shadow-lg active:scale-95 transition-all">Talebi Gönder</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export const EscrowPolicy = () => {
    const { t } = useApp();
    return (
        <div className="bg-white max-w-full flex flex-col items-center pb-20">
            <div className="bg-primary text-white w-full py-24 px-4 flex flex-col items-center text-center">
                <h1 className="text-2xl md:text-6xl font-display font-black mb-6 uppercase tracking-tighter italic">FİZİKİ GÜVENLİ TİCARET</h1>
                <p className="text-xs md:text-xl text-blue-100 max-w-xl font-bold italic leading-relaxed opacity-80">{t('auction.dealObligation')}</p>
            </div>
            <div className="max-w-5xl px-4 -mt-12">
                <div className="bg-white shadow-2xl rounded-[3rem] p-8 md:p-16 border border-gray-100">
                    <section className="space-y-10">
                        <h3 className="font-black text-primary uppercase text-sm tracking-widest border-b pb-4">{t('legal.escrowTitle')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <span className="text-3xl">🤝</span>
                                <h4 className="font-black text-gray-900 uppercase text-xs">Yüz Yüze Tahsilat</h4>
                                <p className="text-xs text-gray-500 font-bold italic">Temsilcimiz teslimatta kazanan teklif tutarını (hammer), hem alıcı hem satıcıdan ayrı ayrı %5 komisyonu ve kargo ücretinin %50 payını (yurtiçi) fiziken tahsil eder.</p>
                            </div>
                            <div className="space-y-2">
                                <span className="text-3xl">⏱️</span>
                                <h4 className="font-black text-gray-900 uppercase text-xs">60 DK Randevu</h4>
                                <p className="text-xs text-gray-500 font-bold italic">Mezat biter bitmez randevu süreci başlar.</p>
                            </div>
                            <div className="space-y-2">
                                <span className="text-3xl">🌍</span>
                                <h4 className="font-black text-gray-900 uppercase text-xs">Yurtdışı Lojistik</h4>
                                <p className="text-xs text-gray-500 font-bold italic">Yurtdışı gönderimlerde sorumluluk alıcıdadır; Mazora gümrük and lojistik desteği sağlar.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export const TermsOfService = () => {
    const { t } = useApp();
    return <DynamicLegalContent type="terms" title={t('legal.termsTitle') || 'Hizmet Şartları'} showDisclaimer={true} />;
};

export const MembershipContract = () => {
    const { t } = useApp();
    return <DynamicLegalContent type="contract" title={t('legal.contractTitle') || 'Üyelik Sözleşmesi'} />;
};

export const AuctionRules = () => {
    const { t } = useApp();
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center animate-fade-in pb-32">
            <h1 className="text-2xl md:text-5xl font-display font-black mb-4 uppercase tracking-tighter text-gray-900 text-center italic">{t('legal.rulesTitle').toUpperCase()}</h1>
            
            <FeePolicyCard />

            <div className="bg-white border border-gray-200 rounded-[3rem] p-8 md:p-16 text-left shadow-2xl w-full relative overflow-hidden space-y-12">
                <section className="bg-blue-50 p-8 rounded-3xl border border-blue-100">
                    <h3 className="font-black text-blue-900 uppercase text-sm mb-4">TESLİMATTA ÖDEME & KARGO KURALLARI</h3>
                    <div className="space-y-4">
                        <p className="text-sm text-blue-800 font-bold leading-relaxed italic">
                            {t('legal.contact60Desc')} Kazanan teklif tutarı, hem alıcıdan hem satıcıdan ayrı ayrı alınan %5 komisyon ve yarı yarıya paylaşılan (%50) kargo ücreti randevu anında kapıda tahsil edilir.
                        </p>
                        <div className="p-4 bg-white/50 border border-blue-200 rounded-xl">
                            <h4 className="text-xs font-black text-primary uppercase mb-2">🌍 YURTDIŞI GÖNDERİM POLİTİKASI</h4>
                            <p className="text-[11px] text-gray-700 font-bold leading-relaxed">
                                Yurtdışı (overseas) kargo gönderimlerde teslimat sorumluluğu tamamen alıcıya aittir. Mazora ekibi, dünya genelinde uygun lojistik oranları ve ihracat işlemleri konusunda profesyonel destek sunarak süreci kolaylaştırır.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export const EthicsPolicy = () => {
    const navigate = useNavigate();
    const { t } = useApp();
    
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center pb-32 animate-fade-in">
            {/* Header Hero */}
            <div className="bg-gray-900 text-white w-full py-20 px-4 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"></div>
                <div className="relative z-10">
                    <span className="text-secondary font-black tracking-[0.5em] text-[10px] md:text-xs uppercase mb-4 block">GÜVEN PROTOKOLÜ</span>
                    <h1 className="text-3xl md:text-6xl font-display font-black uppercase tracking-tighter italic leading-none mb-4">ETİK İLKELERİMİZ</h1>
                    <p className="text-xs md:text-base text-gray-400 font-bold max-w-xl mx-auto uppercase tracking-wide">Mazora Managed Trade: Şeffaf, Adil ve Güvenilir Mezat Standartları</p>
                </div>
            </div>

            <div className="max-w-4xl w-full px-4 -mt-10 relative z-20">
                <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] shadow-2xl border border-gray-100 p-8 md:p-20 space-y-16">
                    
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-3xl">⚖️</div>
                        <h2 className="text-2xl md:text-4xl font-display font-black text-gray-900 uppercase tracking-tight">GÜVEN LİSTESİ</h2>
                        <div className="w-20 h-1 bg-secondary rounded-full"></div>
                    </div>

                    <div className="space-y-12">
                        <section className="group">
                            <h3 className="text-primary font-black uppercase text-xs md:text-sm tracking-widest mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-xs">I</span>
                                KUSURSUZ BEYAN ZORUNLULUĞU
                            </h3>
                            <p className="text-sm md:text-lg text-gray-600 font-medium leading-loose text-justify italic pl-11">
                                Satıcı, ürünün bilinen tüm kusurlarını gizlemeden açıklamakla mükelleftir. Görünmeyen bir ayıbın sonradan çıkması durumunda Mazora, hakkaniyet gereği satışı iptal etme ve alıcının hakkını iade etme yetkisine sahiptir. Dürüstlük, kâr hırsından üstündür.
                            </p>
                        </section>

                        <section className="group">
                            <h3 className="text-primary font-black uppercase text-xs md:text-sm tracking-widest mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-xs">II</span>
                                MANİPÜLASYON VE SAHTE TEKLİF YASAĞI
                            </h3>
                            <p className="text-sm md:text-lg text-gray-600 font-medium leading-loose text-justify italic pl-11">
                                Ürünün fiyatını suni olarak artırmak amacıyla verilen her türlü sahte teklif (shill bidding) kesinlikle yasaktır. Platform dışı anlaşmalarla fiyat yükseltenler tespit edildiği an süresiz olarak ihraç edilir ve sebep oldukları zarar kendilerinden tahsil edilir.
                            </p>
                        </section>

                        <section className="group">
                            <h3 className="text-primary font-black uppercase text-xs md:text-sm tracking-widest mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-xs">III</span>
                                KARŞILIKLI RIZA VE FİZİKİ GÜVENCE
                            </h3>
                            <p className="text-sm md:text-lg text-gray-600 font-medium leading-loose text-justify italic pl-11">
                                Ticaretin özü karşılıklı rızadır. Bizim modelimizde teknoloji sadece bir aracıdır; nihai işlem, hem alıcının hem satıcının Mazora moderasyonunda kazanan teklif tutarı üzerinden %5'er komisyon ödeyerek el sıkışmasıyla tamamlanır. Belirsizlik içermeyen, net ve şeffaf bir süreci garanti ediyoruz.
                            </p>
                        </section>

                        <section className="group">
                            <h3 className="text-primary font-black uppercase text-xs md:text-sm tracking-widest mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-xs">IV</span>
                                GLOBAL FİYAT ADALETİ
                            </h3>
                            <p className="text-sm md:text-lg text-gray-600 font-medium leading-loose text-justify italic pl-11">
                                Mazora AI motoru, listelenen her ürün için global ve yerel pazar verilerini kullanarak "Adil Fiyat" analizi yapar. Fiyat manipülasyonu yapan veya fahiş fiyatlama stratejisi izleyen ilanlar sistem tarafından askıya alınabilir.
                            </p>
                        </section>
                    </div>

                    <div className="bg-gray-50 p-8 md:p-12 rounded-[2rem] md:rounded-[4rem] border-2 border-dashed border-gray-200 text-center">
                        <p className="text-[10px] md:text-xs text-gray-400 font-black uppercase tracking-[0.4em] mb-4">TİCARETİN ANAYASASI</p>
                        <p className="text-sm md:text-xl text-gray-900 font-black uppercase italic leading-tight">
                            "Dürüst bir ticaret, iki tarafın da hayır duasıyla başlar."
                        </p>
                        <button 
                            onClick={() => navigate(-1)} 
                            className="mt-8 bg-primary text-white font-black px-12 py-4 rounded-xl text-xs uppercase tracking-widest shadow-xl transition-transform active:scale-95"
                        >
                            ANLADIM, GERİ DÖN
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const PrivacyPolicy = () => {
    const { t } = useApp();
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
            <h1 className="text-3xl md:text-5xl font-display font-black text-gray-900 mb-12 uppercase tracking-tighter text-center italic">{t('legal.privacyTitle')}</h1>
            <div className="bg-white p-8 md:p-16 rounded-[3rem] shadow-2xl border border-gray-100">
                <p className="text-sm text-gray-600 font-bold italic leading-relaxed text-justify">Verileriniz Mazora Managed Trade sistemi dahilinde 6698 sayılı KVKK uyarınca korunmaktadır. Telefon görüşmeleri kalite ve güvenlik amacıyla kaydedilmektedir.</p>
            </div>
        </div>
    );
};
