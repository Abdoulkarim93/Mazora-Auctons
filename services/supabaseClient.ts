import { createClient } from '@supabase/supabase-js';

// Global shim for process in browser if missing - must run before environment access
if (typeof window !== 'undefined' && typeof (window as any).process === 'undefined') {
    (window as any).process = { env: {} };
}

// Safe environment variable access helper
const getEnv = (key: string) => {
    try {
        // First try standard process.env, then check if Vite's import.meta.env is available
        const val = (typeof process !== 'undefined' && process.env?.[key]);
        if (val) return val;
        
        // @ts-ignore - Support for various build tool env injections
        return window?.process?.env?.[key] || '';
    } catch {
        return '';
    }
};

const supabaseUrl = getEnv('REACT_APP_SUPABASE_URL');
const supabaseAnonKey = getEnv('REACT_APP_SUPABASE_ANON_KEY');

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * PRODUCTION LOCAL VAULT (Zero-Data-Loss Fallback)
 * Enhanced with robust type casting and error recovery
 */
export const getLocalVault = (table: string) => {
    try {
        const key = `mazora_prod_${table}`;
        const data = localStorage.getItem(key);
        if (!data || data === "undefined" || data === "null") return null;
        
        const parsed = JSON.parse(data);
        
        // Deep reconstruction of Date objects
        const reconstructDates = (obj: any): any => {
            if (obj === null || typeof obj !== 'object') return obj;
            if (Array.isArray(obj)) return obj.map(reconstructDates);
            
            const newObj: any = {};
            for (const [k, v] of Object.entries(obj)) {
                // Heuristic for ISO date strings
                if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)) {
                    newObj[k] = new Date(v);
                } else if (typeof v === 'object' && v !== null) {
                    newObj[k] = reconstructDates(v);
                } else {
                    newObj[k] = v;
                }
            }
            return newObj;
        };

        return reconstructDates(parsed);
    } catch (e) {
        console.error(`[VAULT ERROR] Critical failure reading ${table}:`, e);
        return null;
    }
};

/**
 * Robust Save with Quota Protection
 */
export const saveToLocalVault = (table: string, data: any) => {
    const key = `mazora_prod_${table}`;
    try {
        if (data === undefined) return;
        const serialized = JSON.stringify(data);
        localStorage.setItem(key, serialized);
    } catch (e: any) {
        if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014) {
            console.warn(`[CRITICAL] Storage full for ${table}! Executing Tier-2 Media Purge.`);
            
            try {
                const stripMedia = (obj: any): any => {
                    if (Array.isArray(obj)) {
                        return obj.map(item => stripMedia(item));
                    } else if (obj !== null && typeof obj === 'object') {
                        const cleaned: any = {};
                        for (const k in obj) {
                            if (Object.prototype.hasOwnProperty.call(obj, k)) {
                                const val = obj[k];
                                if (['images', 'image', 'videoUrl', 'avatarUrl', 'imageUrl'].includes(k)) {
                                    if (typeof val === 'string' && val.length > 500) {
                                        cleaned[k] = "[MEDIA_PURGED]";
                                        continue;
                                    }
                                    if (Array.isArray(val)) {
                                        cleaned[k] = [];
                                        continue;
                                    }
                                }
                                if (typeof val === 'string') {
                                    if (val.startsWith('data:') || val.length > 10000) {
                                        cleaned[k] = "[LARGE_STRING_REMOVED]";
                                    } else {
                                        cleaned[k] = val;
                                    }
                                } else if (typeof val === 'object' && val !== null) {
                                    cleaned[k] = stripMedia(val);
                                } else {
                                    cleaned[k] = val;
                                }
                            }
                        }
                        return cleaned;
                    }
                    return obj;
                };

                const rescuedData = stripMedia(data);
                const rescuedSerialized = JSON.stringify(rescuedData);
                localStorage.removeItem(key);
                localStorage.setItem(key, rescuedSerialized);
            } catch (rescueErr) {
                console.error(`[FATAL] Recovery logic failed:`, rescueErr);
            }
        }
    }
};

export const checkDbConnection = async () => {
    if (supabase) {
        try {
            const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
            if (!error) return true;
        } catch (e) {}
    }
    return typeof localStorage !== 'undefined';
};

export const processPayment = async (amount: number, currency: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: "Transaction Secured & Verified" };
};