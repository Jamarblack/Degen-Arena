import { buttonVariants } from "@/components/ui/button";
import coinLogo from "@/assets/coin-logo.png";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react'; // Import the hook
import { cn } from "@/lib/utils";

const Header = () => {
  // Get the connection status
  const { connected } = useWallet();

  return (
    <header className="w-full px-4 py-4 md:px-6 md:py-6 border-b-2 border-border shadow-stone bg-[#0c0a09]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3 md:gap-4">
          <img 
            src={coinLogo} 
            alt="Degen Colosseum Coin" 
            className="h-12 w-12 md:h-16 md:w-16 rounded-full object-contain drop-shadow-lg"
          />
          <h1 className="text-xl md:text-2xl lg:text-3xl font-display font-black tracking-widest text-[#CCA46D]">
            DEGEN COLOSSEUM
          </h1>
        </div>
        
        {/*  Desktop */}
        <div className="hidden sm:block">
            <WalletMultiButton 
                className={cn(
                    buttonVariants({ variant: 'wallet', size: 'lg' }), 
                    "w-auto min-w-[180px]"
                )} 
            >
                {/* LOGIC: If connected, show nothing (default address). If not, show text. */}
                {connected ? undefined : "Connect Wallet"}
            </WalletMultiButton>
        </div>

        {/*Mobile */}
        <div className="block sm:hidden">
            <WalletMultiButton 
                className={cn(
                    buttonVariants({ variant: 'wallet', size: 'sm' }), 
                    "text-xs px-2"
                )} 
            >
               {/* Shorter text for mobile */}
               {connected ? undefined : "Connect"}
            </WalletMultiButton>
        </div>

      </div>
    </header>
  );
};

export default Header;