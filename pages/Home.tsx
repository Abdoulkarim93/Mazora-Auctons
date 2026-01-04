
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context';
import { CATEGORIES, CategoryType, AuctionItem, AuctionStatus } from '../types';
import { AuctionCard, CountdownTimer } from '../components/AuctionComponents';
import { Link, useNavigate } from 'react-router-dom';
import { LiveTicker } from '../components/LiveTicker';
import { LazyImage } from '../components/LazyImage';

const getNextEventDays = () => {
    const eventDays = [3, 5, 0]; // Wednesday, Friday, Sunday
    const upcoming = [];
    let checkDate = new Date();
    
    while (upcoming.length < 3) {
        if (eventDays.includes(checkDate.getDay())) {
            upcoming.push(new Date(checkDate));
        }
        checkDate.setDate(checkDate.getDate() + 1);
    }
    return upcoming;
};

const generateDynamicSlots = () => {
    const eventDays = [3, 5, 0]; // Wed, Fri, Sun
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();
    
    const isLiveDay = eventDays.includes(currentDay);
    const startHour = 10;
    const endHour = 22;
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    const allSlots: any[] = [];
    const scheduledCategories = CATEGORIES.filter(c => c.id !== CategoryType.DIRECT_24H);

    scheduledCategories.forEach((cat, index) => {
        const s1StartHour = startHour + (index % 12);
        const s2StartHour = startHour + ((index + 6) % 12);

        [s1StartHour, s2StartHour].forEach((h, sIdx) => {
            const slotTotalMinutes = h * 60;
            const timeLabel = `${String(h).padStart(2, '0')}:00`;
            const endLabel = `${String(h + 1).padStart(2, '0')}:00`;
            
            const isLiveNow = isLiveDay && currentTotalMinutes >= slotTotalMinutes && currentTotalMinutes < slotTotalMinutes + 60;

            allSlots.push({
                id: `${cat.id}-${sIdx}`,
                startTimeMinutes: slotTotalMinutes,
                timeLabel,
                endLabel,
                category: cat.id,
                categoryLabel: cat.label,
                status: isLiveNow ? 'live' : 'upcoming'
            });
        });
    });

    return allSlots.sort((a, b) => a.startTimeMinutes - b.startTimeMinutes);
};

