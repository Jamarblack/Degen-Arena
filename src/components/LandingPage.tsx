import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, TrendingUp, Trophy, ArrowRight, Shield } from "lucide-react";
import { useGameSounds } from "@/hooks/useGameSounds";

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage = ({ onStart }: LandingPageProps) => {
  const { play } = useGameSounds();

  const handleStart = () => {
    play('ready');
    onStart();
  };

  const steps = [
    {
      icon: <Wallet className="w-8 h-8 text-[#CCA46D]" />,
      title: "1. Connect Wallet",
      desc: "Connect your Solana wallet to enter the arena."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-green-500" />,
      title: "2. Predict Price",
      desc: "Choose a fighter. Will it pump (Long) or dump (Short) in the next 5 minutes?"
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-500" />,
      title: "3. Place Bet",
      desc: "Wager SOL on your prediction."
    },
    {
      icon: <Trophy className="w-8 h-8 text-[#fbbf24]" />,
      title: "4. Win Rewards",
      desc: "If you're right after 5 mins, you get your bet back + 90% profit instantly!"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0c0a09] text-[#E7E5E4] flex flex-col items-center justify-center p-4 md:p-8">
      
      <div className="max-w-5xl w-full space-y-12 animate-in slide-in-from-bottom duration-700 fade-in">
        
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-display text-[#CCA46D] uppercase tracking-widest">
            How to Play
          </h2>
          <p className="text-stone-400 max-w-2xl mx-auto">
            Welcome, Gladiator. The rules of the Colosseum are simple, but the stakes are high. 
            Master the market to claim your glory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="bg-[#1c1917] border border-[#4A3F35] p-6 flex flex-col items-center text-center space-y-4 hover:border-[#CCA46D] transition-colors shadow-stone hover:-translate-y-1 duration-300">
              <div className="p-4 bg-[#0c0a09] rounded-full border border-[#4A3F35] shadow-inner">
                {step.icon}
              </div>
              <h3 className="font-display text-xl text-[#E7E5E4]">{step.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                {step.desc}
              </p>
            </Card>
          ))}
        </div>

        <div className="flex justify-center pt-8">
          <Button 
            onClick={handleStart}
            size="lg"
            className="bg-[#CCA46D] text-black hover:bg-[#B08D57] font-bold text-xl px-12 py-8 rounded-none border-2 border-[#fbbf24] shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all hover:scale-105"
          >
            I AM READY <ArrowRight className="ml-2 w-6 h-6" />
          </Button>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;