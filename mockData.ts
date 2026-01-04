
import { AuctionItem, AuctionStatus, CategoryType, User, InventoryItem, ProductCondition, CATEGORIES, UserFeedback, GiftCodeClaim, SupportTicket, Dispute, BuyerRequest } from './types';

const getProgrammedEndTime = (index: number) => {
    const now = new Date();
    const endsAt = new Date();
    const startMinutes = 10 * 60; 
    const offsetMinutes = index * 20; 
    const totalMinutes = startMinutes + offsetMinutes;
    const targetHour = Math.floor(totalMinutes / 60);
    const targetMin = totalMinutes % 60;
    endsAt.setHours(targetHour, targetMin, 0, 0);
    if (endsAt <= now) endsAt.setDate(now.getDate() + 1);
    return endsAt;
};

const opt = (url: string, width: number = 800) => {
    if (url.includes('unsplash.com')) {
        return `${url.split('?')[0]}?auto=format,compress&fit=crop&q=60&w=${width}`;
    }
    return url;
};

const SAMPLE_VIDEO = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4";

const generateBotAuctions = (): AuctionItem[] => {
    const auctions: AuctionItem[] = [
      {
        id: 'loss-leader-1',
        title: 'Apple iPhone 17 Pro Max',
        description: 'Mazora Platform Exclusive. Power Hour Event. 256GB Titanium Gray. Includes original packaging and warranty.',
        category: CategoryType.ELECTRONICS,
        condition: ProductCondition.NEW,
        imageUrl: opt("https://images.unsplash.com/photo-1696446701796-da61225697cc"),
        images: [
            opt("https://images.unsplash.com/photo-1696446701796-da61225697cc"),
            opt("https://images.unsplash.com/photo-1678911820864-e2c567c655d7"),
            opt("https://images.unsplash.com/photo-1695048133142-1a20484d2569")
        ],
        videoUrl: SAMPLE_VIDEO,
        currentBid: 78000, 
        reservePrice: 0, 
        currency: 'TRY',
        startsAt: new Date('2026-01-20T10:00:00'),
        endsAt: new Date('2026-01-27T22:00:00'), // Power Hour ends on 27.01.2026
        status: AuctionStatus.ACTIVE, 
        bids: [],
        sellerId: 'pro-seller-demo', 
        verifiedListing: true,
        viewCount: 2540, 
        location: 'İstanbul, Maslak',
        isLossLeader: true,
        marketValue: { min: 95000, max: 105000, currency: 'TRY' }
      },
      {
        id: 'omega-deville-prestige-1681050',
        title: 'Omega De Ville Prestige COSC 168.1050',
        description: 'Premium Swiss luxury watch. COSC certified chronometer. 18k Gold/Steel. Excellent condition from Chrono24 curated selection.',
        category: CategoryType.LUXURY,
        condition: ProductCondition.USED,
        imageUrl: opt("https://images.unsplash.com/photo-1547996160-81dfa63595aa"),
        images: [
            opt("https://images.unsplash.com/photo-1547996160-81dfa63595aa"),
            opt("https://images.unsplash.com/photo-1614164185128-e4ec99c436d7"),
            opt("https://images.unsplash.com/photo-1523170335258-f5ed11844a49")
        ],
        currentBid: 62000,
        reservePrice: 85000,
        buyNowPrice: 97500,
        currency: 'TRY',
        startsAt: new Date(),
        endsAt: getProgrammedEndTime(2),
        status: AuctionStatus.ACTIVE,
        bids: [],
        sellerId: 'pro-seller-demo',
        verifiedListing: true,
        viewCount: 1420,
        location: 'İstanbul, Nişantaşı',
        marketValue: { min: 90000, max: 110000, currency: 'TRY' }
      },
      {
        id: 'quick-sell-video-demo',
        title: 'DJI Mavic 3 Pro (Quick Sale)',
        description: 'Hızlı Satış: 24 saat içinde en yüksek teklife satılacaktır. Kusursuz kondisyon, yedek bataryalar dahil.',
        category: CategoryType.DIRECT_24H,
        condition: ProductCondition.USED,
        imageUrl: opt("https://images.unsplash.com/photo-1508614589041-895b88991e3e"),
        images: [opt("https://images.unsplash.com/photo-1508614589041-895b88991e3e")],
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        currentBid: 45000,
        reservePrice: 0,
        currency: 'TRY',
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 24 * 3600000),
        status: AuctionStatus.ACTIVE,
        bids: [],
        sellerId: 'pro-seller-demo',
        verifiedListing: true,
        viewCount: 890,
        location: 'İzmir',
        isBoosted: true
      }
    ];
    return auctions;
};

const BOT_AUCTIONS = generateBotAuctions();

