import { useState, useEffect } from "react";
import FighterCard from "./FighterCard";
import BattleTimer from "./BattleTimer";
import BettingModal from "./BettingModal";
import HallOfFame from "./Transactions"; 
import MyPositions from "./MyPositions"; 
import ChartModal from "./ChartModal";   
import MessageModal from "./MessageModal"; 
import Trollbox from "./TrollBox"; 
import HighStakesFeed from "./HighStakeFeeds"; 
import { Shield, RefreshCw, MessageSquare, X } from "lucide-react"; 
import { fetchTokenPrices, TokenData } from '@/lib/PriceService';
import { useGameSounds } from "@/hooks/useGameSounds"; 

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
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false); // Mobile Chat State
  
  // Message Modal State
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
  const { play } = useGameSounds(); 

  const HOUSE_WALLET = new PublicKey("8RYRucwwCsrX7VaeXLTR8FoHUi9P26Ywu4j22G5zq1aR"); 

  const refreshBattle = async () => {
    play('refresh'); 
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
    play('select'); 
    setSelectedBet({ type, coin });
    setIsBettingModalOpen(true);
  };

  const openChart = (coin: TokenData) => {
      setSelectedChartCoin({ name: coin.symbol, address: coin.address });
      setIsChartOpen(true);
  };

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
      play('bet_fail'); 
      showMessage("Wallet Required", "Please connect your Solana wallet to enter the arena.", "error");
      return;
    }

    try {
      console.log(`Initiating bet: ${amount} SOL`);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: HOUSE_WALLET,
          lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      console.log("Transaction sent:", signature);
      
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

      play('bet_success'); 
      setIsBettingModalOpen(false);
      
      setTimeout(() => {
          showMessage(
              "Victory Awaits!", 
              `Your wager has been placed successfully.\n\nTransaction: ${signature.slice(0, 6)}...`, 
              "success",
              () => {
                  shareOnTwitter(amount, selectedBet?.coin || "Crypto", selectedBet?.type || "up");
                  setMessageConfig(prev => ({ ...prev, isOpen: false }));
              },
              "Share Victory on X"
          );
      }, 500);

    } catch (error) {
      console.error("Bet failed:", error);
      play('bet_fail'); 
      showMessage("Transaction Failed", "The blockchain rejected your offering. Please try again.", "error");
    }
  };

  const formatChange = (val: number | undefined) => {
    if (val === undefined) return "...";
    return `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;
  };

  return (
    <div className="w-full min-h-screen max-w-[1920px] mx-auto px-2 md:px-4 py-6 flex flex-col md:flex-row gap-4 relative mt-4">
      
      {/* --- DESKTOP LEFT SIDEBAR (Chat) --- */}
      <div className="hidden lg:flex w-[320px] xl:w-[380px] h-full sticky top-5 flex-col flex-shrink-0">
         <Trollbox />
      </div>

      {/* --- MOBILE CHAT SLIDE-OVER --- */}
      {/* Floating Button */}
      <button 
        onClick={() => setIsMobileChatOpen(true)}
        className="lg:hidden fixed bottom-6 left-4 z-50 bg-[#CCA46D] text-black p-3 rounded-full shadow-[0_0_15px_rgba(204,164,109,0.5)] border-2 border-[#fbbf24] hover:scale-110 transition-transform active:scale-95"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Slide-over Drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isMobileChatOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileChatOpen(false)} />
        
        {/* Drawer Content */}
        <div className={`absolute left-0 top-0 bottom-0 w-[85vw] max-w-[350px]  bg-[#1c1917] border-r-2 border-[#4A3F35] shadow-2xl transform transition-transform duration-300 ${isMobileChatOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            {/* <div className="flex justify-end p-2 bg-[#0c0a09]">
                <button onClick={() => setIsMobileChatOpen(false)} className="text-[#CCA46D] p-1">
                    <X className="w-6 h-6" />
                </button>
            </div> */}
            <div className="h-[calc(100%-44px)]">
                <Trollbox />
            </div>
        </div>
      </div>


      {/* --- CENTER COLUMN: MAIN ARENA --- */}
      <div className="flex-1 min-w-0 h-full overflow-y-auto pb-20 space-y-6 scrollbar-hide">
          
          {/* Header */}
          <div className="text-center space-y-4 relative pt-2">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-black uppercase tracking-widest text-primary drop-shadow-lg">
              Current Battle
            </h2>
            <button onClick={refreshBattle} className="relative flex justify-center p-2 items-center border-2 bg-primary hover:bg-[#130f0c] right-0 top-2 text-[#130f0c] hover:text-[#CCA46D] transition-colors">
                <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} /><span className="text-l font-bold">REFRESH BATTLE</span>
            </button>
            <BattleTimer />
          </div>

          {/* Fighters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
            <FighterCard
              title="The Challenger"
              coinName={loading ? "Loading..." : `$${prices?.left.symbol}`} 
              price={loading ? "..." : prices?.left.price}
              change={formatChange(prices?.left.priceChange)}
              isPositive={!loading && (prices?.left.priceChange || 0) > 0}
              onBet={() => handleBet("long", prices?.left.symbol || "Left")}
              onViewChart={() => prices?.left && openChart(prices.left)} 
              buttonLabel="Long (Gladiator Wins)"
              buttonVariant="long"
            />

            {/* VS Badges */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
              <div className="relative bg-card border-4 border-primary rounded-full p-4 shadow-bronze">
                <Shield className="h-16 w-16 text-primary" />
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-display font-black text-primary">VS</span>
              </div>
            </div>
            
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
              buttonLabel="Short (Gladiator Falls)"
              buttonVariant="short"
            />
          </div>

          <MyPositions prices={prices} />
          
          <HallOfFame />
          
          {/* MOBILE ONLY: High Stakes Feed (Placed AFTER Hall of Fame) */}
          <div className="space-y-6 lg:hidden pb-10">
             <div className="h-[400px]">
                <HighStakesFeed />
             </div>
          </div>
      </div>

      {/* --- DESKTOP RIGHT SIDEBAR (High Stakes) --- */}
      <div className="hidden xl:flex w-[320px] h-full sticky top-5 flex-col flex-shrink-0">
          <HighStakesFeed />
      </div>

      {/* Modals */}
      <BettingModal
        isOpen={isBettingModalOpen}
        onClose={() => setIsBettingModalOpen(false)}
        onPlaceBet={handlePlaceBet}
        betType={selectedBet?.type}
        coinName={selectedBet?.coin}
      />

      {selectedChartCoin && (
          <ChartModal 
            isOpen={isChartOpen} 
            onClose={() => setIsChartOpen(false)} 
            coinName={selectedChartCoin.name}
            coinAddress={selectedChartCoin.address}
          />
      )}

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