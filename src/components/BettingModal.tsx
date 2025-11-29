import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface BettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceBet: (amount: string) => void;
  betType?: "long" | "short";
  coinName?: string;
}

const BettingModal = ({ isOpen, onClose, onPlaceBet, betType, coinName }: BettingModalProps) => {
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && parseFloat(amount) > 0) {
      onPlaceBet(amount);
      setAmount("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-2 border-primary/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl font-display font-black text-center text-gradient-gold uppercase tracking-wider">
            Place Your Wager
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {betType && coinName && (
            <div className="text-center space-y-2">
              <p className="text-lg font-header font-bold">
                <span className={betType === "long" ? "text-success" : "text-destructive"}>
                  {betType === "long" ? "LONG" : "SHORT"}
                </span>
                {" on "}
                <span className="text-primary">{coinName}</span>
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-header font-bold uppercase tracking-wider text-muted-foreground">
              Amount in SOL
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-12 text-lg font-bold text-center bg-background border-border"
            />
          </div>

          <Button
            type="submit"
            variant={betType === "long" ? "long" : "short"}
            size="xl"
            className="w-full"
            disabled={!amount || parseFloat(amount) <= 0}
          >
            Enter The Arena
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BettingModal;
