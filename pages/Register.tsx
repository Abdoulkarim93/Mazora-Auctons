
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useApp } from '../context';
import { verifyHumanFace } from '../services/geminiService';
import { SellerTier, FEE_STRUCTURE } from '../types';
import { LazyImage } from '../components/LazyImage';

export const AGREEMENT_TEXT = {
    tr: `MAZORA YÖNETİLEN TİCARET VE KULLANIM SÖZLEŞMESİ\n\n1. SADECE BOOST ÜCRETİ ONLİNE: Satıcılar ilan öne çıkarma (Boost) için ₺97 ücreti kartla online öder.\n2. TESLİMATTA TAHSİLAT: Mezat bitiminde hem alıcı hem satıcı için geçerli %5 komisyon ve ürün hammer bedeli, sadece TESLİMAT ANINDA Mazora temsilcisine ödenir.\n3. 60 DAKİKA RANDEVU SÖZÜ: Mezat bittiği an 60 dakikalık lojistik planlama süreci başlar.\n4. BAĞLAYICI TEKLİF: Her teklif yasal bir taahhüttür. Teslimat anında ödeme reddi durumunda %10 cezai şart uygulanır.\n\n⚠️ YASAL TAAHHÜT: Mazora ekibi teslimat anında ödemeyi tahsil ederek her iki tarafın güvenliğini fiziken sağlar.`, 
    en: `MAZORA MANAGED TRADE & USAGE AGREEMENT\n\n1. ONLY BOOST FEE ONLINE: Sellers pay ₺97 via card online only for Visibility Boost services.\n2. COLLECTION AT DELIVERY: The 5% commission for both parties and the hammer price are collected ONLY AT DELIVERY by the Mazora representative.\n3. 60-MINUTE SCHEDULING: Immediately after an auction close, our 60-minute logistics planning guarantee begins.\n4. BINDING BIDS: Every bid is a legal contract. Rejecting payment at the moment of delivery results in a 10% legal penalty.\n\n⚠️ LEGAL COMMITMENT: Mazora team physically guarantees trust by collecting payments and handing over the product at the point of delivery.`
};

