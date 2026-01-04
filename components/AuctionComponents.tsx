
import React, { useEffect, useState, memo } from 'react';
import { AuctionItem, AuctionStatus, MarketPriceEstimate, CATEGORIES, ProductCondition, CategoryType } from '../types';
import { useApp } from '../context';
import { Link } from 'react-router-dom';
import { LazyImage } from './LazyImage';

export const CountdownTimer: React.FC<{ targetDate: Date, onEnd?: () => void, isExtended?: boolean, className?: string }> = ({ targetDate, onEnd, isExtended, className }) => {
  const { t } = useApp();
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;
      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft(null);
        if (onEnd) onEnd();
      } else {
        setTimeLeft({
          d: Math.floor(distance / (1000 * 60 * 60 * 24)),
          h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate, onEnd]);

  if (!timeLeft) return <span className="text-gray-500 font-black uppercase tracking-widest text-[8px] md:text-[10px]">SONA ERDİ</span>;
  
  const isUrgent = timeLeft.d === 0 && timeLeft.h === 0 && timeLeft.m < 60;

  return (
    <div className={`font-mono text-[10px] md:text-lg font-black flex gap-0.5 items-center ${className ? className : (isUrgent ? 'text-secondary animate-pulse' : 'text-primary')}`}>
      {timeLeft.d > 0 && <><span className="px-0.5">{String(timeLeft.d).padStart(2, '0')}</span>g</>}
      <span className="px-0.5">{String(timeLeft.h).padStart(2, '0')}</span>:
      <span className="px-0.5">{String(timeLeft.m).padStart(2, '0')}</span>:
      <span className="px-0.5">{String(timeLeft.s).padStart(2, '0')}</span>
    </div>
  );
};

