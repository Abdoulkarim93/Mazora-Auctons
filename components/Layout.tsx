
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { Language, CATEGORIES, ToastType, CategoryType, AuctionItem } from '../types';
import { ReferralPopup } from './ReferralPopup';
import { identifyItemFromImage } from '../services/geminiService';
import { Logo } from './Logo';
import { LazyImage } from './LazyImage';

const ToastContainer = () => {
    const { toasts } = useApp();
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            {toasts.map(toast => {
                const bgColors: Record<ToastType, string> = {
                    success: 'bg-green-600',
                    error: 'bg-red-600',
                    info: 'bg-blue-600',
                    warning: 'bg-orange-500'
                };
                return (
                    <div key={toast.id} className={`${bgColors[toast.type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in-down pointer-events-auto`}>
                        <span>{toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                        <span className="font-bold text-sm">{toast.message}</span>
                    </div>
                );
            })}
        </div>
    );
};

// Mobile Bottom Nav - Optimized for Easy Switch between Home and Admin
const MobileBottomNav = () => {
    const location = useLocation();
    const { t, user } = useApp();
    
    // Hide on complex flow pages if needed
    if (location.pathname.startsWith('/auction/')) return null;

    const isActive = (path: string) => location.pathname === path ? "text-primary-900" : "text-gray-400";
    const isAdminRoute = location.pathname.startsWith('/admin');

    // If on an Admin Page, don't show the standard marketplace mobile nav
    if (isAdminRoute) return null;

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 z-[400] pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            <div className="flex justify-around items-center h-16">
                <Link to="/" className={`flex flex-col items-center justify-center w-full h-full transition-all active:scale-95 ${isActive('/')}`}>
                    <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    <span className="text-[9px] font-black uppercase tracking-tighter">{t('nav.home')}</span>
                </Link>
                <Link to="/categories" className={`flex flex-col items-center justify-center w-full h-full transition-all active:scale-95 ${isActive('/categories')}`}>
                    <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" /></svg>
                    <span className="text-[9px] font-black uppercase tracking-tighter">{t('nav.categories')}</span>
                </Link>
                
                {user?.role === 'admin' ? (
                   <Link to="/admin/dashboard" className={`flex flex-col items-center justify-center w-full h-full relative -top-8 transition-all active:scale-90 group`}>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-[0_10px_40px_rgba(0,0,0,0.4)] border-[5px] border-white ring-2 bg-slate-950 ring-slate-500/20`}>
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-2xl animate-pulse group-hover:scale-125 transition-transform">⚙️</span>
                            </div>
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-tighter mt-1 italic drop-shadow-sm flex items-center gap-1 text-slate-950`}>
                            PRO PANEL <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        </span>
                    </Link>
                ) : (
                    <Link to="/sell" className="flex flex-col items-center justify-center w-full h-full relative -top-6 transition-all active:scale-90">
                        <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-white">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-tighter text-secondary-600 mt-1">{t('nav.sell')}</span>
                    </Link>
                )}

                <Link to="/requests" className={`flex flex-col items-center justify-center w-full h-full transition-all active:scale-95 ${isActive('/requests')}`}>
                    <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                    <span className="text-[9px] font-black uppercase tracking-tighter">TALEP</span>
                </Link>
                <Link to="/profile" className={`flex flex-col items-center justify-center w-full h-full transition-all active:scale-95 ${isActive('/profile')}`}>
                    <svg className="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <span className="text-[9px] font-black uppercase tracking-tighter">{t('nav.profile')}</span>
                </Link>
            </div>
        </div>
    );
};

interface LayoutProps {
    children?: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { language, setLanguage, t, user, logout, showToast, auctions, formatPrice } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const fadeTimeoutRef = useRef<any>(null);
  
  // Vision AI State
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [identifiedItem, setIdentifiedItem] = useState<any | null>(null);

  const isAdminRoute = location.pathname.startsWith('/admin');

