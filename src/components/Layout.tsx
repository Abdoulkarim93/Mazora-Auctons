import React, { useState, useRef, useEffect } from 'react';
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

// Mobile Bottom Nav
const MobileBottomNav = () => {
    const location = useLocation();
    const { t } = useApp();
    
    if (location.pathname.startsWith('/auction/')) return null;

    const isActive = (path: string) => location.pathname === path ? "text-primary" : "text-gray-400";

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe">
            <div className="flex justify-around items-center h-16">
                <Link to="/" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/')}`}>
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    <span className="text-[10px] font-bold">{t('nav.home')}</span>
                </Link>
                <Link to="/categories" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/categories')}`}>
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" /></svg>
                    <span className="text-[10px] font-bold">{t('nav.categories')}</span>
                </Link>
                <Link to="/sell" className="flex flex-col items-center justify-center w-full h-full relative -top-5">
                    <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center text-white shadow-lg border-4 border-gray-100">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 mt-1">{t('nav.sell')}</span>
                </Link>
                <Link to="/requests" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/requests')}`}>
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                    <span className="text-[10px] font-bold">{t('requests.quoteCenter').split(' ')[0]}</span>
                </Link>
                <Link to="/profile" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/profile')}`}>
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <span className="text-[10px] font-bold">{t('nav.profile')}</span>
                </Link>
            </div>
        </div>
    );
};

interface LayoutProps {
    children?: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { language, setLanguage, t, user, logout, showToast, auctions } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<AuctionItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  // Vision AI State
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [identifiedItem, setIdentifiedItem] = useState<any | null>(null);

  const isAdminRoute = location.pathname.startsWith('/admin');

