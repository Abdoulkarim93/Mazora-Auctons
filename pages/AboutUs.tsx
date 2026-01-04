
import React from 'react';
import { useApp } from '../context';
import { useNavigate } from 'react-router-dom';

export const AboutUs = () => {
    const { t } = useApp();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white animate-fade-in pb-32">
            {/* Header / Hero */}
            <div className="bg-primary text-white py-24 md:py-32 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h1 className="text-4xl md:text-7xl font-display font-black uppercase tracking-tighter italic mb-6">
                        YÖNETİLEN TİCARETİN GELECEĞİ
                    </h1>
                    <p className="text-lg md:text-2xl text-blue-100 font-bold max-w-2xl mx-auto leading-relaxed">
                        Mazora, Dünya'nın 1 numaralı tam kapsamlı "Managed Trade" açık artırma protokolüdür.
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-20">
                <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 p-8 md:p-20 space-y-16">
                    
                    {/* Mission Section */}
                    <section className="text-center space-y-6">
                        <span className="text-xs font-black text-secondary uppercase tracking-[0.4em] block">VİZYONUMUZ</span>
                        <h2 className="text-3xl md:text-5xl font-display font-black text-gray-900 tracking-tight leading-none uppercase">
                            GÜVEN, TEKNOLOJİ VE<br/>İNSAN DOKUNUŞU
                        </h2>
                        <p className="text-sm md:text-lg text-gray-600 font-medium leading-relaxed text-justify md:text-center max-w-3xl mx-auto">
                            Geleneksel pazaryerlerindeki belirsizliği ve güvenlik risklerini ortadan kaldırmak için yola çıktık. Mazora, sadece bir yazılım değil; her işlemin arkasında fiziki denetim ve garantörlük sunan hibrit bir ticaret protokolüdür. Bugün, sınırları aşarak global bir ticaret köprüsü kuruyoruz.
                        </p>
                    </section>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl">🛡️</div>
                            <h3 className="text-xl font-display font-black text-gray-900 uppercase">FİZİKİ GÜVENCE</h3>
                            <p className="text-sm text-gray-500 font-bold leading-relaxed italic">
                                Alıcı ve satıcı arasındaki ödeme ve teslimat süreci, Mazora ekipleri tarafından yerinde yönetilir. "Ürün gelmedi" veya "Para yatmadı" devri bitti.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl">📦</div>
                            <h3 className="text-xl font-display font-black text-gray-900 uppercase">KÜRESEL LOJİSTİK</h3>
                            <p className="text-sm text-gray-500 font-bold leading-relaxed italic">
                                Yurtiçi kargo %50 / %50 paylaşılır. Yurtdışı gönderimlerde ise Mazora, profesyonel gümrükleme, ihracat ve uygun fiyatlı küresel lojistik desteği sağlayarak dünyayı pazarınız yapar.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-3xl">⚖️</div>
                            <h3 className="text-xl font-display font-black text-gray-900 uppercase">GLOBAL AI ANALİZİ</h3>
                            <p className="text-sm text-gray-500 font-bold leading-relaxed italic">
                                Yapay zeka motorumuz, dünya genelindeki pazar verilerini anlık analiz ederek hem alıcıya hem satıcıya her ülkede adil fiyat rehberliği sunar.
                            </p>
                        </div>
                    </div>

                    {/* Managed Trade Explanation */}
                    <div className="bg-gray-50 p-8 md:p-12 rounded-[2.5rem] border border-gray-100">
                        <h4 className="font-display font-black text-primary text-xl uppercase mb-6 flex items-center gap-3">
                            <span>🤝</span> NEDEN "YÖNETİLEN TİCARET"?
                        </h4>
                        <div className="space-y-6 text-sm md:text-base text-gray-700 font-medium leading-loose">
                            <p>
                                Klasik e-ticaret modellerinde alıcı ve satıcı genellikle kaderlerine terk edilir. Mazora'nın **"Managed Trade"** (Yönetilen Ticaret) modelinde ise platform, mezat bittiği andan itibaren aktif bir moderatöre dönüşür.
                            </p>
                            <p>
                                60 dakika içinde taraflarla iletişime geçer, lojistik planlamayı yapar ve ödemeyi (hammer fiyatı + %5 komisyon + kargo payı) teslimat anında fiziken tahsil ederek satıcıya aktarır. Bu model, Dünya'nın en güvenli ticaret köprüsüdür.
                            </p>
                        </div>
                    </div>

                    {/* Footer / Contact Hint */}
                    <div className="text-center pt-8 border-t border-gray-100">
                        <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-[0.4em] mb-8">
                            MAZORA AUCTIONS: ŞEFFAFLIK, HIZ VE KUSURSUZ GÜVEN.
                        </p>
                        <button 
                            onClick={() => navigate('/')} 
                            className="bg-primary text-white font-black px-12 py-4 rounded-2xl shadow-xl uppercase text-xs tracking-widest transition-transform active:scale-95 hover:bg-primary-800"
                        >
                            MEZATLARA GÖZ AT 🚀
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