export const Register = () => {
    const { register, t, showToast, language } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [role, setRole] = useState<'buyer' | 'seller'>(location.state?.role || 'buyer');
    const [sellerTier, setSellerTier] = useState<SellerTier>(location.state?.tier || 'quick');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('+90 '); 
    const [referralCode, setReferralCode] = useState(''); 
    
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isCheckingFace, setIsCheckingFace] = useState(false);
    const [isFaceVerified, setIsFaceVerified] = useState(false);
    const [showAgreement, setShowAgreement] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const rewardEligible = location.state?.rewardEligible || false;
    const isFromQuickSell = location.state?.fromQuickSell || false;

    useEffect(() => {
        if (isFromQuickSell) {
            setRole('seller');
            setSellerTier('quick');
        }
    }, [isFromQuickSell]);

    const handleStep1Submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            showToast("Şifre en az 6 karakter olmalıdır.", "error");
            return;
        }
        if (password !== confirmPassword) {
            showToast("Şifreler uyuşmuyor!", "error");
            return;
        }
        setShowAgreement(true);
    };

    const handleAcceptAgreement = async () => {
        setShowAgreement(false);
        setStep(2);
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarUrl(URL.createObjectURL(file));
            setIsCheckingFace(true);
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64 = (reader.result as string).split(',')[1];
                const result = await verifyHumanFace(base64);
                setIsCheckingFace(false);
                if (result.isHuman) {
                    setIsFaceVerified(true);
                    showToast("Profil resmi doğrulandı!", "success");
                } else {
                    setAvatarUrl(null);
                    showToast("Yüz algılanamadı. Net bir selfie kullanın.", "error");
                }
            };
        }
    };

    const handleRegisterFinal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (role === 'seller' && !address) {
            showToast("Satıcı olarak devam etmek için adres bilgisi zorunludur.", "error");
            return;
        }
        setIsSubmitting(true);
        try {
            await register({
                name, email, role, phone, password, address, referralCode, 
                avatarUrl: avatarUrl || undefined, rewardEligible, sellerTier
            });
            setStep(3);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getAgreementText = () => (AGREEMENT_TEXT as any)[language] || AGREEMENT_TEXT['tr'];

    return (
        <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center py-4 md:py-12 px-4 bg-gray-50 animate-fade-in max-w-full overflow-hidden text-left">
            <div className={`max-w-2xl w-full flex flex-col items-center space-y-4 bg-white p-6 md:p-10 rounded-3xl shadow-2xl border border-gray-100 relative overflow-hidden transition-all duration-500`}>
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${role === 'seller' ? 'from-indigo-900 to-indigo-700' : 'from-primary via-secondary to-primary'}`}></div>

                <div className="flex items-center justify-center space-x-1.5 mb-2">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className={`h-1 w-6 rounded-full transition-colors ${step >= s ? (role === 'seller' ? 'bg-indigo-900' : 'bg-primary') : 'bg-gray-100'}`}></div>
                    ))}
                </div>

                <div className="text-center">
                    <h2 className={`text-2xl md:text-3xl font-display font-black text-gray-900 tracking-tighter leading-tight uppercase italic ${role === 'seller' ? 'text-indigo-900' : ''}`}>
                        {step === 1 ? (role === 'seller' ? 'SATICI KAYDI' : 'ALICI KAYDI') : step === 2 ? t('auth.govIdTitle') : 'BAŞARILI!'}
                    </h2>
                </div>
                
                {step === 1 && (
                    <div className="w-full">
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <button onClick={() => setRole('buyer')} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${role === 'buyer' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 bg-gray-50 text-gray-400'}`}>
                                <span className="text-2xl">🛍️</span>
                                <span className="text-xs font-black uppercase">ALICIYIM</span>
                            </button>
                            <button onClick={() => setRole('seller')} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${role === 'seller' ? 'border-indigo-900 bg-indigo-900 text-white' : 'border-gray-100 bg-gray-50 text-gray-400'}`}>
                                <span className="text-2xl">💼</span>
                                <span className="text-xs font-black uppercase">SATICIYIM</span>
                            </button>
                        </div>

                        {role === 'seller' && !isFromQuickSell && (
                            <div className="mb-8 overflow-x-auto">
                                <table className="w-full text-left text-xs border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                    <thead className="bg-gray-50 font-black uppercase tracking-widest text-gray-400">
                                        <tr>
                                            <th className="p-4">Özellik</th>
                                            <th className="p-4">Hızlı Kayıt</th>
                                            <th className="p-4">Onaylı Satıcı</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 font-bold">
                                        <tr>
                                            <td className="p-4">İlan Ücreti</td>
                                            <td className="p-4 text-orange-600">İlk İlan ÜCRETSİZ / {FEE_STRUCTURE.QUICK_LISTING_FEE_TL} TL</td>
                                            <td className="p-4 text-green-600">Ücretsiz</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4">Abonelik</td>
                                            <td className="p-4">Yok</td>
                                            <td className="p-4 text-indigo-600">1250 TL / Hafta</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4">Tekrar Listeleme</td>
                                            <td className="p-4">Max 2 Gün Penceresi</td>
                                            <td className="p-4 text-green-600">Sınırsız</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div className="mt-4 flex gap-2 justify-center">
                                    <button onClick={() => setSellerTier('quick')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase ${sellerTier === 'quick' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-400'}`}>Hızlı Kayıt Seç</button>
                                    <button onClick={() => setSellerTier('onayli')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase ${sellerTier === 'onayli' ? 'bg-indigo-900 text-white' : 'bg-gray-100 text-gray-400'}`}>Onaylı Satıcı Seç</button>
                                </div>
                            </div>
                        )}

                        <form className="space-y-4 w-full" onSubmit={handleStep1Submit}>
                            <input required value={name} onChange={(e) => setName(e.target.value)} className="appearance-none rounded-2xl block w-full px-5 py-4 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-primary outline-none font-bold text-sm" placeholder="Ad Soyad" />
                            <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="appearance-none rounded-2xl block w-full px-5 py-4 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-primary outline-none font-bold text-sm" placeholder="Telefon" />
                            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none rounded-2xl block w-full px-5 py-4 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-primary outline-none font-bold text-sm" placeholder="E-posta" />
                            
                            <div className="relative">
                                <input required type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none rounded-2xl block w-full px-5 py-4 border border-gray-200 text-gray-900 focus:ring-2 focus:ring-primary outline-none font-bold text-sm" placeholder="Şifre" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary p-2">
                                    {showPassword ? "👁️" : "👁️‍🗨️"}
                                </button>
                            </div>

                            <input required type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`appearance-none rounded-2xl block w-full px-5 py-4 border transition-colors focus:ring-2 outline-none font-bold text-sm ${confirmPassword && password !== confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-primary'}`} placeholder="Şifreyi Onayla" />

                            <button type="submit" className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-xl uppercase tracking-widest transition-transform active:scale-95">DEVAM ET 🚀</button>
                        </form>
                    </div>
                )}

                {step === 2 && (
                    <div className="w-full flex flex-col items-center space-y-6 animate-fade-in">
                        <div className="w-full space-y-4 text-left">
                            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Profil Selfie (Doğrulama)</label>
                            <div className="relative group mx-auto w-32 h-32 mb-4">
                                <LazyImage src={avatarUrl} alt="Selfie" className="w-full h-full rounded-full border-4 border-gray-50 shadow-xl object-cover" />
                                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                    <span className="text-white text-[10px] font-black uppercase">Yükle</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isCheckingFace} />
                                </label>
                                {isCheckingFace && <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-full animate-spin"><span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span></div>}
                            </div>
                            
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Açık Adres (Teslimat için Zorunlu)</label>
                                <textarea required value={address} onChange={(e) => setAddress(e.target.value)} className="rounded-2xl block w-full px-5 py-4 border border-gray-200 focus:ring-2 focus:ring-primary outline-none font-bold text-sm" rows={3} placeholder="İl, İlçe ve Mahalle belirterek tam adresinizi girin."></textarea>
                            </div>
                        </div>
                        <button onClick={handleRegisterFinal} disabled={isSubmitting || (role === 'seller' && !isFaceVerified)} className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-xl uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                            {isSubmitting ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Kaydı Bitir ve Devam Et'}
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div className="w-full flex flex-col items-center py-8 space-y-8 animate-fade-in text-center">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto text-5xl shadow-inner animate-bounce">✓</div>
                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">HOŞ GELDİN!</h3>
                        <p className="text-sm text-gray-500 font-bold uppercase">Kaydınız tamamlandı. Mezat dünyasına giriş yapabilirsiniz.</p>
                        <button onClick={() => navigate(isFromQuickSell ? '/sell' : '/profile', { state: location.state })} className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-2xl uppercase tracking-widest text-sm">DEVAM ET 🚀</button>
                    </div>
                )}
            </div>

            {showAgreement && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col border-t-8 border-primary text-center p-8 md:p-12">
                        <h2 className="text-xl md:text-2xl font-display font-black text-gray-900 mb-6 uppercase tracking-tighter italic">SÖZLEŞME</h2>
                        <div className="h-64 overflow-y-auto bg-gray-50 border border-gray-100 rounded-2xl p-6 text-[11px] text-gray-600 whitespace-pre-wrap font-mono mb-8 leading-loose text-left shadow-inner">
                            {getAgreementText()}
                        </div>
                        <div className="flex gap-4 w-full">
                            <button onClick={() => setShowAgreement(false)} className="flex-1 py-4 text-gray-400 font-black hover:bg-gray-100 rounded-2xl text-[10px] uppercase tracking-widest transition-colors">İPTAL</button>
                            <button onClick={handleAcceptAgreement} className="flex-1 py-4 bg-primary hover:bg-primary-800 text-white font-black rounded-2xl shadow-xl text-[10px] uppercase tracking-widest transition-transform active:scale-95">KABUL EDİYORUM</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
