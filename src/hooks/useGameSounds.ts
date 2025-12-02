import { useCallback } from 'react';

// Mapped to your actual file names in public/sounds/
const SOUNDS = {
  select: "/sounds/betSound.mp3",       // Sword/Select sound
  bet_success: "/sounds/betSuccessful.mp3", // Success/Coins sound
  bet_fail: "/sounds/error.mp3",        // Error sound
  refresh: "/sounds/refresh.mp3",       // Refresh sound
  win: "/sounds/betSuccessful.mp3",
  enter: "/sounds/enter.mp3",  // Renamed to .mp3 for audio standard
  ready: "/sounds/ready.mp3",  
};

export const useGameSounds = () => {
  const play = useCallback((soundName: keyof typeof SOUNDS) => {
    try {
      const audio = new Audio(SOUNDS[soundName]);
      audio.volume = 0.4; // Keep volume reasonable
      // Reset time to allow rapid replay of same sound
      audio.currentTime = 0; 
      audio.play().catch(e => console.log("Audio play blocked (needs interaction first)", e));
    } catch (e) {
      console.error("Audio error", e);
    }
  }, []);

  return { play };
};