
import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context';

export const QuickListSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { formatPrice, t, user } = useApp();
    const [timeLeft, setTimeLeft] = useState(24 * 3600); // 24 hours in seconds
    const phone = location.state?.phone || '...';
    const isBoosted = location.state?.isBoosted || false;

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 bg-gray-50">
            <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden text-center p-10 md:p-16 relative">
                <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${isBoosted ? 'from-purple-600 via-indigo-600 to-purple-600' : 'from-primary via-secondary to-primary'}`}></div>
                
                <div className={`w-24 h-24 ${isBoosted ? 'bg-purple-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce-in shadow-inner text-4xl`}>
                    {isBoosted ? '🚀' : '✅'}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-display font-black text-gray-900 uppercase tracking-tighter mb-4 italic leading-tight">
                    {isBoosted ? t('quick_list.boostSuccess') : t('quick_list.success')}
                </h1>

                <div className="flex flex-col items-center gap-3 mb-8">
                    {isBoosted && (
                        <div className="px-4 py-2 bg-purple-600 text-white rounded-full inline-block text-[10px] font-black uppercase tracking-widest animate-pulse shadow-lg">
                            {t('quick_list.premiumActive')}
                        </div>
                    )}
                    <div className="px-4 py-2 bg-green-600 text-white rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg">
                        <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                        {t('quick_list.smsActive')}
                    </div>
                </div>
                
                <div className="bg-gray-900 text-white p-6 rounded-[2rem] mb-10 shadow-lg border border-white/10">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">KALAN SÜRE (24H)</p>
                    <div className="text-4xl md:text-6xl font-mono font-black tracking-tighter">{formatTime(timeLeft)}</div>
                </div>

                <div className="space-y-6 text-left mb-12">
                    <div className="flex gap-4 items-start bg-green-50 p-5 rounded-[2rem] border border-green-100">
                        <div className="w-10 h-10 rounded-2xl bg-green-600 text-white flex items-center justify-center flex-shrink-0 text-xl">💬</div>
                        <div>
                            <p className="text-xs font-black text-green-900 uppercase">{t('quick_list.firstNotif')}</p>
                            <p className="text-[10px] text-green-700 font-bold mt-0.5">{t('quick_list.notifSent')} (+90 5423028821)</p>
                        </div>
                    </div>

                    {isBoosted && (
                        <div className="flex gap-4 items-start bg-purple-50 p-5 rounded-[2rem] border border-purple-100">
                            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 text-xl">🔥</div>
                            <div>
                                <p className="text-xs font-black text-purple-900 uppercase">{t('quick_list.priorityList')}</p>
                                <p className="text-[10px] text-purple-700 font-bold mt-0.5">{t('quick_list.priorityDesc')}</p>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex gap-4 items-start bg-blue-50 p-5 rounded-[2rem] border border-blue-100">
                        <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xl font-black">#</div>
                        <div>
                            <p className="text-xs font-black text-blue-900 uppercase">{t('quick_list.pulse4h')}</p>
                            <p className="text-[10px] text-blue-700 font-bold mt-0.5">{t('quick_list.pulseDesc')}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {!user && (
                        <Link to="/register" className="bg-primary text-white font-black py-4 rounded-2xl shadow-lg shadow-primary/20 text-xs uppercase tracking-widest hover:bg-primary-800 active:scale-95 transition-all">{t('quick_list.registerNow')}</Link>
                    )}
                    <Link to={user ? "/profile" : "/"} className={`bg-gray-100 text-gray-600 font-black py-4 rounded-2xl text-xs uppercase tracking-widest hover:bg-gray-200 transition-all ${user ? 'md:col-span-2' : ''}`}>
                        {user ? 'PROFİLİNE GİT 👤' : t('common.goHome')}
                    </Link>
                </div>
                
                <style>{`
                    @keyframes bounce-in {
                        0% { transform: scale(0.3); opacity: 0; }
                        50% { transform: scale(1.1); opacity: 1; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    .animate-bounce-in {
                        animation: bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                    }
                `}</style>
            </div>
        </div>
    );
};
