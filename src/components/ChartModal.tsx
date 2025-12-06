import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  coinName: string;
  coinAddress: string;
}

const ChartModal = ({ isOpen, onClose, coinName, coinAddress }: ChartModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1c1917] border-4 border-[#CCA46D] text-[#E7E5E4] max-w-4xl w-[95vw] h-[80vh] p-0 overflow-hidden shadow-stone">
        <DialogHeader className="px-6 py-4 border-b-2 border-[#4A3F35] bg-[#0c0a09]">
            <DialogTitle className="font-display text-[#CCA46D] tracking-widest uppercase flex items-center gap-2">
                $ {coinName} Price Action
            </DialogTitle>
        </DialogHeader>
        
        {/* DexScreener Embed */}
        <div className="w-full h-full bg-black">
            <iframe 
                src={`https://dexscreener.com/solana/${coinAddress}?embed=1&theme=dark&trades=0&info=0`}
                width="100%" 
                height="100%" 
                style={{ border: 0 }}
                title={`${coinName} Chart`}
            ></iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChartModal;