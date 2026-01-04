
import React, { useState } from 'react';
import { useApp } from '../context';
import { Link } from 'react-router-dom';

export const UserFeedback = () => {
    const { feedbacks, addFeedback, user, t, showToast } = useApp();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (comment.length < 10) {
            showToast("Lütfen daha detaylı bir yorum yazın.", "warning");
            return;
        }

        setIsSubmitting(true);
        await new Promise(r => setTimeout(r, 800));
        addFeedback(comment, rating);
        setComment('');
        setRating(5);
        setIsSubmitting(false);
        showToast("Geri bildiriminiz için teşekkürler! ✅", "success");
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in pb-32">
            <div className="text-center mb-16">
                <span className="text-xs font-black text-primary uppercase tracking-[0.4em] block mb-4">KULLANICI DENEYİMLERİ</span>
                <h1 className="text-4xl md:text-6xl font-display font-black text-gray-900 uppercase tracking-tighter italic">GÜVENİN ADRESİ: MAZORA</h1>
                <p className="mt-4 text-gray-500 font-bold uppercase text-[10px] md:text-sm tracking-widest">Binlerce başarılı işlem, mutlu alıcı ve satıcılar.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* FEEDBACK FORM */}
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl p-8 sticky top-24">
                        <h3 className="text-lg font-black text-gray-900 uppercase mb-6 flex items-center gap-2">
                            <span>✍️</span> Yorum Yap
                        </h3>
                        {user ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Puanınız</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button 
                                                key={star} 
                                                type="button" 
                                                onClick={() => setRating(star)}
                                                className={`text-2xl transition-transform active:scale-125 ${rating >= star ? 'grayscale-0' : 'grayscale'}`}
                                            >
                                                ⭐
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Yorumunuz</label>
                                    <textarea 
                                        required
                                        value={comment}
                                        onChange={e => setComment(e.target.value)}
                                        rows={4}
                                        placeholder="Mazora deneyiminizi paylaşın..."
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full bg-primary text-white font-black py-4 rounded-xl shadow-lg uppercase tracking-widest text-xs active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? 'GÖNDERİLİYOR...' : 'YORUMU YAYINLA'}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-sm text-gray-500 font-bold mb-6">Geri bildirim bırakmak için giriş yapmalısınız.</p>
                                <Link to="/login" className="bg-primary text-white font-black px-8 py-3 rounded-xl text-xs uppercase shadow-lg">GİRİŞ YAP</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* FEEDBACK LIST */}
                <div className="lg:col-span-8 space-y-6">
                    {feedbacks.map(fb => (
                        <div key={fb.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 relative overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform"></div>
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-black text-gray-900 uppercase text-base">{fb.userName}</h4>
                                        {fb.isVerified && <span className="text-blue-500 text-xs" title="Doğrulanmış İşlem">✓</span>}
                                    </div>
                                    <div className="flex gap-0.5 mt-1">
                                        {Array.from({ length: fb.rating }).map((_, i) => <span key={i} className="text-xs">⭐</span>)}
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{fb.date.toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-600 font-medium italic text-sm md:text-base leading-relaxed relative z-10">
                                "{fb.comment}"
                            </p>
                        </div>
                    ))}
                    {feedbacks.length === 0 && (
                        <div className="text-center py-20 text-gray-400 font-bold italic text-sm">Henüz geri bildirim bulunmuyor.</div>
                    )}
                </div>
            </div>
        </div>
    );
};
