import { useState, useEffect } from "react";
import FighterCard from "./FighterCard";
import BattleTimer from "./BattleTimer";
import BettingModal from "./BettingModal";
import HallOfFame from "./Transactions"; // Importing the Feed we built
import { Shield, RefreshCw } from "lucide-react";
import { fetchTokenPrices, TokenData } from '@/lib/priceService';

// Blockchain Imports
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

const BattleArena = () => {
  // State to store live data
  const [prices, setPrices] = useState<{ left: TokenData, right: TokenData } | null>(null);
  const [loading, setLoading] = useState(true);

  // Blockchain Hooks
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  // --- CONFIGURATION ---
  // REPLACE THIS with YOUR Wallet Address to receive the bets!
  const HOUSE_WALLET = new PublicKey("8RYRucwwCsrX7VaeXLTR8FoHUi9P26Ywu4j22G5zq1aR"); 
  // ---------------------

  // Function to fetch fresh fighters (Dynamic Pool)
  const refreshBattle = async () => {
    setLoading(true);
    const data = await fetchTokenPrices();
    if (data) {
        setPrices(data);
    }
    setLoading(false);
  };

  // Initial Load & Auto-Refresh Logic
  useEffect(() => {
    refreshBattle();
    
    // Auto-refresh battle every 5 minutes (300,000ms)
    // This makes the app feel dynamic, like rounds in a game.
    const interval = setInterval(() => {
        console.log("Round ended! Spawning new gladiators...");
        refreshBattle();
    }, 300000); 

    return () => clearInterval(interval);
  }, []);

  const [isBettingModalOpen, setIsBettingModalOpen] = useState(false);
  const [selectedBet, setSelectedBet] = useState<{ type: "long" | "short"; coin: string } | null>(null);

  const handleBet = (type: "long" | "short", coin: string) => {
    setSelectedBet({ type, coin });
    setIsBettingModalOpen(true);
  };

  // --- VIRAL LOOP: Twitter Share Helper ---
  const shareOnTwitter = (amount: string, coin: string, type: string) => {
    const text = `I just bet ${amount} SOL that ${coin} will go ${type.toUpperCase()}! ⚔️ \n\nWho dares to challenge me? @DegenColosseum #Solana`;
    const url = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text);
    window.open(url, '_blank');
  };

  // --- CORE LOGIC: Handle The Transaction ---
  const handlePlaceBet = async (amount: string) => {
    if (!publicKey) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      console.log(`Initiating bet: ${amount} SOL on ${selectedBet?.coin} (${selectedBet?.type})`);

      // 1. Create Transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: HOUSE_WALLET,
          lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
        })
      );

      // 2. Send & Confirm
      const signature = await sendTransaction(transaction, connection);
      console.log("Transaction sent:", signature);
      
      // 3. Success & Social Proof
      setIsBettingModalOpen(false);
      
      // Small delay to let the modal close smoothly
      setTimeout(() => {
          const confirmShare = confirm(`⚔️ Bet Placed Successfully!\n\nTx: ${signature.slice(0, 8)}...\n\nDo you want to share this victory on X (Twitter)?`);
          if (confirmShare) {
            shareOnTwitter(amount, selectedBet?.coin || "Crypto", selectedBet?.type || "up");
          }
      }, 500);

    } catch (error) {
      console.error("Bet failed:", error);
      alert("Transaction cancelled or failed. Check console.");
    }
  };

  // Helper to format percentage
  const formatChange = (val: number | undefined) => {
    if (val === undefined) return "...";
    return `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-6 md:space-y-8">
      
      {/* Battle Header */}
      <div className="text-center space-y-4 relative">
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-black uppercase tracking-widest text-primary drop-shadow-lg">
          Current Battle
        </h2>
        
        {/* Manual Refresh Button (Hidden feature for demoing) */}
        <button 
            onClick={refreshBattle}
            className="absolute right-0 top-2 text-[#4A3F35] hover:text-[#CCA46D] transition-colors"
            title="Summon new gladiators"
        >
            <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
        </button>

        <BattleTimer />
      </div>

      {/* Fighters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 relative">
        
        {/* Left Fighter */}
        <FighterCard
          title="The Challenger"
          coinName={loading ? "Loading..." : `$${prices?.left.symbol}`} 
          price={loading ? "..." : prices?.left.price}
          change={formatChange(prices?.left.priceChange)}
          isPositive={!loading && (prices?.left.priceChange || 0) > 0}
          onBet={() => handleBet("long", prices?.left.symbol || "Left")}
          buttonLabel="Long (Gladiator Wins)"
          buttonVariant="long"
        />

        {/* VS Badge (Desktop) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
          <div className="relative bg-card border-4 border-primary rounded-full p-6 shadow-bronze">
            <Shield className="h-20 w-20 text-primary" />
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-display font-black text-primary">
              VS
            </span>
          </div>
        </div>

        {/* VS Badge (Mobile) */}
        <div className="flex justify-center items-center md:hidden">
          <div className="relative bg-card border-4 border-primary rounded-full p-4 shadow-bronze">
            <Shield className="h-16 w-16 text-primary" />
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-display font-black text-primary">
              VS
            </span>
          </div>
        </div>

        {/* Right Fighter */}
        <FighterCard
          title="The Champion"
          coinName={loading ? "Loading..." : `$${prices?.right.symbol}`}
          price={loading ? "..." : prices?.right.price}
          change={formatChange(prices?.right.priceChange)}
          isPositive={!loading && (prices?.right.priceChange || 0) > 0}
          onBet={() => handleBet("short", prices?.right.symbol || "Right")}
          buttonLabel="Short (Gladiator Falls)"
          buttonVariant="short"
        />
      </div>

      {/* Betting Modal */}
      <BettingModal
        isOpen={isBettingModalOpen}
        onClose={() => setIsBettingModalOpen(false)}
        onPlaceBet={handlePlaceBet}
        betType={selectedBet?.type}
        coinName={selectedBet?.coin}
      />

      {/* LIVE FEED: Real Blockchain History */}
      <HallOfFame />

    </div>
  );
};

export default BattleArena;