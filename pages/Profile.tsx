import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context.tsx';
import { Navigate, Link } from 'react-router-dom';
import { ProductCondition, FEE_STRUCTURE, CategoryType, InventoryStatus, InventoryItem, CATEGORIES, BuyerBid, User, AuctionStatus, AuctionItem } from '../types.ts';
import { TrustStepper, FeeBreakdown } from '../components/PostAuctionWorkflow.tsx';
import { LazyImage } from '../components/LazyImage.tsx';
import { verifyHumanFace } from '../services/geminiService.ts';

const EditProfileDrawer = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const { user, updateUser, showToast } = useApp();
    const [formData, setFormData] = useState({ name: '', address: '', avatarUrl: '', description: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [isCheckingFace, setIsCheckingFace] = useState(false);
    const [isFaceVerified, setIsFaceVerified] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                address: user.address || '',
                avatarUrl: user.avatarUrl || '',
                description: user.description || ''
            });
            setIsFaceVerified(!!user.avatarUrl);
        }
    }, [user, isOpen]);

    if (!user || !isOpen) return null;

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0] as File;
            setIsCheckingFace(true);
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Data = reader.result as string;
                const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
                
                if (user.isStore) {
                    setFormData(prev => ({ ...prev, avatarUrl: base64Data }));
                    setIsFaceVerified(true);
                    showToast("Mağaza logosu başarıyla yüklendi. 🏪", "success");
                    setIsCheckingFace(false);
                    return;
                }

                setFormData(prev => ({ ...prev, avatarUrl: base64Data }));
                const result = await verifyHumanFace(cleanBase64);
                setIsCheckingFace(false);
                if (result.isHuman) {
                    setIsFaceVerified(true);
                    showToast("Profil resmi doğrulandı! ✅", "success");
                } else {
                    setFormData(prev => ({ ...prev, avatarUrl: '' }));
                    setIsFaceVerified(false);
                    showToast("Yüz algılanamadı. Bireysel üyelik için net bir selfie kullanın. (Mağaza hesabı değilseniz logo yükleyemezsiniz)", "error");
                }
            };
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(r => setTimeout(r, 600));
        updateUser(formData);
        setIsSaving(false);
        onClose();
        showToast("Profil başarıyla güncellendi.", "success");
    };

    return (
        <div className="fixed inset-0 z-[200] flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-lg bg-white h-full shadow-2xl animate-fade-in-right overflow-y-auto flex flex-col border-l border-gray-100">
                <div className="bg-gray-900 p-6 md:p-8 text-white relative overflow-hidden">
                    <h3 className="text-lg md:text-xl font-display font-black uppercase tracking-widest italic relative z-10">Profil Ayarları</h3>
                    <button onClick={onClose} className="absolute top-6 right-6 md:top-8 md:right-8 text-white/50 hover:text-white">✕</button>
                </div>
                <div className="p-6 md:p-8 space-y-6 flex-grow">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                            <LazyImage src={formData.avatarUrl || user.avatarUrl} alt={user.name} className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-gray-50 shadow-xl object-cover" />
                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                <span className="text-white text-[9px] md:text-[10px] font-black uppercase">Değiştir</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isCheckingFace} />
                            </label>
                            {isCheckingFace && <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-full"><span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></span></div>}
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            {user.isStore ? 'Mağaza logonuzu yükleyebilirsiniz.' : 'Görünürlük için net bir selfie seçin.'}
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Ad Soyad</label>
                            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 font-bold text-sm focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Profil Açıklaması (Mağaza Hakkında)</label>
                            <input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 font-bold text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="Mağazanız hakkında kısa bilgi..." />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">İletişim & Teslimat Adresi</label>
                            <textarea rows={3} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 font-medium text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="Teslimat randevuları için bu adres kullanılacaktır." />
                        </div>
                    </div>
                </div>
                <div className="p-4 md:p-6 bg-gray-50 border-t border-gray-100">
                    <button onClick={handleSave} disabled={isSaving || isCheckingFace} className="w-full bg-primary text-white font-black py-4 md:py-5 rounded-xl shadow-xl uppercase tracking-widest text-[10px] active:scale-95 transition-all">
                        {isSaving ? 'KAYDEDİLİYOR...' : 'GÜNCELLE'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const EditInventoryDrawer = ({ item, isOpen, onClose }: { item: InventoryItem | null, isOpen: boolean, onClose: () => void }) => {
    const { updateInventoryItem, language, auctions, formatPrice, cancelListing, moveLiveToDraft, showToast, maskName } = useApp();
    const [formData, setFormData] = useState({ title: '', description: '', category: CategoryType.ELECTRONICS, subcategory: '', condition: ProductCondition.USED, location: '', images: [] as string[] });
    const [isSaving, setIsSaving] = useState(false);
    const [previewMedia, setPreviewMedia] = useState<{type: 'image' | 'video', url: string} | null>(null);

    const currentAuction = useMemo(() => auctions.find(a => a.id === item?.id), [item, auctions]);

    useEffect(() => {
        if (item) {
            setFormData({ title: item.title, description: item.description || '', category: item.category, subcategory: item.subcategory || '', condition: item.condition, location: item.location || '', images: item.images || (item.imageUrl ? [item.imageUrl] : []) });
        }
    }, [item]);

    if (!item || !isOpen) return null;

    const isLive = item.status === 'active' || item.status === 'scheduled';
    const isPostAuction = ['sold', 'shipped', 'delivered', 'returned', 'penalized'].includes(item.status);

    const handleSave = async () => {
        if (!formData.title.trim()) { showToast("Başlık boş bırakılamaz.", "error"); return; }
        setIsSaving(true);
        await new Promise(r => setTimeout(r, 600));
        updateInventoryItem(item.id, { ...formData, imageUrl: formData.images[0] });
        setIsSaving(false);
        onClose();
        showToast("Ürün başarıyla güncellendi.", "success");
    };

    const handleMoveToCatalog = () => {
        if (window.confirm("Bu mezatı durdurup ürünü kataloğunuza geri taşımak istediğinize emin misiniz?")) {
            moveLiveToDraft(item.id);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            {previewMedia && (
                <div className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-4 animate-fade-in" onClick={() => setPreviewMedia(null)}>
                    <div className="max-w-4xl w-full flex items-center justify-center relative h-[80vh]">
                        {previewMedia.type === 'image' ? <img src={previewMedia.url} alt="Detail" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" /> : <video src={previewMedia.url} controls autoPlay className="max-w-full max-h-full rounded-xl shadow-2xl" />}
                        <button className="absolute top-0 right-0 m-4 bg-white/10 text-white w-10 h-10 rounded-full">✕</button>
                    </div>
                </div>
            )}
            <div className="relative w-full max-w-lg bg-white h-full shadow-2xl animate-fade-in-right overflow-y-auto flex flex-col border-l border-indigo-900/10 no-scrollbar text-left">
                <div className="bg-indigo-900 p-6 md:p-8 text-white relative overflow-hidden flex-shrink-0">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="flex justify-between items-center relative z-10 mb-4">
                        <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-lg">Ürün Modifikasyonu</span>
                        <button onClick={onClose} className="text-xl p-1">✕</button>
                    </div>
                    <h2 className="text-xl md:text-2xl font-display font-black uppercase tracking-tight italic relative z-10 truncate">{item.title}</h2>
                </div>
                <div className="p-6 md:p-8 space-y-8 flex-grow">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center"><h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">YÜKLENEN MEDYALAR ({formData.images.length}/5)</h3></div>
                        <div className="grid grid-cols-4 gap-2">
                            {formData.images.map((img, idx) => (
                                <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100 cursor-pointer hover:opacity-80 transition-opacity shadow-sm relative group">
                                    <LazyImage src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" onClick={() => setPreviewMedia({type: 'image', url: img})} />
                                    {!isPostAuction && <button onClick={() => setFormData(p => ({...p, images: p.images.filter((_, i) => i !== idx)}))} className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">✕</button>}
                                </div>
                            ))}
                        </div>
                    </div>
                    {isLive && currentAuction && (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 space-y-4">
                            <div className="flex justify-between items-center"><h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">CANLI TAKİP</h3><span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full">AKTİF</span></div>
                            <div className="flex justify-between items-center"><div><p className="text-[10px] font-bold text-indigo-400 uppercase">Güncel Teklif</p><p className="text-2xl font-black text-indigo-900">{formatPrice(currentAuction.currentBid)}</p></div><div className="text-right"><p className="text-[10px] font-bold text-indigo-400 uppercase">Teklif Sayısı</p><p className="text-xl font-black text-indigo-900">{currentAuction.bids?.length || 0}</p></div></div>
                        </div>
                    )}
                    <div className="space-y-6">
                        <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">İlan Başlığı</label><input disabled={isPostAuction} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 font-bold text-sm focus:ring-2 focus:ring-indigo-600 outline-none disabled:opacity-50" /></div>
                        <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Açıklama</label><textarea disabled={isPostAuction} rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 font-medium text-sm focus:ring-2 focus:ring-indigo-600 outline-none disabled:opacity-50" /></div>
                    </div>
                </div>
                <div className="p-4 md:p-6 bg-gray-50 border-t border-gray-100 space-y-3 shrink-0">
                    {!isPostAuction && <button onClick={handleSave} disabled={isSaving} className="w-full bg-indigo-900 text-white font-black py-4 rounded-xl shadow-xl uppercase tracking-widest text-[10px] active:scale-95 transition-all">{isSaving ? 'GÜNCELLENİYOR...' : 'DEĞİŞİKLİKLERİ KAYDET'}</button>}
                    {isLive && <button onClick={handleMoveToCatalog} className="w-full bg-white text-indigo-900 border border-indigo-100 font-black py-4 rounded-xl uppercase tracking-widest text-[10px] hover:bg-indigo-50 transition-colors">MEZATI DURDUR & KATALOĞA AL</button>}
                    <div className="flex gap-2"><button onClick={() => { if(window.confirm("İlanı tamamen silecek misiniz?")) { cancelListing(item.id); onClose(); } }} className="flex-1 bg-white text-red-500 border border-red-100 font-black py-3 rounded-xl uppercase tracking-widest text-[9px] hover:bg-red-50">SİL</button><button onClick={onClose} className="flex-1 bg-gray-200 text-gray-600 font-black py-3 rounded-xl uppercase tracking-widest text-[9px]">VAZGEÇ</button></div>
                </div>
            </div>
        </div>
    );
};

export const Profile = () => {
    const { user, logout, formatPrice } = useApp();
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'referrals'>('active');

    if (!user) return <Navigate to="/login" />;

    const myInventory = user.inventory || [];
    const myBids = user.bidHistory || [];
    const activeInventory = myInventory.filter(i => ['active', 'draft', 'scheduled'].includes(i.status));
    const activeBids = myBids.filter(b => ['winning', 'outbid', 'pending_seller'].includes(b.status));
    const completedItems = user.role === 'seller' ? myInventory.filter(i => ['sold', 'shipped', 'delivered'].includes(i.status)) : myBids.filter(b => b.status === 'won');

    const isVerifiedUser = user.isVerified || user.sellerTier === 'onayli';

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-12 animate-fade-in text-left">
            <EditProfileDrawer isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
            <EditInventoryDrawer item={editingItem} isOpen={!!editingItem} onClose={() => setEditingItem(null)} />

            <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden mb-6 md:mb-12">
                <div className="bg-primary h-24 md:h-48 relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                </div>
                <div className="px-6 pb-6 md:px-10 md:pb-10 -mt-10 md:-mt-16 relative flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-8">
                        <div className="relative">
                            <LazyImage src={user.avatarUrl} alt={user.name} className="w-24 h-24 md:w-40 md:h-40 rounded-[2rem] md:rounded-[3.5rem] border-4 md:border-8 border-white shadow-2xl object-cover bg-white" />
                            {isVerifiedUser && (
                                <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-emerald-500 text-white w-6 h-6 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 md:border-4 border-white shadow-lg font-bold text-[10px] md:text-base animate-pulse">✓</div>
                            )}
                        </div>
                        <div className="text-center md:text-left">
                            <div className="flex flex-col md:flex-row items-center md:items-baseline gap-2 mb-1">
                                <h1 className="text-xl md:text-4xl font-display font-black text-gray-900 uppercase italic tracking-tighter leading-none">{user.name}</h1>
                                {isVerifiedUser && <span className="bg-emerald-600 text-white text-[7px] md:text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1 shadow-sm">ONAYLI PRO <span className="w-1 h-1 bg-white rounded-full animate-ping"></span></span>}
                            </div>
                            <p className="text-gray-400 font-bold uppercase text-[9px] md:text-[11px] tracking-[0.2em]">@{user.username || user.email.split('@')[0]} • {user.role === 'seller' ? (user.sellerTier === 'onayli' ? 'Onaylı Satıcı' : 'Bireysel Satıcı') : 'Alıcı Üye'}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 md:gap-4 w-full md:w-auto">
                        <button onClick={() => setIsEditProfileOpen(true)} className="flex-1 md:flex-none bg-gray-100 text-gray-600 font-black px-4 py-2.5 md:px-8 md:py-4 rounded-xl uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-gray-200 transition-colors">Ayarlar</button>
                        <button onClick={logout} className="flex-1 md:flex-none bg-red-50 text-red-600 font-black px-4 py-2.5 md:px-8 md:py-4 rounded-xl uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-red-100 transition-colors">Çıkış</button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 border-t border-gray-100 divide-x divide-gray-100">
                    <div className="p-4 md:p-8 text-center"><p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Bakiye</p><p className="text-base md:text-2xl font-black text-indigo-900 leading-tight">{formatPrice(user.walletBalance)}</p></div>
                    <div className="p-4 md:p-8 text-center"><p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Güven</p><p className="text-base md:text-2xl font-black text-emerald-600 leading-tight">%{user.reputationScore}</p></div>
                    <div className="p-4 md:p-8 text-center"><p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">İşlem</p><p className="text-base md:text-2xl font-black text-gray-900 leading-tight">{user.participationCount}</p></div>
                    <div className="p-4 md:p-8 text-center"><p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Yıl</p><p className="text-base md:text-2xl font-black text-gray-900 leading-tight">{new Date(user.joinedDate).getFullYear()}</p></div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar bg-slate-50/30">
                    {['Aktif İşlemler', 'Geçmiş', 'Referanslar'].map((t, i) => (
                        <button key={t} onClick={() => setActiveTab(['active', 'completed', 'referrals'][i] as any)} className={`flex-1 min-w-[120px] py-4 md:py-6 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${activeTab === ['active', 'completed', 'referrals'][i] ? 'text-primary border-b-4 border-primary bg-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>{t}</button>
                    ))}
                </div>

                <div className="p-4 md:p-10">
                    {activeTab === 'active' && (
                        <div className="space-y-12">
                            {activeInventory.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-4 mb-6 px-2"><h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">İLANLARIM & ÜRÜNLERİM</h3><div className="h-[1px] flex-1 bg-gray-100"></div></div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                                        {activeInventory.map((item: any) => (
                                            <div key={item.id} className="group bg-slate-50 rounded-[2.5rem] border border-slate-100 p-4 md:p-6 hover:shadow-2xl hover:bg-white transition-all">
                                                <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-4 bg-white border border-slate-100 shadow-inner"><LazyImage src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /><div className="absolute top-3 left-3 flex flex-col gap-1"><span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase shadow-lg border border-white/20 ${item.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'}`}>{item.status}</span></div></div>
                                                <h4 className="font-black text-sm text-gray-900 uppercase italic truncate mb-1 leading-none">{item.title}</h4>
                                                <p className="text-[11px] font-black text-primary mb-4 tracking-tighter">{formatPrice(item.startPrice)}</p>
                                                <button onClick={() => setEditingItem(item)} className="w-full py-3 bg-white border border-gray-200 text-gray-600 font-black text-[10px] uppercase rounded-xl hover:bg-indigo-900 hover:text-white hover:border-indigo-900 transition-all shadow-sm">İlanı Yönet / Düzenle</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'completed' && (
                        <div className="space-y-6 md:space-y-12">
                            {completedItems.length > 0 ? completedItems.map((item: any) => (
                                <div key={item.id} className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-start animate-fade-in">
                                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 md:p-8 flex gap-6 shadow-sm group hover:shadow-xl transition-all">
                                        <div className="w-20 h-20 md:w-32 md:h-32 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shrink-0 shadow-lg"><LazyImage src={(user.role as any) === 'seller' ? item.imageUrl : item.auctionImage} alt="Completed" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /></div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center"><span className="bg-emerald-100 text-emerald-700 text-[8px] font-black px-2 py-0.5 rounded uppercase mb-2 inline-block self-start">İŞLEM BAŞLADI ✅</span><h4 className="font-display font-black text-lg md:text-2xl text-gray-900 uppercase italic truncate mb-2 leading-tight tracking-tighter">{(user.role as any) === 'seller' ? item.title : item.auctionTitle}</h4><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(item.timestamp || item.createdAt).toLocaleDateString()}</p></div>
                                    </div>
                                    <div className="space-y-6">
                                        {/* Cast role explicitly to handle potential 'admin' value from user.role */}
                                        <TrustStepper item={item} role={user.role as 'buyer' | 'seller'} />
                                        <FeeBreakdown baseAmount={(user.role as any) === 'seller' ? (item.reservePrice || item.startPrice) : item.myBid} condition={item.condition} role={user.role as 'buyer' | 'seller'} isBoosted={item.isBoosted} />
                                    </div>
                                </div>
                            )) : <div className="py-20 md:py-32 text-center text-gray-300"><span className="text-5xl md:text-7xl block mb-6 opacity-20 grayscale">🏁</span><p className="font-black uppercase tracking-widest text-xs italic">Henüz tamamlanan bir işleminiz yok.</p></div>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};