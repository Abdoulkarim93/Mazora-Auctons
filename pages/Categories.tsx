
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context';
import { CATEGORIES, CategoryType, AuctionStatus } from '../types';
import { AuctionCard } from '../components/AuctionComponents';
import { useLocation, Link } from 'react-router-dom';

const ITEMS_PER_PAGE = 12;

const TURKISH_CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

export const Categories = () => {
    const { t, language, auctions } = useApp(); 
    const location = useLocation();
    
    const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
    const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [selectedLocation, setSelectedLocation] = useState('');
    const [locationQuery, setLocationQuery] = useState('');
    const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
    const locationFilterRef = useRef<HTMLDivElement>(null);

    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [noReserveOnly, setNoReserveOnly] = useState(false);
    const [sortOrder, setSortOrder] = useState<'ending_soon' | 'price_low' | 'price_high' | 'newest' | 'best_value'>('ending_soon');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const filteredCities = useMemo(() => {
        if (!locationQuery.trim()) return [];
        const query = locationQuery.toLowerCase();
        return TURKISH_CITIES.filter(city => city.toLowerCase().includes(query)).slice(0, 8);
    }, [locationQuery]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
          if (locationFilterRef.current && !locationFilterRef.current.contains(e.target as Node)) {
            setShowLocationSuggestions(false);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const subcategories = useMemo(() => {
        if (selectedCategory === 'all') return [];
        if (selectedCategory === CategoryType.DIRECT_24H) {
            return CATEGORIES.filter(c => c.id !== CategoryType.DIRECT_24H).map(c => (c.label as any)[language]);
        }
        const cat = CATEGORIES.find(c => c.id === selectedCategory);
        return cat?.subcategories || [];
    }, [selectedCategory, language]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get('q');
        const cat = params.get('cat') as CategoryType;
        if (q) setSearchQuery(q); else setSearchQuery('');
        if (cat) setSelectedCategory(cat);
    }, [location.search]);

    const handleFilterChange = (setter: any, value: any) => {
        setter(value);
        setCurrentPage(1);
    };

    const handleCategorySelect = (id: CategoryType | 'all') => {
        setSelectedCategory(id);
        setSelectedSubcategory('');
        setCurrentPage(1);
    };

    const filteredAuctions = useMemo(() => {
        let result = auctions.filter(item => {
            if (item.status === AuctionStatus.ENDED) return false;
            return true;
        });

        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase();
            result = result.filter(item => 
                item.title.toLowerCase().includes(lowerQ) || 
                item.description?.toLowerCase().includes(lowerQ)
            );
        }

        if (selectedCategory !== 'all') {
            result = result.filter(item => item.category === selectedCategory);
        }

        if (selectedSubcategory) {
            result = result.filter(item => item.subcategory === selectedSubcategory);
        }

        if (selectedLocation) {
            result = result.filter(item => item.location === selectedLocation);
        }

        if (verifiedOnly) {
            result = result.filter(item => item.verifiedListing);
        }

        if (noReserveOnly) {
            result = result.filter(item => item.reservePrice === 0);
        }

        if (priceRange.min) result = result.filter(item => item.currentBid >= Number(priceRange.min));
        if (priceRange.max) result = result.filter(item => item.currentBid <= Number(priceRange.max));

        result.sort((a, b) => {
            if (a.isBoosted !== b.isBoosted) return a.isBoosted ? -1 : 1;
            switch (sortOrder) {
                case 'price_low': return a.currentBid - b.currentBid;
                case 'price_high': return b.currentBid - a.currentBid;
                case 'newest': return parseInt(b.id) - parseInt(a.id); 
                case 'best_value':
                    const getRatio = (item: any) => {
                        if (!item.marketValue) return 999;
                        const avgMarket = (item.marketValue.min + item.marketValue.max) / 2;
                        return item.currentBid / avgMarket;
                    };
                    return getRatio(a) - getRatio(b);
                case 'ending_soon':
                default: return a.endsAt.getTime() - b.endsAt.getTime();
            }
        });

        return result;
    }, [selectedCategory, selectedSubcategory, priceRange, selectedLocation, verifiedOnly, noReserveOnly, sortOrder, searchQuery, auctions]);

    const paginatedAuctions = filteredAuctions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const FilterSidebar = () => (
        <div className="space-y-6">
            <div>
                <h3 className="font-black text-gray-900 mb-3 uppercase text-[10px] tracking-widest">📍 LOKASYON</h3>
                <div className="relative" ref={locationFilterRef}>
                    <input type="text" placeholder="Şehir Ara..." value={locationQuery} onFocus={() => setShowLocationSuggestions(true)} onChange={(e) => setLocationQuery(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-bold outline-none bg-gray-50" />
                    {showLocationSuggestions && filteredCities.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 z-[60] overflow-hidden">
                            {filteredCities.map(city => (<button key={city} onClick={() => { handleFilterChange(setSelectedLocation, city); setLocationQuery(city); setShowLocationSuggestions(false); }} className="w-full text-left px-4 py-2.5 text-[10px] font-black text-gray-700 hover:bg-gray-50">{city}</button>))}
                        </div>
                    )}
                </div>
            </div>

            <div>
                <h3 className="font-black text-gray-900 mb-3 uppercase text-[10px] tracking-widest flex items-center gap-2">📦 KATEGORİ</h3>
                <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    <button onClick={() => handleCategorySelect('all')} className={`w-full text-left px-3 py-2 rounded-xl text-[11px] font-black transition-all ${selectedCategory === 'all' ? 'bg-primary text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}>Tüm Kategoriler</button>
                    <div className="h-2"></div>
                    {CATEGORIES.map(cat => (
                        <button key={cat.id} onClick={() => handleCategorySelect(cat.id)} className={`w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold flex items-center justify-between transition-all ${selectedCategory === cat.id ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                            <span className="truncate">{(cat.label as any)[language]}</span>
                            <span className="opacity-40">{cat.icon}</span>
                        </button>
                    ))}
                </div>
            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #ddd; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #bbb; }
            `}</style>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-2 md:px-4 py-2 md:py-8 overflow-hidden">
            
            {/* QUICK ACCESS CATEGORY PILLS (FIXED HORIZONTAL SCROLL) */}
            <div className="mb-6 md:mb-8 -mx-2 md:mx-0">
              <div className="flex gap-2 overflow-x-auto px-4 md:px-0 py-2 no-scrollbar scroll-smooth touch-pan-x">
                  <button 
                      onClick={() => handleCategorySelect(CategoryType.DIRECT_24H)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all border-2 flex-shrink-0 shadow-sm ${selectedCategory === CategoryType.DIRECT_24H ? 'bg-indigo-950 border-indigo-950 text-white' : 'bg-white border-blue-50 text-indigo-700'}`}
                  >
                      <span className="text-orange-500">⚡</span> {language === 'tr' ? '24H HIZLI SATIŞ' : '24H FAST SELL'}
                  </button>

                  <button 
                      onClick={() => handleCategorySelect('all')}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all border-2 flex-shrink-0 shadow-sm ${selectedCategory === 'all' ? 'bg-indigo-950 border-indigo-950 text-white' : 'bg-white border-blue-50 text-indigo-900'}`}
                  >
                      {language === 'tr' ? 'TÜMÜ' : 'ALL'}
                  </button>

                  {CATEGORIES.filter(c => [CategoryType.ELECTRONICS, CategoryType.VEHICLES, CategoryType.HOME, CategoryType.LUXURY].includes(c.id)).map(cat => (
                      <button 
                          key={cat.id}
                          onClick={() => handleCategorySelect(cat.id)}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all border-2 flex-shrink-0 shadow-sm ${selectedCategory === cat.id ? 'bg-indigo-950 border-indigo-950 text-white' : 'bg-white border-transparent text-slate-500'}`}
                      >
                          <span className="text-sm">{cat.icon}</span> {(cat.label as any)[language].toUpperCase()}
                      </button>
                  ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-gray-200 pb-6 text-left px-2">
                <div>
                    <h1 className="text-xl md:text-3xl font-display font-black text-gray-900 leading-none">{searchQuery ? `${t('filters.resultsFor')} "${searchQuery}"` : t('filters.marketplace')}</h1>
                    <p className="text-gray-400 text-[10px] md:text-sm font-bold uppercase mt-1.5">{filteredAuctions.length} {t('filters.activeAuctions')}</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)} className="md:hidden flex-1 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">FİLTRELE</button>
                    <select value={sortOrder} onChange={(e: any) => handleFilterChange(setSortOrder, e.target.value)} className="flex-[2] md:w-56 bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm outline-none">
                        <option value="ending_soon">{t('filters.sort.endingSoon')}</option>
                        <option value="price_low">{t('filters.sort.priceLow')}</option>
                        <option value="price_high">{t('filters.sort.priceHigh')}</option>
                        <option value="newest">{t('filters.sort.newest')}</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
                <aside className="hidden lg:block col-span-1">
                    <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 sticky top-24 shadow-sm">
                        <FilterSidebar />
                    </div>
                </aside>
                {isMobileFilterOpen && (<div className="lg:hidden fixed inset-0 z-[100] bg-black/50" onClick={() => setIsMobileFilterOpen(false)}><div className="absolute right-0 top-0 bottom-0 w-72 bg-white p-6 shadow-2xl overflow-y-auto animate-fade-in-right" onClick={(e) => e.stopPropagation()}><FilterSidebar /></div></div>)}
                <div className="lg:col-span-3">
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                        {paginatedAuctions.length > 0 ? (
                            paginatedAuctions.map(item => <AuctionCard key={item.id} item={item} />)
                        ) : (
                            <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center">
                                <span className="text-6xl block mb-6 opacity-20">🔍</span>
                                <h3 className="text-gray-400 font-black uppercase tracking-widest text-xs italic">Sonuç bulunamadı.</h3>
                                <p className="text-[10px] text-gray-300 font-bold mt-2 uppercase">Lütfen filtreleri değiştirmeyi deneyin.</p>
                            </div>
                        )}
                    </div>
                    {filteredAuctions.length > ITEMS_PER_PAGE && (
                         <div className="mt-16 flex justify-center gap-2">
                             <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center font-black transition-all hover:bg-gray-50">←</button>
                             <span className="h-12 px-6 rounded-2xl bg-indigo-950 text-white flex items-center justify-center font-black text-sm shadow-xl">{currentPage}</span>
                             <button onClick={() => setCurrentPage(prev => prev + 1)} className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center font-black transition-all hover:bg-gray-50">→</button>
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};
