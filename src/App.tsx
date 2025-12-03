import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletContextProvider } from "@/context/WalletContextProvider";

// Components
import CoverPage from "@/components/CoverPage";
import LandingPage from "@/components/LandingPage";
import BattleArena from "@/components/BattleArena";
import Header from "@/components/Header"; // Assuming you have a Header component

const queryClient = new QueryClient();

// Simple State Router
type GameState = "COVER" | "LANDING" | "GAME";

const App = () => {
  const [gameState, setGameState] = useState<GameState>("COVER");

  return (
    <QueryClientProvider client={queryClient}>
      <WalletContextProvider>
        <TooltipProvider>
          <div className="min-h-screen font-sans no-scrollbar no-scrollbar::-webkit-scrollbar text-foreground">
            
            {/* 1. COVER PAGE */}
            {gameState === "COVER" && (
              <CoverPage onEnter={() => setGameState("LANDING")} />
            )}

            {/* 2. LANDING / TUTORIAL PAGE */}
            {gameState === "LANDING" && (
              <LandingPage onStart={() => setGameState("GAME")} />
            )}

            {/* 3. MAIN GAME APP */}
            {gameState === "GAME" && (
              <div className="animate-in fade-in duration-1000">
                {/* Header is part of the game view */}
                <Header /> 
                <BattleArena />
              </div>
            )}

          </div>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </WalletContextProvider>
    </QueryClientProvider>
  );
};

export default App;