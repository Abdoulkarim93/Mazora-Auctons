import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context.tsx';
import { Language, CATEGORIES, ToastType, CategoryType, AuctionItem } from '../types.ts';
import { ReferralPopup } from './ReferralPopup.tsx';
import { identifyItemFromImage } from '../services/geminiService.ts';
import { Logo } from './Logo.tsx';
import { LazyImage } from './LazyImage.tsx';

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
  
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [identifiedItem, setIdentifiedItem] = useState<any | null>(null);

  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      const filtered = auctions.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 6);
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions(auctions.slice(0, 4));
    }
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

  const unreadNotifications = user?.notifications?.filter(n => !n.read) || [];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-neutral-bg text-slate-900">
      <ReferralPopup />
      <ToastContainer />
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center py-2 lg:h-16 gap-3">
            <div className="flex items-center justify-between lg:justify-start gap-4 flex-grow">
              <Link to="/" className="flex-shrink-0 flex items-center group">
                <Logo className="h-10 w-10" linked={false} />
                <span className="text-xl font-display font-extrabold text-primary tracking-tight ml-2 block">MAZORA</span>
              </Link>
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
                          <button type="button" onClick={handleVoiceSearch} className="p-1.5 rounded-full text-gray-400 hover:text-primary"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path></svg></button>
                          <button type="button" onClick={handleCameraClick} className="text-gray-400 hover:text-primary p-1.5 rounded-full"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="13" r="4"></circle></svg></button>
                      </div>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </form>
              </div>
              <div className="flex lg:hidden items-center gap-2">
                 {user ? <Link to="/profile"><LazyImage src={user.avatarUrl} alt="User" className="h-8 w-8 rounded-full object-cover" /></Link> : <Link to="/login" className="text-xs font-bold text-primary">{t('nav.login')}</Link>}
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-6 ml-4">
              <div className="flex space-x-8 items-center mr-4">
                <Link to="/" className="text-gray-600 hover:text-primary font-medium">{t('nav.home')}</Link>
                <Link to="/categories" className="text-gray-600 hover:text-primary font-medium">{t('nav.categories')}</Link>
                <Link to="/requests" className="text-gray-600 hover:text-primary font-medium">{t('nav.requests')}</Link>
                <Link to="/sell" className="text-gray-600 hover:text-primary font-medium">{t('nav.sell')}</Link>
              </div>
              {user ? (
                <div className="flex items-center gap-4">
                    <Link to="/profile" className="flex items-center gap-2">
                        <LazyImage src={user.avatarUrl} alt="User" className="h-8 w-8 rounded-full border-2 border-primary-100 object-cover" />
                        <span className="text-sm font-bold text-gray-700">{user.name.split(' ')[0]}</span>
                    </Link>
                    <button onClick={logout} className="text-gray-400 hover:text-secondary">Logout</button>
                </div>
              ) : (
                <Link to="/login" className="text-xs font-bold text-primary bg-blue-50 px-3 py-2 rounded-lg">{t('nav.login')}</Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow pb-16 md:pb-0">{children}</main>
      <MobileBottomNav />
    </div>
  );
};