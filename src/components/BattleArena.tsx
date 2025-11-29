import { useState } from "react";
import FighterCard from "./FighterCard";
import BattleTimer from "./BattleTimer";
import BettingModal from "./BettingModal";
import { Shield } from "lucide-react";

const BattleArena = () => {
  const [isBettingModalOpen, setIsBettingModalOpen] = useState(false);
  const [selectedBet, setSelectedBet] = useState<{ type: "long" | "short"; coin: string } | null>(null);

  const handleBet = (type: "long" | "short", coin: string) => {
    setSelectedBet({ type, coin });
    setIsBettingModalOpen(true);
  };

  const handlePlaceBet = (amount: string) => {
    console.log(`Placing ${selectedBet?.type} bet of ${amount} SOL on ${selectedBet?.coin}`);
    setIsBettingModalOpen(false);
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
        {/* Left Fighter */}
        <FighterCard
          title="The Challenger"
          coinName="$BONK"
          price="$0.00001234"
          change="+12.5%"
          isPositive={true}
          onBet={() => handleBet("long", "$BONK")}
          buttonLabel="Long (Gladiator Wins)"
          buttonVariant="long"
        />

        {/* VS Badge */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
          <div className="relative bg-card border-4 border-primary rounded-full p-6 shadow-bronze">
            <Shield className="h-20 w-20 text-primary" />
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-display font-black text-primary">
              VS
            </span>
          </div>
        </div>

        {/* Mobile VS Badge */}
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
          coinName="$WIF"
          price="$0.00005678"
          change="-8.3%"
          isPositive={false}
          onBet={() => handleBet("short", "$WIF")}
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
