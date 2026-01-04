
export enum CategoryType {
  ELECTRONICS = 'electronics',
  VEHICLES = 'vehicles',
  HOME = 'home',
  LUXURY = 'luxury',
  INDUSTRIAL = 'industrial',
  VIP_SERVICES = 'vip_services',
  AGRICULTURE = 'agriculture',
  YAPI_MARKET = 'yapi_market',
  GIYIM = 'giyim',
  ANTIQUES = 'antiques',
  DIRECT_24H = 'direct_24h',
  KITCHENWARE = 'kitchenware',
  FASHION = 'fashion',
  ELECTRONICS_ACC = 'electronics_acc',
  FURNITURE_ACC = 'furniture_acc',
  GIFTS = 'gifts',
  MOTHER_CHILD = 'mother_child',
  ACCESSORIES_BAGS = 'accessories_bags',
  COSMETICS = 'cosmetics',
  FOOTWEAR = 'footwear',
  CONSUMABLES = 'consumables',
  PETS = 'pets',
  OTHER = 'other'
}

export enum ProductCondition {
  NEW = 'NEW',
  USED = 'USED'
}

export enum AuctionStatus {
  UPCOMING = 'upcoming',
  PREBIDDING = 'prebidding',
  ACTIVE = 'active',
  ENDED = 'ended',
  PENDING_RESERVE = 'pending_reserve',
  SOLD_INSTANT = 'sold_instant'
}

export type SellerTier = 'guest' | 'quick' | 'onayli';

export interface UserFeedback {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: Date;
  isVerified: boolean;
}

export interface DealStep {
    id: string;
    label: string;
    description: string;
    status: 'pending' | 'completed';
    requiredActionBy: 'buyer' | 'seller' | 'admin' | 'none';
}

export interface DealWorkflow {
    dealId: string;
    auctionId: string;
    buyerId: string;
    sellerId: string;
    steps: DealStep[];
    currentStepIndex: number;
    isFinished: boolean;
}

export interface ModerationResult {
    isSafe: boolean;
    flags: string[];
    enhancedDescription: string;
}

export type RequestType = 'product' | 'service';

export interface Quote {
    id: string;
    sellerId: string;
    sellerName: string;
    price: number;
    deliveryTime: string;
    note?: string;
    isVerified: boolean;
}

export interface BuyerRequest {
    id: string;
    buyerId: string;
    buyerName: string;
    title: string;
    description: string;
    category: CategoryType;
    type: RequestType;
    quantity: number;
    budget: number;
    currency: string;
    location: string;
    preferredDate?: Date;
    createdAt: Date;
    expiresAt: Date;
    status: 'open' | 'completed';
    quotes: Quote[];
    imageUrl?: string;
    images?: string[];
}

export interface SupportTicket {
    id: string;
    userId: string;
    userName: string;
    subject: string;
    message: string;
    status: 'open' | 'resolved';
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
    reply?: string;
}

export interface Dispute {
    id: string;
    dealId: string;
    buyerId: string;
    sellerId: string;
    reason: string;
    status: 'pending' | 'negotiation' | 'escalated_court' | 'resolved';
    createdAt: Date;
}

export interface GiftCodeClaim {
    id: string;
    code: string;
    amount: number;
    isClaimed: boolean;
    claimedBy?: string;
    claimedAt?: Date;
}

export interface AuditLogEntry {
    id: string;
    action: string;
    performedBy: string;
    timestamp: Date;
    details: string;
}

export interface Contract {
    id: string;
    userId: string;
    type: string;
    signedAt: Date;
    content: string;
}

export interface Transaction {
    id: string;
    userId: string;
    amount: number;
    type: 'deposit' | 'withdrawal' | 'commission' | 'penalty';
    timestamp: Date;
    description: string;
}

export const FEE_STRUCTURE = {
    BUYER_MAZORA_FEE_PERCENT: 0.05,
    SELLER_MAZORA_FEE_PERCENT: 0.05,
    QUICK_LISTING_FEE_TL: 97,
    IS_FIRST_LISTING_FREE: true,
    ONAYLI_WEEKLY_RENT_TL: 1250, 
    PROCESS_FEE_SHARE_TL: 0,
    QUOTE_FEE_USD: 2, 
    EXPERT_FEE_TL: 500,
    BOOST_FEE_TL: 97,
    CANCEL_PENALTY_TL: 200,
    MIN_BID_INCREMENT_TL: 50,
    CARGO_SPLIT_PERCENT: 0.50,
    ESTIMATED_AVG_CARGO_TL: 150,
    BUYER_PAYMENT_WINDOW_HOURS: 12,
    SELLER_PACKING_WINDOW_HOURS: 72, 
    CARGO_DELIVERY_WINDOW_HOURS: 72, 
    BUYER_REJECTION_PENALTY_PERCENT: 0.10, 
    SELLER_PENALTY_COMPENSATION_PERCENT: 0.02, 
    EXCHANGE_RATE: 34.50,
    MIN_WALLET_BALANCE_FOR_TRUST: 300,
    MAX_FREE_PARTICIPATIONS: 5,
    RESERVE_STRATEGY: {
        LOW: { categories: [CategoryType.ELECTRONICS, CategoryType.HOME, CategoryType.GIYIM, CategoryType.ANTIQUES, CategoryType.VIP_SERVICES, CategoryType.DIRECT_24H, CategoryType.MOTHER_CHILD, CategoryType.ACCESSORIES_BAGS, CategoryType.COSMETICS, CategoryType.FOOTWEAR, CategoryType.CONSUMABLES, CategoryType.PETS, CategoryType.OTHER], flatFee: 100 },
        MID: { categories: [CategoryType.VEHICLES, CategoryType.INDUSTRIAL, CategoryType.AGRICULTURE], percent: 0.01, min: 250, max: 1000 },
        HIGH: { categories: [CategoryType.YAPI_MARKET, CategoryType.LUXURY], percent: 0.02, max: 5000 }
    }
};

