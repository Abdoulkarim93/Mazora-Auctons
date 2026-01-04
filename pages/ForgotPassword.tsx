
import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context';

export const ForgotPassword = () => {
    const { t } = useApp();

    return (
        <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 bg-gray-50">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 animate-fade-in text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🔑</div>
                <h2 className="text-2xl md:text-3xl font-display font-black text-gray-900 uppercase italic tracking-tighter">
                    {t('auth.forgotPassword')}
                </h2>
                <p className="mt-4 text-sm text-gray-500 font-bold leading-relaxed uppercase">
                    Güvenlik protokolümüz gereği, şifre sıfırlama işlemleri temsilci doğrulaması ile yapılmaktadır.
                </p>

                <div className="bg-blue-900 text-white p-8 rounded-3xl space-y-4 shadow-xl border-4 border-blue-950">
                    <p className="text-[10px] font-black tracking-widest uppercase opacity-70 italic">DOĞRULAMA HATTI</p>
                    <a href="tel:+905423028821" className="text-xl md:text-2xl font-black block hover:scale-105 transition-transform">
                        +90 542 302 88 21
                    </a>
                    <p className="text-[9px] font-bold opacity-60 leading-tight">
                        WhatsApp üzerinden veya arayarak ID doğrulamanızı yaptırıp yeni şifrenizi alabilirsiniz.
                    </p>
                </div>

                <div className="pt-6 border-t border-gray-100">
                    <a 
                        href="https://wa.me/905423028821?text=Merhaba,%20Mazora%20şifremi%20unuttum.%20Yardımcı%20olabilir%20misiniz?" 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95 uppercase text-xs tracking-widest"
                    >
                        <span>💬</span> WHATSAPP DESTEK
                    </a>
                </div>

                <div className="pt-4">
                    <Link to="/login" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline decoration-2"> Giriş Sayfasına Dön </Link>
                </div>
            </div>
        </div>
    );
};
