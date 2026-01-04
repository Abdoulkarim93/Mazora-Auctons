import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context.tsx';
import { AuctionItem, AuctionStatus, ProductCondition, FEE_STRUCTURE, CategoryType } from '../types.ts';
import { CountdownTimer, PriceAnalyser, OverlayCountdown, UrgentAuctionScroll, AuctionCard } from '../components/AuctionComponents.tsx';
import { LazyImage } from '../components/LazyImage.tsx';

const QuickSignupModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess: (name: string, phone: string, address: string, username: string, password?: string) => void }> = ({ isOpen, onClose, onSuccess }) => {
    const { t } = useApp();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('+90 ');
    const [address, setAddress] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim().length > 2 && phone.trim().length > 5 && address.trim().length > 2 && username.trim().length > 2 && password.length >= 3) {
            onSuccess(name, phone, address, username, password);
        } else {
            alert("Lütfen tüm alanları (ID ve Şifre dahil) eksiksiz dolduron.");
        }
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 md:p-10 border-t-8 border-primary relative overflow-y-auto max-h-[95vh] no-scrollbar">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors">✕</button>
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">⚡</div>
                    <h3 className="text-2xl font-display font-black text-gray-900 uppercase tracking-tighter italic">HIZLI KAYIT</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Saniyeler içinde teklif verin</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Kişisel Bilgiler</label>
                        <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="Ad Soyad" />
                        <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="Telefon" />
                        <textarea required value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="Teslimat Adresi (Şehir/İlçe)" rows={2} />
                    </div>
                    
                    <div className="space-y-1 pt-2 border-t border-slate-100">
                        <label className="text-[9px] font-black text-primary uppercase ml-1">Giriş Bilgilerin (Mazora ID)</label>
                        <input required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-blue-50 border-none rounded-xl p-4 font-black text-sm focus:ring-2 focus:ring-primary outline-none placeholder-blue-300" placeholder="Kullanıcı ID seçin (Örn: alici42)" />
                        <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-blue-50 border-none rounded-xl p-4 font-black text-sm focus:ring-2 focus:ring-primary outline-none placeholder-blue-300" placeholder="Bir şifre belirleyin" />
                    </div>

                    <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                        <p className="text-[9px] text-indigo-700 font-bold leading-relaxed italic">
                            * Bu <b>ID</b> ve <b>Şifre</b> ile her zaman profilinize giriş yapıp tekliflerinizi takip edebilirsiniz.
                        </p>
                    </div>

                    <button type="submit" className="w-full bg-primary text-white font-black py-4 rounded-xl shadow-xl uppercase tracking-widest active:scale-95 text-xs transition-transform">KAYDI TAMAMLE VE TEKLİF VER 🚀</button>
                </form>
            </div>
        </div>
    );
};

const BidSuccessOverlay: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 1000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in pointer-events-none">
            <div className="relative z-10 flex flex-col items-center animate-premium-pop-in">
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden shadow-2xl border-4 border-white/20 bg-primary/20 mb-8 flex items-center justify-center">
                    <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdnd2ZGFidXgxejM1NWR5NmZ1NHdyY2g0Y2M0Z2NraXo4cm50YW0wZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3QnZy8zNjk3bW5qS3E0eWZZWll0eS9naXBoeS5naWY=" alt="Hammer" className="w-[120%] h-[120%] object-cover mix-blend-screen" />
                </div>
                <h2 className="text-white text-3xl md:text-6xl font-display font-black uppercase tracking-tighter italic drop-shadow-2xl bg-clip-text text-transparent bg-gradient-to-b from-white to-yellow-500">TEKLİF ALINDI! 🔨</h2>
            </div>
        </div>
    );
};

