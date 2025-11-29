import { Card } from "@/components/ui/card";
import { Trophy, TrendingUp } from "lucide-react";

interface Winner {
  address: string;
  amount: number;
  coin: string;
  timestamp: string;
}

const mockWinners: Winner[] = [
  { address: "0x7a3...B4C", amount: 2.5, coin: "$BONK", timestamp: "2 min ago" },
  { address: "0x9f2...A1D", amount: 1.8, coin: "$WIF", timestamp: "5 min ago" },
  { address: "0x4d8...E7F", amount: 3.2, coin: "$BONK", timestamp: "8 min ago" },
  { address: "0xc19...D2A", amount: 0.9, coin: "$WIF", timestamp: "12 min ago" },
];

const HallOfFame = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-12">
      <Card className="bg-card border-2 border-border overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 to-transparent border-b border-border p-6">
          <div className="flex items-center justify-center gap-3">
            <Trophy className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <h2 className="text-2xl md:text-3xl font-display font-black uppercase tracking-wider text-gradient-gold">
              Hall of Fame
            </h2>
            <Trophy className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          </div>
        </div>

        {/* Winners List */}
        <div className="divide-y divide-border">
          {mockWinners.map((winner, index) => (
            <div
              key={index}
              className="p-4 md:p-6 flex items-center justify-between hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div>
                  <p className="font-header font-bold text-foreground text-sm md:text-base">
                    Gladiator <span className="text-primary">{winner.address}</span>
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {winner.timestamp}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-header font-bold text-success text-lg md:text-xl">
                  +{winner.amount} SOL
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  on {winner.coin}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default HallOfFame;
