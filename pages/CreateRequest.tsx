
import React, { useState, useRef } from 'react';
import { useApp } from '../context';
import { CATEGORIES, CategoryType, RequestType } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { generateRequestDescription } from '../services/geminiService';

export const CreateRequest = () => {
  const { t, language, showToast, addRequest, user } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [requestType, setRequestType] = useState<RequestType>('product');
  const [formData, setFormData] = useState({
      category: CategoryType.ELECTRONICS,
      title: '',
      description: '',
      quantity: 1,
      budget: '',
      location: '',
      date: ''
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [keyword, setKeyword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!user) {
      return (
          <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mb-6">
                  <span className="text-4xl">📢</span>
              </div>
              <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Request What You Need</h1>
              <div className="flex gap-4 mt-8">
                  <Link to="/login" className="bg-secondary text-white font-bold px-8 py-3 rounded-xl hover:bg-orange-600 transition-colors shadow-lg">Sign In</Link>
                  <Link to="/register" className="bg-white border border-gray-300 text-gray-700 font-bold px-8 py-3 rounded-xl">Register</Link>
              </div>
          </div>
      );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fix: Explicitly casting Array.from to File[] to satisfy browser Blob requirement
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          const files = Array.from(e.target.files) as File[];
          const remaining = 5 - imagePreviews.length;
          const toAdd = files.slice(0, remaining);

          toAdd.forEach(file => {
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = () => {
                  setImagePreviews(prev => [...prev, reader.result as string].slice(0, 5));
              };
          });
          if (files.length > remaining) showToast("Maksimum 5 fotoğraf yüklenebilir.", "warning");
      }
  };

  const removeImage = (idx: number) => {
      setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleGenerateDescription = async () => {
      if (!keyword) {
          showToast("Lütfen bir anahtar kelime girin.", "error");
          return;
      }
      setIsGenerating(true);
      try {
          const firstImage = imagePreviews[0] || "";
          const base64Data = firstImage.includes(',') ? firstImage.split(',')[1] : "";
          const desc = await generateRequestDescription(base64Data, keyword);
          setFormData(prev => ({ ...prev, description: desc }));
          showToast("Açıklama AI ile oluşturuldu!", "success");
      } catch (e) {
          showToast("AI asistanı şu an yanıt veremiyor.", "error");
      } finally {
          setIsGenerating(false);
      }
  };

  // Added missing handleSubmit function
  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.title || !formData.description || !formData.budget) {
          showToast("Lütfen tüm alanları doldurun.", "error");
          return;
      }
      addRequest({
          ...formData,
          budget: parseFloat(formData.budget),
          type: requestType,
          images: imagePreviews,
          preferredDate: formData.date ? new Date(formData.date) : undefined
      });
      showToast("Talebiniz başarıyla oluşturuldu!", "success");
      navigate('/requests');
  };

  const activeCategories = CATEGORIES.filter(c => c.id !== CategoryType.DIRECT_24H);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-left">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">{t('requests.postRequest')}</h1>
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Hızlı teklif toplama paneli.</p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8">
        <div className="mb-8 bg-gray-50 p-1.5 rounded-2xl flex gap-1 border border-gray-100">
            <button type="button" onClick={() => setRequestType('product')} className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${requestType === 'product' ? 'bg-white text-primary shadow-sm' : 'text-gray-400'}`}>📦 ÜRÜN</button>
            <button type="button" onClick={() => setRequestType('service')} className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${requestType === 'service' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>✨ HİZMET</button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100">
                <h4 className="text-xs font-black text-indigo-900 mb-3 flex items-center gap-2 uppercase tracking-widest">✨ AI Yazma Asistanı</h4>
                <div className="flex gap-2">
                    <input type="text" name="keyword" placeholder="Ne arıyorsunuz? (Örn: L-Koltuk)" value={keyword} onChange={(e) => setKeyword(e.target.value)} className="flex-1 rounded-xl border-indigo-100 border p-3 text-sm font-bold shadow-inner outline-none" />
                    <button type="button" onClick={handleGenerateDescription} disabled={isGenerating} className="bg-indigo-900 text-white px-6 py-3 rounded-xl text-xs font-black uppercase hover:bg-black transition-all disabled:opacity-50">
                        {isGenerating ? '...' : 'ÜRET'}
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">GÖRSELLER ({imagePreviews.length}/5)</label>
                <div className="flex flex-wrap gap-3">
                    {imagePreviews.map((img, idx) => (
                        <div key={idx} className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 border-slate-100 shadow-sm group">
                            <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                        </div>
                    ))}
                    {imagePreviews.length < 5 && (
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-2xl text-gray-300 hover:border-primary hover:text-primary transition-all">+</button>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleImageChange} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">KATEGORİ</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} className="w-full rounded-xl border-gray-200 border p-4 font-bold text-sm outline-none bg-gray-50">
                        {activeCategories.map(cat => <option key={cat.id} value={cat.id}>{(cat.label as any)[language]}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">KONUM (ŞEHİR)</label>
                    <input name="location" value={formData.location} onChange={handleInputChange} className="w-full rounded-xl border-gray-200 border p-4 font-bold text-sm outline-none bg-gray-50" placeholder="Örn: İstanbul" />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">İSTEK BAŞLIĞI</label>
                <input type="text" name="title" required value={formData.title} onChange={handleInputChange} placeholder="Ürün veya hizmet adı..." className="w-full rounded-xl border-gray-200 border p-4 font-bold text-sm outline-none focus:ring-2 focus:ring-primary" />
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">DETAYLI AÇIKLAMA</label>
                <textarea name="description" required value={formData.description} onChange={handleInputChange} rows={4} className="w-full rounded-xl border-gray-200 border p-4 font-medium text-sm outline-none focus:ring-2 focus:ring-primary" placeholder="İhtiyacınızı detaylandırın..."></textarea>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{requestType === 'product' ? 'ADET' : 'TARİH'}</label>
                    <input type={requestType === 'product' ? 'number' : 'date'} name={requestType === 'product' ? 'quantity' : 'date'} value={requestType === 'product' ? formData.quantity : formData.date} onChange={handleInputChange} className="w-full rounded-xl border-gray-200 border p-4 font-bold text-sm outline-none bg-gray-50" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">MAX BÜTÇE (TL)</label>
                    <input type="number" name="budget" value={formData.budget} onChange={handleInputChange} className="w-full rounded-xl border-gray-200 border p-4 font-black text-sm outline-none bg-gray-50 text-indigo-900" placeholder="₺" />
                </div>
            </div>

            <button type="submit" className="w-full text-white bg-primary font-black py-5 rounded-2xl shadow-xl transition-all hover:bg-primary-800 uppercase tracking-[0.2em] text-sm">TALEBİ YAYINLA</button>
        </form>
      </div>
    </div>
  );
};