const mapAuctionsToInventory = (sellerId: string, allAuctions: AuctionItem[]): InventoryItem[] => {
    return allAuctions.filter(a => a.sellerId === sellerId).map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        category: a.category,
        condition: a.condition,
        imageUrl: a.imageUrl,
        images: a.images,
        videoUrl: a.videoUrl,
        startPrice: a.currentBid,
        reservePrice: a.reservePrice,
        buyNowPrice: a.buyNowPrice,
        status: 'active',
        createdAt: new Date(),
        location: a.location
    }));
};

export const MOCK_USERS: User[] = [
    { id: 'admin-id', name: 'System Admin', role: 'admin', email: 'admin@mazora.com', password: '123', walletBalance: 0, frozenBalance: 0, joinedDate: new Date(), notifications: [], participationCount: 0, reputationScore: 100, participatedAuctionIds: [], timeSpentSeconds: 0, referralCode: 'ADMIN', freeQuotesRemaining: 999, avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=000&color=fff', inventory: [] },
    { id: 'buyer-demo', name: 'Canberk Alıcı', role: 'buyer', email: 'buyer@mazora.com', password: '123', walletBalance: 1250, frozenBalance: 0, joinedDate: new Date(), notifications: [], participationCount: 4, reputationScore: 98, participatedAuctionIds: [], timeSpentSeconds: 0, referralCode: 'CANB-BUY', freeQuotesRemaining: 5, avatarUrl: 'https://ui-avatars.com/api/?name=Canberk+Alici&background=3b82f6&color=fff', inventory: [] },
    { id: 'pro-seller-demo', name: 'Mazora Pro Store', role: 'seller', email: 'seller@mazora.com', password: '123', walletBalance: 8500, frozenBalance: 0, joinedDate: new Date(), notifications: [], participationCount: 45, reputationScore: 100, participatedAuctionIds: [], timeSpentSeconds: 0, referralCode: 'PRO-STORE', freeQuotesRemaining: 99, avatarUrl: 'https://ui-avatars.com/api/?name=Pro+Store&background=1e3a8a&color=fff', isVerified: true, sellerTier: 'onayli', isRentPaid: true, inventory: [
        ...mapAuctionsToInventory('pro-seller-demo', BOT_AUCTIONS),
        {
            id: 'sold-item-1',
            title: 'Samsung Galaxy S24 Ultra (SATILDI)',
            category: CategoryType.ELECTRONICS,
            condition: ProductCondition.USED,
            imageUrl: opt("https://images.unsplash.com/photo-1610945265064-0e34e5519bbf"),
            startPrice: 42000,
            reservePrice: 0,
            status: 'sold',
            createdAt: new Date(Date.now() - 7 * 24 * 3600000),
            location: 'Ankara',
            isBoosted: true
        }
    ] },
    { id: 'senegal-demo', name: 'Moussa Diop', role: 'buyer', email: 'senegal@mazora.com', password: '123', walletBalance: 500, frozenBalance: 0, joinedDate: new Date(), notifications: [], participationCount: 1, reputationScore: 100, participatedAuctionIds: [], timeSpentSeconds: 0, referralCode: 'SN-001', freeQuotesRemaining: 5, avatarUrl: 'https://ui-avatars.com/api/?name=Moussa+Diop&background=00853f&color=fff', inventory: [] },
    { id: 'germany-demo', name: 'Hans Schmidt', role: 'buyer', email: 'germany@mazora.com', password: '123', walletBalance: 1200, frozenBalance: 0, joinedDate: new Date(), notifications: [], participationCount: 2, reputationScore: 95, participatedAuctionIds: [], timeSpentSeconds: 0, referralCode: 'DE-001', freeQuotesRemaining: 5, avatarUrl: 'https://ui-avatars.com/api/?name=Hans+Schmidt&background=ffcc00&color=000', inventory: [] }
];

export const MOCK_AUCTIONS: AuctionItem[] = BOT_AUCTIONS;
export const MOCK_REQUESTS: BuyerRequest[] = [];
export const MOCK_TICKETS: SupportTicket[] = [];
export const MOCK_DISPUTES: Dispute[] = [];
export const MOCK_GIFT_CODES: GiftCodeClaim[] = [];
export const MOCK_FEEDBACKS: UserFeedback[] = [
  { id: 'fb-1', userName: 'Ahmet K.', rating: 5, comment: 'Pampers siparişim 1 saat içinde randevusu ayarlandı, teslimatta ödeme yaptım. Çok pratik!', date: new Date(Date.now() - 86400000), isVerified: true },
  { id: 'fb-2', userName: 'Elif S.', rating: 5, comment: 'Deterjan fiyatları marketten daha uygun, Mazora güvencesi harika.', date: new Date(Date.now() - 172800000), isVerified: true }
];
