
import React, { useState, useMemo } from 'react';
import { useApp } from '../context';
import { User, AuctionStatus } from '../types';
import { AuctionCard } from '../components/AuctionComponents';
import { LazyImage } from '../components/LazyImage';
import { Link } from 'react-router-dom';

export const VerifiedSellers = () => {
    const { allUsers, auctions, t } = useApp();
    const [selectedSeller, setSelectedSeller] = useState<User | null>(null);

    const verifiedSellers = useMemo(() => {
        return allUsers.filter(u => (u.isVerified || u.sellerTier === 'onayli') && u.role === 'seller');
    }, [allUsers]);

    const sellerProducts = useMemo(() => {
        if (!selectedSeller) return [];
        return auctions.filter(a => a.sellerId === selectedSeller.id && a.status !== AuctionStatus.ENDED);
    }, [selectedSeller, auctions]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in min-h-screen text-left">
            <div className="text-center mb-16">
                <span className="text-xs font-black text-primary uppercase tracking-[0.4em] block mb-4">GÜVEN REHBERİ</span>
                <h1 className="text-4xl md:text-6xl font-display font-black text-gray-900 uppercase tracking-tighter italic">ONAYLI SATICILAR</h1>
                <p className="mt-4 text-gray-500 font-bold uppercase text-[10px] md:text-sm tracking-widest">Mazora tarafından doğrulanan, profesyonel mağazalar ve kurumsal satıcılar.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {verifiedSellers.map(seller => (
                    <button 
                        key={seller.id}
                        onClick={() => setSelectedSeller(seller)}
                        className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col items-center text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform"></div>
                        <div className="relative mb-4">
                            <LazyImage src={seller.avatarUrl} alt={seller.name} className="w-20 h-20 rounded-[2rem] border-4 border-gray-50 shadow-md object-cover" />
                            <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-lg text-[10px] animate-pulse">✓</span>
                        </div>
                        <div className="bg-emerald-600 text-white text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest mb-3 flex items-center gap-1 shadow-sm">
                            ONAYLI <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span>
                        </div>
                        <h3 className="font-black text-sm text-gray-900 uppercase italic line-clamp-2 leading-tight px-4">{seller.name}</h3>
                        {seller.description && (
                            <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-tighter italic line-clamp-2">{seller.description}</p>
                        )}
                        <p className="text-[9px] font-bold text-indigo-600 mt-2 uppercase tracking-tighter">İtibar Skoru: %{seller.reputationScore}</p>
                        
                        <div className="mt-6 pt-4 border-t border-gray-50 w-full">
                             <span className="text-[9px] font-black text-primary uppercase tracking-widest">Mağazayı Gör →</span>
                        </div>
                    </button>
                ))}
            </div>

            {selectedSeller && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 md:p-4 bg-black/70 backdrop-blur-md animate-fade-in">
                    <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] shadow-2xl w-full max-w-2xl max-h-[85vh] md:max-h-[90vh] overflow-hidden flex flex-col border border-white/20">
                        <div className="bg-primary p-6 md:p-12 text-white relative overflow-hidden flex-shrink-0 text-center">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
                            <button onClick={() => setSelectedSeller(null)} className="absolute top-4 right-4 md:top-8 md:right-8 text-white/50 hover:text-white p-2 transition-transform hover:rotate-90 z-20"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
                            <div className="flex flex-col items-center gap-4 md:gap-8 relative z-10">
                                <div className="w-20 h-20 md:w-32 md:h-32 rounded-[2rem] bg-white p-0.5 shadow-2xl overflow-hidden relative">
                                    <LazyImage src={selectedSeller.avatarUrl} alt={selectedSeller.name} className="w-full h-full object-cover rounded-[1.8rem]" />
                                    <span className="absolute bottom-2 right-2 bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-xl text-lg animate-pulse">✓</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="bg-emerald-600 text-white text-[8px] md:text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-[0.15em] inline-block border border-emerald-400 shadow-lg">DOĞRULANMIŞ MAZORA SATICISI</div>
                                    <h2 className="text-lg md:text-4xl font-display font-black uppercase italic tracking-tighter leading-tight max-w-md mx-auto">{selectedSeller.name}</h2>
                                    {selectedSeller.description && <p className="text-xs md:text-sm font-bold text-blue-200 uppercase tracking-widest italic">{selectedSeller.description}</p>}
                                    <div className="flex flex-wrap justify-center gap-3 md:gap-6 mt-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-blue-100"><span className="flex items-center gap-1.5">📊 {sellerProducts.length} AKTİF MEZAT</span><span className="flex items-center gap-1.5">🛡️ %{selectedSeller.reputationScore} GÜVEN</span></div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 md:p-12 no-scrollbar bg-gray-50/50">
                            <h3 className="text-[9px] md:text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 md:mb-8 border-b border-gray-200 pb-3 text-center md:text-left">GÜNCEL CANLI MEZATLAR</h3>
                            <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6">{sellerProducts.map(item => (<div key={item.id} className="scale-[0.9] md:scale-100 origin-top"><AuctionCard item={item} /></div>))}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