  // Interactive structured suggestions
  const suggestions = useMemo(() => {
    const flashDeals = auctions.filter(a => a.category === CategoryType.DIRECT_24H).slice(0, 3);
    
    if (searchTerm.trim().length > 0) {
      const filtered = auctions.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 8);
      
      return {
        flash: flashDeals,
        main: filtered
      };
    }
    
    const recommended = auctions.filter(a => a.isBoosted || a.isLossLeader).slice(0, 5);
    return {
      flash: flashDeals,
      main: recommended
    };
  }, [searchTerm, auctions]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Use the children directly if on admin route - Layout internal elements handled in AdminPanel
  if (isAdminRoute) {
    return (
        <div className="min-h-screen bg-gray-100 text-slate-900 flex flex-col">
            <main className="flex-grow">
                {children}
            </main>
        </div>
    );
  }

  const handleSearch = (e: React.FormEvent | string) => {
      if (typeof e !== 'string') e.preventDefault();
      const query = typeof e === 'string' ? e : searchTerm;
      if(query.trim()) {
          setShowSuggestions(false);
          navigate(`/categories?q=${encodeURIComponent(query)}`);
      }
  };

  const handleVoiceSearch = () => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
          showToast("Voice search not supported", "error");
          return;
      }
      setIsVoiceListening(true);
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'tr' ? 'tr-TR' : 'en-US';
      recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setSearchTerm(transcript);
          setIsVoiceListening(false);
          handleSearch(transcript);
      };
      recognition.onend = () => setIsVoiceListening(false);
      recognition.start();
  };

  const handleCameraClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setAnalyzingImage(true);
          try {
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = async () => {
                  const base64 = (reader.result as string).split(',')[1];
                  const result = await identifyItemFromImage(base64);
                  if (result) setIdentifiedItem({ ...result, imagePreview: reader.result as string });
                  else showToast("Could not identify item", "error");
                  setAnalyzingImage(false);
              };
          } catch (err) {
              setAnalyzingImage(false);
              showToast("Error processing image", "error");
          }
      }
  };

  const handleMouseEnterContainer = () => {
    if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
    }
  };

  const handleFocusSearch = () => {
    setShowSuggestions(true);
  };

  const handleMouseLeaveContainer = () => {
    if (showSuggestions) {
        fadeTimeoutRef.current = setTimeout(() => {
            setShowSuggestions(false);
        }, 500);
    }
  };

  const unreadNotifications = user?.notifications?.filter(n => !n.read) || [];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-neutral-bg text-slate-900">
      <ReferralPopup />
      <ToastContainer />

      {/* Ribbon */}
      <div className="bg-primary text-white text-[9px] md:text-xs py-2 md:py-1.5 px-4 font-black flex flex-col md:flex-row md:justify-between items-center tracking-widest uppercase relative z-[60] gap-1.5 md:gap-0">
        <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_#4ade80]"></span>
            <span className="leading-none">{t('topbar.schedule')}</span>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
            <Link to="/escrow" className="hover:text-secondary transition-colors underline underline-offset-4 decoration-white/20 flex items-center gap-1">
                <span>🛡️</span> {t('topbar.escrow')}
            </Link>
            <span className="flex items-center gap-1">✅ <span className="hidden sm:inline">{t('topbar.verified')}</span><span className="sm:hidden">ONAYLI</span></span>
        </div>
      </div>

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-stretch py-3 md:h-20 gap-3 md:gap-8">
            
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center group shrink-0">
                <Logo className="h-9 w-9 md:h-12 md:w-12 transition-transform group-hover:scale-105" linked={false} />
                <span className="text-xl md:text-2xl font-display font-black text-primary tracking-tighter ml-2 italic uppercase">MAZORA</span>
              </Link>

              <div className="flex md:hidden items-center gap-3">
                 {user?.role === 'admin' && (
                    <Link to="/admin/dashboard" className="text-[10px] font-black text-white bg-slate-950 px-3 py-2 rounded-xl uppercase tracking-widest animate-pulse shadow-lg border border-white/20">PRO PANEL</Link>
                 )}
                 {user ? (
                    <Link to="/profile" className="relative">
                        <LazyImage src={user.avatarUrl} alt="User" className="h-9 w-9 rounded-xl border-2 border-primary/10 object-cover shadow-sm" />
                        {unreadNotifications.length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>}
                    </Link>
                 ) : (
                    <Link to="/login" className="text-[10px] font-black text-primary bg-primary/5 px-4 py-2 rounded-xl uppercase tracking-widest transition-all active:scale-95">GİRİŞ</Link>
                 )}
              </div>
            </div>
            
            <div 
                ref={searchContainerRef} 
                className="relative flex-grow flex items-center md:max-w-2xl"
                onMouseEnter={handleMouseEnterContainer}
                onMouseLeave={handleMouseLeaveContainer}
            >
                <form onSubmit={handleSearch} className="w-full relative group">
                    <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl transition-opacity opacity-0 group-focus-within:opacity-100"></div>
                    <input 
                        type="text" 
                        onFocus={handleFocusSearch}
                        placeholder={isVoiceListening ? "Dinleniyor..." : t('nav.search')} 
                        className={`relative w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3 md:py-4 pl-5 pr-20 focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white transition-all text-xs md:text-sm font-bold placeholder-gray-400 shadow-inner ${isVoiceListening ? 'ring-2 ring-red-400 animate-pulse bg-red-50' : ''}`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button type="button" onClick={handleVoiceSearch} className={`p-1.5 md:p-2 rounded-xl transition-all ${isVoiceListening ? 'text-red-500 bg-red-100' : 'text-gray-400 hover:text-primary hover:bg-gray-100'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                        </button>
                        <button type="button" onClick={handleCameraClick} className="text-gray-400 hover:text-primary p-1.5 md:p-2 rounded-xl hover:bg-gray-100 transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                        </button>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </form>

                {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden z-[100] animate-fade-in-down max-h-[520px] overflow-y-auto no-scrollbar ring-1 ring-black/5 flex flex-col">
                        <div className="p-4 space-y-6">
                            {suggestions.flash.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-3 px-2">
                                        <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
                                            <span className="animate-pulse">⚡</span> 24H HIZLI SATIŞLAR
                                        </h4>
                                        <Link to="/categories?cat=direct_24h" onClick={() => setShowSuggestions(false)} className="text-[9px] font-black text-indigo-400 hover:text-indigo-600 uppercase">Tümünü Gör</Link>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {suggestions.flash.map(item => (
                                            <button key={item.id} onClick={() => { setSearchTerm(item.title); handleSearch(item.title); }} className="w-full text-left p-2.5 hover:bg-indigo-50/50 flex items-center gap-3 transition-all rounded-xl border border-transparent hover:border-indigo-100 group">
                                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-indigo-50">
                                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-black text-slate-900 truncate uppercase italic leading-none mb-1">{item.title}</p>
                                                    <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">Hemen Teslimat</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-indigo-600">{formatPrice(item.currentBid)}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">
                                    {searchTerm ? 'EŞLEŞEN SONUÇLAR' : 'ÖNERİLEN MEZATLAR'}
                                </h4>
                                <div className="grid grid-cols-1 gap-1">
                                    {suggestions.main.length > 0 ? (
                                        suggestions.main.map(item => (
                                            <button key={item.id} onClick={() => { setSearchTerm(item.title); handleSearch(item.title); }} className="w-full text-left p-3 hover:bg-primary/5 flex items-center gap-4 transition-all rounded-2xl group border border-transparent hover:border-primary/10">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-gray-900 truncate uppercase italic leading-none mb-1">{item.title}</p>
                                                    <p className="text-[9px] font-black text-primary uppercase tracking-widest">{item.category}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-gray-800">{formatPrice(item.currentBid)}</p>
                                                    <span className="text-[8px] font-black text-green-600 uppercase tracking-tighter">İncele →</span>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="py-12 text-center text-gray-400">
                                            <span className="text-4xl block mb-2 opacity-20">🔍</span>
                                            <p className="text-[10px] font-black uppercase tracking-widest italic">Ürün bulunamadı.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="hidden md:flex items-center justify-between gap-8">
                <div className="flex items-center gap-8">
                    <Link to="/categories" className={location.pathname === '/categories' ? "text-primary font-black border-b-2 border-primary pb-1" : "text-gray-600 font-bold hover:text-primary transition-colors"}>MEZATLAR</Link>
                    <Link to="/requests" className={location.pathname.startsWith('/requests') ? "text-primary font-black border-b-2 border-primary pb-1" : "text-gray-600 font-bold hover:text-primary transition-colors"}>TALEPLER</Link>
                    {user?.role === 'admin' ? (
                       <Link to="/admin/dashboard" className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                           <span className="text-lg">⚙️</span> PRO PANEL
                       </Link>
                    ) : (
                       <Link to="/sell" className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">SATIŞ YAP</Link>
                    )}
                </div>

                <div className="h-10 w-[1px] bg-gray-100"></div>

                {user ? (
                   <div className="flex items-center gap-6">
                        <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-gray-400 hover:text-primary transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                            {unreadNotifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white">{unreadNotifications.length}</span>}
                        </button>
                        <Link to="/profile" className="flex items-center gap-4 group">
                             <div className="text-right">
                                <p className="text-sm font-black text-gray-900 uppercase">{user.name}</p>
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest">{formatPrice(user.walletBalance)}</p>
                             </div>
                             <LazyImage src={user.avatarUrl} alt="User" className="h-12 w-12 rounded-2xl border-4 border-gray-50 shadow-xl object-cover group-hover:scale-105 transition-transform" />
                        </Link>
                   </div>
                ) : (
                    <div className="flex gap-4">
                        <Link to="/login" className="px-6 py-3 text-xs font-black text-primary uppercase tracking-widest hover:bg-gray-50 rounded-2xl transition-colors">GİRİŞ</Link>
                        <Link to="/register" className="px-6 py-3 text-xs font-black text-white bg-primary rounded-2xl uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">KATIL</Link>
                    </div>
                )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow pb-24 md:pb-0">
        {children}
      </main>

      <MobileBottomNav />

      <footer className="bg-primary text-white py-12 md:py-24 pb-48 md:pb-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full -mr-48 -mb-48 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center md:text-left relative z-10">
            <div className="flex flex-col items-center md:items-start">
                <Link to="/" className="flex items-center gap-3 mb-6 group">
                    <Logo className="h-12 w-12 bg-white rounded-xl p-1 shadow-xl" linked={false} />
                    <h3 className="font-display font-black text-3xl tracking-tighter text-white uppercase italic">MAZORA</h3>
                </Link>
                <p className="text-sm text-blue-100/60 mb-8 leading-relaxed max-w-xs font-medium italic">Dünya’nın 1 numaralı tam kapsamlı "Managed Trade" açık artırma protokolü.</p>
                <div className="flex flex-col gap-3 w-full md:w-auto">
                    <Link to="/about" className="text-[10px] font-black text-blue-300 uppercase tracking-widest hover:text-white transition-colors border-b border-blue-900/50 pb-1.5 w-full md:w-48 text-center md:text-left">Hakkımızda</Link>
                    <Link to="/verified-sellers" className="text-[10px] font-black text-blue-300 uppercase tracking-widest hover:text-white transition-colors border-b border-blue-900/50 pb-1.5 w-full md:w-48 text-center md:text-left">Onaylı Satıcılar</Link>
                    <Link to="/feedback" className="text-[10px] font-black text-blue-300 uppercase tracking-widest hover:text-white transition-colors border-b border-blue-900/50 pb-1.5 w-full md:w-48 text-center md:text-left">Geri Bildirimler</Link>
                </div>
            </div>

            <div className="flex flex-col items-center md:items-start">
                <h4 className="font-black text-blue-300 uppercase tracking-[0.3em] text-[10px] mb-8 border-b border-blue-900/50 pb-2 w-full md:w-auto uppercase">{t('legal.helpCenter').toUpperCase()}</h4>
                <ul className="space-y-4 text-sm font-black text-blue-100 uppercase tracking-tighter">
                    <li><Link to="/faq" className="hover:text-white transition-all">{t('legal.faqTitle') || 'FAQ'}</Link></li>
                    <li><Link to="/help" className="hover:text-white transition-all">{t('legal.helpCenter')}</Link></li>
                    <li><Link to="/escrow" className="hover:text-white transition-all">{t('legal.escrowTitle')}</Link></li>
                    <li><Link to="/rules" className="hover:text-white transition-all">{t('legal.termsTitle')}</Link></li>
                    <li><Link to="/ethics" className="hover:text-white transition-all">{t('legal.ethicsTitle')}</Link></li>
                </ul>
            </div>

            <div className="hidden lg:flex flex-col items-start">
                <h4 className="font-black text-blue-300 uppercase tracking-[0.3em] text-[10px] mb-8 border-b border-blue-900/50 pb-2 w-full md:w-auto uppercase">{t('nav.categories').toUpperCase()}</h4>
                <ul className="space-y-4 text-sm font-black text-blue-100 uppercase tracking-tighter">
                    {CATEGORIES.slice(0, 5).map((cat) => (
                        <li key={cat.id}>
                            <Link to={`/categories?cat=${cat.id}`} className="hover:text-white hover:translate-x-2 transition-all inline-block">
                                {/* @ts-ignore */}
                                {cat.label[language]}
                            </Link>
                        </li>
                    ))}
                    <li><Link to="/categories" className="text-secondary font-black hover:text-white transition-all">Tümünü Gör →</Link></li>
                </ul>
            </div>

            <div className="flex flex-col items-center md:items-start">
                <h4 className="font-black text-blue-300 uppercase tracking-widest text-[10px] mb-8 border-b border-blue-900/50 pb-2 w-full md:w-auto">İLETİŞİM</h4>
                <ul className="space-y-5 text-sm text-blue-100 mb-8">
                    <li className="flex items-center justify-center md:justify-start gap-4">
                        <span className="text-2xl">📍</span>
                        <span className="text-left text-xs font-black uppercase">Maslak, İstanbul / TR</span>
                    </li>
                    <li className="flex items-center justify-center md:justify-start gap-4">
                        <span className="text-2xl">✉️</span>
                        <a href="mailto:support@mazora.com" className="hover:text-white font-black text-xs">SUPPORT@MAZORA.COM</a>
                    </li>
                    <li className="flex items-center justify-center md:justify-start gap-4">
                        <span className="text-2xl">📞</span>
                        <div className="flex flex-col gap-1 text-xs font-black uppercase">
                            <a href="tel:+902128122961" className="hover:text-white">+90 212 812 29 61</a>
                            <a href="tel:+905423028821" className="hover:text-white">+90 542 302 88 21</a>
                        </div>
                    </li>
                    <li className="flex items-center justify-center md:justify-start gap-4 group">
                        <span className="text-2xl group-hover:rotate-12 transition-transform">🔑</span>
                        <Link to="/admin/login" className="hover:text-secondary text-[10px] font-black uppercase tracking-widest transition-colors">YÖNETİCİ PANELİ</Link>
                    </li>
                </ul>
            </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 mt-16 relative z-10 text-center">
            <div className="bg-blue-950/80 backdrop-blur-md rounded-[2rem] border-2 border-blue-800/50 p-8 md:p-12 shadow-2xl relative inline-block w-full">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-white text-[9px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-lg">GÜVENLİK PROTOKOLÜ</div>
                <p className="text-sm md:text-base font-black text-white uppercase italic leading-loose">
                    {t('legal.feeNotice')}
                </p>
            </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-white/5 text-center flex flex-col md:flex-row justify-between items-center text-[10px] font-black text-blue-100 uppercase tracking-[0.3em] relative z-10">
            <p className="opacity-40">&copy; {new Date().getFullYear()} Mazora Auctions. All rights reserved.</p>
            <div className="flex gap-8 mt-6 md:mt-0 pb-10 md:pb-0">
                <Link to="/privacy" className="hover:text-white text-blue-200 decoration-blue-500 underline underline-offset-4 font-black">{t('legal.privacyTitle') || 'GİZLİLİK'}</Link>
                <Link to="/contract" className="hover:text-white text-blue-200 decoration-blue-500 underline underline-offset-4 font-black">{t('legal.contractTitle') || 'SÖZLEŞME'}</Link>
            </div>
        </div>
      </footer>
    </div>
  );
};