export const Home = () => {
  const { t, language, auctions, formatPrice, waitlistCount } = useApp();
  const navigate = useNavigate();
  const slots = useMemo(() => generateDynamicSlots(), []);
  const upcomingEventDates = useMemo(() => getNextEventDays(), []);
  
  const currentDay = new Date().getDay();
  const eventDays = [3, 5, 0];
  const isLiveDay = eventDays.includes(currentDay);
  const currentHour = new Date().getHours();
  const isSystemOffline = !isLiveDay || currentHour < 10 || currentHour >= 22;

  const LAUNCH_DATE = useMemo(() => new Date('2026-01-27T10:00:00'), []);

  const liveAuctions = useMemo(() => {
      return auctions.filter(a => {
          if (a.status !== AuctionStatus.ACTIVE) return false;
          if (a.category === CategoryType.DIRECT_24H || a.isLossLeader) return true;
          return !isSystemOffline;
      });
  }, [auctions, isSystemOffline]);

  const lossLeader = useMemo(() => auctions.find(item => item.isLossLeader), [auctions]);

  const [randomDisplayAuctions, setRandomDisplayAuctions] = useState<AuctionItem[]>([]);

  useEffect(() => {
      const pool = liveAuctions.filter(item => !item.isLossLeader);
      const shuffled = [...pool];
      for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      // Increased pool for the slider
      setRandomDisplayAuctions(shuffled.slice(0, 16));
  }, [liveAuctions]);

  const [powerHourState, setPowerHourState] = useState<{isActive: boolean; nextStart: Date; label: string;}>({ isActive: false, nextStart: LAUNCH_DATE, label: 'BÜYÜK AÇILIŞ' });

  useEffect(() => {
      const refreshPowerHour = () => {
          const now = new Date();
          if (now < LAUNCH_DATE) {
              setPowerHourState({ isActive: false, nextStart: LAUNCH_DATE, label: language === 'tr' ? 'BÜYÜK MEZAT AÇILIŞI' : 'GRAND AUCTION LAUNCH' });
              return;
          }
          if (lossLeader && lossLeader.startsAt) {
              const startsAt = new Date(lossLeader.startsAt);
              const endsAt = new Date(lossLeader.endsAt);
              if (now < startsAt) { setPowerHourState({ isActive: false, nextStart: startsAt, label: t('home.upcomingEvent') }); return; } 
              else if (now < endsAt) { setPowerHourState({ isActive: true, nextStart: endsAt, label: t('home.liveNowLabel') }); return; }
          }
          let nextStart = new Date();
          nextStart.setHours(10, 0, 0, 0);
          while(!eventDays.includes(nextStart.getDay()) || nextStart < now) {
              nextStart.setDate(nextStart.getDate() + 1);
              if (nextStart.getDay() === currentDay && currentHour < 22 && currentHour >= 10) {
                      setPowerHourState({ isActive: true, nextStart: new Date(now.setHours(22,0,0,0)), label: t('home.liveNowLabel') });
                      return;
              }
          }
          setPowerHourState({ isActive: false, nextStart: nextStart, label: language === 'tr' ? 'BÜYÜK ETKİNLİK GÜNÜ' : 'BIG EVENT DAY' });
      };
      refreshPowerHour();
      const interval = setInterval(refreshPowerHour, 60000);
      return () => clearInterval(interval);
  }, [lossLeader, t, LAUNCH_DATE, language, currentDay, currentHour]);

  return (
    <div className="bg-white max-w-full overflow-x-hidden">
      <LiveTicker />

      {/* COMPACT TOP BANNER */}
      <div className="bg-black text-white border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-1 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                  <span className={`text-xs md:text-sm ${powerHourState.isActive ? 'animate-spin' : 'animate-pulse'} text-yellow-400`}>⚡</span>
                  <span className="font-black italic tracking-wider text-[7px] md:text-[10px] uppercase">{powerHourState.label}</span>
              </div>
              <CountdownTimer targetDate={powerHourState.nextStart} className="text-yellow-400 text-[8px] md:text-xs" />
          </div>
      </div>

      {/* COMPACT HERO SECTION */}
      {lossLeader && (
        <div className="bg-gradient-to-r from-gray-900 to-black text-white py-4 md:py-8 px-4 border-b-4 border-primary">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 text-center md:text-left">
                <div className="flex-1">
                    <div className="inline-block bg-primary text-white font-black text-[7px] md:text-xs px-2 py-0.5 rounded-full mb-2 md:mb-3 tracking-widest uppercase border border-white/10">
                        {formatPrice(lossLeader.currentBid)} {t('hero.start')}
                    </div>
                    <h1 className="text-2xl md:text-5xl font-display font-extrabold tracking-tighter mb-2 md:mb-3 leading-none uppercase italic">
                        {lossLeader.title}
                    </h1>
                    <p className="text-gray-400 text-[10px] md:text-base mb-3 md:mb-5 font-medium">
                        <span className="text-secondary animate-pulse font-black">{waitlistCount} {t('auction.joinWaitlist')}</span>
                    </p>
                    <div className="flex gap-2 justify-center md:justify-start">
                        <Link to={`/auction/${lossLeader.id}`} className="bg-white text-black px-6 py-2 rounded-xl font-black shadow-2xl text-[9px] md:text-sm uppercase tracking-widest transition-transform hover:scale-105">{t('home.feelingLucky')}</Link>
                        <Link to="/sell" state={{ mode: 'quick' }} className="bg-transparent text-white px-6 py-2 rounded-xl font-black border-2 border-white/20 text-[9px] md:text-sm uppercase tracking-widest transition-transform hover:bg-white/10">24H SATIŞ</Link>
                    </div>
                </div>
                <div className="w-full max-w-[120px] md:max-w-xs">
                    <div className="aspect-square bg-gray-900 rounded-[1rem] md:rounded-[2rem] overflow-hidden shadow-2xl border border-white/5">
                        <LazyImage src={lossLeader.imageUrl} alt={lossLeader.title} className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* TIGHTER UPCOMING DATES */}
      <div className="bg-slate-50 py-4 md:py-6 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-3 gap-2 md:gap-4">
                  {upcomingEventDates.map((date, idx) => {
                      const isToday = date.toDateString() === new Date().toDateString();
                      return (
                          <button key={idx} onClick={() => navigate('/categories')} className={`p-3 md:p-5 rounded-[1rem] md:rounded-[1.5rem] border-2 flex flex-col items-center justify-center transition-all bg-white hover:shadow-lg ${isToday ? 'border-emerald-500 ring-2 ring-emerald-50' : 'border-white shadow-sm'}`}>
                              <span className={`text-[6px] md:text-[8px] font-black uppercase tracking-widest mb-0.5 ${isToday ? 'text-emerald-600' : 'text-gray-400'}`}>
                                  {idx === 0 ? (isToday ? 'BUGÜN' : 'SIRADAKİ') : 'YAKLAŞAN'}
                              </span>
                              <h3 className="text-sm md:text-xl font-display font-black text-gray-900">
                                  {date.toLocaleDateString(language, { day: 'numeric', month: 'short' }).toUpperCase()}
                              </h3>
                              <p className="text-[6px] md:text-[10px] font-bold text-indigo-900/40 uppercase italic hidden sm:block">{date.toLocaleDateString(language, { weekday: 'long' })}</p>
                          </button>
                      );
                  })}
              </div>
          </div>
      </div>

      {/* LIVE AUCTION SLIDER */}
      <div className="bg-white py-6 md:py-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-end mb-4 md:mb-6">
              <h2 className="text-base md:text-2xl font-display font-black text-gray-900 uppercase tracking-tighter italic leading-none">
                 {liveAuctions.length > 0 ? t('home.liveNow') : `🌙 ${t('home.noLiveTitle')}`}
              </h2>
              <Link to="/categories" className="text-[8px] md:text-xs text-primary font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4">{t('home.viewLive')} →</Link>
            </div>
            
            {/* Horizontal Slider with Snap functionality */}
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-6 -mx-4 px-4 md:mx-0 md:px-0">
                {randomDisplayAuctions.length > 0 ? (
                    randomDisplayAuctions.map((auction) => (
                        <div key={auction.id} className="snap-start flex-shrink-0 w-[45vw] md:w-[22%]">
                            <AuctionCard item={auction} />
                        </div>
                    ))
                ) : (
                    <div className="w-full py-12 text-center text-gray-300 font-black uppercase text-xs italic bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                        Henüz aktif mezat bulunmuyor.
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* TIGHTER CATEGORY GRID */}
      <div className="bg-[#fcfdfe] py-6 md:py-10">
        <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-lg md:text-3xl font-display font-black text-gray-900 uppercase tracking-tighter italic leading-none mb-4 md:mb-6 text-center md:text-left">Mezat Programı</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
                {slots.map(slot => (
                    <button key={slot.id} onClick={() => navigate(`/categories?cat=${slot.category}`)} className={`rounded-lg md:rounded-xl p-2 md:p-4 flex flex-col items-center justify-center text-center transition-all bg-white border border-slate-100 shadow-sm hover:shadow-lg ${slot.status === 'live' ? 'ring-1 md:ring-2 ring-emerald-500/20 border-emerald-500' : ''}`}>
                        <div className={`text-[10px] md:text-lg font-display font-black mb-0.5 ${slot.status === 'live' ? 'text-primary' : 'text-slate-300'}`}>{slot.timeLabel}</div>
                        <div className={`text-[5px] md:text-[9px] font-black uppercase truncate w-full ${slot.status === 'live' ? 'text-slate-900' : 'text-slate-300'}`}>{(slot.categoryLabel as any)[language]}</div>
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
