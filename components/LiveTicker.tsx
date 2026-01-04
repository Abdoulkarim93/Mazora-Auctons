
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context';

export const LiveTicker = () => {
    const { t, user, auctions } = useApp();
    const [event, setEvent] = useState<{ type: string, identity: string, highlight: string } | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const fadeTimerRef = useRef<any | null>(null);

    // PRODUCTION: Disabled bot activity generator.
    // Ticker is currently passive, awaiting real data to populate.
    useEffect(() => {
        // Ticker is ready for real event handling
    }, []);

    if (!event || !isVisible) return null;

    const renderText = () => {
        if (event.type === 'view') {
            return (
                <div className="flex items-center gap-1.5">
                    <span className="text-secondary">🔥</span>
                    <span className="font-black text-white">{event.identity} {t('liveRoom.ticker.viewing') || 'kişi izliyor'}</span>
                    <span className="text-white/40 ml-1">• {t('liveRoom.ticker.justNow')}</span>
                </div>
            );
        }
        
        if (event.type === 'win') {
            return (
                <div className="flex items-center gap-1.5">
                    <span className="text-xl">🎉</span>
                    <span className="font-black text-white">{event.identity}</span>
                    <span className="text-blue-100">{event.highlight} {t('liveRoom.ticker.win')}</span>
                    <span className="text-white/40 ml-1">• {t('liveRoom.ticker.justNow')}</span>
                </div>
            );
        }

        const actionKey = `liveRoom.ticker.${event.type}`;
        const actionText = t(actionKey);
        
        return (
            <div className="flex items-center gap-1.5">
                <span className="font-black text-white">{event.identity}</span>
                <span className="text-blue-100">{actionText}</span>
                <span className="font-bold text-secondary">{event.highlight}</span>
                <span className="text-white/40 ml-1">• {t('liveRoom.ticker.justNow')}</span>
            </div>
        );
    };

    return (
        <div 
            className={`fixed top-20 md:top-24 left-1/2 -translate-x-1/2 z-[60] transition-all duration-700 pointer-events-none ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'}`}
        >
            <div className="bg-primary/80 backdrop-blur-xl border border-white/20 px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-2 whitespace-nowrap min-w-[300px] justify-center">
                <span className="text-[11px] md:text-sm text-white font-bold tracking-tight">
                    {renderText()}
                </span>
            </div>
        </div>
    );
};
