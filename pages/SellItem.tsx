
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context';
import { CATEGORIES, CategoryType, ProductCondition, FEE_STRUCTURE, getCategorySlotStartTime } from '../types';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const TURKISH_CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

export const SellItem = () => {
  const { t, language, addToInventory, showToast, user, formatPrice } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAdmin = user?.role === 'admin';
  const isCertified = user?.sellerTier === 'onayli';

  const [sellMode, setSellMode] = useState<'standard' | 'quick'>(
    location.state?.mode === 'quick' ? 'quick' : (isCertified ? 'standard' : 'quick')
  );
  
  const [selectedScheduleDate, setSelectedScheduleDate] = useState<string>('');

  const [agreements, setAgreements] = useState({
    legal: false,
    ethics: false,
    terms: false,
    highestBid: false 
  });

  const [baseValue, setBaseValue] = useState<string>('');
  const [formData, setFormData] = useState({
    category: sellMode === 'quick' ? CategoryType.DIRECT_24H : CategoryType.ELECTRONICS,
    subcategory: '',
    condition: ProductCondition.USED,
    title: '',
    rawDescription: '',
    price: '1', 
    reserve: '0',
    buyNowPrice: '0',
    location: user?.location || '', 
  });

  const [isBoosted, setIsBoosted] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isConvertingMedia, setIsConvertingMedia] = useState(false);
  const [showIBANModal, setShowIBANModal] = useState(false);
  
  const [previewMedia, setPreviewMedia] = useState<{type: 'image' | 'video', url: string} | null>(null);

  const [cityQuery, setCityQuery] = useState(user?.location || '');
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);

  if (isAdmin) {
    return (
        <div className="max-w-xl mx-auto px-4 py-24 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">🚫</div>
            <h1 className="text-3xl font-display font-black text-slate-900 uppercase italic mb-4">YÖNETİCİ KISITLAMASI</h1>
            <p className="text-sm text-slate-500 font-bold leading-relaxed uppercase">Admin yetkisine sahip hesaplar platformda satış yapamaz veya ilan yayınlayamaz.</p>
            <button onClick={() => navigate('/')} className="mt-8 bg-primary text-white font-black px-10 py-3 rounded-xl text-xs uppercase tracking-widest shadow-xl">MARKET'E DÖN</button>
        </div>
    );
  }

  const applyAISmartPricing = () => {
    const val = parseFloat(baseValue);
    if (!val || val <= 0) {
        showToast("Lütfen önce bir ürün değeri girin.", "warning");
        return;
    }
    setFormData(prev => ({
        ...prev,
        price: Math.round(val * 0.35).toString(),
        reserve: formData.category === CategoryType.DIRECT_24H ? '0' : Math.round(val * 0.65).toString(),
        buyNowPrice: Math.round(val * 0.85).toString()
    }));
    showToast("Akıllı Fiyatlandırma uygulandı! (35/65/85)", "success");
  };

  const filteredCities = useMemo(() => {
    if (!cityQuery.trim()) return [];
    return TURKISH_CITIES.filter(city => city.toLowerCase().includes(cityQuery.toLowerCase())).slice(0, 5);
  }, [cityQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setShowCitySuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (location.state?.prefill) {
        const pf = location.state.prefill;
        setFormData({
            category: pf.category,
            subcategory: pf.subcategory || '',
            condition: pf.condition || ProductCondition.USED,
            title: pf.title,
            rawDescription: pf.rawDescription || pf.description,
            price: pf.price?.toString() || '1',
            reserve: pf.category === CategoryType.DIRECT_24H ? '0' : (pf.reserve?.toString() || '0'),
            buyNowPrice: pf.buyNowPrice?.toString() || '0',
            location: pf.location || user?.location || '',
        });
        setCityQuery(pf.location || user?.location || '');
        setIsBoosted(!!pf.isBoosted);
        if (pf.images && Array.isArray(pf.images)) setImages(pf.images);
        else if (pf.image) setImages([pf.image]);
        if (pf.video) setVideo(pf.video);
    }
  }, [location.state, user]);

  const isQuickMode = sellMode === 'quick';

  const subcategories = useMemo(() => {
      if (isQuickMode) {
          return language === 'tr' ? ['Hızlı Fırsatlar', 'Flaş Fırsatlar', 'Diğer'] : ['Quick Deals', 'Flash Deals', 'Diğer'];
      }
      const cat = CATEGORIES.find(c => c.id === formData.category);
      let list = cat?.subcategories || [];
      // Ensure "Diğer" is always present exactly once at the end
      list = list.filter(s => s !== 'Diğer');
      list.push('Diğer');
      return list;
  }, [formData.category, isQuickMode, language]);

  const scheduleOptions = useMemo(() => {
      const options = [];
      const now = new Date();
      
      if (formData.category === CategoryType.DIRECT_24H) {
          return [{
              id: now.toISOString(),
              label: language === 'tr' ? "ŞİMDİ" : "NOW",
              time: now.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' }),
              dateObj: now
          }];
      }

      const slotTimeStr = getCategorySlotStartTime(formData.category);
      const [sh, sm] = slotTimeStr.split(':').map(Number);

      for (let i = 0; i <= 5; i++) {
          const d = new Date();
          d.setDate(now.getDate() + i);
          d.setHours(sh, sm, 0, 0);
          
          if (d > now || i > 0) {
              options.push({
                  id: d.toISOString(),
                  label: i === 0 ? "Bugün" : i === 1 ? "Yarın" : d.toLocaleDateString(language, { weekday: 'long', day: 'numeric', month: 'long' }),
                  time: slotTimeStr,
                  dateObj: d
              });
          }
      }
      return options;
  }, [formData.category, language]);

  useEffect(() => {
      if (scheduleOptions.length > 0 && !selectedScheduleDate) {
          setSelectedScheduleDate(scheduleOptions[0].id);
      }
  }, [scheduleOptions]);

  const isFirstListing = useMemo(() => {
    if (!user) return true; 
    return (user.inventory?.length || 0) === 0;
  }, [user]);

  const canUserPublishLive = useMemo(() => {
    if (!user) return false;
    return isFirstListing || user.canPublish;
  }, [user, isFirstListing]);

  const totalUpfrontFee = useMemo(() => {
    let total = 0;
    if (isQuickMode && !isCertified) {
        if (!isFirstListing) {
            total += FEE_STRUCTURE.QUICK_LISTING_FEE_TL;
        }
    }
    if (isBoosted) total += FEE_STRUCTURE.BOOST_FEE_TL;
    return total;
  }, [isCertified, isBoosted, isQuickMode, isFirstListing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'category') {
        setFormData(prev => ({ 
            ...prev, 
            category: value as CategoryType, 
            subcategory: '',
            reserve: value === CategoryType.DIRECT_24H ? '0' : prev.reserve 
        }));
    } else {
        setFormData({ ...formData, [name]: value });
    }
  };

  const handleCitySelect = (city: string) => {
    setCityQuery(city);
    setFormData({ ...formData, location: city });
    setShowCitySuggestions(false);
  };

  const processAndResizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_SIZE = 1200;
                if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } } 
                else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
        };
        reader.onerror = error => reject(error);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const remainingSlots = 5 - images.length;
      const filesToAdd = files.slice(0, remainingSlots);
      setIsConvertingMedia(true);
      try {
        const processed = await Promise.all(filesToAdd.map(file => processAndResizeImage(file)));
        setImages(prev => [...prev, ...processed]);
      } catch (err) {
        showToast("Görsel işlenirken hata oluştu.", "error");
      } finally { setIsConvertingMedia(false); }
    }
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0] as File;
      // Increased to 50MB
      if (file.size > 50 * 1024 * 1024) { 
        showToast("Video boyutu çok yüksek (Max 50MB).", "error"); 
        return; 
      }
      
      setIsConvertingMedia(true);
      const vid = document.createElement('video');
      vid.preload = 'metadata';
      vid.onloadedmetadata = () => {
          // Duration still capped for better user experience
          if (vid.duration > 30.5) {
              showToast("Video en fazla 30 saniye olmalıdır.", "error");
              setIsConvertingMedia(false);
              return;
          }
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => { 
              setVideo(reader.result as string); 
              setIsConvertingMedia(false); 
          };
          reader.onerror = () => { setIsConvertingMedia(false); };
      };
      vid.onerror = () => { setIsConvertingMedia(false); showToast("Video dosyası açılamadı.", "error"); };
      vid.src = URL.createObjectURL(file);
    }
  };

  const handlePublishClick = () => {
    if (images.length === 0) { showToast("En az bir ürün fotoğrafı eklemelisiniz.", "error"); return; }
    if (!formData.title) { showToast("Lütfen bir başlık girin.", "error"); return; }
    if (!formData.subcategory) { showToast("Lütfen bir alt kategori seçin.", "error"); return; }
    if (!formData.location) { showToast("Lütfen ürünün bulunduğu şehri seçin.", "error"); return; }
    if (formData.rawDescription.length < 25) { 
        showToast("Ürün açıklaması en az 25 karakter olmalıdır.", "error"); 
        const descEl = document.getElementById('rawDescription');
        if (descEl) descEl.scrollIntoView({ behavior: 'smooth' });
        return; 
    }
    
    if (!agreements.terms) {
        showToast("Kullanım şartlarını kabul etmelisiniz.", "warning");
        return;
    }

    if (isQuickMode && !agreements.highestBid) {
        showToast("Lütfen 24H modelinde en yüksek teklife satış yapacağınızı onaylayın.", "warning");
        return;
    }

    if (!user) {
        showToast("İlanı tamamlamak için lütfen kaydı tamamlayın.", "info");
        navigate('/register', { state: { fromQuickSell: true, role: 'seller', prefill: { ...formData, isBoosted, images, video } } });
        return;
    }

    if (totalUpfrontFee > 0 && !canUserPublishLive) {
        setShowIBANModal(true);
    } else {
        processFinalAction();
    }
  };

  const processFinalAction = async () => {
      setIsProcessingPayment(true);
      setShowIBANModal(false);
      await new Promise(r => setTimeout(r, 1200));
      
      const selectedSlot = scheduleOptions.find(s => s.id === selectedScheduleDate);
      const listedAt = selectedSlot ? selectedSlot.dateObj : new Date();
      
      addToInventory({
          title: formData.title, 
          category: formData.category, 
          subcategory: formData.subcategory, 
          condition: formData.condition, 
          startPrice: parseFloat(formData.price || '1'), 
          reservePrice: formData.category === CategoryType.DIRECT_24H ? 0 : parseFloat(formData.reserve || '0'), 
          status: 'active',
          isBoosted, 
          location: formData.location || 'Türkiye', 
          imageUrl: images[0], 
          images, 
          description: formData.rawDescription, 
          videoUrl: video || undefined, 
          listedAt: listedAt
      });
      
      setIsProcessingPayment(false);
      navigate(isQuickMode ? '/quick-list-success' : '/profile', { state: { isBoosted, phone: user?.phone } });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {showIBANModal && (
          <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
              <div className="max-w-md w-full bg-white rounded-[3rem] p-10 text-center shadow-2xl border border-gray-100 flex flex-col items-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-4xl">🏦</div>
                  <h3 className="text-2xl font-display font-black text-gray-900 uppercase italic mb-4">IBAN İLE ÖDEME</h3>
                  <p className="text-sm text-gray-500 font-bold leading-relaxed mb-8 uppercase tracking-tight">
                      İlan onayı için ücretin IBAN hesabımıza gönderilmesi gerekmektedir. İlanınız taslak olarak kaydedilecektir.
                  </p>
                  <a href="tel:+905423028821" className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-xl uppercase tracking-widest text-xs mb-4 flex justify-center items-center gap-3">
                      <span>📞</span> DESTEK: 0542 302 88 21
                  </a>
                  <button onClick={processFinalAction} className="bg-indigo-50 text-indigo-700 font-black py-3 px-8 rounded-xl text-[10px] uppercase mb-4 w-full">Katalog Olarak Kaydet & Ödeme Yaptım</button>
                  <button onClick={() => setShowIBANModal(false)} className="text-gray-400 font-bold uppercase text-[10px] hover:underline">Geri Dön</button>
              </div>
          </div>
      )}
      
      {previewMedia && (
          <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setPreviewMedia(null)}>
              <div className="max-w-5xl w-full h-full flex items-center justify-center relative p-4">
                  {previewMedia.type === 'image' ? <img src={previewMedia.url} alt="Full Preview" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" /> : <video src={previewMedia.url} controls autoPlay className="max-w-full max-h-full rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />}
                  <button className="absolute top-0 right-0 m-4 bg-white/10 w-12 h-12 rounded-full text-white text-xl flex items-center justify-center">✕</button>
              </div>
          </div>
      )}

      <div className="bg-white border-b border-slate-200 md:sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-xl shadow-md">{isQuickMode ? '⚡' : '💼'}</div>
                <h1 className="text-xl md:text-2xl font-display font-black uppercase italic tracking-tighter">{isQuickMode ? '24H HIZLI SATIŞ' : 'PROFESYONEL MEZAT'}</h1>
            </div>
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200">
                <button onClick={() => setSellMode('quick')} className={`px-5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isQuickMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>⚡ HIZLI</button>
                <button onClick={() => setSellMode('standard')} className={`px-5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!isQuickMode ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}>💼 PRO {(!isCertified && user) && '🔒'}</button>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
            <section className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 text-left">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">ÜRÜN MEDYASI (MAX 5)</h3>
                    {isConvertingMedia && <span className="text-[10px] font-black text-primary animate-pulse uppercase">İŞLENİYOR...</span>}
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 md:grid md:grid-cols-5 md:overflow-visible">
                    {images.map((img, idx) => (
                        <div key={idx} className="relative w-20 h-20 md:w-full md:aspect-square rounded-2xl overflow-hidden group border-2 border-slate-50 shadow-sm shrink-0">
                            <img src={img} alt="Preview" className="w-full h-full object-cover cursor-pointer" onClick={() => setPreviewMedia({type: 'image', url: img})} />
                            <button onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                        </div>
                    ))}
                    {video && (
                        <div className="relative w-20 h-20 md:w-full md:aspect-square rounded-2xl overflow-hidden group border-2 border-indigo-200 bg-gray-900 shrink-0">
                            <video src={video} className="w-full h-full object-cover opacity-60" />
                            <button onClick={() => setVideo(null)} className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">✕</button>
                            <span onClick={() => setPreviewMedia({type: 'video', url: video})} className="absolute inset-0 flex items-center justify-center text-2xl cursor-pointer">🎥</span>
                        </div>
                    )}
                    {(images.length < 5 || !video) && (
                        <div className="grid grid-cols-2 gap-2 w-full md:col-span-5">
                            <label className={`h-16 md:h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${images.length >= 5 ? 'opacity-50' : 'border-slate-200 hover:border-primary'}`}>
                                <span className="text-xl">📸</span><span className="text-[8px] font-black uppercase text-slate-400">GÖRSEL EKLE</span><input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} disabled={images.length >= 5} />
                            </label>
                            <label className={`h-16 md:h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${video ? 'border-primary' : 'border-slate-200 hover:border-indigo-600'}`}>
                                <span className="text-xl">🎥</span><span className="text-[8px] font-black uppercase text-slate-400">{video ? 'VİDEO TAMAM' : 'VİDEO (50MB)'}</span><input type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
                            </label>
                        </div>
                    )}
                </div>
            </section>

            <section className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6 text-left">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">İLAN DETAYLARI</h3>
                
                {/* Condition Selection */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">ÜRÜN DURUMU</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            type="button"
                            onClick={() => setFormData({...formData, condition: ProductCondition.NEW})}
                            className={`py-4 rounded-2xl border-2 font-black uppercase text-xs transition-all ${formData.condition === ProductCondition.NEW ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 text-slate-400 bg-slate-50'}`}
                        >
                            🌟 SIFIR ÜRÜN
                        </button>
                        <button 
                            type="button"
                            onClick={() => setFormData({...formData, condition: ProductCondition.USED})}
                            className={`py-4 rounded-2xl border-2 font-black uppercase text-xs transition-all ${formData.condition === ProductCondition.USED ? 'border-secondary bg-secondary/5 text-secondary' : 'border-slate-100 text-slate-400 bg-slate-50'}`}
                        >
                            🔄 İKİNCİ EL
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-black text-slate-400 ml-2">BAŞLIK</label>
                        <input name="title" value={formData.title} onChange={handleInputChange} placeholder="Örn: iPhone 15 Pro Max" className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 font-bold text-sm focus:ring-2 focus:ring-primary outline-none" />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                        <div className="flex justify-between items-center ml-2 mb-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DETAYLI ÜRÜN AÇIKLAMASI</label>
                            <span className={`text-[9px] font-black uppercase tracking-tighter ${formData.rawDescription.length >= 25 ? 'text-green-600' : 'text-red-500'}`}>
                                {formData.rawDescription.length} / 25 Karakter {formData.rawDescription.length < 25 && '⚠️'}
                            </span>
                        </div>
                        <textarea 
                            id="rawDescription"
                            name="rawDescription" 
                            value={formData.rawDescription} 
                            onChange={handleInputChange} 
                            rows={5} 
                            className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 font-medium text-sm focus:ring-2 focus:ring-primary outline-none" 
                            placeholder="Ürünün teknik özelliklerini, varsa kusurlarını ve kutu içeriğini detaylandırın (Min 25 Karakter)..."
                        ></textarea>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 ml-2">KATEGORİ</label>
                        <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 font-bold text-sm outline-none">
                            {CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id}>{(cat.label as any)[language].toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 ml-2">ALT KATEGORİ</label>
                        <select name="subcategory" value={formData.subcategory} onChange={handleInputChange} className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 font-bold text-sm outline-none">
                            <option value="">Seçiniz...</option>
                            {subcategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                        </select>
                    </div>

                    <div className="md:col-span-2 space-y-1 relative" ref={cityRef}>
                        <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">KONUM (ŞEHİR)</label>
                        <input 
                            name="location" 
                            value={cityQuery} 
                            onChange={(e) => {
                                setCityQuery(e.target.value);
                                setShowCitySuggestions(true);
                            }} 
                            onFocus={() => setShowCitySuggestions(true)}
                            className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 font-bold text-sm focus:ring-2 focus:ring-primary outline-none" 
                            placeholder="Şehir Ara... (Örn: İstanbul)"
                            autoComplete="off"
                        />
                        {showCitySuggestions && filteredCities.length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-[110] bg-white border border-slate-100 rounded-2xl mt-1 shadow-2xl overflow-hidden max-h-60 overflow-y-auto no-scrollbar">
                                {filteredCities.map(city => (
                                    <button 
                                        key={city} 
                                        type="button"
                                        onClick={() => handleCitySelect(city)} 
                                        className="w-full text-left px-5 py-3 hover:bg-primary/5 text-xs font-black text-slate-700 transition-colors border-b border-slate-50 last:border-0"
                                    >
                                        📍 {city.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="md:col-span-2 space-y-3">
                        <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">MEZAT TAKVİMİ</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                            {scheduleOptions.map(option => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => setSelectedScheduleDate(option.id)}
                                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center ${selectedScheduleDate === option.id ? 'border-primary bg-primary/5 text-primary shadow-md' : 'border-gray-100 bg-white text-gray-400'}`}
                                >
                                    <span className="text-[9px] font-black uppercase mb-1">{option.label}</span>
                                    <span className="text-[12px] font-black">{option.time}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-2 bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest">✨ AI AKILLI FİYATLANDIRMA</h4>
                            <button type="button" onClick={applyAISmartPricing} className="bg-primary text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-md transition-all active:scale-95">HESAPLA</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1"><label className="text-[8px] font-black text-gray-400 uppercase ml-2">ÜRÜN DEĞERİ</label><input type="number" value={baseValue} onChange={e => setBaseValue(e.target.value)} className="w-full bg-white border border-blue-100 rounded-xl p-4 text-sm font-black text-indigo-900 outline-none" placeholder="Tahmini..." /></div>
                            <div className="space-y-1"><label className="text-[8px] font-black text-gray-400 uppercase ml-2">BAŞLANGIÇ (35%)</label><input type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full bg-white border border-gray-100 rounded-xl p-3 font-black text-sm outline-none" /></div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-gray-400 uppercase ml-2">REZERV (65%)</label>
                                <input type="number" name="reserve" disabled={formData.category === CategoryType.DIRECT_24H} value={formData.category === CategoryType.DIRECT_24H ? '0' : formData.reserve} onChange={handleInputChange} className="w-full bg-white border border-gray-100 rounded-xl p-3 font-black text-sm outline-none disabled:bg-gray-50" />
                            </div>
                            <div className="space-y-1"><label className="text-[8px] font-black text-gray-400 uppercase ml-2">HEMEN AL (85%)</label><input type="number" name="buyNowPrice" value={formData.buyNowPrice} onChange={handleInputChange} className="w-full bg-white border border-gray-100 rounded-xl p-3 font-black text-sm outline-none" /></div>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <aside className="lg:col-span-4 space-y-6 text-left">
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 lg:sticky lg:top-24">
                <h3 className="text-xl font-display font-black uppercase italic mb-6">YAYIN ONAYI</h3>
                
                <div 
                    onClick={() => setIsBoosted(!isBoosted)}
                    className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all mb-8 relative overflow-hidden ${isBoosted ? 'bg-indigo-950 border-indigo-950 text-white shadow-xl' : 'bg-indigo-50 border-indigo-100 text-indigo-900 hover:border-indigo-300'}`}
                >
                    <div className="flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🚀</span>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest">Visibility Boost</h4>
                                <p className="text-[11px] font-bold opacity-80">İlanını en üste taşı</p>
                            </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isBoosted ? 'bg-white border-white text-indigo-900' : 'border-indigo-300'}`}>
                            {isBoosted && <span className="font-black text-xs">✓</span>}
                        </div>
                    </div>
                    <p className="mt-4 text-xl font-black relative z-10 text-right">{formatPrice(FEE_STRUCTURE.BOOST_FEE_TL)}</p>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-end border-b pb-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TOPLAM ÖDEME</p>
                        <p className="text-3xl font-black text-slate-900">{formatPrice(totalUpfrontFee)}</p>
                    </div>
                    {isFirstListing && isQuickMode && <p className="text-center text-[9px] font-black text-green-600 uppercase">🎉 İLK İLANINIZ ÜCRETSİZ!</p>}
                </div>
                
                <div className="space-y-4 mb-8">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <input type="checkbox" checked={agreements.terms} onChange={e => setAgreements({...agreements, terms: e.target.checked})} className="mt-1 w-5 h-5 rounded border-slate-200 text-primary" />
                        <span className="text-[10px] font-black text-slate-600 uppercase italic">Kullanım ve Teslimat şartlarını kabul ediyorum.</span>
                    </label>

                    {isQuickMode && (
                        <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-2xl animate-pulse">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input type="checkbox" checked={agreements.highestBid} onChange={e => setAgreements({...agreements, highestBid: e.target.checked})} className="mt-1 w-6 h-6 rounded border-orange-300 text-orange-600" />
                                <span className="text-[10px] font-black text-orange-800 uppercase italic leading-tight">
                                    24H HIZLI SATIŞ MODELİNDE ÜRÜNÜN REZERV FİYAT OLMAKSIZIN EN YÜKSEK TEKLİFE SATILACAĞINI KABUL VE TAAHHÜT EDİYORUM. 🔨
                                </span>
                            </label>
                        </div>
                    )}
                </div>
                
                <button 
                    onClick={handlePublishClick} 
                    disabled={isProcessingPayment || isConvertingMedia} 
                    className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-xl text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                >
                    {isProcessingPayment ? 'İŞLENİYOR...' : 'YAYINLA 🚀'}
                </button>
            </div>
        </aside>
      </div>
    </div>
  );
};
