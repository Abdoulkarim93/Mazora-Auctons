import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
    Language, User, ToastMessage, ToastType, InventoryItem, CategoryType, 
    AuctionItem, InventoryStatus, AuctionStatus, ProductCondition,
    BuyerRequest, SupportTicket, Dispute, GiftCodeClaim, AuditLogEntry, Contract,
    DealStep, SellerTier, UserFeedback, getCategorySlotStartTime, BuyerBid
} from './types.ts';
import { MOCK_AUCTIONS, MOCK_REQUESTS, MOCK_USERS, MOCK_TICKETS, MOCK_DISPUTES, MOCK_GIFT_CODES, MOCK_FEEDBACKS } from './mockData.ts';
import { getLocalVault, saveToLocalVault } from './services/supabaseClient.ts';

const getRobustAvatar = (name: string) => {
    const cleanName = encodeURIComponent(name || 'User');
    return `https://ui-avatars.com/api/?name=${cleanName}&background=1E3A8A&color=fff&size=512&bold=true&format=svg`;
};

// LIVE EXCHANGE RATES (Mocked for Demo from TRY base)
const EXCHANGE_RATES: Record<string, { code: string; rate: number; symbol: string; locale: string }> = {
    'TRY': { code: 'TRY', rate: 1, symbol: '₺', locale: 'tr-TR' },
    'XOF': { code: 'XOF', rate: 18.52, symbol: 'CFA', locale: 'fr-SN' }, // Senegal
    'GHS': { code: 'GHS', rate: 0.44, symbol: 'GH₵', locale: 'en-GH' }, // Ghana
    'EUR': { code: 'EUR', rate: 0.027, symbol: '€', locale: 'de-DE' },  // Germany
    'QAR': { code: 'QAR', rate: 0.11, symbol: 'QR', locale: 'en-QA' },  // Qatar
    'USD': { code: 'USD', rate: 0.029, symbol: '$', locale: 'en-US' }
};

