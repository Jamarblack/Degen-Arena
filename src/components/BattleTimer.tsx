import { useEffect, useState } from "react";

const BattleTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ minutes: 4, seconds: 12 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds === 0) {
          if (prev.minutes === 0) {
            return { minutes: 4, seconds: 59 }; // Reset for demo
          }
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        return { minutes: prev.minutes, seconds: prev.seconds - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const progress = ((timeLeft.minutes * 60 + timeLeft.seconds) / (5 * 60)) * 100;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm md:text-base">
        <span className="font-header font-bold uppercase tracking-wider text-muted-foreground">
          Battle Ends In:
        </span>
        <span className="font-header font-bold text-xl md:text-2xl text-primary">
          {String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
        </span>
      </div>
      <div className="relative h-4 bg-muted rounded-full overflow-hidden border border-border">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-destructive to-primary transition-all duration-1000 ease-linear glow-gold"
          style={{ width: `${progress}%` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/10 to-transparent animate-pulse-slow" />
      </div>
    </div>
  );
};

export default BattleTimer;
