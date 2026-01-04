
import React from 'react';
import { useApp } from '../context';
import { CountdownTimer } from '../components/AuctionComponents';

export const MyRequests = () => {
  const { t, user, showToast, requests } = useApp(); // Use global requests
  
  // Filter for current user's requests
  const myRequests = requests.filter(r => r.buyerId === user?.id);

  const handleAcceptOffer = (requestId: string, quoteId: string) => {
      // Simulate API Call
      showToast("Offer accepted! Escrow payment link generated.", "success");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">{t('requests.myRequests')}</h1>

      <div className="space-y-6">
        {myRequests.map(req => (
          <div key={req.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden ${req.status === 'completed' ? 'border-green-200 ring-2 ring-green-50' : 'border-gray-200'}`}>
             <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-900">{req.title}</h3>
                        {req.status === 'completed' && <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">COMPLETED</span>}
                    </div>
                    <div className="flex gap-4 text-sm text-gray-500 mt-1">
                        <span>{req.quantity} units</span>
                        <span>•</span>
                        <span>{t('requests.budget')}: {req.budget.toLocaleString()} {req.currency}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">{t('requests.expiresIn')}: <CountdownTimer targetDate={req.expiresAt} /></span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold uppercase">
                        {req.quotes.length} Quotes
                    </span>
                    <button className="text-primary font-bold text-sm hover:underline">{t('profile.edit')}</button>
                </div>
             </div>
             
             {/* Quotes List (Visible only to owner) */}
             <div className="bg-gray-50 p-6">
                 <h4 className="font-bold text-gray-700 mb-4 text-sm uppercase">{t('requests.receivedQuotes')}</h4>
                 {req.quotes.length > 0 ? (
                     <div className="space-y-3">
                         {req.quotes.map(quote => (
                             <div key={quote.id} className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center shadow-sm">
                                 <div>
                                     <div className="font-bold text-gray-900 flex items-center gap-2">
                                         {quote.sellerName}
                                         {quote.isVerified && <span className="text-primary" title="Verified Seller">✓</span>}
                                     </div>
                                     <div className="text-xs text-gray-500 font-medium">Delivery: {quote.deliveryTime}</div>
                                 </div>
                                 <div className="text-right flex items-center gap-4">
                                     <span className="text-lg font-bold text-primary">{quote.price.toLocaleString()} {req.currency}</span>
                                     {req.status !== 'completed' ? (
                                         <button 
                                            onClick={() => handleAcceptOffer(req.id, quote.id)}
                                            className="bg-secondary text-white text-xs font-bold px-4 py-2 rounded hover:bg-orange-600 transition-colors shadow-sm"
                                         >
                                             {t('requests.acceptOffer')}
                                         </button>
                                     ) : (
                                         <span className="text-green-600 font-bold text-sm">{t('requests.offerAccepted')}</span>
                                     )}
                                 </div>
                             </div>
                         ))}
                     </div>
                 ) : (
                     <p className="text-sm text-gray-500 italic">{t('requests.noQuotes')}</p>
                 )}
             </div>
          </div>
        ))}

        {myRequests.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">You haven't posted any requests yet.</p>
                <button className="bg-primary text-white font-bold px-6 py-2 rounded-lg">{t('requests.postRequest')}</button>
            </div>
        )}
      </div>
    </div>
  );
};
