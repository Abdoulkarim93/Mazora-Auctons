
import React, { useState, useEffect } from 'react';
import { useApp } from '../context';
import { ProductCondition, FEE_STRUCTURE, CategoryType, DealStep } from '../types';

export const WorkflowTimer: React.FC<{ targetDate: Date; label: string }> = ({ targetDate, label }) => {
    const { t } = useApp();
    const [timeLeft, setTimeLeft] = useState<{ h: number; m: number; s: number } | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            const distance = targetDate.getTime() - new Date().getTime();
            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft(null);
            } else {
                setTimeLeft({
                    h: Math.floor(distance / (1000 * 60 * 60)),
                    m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    s: Math.floor((distance % (1000 * 60)) / 1000),
                });
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    if (!timeLeft) return <div className="text-red-600 font-black text-xs uppercase animate-pulse">⚠️ {t('common.expired')}</div>;

    return (
        <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
            <div className="font-mono text-primary font-black text-lg">
                {String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}
            </div>
        </div>
    );
};

export const FeeBreakdown: React.FC<{ baseAmount: number; condition: ProductCondition; role: 'buyer' | 'seller'; category?: CategoryType; isBoosted?: boolean }> = ({ baseAmount, condition, role, category, isBoosted }) => {
    const { t, formatPrice } = useApp();
    
    // Logic: Used products have 0% VAT, New products have 20%
    const isUsed = condition === ProductCondition.USED;
    const vatRate = isUsed ? 0 : 0.20;
    
    const vatOnBid = baseAmount * vatRate;
    const commission = baseAmount * (role === 'buyer' ? FEE_STRUCTURE.BUYER_MAZORA_FEE_PERCENT : FEE_STRUCTURE.SELLER_MAZORA_FEE_PERCENT);
    const vatOnCommission = commission * 0.20; // Professional services VAT always applies
    const cargoShare = FEE_STRUCTURE.ESTIMATED_AVG_CARGO_TL * 0.5;
    const boostFee = (role === 'seller' && isBoosted) ? FEE_STRUCTURE.BOOST_FEE_TL : 0;
    
    // Hammer price + Product VAT (if any) + Commission + Commission VAT + Cargo
    const deliveryTotal = baseAmount + vatOnBid + commission + vatOnCommission + cargoShare;

    return (
        <div className="bg-gray-900 rounded-[2rem] border border-white/10 p-8 text-white space-y-6 shadow-2xl relative overflow-hidden h-full text-left">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            
            <h4 className="font-display font-black text-white uppercase text-xs tracking-widest border-b border-white/10 pb-4 flex justify-between items-center relative z-10">
                <span>{t('workflow.fees.total')}</span>
                <span className="bg-primary text-[9px] px-2 py-1 rounded">{t('workflow.fees.serviceFee')}</span>
            </h4>
            
            <div className="space-y-4 relative z-10">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-bold">{t('workflow.fees.itemPrice')}</span>
                    <span className="font-black text-gray-300">{formatPrice(baseAmount)}</span>
                </div>
                
                {vatOnBid > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400 font-bold">KDV (20%)</span>
                        <span className="font-black text-gray-300">{formatPrice(vatOnBid)}</span>
                    </div>
                )}

                <div className="pt-2 space-y-2 border-t border-white/5">
                    <div className="flex justify-between text-sm">
                        <span className="text-primary-500 font-bold">Teklif Komisyonu (%5)</span>
                        <span className="font-black text-white">{formatPrice(commission)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-primary-500 font-bold">Komisyon KDV (%20)</span>
                        <span className="font-black text-white">{formatPrice(vatOnCommission)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-primary-500 font-bold">{t('workflow.fees.cargo')} (Paylaşılan %50)</span>
                        <span className="font-black text-white">{formatPrice(cargoShare)}</span>
                    </div>
                    {boostFee > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-purple-400 font-bold">Visibility Boost (Online Paid)</span>
                            <span className="font-black text-white">{formatPrice(boostFee)}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-6 border-t-2 border-dashed border-white/10 flex justify-between items-center relative z-10">
                <div className="flex flex-col">
                    <span className="font-black text-primary uppercase text-[10px] tracking-widest mb-1">{t('workflow.fees.nowPay')}</span>
                    <span className="text-3xl font-black text-white">{formatPrice(deliveryTotal)}</span>
                </div>
                <div className="text-right flex flex-col items-end">
                    <span className="text-[9px] text-gray-500 font-black uppercase mb-1">{t('workflow.fees.penalty')}</span>
                    <span className="text-xs font-black text-red-400">₺{Math.round(baseAmount * 0.10)}</span>
                </div>
            </div>

            <div className="bg-blue-950/40 p-4 rounded-xl border border-blue-900/30 text-[9px] font-bold text-blue-200 leading-relaxed italic relative z-10">
                NOT: {isUsed ? 'İkinci el ürünlerde ürün KDV\'si hesaplanmaz.' : 'Sıfır ürünlerde kanuni %20 KDV fiyata dahildir.'} Kazanan teklif bedelinin %5\'i oranındaki komisyon hem alıcı hem satıcı tarafından ayrı ayrı ödenir. Kargo ücreti taraflar arasında %50 - %50 paylaşılır. Yurtdışı gönderimlerde sorumluluk alıcıdadır.
            </div>
        </div>
    );
};

export const TrustStepper: React.FC<{ item: any; role: 'buyer' | 'seller' }> = ({ item, role }) => {
    const { t, updateDealStep, showToast } = useApp();
    
    // Updated steps for Physical Handover flow
    const steps: DealStep[] = [
        { id: 'contact', label: 'Randevu & Lojistik', description: 'Ekibimiz 60 dk içinde teslimat randevusu için sizi arayacaktır.', status: 'pending', requiredActionBy: 'none' },
        { id: 'delivery', label: 'Teslimat & Ödeme', description: 'Temsilci adresinize gelerek ürün teslimatını, kazanan teklif üzerinden %5 komisyonları ve paylaşılan kargo bedelini tahsil eder.', status: 'pending', requiredActionBy: 'none' },
        { id: 'close', label: 'İşlem Kapatma', description: 'Ödeme ve teslimat onaylandığında işlem tamamlanır.', status: 'pending', requiredActionBy: 'admin' }
    ];

    const currentIdx = steps.findIndex(s => s.status === 'pending');

    const handleAction = (stepId: string) => {
        showToast("İşlem Mazora temsilcisi tarafından teslimat anında güncellenecektir.", "info");
    };

    return (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden relative h-full flex flex-col">
            <div className="bg-primary p-6 flex justify-between items-center text-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl">🚚</div>
                    <div className="flex flex-col">
                        <span className="font-black uppercase tracking-widest text-[10px] text-blue-200">TESLİMATTA GÜVENLİ ÖDEME</span>
                        <span className="font-display font-black text-sm uppercase">YÖNETİLEN TRANSFER AKIŞI</span>
                    </div>
                </div>
            </div>

            <div className="p-8 md:p-10 flex-grow">
                <div className="space-y-12">
                    {steps.map((step, idx) => {
                        const isActive = idx === currentIdx;
                        const isPast = idx < currentIdx;
                        const isLocked = idx > currentIdx;

                        return (
                            <div key={step.id} className={`flex gap-8 relative ${isLocked ? 'opacity-30 grayscale' : ''}`}>
                                {idx < steps.length - 1 && (
                                    <div className={`absolute left-6 top-12 w-0.5 h-12 ${isPast ? 'bg-green-500' : 'bg-gray-100'}`}></div>
                                )}
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all border-2 flex-shrink-0 z-10 ${
                                    isPast ? 'bg-green-500 border-green-500 text-white' : 
                                    isActive ? 'bg-primary border-primary text-white scale-110 shadow-xl shadow-primary/20' : 
                                    'bg-gray-50 border-gray-100 text-gray-300'
                                }`}>
                                    {isPast ? '✓' : idx + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className={`font-black text-base uppercase tracking-tight ${isActive ? 'text-primary' : 'text-gray-900'}`}>{step.label}</h4>
                                        {isActive && (
                                            <span className="bg-orange-100 text-orange-700 text-[8px] font-black px-2 py-0.5 rounded-full animate-pulse uppercase">Aktif</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 font-bold mt-1.5 leading-relaxed italic">{step.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <div className="bg-blue-50 p-6 border-t border-blue-100 flex items-center gap-4 mt-auto">
                <span className="text-2xl">🤝</span>
                <p className="text-[10px] text-blue-900 font-black leading-relaxed uppercase italic">
                    {t('legal.contact60Desc')}
                </p>
            </div>
        </div>
    );
};
