import { Button } from "@/components/ui/button";
import { Shield, Swords } from "lucide-react";
import coinLogo from "@/assets/coin-logo.png"; // Make sure this path is correct for your logo
import { useGameSounds } from "@/hooks/useGameSounds";
import solana from "@/assets/SolLogo.svg"

interface CoverPageProps {
  onEnter: () => void;
}

const CoverPage = ({ onEnter }: CoverPageProps) => {
  const { play } = useGameSounds();

  const handleEnter = () => {
    play('enter');
    onEnter();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0c0a09] flex flex-col items-center justify-center text-center sm:px-4 overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#fbbf24]/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>

      {/* Main Content */}
      <div className="relative z-10 space-y-8 animate-in fade-in zoom-in duration-1000">
        
        {/* Logo Animation */}
        <div className="relative mx-auto w-32 h-32 md:w-48 md:h-48 mb-6 group">
          <div className="absolute inset-0 bg-[#fbbf24] rounded-full blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>
          <img 
            src={coinLogo} 
            alt="Degen Colosseum" 
            className="relative w-full h-full rounded-full object-contain drop-shadow-2xl animate-float"
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-7xl font-display font-black text-[#fbbf24] tracking-widest uppercase drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
            Degen<br/>Colosseum
          </h1>
          <p className="text-stone-400 text-lg md:text-xl font-mono max-w-xl mx-auto">
            The Ultimate PvP Prediction Market on Solana.
            <br/>
            <span className="text-primary text-sm">Fortune Favors the Bold.</span>
          </p>
        </div>

        <Button 
          onClick={handleEnter}
          className="group relative px-8 py-6 bg-transparent border-2 border-[#fbbf24] text-[#fbbf24] text-xl font-display uppercase tracking-widest hover:bg-primary hover:text-black transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
        >
          <span className="flex items-center gap-3">
            <Swords className="w-6 h-6" />
            Enter The Arena
            <Swords className="w-6 h-6" />
          </span>
        </Button>

      </div>

      <div className="absolute bottom-8 text-stone-600 text-xs font-mono">
        Built for the Indie.fun Hackathon • Powered by Solana <img src={solana} alt="Solana Logo" className="inline w-4 lg:h-4  ml-1" />
      </div>
    </div>
  );
};

export default CoverPage;