import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context';
import { useNavigate, Link } from 'react-router-dom';
import { User, CategoryType, ProductCondition, AuctionStatus, CATEGORIES, InventoryItem, InventoryStatus, AuctionItem, SellerTier, getCategorySlotStartTime, FEE_STRUCTURE } from '../types';
import { LazyImage } from '../components/LazyImage';
import { Logo } from '../components/Logo';
import { verifyHumanFace } from '../services/geminiService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

type AdminTab = 'overview' | 'users' | 'deals' | 'listings' | 'logs' | 'finance';

const MobileHandle = () => (
    <div className="md:hidden flex justify-center py-3">
        <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
    </div>
);

const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const CreateUserModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const { adminCreateUser, showToast } = useApp();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'buyer' as 'buyer' | 'seller',
        phone: '',
        sellerTier: 'quick' as SellerTier,
        isVerified: false,
        isStore: false
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        adminCreateUser(formData);
        showToast(`${formData.name} başarıyla oluşturuldu.`, "success");
        onClose();
        setFormData({ name: '', email: '', password: '', role: 'buyer', phone: '', sellerTier: 'quick', isVerified: false, isStore: false });
    };

    return (
        <div className="fixed inset-0 z-[700] flex items-end md:items-center justify-center bg-slate-950/80 backdrop-blur-md p-0 md:p-4 animate-fade-in text-left">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="bg-white w-full max-w-xl rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 relative z-10 animate-slide-up max-h-[95vh] overflow-y-auto no-scrollbar">
                <MobileHandle />
                <div className="bg-emerald-900 p-6 md:p-8 text-white relative">
                    <h2 className="text-xl md:text-2xl font-display font-black uppercase italic tracking-tighter leading-none">YENİ ÜYE KAYDI</h2>
                    <p className="text-[9px] md:text-[10px] font-black text-emerald-300 uppercase tracking-widest mt-1 opacity-60">MANUEL KULLANICI OLUŞTURMA</p>
                    <button onClick={onClose} className="absolute top-6 right-6 md:top-8 md:right-8 text-emerald-300 hover:text-white transition-all text-xl">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">AD SOYAD</label>
                            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-sm outline-none" placeholder="Üye İsmi" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">E-POSTA</label>
                            <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-sm outline-none" placeholder="Email" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">ŞİFRE</label>
                            <input required type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-sm outline-none" placeholder="Giriş Şifresi" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">ROL</label>
                            <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-black text-xs uppercase outline-none">
                                <option value="buyer">ALICI</option>
                                <option value="seller">SATICI</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">TELEFON</label>
                        <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-sm outline-none" placeholder="+90 ..." />
                    </div>
                    {formData.role === 'seller' && (
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">SATICI SEVİYESİ</label>
                            <select value={formData.sellerTier} onChange={e => setFormData({...formData, sellerTier: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-black text-xs uppercase outline-none">
                                <option value="quick">BİREYSEL SATICI</option>
                                <option value="onayli">ONAYLI SATICI (PRO)</option>
                            </select>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <input type="checkbox" id="verifyCheck" checked={formData.isVerified} onChange={e => setFormData({...formData, isVerified: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-emerald-600" />
                            <label htmlFor="verifyCheck" className="text-[10px] font-black text-slate-600 uppercase cursor-pointer">ÜYEYİ DİREKT ONAYLA</label>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <input type="checkbox" id="storeCheck" checked={formData.isStore} onChange={e => setFormData({...formData, isStore: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-blue-600" />
                            <label htmlFor="storeCheck" className="text-[10px] font-black text-slate-600 uppercase cursor-pointer">MAĞAZA OLARAK ETİKETLE</label>
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-emerald-900 text-white font-black py-5 rounded-2xl shadow-xl uppercase text-[10px] md:text-xs tracking-widest transition-all active:scale-95 shadow-emerald-900/20 italic">SİSTEME KAYDET 🚀</button>
                </form>
            </div>
        </div>
    );
};

const EditAuctionModal = ({ auction, isOpen, onClose }: { auction: AuctionItem | null, isOpen: boolean, onClose: () => void }) => {
    const { adminUpdateAuction, showToast } = useApp();
    const [formData, setFormData] = useState<Partial<AuctionItem>>({});
    const [isConverting, setIsConverting] = useState(false);

    useEffect(() => {
        if (auction) setFormData({ 
            title: auction.title, 
            description: auction.description, 
            reservePrice: auction.reservePrice, 
            buyNowPrice: auction.buyNowPrice || 0,
            status: auction.status,
            imageUrl: auction.imageUrl,
            images: auction.images || [auction.imageUrl],
            videoUrl: auction.videoUrl || '',
            category: auction.category,
            condition: auction.condition
        });
    }, [auction, isOpen]);

    if (!isOpen || !auction) return null;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            // Fix: Added explicit File[] cast to resolve 'unknown' type error in map
            const files = Array.from(e.target.files) as File[];
            setIsConverting(true);
            try {
                const results = await Promise.all(files.map(f => convertFileToBase64(f)));
                setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...results].slice(0, 5) }));
            } finally { setIsConverting(false); }
        }
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsConverting(true);
            try {
                const res = await convertFileToBase64(e.target.files[0]);
                setFormData(prev => ({ ...prev, videoUrl: res }));
            } finally { setIsConverting(false); }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        adminUpdateAuction(auction.id, { ...formData, imageUrl: formData.images?.[0] });
        showToast("Mezat detayları ve tüm medya güncellendi.", "success");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[700] flex items-end md:items-center justify-center bg-slate-950/80 backdrop-blur-md p-0 md:p-4 animate-fade-in text-left">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="bg-white w-full max-w-3xl rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 relative z-10 animate-slide-up max-h-[90vh] overflow-y-auto no-scrollbar">
                <MobileHandle />
                <div className="bg-indigo-900 p-6 md:p-8 text-white relative">
                    <h2 className="text-xl md:text-2xl font-display font-black uppercase italic tracking-tighter leading-none">MEZATI MODİFİYE ET</h2>
                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mt-1 opacity-60">ADMIN ÜRÜN YÖNETİMİ</p>
                    <button onClick={onClose} className="absolute top-6 right-6 md:top-8 md:right-8 text-indigo-300 hover:text-white transition-all text-xl">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">ÜRÜN BAŞLIĞI</label>
                            <input required value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-sm outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">KATEGORİ</label>
                            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as CategoryType})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-black text-xs uppercase outline-none">
                                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{(c.label as any)['tr'].toUpperCase()}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">AÇIKLAMA</label>
                        <textarea rows={4} value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-medium text-sm outline-none" />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">MEDYA GÜNCELLEME (MAX 5 GÖRSEL + 1 VİDEO)</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                                <span className="text-xl">📸</span>
                                <span className="text-[8px] font-black text-slate-400 uppercase">GÖRSEL EKLE</span>
                                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                            <label className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                                <span className="text-xl">🎥</span>
                                <span className="text-[8px] font-black text-slate-400 uppercase">{formData.videoUrl ? 'VİDEO YÜKLENDİ' : 'VİDEO EKLE'}</span>
                                <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                            </label>
                        </div>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                            {(formData.images || []).map((img, i) => (
                                <div key={i} className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden shrink-0 relative group">
                                    <img src={img} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => setFormData(p => ({...p, images: p.images?.filter((_, idx) => idx !== i)}))} className="absolute inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-black text-[8px]">SİL</button>
                                </div>
                            ))}
                            {formData.videoUrl && <div className="w-16 h-16 rounded-xl border border-indigo-200 bg-indigo-900 flex items-center justify-center shrink-0 text-lg relative group"><span className="animate-pulse">🎥</span><button type="button" onClick={() => setFormData(p => ({...p, videoUrl: ''}))} className="absolute inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-black text-[8px]">SİL</button></div>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">REZERV (TL)</label>
                            <input type="number" value={formData.reservePrice || 0} onChange={e => setFormData({...formData, reservePrice: parseFloat(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-black text-sm outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">DURUM</label>
                            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as AuctionStatus})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-black text-[10px] uppercase outline-none">
                                {Object.values(AuctionStatus).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">KONDİSYON</label>
                            <select value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value as ProductCondition})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-black text-[10px] uppercase outline-none">
                                <option value={ProductCondition.NEW}>YENİ (NEW)</option>
                                <option value={ProductCondition.USED}>İKİNCİ EL (USED)</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" disabled={isConverting} className="w-full bg-indigo-900 text-white font-black py-5 rounded-2xl shadow-xl uppercase text-xs tracking-widest transition-all active:scale-95 shadow-indigo-900/20 disabled:opacity-50">
                        {isConverting ? 'MEDYA İŞLENİYOR...' : 'MEZATI GÜNCELLE VE YAYINLA'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const EditUserModal = ({ user, isOpen, onClose }: { user: User | null, isOpen: boolean, onClose: () => void }) => {
    const { adminUpdateUser, showToast, formatPrice } = useApp();
    const [formData, setFormData] = useState<Partial<User>>({});
    const [isCheckingFace, setIsCheckingFace] = useState(false);
    const [isConvertingMedia, setIsConvertingMedia] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({ 
                name: user.name, 
                email: user.email, 
                password: user.password || '', 
                phone: user.phone || user.phoneNumber, 
                address: user.address || '', 
                walletBalance: user.walletBalance,
                isStore: user.isStore || false,
                isVerified: user.isVerified || false,
                sellerTier: user.sellerTier || 'quick',
                avatarUrl: user.avatarUrl,
                profileGallery: user.profileGallery || []
            });
        }
    }, [user, isOpen]);

    if (!isOpen || !user) return null;

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsCheckingFace(true);
            try {
                const base64Data = await convertFileToBase64(file);
                const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
                
                if (formData.isStore) {
                    setFormData(prev => ({ ...prev, avatarUrl: base64Data }));
                    showToast("Mağaza logosu hazır. 🏪", "success");
                    setIsCheckingFace(false);
                    return;
                }

                const result = await verifyHumanFace(cleanBase64);
                setIsCheckingFace(false);
                setFormData(prev => ({ ...prev, avatarUrl: base64Data }));
                if (result.isHuman) {
                    showToast("Yeni profil resmi hazır. ✅", "success");
                } else {
                    showToast("Yüz algılanamadı. Mağaza hesabı değilse bireysel üyelik için selfie zorunludur.", "warning");
                }
            } catch (err) {
                setIsCheckingFace(false);
                showToast("Medya işleme hatası.", "error");
            }
        }
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files) as File[];
            const currentGallery = formData.profileGallery || [];
            const remaining = 5 - currentGallery.length;
            
            if (remaining <= 0) {
                showToast("En fazla 5 görsel yükleyebilirsiniz.", "warning");
                return;
            }

            setIsConvertingMedia(true);
            try {
                const newImages = await Promise.all(
                    files.slice(0, remaining).map(file => convertFileToBase64(file))
                );
                setFormData(prev => ({
                    ...prev,
                    profileGallery: [...(prev.profileGallery || []), ...newImages]
                }));
                showToast(`${newImages.length} görsel galeriye eklendi.`, "success");
            } catch (err) {
                showToast("Görsel yüklenirken hata oluştu.", "error");
            } finally {
                setIsConvertingMedia(false);
            }
        }
    };

    const removeFromGallery = (idx: number) => {
        setFormData(prev => ({
            ...prev,
            profileGallery: prev.profileGallery?.filter((_, i) => i !== idx)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        adminUpdateUser(user.id, formData);
        showToast(`Kullanıcı (${user.name}) verileri güncellendi.`, "success");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[800] flex items-end md:items-center justify-center bg-slate-950/90 backdrop-blur-xl p-0 md:p-4 animate-fade-in text-left">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="bg-white w-full max-w-xl rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 relative z-10 animate-slide-up max-h-[90vh] overflow-y-auto no-scrollbar">
                <MobileHandle />
                <div className="bg-indigo-900 p-6 md:p-8 text-white relative">
                    <h2 className="text-xl md:text-2xl font-display font-black uppercase italic tracking-tighter leading-none">KULLANICIYI DÜZENLE</h2>
                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mt-1 opacity-60">ÜYE VERİLERİNİ GÜNCELLE</p>
                    <button onClick={onClose} className="absolute top-6 right-6 md:top-8 md:right-8 text-indigo-300 hover:text-white transition-all text-xl">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6">
                    <div className="flex flex-col items-center gap-4 mb-4">
                        <div className="relative group">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-xl bg-slate-50">
                                <LazyImage src={formData.avatarUrl || user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                            </div>
                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity border-2 border-white/20">
                                <span className="text-white text-[10px] font-black uppercase tracking-widest">DEĞİŞTİR</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isCheckingFace} />
                            </label>
                            {isCheckingFace && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-full">
                                    <div className="w-6 h-6 border-2 border-indigo-900 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            {formData.isStore ? 'MAĞAZA MODU: LOGO YÜKLENEBİLİR' : 'BİREYSEL MOD: SELFİE ZORUNLU'}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PROFİL GALERİSİ / MAĞAZA GÖRSELLERİ (MAX 5)</label>
                            {isConvertingMedia && <span className="text-[8px] font-black text-indigo-600 animate-pulse">YÜKLENİYOR...</span>}
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            {(formData.profileGallery || []).map((img, idx) => (
                                <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-slate-100 relative group bg-slate-50 shadow-sm">
                                    <LazyImage src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                    <button 
                                        type="button"
                                        onClick={() => removeFromGallery(idx)}
                                        className="absolute inset-0 flex items-center justify-center bg-red-600/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <span className="text-xs font-black">SİL</span>
                                    </button>
                                </div>
                            ))}
                            {(formData.profileGallery || []).length < 5 && (
                                <label className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-600 hover:bg-indigo-50 transition-all">
                                    <span className="text-xl">+</span>
                                    <span className="text-[7px] font-black uppercase text-slate-400">YÜKLE</span>
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleGalleryUpload} disabled={isConvertingMedia} />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">AD SOYAD</label>
                            <input required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-900/5" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">E-POSTA</label>
                            <input required value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-sm outline-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">ŞİFRE</label>
                            <input required type="text" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-sm outline-none text-indigo-900" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">CÜZDAN (TL)</label>
                            <input type="number" value={formData.walletBalance || 0} onChange={e => setFormData({...formData, walletBalance: parseFloat(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-black text-sm outline-none text-indigo-900" />
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">SATICI SEVİYESİ (ONAY DURUMU)</label>
                        <select value={formData.sellerTier} onChange={e => setFormData({...formData, sellerTier: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-black text-xs uppercase outline-none">
                            <option value="quick">BİREYSEL / HIZLI</option>
                            <option value="onayli">ONAYLI PRO SATICI</option>
                            <option value="guest">MİSAFİR</option>
                        </select>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <input type="checkbox" id="editVerifyCheck" checked={formData.isVerified} onChange={e => setFormData({...formData, isVerified: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-emerald-600" />
                            <label htmlFor="editVerifyCheck" className="text-[10px] font-black text-slate-600 uppercase cursor-pointer">VERIFIED BADGE</label>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <input type="checkbox" id="editStoreCheck" checked={formData.isStore} onChange={e => setFormData({...formData, isStore: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-blue-600" />
                            <label htmlFor="editStoreCheck" className="text-[10px] font-black text-slate-600 uppercase cursor-pointer">MAĞAZA MODU</label>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-indigo-900 text-white font-black py-5 rounded-2xl shadow-xl uppercase text-xs tracking-widest transition-all active:scale-95 shadow-indigo-900/20">DEĞİŞİKLİKLERİ KAYDET</button>
                </form>
            </div>
        </div>
    );
};

const DealBidsModal = ({ auction, isOpen, onClose }: { auction: AuctionItem | null, isOpen: boolean, onClose: () => void }) => {
    const { formatPrice, allUsers } = useApp();
    const seller = useMemo(() => auction ? allUsers.find(u => u.id === auction.sellerId) : null, [auction, allUsers]);
    const currentWinner = useMemo(() => auction?.bids && auction.bids.length > 0 ? auction.bids[0] : null, [auction]);
    const winnerUser = useMemo(() => currentWinner ? allUsers.find(u => u.id === currentWinner.userId) : null, [currentWinner, allUsers]);

    if (!isOpen || !auction) return null;

    return (
        <div className="fixed inset-0 z-[800] flex items-end md:items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-0 md:p-4 animate-fade-in text-left">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="bg-slate-900 w-full max-w-3xl rounded-t-[3rem] md:rounded-[3rem] shadow-2xl overflow-hidden border border-white/10 flex flex-col max-h-[90vh] relative z-10 animate-slide-up">
                <MobileHandle />
                <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-slate-950/50">
                    <div className="min-w-0">
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-1 block">İŞLEM DETAYI & AKIŞ</span>
                        <h2 className="text-lg md:text-2xl font-display font-black text-white uppercase italic tracking-tighter truncate">{auction.title}</h2>
                    </div>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-all text-xl ml-4">✕</button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 no-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10">
                            <LazyImage src={auction.imageUrl} alt={auction.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                            <div className="absolute bottom-4 left-4">
                                <span className="bg-emerald-50 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase shadow-lg">GÜNEL FİYAT: {formatPrice(auction.currentBid)}</span>
                            </div>
                        </div>
                        <div className="space-y-4 min-w-0">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 min-w-0">
                                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-2">KAZANAN (ŞU ANKİ LİDER)</p>
                                {winnerUser ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border border-white/10 shrink-0">
                                            <LazyImage src={winnerUser.avatarUrl} alt={winnerUser.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-black text-white uppercase italic truncate">{winnerUser.name}</p>
                                            <p className="text-[8px] text-emerald-400 font-bold uppercase truncate">{winnerUser.email}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-white/20 font-bold italic">Henüz teklif yok.</p>
                                )}
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 min-w-0">
                                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-2">SATICI (MAĞAZA)</p>
                                {seller ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border border-white/10 shrink-0">
                                            <LazyImage src={seller.avatarUrl} alt={seller.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-black text-white uppercase italic truncate">{seller.name}</p>
                                            <p className="text-[8px] text-indigo-400 font-bold uppercase truncate">Mağaza ID: {seller.id.toUpperCase()}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-white/20 font-bold italic">Bilinmiyor.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const UserCommandCenter = ({ user, isOpen, onClose }: { user: User | null, isOpen: boolean, onClose: () => void }) => {
    const { adminAddItemToSeller, formatPrice, showToast, cancelListing, updateInventoryItem, language, adminUpdateUser, deleteUser } = useApp();
    const [activeSection, setActiveSection] = useState<'info' | 'inventory' | 'history'>('info');
    const [showAddForm, setShowAddForm] = useState(false);
    const [isEditingItem, setIsEditingItem] = useState<InventoryItem | null>(null);
    const [isEditUserOpen, setIsEditUserOpen] = useState(false);
    const [listingStrategy, setListingStrategy] = useState<'catalog' | 'live' | '24h'>('catalog');
    const [selectedSlotId, setSelectedSlotId] = useState<string>('');
    const [isConvertingMedia, setIsConvertingMedia] = useState(false);
    
    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        category: CategoryType.ELECTRONICS,
        condition: ProductCondition.USED,
        startPrice: 1,
        reservePrice: 0,
        buyNowPrice: 0,
        location: '',
        images: [] as string[],
        videoUrl: ''
    });

    const availableSlots = useMemo(() => {
        if (newItem.category === CategoryType.DIRECT_24H || listingStrategy === '24h') {
            return [{ id: 'immediate', label: 'HEMEN', time: '24H', date: new Date() }];
        }
        const slotTimeStr = getCategorySlotStartTime(newItem.category);
        const [sh, sm] = slotTimeStr.split(':').map(Number);
        const slots = [];
        for (let i = 0; i <= 5; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            d.setHours(sh, sm, 0, 0);
            if (d > new Date() || i > 0) {
                slots.push({
                    id: d.toISOString(),
                    label: i === 0 ? "BUGÜN" : i === 1 ? "YARIN" : d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }).toUpperCase(),
                    time: slotTimeStr,
                    date: d
                });
            }
        }
        return slots;
    }, [newItem.category, listingStrategy]);

    useEffect(() => {
        if (availableSlots.length > 0) setSelectedSlotId(availableSlots[0].id);
    }, [availableSlots]);

    if (!isOpen || !user) return null;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files) as File[];
            setIsConvertingMedia(true);
            try {
                const results = await Promise.all(files.map(f => convertFileToBase64(f)));
                setNewItem(prev => ({ ...prev, images: [...prev.images, ...results].slice(0, 5) }));
            } finally { setIsConvertingMedia(false); }
        }
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsConvertingMedia(true);
            try {
                const res = await convertFileToBase64(e.target.files[0]);
                setNewItem(prev => ({ ...prev, videoUrl: res }));
            } finally { setIsConvertingMedia(false); }
        }
    };

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        const itemStatus: InventoryStatus = (listingStrategy === 'live' || listingStrategy === '24h') ? 'active' : 'draft';
        const selectedSlot = availableSlots.find(s => s.id === selectedSlotId);
        const listedAt = (listingStrategy === 'live' || listingStrategy === '24h') ? (selectedSlot?.date || new Date()) : undefined;
        const finalCategory = listingStrategy === '24h' ? CategoryType.DIRECT_24H : newItem.category;
        const finalReserve = (listingStrategy === '24h' || finalCategory === CategoryType.DIRECT_24H) ? 0 : newItem.reservePrice;

        if (isEditingItem) {
            updateInventoryItem(isEditingItem.id, { 
                ...newItem, 
                category: finalCategory, 
                reservePrice: finalReserve, 
                imageUrl: newItem.images[0],
                status: itemStatus,
                listedAt: listedAt
            });
            showToast("Ürün başarıyla modifiye edildi.", "success");
            setIsEditingItem(null);
        } else {
            adminAddItemToSeller(user.id, { 
                ...newItem, 
                category: finalCategory, 
                reservePrice: finalReserve, 
                status: itemStatus, 
                listedAt: listedAt, 
                imageUrl: newItem.images[0], 
                expiryDate: listedAt ? new Date(listedAt.getTime() + 24 * 3600000) : undefined
            });
            showToast("Ürün enjekte edildi!", "success");
        }
        setShowAddForm(false);
        setNewItem({ title: '', description: '', category: CategoryType.ELECTRONICS, condition: ProductCondition.USED, startPrice: 1, reservePrice: 0, buyNowPrice: 0, location: '', images: [], videoUrl: '' });
    };

    const toggleStoreStatus = () => {
        adminUpdateUser(user.id, { isStore: !user.isStore });
        showToast(user.isStore ? "Bireysel Satıcı yapıldı." : "Onaylı Mağaza yapıldı! 🏪", "info");
    };

    const toggleProStatus = () => {
        const nextTier = user.sellerTier === 'onayli' ? 'quick' : 'onayli';
        adminUpdateUser(user.id, { sellerTier: nextTier, isVerified: nextTier === 'onayli' });
        showToast(nextTier === 'onayli' ? "PRO ONAY VERİLDİ! ✅" : "PRO ONAY KALDIRILDI.", nextTier === 'onayli' ? "success" : "warning");
    };

    const startEdit = (item: InventoryItem) => {
        setIsEditingItem(item);
        setNewItem({
            title: item.title,
            description: item.description || '',
            category: item.category,
            condition: item.condition,
            startPrice: item.startPrice,
            reservePrice: item.reservePrice,
            buyNowPrice: item.buyNowPrice || 0,
            location: item.location || '',
            images: item.images || (item.imageUrl ? [item.imageUrl] : []),
            videoUrl: item.videoUrl || ''
        });
        setListingStrategy(item.status === 'active' ? 'live' : 'catalog');
        setShowAddForm(true);
        setActiveSection('inventory'); 
    };

    return (
        <div className="fixed inset-0 z-[500] flex items-end md:items-center justify-center bg-slate-900/90 backdrop-blur-3xl p-0 md:p-8 animate-fade-in text-left overflow-hidden">
            <div className="absolute inset-0" onClick={onClose}></div>
            <EditUserModal user={user} isOpen={isEditUserOpen} onClose={() => setIsEditUserOpen(false)} />
            <div className="bg-white w-full max-w-full md:max-w-7xl h-full md:h-[90vh] rounded-t-[2.5rem] md:rounded-[4rem] shadow-2xl overflow-hidden border border-white/20 relative z-10 animate-slide-up flex flex-col md:flex-row">
                
                <div className="md:hidden bg-slate-900 p-4 flex justify-between items-center text-white shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <LazyImage src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                        <span className="font-black text-xs uppercase italic truncate tracking-tight">{user.name}</span>
                    </div>
                    <button onClick={onClose} className="text-white/60 p-2 ml-4">✕</button>
                </div>

                <div className="md:hidden bg-white border-b border-slate-100 flex p-1 shrink-0 z-20 overflow-x-auto no-scrollbar">
                    {['info', 'inventory', 'history'].map(section => (
                        <button 
                            key={section}
                            onClick={() => { setActiveSection(section as any); setShowAddForm(false); }}
                            className={`flex-1 py-3 px-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${activeSection === section ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
                        >
                            {section === 'info' ? 'HESAP' : section === 'inventory' ? 'ENVANTER' : 'TEKLİF'}
                        </button>
                    ))}
                </div>

                <div className={`${activeSection === 'info' ? 'flex' : 'hidden md:flex'} md:w-96 bg-slate-900 text-white flex-col shrink-0 relative overflow-hidden h-full min-w-0`}>
                    <div className="p-8 md:p-12 relative z-10 flex flex-col items-center text-center border-b border-white/5 bg-slate-950/50">
                        <div className="relative group mb-6">
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-[2.5rem] md:rounded-[3rem] p-1 shadow-2xl overflow-hidden relative border-2 border-white/10">
                                <LazyImage src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-[2.3rem] md:rounded-[2.8rem]" />
                                {(user.isVerified || user.sellerTier === 'onayli') && (
                                    <div className="absolute bottom-2 right-2 bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-xl animate-pulse">✓</div>
                                )}
                            </div>
                        </div>
                        <div className="w-full min-w-0">
                            <div className="flex items-center justify-center gap-2 mb-2 flex-wrap px-4">
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${user.sellerTier === 'onayli' ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'}`}>{user.sellerTier === 'onayli' ? 'ONAYLI PRO' : 'STANDART ÜYE'}</span>
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${user.isStore ? 'bg-blue-600 text-white' : 'bg-white/10 text-white'}`}>{user.isStore ? 'MAĞAZA' : 'BİREYSEL'}</span>
                            </div>
                            <h2 className="text-xl md:text-3xl font-display font-black uppercase italic tracking-tighter leading-none mb-1 truncate px-4">{user.name}</h2>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest truncate px-4">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 no-scrollbar">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">HESAP YÖNETİMİ</h4>
                            
                            {/* ONAYLI PRO TOGGLE */}
                            <button 
                                onClick={toggleProStatus} 
                                className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase transition-all shadow-lg flex items-center justify-center gap-2 ${user.sellerTier === 'onayli' ? 'bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500' : 'bg-emerald-600 text-white shadow-emerald-900/20'}`}
                            >
                                {user.sellerTier === 'onayli' ? '✓ PRO ONAYI KALDIR' : '✨ PRO ONAYI VER'}
                            </button>

                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase">Cüzdan Bakiye</p>
                                <p className="text-base font-black text-emerald-400 truncate ml-4">{formatPrice(user.walletBalance)}</p>
                            </div>
                            <button onClick={toggleStoreStatus} className="w-full py-3 rounded-2xl text-[10px] font-black uppercase transition-all shadow-lg shadow-black/20 bg-blue-700 text-white hover:bg-blue-800">{(user.isStore ? 'BİREYSEL YAP' : 'MAĞAZA YAP')}</button>
                            <button onClick={() => setIsEditUserOpen(true)} className="w-full py-3 rounded-2xl text-[10px] font-black uppercase transition-all shadow-lg shadow-black/20 bg-white/10 text-white hover:bg-white/20">ÜYELİK VERİLERİNİ DÜZENLE</button>
                        </div>
                        <div className="pt-4 border-t border-white/5 pb-20 md:pb-0">
                            <button onClick={() => { if(window.confirm("Kullanıcıyı silmek istediğinize emin misiniz?")) { deleteUser(user.id); onClose(); } }} className="w-full py-3 rounded-2xl text-[10px] font-black uppercase transition-all text-red-400 hover:bg-red-500/10">KULLANICIYI SİSTEMDEN SİL</button>
                        </div>
                    </div>
                </div>

                <div className={`${activeSection !== 'info' ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-[#fcfdfe] relative h-full overflow-hidden min-w-0`}>
                    
                    <div className="bg-white border-b border-slate-100 p-4 md:p-8 flex justify-between items-center shrink-0">
                        <div className="hidden md:flex gap-4 md:gap-8">
                            <button onClick={() => setActiveSection('inventory')} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all pb-2 border-b-2 ${(activeSection === 'inventory' ? 'text-slate-900 border-slate-900' : 'text-slate-400 border-transparent hover:text-slate-600')}`}>ENVANTER & İLANLAR</button>
                            <button onClick={() => setActiveSection('history')} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all pb-2 border-b-2 ${(activeSection === 'history' ? 'text-slate-900 border-slate-900' : 'text-slate-400 border-transparent hover:text-slate-600')}`}>TEKLİF GEÇMİŞİ</button>
                        </div>
                        <div className="flex-1 md:flex-none flex justify-center md:justify-end">
                            {!showAddForm && activeSection === 'inventory' && (
                                <button onClick={() => { setShowAddForm(true); setIsEditingItem(null); }} className="w-full md:w-auto bg-primary text-white px-8 py-3.5 rounded-xl font-black text-[10px] md:text-[11px] uppercase shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 italic">
                                    <span>ÜRÜN ENJEKTE ET</span> 🧪
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar pb-32">
                        {showAddForm ? (
                            <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-xl animate-fade-in mb-10 overflow-hidden">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-lg md:text-xl font-display font-black uppercase italic text-indigo-900 truncate">{(isEditingItem ? 'ÜRÜNÜ MODİFİYE ET' : 'YENİ ÜRÜN ENJEKSİYONU')}</h3>
                                    <button onClick={() => setShowAddForm(false)} className="text-slate-400 p-2 text-xl ml-4">✕</button>
                                </div>
                                <form onSubmit={handleAddItem} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 ml-1 uppercase">STRATEJİ</label><select value={listingStrategy} onChange={e => setListingStrategy(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-black text-xs outline-none"><option value="catalog">KATALOG (TASLAK)</option><option value="live">CANLI MEZAT (TAKVİMLİ)</option><option value="24h">24H HIZLI SATIŞ</option></select></div>
                                        <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 ml-1 uppercase">SLOT SEÇİMİ</label><select value={selectedSlotId} onChange={e => setSelectedSlotId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-black text-xs outline-none">{availableSlots.map(s => <option key={s.id} value={s.id}>{s.label} ({s.time})</option>)}</select></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 ml-1 uppercase">BAŞLIK</label><input required value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-xs outline-none" placeholder="Ürün Başlığı" /></div>
                                        <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 ml-1 uppercase">KONDİSYON</label><select value={newItem.condition} onChange={e => setNewItem({...newItem, condition: e.target.value as ProductCondition})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-black text-xs uppercase outline-none"><option value={ProductCondition.NEW}>YENİ</option><option value={ProductCondition.USED}>2. EL</option></select></div>
                                    </div>
                                    <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 ml-1 uppercase">DETAYLI AÇIKLAMA</label><textarea rows={3} value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-xs outline-none" placeholder="Ürün özelliklerini buraya yazın..." /></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 ml-1 uppercase">KATEGORİ</label><select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value as CategoryType})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-black text-xs uppercase">{CATEGORIES.map(c => <option key={c.id} value={c.id}>{(c.label as any)['tr']}</option>)}</select></div>
                                        <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 ml-1 uppercase">KONUM</label><input value={newItem.location} onChange={e => setNewItem({...newItem, location: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-xs" placeholder="Örn: Ankara" /></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 ml-1 uppercase">BAŞLANGIÇ</label><input type="number" required value={newItem.startPrice} onChange={e => setNewItem({...newItem, startPrice: parseFloat(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-black text-xs outline-none" /></div>
                                        <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 ml-1 uppercase">REZERV</label><input type="number" value={newItem.reservePrice} onChange={e => setNewItem({...newItem, reservePrice: parseFloat(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-black text-xs outline-none" /></div>
                                        <div className="space-y-1"><label className="text-[9px] font-black text-slate-400 ml-1 uppercase">HEMEN AL</label><input type="number" value={newItem.buyNowPrice} onChange={e => setNewItem({...newItem, buyNowPrice: parseFloat(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-black text-xs outline-none" /></div>
                                    </div>

                                    <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">MEDYA YÜKLEME (MAX 5 GÖRSEL + 1 VİDEO)</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <label className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-white transition-colors bg-white/50">
                                                <span className="text-xl">📸</span>
                                                <span className="text-[8px] font-black text-slate-400 uppercase">GÖRSEL EKLE</span>
                                                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                                            </label>
                                            <label className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-white transition-colors bg-white/50 ${newItem.videoUrl ? 'border-primary' : 'border-slate-200'}`}>
                                                <span className="text-xl">🎥</span>
                                                <span className="text-[8px] font-black text-slate-400 uppercase">{newItem.videoUrl ? 'VİDEO YÜKLENDİ' : 'VİDEO EKLE'}</span>
                                                <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                                            </label>
                                        </div>
                                        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                                            {newItem.images.map((img, i) => (
                                                <div key={i} className="w-16 h-16 rounded-lg border border-slate-200 overflow-hidden shrink-0 relative group">
                                                    <img src={img} className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => setNewItem(p => ({...p, images: p.images.filter((_, idx) => idx !== i)}))} className="absolute inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-black text-[8px]">SİL</button>
                                                </div>
                                            ))}
                                            {newItem.videoUrl && <div className="w-16 h-16 rounded-lg border border-indigo-200 bg-indigo-900 flex items-center justify-center shrink-0 text-lg relative group"><span className="animate-pulse">🎥</span><button type="button" onClick={() => setNewItem(p => ({...p, videoUrl: ''}))} className="absolute inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-black text-[8px]">SİL</button></div>}
                                        </div>
                                    </div>

                                    <button type="submit" disabled={isConvertingMedia} className="w-full bg-indigo-900 text-white font-black py-4 rounded-2xl shadow-xl uppercase text-xs tracking-widest italic disabled:opacity-50">
                                        {isConvertingMedia ? 'MEDYA İŞLENİYOR...' : (isEditingItem ? 'MODİFİKASYONLARI KAYDET' : 'HESABA ENJEKTE ET 💉')}
                                    </button>
                                </form>
                            </div>
                        ) : activeSection === 'inventory' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {user.inventory?.map(item => (
                                    <div key={item.id} className="bg-white p-4 rounded-[2.5rem] border border-slate-100 flex flex-col gap-4 relative group shadow-sm hover:shadow-lg transition-all h-full min-w-0">
                                        <div className="aspect-square rounded-3xl overflow-hidden relative bg-slate-50 shrink-0">
                                            <LazyImage src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                            <div className="absolute top-2 right-2 flex flex-col gap-2">
                                                <button onClick={() => startEdit(item)} className="w-8 h-8 bg-indigo-900 text-white rounded-xl flex items-center justify-center text-xs shadow-xl transition-transform active:scale-90">✎</button>
                                                <button onClick={() => { if(window.confirm("Bu ilanı iptal etmek istediğinize emin misiniz?")) cancelListing(item.id); }} className="w-8 h-8 bg-red-600 text-white rounded-xl flex items-center justify-center text-xs shadow-xl transition-transform active:scale-90">✕</button>
                                            </div>
                                            <div className="absolute bottom-2 left-2"><span className={`px-2 py-0.5 rounded-lg text-[7px] font-black uppercase shadow-lg ${(item.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white')}`}>{item.status}</span></div>
                                        </div>
                                        <div className="px-2 space-y-2 flex-grow min-w-0">
                                            <h4 className="text-xs md:text-sm font-black text-slate-900 uppercase italic truncate">{item.title}</h4>
                                            <div className="flex justify-between items-center gap-2">
                                                <p className="text-xs font-black text-indigo-950 truncate">{formatPrice(item.startPrice)}</p>
                                                <span className="text-[8px] font-bold text-slate-400 uppercase truncate">{(item.location?.split(',')[0])}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!user.inventory || user.inventory.length === 0) && (
                                     <div className="col-span-full py-12 text-center text-slate-300 font-black uppercase text-[10px] italic">Katalog boş.</div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {user.bidHistory?.map(bid => (
                                    <div key={bid.id} className="bg-white p-5 rounded-3xl border border-slate-100 flex justify-between items-center gap-4">
                                        <div className="flex gap-4 items-center min-w-0">
                                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 shrink-0"><LazyImage src={bid.auctionImage} alt={bid.auctionTitle} className="w-full h-full object-cover" /></div>
                                            <div className="min-w-0"><h4 className="text-xs font-black uppercase italic leading-tight mb-1 truncate">{bid.auctionTitle}</h4><p className="text-[9px] text-slate-400 font-bold uppercase truncate">{(new Date(bid.timestamp).toLocaleString())}</p></div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">TEKLİFİ</p>
                                            <p className="text-sm font-black text-indigo-900 leading-none">{formatPrice(bid.myBid)}</p>
                                        </div>
                                    </div>
                                ))}
                                {(!user.bidHistory || user.bidHistory.length === 0) && (
                                     <div className="col-span-full py-12 text-center text-slate-300 font-black uppercase text-[10px] italic">Teklif geçmişi bulunmuyor.</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const AdminPanel = () => {
    const { user: adminUser, allUsers, auctions, formatPrice, logout, adminDeleteAuction, auditLogs, adminUpdateUser, toggleUserBlock, deleteUser, language, showToast } = useApp();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedDealAuction, setSelectedDealAuction] = useState<AuctionItem | null>(null);
    const [editAuctionTarget, setEditAuctionTarget] = useState<AuctionItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    
    // Safety flag to handle immediate redirection during logout
    const isLoggingOut = useRef(false);

    useEffect(() => { 
        if (isLoggingOut.current) return;
        if (!adminUser || adminUser.role !== 'admin') navigate('/admin/login'); 
    }, [adminUser, navigate]);

    const activeDealsList = useMemo(() => auctions.filter(a => a.status === AuctionStatus.ACTIVE || a.status === AuctionStatus.ENDED), [auctions]);

    const handleSecureLogout = () => {
        isLoggingOut.current = true;
        logout();
        navigate('/', { replace: true });
    };

    const financialData = useMemo(() => {
        const soldItems = auctions.filter(a => a.status === AuctionStatus.ENDED);
        const commissionTotal = soldItems.reduce((acc, a) => acc + (a.currentBid * 0.10), 0);
        const boostFees = auctions.filter(a => a.isBoosted).length * 97;
        
        const listingFees = allUsers.reduce((acc, u) => {
            if (u.sellerTier !== 'onayli' && u.inventory && u.inventory.length > 1) {
                return acc + (u.inventory.length - 1) * 97;
            }
            return acc;
        }, 0);

        const proRents = allUsers.filter(u => u.sellerTier === 'onayli').length * 1250;
        const platformRevenue = commissionTotal + boostFees + listingFees + proRents;

        const sources = [
            { id: 'comm', label: 'KOMİSYON (%10)', amount: commissionTotal, color: 'bg-emerald-500' },
            { id: 'boost', label: 'BOOST REVENUE', amount: boostFees, color: 'bg-indigo-500' },
            { id: 'list', label: 'LİSTING FEES', amount: listingFees, color: 'bg-orange-500' },
            { id: 'rent', label: 'PRO WEEKLY RENT', amount: proRents, color: 'bg-blue-500' }
        ];

        const catStats = soldItems.reduce((acc: any, a) => {
            acc[a.category] = (acc[a.category] || 0) + a.currentBid;
            return acc;
        }, {});

        const topCategories = Object.entries(catStats)
            .sort(([, a]: any, [, b]: any) => b - a)
            .slice(0, 5)
            .map(([cat, val]) => ({
                id: cat,
                label: (CATEGORIES.find(c => c.id === cat)?.label as any)?.[language] || cat,
                value: val as number
            }));

        const syntheticLedger = [
            ...soldItems.map(a => ({ id: `comm-${a.id}`, type: 'Commission', amount: a.currentBid * 0.10, desc: a.title, date: new Date() })),
            ...auctions.filter(a => a.isBoosted).map(a => ({ id: `boost-${a.id}`, type: 'Boost', amount: 97, desc: a.title, date: new Date() })),
            ...allUsers.filter(u => u.sellerTier === 'onayli').map(u => ({ id: `rent-${u.id}`, type: 'Pro Rent', amount: 1250, desc: u.name, date: new Date() }))
        ].sort(() => 0.5 - Math.random()).slice(0, 10);

        return { commissionTotal, boostFees, listingFees, proRents, platformRevenue, sources, topCategories, syntheticLedger };
    }, [allUsers, auctions, language]);

    const stats = useMemo(() => {
        const activeAuctions = auctions.filter(a => a.status === AuctionStatus.ACTIVE);
        const totalUserWallets = allUsers.reduce((acc, u) => acc + u.walletBalance, 0);
        return {
            totalUsers: allUsers.length, activeAuctions: activeAuctions.length, activeDeals: activeDealsList?.length || 0,
            totalVolume: auctions.reduce((acc, a) => acc + a.currentBid, 0),
            totalUserWallets,
            platformRevenue: financialData.platformRevenue
        };
    }, [allUsers, auctions, activeDealsList, financialData]);

    const handleExportPDF = async () => {
        const reportElement = document.getElementById('admin-report-area');
        if (!reportElement) return;

        setIsExporting(true);
        showToast("PDF Raporu Oluşturuluyor...", "info");

        try {
            const canvas = await html2canvas(reportElement, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#fcfdfe'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Mazora-Analytics-${new Date().toISOString().split('T')[0]}.pdf`);
            showToast("Rapor başarıyla indirildi.", "success");
        } catch (err) {
            console.error(err);
            showToast("PDF oluşturulurken hata oluştu.", "error");
        } finally {
            setIsExporting(false);
        }
    };

    const filteredUsers = useMemo(() => {
        if (!searchQuery) return allUsers;
        const q = searchQuery.toLowerCase();
        return allUsers.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }, [allUsers, searchQuery]);

    if (!adminUser || adminUser.role !== 'admin') return null;

    return (
        <div className="min-h-screen bg-[#fcfdfe] flex flex-col md:flex-row font-sans pb-24 md:pb-0 overflow-hidden text-left">
            <UserCommandCenter user={selectedUser} isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} />
            <DealBidsModal auction={selectedDealAuction} isOpen={!!selectedDealAuction} onClose={() => setSelectedDealAuction(null)} />
            <EditAuctionModal auction={editAuctionTarget} isOpen={!!editAuctionTarget} onClose={() => setEditAuctionTarget(null)} />
            <CreateUserModal isOpen={isCreateUserModalOpen} onClose={() => setIsCreateUserModalOpen(false)} />
            
            <aside className="hidden md:flex w-64 bg-white border-r border-slate-100 flex-col sticky top-0 h-screen shrink-0 z-50">
                <div className="p-8 text-center border-b border-slate-50">
                    <Logo className="h-10 w-10 mb-2 mx-auto" />
                    <h1 className="text-base font-display font-black italic tracking-tighter text-slate-900 uppercase">MAZORA PRO</h1>
                </div>
                <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto no-scrollbar">
                    {['overview', 'users', 'deals', 'listings', 'finance', 'logs'].map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab as AdminTab)} 
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${(activeTab === tab ? 'bg-indigo-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50')}`}
                        >
                            {(tab === 'overview' ? 'RAPORLAR' : tab === 'finance' ? 'FİNANSAL' : tab === 'logs' ? 'AKTİVİTE' : tab.toUpperCase())}
                        </button>
                    ))}
                    <div className="pt-8 border-t border-slate-50 mt-8 space-y-2">
                        <Link to="/" className="w-full flex items-center gap-4 px-4 py-4 rounded-xl font-black text-[10px] uppercase text-indigo-900 bg-indigo-50 hover:bg-indigo-100 transition-colors shadow-sm">
                            🏠 MARKET'E DÖN
                        </Link>
                        <button onClick={handleSecureLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-black text-[10px] uppercase text-red-500 hover:bg-red transition-colors">
                            🚪 GÜVENLİ ÇIKIŞ
                        </button>
                    </div>
                </nav>
            </aside>

            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-indigo-950/95 backdrop-blur-md border-t border-white/10 z-[500] pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
                <div className="flex justify-around items-center h-16 px-2">
                    <button onClick={() => setActiveTab('overview')} className={`flex flex-col items-center justify-center w-full h-full ${(activeTab === 'overview' ? 'text-white scale-110' : 'text-white/40')}`}>
                        <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><path d="M4 6h16M4 12h16M4 18h16" /></svg>
                        <span className="text-[7px] font-black uppercase tracking-tight">RAPOR</span>
                    </button>
                    <button onClick={() => setActiveTab('users')} className={`flex flex-col items-center justify-center w-full h-full ${(activeTab === 'users' ? 'text-white scale-110' : 'text-white/40')}`}>
                        <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" /></svg>
                        <span className="text-[7px] font-black uppercase tracking-tight">ÜYELER</span>
                    </button>
                    <Link to="/" className="flex flex-col items-center justify-center w-full h-full relative -top-6">
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-indigo-900 shadow-2xl border-4 border-indigo-900 ring-2 ring-white/20 shrink-0">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        </div>
                        <span className="text-[7px] font-black uppercase text-white mt-1">MARKET</span>
                    </Link>
                    <button onClick={() => setActiveTab('finance')} className={`flex flex-col items-center justify-center w-full h-full ${(activeTab === 'finance' ? 'text-white scale-110' : 'text-white/40')}`}>
                        <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0V5a2 2 0 012-2h2a2 2 0 012 v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        <span className="text-[7px] font-black uppercase tracking-tight">FİNANSAL</span>
                    </button>
                    <button onClick={() => setActiveTab('logs')} className={`flex flex-col items-center justify-center w-full h-full ${(activeTab === 'logs' ? 'text-white scale-110' : 'text-white/40')}`}>
                        <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-[7px] font-black uppercase tracking-tight">AKTİVİTE</span>
                    </button>
                </div>
            </div>

            <main className="flex-1 p-4 md:p-8 overflow-y-auto no-scrollbar bg-[#fcfdfe] pb-32 md:pb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div className="min-w-0">
                        <h2 className="text-xl md:text-5xl font-display font-black uppercase italic text-slate-900 tracking-tighter italic leading-none truncate">
                            {(activeTab === 'overview' ? 'RAPORLAR' : activeTab === 'finance' ? 'FİNANSAL ANALİZ' : activeTab === 'logs' ? 'AKTİVİTE' : activeTab.toUpperCase())}
                        </h2>
                        <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mt-2 truncate">YÖNETİCİ KONTROL VE DENETİM SİSTEMİ</p>
                    </div>
                    {(activeTab === 'overview' || activeTab === 'finance') && (
                        <button 
                            onClick={handleExportPDF}
                            disabled={isExporting}
                            className="bg-indigo-950 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50"
                        >
                            {isExporting ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : "📥"}
                            EKSPORT PDF RAPOR
                        </button>
                    )}
                </div>
                
                <div id="admin-report-area">
                    {activeTab === 'overview' && (
                        <div className="space-y-12 animate-fade-in">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
                                <button onClick={() => setActiveTab('users')} className="bg-white border border-slate-100 p-4 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm relative overflow-hidden group hover:shadow-xl hover:border-blue-200 transition-all text-left min-w-0">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform"></div>
                                    <p className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10 leading-none">TOPLAM ÜYE</p>
                                    <p className="text-sm md:text-3xl font-black text-blue-600 tracking-tighter relative z-10 leading-none mt-2 truncate">{stats.totalUsers}</p>
                                </button>
                                <button onClick={() => setActiveTab('listings')} className="bg-white border border-slate-100 p-4 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm relative overflow-hidden group hover:shadow-xl hover:border-emerald-200 transition-all text-left min-w-0">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform"></div>
                                    <p className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10 leading-none">AKTİF MEZAT</p>
                                    <p className="text-sm md:text-3xl font-black text-emerald-600 tracking-tighter relative z-10 leading-none mt-2 truncate">{stats.activeAuctions}</p>
                                </button>
                                <button onClick={() => setActiveTab('deals')} className="bg-white border border-slate-100 p-4 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm relative overflow-hidden group hover:shadow-xl hover:border-orange-200 transition-all text-left min-w-0">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-orange-50 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform"></div>
                                    <p className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10 leading-none">AÇIK İŞLEM</p>
                                    <p className="text-sm md:text-3xl font-black text-orange-600 tracking-tighter relative z-10 leading-none mt-2 truncate">{stats.activeDeals}</p>
                                </button>
                                <button onClick={() => setActiveTab('finance')} className="bg-white border border-slate-100 p-4 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm relative overflow-hidden group hover:shadow-xl hover:border-indigo-200 transition-all text-left min-w-0">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform"></div>
                                    <p className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10 leading-none">PLATFORM REVENUE</p>
                                    <p className="text-sm md:text-3xl font-black text-indigo-900 tracking-tighter relative z-10 leading-none mt-2 truncate">{formatPrice(stats.platformRevenue)}</p>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                <div className="lg:col-span-8 bg-white border border-slate-100 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-sm">
                                    <div className="flex justify-between items-center mb-8 gap-4">
                                        <h3 className="text-sm md:text-xl font-display font-black text-slate-900 uppercase italic truncate">SON İŞLEMLER (CANLI)</h3>
                                        <span className="text-[8px] md:text-[9px] font-black text-emerald-500 animate-pulse uppercase whitespace-nowrap">LIVE ACTIVE</span>
                                    </div>
                                    <div className="space-y-3">
                                        {activeDealsList.slice(0, 5).map(deal => (
                                            <div key={deal.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all cursor-pointer gap-4 min-w-0" onClick={() => setSelectedDealAuction(deal)}>
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shrink-0 shadow-sm"><LazyImage src={deal.imageUrl} alt={deal.title} className="w-full h-full object-cover" /></div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-black text-xs text-gray-900 uppercase italic truncate">{deal.title}</h4>
                                                        <p className="text-[8px] text-slate-400 font-bold uppercase truncate">{deal.bids.length} TEKLİF</p>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-xs font-black text-indigo-900 leading-none mb-1">{formatPrice(deal.currentBid)}</p>
                                                    <span className={`text-[7px] font-black uppercase ${(deal.status === AuctionStatus.ENDED ? 'text-red-500' : 'text-emerald-500')}`}>{deal.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="lg:col-span-4 bg-indigo-900 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                    <div>
                                        <h3 className="text-xl font-display font-black uppercase italic mb-8">ADMIN ÖZETİ</h3>
                                        <div className="space-y-6">
                                            <div className="cursor-pointer group min-w-0" onClick={() => setActiveTab('finance')}><p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1 group-hover:text-white transition-colors">CÜZDAN TOPLAMI</p><p className="text-xl md:text-2xl font-black truncate">{formatPrice(stats.totalUserWallets)}</p></div>
                                            <div className="cursor-pointer group min-w-0" onClick={() => setActiveTab('finance')}><p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1 group-hover:text-white transition-colors">BOOST GELİRİ</p><p className="text-xl md:text-2xl font-black truncate">{formatPrice(financialData.boostFees)}</p></div>
                                            <div className="cursor-pointer group min-w-0" onClick={() => setActiveTab('finance')}><p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1 group-hover:text-white transition-colors">KOMİSYON HAVUZU</p><p className="text-xl md:text-2xl font-black truncate">{formatPrice(financialData.commissionTotal)}</p></div>
                                        </div>
                                    </div>
                                    <button onClick={() => setActiveTab('finance')} className="mt-8 w-full py-4 bg-white text-indigo-900 rounded-2xl font-black text-[10px] uppercase shadow-xl hover:scale-105 active:scale-95 transition-all">DETAYLI ANALİZ →</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'finance' && (
                        <div className="space-y-8 animate-fade-in text-left">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {financialData.sources.map(source => (
                                    <div key={source.id} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group">
                                        <div className={`absolute top-0 left-0 w-1 h-full ${source.color}`}></div>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{source.label}</p>
                                        <p className="text-xl font-black text-slate-900">{formatPrice(source.amount)}</p>
                                        <div className="mt-3 h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${source.color} transition-all duration-1000`} 
                                                style={{ width: `${(source.amount / financialData.platformRevenue) * 100}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-[8px] text-slate-400 font-bold mt-2 uppercase tracking-tight">TOTAL %{((source.amount / financialData.platformRevenue) * 100).toFixed(1)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                <div className="lg:col-span-7 space-y-6">
                                    <div className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-sm">
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 border-b border-slate-50 pb-4">Revenue Generation By Category</h3>
                                        <div className="space-y-6">
                                            {financialData.topCategories.map((cat, i) => (
                                                <div key={cat.id} className="space-y-2">
                                                    <div className="flex justify-between items-end">
                                                        <div>
                                                            <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest block mb-0.5">#{i+1} RANK</span>
                                                            <p className="text-xs font-black text-slate-900 uppercase italic truncate">{cat.label}</p>
                                                        </div>
                                                        <p className="text-sm font-black text-indigo-900">{formatPrice(cat.value * 0.10)} <span className="text-[8px] text-slate-400 font-bold">(COMM)</span></p>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-indigo-600 rounded-full transition-all duration-1000" 
                                                            style={{ width: `${(cat.value / financialData.topCategories[0].value) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase">Hammer Volume: {formatPrice(cat.value)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-5 bg-white border border-slate-100 p-8 rounded-[3rem] shadow-sm flex flex-col min-w-0">
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex justify-between items-center">
                                        <span>Recent Inflows</span>
                                        <span className="text-[8px] bg-slate-100 px-2 py-1 rounded text-slate-400">REALTIME</span>
                                    </h3>
                                    <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
                                        {financialData.syntheticLedger.map((tx) => (
                                            <div key={tx.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center gap-4 group hover:bg-white hover:shadow-md transition-all">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase ${
                                                            tx.type === 'Commission' ? 'bg-emerald-100 text-emerald-700' : 
                                                            tx.type === 'Boost' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                                                        }`}>{tx.type}</span>
                                                        <span className="text-[8px] text-slate-400 font-bold">{tx.date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                                    </div>
                                                    <p className="text-xs font-black text-slate-800 uppercase italic truncate">{tx.desc}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-sm font-black text-slate-900">+{formatPrice(tx.amount)}</p>
                                                    <span className="text-[7px] font-black text-emerald-500 uppercase">RECEIVED</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {activeTab === 'listings' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in">
                        {auctions.map(a => (
                            <div key={a.id} className="bg-white border border-slate-100 p-4 rounded-[2rem] shadow-sm flex flex-col gap-4 group hover:shadow-xl transition-all min-w-0">
                                <div className="flex gap-4 items-center min-w-0">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 shrink-0 shadow-sm"><LazyImage src={a.imageUrl} alt={a.title} className="w-full h-full object-cover" /></div>
                                    <div className="min-w-0">
                                        <h4 className="font-black text-[10px] text-gray-900 uppercase italic truncate">{a.title}</h4>
                                        <span className={`text-[7px] font-black px-1.5 py-0.5 rounded ${(a.condition === ProductCondition.NEW ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary')}`}>{a.condition}</span>
                                    </div>
                                </div>
                                <div className="px-2">
                                    <div className="flex justify-between items-center gap-2">
                                        <p className="text-[10px] font-black text-indigo-900 truncate">{formatPrice(a.currentBid)}</p>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase truncate">{(a.location?.split(',')[0])}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-auto">
                                    <button onClick={() => setEditAuctionTarget(a)} className="py-2 bg-indigo-900 text-white rounded-xl text-[8px] font-black uppercase shadow-lg shadow-indigo-900/10 active:scale-95 transition-transform">EDİT ⚙️</button>
                                    <button onClick={() => adminDeleteAuction(a.id)} className="py-2 bg-red-50 text-red-600 rounded-xl text-[8px] font-black uppercase active:scale-95 transition-transform">SİL</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredUsers.map(u => (
                            <div key={u.id} className="bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-sm flex flex-col group hover:shadow-xl transition-all min-w-0">
                                <div className="flex items-center gap-4 mb-4 min-w-0">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border-2 border-white shadow-lg overflow-hidden shrink-0 cursor-pointer relative" onClick={() => setSelectedUser(u)}>
                                        <LazyImage src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                                        {(u.isVerified || u.sellerTier === 'onayli') && (
                                            <div className="absolute bottom-0 right-0 bg-emerald-500 text-white w-4 h-4 rounded-full flex items-center justify-center border-white text-[8px]">✓</div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-xs font-black text-slate-900 uppercase italic truncate">{u.name}</h4>
                                        <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase ${(u.role === 'admin' ? 'bg-black text-white' : u.sellerTier === 'onayli' ? 'bg-emerald-500 text-white' : 'bg-indigo-100 text-indigo-700')}`}>{u.sellerTier === 'onayli' ? 'PRO' : u.role}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setSelectedUser(u)} className="flex-1 py-3 bg-indigo-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-indigo-900/10 active:scale-95 transition-all truncate px-2">YÖNETİM ⚙️</button>
                                    <button onClick={() => toggleUserBlock(u.id)} className={`p-3 rounded-xl transition-all shrink-0 ${(u.isBlocked ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100 active:scale-95')}`}>🚫</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="bg-white rounded-[2rem] border border-slate-100 p-4 md:p-8 shadow-sm overflow-hidden animate-fade-in min-w-0">
                        <div className="overflow-x-auto no-scrollbar -mx-4 px-4">
                            <table className="w-full text-left border-collapse">
                                <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-slate-50">
                                    <tr>
                                        <th className="pb-4 whitespace-nowrap pr-4">ZAMAN</th>
                                        <th className="pb-4 whitespace-nowrap pr-4">EYLEM</th>
                                        <th className="pb-4 whitespace-nowrap pr-4">YETKİLİ</th>
                                        <th className="pb-4 min-w-[120px]">DETAY</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs font-bold divide-y divide-slate-50">
                                    {auditLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-4 text-slate-400 whitespace-nowrap pr-4">{(new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}))}</td>
                                            <td className="py-4 font-black text-indigo-900 uppercase italic whitespace-nowrap pr-4">{log.action}</td>
                                            <td className="py-4 text-slate-900 uppercase whitespace-nowrap pr-4 truncate max-w-[80px]">{log.performedBy}</td>
                                            <td className="py-4 text-slate-500 italic break-words">{log.details}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {auditLogs.length === 0 && <div className="py-20 text-center text-slate-300 font-black uppercase text-[10px] italic">Log kaydı bulunmuyor.</div>}
                    </div>
                )}
            </main>
        </div>
    );
};
