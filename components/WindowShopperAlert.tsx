
import React, { useEffect, useState } from 'react';
import { useApp } from '../context';
import { useNavigate, useLocation } from 'react-router-dom';
import { MOCK_AUCTIONS } from '../mockData';
import { LazyImage } from './LazyImage';

export const WindowShopperAlert = () => {
    const { user, auctions } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(false);
    const [targetItem, setTargetItem] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState(25);

    // 1. TRIGGER LOGIC
    useEffect(() => {
        if (user) return;
        // Don't show if already on a simulation or login page
        if (location.pathname.includes('/login') || location.pathname.includes('/register') || location.pathname.includes('/auction/')) return;

        const timer = setInterval(() => {
            // Pick a random "exciting" item (Electronics or Vehicles)
            const excitingItems = MOCK_AUCTIONS.filter(a => a.category === 'electronics' || a.category === 'vehicles');
            const randomItem = excitingItems[Math.floor(Math.random() * excitingItems.length)];
            setTargetItem(randomItem);
            setIsVisible(true);
            setTimeLeft(25); // Reset auto-close timer
        }, 45000); // 45 Seconds

        return () => clearInterval(timer);
    }, [user, location.pathname]);

    // 2. AUTO-CLOSE LOGIC (Safety Net)
    useEffect(() => {
        let interval: any;
        if (isVisible && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setIsVisible(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isVisible, timeLeft]);

    const handleWatchNow = () => {
        setIsVisible(false);
        if (targetItem) {
            // Navigate with Simulation Flag AND Reward Eligibility
            navigate(`/auction/${targetItem.id}`, { state: { simulationMode: true, rewardEligible: true } });
        }
    };

    if (!isVisible || !targetItem) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center pointer-events-none">
            {/* Backdrop - Manual Close Action */}
            <div className="absolute inset-0 bg-black/40 pointer-events-auto transition-opacity backdrop-blur-[2px]" onClick={() => setIsVisible(false)}></div>
            
            {/* Modal / Bottom Sheet - Friendly Gift Vibe */}
            <div className="bg-white w-full sm:max-w-md h-auto sm:rounded-2xl rounded-t-3xl shadow-2xl p-6 pointer-events-auto relative transform transition-transform animate-slide-up flex flex-col items-center text-center overflow-hidden border-t-4 border-purple-500">
                
                {/* Close Button */}
                <button onClick={() => setIsVisible(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 z-10">✕</button>

                {/* Mobile Handle */}
                <div className="w-16 h-1 bg-gray-300 rounded-full mb-6 sm:hidden"></div>

                <div className="flex items-center gap-2 mb-4 text-purple-600 animate-bounce">
                    <span className="text-3xl">🎁</span>
                    <span className="font-black uppercase tracking-widest text-sm">A Gift For You</span>
                </div>

                <p className="text-gray-900 font-bold text-lg mb-2 leading-snug">
                    Would you like to check out how bidding works?
                </p>
                <p className="text-gray-500 text-sm mb-6 max-w-xs leading-relaxed">
                    Watch the live demo for <span className="text-primary font-bold">{targetItem.title}</span> until the end, and we'll drop <span className="text-green-600 font-black">100 TL</span> in your wallet when you register!
                </p>

                <div className="relative w-full h-32 mb-6 rounded-xl overflow-hidden border border-gray-200 group cursor-pointer" onClick={handleWatchNow}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>
                    <LazyImage src={targetItem.imageUrl} alt="Target" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-xs py-2 font-bold z-20 flex justify-between px-4 items-end">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span> Live Demo</span>
                        <span className="bg-purple-500 text-white px-2 py-1 rounded text-[10px] shadow-sm">EARN 100 TL</span>
                    </div>
                </div>

                <button 
                    onClick={handleWatchNow}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-200 flex items-center justify-center gap-2 text-lg transition-transform active:scale-95 relative overflow-hidden"
                >
                    <span className="relative z-10 flex items-center gap-2"><span>👀</span> Watch & Claim Gift</span>
                </button>
                
                <button onClick={() => setIsVisible(false)} className="mt-4 text-xs text-gray-400 font-bold hover:text-gray-600">
                    No thanks, I'll pass
                </button>

                {/* Subtle Auto-Close Timer Bar */}
                <div className="absolute bottom-0 left-0 h-1 bg-gray-100 w-full">
                    <div 
                        className="h-full bg-purple-500/50 transition-all duration-1000 ease-linear" 
                        style={{ width: `${(timeLeft / 25) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};