interface AppContextType {
    user: User | null;
    auctions: AuctionItem[];
    language: Language;
    toasts: ToastMessage[];
    requests: BuyerRequest[];
    feedbacks: UserFeedback[];
    allUsers: User[];
    tickets: SupportTicket[];
    disputes: Dispute[];
    giftCodes: GiftCodeClaim[];
    auditLogs: AuditLogEntry[];
    contracts: Contract[];
    isReferralModalOpen: boolean;
    currency: { code: string; rate: number; symbol: string; locale: string; };
    setLanguage: (lang: Language) => void;
    t: (path: string) => string;
    login: (role?: 'buyer' | 'seller' | 'admin', identifier?: string, password?: string) => boolean;
    logout: () => void;
    showToast: (message: string, type: ToastType) => void;
    updateInventoryStatus: (itemId: string, status: InventoryStatus, extra?: any) => void;
    updateInventoryItem: (itemId: string, updates: Partial<InventoryItem>) => void;
    formatPrice: (amount: number) => string;
    topUpWallet: (amount: number) => void;
    placeBid: (auctionId: string, amount: number) => boolean;
    buyNow: (auctionId: string) => boolean;
    openReferralModal: (open: boolean) => void;
    register: (payload: any) => Promise<void>;
    quickRegister: (name: string, phone: string, address: string, username: string, password?: string, role?: 'buyer' | 'seller') => void;
    sendAuthCode: (target: string, mustExist?: boolean) => Promise<string>;
    resetPassword: (target: string, newPass: string) => boolean;
    deductQuoteFee: () => boolean;
    addRequest: (req: Partial<BuyerRequest>) => void;
    addFeedback: (comment: string, rating: number) => void;
    verifyUser: (userId: string) => void;
    approveGiftCode: (code: string) => void;
    updateDisputeStatus: (id: string, status: 'negotiation' | 'escalated_court') => void;
    resolveTicket: (id: string, reply: string) => void;
    createTicket: (subject: string, message: string, priority: 'low' | 'medium' | 'high') => void;
    addToInventory: (item: Partial<InventoryItem>) => void;
    generateDealWorkflow: (dealId: string, steps: DealStep[]) => void;
    updateDealStep: (dealId: string, stepId: string, status: 'completed') => void;
    waitlistCount: number;
    localVibe: any;
    maskName: (name: string) => string;
    calculateUserRank: (count: number) => number;
    moveItemToQuickSell: (itemId: string) => void;
    revertItemToStandard: (itemId: string) => void;
    updateUser: (updates: Partial<User>) => void;
    deleteUser: (userId: string) => void;
    toggleUserBlock: (userId: string) => void;
    cancelListing: (itemId: string) => void;
    moveLiveToDraft: (itemId: string) => void;
    repostToQuickSell: (itemId: string) => void;
    adminDeleteAuction: (auctionId: string) => void;
    payProRent: () => boolean;
    adminAddItemToSeller: (sellerId: string, item: Partial<InventoryItem>) => void;
    adminCreateUser: (payload: any) => void;
    adminUpdateAuction: (auctionId: string, updates: Partial<AuctionItem>) => void;
    adminUpdateUser: (userId: string, updates: Partial<User>) => void;
    logAudit: (action: string, details: string) => void;
    acceptUnderReserveBid: (auctionId: string, bidId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const TRANSLATIONS: Record<Language, any> = {
  tr: {
    nav: { home: 'Anasayfa', categories: 'Kategoriler', sell: 'Satış Yap', requests: 'Talepler', profile: 'Profil', login: 'Giriş', signup: 'Üye Ol', search: 'Ürün ara...', feedback: 'Geri Bildirimler' },
    common: { loading: 'Yükleniyor...', cancel: 'İptal', new: 'Sıfır', used: 'İkinci El', timeLeft: 'Kalan Süre', expired: 'SONA ERDİ', back: 'GERİ DÖN', retry: 'TEKRAR DENE', notFoundTitle: 'Sayfa Bulunamadı', notFoundDesc: 'Aradığınız sayfa silinmiş veya taşınmış olabilir.', goHome: 'Anasayfaya Dön', browseCats: 'Kategorilere Göz At' },
    auth: { loginTitle: 'Giriş Yap', loginSubtitle: 'Teklif vermeye başlamak için giriş yapın.', emailLabel: 'ID, Telefon veya E-posta', passwordLabel: 'Şifre', forgotPassword: 'Şifremi Unuttum', forgotDesc: 'Şifrenizi sıfırlamak için e-posta veya telefon numaranızı girin.', sendCode: 'Kod Gönder', verifyCode: 'Kodu Doğrula', newPass: 'Yeni Şifre', resetPass: 'Şifreyi Güncelle', govIdTitle: 'Kimlik Doğrulama' },
    hero: { start: 'Başlangıç', view: 'İncele' },
    home: { 
      feelingLucky: 'Şansını Dene', 
      viewLive: 'Canlı Mezatlar', 
      liveNow: 'CANLI MEZATLAR', 
      noLiveTitle: 'Huzurlu Saatler',
      upcomingEvent: 'Gelecek Etkinlik',
      liveNowLabel: 'ŞİMDİ CANLI',
      fridayPower: 'CUMA GÜCÜ',
      urgentTitle: 'ACELE ET'
    },
    auction: { 
      currentBid: 'Güncel Teklif', endsIn: 'Kalan Süre', placeBid: 'Teklif Ver', joinWaitlist: 'kişi bekleme listesinde', dealObligation: 'Her teklif bağlayıcıdır ve kazanan teslimatta ödeme yapmayı kabul eder.',
      prebid: 'ÖN TEKLİF',
      analyser: { title: 'Fiyat Analizi', source: 'Pazar verilerine dayalı tahmini değerdir.', steal: 'Büyük Fırsat', fair: 'Adil Fiyat', premium: 'Premium Değer' }
    },
    workflow: { 
      fees: { total: 'Toplam', itemPrice: 'Mezat Bedeli', serviceFee: 'Servis Ücreti', cargo: 'Kargo', nowPay: 'Teslimatta Ödeyecek', penalty: 'Vazgeçme Cezası', quickListing: 'Hızlı İlan', weeklyRent: 'Haftalık Kira', buyerCommission: 'Alıcı Komisyonu', sellerCommission: 'Satıcı Komisyonu' } 
    },
    legal: { 
      helpCenter: 'Yardım Merkezi', rulesTitle: 'Mezat Kuralları', termsTitle: 'Kullanım Koşulları', preparing: 'Sözleşme Hazırlanıyor...', escrowTitle: 'Güvenli Ticaret', ethicsTitle: 'Etik İlkeler', privacyTitle: 'Gizlilik Politikası', contractTitle: 'Üyelik Sözleşmesi', faqTitle: 'Sıkça Sorulan Sorular',
      disclaimer: 'Lütfen sözleşmeyi dikkatlice okuyunuz.', preparingContent: 'Hukuki metinler oluşturuluyor...', contact60: '60 Dakika Garantisi', contact60Desc: 'Mezat bittikten sonra 60 dakika içinde randevu planlanır.', penaltyLabel: 'Cezai Şart', penaltyDesc: 'Mezat kurallarını ihlal edenlere %10 ceza uygulanır.', reserveLabel: 'Rezerv Fiyat', reserveDesc: 'Rezerv fiyatın altındaki teklifler satışı garanti etmez.', cargoLabel: 'Kargo Paylaşımı', cargoDesc: 'Yurtiçi kargo ücreti alıcı ve satıcı arasında %50 paylaştırılır.',
      feeNotice: 'İlan ücreti dışında kalan tüm bedeller sadece fiziki teslimatta tahsil edilir.', boostOption: 'Öne çıkarma (Boost) opsiyoneldir.'
    },
    topbar: { schedule: 'Mezat Günleri: Çarşamba, Cuma, Pazar (10:00 - 22:00)', escrow: 'Teslimatta Ödeme Güvencesi', verified: 'Onaylı Satıcılar' },
    profile: { logout: 'Çıkış Yap', edit: 'Düzenle', notifications: 'Bildirimler' },
    requests: { 
      quoteCenter: 'Talep & Teklif Merkezi', myRequests: 'Taleplerim', postRequest: 'Talep Gönder', sellerHint: 'Satıcılar taleplerinize özel teklifler sunar.', budget: 'Bütçe', quantity: 'Adet', serviceDate: 'Hizmet Tarihi', expiresIn: 'Kalan Süre', submitQuote: 'Teklif Ver', receivedQuotes: 'Gelen Teklifler', acceptOffer: 'Teklif Kabul Et', offerAccepted: 'Kabul Edildi', noQuotes: 'Henüz talep bulunmuyor.',
      typeProduct: 'Ürün Alımı', typeService: 'Hizmet Alımı', productPlaceholder: 'Hangi ürüne ihtiyacınız var?', servicePlaceholder: 'Hangi hizmeti arıyorsunuz?', descPlaceholder: 'Detaylı açıklama yazın...', sealed: 'Teklifler sadece sizin tarafınızdan görülür.', labels: { location: 'Konum', date: 'Tarih', target: 'Hedef' }, badges: { product: 'Ürün', service: 'Hizmet' }
    },
    referral: {
        popupTitle: 'ARKADAŞINI DAVET ET 🎁',
        popupBody: 'Arkadaşın ilk işlemini yaptığında ikiniz de 350 TL kazanın!',
        shareBtn: 'WHATSAPP İLE PAYLAŞ',
        close: 'Kapat',
        copied: 'Kopyalandı!'
    },
    filters: { resultsFor: 'Sonuçlar:', marketplace: 'Pazaryeri', activeAuctions: 'Aktif Mezat', sort: { endingSoon: 'Sona Erenler', priceLow: 'En Düşük Fiyat', priceHigh: 'En Yüksek Fiyat', newest: 'En Yeni' } }
  },
  en: {
    nav: { home: 'Home', categories: 'Categories', sell: 'Sell', requests: 'Requests', profile: 'Profile', login: 'Login', signup: 'Sign Up', search: 'Search items...', feedback: 'Feedbacks' },
    common: { loading: 'Loading...', cancel: 'Cancel', new: 'New', used: 'Used', timeLeft: 'Time Left', expired: 'EXPIRED', back: 'GO BACK', retry: 'RETRY', servant: 'Servant', notFoundTitle: 'Page Not Found', notFoundDesc: 'The page you are looking for might have been removed.', goHome: 'Back to Home', browseCats: 'Browse Categories' },
    auth: { loginTitle: 'Login', loginSubtitle: 'Login to start bidding.', emailLabel: 'ID, Phone or Email', passwordLabel: 'Password', forgotPassword: 'Forgot Password', forgotDesc: 'Enter your email or phone to reset password.', sendCode: 'Send Code', verifyCode: 'Verify Code', newPass: 'New Password', resetPass: 'Update Password', govIdTitle: 'Identity Verification' },
    hero: { start: 'Starting', view: 'View' },
    home: { 
      feelingLucky: 'Feeling Lucky', 
      viewLive: 'Live Auctions',
      liveNow: 'LIVE NOW',
      noLiveTitle: 'Quiet Hours',
      upcomingEvent: 'Upcoming Event',
      liveNowLabel: 'LIVE NOW',
      fridayPower: 'FRIDAY POWER',
      urgentTitle: 'URGENT DEALS'
    },
    auction: { 
      currentBid: 'Current Bid', endsIn: 'Ends In', placeBid: 'Place Bid', joinWaitlist: 'people on waitlist', dealObligation: 'Every bid is binding and winners agree to pay on delivery.',
      prebid: 'PRE-BID',
      analyser: { title: 'Price Analysis', source: 'Estimated value based on market data.', steal: 'Steal Deal', fair: 'Fair Price', premium: 'Premium Value' }
    },
    workflow: { 
      fees: { total: 'Total', itemPrice: 'Hammer Price', serviceFee: 'Service Fee', cargo: 'Shipping', nowPay: 'Pay on Delivery', penalty: 'Cancel Penalty', quickListing: 'Quick Listing', weeklyRent: 'Weekly Rent', buyerCommission: 'Buyer Commission', sellerCommission: 'Seller Commission' } 
    },
    legal: { 
      helpCenter: 'Help Center', rulesTitle: 'Auction Rules', termsTitle: 'Terms of Service', preparing: 'Preparing Documents...', escrowTitle: 'Escrow Policy', ethicsPolicy: 'Ethics Policy', privacyTitle: 'Privacy Policy', contractTitle: 'Membership Contract', faqTitle: 'FAQ',
      disclaimer: 'Please read carefully.', preparingContent: 'Legal texts are being generated...', contact60: '60 Min Guarantee', contact60Desc: 'Appointment scheduled within 60 mins of closing.', penaltyLabel: 'Penalty', penaltyDesc: '10% penalty for rules violations.', reserveLabel: 'Reserve Price', reserveDesc: 'Bids below reserve do not guarantee sale.', cargoLabel: 'Cargo Split', cargoDesc: 'Domestic shipping is split 50/50.',
      feeNotice: 'All fees except listing are collected at physical delivery.', boostOption: 'Visibility Boost is optional.'
    },
    topbar: { schedule: 'Auction Days: Wed, Fri, Sun (10:00 - 22:00)', escrow: 'Payment at Delivery Guarantee', verified: 'Verified Sellers' },
    profile: { logout: 'Logout', edit: 'Edit', notifications: 'Notifications' },
    requests: { 
      quoteCenter: 'Requests & Quotes', myRequests: 'My Requests', postRequest: 'Post Request', sellerHint: 'Sellers provide custom quotes for your needs.', budget: 'Budget', quantity: 'Quantity', serviceDate: 'Service Date', expiresIn: 'Time Left', submitQuote: 'Submit Quote', receivedQuotes: 'Quotes Received', acceptOffer: 'Accept Offer', offerAccepted: 'Accepted', noQuotes: 'No requests yet.',
      typeProduct: 'Product Purchase', typeService: 'Service Request', productPlaceholder: 'What product do you need?', servicePlaceholder: 'What service are you looking for?', descPlaceholder: 'Describe in detail...', sealed: 'Quotes are sealed and private.', labels: { location: 'Location', date: 'Date', target: 'Target' }, badges: { product: 'Product', service: 'Service' }
    },
    referral: {
        popupTitle: 'INVITE A FRIEND 🎁',
        popupBody: 'Earn 350 TL each when your friend completes their first transaction!',
        shareBtn: 'SHARE VIA WHATSAPP',
        close: 'Close',
        copied: 'Copied!'
    },
    filters: { resultsFor: 'Results for:', marketplace: 'Marketplace', activeAuctions: 'Active Auctions', sort: { endingSoon: 'Ending Soon', priceLow: 'Lowest Price', priceHigh: 'Highest Price', newest: 'Newest' } }
  },
  fr: {
    nav: { home: 'Accueil', categories: 'Catégories', sell: 'Vendre', requests: 'Demandes', profile: 'Profil', login: 'Connexion', signup: 'S\'inscrire', search: 'Rechercher...', feedback: 'Avis' },
    common: { loading: 'Chargement...', cancel: 'Annuler', new: 'Neuf', used: 'Occasion', timeLeft: 'Temps restant', expired: 'EXPIRÉ', back: 'RETOUR', retry: 'RÉESSAYER', notFoundTitle: 'Page non trouvée', notFoundDesc: 'La page que vous recherchez a peut-être été supprimée.', goHome: 'Retour à l\'accueil', browseCats: 'Parcourir les catégories' },
    auth: { loginTitle: 'Connexion', loginSubtitle: 'Connectez-vous pour commencer à enchérir.', emailLabel: 'ID, Téléphone ou E-mail', passwordLabel: 'Mot de passe', forgotPassword: 'Mot de passe oublié', forgotDesc: 'Entrez votre e-mail ou téléphone pour réinitialiser le mot de passe.', sendCode: 'Envoyer le code', verifyCode: 'Vérifier le code', newPass: 'Nouveau mot de passe', resetPass: 'Mettre à jour le mot de passe', govIdTitle: 'Vérification d\'identité' },
    hero: { start: 'À partir de', view: 'Voir' },
    home: { 
      feelingLucky: 'Tenter sa chance', 
      viewLive: 'Enchères en direct',
      liveNow: 'EN DIRECT',
      noLiveTitle: 'Heures Calmes',
      upcomingEvent: 'Événement à venir',
      liveNowLabel: 'EN DIRECT',
      fridayPower: 'FRIDAY POWER',
      urgentTitle: 'OFFRES URGENTES'
    },
    auction: { 
      currentBid: 'Enchère actuelle', endsIn: 'Se termine dans', placeBid: 'Enchérir', joinWaitlist: 'personnes sur liste d\'attente', dealObligation: 'Chaque enchère est contraignante et les gagnants acceptent de payer à la livraison.',
      prebid: 'PRÉ-ENCHÈRE',
      analyser: { title: 'Analyse de prix', source: 'Valeur estimée basée sur les données du marché.', steal: 'Super affaire', fair: 'Prix juste', premium: 'Valeur Premium' }
    },
    workflow: { 
      fees: { total: 'Total', itemPrice: 'Prix d\'adjudication', serviceFee: 'Frais de service', cargo: 'Livraison', nowPay: 'Payer à la livraison', penalty: 'Pénalité d\'annulation', quickListing: 'Annonce rapide', weeklyRent: 'Loyer hebdomadaire', buyerCommission: 'Commission acheteur', sellerCommission: 'Commission vendeur' } 
    },
    legal: { 
      helpCenter: 'Centre d\'aide', rulesTitle: 'Règles des enchères', termsTitle: 'Conditions d\'utilisation', preparing: 'Préparation des documents...', escrowTitle: 'Politique d\'entiercement', ethicsTitle: 'Politique d\'éthique', privacyTitle: 'Politique de confidentialité', contractTitle: 'Contrat d\'adhésion', faqTitle: 'FAQ',
      disclaimer: 'Veuillez lire attentivement.', preparingContent: 'Les textes juridiques sont en cours de génération...', contact60: 'Garantie 60 min', contact60Desc: 'Rendez-vous planifié dans les 60 min suivant la clôture.', penaltyLabel: 'Pénalité', penaltyDesc: '10% de pénalité pour violation des règles.', reserveLabel: 'Prix de réserve', reserveDesc: 'Les enchères inférieures à la réserve ne garantissent pas la vente.', cargoLabel: 'Partage de frais de port', cargoDesc: 'Les frais de port nationaux sont partagés 50/50.',
      feeNotice: 'Tous les frais sauf l\'annonce sont collectés lors de la livraison physique.', boostOption: 'Le boost de visibilité est optionnel.'
    },
    topbar: { schedule: 'Jours d\'enchères : Mer, Ven, Dim (10h00 - 22h00)', escrow: 'Garantie de paiement à la livraison', verified: 'Vendeurs vérifiés' },
    profile: { logout: 'Déconnexion', edit: 'Modifier', notifications: 'Notifications' },
    requests: { 
      quoteCenter: 'Demandes & Devis', myRequests: 'Mes demandes', postRequest: 'Publier une demande', sellerHint: 'Les vendeurs proposent des devis personnalisés pour vos besoins.', budget: 'Budget', quantity: 'Quantité', serviceDate: 'Date du service', expiresIn: 'Temps restant', submitQuote: 'Soumettre un devis', receivedQuotes: 'Devis reçus', acceptOffer: 'Accepter l\'offre', offerAccepted: 'Accepted', noQuotes: 'Pas noch de demandes.',
      typeProduct: 'Achat de produit', typeService: 'Demande de service', productPlaceholder: 'De quel produit avez-vous besoin ?', servicePlaceholder: 'Quel service recherchez-vous ?', descPlaceholder: 'Décrivez en détail...', sealed: 'Les devis sont scellés et privés.', labels: { location: 'Emplacement', date: 'Date', target: 'Cible' }, badges: { product: 'Produit', service: 'Service' }
    },
    referral: {
        popupTitle: 'INVITEZ UN AMI 🎁',
        popupBody: 'Gagnez 350 TL chacun lorsque votre ami effectue sa première transaction !',
        shareBtn: 'PARTAGER VIA WHATSAPP',
        close: 'Fermer',
        copied: 'Copié !'
    },
    filters: { resultsFor: 'Résultats pour:', marketplace: 'Marché', activeAuctions: 'Enchères Actives', sort: { endingSoon: 'Se termine bientôt', priceLow: 'Prix croissant', priceHigh: 'Prix décroissant', newest: 'Plus récent' } }
  }
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("useApp must be used within AppProvider");
    return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(getLocalVault('current_user'));
    const [auctions, setAuctions] = useState<AuctionItem[]>(getLocalVault('auctions') || MOCK_AUCTIONS);
    const [requests, setRequests] = useState<BuyerRequest[]>(getLocalVault('requests') || MOCK_REQUESTS);
    
    const [allUsers, setAllUsers] = useState<User[]>(() => {
        const local = getLocalVault('all_users') || [];
        const combined = [...MOCK_USERS];
        if (local && Array.isArray(local)) {
          local.forEach((lu: User) => {
              const idx = combined.findIndex(u => u.id === lu.id);
              if (idx > -1) combined[idx] = lu;
              else combined.push(lu);
          });
        }
        return combined;
    });

    const [feedbacks, setFeedbacks] = useState<UserFeedback[]>(getLocalVault('feedbacks') || MOCK_FEEDBACKS);
    const [language, setLanguageState] = useState<Language>('tr');
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);

    useEffect(() => {
        if (!user) return;
        if (user.countryCode === 'SN') {
            setLanguageState('fr');
        } else if (user.countryCode === 'GH' || user.countryCode === 'DE' || user.countryCode === 'QA') {
            setLanguageState('en');
        } else {
            setLanguageState('tr');
        }
    }, [user]);

    useEffect(() => { saveToLocalVault('current_user', user); }, [user]);
    useEffect(() => { saveToLocalVault('auctions', auctions); }, [auctions]);
    useEffect(() => { saveToLocalVault('requests', requests); }, [requests]);
    useEffect(() => { saveToLocalVault('all_users', allUsers); }, [allUsers]);
    useEffect(() => { saveToLocalVault('feedbacks', feedbacks); }, [feedbacks]);

    const setLanguage = (lang: Language) => setLanguageState(lang);

    const t = (path: string) => {
        const parts = path.split('.');
        let current = TRANSLATIONS[language];
        for (const part of parts) {
            if (current === undefined || current[part] === undefined) return path;
            current = current[part];
        }
        return typeof current === 'string' ? current : path;
    };

    const showToast = (message: string, type: ToastType) => {
        const id = Math.random().toString(36).substring(7);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };

    const login = (role?: 'buyer' | 'seller' | 'admin', identifier?: string, password?: string) => {
        const cleanId = identifier?.trim().toLowerCase() || '';
        const numericId = cleanId.replace(/\D/g, ''); 

        const found = allUsers.find(u => {
            const uEmail = u.email?.toLowerCase();
            const uUser = u.username?.toLowerCase();
            const uPhone = u.phone?.replace(/\D/g, '') || u.phoneNumber?.replace(/\D/g, '');
            
            const matchIdentifier = (
                uEmail === cleanId || 
                uUser === cleanId || 
                (numericId && uPhone === numericId)
            );
            
            const matchRole = role ? u.role === role : true;
            const requiredPassword = u.password || '123';
            const matchPassword = password === requiredPassword;
            
            return matchIdentifier && matchRole && matchPassword;
        });
        
        if (found) {
            setUser({ ...found });
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        setLanguageState('tr'); // Reset to default on logout
    };

    const updateUser = (updates: Partial<User>) => {
        if (!user) return;
        const updated = { ...user, ...updates };
        setUser(updated);
        setAllUsers(prev => prev.map(u => u.id === user.id ? updated : u));
    };

    const getCurrencyCode = () => {
        if (user?.preferredCurrency) return user.preferredCurrency;
        if (user?.countryCode === 'SN') return 'XOF';
        if (user?.countryCode === 'GH') return 'GHS';
        if (user?.countryCode === 'DE') return 'EUR';
        if (user?.countryCode === 'QA') return 'QAR';
        return 'TRY';
    };

    const formatPrice = (amountInTRY: number) => {
        const currCode = getCurrencyCode();
        const info = EXCHANGE_RATES[currCode] || EXCHANGE_RATES['TRY'];
        const converted = amountInTRY * info.rate;
        
        return new Intl.NumberFormat(info.locale, { 
            style: 'currency', 
            currency: currCode, 
            maximumFractionDigits: 0 
        }).format(converted);
    };

    const register = async (payload: any) => {
        const newUser: User = {
            id: Math.random().toString(36).substring(7),
            username: payload.username,
            name: payload.name,
            email: payload.email,
            password: payload.password,
            role: payload.role,
            phone: payload.phone,
            address: payload.address,
            walletBalance: payload.rewardEligible ? 100 : 0,
            frozenBalance: 0,
            joinedDate: new Date(),
            notifications: [],
            participationCount: 0,
            reputationScore: 100,
            participatedAuctionIds: [],
            timeSpentSeconds: 0,
            referralCode: payload.name.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 1000),
            freeQuotesRemaining: 5,
            avatarUrl: payload.avatarUrl || getRobustAvatar(payload.name),
            sellerTier: payload.sellerTier || 'quick',
            canPublish: false,
            inventory: []
        };
        setAllUsers(prev => [...prev, newUser]);
        setUser(newUser);
    };

    const placeBid = (auctionId: string, amount: number) => {
        if (!user) return false;
        const targetAuction = auctions.find(a => a.id === auctionId);
        if (!targetAuction) return false;

        const newBidObj = { id: Date.now().toString(), userId: user.id, userName: user.name, amount, timestamp: new Date() };

        setAuctions(prev => prev.map(a => {
            if (a.id === auctionId) {
                const now = new Date();
                const timeRemaining = a.endsAt.getTime() - now.getTime();
                let newEndsAt = a.endsAt;
                
                if (timeRemaining > 0 && timeRemaining <= 2 * 60 * 1000) {
                    newEndsAt = new Date(a.endsAt.getTime() + 2 * 60 * 1000);
                }

                return { ...a, currentBid: amount, bids: [newBidObj, ...a.bids], endsAt: newEndsAt };
            }
            return a;
        }));

        const bidHistoryEntry: BuyerBid = {
            id: newBidObj.id,
            auctionId: targetAuction.id,
            auctionTitle: targetAuction.title,
            auctionImage: targetAuction.imageUrl,
            myBid: amount,
            status: amount >= targetAuction.reservePrice ? 'winning' : 'pending_seller',
            timestamp: new Date(),
            condition: targetAuction.condition
        };

        const existingHistory = user.bidHistory || [];
        const updatedHistory = [bidHistoryEntry, ...existingHistory.filter(b => b.auctionId !== auctionId)];
        
        updateUser({ 
            bidHistory: updatedHistory,
            participatedAuctionIds: Array.from(new Set([...(user.participatedAuctionIds || []), auctionId])),
            participationCount: user.participatedAuctionIds.includes(auctionId) ? user.participationCount : user.participationCount + 1
        });

        return true;
    };

    const buyNow = (auctionId: string) => {
        if (!user) return false;
        const targetAuction = auctions.find(a => a.id === auctionId);
        if (!targetAuction) return false;

        setAuctions(prev => prev.map(a => a.id === auctionId ? { ...a, status: AuctionStatus.ENDED } : a));

        const winEntry: BuyerBid = {
            id: Date.now().toString(),
            auctionId: targetAuction.id,
            auctionTitle: targetAuction.title,
            auctionImage: targetAuction.imageUrl,
            myBid: targetAuction.buyNowPrice || targetAuction.currentBid,
            status: 'won',
            timestamp: new Date(),
            condition: targetAuction.condition
        };

        const existingHistory = user.bidHistory || [];
        updateUser({ 
            bidHistory: [winEntry, ...existingHistory.filter(b => b.auctionId !== auctionId)],
            walletBalance: user.walletBalance - (targetAuction.buyNowPrice || 0)
        });

        return true;
    };

    const acceptUnderReserveBid = (auctionId: string, bidId: string) => {
        const auction = auctions.find(a => a.id === auctionId);
        if (!auction) return;
        
        const winningBid = auction.bids.find(b => b.id === bidId);
        if (!winningBid) return;

        setAuctions(prev => prev.map(a => a.id === auctionId ? { ...a, status: AuctionStatus.ENDED, currentBid: winningBid.amount } : a));
        
        setAllUsers(prev => prev.map(u => {
            if (u.id === winningBid.userId) {
                const updatedHistory = (u.bidHistory || []).map(bh => bh.id === bidId ? { ...bh, status: 'won' as const } : bh);
                return { ...u, bidHistory: updatedHistory };
            }
            return u;
        }));

        if (user) {
            const updatedInv = (user.inventory || []).map(i => i.id === auctionId ? { ...i, status: 'sold' as const } : i);
            updateUser({ inventory: updatedInv });
        }

        showToast("Teklif kabul edildi! İşlem başlatılıyor.", "success");
    };

    const addToInventory = (item: Partial<InventoryItem>) => {
        if (!user) return;
        const mainImageUrl = item.imageUrl || (item.images && item.images.length > 0 ? item.images[0] : '');
        
        const isFirstPost = (user.inventory?.length || 0) === 0;
        const canPublishNow = isFirstPost || user.canPublish;
        
        const finalStatus: InventoryStatus = canPublishNow ? (item.status || 'active') : 'draft';

        const newItem: InventoryItem = {
            id: Math.random().toString(36).substring(7),
            title: item.title!,
            category: item.category!,
            condition: item.condition!,
            imageUrl: mainImageUrl,
            images: item.images || (mainImageUrl ? [mainImageUrl] : []),
            videoUrl: item.videoUrl,
            startPrice: item.startPrice!,
            reservePrice: item.reservePrice!,
            status: finalStatus,
            createdAt: new Date(),
            location: item.location || 'İstanbul',
            quantity: item.quantity || 1,
            ...item
        };
        
        const currentInventory = user.inventory || [];
        const updatedInventory = [...currentInventory, newItem];
        updateUser({ inventory: updatedInventory });

        if (finalStatus === 'active') {
            const newAuction: AuctionItem = {
                id: newItem.id,
                title: newItem.title,
                description: newItem.description || '',
                category: newItem.category,
                condition: newItem.condition,
                imageUrl: newItem.imageUrl,
                images: newItem.images,
                videoUrl: newItem.videoUrl,
                currentBid: newItem.startPrice,
                reservePrice: newItem.reservePrice,
                buyNowPrice: newItem.buyNowPrice,
                currency: 'TRY',
                startsAt: item.listedAt || new Date(),
                endsAt: new Date((item.listedAt?.getTime() || Date.now()) + 24 * 3600 * 1000),
                status: AuctionStatus.ACTIVE,
                bids: [],
                sellerId: user.id,
                verifiedListing: user.sellerTier === 'onayli',
                viewCount: 0,
                location: newItem.location || 'İstanbul',
                quantity: newItem.quantity
            };
            setAuctions(prev => [newAuction, ...prev]);
        }
    };

    const updateInventoryItem = (itemId: string, updates: Partial<InventoryItem>) => {
        if (!user) return;
        const currentInventory = user.inventory || [];
        const updatedInv = currentInventory.map(i => {
            if (i.id === itemId) {
                const merged = { ...i, ...updates };
                if (updates.images && updates.images.length > 0) merged.imageUrl = updates.images[0];
                return merged;
            }
            return i;
        });

        if (updates.status === 'active') {
            const item = updatedInv.find(i => i.id === itemId);
            if (item) {
                const newAuction: AuctionItem = {
                    id: item.id, title: item.title, description: item.description || '', category: item.category, condition: item.condition, imageUrl: item.imageUrl, images: item.images, videoUrl: item.videoUrl, currentBid: item.startPrice, reservePrice: item.reservePrice, buyNowPrice: item.buyNowPrice, currency: 'TRY', startsAt: item.listedAt || new Date(), endsAt: item.expiryDate || new Date((item.listedAt?.getTime() || Date.now()) + 24 * 3600 * 1000), status: AuctionStatus.ACTIVE, bids: [], sellerId: user.id, verifiedListing: user.sellerTier === 'onayli', viewCount: 0, location: item.location || 'İstanbul', quantity: item.quantity
                };
                setAuctions(prev => {
                    const exists = prev.find(a => a.id === itemId);
                    if (exists) return prev.map(a => a.id === itemId ? newAuction : a);
                    return [newAuction, ...prev];
                });
            }
        }

        updateUser({ inventory: updatedInv });
    };

    const cancelListing = (itemId: string) => {
        if (!user) return;
        const updatedInv = (user.inventory || []).filter(i => i.id !== itemId);
        updateUser({ inventory: updatedInv });
        setAuctions(prev => prev.filter(a => a.id !== itemId));
    };

    const value: AppContextType = {
        user, auctions, language, toasts, requests, feedbacks, allUsers,
        tickets: [], disputes: [], giftCodes: [], auditLogs, contracts: [], isReferralModalOpen,
        currency: EXCHANGE_RATES[getCurrencyCode()] || EXCHANGE_RATES['TRY'],
        setLanguage, t, login, logout, showToast, formatPrice,
        topUpWallet: (amount) => updateUser({ walletBalance: (user?.walletBalance || 0) + amount }),
        placeBid, buyNow, register, addToInventory, 
        addRequest: (req) => {
            const newReq = { 
                id: Math.random().toString(36).substring(7), 
                buyerId: user?.id || 'guest', 
                buyerName: user?.name || 'Guest',
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 3 * 24 * 3600000), 
                status: 'open' as const,
                quotes: [],
                currency: 'TRY',
                ...req 
            } as BuyerRequest;
            setRequests(prev => [newReq, ...prev]);
        },
        addFeedback: (comment, rating) => {
            if (!user) return;
            setFeedbacks(prev => [{ id: Date.now().toString(), userName: user.name, rating, comment, date: new Date(), isVerified: true }, ...prev]);
        },
        updateUser, updateInventoryItem, cancelListing, 
        adminDeleteAuction: (id) => setAuctions(prev => prev.filter(a => a.id !== id)), 
        adminUpdateAuction: (id, updates) => setAuctions(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a)), 
        adminUpdateUser: (id, updates) => {
            setAllUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
            if (user && user.id === id) {
                setUser(prev => prev ? { ...prev, ...updates } : null);
            }
        },
        adminCreateUser: (payload) => setAllUsers(prev => [...prev, { id: Math.random().toString(36).substring(7), joinedDate: new Date(), notifications: [], participationCount: 0, reputationScore: 100, participatedAuctionIds: [], timeSpentSeconds: 0, referralCode: 'M-' + Math.floor(Math.random() * 1000), freeQuotesRemaining: 5, frozenBalance: 0, walletBalance: 0, avatarUrl: getRobustAvatar(payload.name), canPublish: false, ...payload }]),
        openReferralModal: (open) => setIsReferralModalOpen(open),
        quickRegister: (name, phone, address, username, password, role) => 
            register({ 
                name, 
                phone, 
                address, 
                username, 
                password: password || '123', 
                role: role || 'buyer', 
                email: `${username.toLowerCase()}@mazora.com`, 
            }),
        sendAuthCode: async () => "123456",
        resetPassword: () => true,
        deductQuoteFee: () => true,
        verifyUser: (id) => setAllUsers(prev => prev.map(u => u.id === id ? { ...u, isVerified: true } : u)),
        approveGiftCode: () => {},
        updateDisputeStatus: () => {},
        resolveTicket: () => {},
        createTicket: () => {},
        generateDealWorkflow: () => {},
        updateDealStep: () => {},
        waitlistCount: 142,
        localVibe: {},
        maskName: (n) => (n && n.split(' ').length > 0) ? n.split(' ')[0] + ' ***' : 'Gizli Üye',
        calculateUserRank: (c) => Math.min(5, Math.floor(c / 10)),
        moveItemToQuickSell: () => {},
        revertItemToStandard: () => {},
        deleteUser: (id) => setAllUsers(prev => prev.filter(u => u.id !== id)),
        toggleUserBlock: (id) => setAllUsers(prev => prev.map(u => u.id === id ? { ...u, isBlocked: !u.isBlocked } : u)),
        moveLiveToDraft: (id) => updateInventoryItem(id, { status: 'draft' }),
        repostToQuickSell: (id) => updateInventoryItem(id, { status: 'active' }),
        payProRent: () => true,
        adminAddItemToSeller: (sellerId, item) => {
             const newItem: InventoryItem = {
                id: Math.random().toString(36).substring(7),
                title: item.title!,
                category: item.category!,
                condition: item.condition!,
                imageUrl: item.imageUrl!,
                images: item.images || (item.imageUrl ? [item.imageUrl] : []),
                videoUrl: item.videoUrl,
                startPrice: item.startPrice!,
                reservePrice: item.reservePrice!,
                status: item.status || 'draft',
                createdAt: new Date(),
                location: item.location || 'Türkiye',
                quantity: item.quantity || 1,
                ...item
            };
            setAllUsers(prev => prev.map(u => {
                if (u.id === sellerId) return { ...u, inventory: [...(u.inventory || []), newItem] };
                return u;
            }));
            if (item.status === 'active') {
                const newA: AuctionItem = {
                    id: newItem.id, title: newItem.title, description: newItem.description || '', category: newItem.category, condition: newItem.condition, imageUrl: newItem.imageUrl, images: newItem.images, videoUrl: newItem.videoUrl, currentBid: newItem.startPrice, reservePrice: newItem.reservePrice, buyNowPrice: newItem.buyNowPrice, currency: 'TRY', startsAt: item.listedAt || new Date(), endsAt: item.expiryDate || new Date((item.listedAt?.getTime() || Date.now()) + 24 * 3600 * 1000), status: AuctionStatus.ACTIVE, bids: [], sellerId: sellerId, verifiedListing: true, viewCount: 0, location: newItem.location, quantity: newItem.quantity
                };
                setAuctions(prev => [newA, ...prev]);
            }
        },
        logAudit: (action, details) => setAuditLogs(prev => [{ id: Date.now().toString(), action, details, performedBy: user?.name || 'System', timestamp: new Date() }, ...prev]),
        updateInventoryStatus: (id, status) => updateInventoryItem(id, { status }),
        acceptUnderReserveBid
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};