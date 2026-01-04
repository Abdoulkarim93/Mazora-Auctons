
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { CountdownTimer } from '../components/AuctionComponents';
import { BuyerRequest, FEE_STRUCTURE } from '../types';

export const BuyerRequests = () => {
  const { t, showToast, user, requests, deductQuoteFee, formatPrice } = useApp();
  const navigate = useNavigate();
  const [selectedRequest, setSelectedRequest] = useState<BuyerRequest | null>(null);
  const [quotePrice, setQuotePrice] = useState('');
  const [quoteTime, setQuoteTime] = useState('');
  const [legalAccepted, setLegalAccepted] = useState(false);

  // Reconstruct Dates safely for the countdown component
  const safeRequests = useMemo(() => {
    return requests.map(r => ({
        ...r,
        expiresAt: new Date(r.expiresAt)
    }));
  }, [requests]);

  const openQuoteDrawer = (request: BuyerRequest) => {
      setSelectedRequest(request);
      setLegalAccepted(false);
  };

  const closeQuoteDrawer = () => {
      setSelectedRequest(null);
      setQuotePrice('');
      setQuoteTime('');
      setLegalAccepted(false);
  };

  const quoteFeeTL = Math.ceil(FEE_STRUCTURE.QUOTE_FEE_USD * FEE_STRUCTURE.EXCHANGE_RATE);

  const handleSubmitQuote = (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) { showToast('Please login', 'error'); return; }
      if (!legalAccepted) { showToast('Legal required', 'error'); return; }

      const success = deductQuoteFee();
      if (!success) { navigate('/profile'); return; }
      
      closeQuoteDrawer();
      showToast("Teklif başarıyla iletildi!", "success");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-left min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-display font-black text-gray-900 uppercase tracking-tighter italic">{t('requests.quoteCenter')}</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] md:text-xs tracking-[0.2em] mt-1">{t('requests.sellerHint')}</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
           {user && (
               <Link to="/requests/my" className="flex-1 md:flex-none text-center bg-gray-100 text-gray-600 font-black px-6 py-3 rounded-xl uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-colors">
                 {t('requests.myRequests')}
               </Link>
           )}
           <Link to={user ? "/requests/create" : "/login"} className="flex-1 md:flex-none text-center bg-secondary text-white font-black px-8 py-3 rounded-xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-200 uppercase tracking-widest text-[10px]">
             {t('requests.postRequest')}
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeRequests.map((request) => {
            const isService = request.type === 'service';
            return (
              <div key={request.id} className={`rounded-[2rem] shadow-sm border overflow-hidden flex flex-col h-full hover:shadow-xl transition-all group ${isService ? 'bg-indigo-50/30 border-indigo-100' : 'bg-white border-gray-100'}`}>
                <div className="p-6 md:p-8 flex-grow">
                  <div className="flex justify-between items-start mb-5">
                    <span className={`px-2.5 py-1 text-[8px] font-black rounded-lg uppercase tracking-widest ${isService ? 'bg-indigo-100 text-indigo-700' : 'bg-primary/10 text-primary'}`}>
                      {isService ? t('requests.badges.service') : t('requests.badges.product')}
                    </span>
                    <span className="text-[10px] text-gray-300 font-black">#{request.id.toUpperCase()}</span>
                  </div>
                  
                  <h3 className="text-lg md:text-xl font-display font-black text-gray-900 mb-3 uppercase italic leading-tight group-hover:text-primary transition-colors">{request.title}</h3>
                  <p className="text-gray-500 text-xs md:text-sm mb-6 line-clamp-3 font-medium italic">"{request.description}"</p>
                  
                  <div className="space-y-2.5 pt-4 border-t border-gray-50">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                       <span className="text-gray-400">{t('requests.budget')}</span>
                       <span className="text-indigo-900">{formatPrice(request.budget)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                       <span className="text-gray-400">📍 {t('requests.labels.location')}</span>
                       <span className="text-gray-700 truncate ml-2">{request.location}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                       <span className="text-gray-400">{isService ? t('requests.labels.date') : t('requests.quantity')}</span>
                       <span className="text-gray-700">{isService ? new Date(request.preferredDate!).toLocaleDateString() : request.quantity}</span>
                    </div>
                  </div>
                </div>
                
                <div className={`${isService ? 'bg-indigo-100/30 border-t border-indigo-100' : 'bg-gray-50 border-t border-gray-100'} p-6`}>
                   <div className="flex justify-between items-center mb-5">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('requests.expiresIn')}</span>
                      <CountdownTimer targetDate={request.expiresAt} className="text-primary font-bold text-sm" />
                   </div>
                   
                   <button 
                    onClick={() => openQuoteDrawer(request)}
                    className={`w-full font-black py-4 rounded-xl transition-all shadow-lg text-[10px] uppercase tracking-widest active:scale-95 ${isService ? 'bg-indigo-900 text-white hover:bg-black' : 'bg-primary text-white hover:bg-primary-800'}`}
                   >
                     {t('requests.submitQuote')}
                   </button>
                   <p className="text-[8px] text-gray-400 text-center mt-3 font-bold uppercase tracking-tighter italic">{t('requests.sealed')}</p>
                </div>
              </div>
            );
        })}
      </div>
      
      {selectedRequest && user && (
          <div className="fixed inset-0 z-[200] flex justify-end">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeQuoteDrawer}></div>
              <div className="relative w-full max-w-lg bg-white h-full shadow-2xl animate-fade-in-right overflow-y-auto flex flex-col no-scrollbar">
                  <div className={`p-5 text-center text-white font-black text-[10px] uppercase tracking-[0.2em] ${user.freeQuotesRemaining > 0 ? 'bg-emerald-600' : 'bg-indigo-900'}`}>
                      {user.freeQuotesRemaining > 0 ? `🎉 ${user.freeQuotesRemaining} ÜCRETSİZ TEKLİF HAKKI` : `ÜCRET: ${quoteFeeTL} TL`}
                  </div>

                  <div className="p-8 md:p-10 flex-grow text-left">
                      <div className="flex justify-between items-center mb-10">
                          <h2 className="text-2xl font-display font-black text-gray-900 uppercase italic tracking-tighter leading-none">{t('requests.submitQuote')}</h2>
                          <button onClick={closeQuoteDrawer} className="text-gray-400 hover:text-black transition-colors text-xl">✕</button>
                      </div>
                      
                      <div className="bg-gray-50 rounded-2xl p-6 mb-10 border border-gray-100 shadow-inner">
                          <span className="text-[8px] font-black text-primary uppercase tracking-[0.3em] block mb-2">TALEP DETAYI</span>
                          <h3 className="font-black text-gray-900 mb-2 uppercase italic leading-tight">{selectedRequest.title}</h3>
                          <div className="text-[10px] font-black text-indigo-900 bg-white inline-block px-3 py-1 rounded-lg shadow-sm border border-indigo-50">
                              HEDEF: {formatPrice(selectedRequest.budget)}
                          </div>
                      </div>

                      <form onSubmit={handleSubmitQuote} className="space-y-8">
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">TEKLİF TUTARIN (TRY)</label>
                              <input type="number" required value={quotePrice} onChange={(e) => setQuotePrice(e.target.value)} className="w-full rounded-xl border-gray-200 border p-4 font-black text-xl text-primary focus:ring-4 focus:ring-primary/5 outline-none shadow-sm" placeholder="0" />
                          </div>
                          
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">TESLİMAT / TERMİN SÜRESİ</label>
                              <input type="text" required value={quoteTime} onChange={(e) => setQuoteTime(e.target.value)} className="w-full rounded-xl border-gray-200 border p-4 font-bold text-sm outline-none bg-gray-50" placeholder="Örn: 3 İş Günü" />
                          </div>

                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">ALICIYA NOTUN</label>
                              <textarea rows={4} className="w-full rounded-xl border-gray-200 border p-4 font-medium text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="Neleri dahil ediyorsunuz?"></textarea>
                          </div>

                          <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-100">
                              <label className="flex items-start gap-4 cursor-pointer">
                                  <input type="checkbox" required checked={legalAccepted} onChange={(e) => setLegalAccepted(e.target.checked)} className="mt-1 w-6 h-6 text-red-600 focus:ring-red-500 border-gray-300 rounded-lg" />
                                  <span className="text-[10px] text-red-900 font-black leading-relaxed uppercase italic">
                                      Hatalı beyan, dolandırıcılık veya teslimat ihlalinde Mazora'nın yasal süreç başlatma yetkisini kabul ediyorum.
                                  </span>
                              </label>
                          </div>

                          <button type="submit" disabled={!legalAccepted} className={`w-full text-white font-black py-5 rounded-2xl shadow-2xl transition-all active:scale-95 text-xs uppercase tracking-[0.2em] ${!legalAccepted ? 'bg-gray-300 cursor-not-allowed' : 'bg-secondary hover:bg-orange-600'}`}>
                              {user.freeQuotesRemaining > 0 ? 'ÜCRETSİZ TEKLİF GÖNDER' : `ÖDEME YAP VE GÖNDER (${quoteFeeTL} TL)`}
                          </button>
                      </form>
                  </div>
              </div>
          </div>
      )}
      
      {requests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center text-gray-300">
              <span className="text-7xl mb-6 grayscale opacity-20 italic">📁</span>
              <p className="font-black uppercase tracking-[0.2em] text-xs">{t('requests.noQuotes')}</p>
          </div>
      )}
    </div>
  );
};
