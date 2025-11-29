import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Card } from "@/components/ui/card";
import { Trophy, TrendingUp, ExternalLink, Activity } from "lucide-react";

// --- CONFIGURATION ---
const HOUSE_WALLET_ADDRESS = "8RYRucwwCsrX7VaeXLTR8FoHUi9P26Ywu4j22G5zq1aR"; 
// ---------------------

interface BattleLog {
    signature: string;
    status: "success" | "fail";
    timestamp: string; // Now this will be dynamic
}

const LiveFeed = () => {
    const { connection } = useConnection();
    const [logs, setLogs] = useState<BattleLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Helper: Convert Unix Timestamp to "X mins ago"
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
                // sig.blockTime is the Unix timestamp from the blockchain
                timestamp: timeAgo(sig.blockTime) 
            }));

            setLogs(formattedLogs);
            setIsLoading(false);
        } catch (err) {
            console.error("Error fetching feed:", err);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
        // Poll for new bets every 30 seconds (don't need to spam it)
        const interval = setInterval(fetchHistory, 30000);
        return () => clearInterval(interval);
    }, [connection]);

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-12">
            <Card className="bg-card border-4 border-primary/40 overflow-hidden shadow-stone texture-stone">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-primary/30 to-transparent border-b-2 border-primary/40 p-6">
                    <div className="flex items-center justify-center gap-3">
                        <Trophy className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                        <h2 className="text-2xl md:text-3xl font-display font-black uppercase tracking-widest text-primary drop-shadow-lg">
                            Arena Activity
                        </h2>
                        <Trophy className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                    </div>
                </div>

                {/* The List */}
                <div className="divide-y divide-border min-h-[150px]">
                    {isLoading ? (
                        <div className="p-8 text-center text-muted-foreground animate-pulse font-mono">
                            Consulting the Oracle...
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground italic font-mono">
                            The Arena is silent. Be the first to strike!
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div
                                key={log.signature}
                                className="p-4 md:p-6 flex items-center justify-between hover:bg-secondary/30 transition-colors"
                            >
                                {/* Left Side: Icon + Gladiator Name */}
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className={`h-10 w-10 md:h-12 md:w-12 rounded-full border-2 flex items-center justify-center shadow-bronze ${
                                        log.status === 'success' 
                                            ? 'bg-primary/30 border-primary/60 text-primary' 
                                            : 'bg-red-500/20 border-red-500/60 text-red-500'
                                    }`}>
                                        {log.status === 'success' ? (
                                            <TrendingUp className="h-5 w-5 md:h-6 md:w-6" />
                                        ) : (
                                            <Activity className="h-5 w-5 md:h-6 md:w-6" />
                                        )}
                                    </div>

                                    <div>
                                        <p className="font-header font-bold text-foreground text-sm md:text-base">
                                            Gladiator <span className="text-primary font-mono">
                                                {log.signature.slice(0, 4)}...{log.signature.slice(-4)}
                                            </span>
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-block w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                            <p className="text-xs md:text-sm text-muted-foreground">
                                                {log.timestamp}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Verify Link */}
                                <div className="text-right">
                                    <a 
                                        href={`https://solscan.io/tx/${log.signature}?cluster=devnet`} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="group flex items-center gap-1 font-header font-bold text-primary hover:text-white transition-colors text-sm md:text-base"
                                    >
                                        VERIFY <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </a>
                                    <p className="text-xs md:text-sm text-muted-foreground">
                                        View on Solana
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
};

export default LiveFeed;