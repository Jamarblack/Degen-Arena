import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FighterCardProps {
  title: string;
  coinName: string;
  price: string;
  change: string;
  isPositive: boolean;
  onBet: () => void;
  buttonLabel: string;
  buttonVariant: "long" | "short";
}

const FighterCard = ({
  title,
  coinName,
  price,
  change,
  isPositive,
  onBet,
  buttonLabel,
  buttonVariant,
}: FighterCardProps) => {
  return (
    <Card className="relative overflow-hidden bg-card border-2 border-border p-6 space-y-4 hover:border-primary/50 transition-all">
      {/* Title */}
      <div className="text-center">
        <h3 className="text-xs md:text-sm font-header font-bold text-muted-foreground uppercase tracking-widest mb-2">
          {title}
        </h3>
        <div className="h-24 w-24 md:h-32 md:w-32 mx-auto bg-gradient-to-br from-primary/20 to-transparent rounded-full flex items-center justify-center border-2 border-primary/30">
          <span className="text-4xl md:text-5xl font-display font-black text-gradient-gold">
            {coinName}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="text-center space-y-1">
        <div className="text-2xl md:text-3xl font-bold font-sans text-foreground">
          {price}
        </div>
        <div className={`text-lg md:text-xl font-semibold font-sans ${isPositive ? 'text-success' : 'text-destructive'}`}>
          {change}
        </div>
      </div>

      {/* Bet Button */}
      <Button
        variant={buttonVariant}
        size="xl"
        className="w-full"
        onClick={onBet}
      >
        {buttonLabel}
      </Button>
    </Card>
  );
};

export default FighterCard;