export type InventoryStatus = 'draft' | 'scheduled' | 'active' | 'guest_active' | 'sold' | 'shipped' | 'delivered' | 'returned' | 'penalized' | 'pending_approval';

export interface WorkflowTimestamps {
    wonAt?: Date;
    paidAt?: Date;
    packedAt?: Date;
    shippedAt?: Date;
    deliveredAt?: Date;
    paymentDeadline?: Date;
    packingDeadline?: Date;
    deliveryDeadline?: Date;
}

export interface InventoryItem extends WorkflowTimestamps {
  id: string;
  title: string;
  description?: string;
  category: CategoryType;
  subcategory?: string;
  condition: ProductCondition;
  imageUrl: string; 
  images?: string[];
  videoUrl?: string;
  startPrice: number;
  reservePrice: number;
  buyNowPrice?: number;
  status: InventoryStatus;
  createdAt: Date;
  listedAt?: Date;
  expiryDate?: Date; 
  repostEligibleUntil?: Date; 
  packingProofUrl?: string;
  escrowStatus?: 'pending' | 'held' | 'released' | 'returned';
  lastUnsoldAt?: Date; 
  isBoosted?: boolean;
  documentUrls?: string[];
  guestPhone?: string;
  workflow?: DealWorkflow;
  location?: string;
  quantity?: number;
}

export interface BuyerBid {
  id: string;
  auctionId: string;
  auctionTitle: string;
  auctionImage: string;
  myBid: number;
  status: 'winning' | 'outbid' | 'won' | 'pending_seller';
  timestamp: Date;
  condition: ProductCondition;
}

export interface User {
  id: string;
  username?: string; 
  name: string;
  email: string;
  password?: string;
  description?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  phone?: string;
  address?: string;
  referralCode: string;
  role: 'buyer' | 'seller' | 'admin';
  sellerTier?: SellerTier; 
  rentExpiry?: Date; 
  isRentPaid?: boolean; 
  walletBalance: number;
  frozenBalance: number;
  joinedDate: Date;
  notifications: any[];
  inventory?: InventoryItem[]; 
  bidHistory?: BuyerBid[]; 
  participationCount: number;
  reputationScore: number;
  participatedAuctionIds: string[];
  timeSpentSeconds: number;
  isVerified?: boolean;
  isStore?: boolean;
  isBlocked?: boolean;
  canPublish?: boolean; 
  freeQuotesRemaining: number;
  gender?: 'male' | 'female' | 'other';
  agreementAccepted?: boolean;
  buyerRulesAccepted?: boolean;
  referralHistory?: any[];
  location?: string;
  watchlist?: string[];
  preferredCurrency?: string;
  countryCode?: string;
}

export interface AuctionItem {
  id: string;
  title: string;
  description: string;
  category: CategoryType;
  subcategory?: string;
  condition: ProductCondition;
  imageUrl: string;
  currentBid: number;
  reservePrice: number;
  buyNowPrice?: number;
  currency: string;
  endsAt: Date;
  status: AuctionStatus;
  bids: any[];
  sellerId: string;
  verifiedListing: boolean;
  viewCount: number;
  location: string;
  marketValue?: MarketPriceEstimate;
  isLossLeader?: boolean;
  images?: string[];
  videoUrl?: string;
  startsAt: Date;
  waitlistCount?: number;
  dimensions?: {
    weightKg: number;
    desi: number;
  };
  isBoosted?: boolean;
  quantity?: number;
}

