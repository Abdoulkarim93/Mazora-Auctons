
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context';

export const AdminLogin = () => {
    const { login, showToast } = useApp();
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Simulate Network Latency
        await new Promise(resolve => setTimeout(resolve, 800));

        // Synchronized with context logic and mockData credentials
        const success = login('admin', 'admin@mazora.com', password);

        if (success) {
            navigate('/admin/dashboard');
            showToast("Admin Session Authenticated Successfully", "success");
        } else {
            setError('Invalid Admin Credentials. Access Denied.');
            showToast("Authentication Failed", "error");
            setPassword('');
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-primary p-6 text-center">
                    <h1 className="text-2xl font-display font-extrabold text-white tracking-wider uppercase">MAZORA ADMIN</h1>
                    <p className="text-blue-200 text-sm mt-1">Restricted Access Portal</p>
                </div>
                
                <div className="p-8">
                    <form onSubmit={handleAdminLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Access Password</label>
                                <input 
                                    type="password" 
                                    autoFocus
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-mono tracking-widest text-center text-lg"
                                    placeholder="••••••••"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-600 text-xs font-black bg-red-50 p-3 rounded-lg border border-red-100 text-center uppercase tracking-tighter">
                                ⚠️ {error}
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gray-900 text-white font-black py-4 rounded-xl hover:bg-black transition-all shadow-xl active:scale-95 flex justify-center items-center uppercase tracking-widest text-sm"
                        >
                            {isLoading ? (
                                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                "Grant Access"
                            )}
                        </button>
                    </form>
                    
                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                            Authorized personnel only. All access attempts are logged with IP address and timestamps.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
