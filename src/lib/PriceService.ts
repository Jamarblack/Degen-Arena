export interface TokenData {
    symbol: string;
    name: string;
    price: string;
    priceChange: number; // 24h change
    volume: number;
    icon: string;
    address: string;
}

// THE GLADIATOR POOL (Expanded Roster)
const GLADIATOR_POOL = [
    "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", // BONK
    "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", // WIF
    "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYkW2hr", // POPCAT
    "MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREabe85bCR", // MEW
    "ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82", // BOME
    "2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump", // PNUT
    "HeLp6NuQkmYB4p5Vo2RPtEWB6UB8xXPp30RzUHZpump", // GOAT
    "Az6oGenF48P6Y28w6dweY3x8g8F6Qc8hX5P5Q4w5pump", // ACT
    "9BB6NFEBSJbQdxqze4psJq7jyCFhtKbYEGqAmWi1pump", // FARTCOIN
    "ED5nyyWEzpPPiWimP8vYm7sD7TD3LAt3Q3gRTWHzPJBY", // MOODENG
    "HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4", // MYRO
    "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", // JUP
    "7BgBvyjr2HDURj8nddpGTLJ0pmzVf1f1k3tgEAg1pump", // SLERF
    "WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk", // WEN
    "25hAyBQfoDhfWx9ay6rarbgvWGwDdNqcHsXS3jQ3mUAj", // MANEKI
    "5mbK36SZ7J19An8jFco7R446d8Wq4t4q2vWqK16pump", // MICHI
    "3B5wuUrMEi5y1D8BAu2e71rUUGxxTmgk7c06VvRjJ7m7", // BILLY
    "3S8qX1MsMqRqeW4govDEWQKz4zwoTncWuQK60G37pump", // MOTHER
    "5z3EqYQo9HiCEs3R84RCDMy256X9lFcwZh279qksfthp", // PONKE
    "63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGq5tiJxcqj9"  // GIGACHAD
];

export const fetchTokenPrices = async (): Promise<{ left: TokenData, right: TokenData } | null> => {
    try {
        // 1. Fetch data for the ENTIRE pool at once
        const addresses = GLADIATOR_POOL.join(',');
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${addresses}`);
        const data = await response.json();

        if (!data.pairs || data.pairs.length === 0) return null;

        // 2. Process and Clean the Data
        const validFighters: TokenData[] = [];
        const seenSymbols = new Set(); 

        data.pairs.forEach((pair: any) => {
            // Filter: Must be paired with SOL and have decent liquidity
            if (pair.quoteToken.symbol === 'SOL' && pair.liquidity?.usd > 10000) {
                if (!seenSymbols.has(pair.baseToken.symbol)) {
                    validFighters.push({
                        symbol: pair.baseToken.symbol,
                        name: pair.baseToken.name,
                        price: pair.priceUsd,
                        priceChange: pair.priceChange.h24,
                        volume: pair.volume.h24,
                        icon: pair.info?.imageUrl || "https://placehold.co/100x100/333/gold?text=?", 
                        address: pair.baseToken.address
                    });
                    seenSymbols.add(pair.baseToken.symbol);
                }
            }
        });

        // 3. Random Selection
        const shuffled = validFighters.sort(() => 0.5 - Math.random());

        if (shuffled.length < 2) return null;

        return {
            left: shuffled[0],
            right: shuffled[1]
        };

    } catch (error) {
        console.error("Failed to fetch prices:", error);
        return null;
    }
};