export interface MarketPriceEstimate {
  min: number;
  max: number;
  currency: string;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export interface ToastMessage { id: string; message: string; type: ToastType; }
export type Language = 'tr' | 'en' | 'fr';

export const CATEGORIES = [
  { id: CategoryType.ELECTRONICS, label: { en: 'Electronics', tr: 'Elektronik', fr: 'Électronique' }, icon: '📱', subcategories: ['Smartphones', 'TV & Video', 'Laptops', 'Tablets', 'Audio', 'Gaming', 'Cameras', 'Printers', 'Diğer'] },
  { id: CategoryType.VEHICLES, label: { en: 'Vehicles', tr: 'Vasıta', fr: 'Véhicules' }, icon: '🚗', subcategories: ['Cars', 'Motorcycles', 'Boats', 'Trucks', 'Spare Parts', 'Diğer'] },
  { id: CategoryType.HOME, label: { en: 'Home & Living', tr: 'Ev & Yaşam', fr: 'Maison' }, icon: '🛋️', subcategories: ['Furniture', 'Kitchen Appliances', 'Decoration', 'Garden', 'Lighting', 'Diğer'] },
  { id: CategoryType.GIYIM, label: { en: 'Clothing', tr: 'Giyim', fr: 'Vêtements' }, icon: '👕', subcategories: ['Men', 'Women', 'Kids', 'Activewear', 'Outerwear', 'Diğer'] },
  { id: CategoryType.KITCHENWARE, label: { en: 'Kitchenware', tr: 'Mutfak Gereçleri', fr: 'Cuisine' }, icon: '🍳', subcategories: ['Cookware', 'Tableware', 'Small Appliances', 'Storage', 'Diğer'] },
  { id: CategoryType.FASHION, label: { en: 'Fashion & Style', tr: 'Moda & Stil', fr: 'Mode' }, icon: '👗', subcategories: ['Bags', 'Watches', 'Jewelry', 'Sunglasses', 'Diğer'] },
  { id: CategoryType.LUXURY, label: { en: 'Luxury Items', tr: 'Lüks Parçalar', fr: 'Luxe' }, icon: '💎', subcategories: ['Premium Watches', 'Designer Bags', 'Fine Jewelry', 'Art', 'Diğer'] },
  { id: CategoryType.ANTIQUES, label: { en: 'Antiques', tr: 'Antika', fr: 'Antiquités' }, icon: '🏺', subcategories: ['Ottoman', 'European', 'Vintage Tools', 'Coins', 'Diğer'] },
  { id: CategoryType.INDUSTRIAL, label: { en: 'Industrial', tr: 'Sanayi', fr: 'Industrie' }, icon: '🏭', subcategories: ['Heavy Machinery', 'Tools', 'Warehouse', 'Office Equipment', 'Diğer'] },
  { id: CategoryType.AGRICULTURE, label: { en: 'Agriculture', tr: 'Tarım', fr: 'Agriculture' }, icon: '🚜', subcategories: ['Tractors', 'Greenhouse', 'Irrigation', 'Livestock Tools', 'Diğer'] },
  { id: CategoryType.YAPI_MARKET, label: { en: 'Hardware & DIY', tr: 'Yapı Market', fr: 'Bricolage' }, icon: '🛠️', subcategories: ['Power Tools', 'Building Materials', 'Electrical', 'Plumbing', 'Diğer'] },
  { id: CategoryType.DIRECT_24H, label: { en: 'Direct 24h Bid', tr: '24H Direkt Mezat', fr: 'Enchère Directe 24h' }, icon: '⚡', subcategories: ['Smartphones', 'Consoles', 'TVs', 'Watches', 'Diğer'] },
  { id: CategoryType.MOTHER_CHILD, label: { en: 'Mother & Child', tr: 'Anne & Çocuk', fr: 'Mère & Enfant' }, icon: '👶', subcategories: ['Baby Gear', 'Feeding', 'Toys', 'Kids Clothing', 'Diğer'] },
  { id: CategoryType.ACCESSORIES_BAGS, label: { en: 'Accessories & Bags', tr: 'Aksesuar & Çanta', fr: 'Accessoires & Sacs' }, icon: '👜', subcategories: ['Wallets', 'Belts', 'Backpacks', 'Handbags', 'Diğer'] },
  { id: CategoryType.COSMETICS, label: { en: 'Cosmetics', tr: 'Kozmetik', fr: 'Cosmétique' }, icon: '💄', subcategories: ['Skincare', 'Perfume', 'Makeup', 'Hair Care', 'Diğer'] },
  { id: CategoryType.FOOTWEAR, label: { en: 'Footwear', tr: 'Ayakkabı', fr: 'Chaussures' }, icon: '👟', subcategories: ['Sneakers', 'Boots', 'Heels', 'Sandals', 'Diğer'] },
  { id: CategoryType.CONSUMABLES, label: { en: 'Consumables', tr: 'Sarf Malzemeleri & Gıda', fr: 'Consommables' }, icon: '🛒', subcategories: ['Groceries', 'Beverages', 'Cleaning Supplies', 'Personal Care', 'Diğer'] },
  { id: CategoryType.PETS, label: { en: 'Pets', tr: 'Evcil Hayvan', fr: 'Animaux' }, icon: '🐾', subcategories: ['Food', 'Accessories', 'Toys', 'Health', 'Diğer'] },
  { id: CategoryType.OTHER, label: { en: 'Other', tr: 'Diğer', fr: 'Autre' }, icon: '📦', subcategories: ['Diğer'] },
];

export const getCategorySlotStartTime = (catId: CategoryType): string => {
    const idx = CATEGORIES.findIndex(c => c.id === catId);
    if (idx === -1) return "10:00";
    const totalMinutes = 10 * 60 + (idx * 30);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};
