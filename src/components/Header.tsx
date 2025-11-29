import { Button } from "@/components/ui/button";
import coinLogo from "@/assets/coin-logo.png";

const Header = () => {
  return (
    <header className="w-full px-4 py-4 md:px-6 md:py-6 border-b-2 border-border shadow-stone">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 md:gap-4">
          <img 
            src={coinLogo} 
            alt="Degen Colosseum Coin" 
            className="h-12 w-12 md:h-16 md:w-16 rounded-full object-contain drop-shadow-lg"
          />
          <h1 className="text-xl md:text-2xl lg:text-3xl font-display font-black tracking-widest text-primary">
            DEGEN COLOSSEUM
          </h1>
        </div>
        
        {/* Connect Wallet Button */}
        <Button variant="wallet" size="lg" className="hidden sm:flex">
          Connect Wallet
        </Button>
        <Button variant="wallet" size="default" className="sm:hidden text-xs px-3">
          Connect
        </Button>
      </div>
    </header>
  );
};

export default Header;
