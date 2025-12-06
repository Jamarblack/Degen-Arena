#Degen Colosseum - The Ultimate Memecoin Battle Arena

Degen Colosseum is a gamified prediction market on Solana where users bet on which memecoin will perform better in the next 5 minutes.

#Features

Live Battles: Real-time price tracking of top Solana memecoins (BONK, WIF, PNUT, etc.).

PvP Betting: Users bet SOL on "Long" or "Short" positions.

Automated Referee: A Node.js bot monitors prices and automatically payouts winners + profit directly to their wallets.

Global Chat: Real-time "Trollbox" for degens to discuss strategies.

Leaderboards: Live feed of high-stakes bets and top winners.

#Tech Stack

Frontend: React, Tailwind CSS, Shadcn UI, Vite.

Blockchain: Solana Web3.js, Wallet Adapter (Phantom, Solflare, etc.).

Backend: Node.js (Referee Bot), Supabase (Database & Realtime).

Data: DexScreener API.

#How to Run Locally

1. Frontend

npm install
npm run dev


2. Referee Bot

cd referee-bot
pnpm install

node bot.js


#Hackathon Track

Indie.fun - Solana Gaming & Prediction Markets