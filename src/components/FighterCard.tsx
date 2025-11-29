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
    <Card className="relative overflow-hidden bg-card border-4 border-primary/40 p-6 space-y-4 hover:border-primary/60 transition-all shadow-stone texture-stone">
      {/* Decorative Corners */}
      <div className="absolute top-2 left-2 w-8 h-8 border-l-2 border-t-2 border-primary/60"></div>
      <div className="absolute top-2 right-2 w-8 h-8 border-r-2 border-t-2 border-primary/60"></div>
      <div className="absolute bottom-2 left-2 w-8 h-8 border-l-2 border-b-2 border-primary/60"></div>
      <div className="absolute bottom-2 right-2 w-8 h-8 border-r-2 border-b-2 border-primary/60"></div>
      
      {/* Title */}
      <div className="text-center">
        <h3 className="text-xs md:text-sm font-header font-bold text-muted-foreground uppercase tracking-widest mb-3 shadow-emboss">
          {title}
        </h3>
        <div className="relative h-32 w-32 md:h-40 md:w-40 mx-auto">
          {/* Outer coin ring - bright bronze/gold */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-accent to-primary/80 shadow-bronze animate-pulse-slow"></div>
          {/* Inner coin face */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/95 via-accent/90 to-primary/85 border-4 border-primary/30 flex items-center justify-center shadow-[inset_0_4px_8px_rgba(0,0,0,0.3)]">
            <span className="text-4xl md:text-5xl font-display font-black text-primary-foreground drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              {coinName}
            </span>
          </div>
          {/* Shine effect */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-60 pointer-events-none"></div>
        </div>
      </div>

      {/* Stats */}
      <div className="text-center space-y-1 py-2">
        <div className="text-2xl md:text-3xl font-bold font-sans text-foreground">
          {price}
        </div>
        <div className={`text-lg md:text-xl font-semibold font-sans ${isPositive ? 'text-primary' : 'text-destructive'}`}>
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
