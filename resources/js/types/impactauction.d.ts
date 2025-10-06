export interface AuctionItem {
    id: number;
    name: string;
    description: string;
    category: 'renewable-energy' | 'social-media' | 'healthcare' | 'space-travel' | 'education' | 'transportation' | 'agriculture' | 'communication';
    image?: string;
    positive_impact: number;
    negative_impact: number;
    net_impact: number;
    impact_description: string;
    impact_details?: {
        environmental?: number;
        social?: number;
        economic?: number;
        technological?: number;
    };
}

export interface PlayerBid {
    userId: number;
    userName: string;
    bidAmount: number;
    timestamp: number;
}

export interface ItemWinner {
    itemId: number;
    winnerId: number;
    winnerName: string;
    winningBid: number;
    allBids: PlayerBid[];
}

export interface PlayerAuctionState {
    userId: number;
    budget: number;
    itemsWon: ItemWinner[];
    totalImpact: number;
    isReady: boolean;
    hasPlacedBid: boolean;
    currentBid: number | null;
}

export interface AuctionGameState {
    currentItemIndex: number;
    timeLeft: number;
    phase: 'waiting' | 'bidding' | 'reveal' | 'results' | 'finished';
    playerStates: { [userId: number]: PlayerAuctionState };
    items: AuctionItem[];
    currentItem: AuctionItem | null;
    itemWinners: ItemWinner[];
    currentBids: PlayerBid[];
    isGameOwner: boolean;
    biddingStartTime: number;
}

export interface ImpactReveal {
    item: AuctionItem;
    winner: {
        userId: number;
        userName: string;
        bidAmount: number;
    };
    impact: {
        positive: number;
        negative: number;
        net: number;
        description: string;
    };
}
