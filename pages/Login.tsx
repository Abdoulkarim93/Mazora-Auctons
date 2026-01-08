import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context';

export const Login = () => {
    const { login, t, showToast } = useApp();
    const navigate = useNavigate();
    const passwordInputRef = useRef<HTMLInputElement>(null);
    
    const [mode, setMode] = useState<'user' | 'admin'>('user');
    const [identifier, setIdentifier] = useState(''); // Unified Identifier (Email or Phone)
    const [password, setPassword] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [isAdminLoading, setIsAdminLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const success = login(undefined, identifier, password); 
        if (success) {
            navigate('/profile');
        } else {
            showToast("Hatalı bilgiler. Lütfen tekrar deneyin.", "error");
        }
    };

    const handleQuickDemo = (demoId: string) => {
        setIdentifier(demoId);
        setPassword('');
        showToast(`Demo ID: ${demoId} seçildi. Lütfen giriş yapın.`, "info");
        
        if (passwordInputRef.current) {
            passwordInputRef.current.focus();
        }
    };

    const handleAdminGatewayLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAdminLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (adminPassword === '123') {
            login('admin', 'admin@mazora.com', adminPassword);
            navigate('/admin/dashboard');
            showToast("Yönetici girişi başarılı.", "success");
        } else {
            showToast('Hatalı Admin Şifresi.', 'error');
            setAdminPassword('');
        }
        setIsAdminLoading(false);
    };

    return (
        <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center md:py-12 py-5 px-4 bg-gray-50 relative animate-fade-in max-w-full overflow-hidden">
            <div className="max-w-md w-full flex flex-col bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-100">
                    <button onClick={() => setMode('user')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors ${mode === 'user' ? 'text-primary border-b-2 border-primary bg-white' : 'text-gray-400 bg-gray-50 hover:bg-gray-100'}`}>👤 Üye Girişi</button>
                    <button onClick={() => setMode('admin')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors ${mode === 'admin' ? 'text-gray-900 border-b-2 border-gray-900 bg-white' : 'text-gray-400 bg-gray-50 hover:bg-gray-100'}`}>⚙️ Admin</button>
                </div>

                <div className="p-6 md:p-10 text-center">
                    {mode === 'user' ? (
                        <>
                            <h2 className="text-xl md:text-3xl font-display font-black text-gray-900 mb-1.5 uppercase italic">{t('auth.loginTitle')}</h2>
                            <p className="text-[10px] md:text-sm text-gray-500 font-bold uppercase">{t('auth.loginSubtitle')}</p>
                            
                            <form className="mt-6 w-full space-y-4" onSubmit={handleLogin}>
                                <div className="space-y-4">
                                    <input required type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="appearance-none rounded-lg block w-full px-4 py-3 border border-gray-300 text-gray-900 focus:ring-primary focus:border-primary text-sm font-bold text-center" placeholder={t('auth.emailLabel')} />
                                    <div className="relative">
                                        <input 
                                            ref={passwordInputRef}
                                            required 
                                            type="password" 
                                            value={password} 
                                            onChange={(e) => setPassword(e.target.value)} 
                                            className="appearance-none rounded-lg block w-full px-4 py-3 border border-gray-300 text-gray-900 focus:ring-primary focus:border-primary text-sm font-bold text-center" 
                                            placeholder={t('auth.passwordLabel')} 
                                        />
                                        <div className="flex justify-end mt-1.5">
                                            <Link to="/forgot-password" className="text-[10px] text-gray-400 font-bold hover:text-primary transition-colors uppercase tracking-tighter">
                                                {t('auth.forgotPassword')}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-4 text-xs md:text-sm font-black rounded-xl text-white bg-primary hover:bg-primary-800 shadow-lg uppercase tracking-widest transition-all">GİRİŞ YAP</button>
                            </form>

                            <div className="mt-8 space-y-3">
                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-3">Hızlı Demo Girişleri</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => handleQuickDemo('buyer@mazora.com')} className="bg-blue-50 p-3 rounded-xl border border-blue-100 hover:bg-blue-100 transition-all text-left group">
                                        <p className="text-[9px] text-blue-700 font-black uppercase group-hover:scale-105 transition-transform">🛒 ALICI (TR)</p>
                                    </button>
                                    <button onClick={() => handleQuickDemo('seller@mazora.com')} className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-all text-left group">
                                        <p className="text-[9px] text-indigo-700 font-black uppercase group-hover:scale-105 transition-transform">💼 SATICI (TR)</p>
                                    </button>
                                    <button onClick={() => handleQuickDemo('senegal@mazora.com')} className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-all text-left group">
                                        <p className="text-[9px] text-emerald-700 font-black uppercase group-hover:scale-105 transition-transform">🇸🇳 SENEGAL (XOF)</p>
                                    </button>
                                    <button onClick={() => handleQuickDemo('ghana@mazora.com')} className="bg-yellow-50 p-3 rounded-xl border border-yellow-200 hover:bg-yellow-100 transition-all text-left group">
                                        <p className="text-[9px] text-yellow-700 font-black uppercase group-hover:scale-105 transition-transform">🇬🇭 GHANA (GHS)</p>
                                    </button>
                                    <button onClick={() => handleQuickDemo('germany@mazora.com')} className="bg-slate-50 p-3 rounded-xl border border-slate-200 hover:bg-slate-100 transition-all text-left group">
                                        <p className="text-[9px] text-slate-700 font-black uppercase group-hover:scale-105 transition-transform">🇩🇪 ALMANYA (EUR)</p>
                                    </button>
                                    <button onClick={() => handleQuickDemo('qatar@mazora.com')} className="bg-red-50 p-3 rounded-xl border border-red-100 hover:bg-red-100 transition-all text-left group">
                                        <p className="text-[9px] text-red-700 font-black uppercase group-hover:scale-105 transition-transform">🇶🇦 QATAR (QAR)</p>
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <p className="text-sm text-gray-600 font-bold uppercase tracking-tight">
                                    Hesabınız yok mu? <Link to="/register" className="text-primary font-black hover:underline ml-1">KAYIT OL</Link>
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="animate-fade-in py-4">
                            <h2 className="text-xl md:text-3xl font-display font-black text-gray-900 mb-8 uppercase italic">SİSTEM YÖNETİCİSİ</h2>
                            <form onSubmit={handleAdminGatewayLogin} className="space-y-4">
                                <input required type="password" autoFocus value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="appearance-none rounded-lg block w-full px-4 py-3 border border-gray-300 text-gray-900 focus:ring-gray-900 focus:border-gray-900 text-sm font-bold text-center" placeholder="Yönetici Şifresi" />
                                <button type="submit" disabled={isAdminLoading} className="w-full bg-gray-900 text-white font-black py-4 rounded-xl shadow-lg uppercase tracking-widest text-xs flex justify-center items-center gap-2 transition-all active:scale-95">
                                    {isAdminLoading ? 'İŞLENİYOR...' : 'PANELE GİRİŞ YAP'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};