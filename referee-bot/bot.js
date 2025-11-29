require('dotenv').config();
const { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { createClient } = require('@supabase/supabase-js');
const bs58 = require('bs58'); // Works perfectly with v4.0.1

// --- CONFIGURATION ---
const BET_DURATION_MINUTES = 2; 
const PAYOUT_MULTIPLIER = 1.9; 
const RPC_URL = "https://api.devnet.solana.com"; 
// ---------------------

const connection = new Connection(RPC_URL, 'confirmed');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Load House Wallet
const secretKeyString = process.env.HOUSE_PRIVATE_KEY;
if (!secretKeyString) {
    console.error("❌ ERROR: HOUSE_PRIVATE_KEY not found in .env");
    process.exit(1);
}

try {
    // Simple decoding for bs58@4.0.1
    const secretKey = bs58.decode(secretKeyString);
    const houseWallet = Keypair.fromSecretKey(secretKey);

    // Make houseWallet global so functions can see it
    global.houseWallet = houseWallet;

    console.log("🤖 Referee Bot Online!");
    console.log("Listening for bets on wallet:", houseWallet.publicKey.toString());

} catch (err) {
    console.error("❌ Key Error:", err.message);
    process.exit(1);
}

// Helper: Fetch Price from DexScreener
async function getCurrentPrice(coinSymbol) {
    try {
        const ADDRESS_MAP = {
            'BONK': 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
            'WIF': 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
            'POPCAT': '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYkW2hr',
            'MEW': 'MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREabe85bCR',
            'BOME': 'ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82',
            'PNUT': '2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump',
            'GOAT': 'HeLp6NuQkmYB4p5Vo2RPtEWB6UB8xXPp30RzUHZpump',
            'ACT': 'Az6oGenF48P6Y28w6dweY3x8g8F6Qc8hX5P5Q4w5pump',
            'FARTCOIN': '9BB6NFEBSJbQdxqze4psJq7jyCFhtKbYEGqAmWi1pump',
            'MOODENG': 'ED5nyyWEzpPPiWimP8vYm7sD7TD3LAt3Q3gRTWHzPJBY',
            'MYRO': 'HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4',
            'JUP': 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'
        };

        const address = ADDRESS_MAP[coinSymbol.toUpperCase()];
        if (!address) {
            console.log(`⚠️ Unknown coin: ${coinSymbol}`);
            return null;
        }

        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
        const data = await response.json();
        
        const pair = data.pairs?.find(p => p.quoteToken.symbol === 'SOL');
        return pair ? parseFloat(pair.priceUsd) : (data.pairs?.[0]?.priceUsd ? parseFloat(data.pairs[0].priceUsd) : null);
    } catch (e) {
        console.error("Price fetch error:", e);
        return null;
    }
}

// Helper: Send Payout
async function sendPayout(userAddress, amount) {
    try {
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: global.houseWallet.publicKey,
                toPubkey: new PublicKey(userAddress),
                lamports: Math.floor(amount * LAMPORTS_PER_SOL),
            })
        );

        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [global.houseWallet] 
        );
        console.log(`💸 Payout sent! Tx: ${signature}`);
        return signature;
    } catch (e) {
        console.error("Payout failed:", e);
        return null;
    }
}

// The Main Loop
async function checkBets() {
    console.log("🔍 Checking for expired bets...");

    const { data: bets, error } = await supabase
        .from('bets')
        .select('*')
        .eq('status', 'open');

    if (error || !bets) return;

    const now = Date.now();

    for (const bet of bets) {
        const betTime = new Date(bet.created_at).getTime();
        const diffMinutes = (now - betTime) / 1000 / 60;

        if (diffMinutes >= BET_DURATION_MINUTES) {
            console.log(`Processing Bet #${bet.id} (${bet.coin_symbol})...`);

            const currentPrice = await getCurrentPrice(bet.coin_symbol);
            if (!currentPrice) {
                console.log(`Could not fetch price for ${bet.coin_symbol}, skipping...`);
                continue;
            }

            let won = false;
            if (bet.bet_type === 'long' && currentPrice > bet.entry_price) won = true;
            else if (bet.bet_type === 'short' && currentPrice < bet.entry_price) won = true;

            console.log(`Entry: ${bet.entry_price}, Current: ${currentPrice} -> ${won ? "WIN" : "LOSS"}`);

            if (won) {
                const payoutAmount = bet.amount * PAYOUT_MULTIPLIER;
                const tx = await sendPayout(bet.user_address, payoutAmount);
                if (tx) {
                    await supabase.from('bets').update({ status: 'won', payout_tx: tx }).eq('id', bet.id);
                }
            } else {
                await supabase.from('bets').update({ status: 'lost' }).eq('id', bet.id);
            }
        }
    }
}

setInterval(checkBets, 30000);
checkBets();
