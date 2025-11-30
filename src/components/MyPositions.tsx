import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { TokenData } from "@/lib/PriceService";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/lib/supabase";

// Interface matches your Supabase Table columns exactly
interface Bet {
    id: number;
    user_address: string;
    coin_symbol: string;
    entry_price: number;
    amount: number;
    bet_type: "long" | "short";
    created_at: string;
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

        // 1. Initial Load: Fetch existing bets from Database
        const fetchBets = async () => {
            const { data, error } = await supabase
                .from('bets')
                .select('*')
                .eq('user_address', publicKey.toString()) // Only show MY bets
                .order('created_at', { ascending: false });
            
            if (data) setBets(data);
            if (error) console.error("Error loading bets:", error);
        };

        fetchBets();

        // 2. Real-time Listener: Listen for NEW bets
        const channel = supabase
            .channel('realtime bets')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bets' }, (payload) => {
                // If the new bet belongs to the connected wallet, add it to the list
                if (payload.new.user_address === publicKey.toString()) {
                    setBets((prev) => [payload.new as Bet, ...prev]);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [publicKey]);

    if (!publicKey) return null;
    if (bets.length === 0) return null;

    return (
        <div className="w-full max-w-6xl mx-auto px-4 mt-8">
            <Card className="bg-[#1c1917] border-2 border-[#4A3F35] p-6 shadow-stone">
                <h3 className="font-display text-xl text-[#CCA46D] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Wallet className="w-6 h-6" /> My Active Wagers
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bets.map((bet) => {
                        // Logic to find live price of the coin in the bet
                        let currentPrice = 0;
                        // Check if the bet's coin is currently in the arena (Left or Right)
                        if (prices?.left.symbol === bet.coin_symbol) currentPrice = parseFloat(prices.left.price.replace('$',''));
                        else if (prices?.right.symbol === bet.coin_symbol) currentPrice = parseFloat(prices.right.price.replace('$',''));
                        
                        // Calculate Win/Loss Status
                        let isWinning = false;
                        if (currentPrice > 0) {
                            if (bet.bet_type === "long") isWinning = currentPrice > bet.entry_price;
                            else isWinning = currentPrice < bet.entry_price;
                        }

                        // If currentPrice is 0, the coin isn't in the active arena right now
                        const isLive = currentPrice > 0;

                        return (
                            <div key={bet.id} className="bg-[#292524] p-4 rounded border border-[#4A3F35] flex justify-between items-center relative overflow-hidden group hover:border-[#CCA46D] transition-colors">
                                {/* Color Strip on the left */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${!isLive ? 'bg-gray-500' : isWinning ? 'bg-green-500' : 'bg-red-500'}`} />
                                
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-[#E7E5E4] text-lg">{bet.coin_symbol}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${bet.bet_type === 'long' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'} uppercase font-bold border border-white/10`}>
                                            {bet.bet_type}
                                        </span>
                                    </div>
                                    <p className="text-stone-500 text-xs mt-1 font-mono">Entry: ${bet.entry_price.toFixed(6)}</p>
                                    <p className="text-stone-400 text-xs font-mono">Amt: {bet.amount} SOL</p>
                                </div>

                                <div className="text-right">
                                    <p className="text-xs text-stone-500 mb-1">Live Status</p>
                                    {isLive ? (
                                        <>
                                            <p className={`font-mono font-bold text-lg leading-none ${isWinning ? 'text-green-400' : 'text-red-400'}`}>
                                                {isWinning ? "UP" : "DOWN"}
                                            </p>
                                            <p className={`text-[10px] font-bold mt-1 flex items-center justify-end gap-1 ${isWinning ? 'text-green-500' : 'text-red-500'}`}>
                                                {isWinning ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}
                                                {isWinning ? "WINNING" : "LOSING"}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-stone-600 italic text-xs">Offline</p>
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