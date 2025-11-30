import { useState, useEffect } from "react";
import FighterCard from "./FighterCard";
import BattleTimer from "./BattleTimer";
import BettingModal from "./BettingModal";
import HallOfFame from "./Transactions"; 
import MyPositions from "./MyPositions"; 
import ChartModal from "./ChartModal";   
import MessageModal from "./MessageModal"; // NEW IMPORT
import { Shield, RefreshCw } from "lucide-react";
import { fetchTokenPrices, TokenData } from '@/lib/PriceService';

// Supabase Import
import { supabase } from "@/lib/supabase";

// Blockchain Imports
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

const BattleArena = () => {
  const [prices, setPrices] = useState<{ left: TokenData, right: TokenData } | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isBettingModalOpen, setIsBettingModalOpen] = useState(false);
  const [isChartOpen, setIsChartOpen] = useState(false);
  const [selectedChartCoin, setSelectedChartCoin] = useState<{name: string, address: string} | null>(null);
  
  // NEW: Message Modal State
  const [messageConfig, setMessageConfig] = useState<{
      isOpen: boolean;
      title: string;
      message: string;
      type: "success" | "error" | "info";
      onConfirm?: () => void;
      confirmText?: string;
  }>({ isOpen: false, title: "", message: "", type: "info" });

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const HOUSE_WALLET = new PublicKey("8RYRucwwCsrX7VaeXLTR8FoHUi9P26Ywu4j22G5zq1aR"); 

  const refreshBattle = async () => {
    setLoading(true);
    const data = await fetchTokenPrices();
    if (data) setPrices(data);
    setLoading(false);
  };

  useEffect(() => {
    refreshBattle();
    const interval = setInterval(() => { refreshBattle(); }, 300000); 
    return () => clearInterval(interval);
  }, []);

  const [selectedBet, setSelectedBet] = useState<{ type: "long" | "short"; coin: string } | null>(null);

  const handleBet = (type: "long" | "short", coin: string) => {
    setSelectedBet({ type, coin });
    setIsBettingModalOpen(true);
  };

  const openChart = (coin: TokenData) => {
      setSelectedChartCoin({ name: coin.symbol, address: coin.address });
      setIsChartOpen(true);
  };

  // Helper to show custom modal
  const showMessage = (title: string, message: string, type: "success" | "error" | "info", onConfirm?: () => void, confirmText?: string) => {
      setMessageConfig({ isOpen: true, title, message, type, onConfirm, confirmText });
  };

  const shareOnTwitter = (amount: string, coin: string, type: string) => {
    const text = `I just bet ${amount} SOL that ${coin} will go ${type.toUpperCase()}! ⚔️ \n\nWho dares to challenge me? @DegenColosseum #Solana`;
    const url = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text);
    window.open(url, '_blank');
  };

  const handlePlaceBet = async (amount: string) => {
    if (!publicKey) {
      showMessage("Wallet Required", "Please connect your Solana wallet to enter the arena.", "error");
      return;
    }

    try {
      console.log(`Initiating bet: ${amount} SOL`);

      // 1. Blockchain Transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: HOUSE_WALLET,
          lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      console.log("Transaction sent:", signature);
      
      // 2. Save to Supabase
      const currentPrice = selectedBet?.coin === prices?.left.symbol ? prices?.left.price : prices?.right.price;
      const entryPrice = parseFloat((currentPrice || "0").replace('$', ''));

      const { error: dbError } = await supabase.from('bets').insert([{
            user_address: publicKey.toString(),
            coin_symbol: selectedBet?.coin || "UNK",
            entry_price: entryPrice,
            amount: parseFloat(amount),
            bet_type: selectedBet?.type || "long",
            signature: signature,
            status: 'open'
      }]);

      if (dbError) console.error("Supabase Error:", dbError);

      setIsBettingModalOpen(false);
      
      // 3. SHOW SUCCESS MODAL (Replaces confirm())
      setTimeout(() => {
          showMessage(
              "Victory Awaits!", 
              `Your wager has been placed successfully.\n\nTransaction: ${signature.slice(0, 6)}...`, 
              "success",
              () => {
                  // This runs if they click "Share Victory"
                  shareOnTwitter(amount, selectedBet?.coin || "Crypto", selectedBet?.type || "up");
                  setMessageConfig(prev => ({ ...prev, isOpen: false }));
              },
              "Share Victory on X"
          );
      }, 500);

    } catch (error) {
      console.error("Bet failed:", error);
      // Show Error Modal
      showMessage("Transaction Failed", "The blockchain rejected your offering. Please try again.", "error");
    }
  };

  const formatChange = (val: number | undefined) => {
    if (val === undefined) return "...";
    return `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-6 md:space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-4 relative">
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-black uppercase tracking-widest text-primary drop-shadow-lg">
          Current Battle
        </h2>
        <button onClick={refreshBattle} className="absolute right-0 top-2 text-[#110e0c] hover:text-[#CCA46D] transition-colors justify-between">
            <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} /> <span className="">Refresh Prices</span>
        </button>
        <BattleTimer />
      </div>

      {/* Fighters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 relative">
        <FighterCard
          title="The Challenger"
          coinName={loading ? "Loading..." : `$${prices?.left.symbol}`} 
          price={loading ? "..." : prices?.left.price}
          change={formatChange(prices?.left.priceChange)}
          isPositive={!loading && (prices?.left.priceChange || 0) > 0}
          onBet={() => handleBet("long", prices?.left.symbol || "Left")}
          onViewChart={() => prices?.left && openChart(prices.left)} 
          buttonLabel="Bet"
          buttonVariant="long"
        />

        {/* VS Badge */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
          <div className="relative bg-card border-4 border-primary rounded-full p-6 shadow-bronze">
            <Shield className="h-20 w-20 text-primary" />
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-display font-black text-primary">VS</span>
          </div>
        </div>
        
        {/* Mobile VS Badge */}
        <div className="flex justify-center items-center md:hidden">
            <div className="relative bg-card border-4 border-primary rounded-full p-4 shadow-bronze">
                <Shield className="h-16 w-16 text-primary" />
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-display font-black text-primary">VS</span>
            </div>
        </div>

        <FighterCard
          title="The Champion"
          coinName={loading ? "Loading..." : `$${prices?.right.symbol}`}
          price={loading ? "..." : prices?.right.price}
          change={formatChange(prices?.right.priceChange)}
          isPositive={!loading && (prices?.right.priceChange || 0) > 0}
          onBet={() => handleBet("short", prices?.right.symbol || "Right")}
          onViewChart={() => prices?.right && openChart(prices.right)} 
          buttonLabel="Bet"
          buttonVariant="short"
        />
      </div>

      <MyPositions prices={prices} />
      <HallOfFame />

      {/* Betting Modal */}
      <BettingModal
        isOpen={isBettingModalOpen}
        onClose={() => setIsBettingModalOpen(false)}
        onPlaceBet={handlePlaceBet}
        betType={selectedBet?.type}
        coinName={selectedBet?.coin}
      />

      {/* Chart Modal */}
      {selectedChartCoin && (
          <ChartModal 
            isOpen={isChartOpen} 
            onClose={() => setIsChartOpen(false)} 
            coinName={selectedChartCoin.name}
            coinAddress={selectedChartCoin.address}
          />
      )}

      {/* NEW: Message Modal (Replaces Alerts) */}
      <MessageModal
        isOpen={messageConfig.isOpen}
        onClose={() => setMessageConfig(prev => ({ ...prev, isOpen: false }))}
        title={messageConfig.title}
        message={messageConfig.message}
        type={messageConfig.type}
        onConfirm={messageConfig.onConfirm}
        confirmText={messageConfig.confirmText}
      />

    </div>
  );
};

export default BattleArena;