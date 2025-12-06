import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react"; // Use the shared hook
import { PublicKey } from "@solana/web3.js";
import { Card } from "@/components/ui/card";
import { Trophy, TrendingUp, ExternalLink, Activity } from "lucide-react";

// YOUR WALLET ADDRESS (Same as BattleArena)
const HOUSE_WALLET_ADDRESS = "8RYRucwwCsrX7VaeXLTR8FoHUi9P26Ywu4j22G5zq1aR"; 

interface BattleLog {
    signature: string;
    status: "success" | "fail";
    timestamp: string;
}

const HallOfFame = () => {
    
    const { connection } = useConnection(); 
    
    const [logs, setLogs] = useState<BattleLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const timeAgo = (unixTimestamp: number | null | undefined) => {
        if (!unixTimestamp) return "Just now";
        const now = Math.floor(Date.now() / 1000);
        const diff = now - unixTimestamp;
        if (diff < 60) return "Just now";
        if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        return `${Math.floor(diff / 86400)} days ago`;
    };

    const fetchHistory = async () => {
        try {
            const pubKey = new PublicKey(HOUSE_WALLET_ADDRESS);
            // Fetch last 5 transactions
            const signatures = await connection.getSignaturesForAddress(pubKey, { limit: 5 });

            const formattedLogs: BattleLog[] = signatures.map(sig => ({
                signature: sig.signature,
                status: sig.err ? "fail" : "success",
                timestamp: timeAgo(sig.blockTime) 
            }));

            setLogs(formattedLogs);
            setIsLoading(false);
        } catch (err) {
            console.error("Error fetching history:", err);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
        const interval = setInterval(fetchHistory, 30000);
        return () => clearInterval(interval);
    }, [connection]); // Depend on connection

    return (
        <div className="w-full mt-8">
            <Card className="bg-[#1c1917] border-2 border-[#4A3F35] p-6 shadow-stone texture-stone">
                <div className="bg-gradient-to-r from-[#4A3F35]/30 to-transparent border-b-2 border-[#4A3F35] p-6 mb-4">
                    <div className="flex items-center justify-center gap-3">
                        <Trophy className="h-6 w-6 md:h-8 md:w-8 text-[#CCA46D]" />
                        <h2 className="text-2xl md:text-3xl font-display font-black uppercase tracking-widest text-[#CCA46D] drop-shadow-lg">
                            Arena Activity
                        </h2>
                        <Trophy className="h-6 w-6 md:h-8 md:w-8 text-[#CCA46D]" />
                    </div>
                </div>

                <div className="divide-y divide-[#4A3F35]/50 min-h-[150px]">
                    {isLoading ? (
                        <div className="p-8 text-center text-stone-500 animate-pulse font-mono">
                            Consulting the Oracle...
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="p-8 text-center text-stone-500 italic font-mono">
                            The Arena is silent. Be the first to strike!
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div key={log.signature} className="p-4 flex items-center justify-between hover:bg-[#292524] transition-colors rounded-lg">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center shadow-bronze ${
                                        log.status === 'success' ? 'bg-[#CCA46D]/20 border-[#CCA46D] text-[#CCA46D]' : 'bg-red-900/20 border-red-500 text-red-500'
                                    }`}>
                                        {log.status === 'success' ? <TrendingUp className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="font-header font-bold text-[#E7E5E4] text-sm md:text-base">
                                            Gladiator <span className="text-[#CCA46D] font-mono">{log.signature.slice(0, 4)}...{log.signature.slice(-4)}</span>
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-block w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                            <p className="text-xs text-stone-500">{log.timestamp}</p>
                                        </div>
                                    </div>
                                </div>
                                <a href={`https://solscan.io/tx/${log.signature}?cluster=mainnet-beta`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#CCA46D] hover:text-white text-xs md:text-sm font-bold transition-colors">
                                    VERIFY <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
};

export default HallOfFame;