export const PriceAnalyser: React.FC<{ currentBid: number, marketValue?: MarketPriceEstimate }> = ({ currentBid, marketValue }) => {
    const { t, formatPrice } = useApp();
    if (!marketValue) return null;

    const avgMarket = (marketValue.min + marketValue.max) / 2;
    let statusText = t('auction.analyser.steal');
    let dotPosition = "0%";
    let indicatorColor = "bg-green-500";
    let statusColorClass = "text-green-500";

    if (currentBid < marketValue.min) {
        statusText = t('auction.analyser.steal');
        dotPosition = "15%";
    } else if (currentBid >= marketValue.min && currentBid <= marketValue.max) {
        statusText = t('auction.analyser.fair');
        indicatorColor = "bg-yellow-400";
        statusColorClass = "text-yellow-600";
        dotPosition = "50%";
    } else {
        statusText = t('auction.analyser.premium');
        indicatorColor = "bg-red-500";
        statusColorClass = "text-red-500";
        dotPosition = "85%";
    }

    return (
        <div className="relative w-full bg-white rounded-xl md:rounded-[2rem] p-2 md:p-8 border border-gray-100 shadow-lg flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-1.5 md:mb-6">
                <h4 className="text-[7px] md:text-sm font-black text-gray-900 uppercase tracking-tighter flex items-center gap-1">⚖️ {t('auction.analyser.title')}</h4>
                <div className="text-[5px] md:text-[9px] font-bold text-gray-400 italic text-right max-w-[80px] md:max-w-[180px]">
                    {t('auction.analyser.source')}
                </div>
            </div>
            <div className="relative w-full h-1 md:h-3 bg-gray-100 rounded-full mb-2 md:mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 opacity-20 rounded-full"></div>
                <div className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 md:w-6 md:h-6 ${indicatorColor} rounded-full border md:border-4 border-white shadow-xl transition-all duration-1000 ease-out`} style={{ left: dotPosition, marginLeft: '-4px' }}></div>
            </div>
            <div className="text-center">
                <div className={`text-[8px] md:text-2xl font-black uppercase tracking-tighter ${statusColorClass} italic`}>{statusText}</div>
                <div className="text-[5px] md:text-[10px] text-gray-400 font-bold mt-0.5 md:mt-2 uppercase tracking-widest leading-none">{formatPrice(avgMarket)}</div>
            </div>
        </div>
    );
};

export const OverlayCountdown: React.FC<{ targetDate: Date }> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;
      if (distance < 0) { clearInterval(interval); setTimeLeft(null); }
      else { 
        setTimeLeft({ 
          d: Math.floor(distance / (1000 * 60 * 60 * 24)),
          h: Math.floor((distance % (1000*60*60*24)) / (1000*60*60)), 
          m: Math.floor((distance % (1000*60*60)) / (1000*60)), 
          s: Math.floor((distance % (1000*60)) / 1000) 
        }); 
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);
  if (!timeLeft) return null;
  return (
    <div className="bg-black/70 backdrop-blur-md border border-white/10 px-1 py-0.5 md:px-3 md:py-1.5 rounded md:rounded-xl font-mono font-black text-[6px] md:text-[10px] text-white shadow-xl flex items-center gap-1">
      <span>{timeLeft.d > 0 && `${timeLeft.d}d `}{String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}</span>
    </div>
  );
};

export const UrgentAuctionScroll: React.FC = () => {
    const { auctions, t, formatPrice } = useApp();
    const urgentItems = auctions.filter(a => a.status === AuctionStatus.ACTIVE);
    if (urgentItems.length === 0) return null;
    return (
        <div className="w-full py-2 md:py-6 border-t border-gray-100 mt-2 md:mt-6">
            <h3 className="text-[10px] md:text-xl font-display font-black text-gray-900 mb-2 md:mb-4 uppercase tracking-tighter flex items-center gap-1 italic">
                <span className="text-sm md:text-2xl">🔥</span> {t('home.urgentTitle') || 'FIRSATLAR'}
            </h3>
            <div className="flex gap-1.5 md:gap-4 overflow-x-auto no-scrollbar pb-2">
                {urgentItems.map(item => (
                    <Link key={item.id} to={`/auction/${item.id}`} className="flex-shrink-0 w-28 md:w-56 group bg-white rounded-lg md:rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all">
                        <div className="relative h-16 md:h-36 overflow-hidden">
                            <LazyImage src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute top-1 left-1 flex flex-col gap-1">
                                <span className="bg-red-600 text-white text-[4px] md:text-[7px] font-black px-1 py-0.5 rounded animate-pulse shadow-lg uppercase">CANLI</span>
                                <span className={`px-1 py-0.5 rounded text-[4px] md:text-[7px] font-black uppercase shadow-lg ${item.condition === ProductCondition.NEW ? 'bg-primary text-white' : 'bg-secondary text-white'}`}>{item.condition === ProductCondition.NEW ? 'YENİ' : '2.EL'}</span>
                            </div>
                        </div>
                        <div className="p-1 md:p-3">
                            <h4 className="font-black text-[7px] md:text-xs text-gray-900 line-clamp-1 mb-0.5 uppercase tracking-tight">
                                {item.title}
                            </h4>
                            <p className="text-[8px] md:text-sm font-black text-primary tracking-tighter">{formatPrice(item.currentBid)}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export const AuctionCard: React.FC<{ item: AuctionItem }> = memo(({ item }) => {
  const { t, language, formatPrice } = useApp();
  const categoryData = CATEGORIES.find(c => c.id === item.category);
  const categoryLabel = categoryData ? (categoryData.label as any)[language] : item.category;
  
  const cityName = item.location.split(',')[0];

  const now = new Date();
  const isPrebid = item.startsAt && now < item.startsAt;
  const isLive = item.status === AuctionStatus.ACTIVE && (!item.startsAt || now >= item.startsAt);

  return (
    <div className={`bg-white rounded-lg md:rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full group transition-all hover:shadow-md ${item.isLossLeader ? 'ring-1 md:ring-3 ring-indigo-100' : ''}`}>
        <div className="relative h-20 md:h-48 bg-gray-100 overflow-hidden">
            <LazyImage src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            
            <div className="absolute top-1 left-1 z-10 flex flex-col gap-1">
                {item.isLossLeader && (
                    <span className="bg-indigo-600 text-white text-[4px] md:text-[8px] font-black px-1 md:px-2 py-0.5 rounded shadow-lg uppercase tracking-wider">⚡ ÖZEL</span>
                )}
                <span className={`px-1 py-0.5 rounded text-[4px] md:text-[8px] font-black uppercase shadow-lg border-white/20 border ${item.condition === ProductCondition.NEW ? 'bg-primary text-white' : 'bg-secondary text-white'}`}>
                    {item.condition === ProductCondition.NEW ? t('common.new') : t('common.used')}
                </span>
            </div>
            
            <div className="absolute top-1 right-1 z-10">
                <div className="px-1 py-0.5 rounded bg-black/50 backdrop-blur-sm text-white text-[4px] md:text-[8px] font-black uppercase tracking-widest border border-white/5">
                    📍 {cityName}
                </div>
            </div>

            <div className="absolute bottom-1 left-1 z-10 flex flex-col gap-0.5">
                {isPrebid ? (
                    <div className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[5px] md:text-[8px] font-black uppercase tracking-widest shadow-md flex items-center gap-1">
                        🕒 {t('auction.prebid')}
                    </div>
                ) : isLive ? (
                    <div className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[5px] md:text-[8px] font-black uppercase tracking-widest shadow-md flex items-center gap-1">
                        <span className="w-1 h-1 bg-white rounded-full animate-ping"></span> CANLI
                    </div>
                ) : null}
            </div>
        </div>
        <div className="p-1 md:p-4 flex-grow flex flex-col">
            <div className="flex items-center justify-between mb-0.5 md:mb-1 overflow-hidden">
                <span className="text-[5px] md:text-[9px] font-black text-primary-600 uppercase tracking-widest opacity-70 italic truncate">{categoryLabel}</span>
            </div>
            
            <Link to={`/auction/${item.id}`} className="block">
                <h3 className="font-display font-bold text-[8px] md:text-sm text-gray-900 mb-1 md:mb-2 line-clamp-1 uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">
                    {item.title}
                </h3>
            </Link>
            
            <div className="mt-auto pt-1 md:pt-2 border-t border-gray-50 flex justify-between items-end">
                <p className="text-[10px] md:text-base font-black text-primary tracking-tighter leading-none">{formatPrice(item.currentBid)}</p>
                <div className="text-right flex flex-col items-end">
                    {isPrebid ? (
                         <span className="text-[7px] md:text-[9px] font-mono font-black text-amber-600">
                            {item.startsAt.toLocaleTimeString(language, {hour:'2-digit', minute:'2-digit'})}
                        </span>
                    ) : (
                        <CountdownTimer targetDate={item.endsAt} className="text-[10px] md:text-sm" />
                    )}
                </div>
            </div>
        </div>
    </div>
  );
});
