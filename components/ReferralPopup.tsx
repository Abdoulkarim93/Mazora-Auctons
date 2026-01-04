
import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../context';
import { useLocation } from 'react-router-dom';

export const ReferralPopup = () => {
    const { t, isReferralModalOpen, openReferralModal, user } = useApp();
    const location = useLocation();
    const [copied, setCopied] = useState(false);
    const hasTriggeredRef = useRef(false);

    const isCriticalWorkFlow = 
        location.pathname.startsWith('/sell') || 
        location.pathname.startsWith('/auction/') || 
        location.pathname.startsWith('/admin') ||
        location.pathname === '/login' ||
        location.pathname === '/register';

    useEffect(() => {
        const lastSeenStr = localStorage.getItem('mazora_referral_popup_last_seen');
        const now = Date.now();
        const COOLDOWN_MS = user ? 3 * 24 * 60 * 60 * 1000 : 12 * 60 * 60 * 1000;

        if (lastSeenStr) {
            const lastSeen = parseInt(lastSeenStr, 10);
            if (now - lastSeen < COOLDOWN_MS) {
                return;
            }
        }

        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0) triggerPopup();
        };

        const timer = setTimeout(() => {
            if (!document.hidden) triggerPopup();
        }, 30000);

        if (!isCriticalWorkFlow && !hasTriggeredRef.current && !isReferralModalOpen) {
            document.addEventListener('mouseleave', handleMouseLeave);
        }

        return () => {
            document.removeEventListener('mouseleave', handleMouseLeave);
            clearTimeout(timer);
        };
    }, [user, isCriticalWorkFlow, isReferralModalOpen]);

    const triggerPopup = () => {
        if (hasTriggeredRef.current || isCriticalWorkFlow) return;
        hasTriggeredRef.current = true;
        openReferralModal(true);
        localStorage.setItem('mazora_referral_popup_last_seen', Date.now().toString());
    };

    const handleShare = () => {
        const code = user?.referralCode || "FRIEND350";
        const shareLink = `https://mazora.com/register?ref=${code}`;
        const message = `Selam! Mazora Auctions platformuna senin için 350 TL değerinde bir hediye kredisi bıraktım. İlk işlemini yapınca ikimiz de kazanıyoruz! Kayıt linki: ${shareLink}`;
        
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        openReferralModal(false);
    };

    if (!isReferralModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden relative transform transition-all scale-100 border-2 border-yellow-400 flex flex-col items-center text-center">
                <div className="bg-gradient-to-r from-gray-900 to-black p-5 w-full relative overflow-hidden">
                    <div className="text-3xl mb-1">🎁</div>
                    <h2 className="text-lg md:text-xl font-display font-extrabold text-white leading-tight uppercase">
                        {t('referral.popupTitle')}
                    </h2>
                </div>
                
                <div className="p-6 md:p-8 flex flex-col items-center">
                    <p className="text-gray-600 mb-4 text-xs md:text-sm font-medium leading-relaxed break-words">
                        {t('referral.popupBody')}
                    </p>
                    
                    <button 
                        onClick={handleShare}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-extrabold py-3 md:py-4 rounded-xl shadow-lg shadow-yellow-200 transition-all transform active:scale-95 mb-3 flex items-center justify-center gap-2 text-xs md:text-sm uppercase tracking-wider"
                    >
                        {copied ? `✅ ${t('referral.copied')}` : t('referral.shareBtn')}
                    </button>
                    
                    <button 
                        onClick={handleClose}
                        className="text-gray-400 font-bold hover:text-gray-600 text-[10px] md:text-xs uppercase tracking-tighter"
                    >
                        {t('referral.close')}
                    </button>
                </div>
            </div>
        </div>
    );
};
