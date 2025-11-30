import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { TokenData } from "@/lib/priceService";
import { TrendingUp, TrendingDown, Wallet, Clock } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/lib/supabase";

interface Bet {
    id: number;
    user_address: string;
    coin_symbol: string;
    entry_price: number;
    amount: number;
    bet_type: "long" | "short";
    created_at: string;
    status: string; // 'open', 'won', 'lost'
}

interface MyPositionsProps {
    prices: { left: TokenData, right: TokenData } | null;
}

const MyPositions = ({ prices }: MyPositionsProps) => {
    const { publicKey } = useWallet(); 
    const [bets, setBets] = useState<Bet[]>([]);

    useEffect(() => {
        if (!publicKey) {
            setBets([]);
            return;
        }

        const fetchBets = async () => {
            const { data, error } = await supabase
                .from('bets')
                .select('*')
                .eq('user_address', publicKey.toString())
                .order('created_at', { ascending: false });
            
            if (data) setBets(data);
            if (error) console.error("Error loading bets:", error);
        };

        fetchBets();

        const channel = supabase
            .channel('realtime bets')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bets' }, (payload) => {
                if (payload.new && (payload.new as any).user_address === publicKey.toString()) {
                    fetchBets(); 
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [publicKey]);

    if (!publicKey) return null;
    
    // REMOVED "return null" so you can see the empty state!
    if (bets.length === 0) {
        return (
            <div className="w-full max-w-6xl mx-auto px-4 mt-8">
                <Card className="bg-[#1c1917] border-2 border-[#4A3F35] p-6 shadow-stone texture-stone opacity-70">
                    <h3 className="font-display text-xl text-[#CCA46D] uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Wallet className="w-6 h-6" /> My Active Wagers
                    </h3>
                    <div className="text-stone-500 text-center italic py-4">
                        You have no active wagers in the arena. Place a bet to begin.
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-4 mt-8">
            <Card className="bg-[#1c1917] border-2 border-[#4A3F35] p-6 shadow-stone texture-stone">
                <h3 className="font-display text-xl text-[#CCA46D] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Wallet className="w-6 h-6" /> My Active Wagers
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bets.map((bet) => {
                        // Logic to find live price of the coin in the bet
                        let currentPrice = 0;
                        let isLive = false;

                        // FIX: Use snake_case names (bet.coin_symbol)
                        if (prices?.left.symbol === bet.coin_symbol) {
                            currentPrice = parseFloat(prices.left.price.replace('$',''));
                            isLive = true;
                        } else if (prices?.right.symbol === bet.coin_symbol) {
                            currentPrice = parseFloat(prices.right.price.replace('$',''));
                            isLive = true;
                        }
                        
                        let statusColor = 'text-stone-400';
                        let statusText = bet.status.toUpperCase();
                        
                        if (bet.status === 'open' && isLive) {
                            let isWinning = false;
                            // FIX: Use snake_case names (bet.bet_type, bet.entry_price)
                            if (bet.bet_type === "long") isWinning = currentPrice > bet.entry_price;
                            else isWinning = currentPrice < bet.entry_price;

                            statusText = isWinning ? "WINNING" : "LOSING";
                            statusColor = isWinning ? 'text-green-500' : 'text-red-500';
                        } else if (bet.status === 'won') {
                            statusColor = 'text-green-500';
                        } else if (bet.status === 'lost') {
                            statusColor = 'text-red-500';
                        }

                        let stripColor = 'bg-gray-500';
                        if (bet.status === 'won') stripColor = 'bg-green-500';
                        else if (bet.status === 'lost') stripColor = 'bg-red-500';
                        else if (statusText === 'WINNING') stripColor = 'bg-green-500 animate-pulse';
                        else if (statusText === 'LOSING') stripColor = 'bg-red-500 animate-pulse';

                        return (
                            <div key={bet.id} className="bg-[#292524] p-4 rounded border border-[#4A3F35] flex justify-between items-center relative overflow-hidden group hover:border-[#CCA46D] transition-colors">
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${stripColor}`} />
                                
                                <div>
                                    <div className="flex items-center gap-2">
                                        {/* FIX: Use bet.coin_symbol */}
                                        <span className="font-black text-[#E7E5E4] text-lg">{bet.coin_symbol}</span>
                                        {/* FIX: Use bet.bet_type */}
                                        <span className={`text-xs px-2 py-0.5 rounded ${bet.bet_type === 'long' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'} uppercase font-bold border border-white/10`}>
                                            {bet.bet_type}
                                        </span>
                                    </div>
                                    {/* FIX: Use bet.entry_price */}
                                    <p className="text-stone-500 text-xs mt-1 font-mono">Entry: ${bet.entry_price.toFixed(6)}</p>
                                    <p className="text-stone-400 text-xs font-mono">Amt: {bet.amount} SOL</p>
                                </div>

                                <div className="text-right">
                                    <p className="text-xs text-stone-500 mb-1">Status</p>
                                    <p className={`font-mono font-bold text-lg leading-none ${statusColor}`}>
                                        {statusText}
                                    </p>
                                    {isLive && bet.status === 'open' && (
                                        <p className="text-[10px] text-stone-500 mt-1 font-mono">
                                            Live: ${currentPrice}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
};

export default MyPositions;