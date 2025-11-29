import { Sword, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="w-full px-4 py-4 md:px-6 md:py-6 border-b border-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Sword className="h-8 w-8 md:h-10 md:w-10 text-primary absolute transform -rotate-45" />
            <TrendingUp className="h-8 w-8 md:h-10 md:w-10 text-primary transform rotate-45" />
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-black tracking-wider text-gradient-gold">
            DEGEN COLOSSEUM
          </h1>
        </div>
        
        {/* Connect Wallet Button */}
        <Button variant="wallet" size="lg" className="hidden sm:flex">
          Connect Wallet
        </Button>
        <Button variant="wallet" size="default" className="sm:hidden">
          Connect
        </Button>
      </div>
    </header>
  );
};

export default Header;
