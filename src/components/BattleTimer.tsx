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
  
  const formatTime = (time: { minutes: number; seconds: number }) => {
    return `${String(time.minutes).padStart(2, "0")}:${String(time.seconds).padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-2">
      <div className="text-center">
        <p className="text-xs md:text-sm font-header font-bold text-muted-foreground uppercase tracking-widest">
          Battle Ends In
        </p>
      </div>
      <div className="relative h-8 bg-secondary/50 border-2 border-primary/40 overflow-hidden shadow-stone">
        {/* Progress Bar */}
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary to-primary/80 transition-all duration-1000 ease-linear shadow-bronze"
          style={{ width: `${progress}%` }}
        />
        {/* Timer Text */}
        <div className="relative h-full flex items-center justify-center">
          <span className="text-lg md:text-xl font-display font-black text-foreground drop-shadow-lg z-10">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BattleTimer;
