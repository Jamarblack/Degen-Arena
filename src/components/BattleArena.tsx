import { useState, useEffect } from "react";
import FighterCard from "./FighterCard";
import BattleTimer from "./BattleTimer";
import BettingModal from "./BettingModal";
import { Shield } from "lucide-react";
import { fetchTokenPrices, TokenData } from '@/lib/priceService';

// 1. NEW IMPORTS for Blockchain Interactions
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

const BattleArena = () => {
  // State to store live data
  const [prices, setPrices] = useState<{ left: TokenData, right: TokenData } | null>(null);
  const [loading, setLoading] = useState(true);

  // 2. NEW HOOKS to talk to the wallet
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  // Define the House Wallet (Escrow)
  // For the hackathon, this can be YOUR wallet address so you receive the bets.
  // Currently set to a random Devnet address.
  const HOUSE_WALLET = new PublicKey("G473EkeR5gowVn8CRwTSDop3zPwaNmpNktrrTgzDc3qB"); 

  // Fetch prices on load
  useEffect(() => {
    const loadData = async () => {
        const data = await fetchTokenPrices();
        if (data) setPrices(data);
        setLoading(false);
    };
    
    loadData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const [isBettingModalOpen, setIsBettingModalOpen] = useState(false);
  const [selectedBet, setSelectedBet] = useState<{ type: "long" | "short"; coin: string } | null>(null);

  const handleBet = (type: "long" | "short", coin: string) => {
    setSelectedBet({ type, coin });
    setIsBettingModalOpen(true);
  };

  // 3. UPDATED FUNCTION: Real Transaction Logic
  const handlePlaceBet = async (amount: string) => {
    if (!publicKey) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      console.log(`Initiating bet: ${amount} SOL on ${selectedBet?.coin} (${selectedBet?.type})`);

      // Create the transaction to send money to the House
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: HOUSE_WALLET,
          lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
        })
      );

      // Request signature from Phantom
      const signature = await sendTransaction(transaction, connection);

      // Notify success
      console.log("Transaction sent:", signature);
      alert(`⚔️ Bet Placed! Transaction Hash: ${signature.slice(0, 8)}...`);
      
      setIsBettingModalOpen(false);

    } catch (error) {
      console.error("Bet failed:", error);
      alert("Transaction cancelled or failed. Check console.");
    }
  };

  // Helper to format percentage (adds + sign if positive)
  const formatChange = (val: number | undefined) => {
    if (val === undefined) return "...";
    return `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-6 md:space-y-8">
      {/* Battle Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-black uppercase tracking-widest text-primary drop-shadow-lg">
          Current Battle
        </h2>
        <BattleTimer />
      </div>

      {/* Fighters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 relative">
        
        {/* Left Fighter (BONK) */}
        <FighterCard
          title="The Challenger"
          coinName={loading ? "Loading..." : `$${prices?.left.symbol}`} 
          price={loading ? "..." : prices?.left.price}
          change={formatChange(prices?.left.priceChange)}
          isPositive={!loading && (prices?.left.priceChange || 0) > 0}
          onBet={() => handleBet("long", prices?.left.symbol || "BONK")}
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

        {/* Right Fighter (WIF) */}
        <FighterCard
          title="The Champion"
          coinName={loading ? "Loading..." : `$${prices?.right.symbol}`}
          price={loading ? "..." : prices?.right.price}
          change={formatChange(prices?.right.priceChange)}
          isPositive={!loading && (prices?.right.priceChange || 0) > 0}
          onBet={() => handleBet("short", prices?.right.symbol || "WIF")}
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
    </div>
  );
};

export default BattleArena;