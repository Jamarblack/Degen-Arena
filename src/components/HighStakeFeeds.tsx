import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Flame, Crown } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface BigBet {
    id: number;
    user_address: string;
    coin_symbol: string;
    amount: number;
    bet_type: "long" | "short";
    created_at: string;
}

const HighStakesFeed = () => {
    const [bigBets, setBigBets] = useState<BigBet[]>([]);

    useEffect(() => {
        // Initial fetch: Get top 5 recent big bets (> 0.5 SOL)
        const fetchBigBets = async () => {
            const { data } = await supabase
                .from('bets')
                .select('*')
                .gt('amount', 0.5) 
                .order('created_at', { ascending: false })
                .limit(5);
            
            if (data) setBigBets(data);
        };

        fetchBigBets();

        // Realtime Listener
        const channel = supabase
            .channel('high_stakes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bets' }, (payload) => {
                const newBet = payload.new as BigBet;
                if (newBet.amount > 0.5) {
                    setBigBets((prev) => [newBet, ...prev].slice(0, 5));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="w-full h-full min-h-[400px]">
            <Card className="bg-[#1c1917] border-2 border-[#fbbf24] p-0 shadow-[0_0_15px_rgba(251,191,36,0.3)] texture-stone overflow-hidden flex flex-col h-screen">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-[#fbbf24]/20 to-transparent border-b border-[#fbbf24] p-4 flex items-center justify-center gap-2 sticky top-0 z-10">
                    <Crown className="w-6 h-6 text-[#fbbf24] animate-pulse" />
                    <h3 className="font-display text-lg text-[#fbbf24] uppercase tracking-widest drop-shadow-md">
                        High Stakes
                    </h3>
                    <Flame className="w-6 h-6 text-[#fbbf24] animate-pulse" />
                </div>

                {/* Feed Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#fbbf24] scrollbar-track-transparent">
                    {bigBets.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-[#fbbf24]/50 italic text-center p-4">
                            <p>No whales sighted yet...</p>
                            <p className="text-xs mt-2">Bet {">"} 0.5 SOL to appear here!</p>
                        </div>
                    ) : (
                        bigBets.map((bet) => (
                            <div key={bet.id} className="relative group">
                                {/* Glowing Background Effect */}
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                                
                                <div className="relative bg-[#292524] p-3 rounded-lg border border-[#fbbf24]/50 flex justify-between items-center">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-[#E7E5E4]">{bet.coin_symbol}</span>
                                            <span className={`text-[10px] px-1.5 rounded border ${bet.bet_type === 'long' ? 'border-green-500/50 text-green-400 bg-green-900/20' : 'border-red-500/50 text-red-400 bg-red-900/20'} uppercase font-bold`}>
                                                {bet.bet_type}
                                            </span>
                                        </div>
                                        <div className="text-[10px] font-mono text-[#fbbf24]/80 mt-1">
                                            {bet.user_address.slice(0, 4)}...{bet.user_address.slice(-4)}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-display font-black text-[#fbbf24] text-xl leading-none">
                                            {bet.amount}
                                        </p>
                                        <p className="text-[10px] text-stone-400 uppercase tracking-wider">SOL</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
};

export default HighStakesFeed;