  // Handle Search input changes for suggestions
  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      const filtered = auctions.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 6);
      setFilteredSuggestions(filtered);
    } else {
      // Show trending or top auctions when empty
      setFilteredSuggestions(auctions.slice(0, 4));
    }
  }, [searchTerm, auctions]);

  // Handle clicks outside search container
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
      const handleClickOutside = () => setShowNotifications(false);
      if (showNotifications) window.addEventListener('click', handleClickOutside);
      return () => window.removeEventListener('click', handleClickOutside);
  }, [showNotifications]);

  if (isAdminRoute) {
      return (
          <div className="min-h-screen font-sans bg-gray-100 text-slate-900">
              {children}
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
          navigate(`/categories?q=${encodeURIComponent(transcript)}`);
      };
      recognition.onend = () => setIsVoiceListening(false);
      recognition.start();
  };

  const handleCameraClick = () => {
      fileInputRef.current?.click();
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
      });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setAnalyzingImage(true);
          try {
              const base64 = await convertFileToBase64(file);
              const cleanBase64 = base64.split(',')[1];
              const result = await identifyItemFromImage(cleanBase64);
              if (result) {
                  setIdentifiedItem({ ...result, imagePreview: base64 });
              } else {
                  showToast("Could not identify item. Try again.", "error");
              }
          } catch (err) {
              console.error(err);
              showToast("Error processing image.", "error");
          } finally {
              setAnalyzingImage(false);
              if (fileInputRef.current) fileInputRef.current.value = '';
          }
      }
  };

  const handleSnapAction = (action: 'sell' | 'search') => {
      if (!identifiedItem) return;
      if (action === 'sell') {
          navigate('/sell', { 
              state: { 
                  prefill: {
                      title: identifiedItem.title,
                      category: identifiedItem.category,
                      description: identifiedItem.description,
                      price: identifiedItem.estimatedPrice,
                      image: identifiedItem.imagePreview
                  }
              }
          });
      } else {
          setSearchTerm(identifiedItem.title);
          handleSearch(identifiedItem.title);
      }
      setIdentifiedItem(null);
  };

  const isActive = (path: string) => location.pathname === path ? "text-primary font-bold" : "text-gray-600 hover:text-primary-600 font-medium";
  const isRequestsActive = location.pathname.startsWith('/requests') ? "text-primary font-bold" : "text-gray-600 hover:text-primary-600 font-medium";

  const unreadNotifications = user?.notifications?.filter(n => !n.read) || [];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-neutral-bg text-slate-900">
      <ReferralPopup />
      <ToastContainer />
      
      {/* SNAP ANALYSIS OVERLAY */}
      {(analyzingImage || identifiedItem) && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
              {analyzingImage ? (
                  <div className="text-center text-white">
                      <div className="w-16 h-16 border-4 border-t-secondary border-white/20 rounded-full animate-spin mx-auto mb-4"></div>
                      <h3 className="text-xl font-bold animate-pulse">Vision AI Analysis...</h3>
                      <p className="text-sm opacity-80">Identifying object & estimating value</p>
                  </div>
              ) : (
                  <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-sm w-full animate-slide-up">
                      <div className="relative h-48 bg-gray-100">
                          <img src={identifiedItem.imagePreview} alt="Captured" className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                              {Math.round(identifiedItem.confidence * 100)}% Confidence
                          </div>
                      </div>
                      <div className="p-6">
                          <h3 className="text-xl font-display font-bold text-gray-900 mb-1">{identifiedItem.title}</h3>
                          <div className="flex gap-2 mb-3">
                              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded uppercase">{identifiedItem.category}</span>
                              <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded">Est. {identifiedItem.estimatedPrice} TL</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-6 line-clamp-3">{identifiedItem.description}</p>
                          
                          <div className="grid grid-cols-2 gap-3">
                              <button 
                                onClick={() => handleSnapAction('search')}
                                className="py-3 px-4 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 text-sm"
                              >
                                  🔍 Find Similar
                              </button>
                              <button 
                                onClick={() => handleSnapAction('sell')}
                                className="py-3 px-4 bg-secondary text-white rounded-xl font-bold hover:bg-orange-600 text-sm shadow-lg shadow-orange-200"
                              >
                                  💰 Sell This
                              </button>
                          </div>
                          <button onClick={() => setIdentifiedItem(null)} className="w-full mt-4 text-xs text-gray-400 font-bold hover:text-gray-600">Close</button>
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* Top Bar */}
      <div className="bg-primary text-white text-xs py-2 px-4 flex flex-col sm:flex-row justify-between items-center font-medium gap-2 sm:gap-0 text-center sm:text-left">
        <span>🕒 {t('topbar.schedule')}</span>
        <div className="flex space-x-4">
            <Link to="/escrow" className="flex items-center gap-1 hover:text-blue-200 transition-colors cursor-pointer group">
                <span className="group-hover:scale-110 transition-transform">🛡️</span> 
                <span className="underline decoration-transparent group-hover:decoration-blue-200 underline-offset-2 transition-all">
                    {t('topbar.escrow')}
                </span>
            </Link>
            <span className="flex items-center gap-1">✅ {t('topbar.verified')}</span>
        </div>
      </div>

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center py-2 lg:h-16 gap-3">
            <div className="flex items-center justify-between lg:justify-start gap-4 flex-grow">
              <Link to="/" className="flex-shrink-0 flex items-center group">
                <Logo className="h-10 w-10" linked={false} />
                <span className="text-xl font-display font-extrabold text-primary tracking-tight ml-2 block">MAZORA</span>
              </Link>
              
              {/* Focal Mobile-Visible Search Bar */}
              <div ref={searchContainerRef} className="relative flex-grow max-w-md mx-2 md:mx-4">
                  <form onSubmit={handleSearch} className="relative">
                      <input 
                        type="text" 
                        onFocus={() => setShowSuggestions(true)}
                        placeholder={isVoiceListening ? "Listening..." : t('nav.search')} 
                        className={`w-full bg-gray-100 border-none rounded-full py-2 pl-4 pr-16 focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm font-medium ${isVoiceListening ? 'ring-2 ring-red-400 animate-pulse bg-red-50' : ''}`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <div className="absolute right-2 top-1 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={handleVoiceSearch}
                            className={`p-1.5 rounded-full transition-colors ${isVoiceListening ? 'text-red-500 bg-red-100' : 'text-gray-400 hover:text-primary hover:bg-gray-200'}`}
                            title="Voice Search"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                          </button>
                          <button 
                            type="button" 
                            onClick={handleCameraClick}
                            className="text-gray-400 hover:text-primary p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                            title="Snap to Sell / Search"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                          </button>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileChange}
                      />
                  </form>

                  {/* Search Suggestions Dropdown */}
                  {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60] animate-fade-in-down max-h-[360px] overflow-y-auto no-scrollbar">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                {searchTerm ? 'Sonuç Önerileri' : 'Popüler Ürünler'}
                            </span>
                        </div>
                        <div className="py-2">
                            {filteredSuggestions.length > 0 ? (
                                filteredSuggestions.map(item => (
                                    <button 
                                        key={item.id}
                                        onClick={() => {
                                            setSearchTerm(item.title);
                                            handleSearch(item.title);
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-primary/5 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                                    >
                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate">{item.title}</p>
                                            <p className="text-[10px] font-bold text-primary uppercase">{item.category}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-gray-700">{item.currentBid.toLocaleString()} TL</p>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-400 text-xs font-bold italic">Eşleşen ürün bulunamadı.</div>
                            )}
                        </div>
                        <div className="bg-gray-50 px-4 py-2 text-center">
                            <button onClick={() => handleSearch(searchTerm)} className="text-[10px] font-black text-primary uppercase hover:underline">Tüm Sonuçları Gör</button>
                        </div>
                    </div>
                  )}
              </div>

              {/* Mobile Right Menu Icons */}
              <div className="flex lg:hidden items-center gap-2">
                 {user ? (
                    <Link to="/profile">
                        <LazyImage src={user.avatarUrl} alt="User" className="h-8 w-8 rounded-full border-2 border-primary-100 object-cover" />
                    </Link>
                 ) : (
                    <Link to="/login" className="text-xs font-bold text-primary bg-blue-50 px-3 py-1.5 rounded-lg whitespace-nowrap">{t('nav.login')}</Link>
                 )}
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-2 sm:space-x-4 ml-4">
              <div className="hidden md:flex md:space-x-8 items-center mr-4">
                <Link to="/" className={isActive('/')}>{t('nav.home')}</Link>
                <Link to="/categories" className={isActive('/categories')}>{t('nav.categories')}</Link>
                <Link to="/requests" className={isRequestsActive}>{t('nav.requests')}</Link>
                <Link to="/sell" className={isActive('/sell')}>{t('nav.sell')}</Link>
              </div>

              {/* Language Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['tr', 'en', 'fr'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-2 py-1 text-xs rounded-md uppercase font-bold transition-colors ${language === lang ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              {/* Notification Bell */}
              {user && (
                  <div className="relative">
                      <button 
                          className="p-2 text-gray-500 hover:text-primary relative transition-transform hover:scale-110"
                          onClick={(e) => {
                              e.stopPropagation();
                              setShowNotifications(!showNotifications);
                          }}
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                          {unreadNotifications.length > 0 && (
                              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                                  {unreadNotifications.length}
                              </span>
                          )}
                      </button>

                      {/* Notification Dropdown */}
                      {showNotifications && (
                          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[60] animate-fade-in-down" onClick={(e) => e.stopPropagation()}>
                              <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                                  <h4 className="font-bold text-gray-800 text-sm">{t('profile.notifications')}</h4>
                                  <span className="text-xs text-gray-500">{unreadNotifications.length} new</span>
                              </div>
                              <div className="max-h-64 overflow-y-auto">
                                  {user.notifications.length > 0 ? (
                                      user.notifications.map((notif) => (
                                          <div key={notif.id} className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-blue-50/50' : ''}`}>
                                              <div className="flex items-start gap-3">
                                                  <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${notif.type === 'success' ? 'bg-green-500' : notif.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                                                  <div>
                                                      <p className="text-sm font-bold text-gray-900">{notif.title}</p>
                                                      <p className="text-xs text-gray-600 mt-0.5">{notif.message}</p>
                                                      <p className="text-[10px] text-gray-400 mt-1">{notif.timestamp.toLocaleDateString()}</p>
                                                  </div>
                                              </div>
                                          </div>
                                      ))
                                  ) : (
                                      <div className="p-8 text-center text-gray-400 text-sm">
                                          No notifications yet.
                                      </div>
                                  )}
                              </div>
                              <Link to="/profile" onClick={() => setShowNotifications(false)} className="block bg-gray-50 text-center py-3 text-xs font-bold text-primary hover:bg-gray-100 transition-colors">
                                  View All Activity
                              </Link>
                          </div>
                      )}
                  </div>
              )}

              {/* User Menu */}
              {user ? (
                <div className="relative group cursor-pointer flex items-center gap-2 sm:gap-3">
                    <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <LazyImage 
                            src={user.avatarUrl} 
                            alt="User" 
                            className="h-8 w-8 rounded-full border-2 border-primary-100 object-cover" 
                        />
                        <div className="hidden md:flex flex-col items-start leading-none">
                            <span className="text-sm font-bold text-gray-700 flex items-center gap-1">
                                {user.name.split(' ')[0]} 
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{user.role}</span>
                        </div>
                    </Link>
                    {user.role === 'admin' && (
                        <Link to="/admin/dashboard" className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded font-bold hover:bg-black" title="Admin Panel">
                            ADMIN
                        </Link>
                    )}
                    <button onClick={logout} className="text-gray-400 hover:text-secondary ml-1" title={t('profile.logout')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    </button>
                </div>
              ) : (
                <Link to="/login" className="text-xs sm:text-sm font-bold text-primary hover:text-primary-800 bg-blue-50 px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
                  {t('nav.login')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pb-16 md:pb-0">
        {children}
      </main>

      <MobileBottomNav />

      {/* Footer */}
      <footer className="bg-primary text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start">
                <Link to="/" className="flex items-center gap-3 mb-4 group">
                    <Logo className="h-10 w-10 bg-white rounded-lg p-1" linked={false} />
                    <h3 className="font-display font-bold text-2xl tracking-tight text-white uppercase group-hover:text-secondary transition-colors">MAZORA</h3>
                </Link>
                <p className="text-sm text-blue-100 mb-4 leading-relaxed max-w-xs">Türkiye’nin en şeffaf ve güvenli açık artırma platformu.</p>
                <div className="text-[10px] text-blue-300 font-black bg-blue-900/50 py-2 px-3 rounded-lg inline-block uppercase tracking-widest">
                    Güvenli Ticaret, Gerçek Değer.
                </div>
            </div>

            <div className="flex flex-col items-center md:items-start">
                <h4 className="font-display font-bold text-white uppercase tracking-wider text-xs mb-6 opacity-70 border-b border-blue-800 pb-2 w-full md:w-auto uppercase">{t('legal.helpCenter').toUpperCase()}</h4>
                <ul className="space-y-3 text-sm font-medium text-blue-100">
                    <li><Link to="/help" className="hover:text-white hover:underline transition-all decoration-secondary decoration-2 underline-offset-4">{t('legal.helpCenter')}</Link></li>
                    <li><Link to="/escrow" className="hover:text-white hover:underline transition-all decoration-secondary decoration-2 underline-offset-4">{t('legal.escrowTitle')}</Link></li>
                    <li><Link to="/rules" className="hover:text-white hover:underline transition-all decoration-secondary decoration-2 underline-offset-4">{t('legal.termsTitle')}</Link></li>
                    <li><Link to="/ethics" className="hover:text-white hover:underline transition-all decoration-secondary decoration-2 underline-offset-4">{t('legal.ethicsTitle')}</Link></li>
                </ul>
            </div>

            <div className="hidden lg:flex flex-col items-start">
                <h4 className="font-display font-bold text-white uppercase tracking-wider text-xs mb-6 opacity-70 border-b border-blue-800 pb-2 w-full md:w-auto uppercase">{t('nav.categories').toUpperCase()}</h4>
                <ul className="space-y-3 text-sm font-medium text-blue-100">
                    {CATEGORIES.slice(0, 5).map((cat) => (
                        <li key={cat.id}>
                            <Link to={`/categories?cat=${cat.id}`} className="hover:text-white hover:translate-x-1 transition-transform inline-block">
                                {/* @ts-ignore */}
                                {cat.label[language]}
                            </Link>
                        </li>
                    ))}
                    <li><Link to="/categories" className="text-secondary hover:text-white font-bold text-xs uppercase tracking-wide">Tümünü Gör →</Link></li>
                </ul>
            </div>

            <div className="flex flex-col items-center md:items-start">
                <h4 className="font-display font-bold text-white uppercase tracking-wider text-xs mb-6 opacity-70 border-b border-blue-800 pb-2 w-full md:w-auto uppercase">İLETİŞİM</h4>
                <ul className="space-y-4 text-sm text-blue-100 mb-6">
                    <li className="flex items-start justify-center md:justify-start gap-3">
                        <span className="text-xl">📍</span>
                        <span className="text-left text-xs">Maslak, İstanbul<br/>Türkiye</span>
                    </li>
                    <li className="flex items-center justify-center md:justify-start gap-3">
                        <span className="text-xl">✉️</span>
                        <a href="mailto:support@mazora.com" className="hover:text-white font-bold text-xs">support@mazora.com</a>
                    </li>
                    <li className="flex items-start justify-center md:justify-start gap-3">
                        <span className="text-xl">📞</span>
                        <div className="flex flex-col gap-1">
                            <span className="font-bold text-xs">+90 212 812 29 61</span>
                            <span className="font-bold text-xs">+90 542 302 88 21</span>
                        </div>
                    </li>
                    <li className="flex items-center justify-center md:justify-start gap-3">
                        <span className="text-xl">🔑</span>
                        <Link to="/admin/login" className="text-secondary font-black hover:text-white uppercase text-[10px] tracking-widest">Admin Girişi</Link>
                    </li>
                </ul>
                
                <div className="flex gap-4 justify-center md:justify-start">
                    <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-red-500 hover:to-purple-500 cursor-pointer transition-all hover:scale-110 shadow-sm border border-white/20" title="Instagram">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    </a>
                    <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#1877F2] cursor-pointer transition-all hover:scale-110 shadow-sm border border-white/20" title="Facebook">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                    </a>
                    <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-black cursor-pointer transition-all hover:scale-110 shadow-sm border border-white/20" title="TikTok">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                    </a>
                </div>
            </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-blue-800 text-center flex flex-col md:flex-row justify-between items-center text-[10px] text-blue-400 uppercase tracking-widest">
            <p>&copy; {new Date().getFullYear()} Mazora Auctions. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0 font-bold">
                <Link to="/privacy" className="hover:text-white">{t('legal.privacyTitle')}</Link>
                <Link to="/contract" className="hover:text-white">{t('legal.contractTitle')}</Link>
            </div>
        </div>
        
        <div className="max-w-2xl mx-auto px-4 mt-8">
            <div className="p-4 bg-blue-900/40 rounded-xl border border-blue-800/50 text-[10px] font-black text-blue-200 uppercase tracking-widest text-center leading-loose">
                {t('legal.feeNotice')} <br className="md:hidden" />
                {t('legal.boostOption')}
            </div>
        </div>
      </footer>
    </div>
  );
};
