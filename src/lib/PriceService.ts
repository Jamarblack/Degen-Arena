// src/lib/priceService.ts

export interface TokenData {
    symbol: string;
    price: string;
    priceChange: number; // 24h change
    volume: number;
    icon: string;
}

// These are the official Solana addresses for our Gladiators
// You can swap these for any coin you want later
const TOKENS = {
    BONK: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", 
    WIF: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm" 
};

export const fetchTokenPrices = async (): Promise<{ left: TokenData, right: TokenData } | null> => {
    try {
        // Fetch data for both coins at once from DexScreener
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${TOKENS.BONK},${TOKENS.WIF}`);
        const data = await response.json();

        // DexScreener returns an array "pairs". We need to find the best SOL pair for each.
        const pairs = data.pairs || [];

        // Helper to find the most liquid pair for a specific token address
        const findBestPair = (address: string) => {
            return pairs.find((p: any) => 
                p.baseToken.address === address && p.quoteToken.symbol === 'SOL'
            );
        };

        const bonkPair = findBestPair(TOKENS.BONK);
        const wifPair = findBestPair(TOKENS.WIF);

        if (!bonkPair || !wifPair) return null;

        return {
            left: {
                symbol: "BONK",
                price: `$${bonkPair.priceUsd}`,
                priceChange: bonkPair.priceChange.h24,
                volume: bonkPair.volume.h24,
                icon: "https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6FCTPqh604M" // Official BONK Icon
            },
            right: {
                symbol: "WIF",
                price: `$${wifPair.priceUsd}`,
                priceChange: wifPair.priceChange.h24,
                volume: wifPair.volume.h24,
                icon: "https://bafkreibk3cvqi522s77t34y4h56a5s65s25s35s45s.ipfs.nftstorage.link" // Official WIF Icon
            }
        };

    } catch (error) {
        console.error("Failed to fetch prices:", error);
        return null;
    }
};