const FullGalleryModal: React.FC<{ 
    media: {type: 'image' | 'video', url: string}[]; 
    initialIdx: number; 
    isOpen: boolean; 
    onClose: () => void 
}> = ({ media, initialIdx, isOpen, onClose }) => {
    const [currentIdx, setCurrentIdx] = useState(initialIdx);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const minSwipeDistance = 50;

    useEffect(() => {
        setCurrentIdx(initialIdx);
    }, [initialIdx]);

    if (!isOpen) return null;

    const next = () => setCurrentIdx((prev) => (prev + 1) % media.length);
    const prev = () => setCurrentIdx((prev) => (prev - 1 + media.length) % media.length);

    const onTouchStartHandler = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMoveHandler = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEndHandler = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            next();
        } else if (isRightSwipe) {
            prev();
        }
    };

    return (
        <div 
            className="fixed inset-0 z-[1000] bg-black flex items-center justify-center animate-fade-in overflow-hidden touch-none"
            onTouchStart={onTouchStartHandler}
            onTouchMove={onTouchMoveHandler}
            onTouchEnd={onTouchEndHandler}
        >
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-[1010] bg-gradient-to-b from-black/60 to-transparent">
                <div className="text-white font-black text-xs uppercase tracking-widest bg-black/40 px-4 py-2 rounded-full">
                    {currentIdx + 1} / {media.length}
                </div>
                <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-md">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div className="w-full h-full flex items-center justify-center relative select-none">
                {media[currentIdx].type === 'image' ? (
                    <img 
                        src={media[currentIdx].url} 
                        className="max-w-full max-h-full object-contain animate-premium-pop-in pointer-events-none" 
                        alt="Big View" 
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <video 
                            src={media[currentIdx].url} 
                            controls 
                            autoPlay 
                            className="max-w-full max-h-full animate-premium-pop-in"
                        />
                    </div>
                )}

                <button 
                    onClick={(e) => { e.stopPropagation(); prev(); }} 
                    className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 hover:bg-white/20 text-white rounded-full items-center justify-center transition-all backdrop-blur-sm"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); next(); }} 
                    className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 hover:bg-white/20 text-white rounded-full items-center justify-center transition-all backdrop-blur-sm"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>

            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto no-scrollbar pointer-events-auto">
                {media.map((m, idx) => (
                    <button 
                        key={idx} 
                        onClick={(e) => { e.stopPropagation(); setCurrentIdx(idx); }}
                        className={`w-12 h-12 rounded-lg border-2 flex-shrink-0 transition-all ${idx === currentIdx ? 'border-primary scale-110 shadow-lg' : 'border-white/20 opacity-50'}`}
                    >
                        {m.type === 'image' ? (
                            <img src={m.url} className="w-full h-full object-cover rounded-md pointer-events-none" />
                        ) : (
                            <div className="w-full h-full bg-slate-800 rounded-md flex items-center justify-center text-[10px]">🎥</div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export const AuctionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, language, user, quickRegister, maskName, auctions, placeBid, buyNow, formatPrice, showToast, allUsers } = useApp();
    
    const [auction, setAuction] = useState<AuctionItem | null>(null);
    const [activeMediaIdx, setActiveMediaIdx] = useState(0);
    const [bidAmount, setBidAmount] = useState<number>(0);
    const [isPriceFlashing, setIsPriceFlashing] = useState(false);
    const [showBidOverlay, setShowBidOverlay] = useState(false);
    const [showQuickSignup, setShowQuickSignup] = useState(false);
    const [bidAgreement, setBidAgreement] = useState(false);
    const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [isFullGalleryOpen, setIsFullGalleryOpen] = useState(false);
    
    const autoplayTimerRef = useRef<any | null>(null);
    const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        if (id) {
            const data = auctions.find(a => a.id === id);
            if (data) {
                setAuction(data);
                setBidAmount((data.currentBid || 0) + FEE_STRUCTURE.MIN_BID_INCREMENT_TL);
            }
        }
    }, [id, auctions]);

    const allMedia = useMemo(() => {
        if (!auction) return [];
        const gallery = (auction.images && auction.images.length > 0 ? auction.images : [auction.imageUrl]).map(url => ({ type: 'image' as const, url }));
        const videos = auction.videoUrl ? [{ type: 'video' as const, url: auction.videoUrl }] : [];
        return [...gallery, ...videos];
    }, [auction]);

    const sellerInfo = useMemo(() => {
        if (!auction) return null;
        return allUsers.find(u => u.id === auction.sellerId);
    }, [auction, allUsers]);

    const nextSlide = () => {
        setActiveMediaIdx(prev => (prev + 1) % allMedia.length);
    };

    useEffect(() => {
        if (allMedia.length <= 1 || isFullGalleryOpen) return;
        if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current);

        const currentMedia = allMedia[activeMediaIdx];
        
        if (currentMedia.type === 'image') {
            autoplayTimerRef.current = setTimeout(nextSlide, 4000); 
        }
        if (currentMedia.type === 'video') {
            autoplayTimerRef.current = setTimeout(nextSlide, 20000); 
        }

        return () => { if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current); };
    }, [activeMediaIdx, allMedia, isFullGalleryOpen]);

    useEffect(() => {
        const currentVideo = videoRefs.current.get(activeMediaIdx);
        if (currentVideo && !isFullGalleryOpen) {
            currentVideo.currentTime = 0;
            currentVideo.muted = isMuted;
            currentVideo.play()
                .then(() => setIsVideoPlaying(true))
                .catch(e => {
                    console.log("Autoplay blocked", e);
                    setIsVideoPlaying(false);
                });
        }
        videoRefs.current.forEach((vid, idx) => {
            if (idx !== activeMediaIdx) vid.pause();
        });
    }, [activeMediaIdx, isMuted, isFullGalleryOpen]);

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMuted(!isMuted);
    };

    const handleManualPlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        const currentVideo = videoRefs.current.get(activeMediaIdx);
        if (currentVideo) {
            currentVideo.play().then(() => {
                setIsVideoPlaying(true);
                setIsMuted(false);
            });
        }
    };

    const breakdown = useMemo(() => {
        const isVatExempt = auction?.condition === ProductCondition.USED || auction?.isLossLeader;
        const vatRate = isVatExempt ? 0 : 0.20; 
        const auctionCostRate = FEE_STRUCTURE.BUYER_MAZORA_FEE_PERCENT; 
        
        const bidValue = bidAmount || 0;
        const vatOnBid = bidValue * vatRate;
        const auctionCosts = bidValue * auctionCostRate;
        const vatOnCosts = auctionCosts * 0.20; 
        const total = bidValue + vatOnBid + auctionCosts + vatOnCosts;

        return { bidValue, vatOnBid, auctionCosts, vatOnCosts, total, vatRate, auctionCostRate, isVatExempt };
    }, [bidAmount, auction?.condition, auction?.isLossLeader]);

    if (!auction) return <div className="p-20 text-center font-black text-gray-300 animate-pulse uppercase tracking-[0.4em]">MEZAT VERİLERİ ÇEKİLİYOR...</div>;

    const isSellerOfThis = user && auction.sellerId === user.id;
    const now = new Date();
    const isEnded = auction.status === 'ended' || now > auction.endsAt;
    const isPrebid = auction.startsAt && now < auction.startsAt;
    
    const is24H = auction.category === CategoryType.DIRECT_24H;
    const isSaleGuaranteed = is24H || auction.isLossLeader;
    const isReserveMet = auction.currentBid >= auction.reservePrice || isSaleGuaranteed;
    const reserveProgress = Math.min(100, (auction.currentBid / (auction.reservePrice || 1)) * 100);

    const handlePlaceBid = () => {
        if (isAdmin) { showToast("Yönetici hesapları mezatlara katılamaz.", "error"); return; }
        if (!user) { setShowQuickSignup(true); return; }
        if (isSellerOfThis) { showToast("Kendi ilanınıza teklif veremezsiniz!", "error"); return; }
        
        if (is24H && !bidAgreement) {
            showToast("Lütfen teklifin bağlayıcı olduğunu onaylayın.", "warning");
            return;
        }

        if (bidAmount < (auction.currentBid + FEE_STRUCTURE.MIN_BID_INCREMENT_TL)) {
            showToast(`Minimum artış ${formatPrice(FEE_STRUCTURE.MIN_BID_INCREMENT_TL)}'dir.`, "warning");
            return;
        }
        if (placeBid(auction.id, bidAmount)) {
            setIsPriceFlashing(true);
            setShowBidOverlay(true);
            setBidAgreement(false); 
            setTimeout(() => setIsPriceFlashing(false), 1000);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-2 md:py-4 pb-20 animate-fade-in text-left">
            {showBidOverlay && <BidSuccessOverlay onComplete={() => setShowBidOverlay(false)} />}
            <QuickSignupModal isOpen={showQuickSignup} onClose={() => setShowQuickSignup(false)} onSuccess={(n, p, a, u, pass) => { quickRegister(n, p, a, u, pass, 'buyer'); setShowQuickSignup(false); }} />
            
            <FullGalleryModal 
                isOpen={isFullGalleryOpen} 
                media={allMedia} 
                initialIdx={activeMediaIdx} 
                onClose={() => setIsFullGalleryOpen(false)} 
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
                <div className="lg:col-span-7 space-y-3">
                    <div className="relative rounded-3xl overflow-hidden bg-gray-950 shadow-2xl border border-gray-100 group">
                        <div className="absolute inset-0 flex items-center justify-center z-30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                             <div className="bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border border-white/20">BÜYÜTMEK İÇİN TIKLA 🔍</div>
                        </div>

                        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                             {!isEnded && !isPrebid && <OverlayCountdown targetDate={auction.endsAt} />}
                             <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-md md:rounded-lg text-[8px] md:text-[10px] font-black shadow-lg uppercase tracking-widest ${auction.condition === ProductCondition.NEW ? 'bg-primary text-white' : 'bg-secondary text-white'}`}>
                                {auction.condition === ProductCondition.NEW ? 'SIFIR' : 'İKİNCİ EL'}
                            </span>
                             {isPrebid && (
                                <div className="bg-amber-500 text-white px-3 py-1 rounded-xl text-[10px] font-black shadow-xl animate-pulse uppercase">
                                    🕒 {t('auction.prebid')}
                                </div>
                             )}
                        </div>
                        <div className="absolute top-4 right-4 z-20">
                             <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1 md:px-4 md:py-2 rounded-full font-black text-[8px] md:text-[10px] uppercase tracking-widest border border-white/10">📍 {auction.location}</div>
                        </div>

                        <div 
                            className="relative aspect-video md:aspect-square w-full overflow-hidden cursor-zoom-in"
                            onClick={() => setIsFullGalleryOpen(true)}
                        >
                            <div 
                                className="flex h-full w-full transition-transform duration-500 ease-out"
                                style={{ transform: `translateX(-${activeMediaIdx * 100}%)` }}
                            >
                                {allMedia.map((media, idx) => (
                                    <div key={`${idx}-${media.url.substring(0, 20)}`} className="w-full h-full flex-shrink-0 relative bg-black flex items-center justify-center">
                                        {media.type === 'image' ? (
                                            <img src={media.url} alt={`${auction.title} - ${idx}`} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full relative">
                                                <video 
                                                    ref={(el) => {
                                                        if (el) {
                                                            videoRefs.current.set(idx, el);
                                                        } else {
                                                            videoRefs.current.delete(idx);
                                                        }
                                                    }}
                                                    src={media.url} 
                                                    className="w-full h-full object-contain" 
                                                    muted={isMuted}
                                                    autoPlay={activeMediaIdx === idx}
                                                    loop
                                                    playsInline 
                                                    preload="auto"
                                                    onEnded={nextSlide}
                                                />
                                                {activeMediaIdx === idx && !isVideoPlaying && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-10">
                                                        <button 
                                                            onClick={handleManualPlay}
                                                            className="w-20 h-20 bg-primary/80 text-white rounded-full flex items-center justify-center text-3xl shadow-2xl hover:scale-110 transition-transform animate-pulse"
                                                        >
                                                            ▶️
                                                        </button>
                                                    </div>
                                                )}
                                                {activeMediaIdx === idx && (
                                                    <button 
                                                        onClick={toggleMute}
                                                        className="absolute bottom-6 right-6 z-30 bg-black/60 text-white p-3 rounded-xl backdrop-blur-md border border-white/10 hover:bg-black transition-colors"
                                                    >
                                                        {isMuted ? '🔇' : '🔊'}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="absolute bottom-4 left-6 right-6 z-20 flex gap-1 px-4 justify-center">
                            {allMedia.map((_, i) => (
                                <div key={i} className="h-0.5 flex-1 max-w-[40px] bg-white/20 rounded-full overflow-hidden">
                                    {i === activeMediaIdx && (
                                        <div key={`progress-${activeMediaIdx}`} className={`h-full bg-primary origin-left ${allMedia[i].type === 'image' ? 'animate-media-progress' : ''}`}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                        {allMedia.map((media, idx) => (
                            <button key={idx} onClick={() => setActiveMediaIdx(idx)} className={`w-12 h-12 md:w-20 md:h-20 rounded-xl flex-shrink-0 overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 relative ${activeMediaIdx === idx ? 'border-primary shadow-xl scale-105' : 'border-white opacity-60 hover:opacity-100'}`}>
                                {media.type === 'image' ? <img src={media.url} className="w-full h-full object-cover" /> : (
                                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                        <video src={media.url} className="w-full h-full object-cover opacity-50" muted playsInline />
                                        <span className="absolute text-xl">🎥</span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm space-y-4 text-left">
                         <div className="flex items-center gap-3">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">DETAYLI ÜRÜN AÇIKLAMASI</h4>
                            <div className="h-[1px] flex-1 bg-gray-50"></div>
                         </div>
                         <p className="text-sm text-gray-600 font-medium leading-relaxed italic whitespace-pre-wrap">{auction.description}</p>
                    </div>

                    <PriceAnalyser currentBid={auction.currentBid} marketValue={auction.marketValue} />
                </div>

                <div className="lg:col-span-5 flex flex-col gap-3 md:gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[8px] md:text-[9px] font-black text-primary uppercase tracking-widest">
                                {is24H ? '⚡ 24H HIZLI SATIŞ' : auction.category}
                            </span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest">{auction.location}</span>
                        </div>
                        <h1 className="text-xl md:text-3xl font-display font-black text-gray-900 leading-tight uppercase italic tracking-tighter">
                            {auction.title}
                        </h1>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gray-950 text-white px-6 py-2 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span className="opacity-80 uppercase">
                                {isEnded ? 'SONA ERDİ' : isPrebid ? t('home.upcomingEvent').toUpperCase() : 'MEZAT SONA ERİYOR'}
                            </span>
                            {isPrebid ? (
                                <span className="text-amber-400">{auction.startsAt.toLocaleString()}</span>
                            ) : (
                                <CountdownTimer targetDate={auction.endsAt} className="text-yellow-400 text-sm md:text-base" />
                            )}
                        </div>
                        <div className="p-6 md:p-10 text-center bg-gray-50/50 border-b border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest uppercase">
                                {isPrebid ? t('auction.prebid') : t('auction.currentBid')}
                            </p>
                            <div className={`text-4xl md:text-6xl font-black transition-all duration-500 ${isPriceFlashing ? 'text-green-500 scale-105' : 'text-gray-900'}`}>{formatPrice(auction.currentBid)}</div>
                            
                            <div className="mt-6 px-4">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">REZERV</span>
                                    <span className={`text-[8px] font-black uppercase ${isReserveMet ? 'text-emerald-600' : 'text-orange-500'}`}>
                                        {isReserveMet ? 'LİMİT GEÇİLDİ ✅' : `%${Math.round(reserveProgress)}`}
                                    </span>
                                </div>
                                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                    <div 
                                        className={`h-full transition-all duration-1000 ${isReserveMet ? 'bg-emerald-500' : 'bg-orange-500'}`} 
                                        style={{ width: `${reserveProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            {!isEnded ? (
                                <>
                                    {!user && (
                                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-center mb-2">
                                            <p className="text-[11px] font-bold text-blue-800 leading-relaxed italic mb-3">
                                                Teklif verebilmek için profilinizi tamamlamanız gerekmektedir.
                                            </p>
                                            <button onClick={() => setShowQuickSignup(true)} className="text-xs font-black text-primary hover:underline uppercase tracking-widest">
                                                BİLGİLERİ DOĞRULA &gt;&gt;
                                            </button>
                                        </div>
                                    )}

                                    {is24H && (
                                        <div className="mb-4 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                                            <label className="flex items-start gap-3 cursor-pointer">
                                                <input type="checkbox" checked={bidAgreement} onChange={e => setBidAgreement(e.target.checked)} className="mt-1 w-5 h-5 rounded border-indigo-300 text-indigo-600" />
                                                <span className="text-[9px] font-black text-indigo-900 uppercase italic leading-tight">
                                                    TEKLİFİMİN YASAL BİR TAAHHÜT OLDUĞUNU VE KAZANMAM DURUMUNDA ÜRÜNÜ TESLİMATTA SATIN ALMAYI KABUL EDİYORUM. 🛡️
                                                </span>
                                            </label>
                                        </div>
                                    )}

                                    <div className="border-t border-gray-50 pt-2">
                                        <button 
                                            onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                                            className="w-full flex items-center justify-between py-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest group"
                                        >
                                            <span>{showPriceBreakdown ? 'Fiyat detaylarını gizle' : 'Fiyat detaylarını göster'}</span>
                                            <svg className={`w-4 h-4 transition-transform ${showPriceBreakdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        </button>
                                        
                                        {showPriceBreakdown && (
                                            <div className="mt-2 space-y-2 border-b border-gray-50 pb-4 animate-fade-in">
                                                <div className="flex justify-between items-center text-[11px]">
                                                    <span className="text-gray-400 font-bold uppercase tracking-tight">Teklif Bedeli</span>
                                                    <span className="font-black text-gray-700">{formatPrice(breakdown.bidValue)}</span>
                                                </div>
                                                {breakdown.vatOnBid > 0 && (
                                                    <div className="flex justify-between items-center text-[11px]">
                                                        <span className="text-gray-400 font-bold uppercase tracking-tight">KDV (20%)</span>
                                                        <span className="font-black text-gray-700">{formatPrice(breakdown.vatOnBid)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center text-[11px]">
                                                    <span className="text-gray-400 font-bold uppercase tracking-tight">Mezat Masrafları (5%)</span>
                                                    <span className="font-black text-gray-700">{formatPrice(breakdown.auctionCosts)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[11px]">
                                                    <span className="text-gray-400 font-bold uppercase tracking-tight">Masraf Üzerinden KDV (20%)</span>
                                                    <span className="font-black text-gray-700">{formatPrice(breakdown.vatOnCosts)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[12px] pt-1 border-t border-gray-50">
                                                    <span className="text-gray-900 font-black uppercase tracking-widest">Toplam Tutar</span>
                                                    <span className="font-black text-indigo-900 text-lg">{formatPrice(breakdown.total)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="w-1/3 relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm">₺</span>
                                            <input type="number" value={bidAmount} onChange={e => setBidAmount(parseInt(e.target.value))} className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl pl-6 pr-2 py-4 font-black text-xl text-center focus:ring-4 focus:ring-primary/10 outline-none" />
                                        </div>
                                        <button onClick={handlePlaceBid} className={`flex-1 font-black py-4 rounded-xl text-sm shadow-xl uppercase tracking-widest transition-all active:scale-95 ${isSellerOfThis ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-800'}`}>
                                            {isPrebid ? `✍️ ${t('auction.prebid')}` : `🔨 ${t('auction.placeBid')}`}
                                        </button>
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-[8px] font-bold text-blue-900 italic text-center leading-tight">
                                        * Mezat kazananı ve satıcı, %5 komisyon ve kargo ücretini fiziki teslimat anında temsilciye öder.
                                    </div>
                                </>
                            ) : (
                                <div className="bg-gray-100 text-gray-400 font-black py-4 rounded-xl text-center uppercase tracking-widest text-xs">BU MEZAT SONA ERDİ</div>
                            )}
                        </div>
                    </div>

                    {sellerInfo && (
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center justify-between group hover:border-primary transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <LazyImage src={sellerInfo.avatarUrl} alt={sellerInfo.name} className="w-10 h-10 md:w-14 md:h-14 rounded-xl object-cover border-2 border-gray-50" />
                                    {(sellerInfo.isVerified || sellerInfo.sellerTier === 'onayli') && (
                                        <span className="absolute -top-1 -right-1 bg-emerald-500 text-white w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm text-[8px]" title="Verified Seller">
                                            ✓
                                        </span>
                                    )}
                                </div>
                                <div className="text-left">
                                    <div className="flex items-center gap-1.5">
                                        <h4 className="font-black text-gray-900 uppercase text-xs italic truncate max-w-[120px] md:max-w-none">{sellerInfo.name}</h4>
                                        {(sellerInfo.isVerified || sellerInfo.sellerTier === 'onayli') && (
                                            <span className="bg-emerald-500 text-white text-[6px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest shadow-sm">ONAYLI ✓</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`bg-indigo-50 text-indigo-700 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase`}>%{sellerInfo.reputationScore} GÜVEN</span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                            {sellerInfo.isStore ? 'Mağaza' : 'Bireysel'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Link to="/verified-sellers" className="bg-gray-50 group-hover:bg-primary group-hover:text-white p-2 rounded-lg transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </Link>
                        </div>
                    )}
                    
                    <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center font-black text-[8px] uppercase tracking-widest text-gray-400">
                            <span>SON 5 TEKLİF</span>
                            <span className="text-primary/60 uppercase">{isPrebid ? t('auction.prebid') : 'CANLI TAKİP'}</span>
                        </div>
                        <div className="p-3 max-h-40 overflow-y-auto no-scrollbar space-y-2">
                             {(auction.bids || []).slice(0, 5).map((bid, i) => (
                                 <div key={bid.id} className={`flex justify-between items-center p-2 rounded-lg border ${i === 0 ? 'bg-primary/5 border-primary/20 shadow-sm' : 'bg-white border-gray-50'}`}>
                                     <div className="flex items-center gap-2">
                                         <span className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-primary animate-ping' : 'bg-gray-300'}`}></span>
                                         <p className="text-[10px] font-black text-gray-900 uppercase italic">{maskName(bid.userName)}</p>
                                     </div>
                                     <p className={`text-[10px] font-black ${i === 0 ? 'text-primary' : 'text-gray-700'}`}>{formatPrice(bid.amount)}</p>
                                 </div>
                             ))}
                             {(!auction.bids || auction.bids.length === 0) && (
                                 <div className="py-10 text-center text-gray-400 font-bold italic text-[8px] uppercase tracking-widest opacity-50">Henüz teklif yok.</div>
                             )}
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm space-y-4 text-left">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">YASAL BİLGİLENDİRME</h4>
                        <div className="space-y-4">
                            <div className="flex gap-3 items-start">
                                <span className="text-lg">🚫</span>
                                <div className="flex-1">
                                    <p className="text-[10px] md:text-xs font-bold text-gray-700 leading-relaxed uppercase tracking-tight">Cayma hakkı bulunmamaktadır. <Link to="/help" className="text-primary font-black hover:underline">Daha fazla bilgi.</Link></p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <span className="text-lg">⚖️</span>
                                <div className="flex-1">
                                    <p className="text-[10px] md:text-xs font-bold text-gray-500 leading-relaxed italic">Mazora satıcı değil, üçüncü şahıslar adına profesyonel aracılık yapan bir mezat platformudur.</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <span className="text-lg">📜</span>
                                <div className="flex-1">
                                    <p className="text-[10px] md:text-xs font-bold text-gray-500 leading-relaxed italic">Bu ürüne teklif vererek <Link to="/rules" className="text-primary font-black hover:underline">Mazora Mezat ve Kullanım Koşullarını</Link> kabul etmiş sayılırsınız.</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <span className="text-lg">🛡️</span>
                                <div className="flex-1">
                                    <p className="text-[10px] md:text-xs font-bold text-indigo-700 leading-relaxed uppercase tracking-tight font-black">BU MEZAT MAZORA MANAGED TRADE GÜVENCESİ VE PLATFORM DENETİMİ ALTINDADIR.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <UrgentAuctionScroll />
        </div>
    );
};