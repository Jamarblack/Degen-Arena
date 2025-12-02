require('dotenv').config();
const { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { createClient } = require('@supabase/supabase-js');
const bs58 = require('bs58'); 

// Robust decoder handling both versions of bs58
const decode = bs58.decode || (bs58.default ? bs58.default.decode : null) || ((str) => new Uint8Array(bs58.default(str)));

// --- CONFIGURATION ---
const BET_DURATION_MINUTES = 5; 
const PAYOUT_MULTIPLIER = 1.9; 
const RPC_URL = "https://api.devnet.solana.com"; 
// ---------------------

const connection = new Connection(RPC_URL, 'confirmed');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Load House Wallet
let secretKeyString = process.env.HOUSE_PRIVATE_KEY;

if (!secretKeyString) {
    console.error("❌ ERROR: HOUSE_PRIVATE_KEY not found in .env");
    process.exit(1);
}

// Clean up the string (remove brackets/spaces if user pasted them)
secretKeyString = secretKeyString.replace(/[\[\]\s]/g, '');

let houseWallet;
try {
    let secretKey;
    if (secretKeyString.includes(',')) {
        const array = secretKeyString.split(',').map(num => {
            const val = parseInt(num.trim(), 10);
            if (isNaN(val)) throw new Error("Invalid number in key array");
            return val;
        });
        secretKey = Uint8Array.from(array);
    } else {
        secretKey = decode(secretKeyString);
    }

    houseWallet = Keypair.fromSecretKey(secretKey);
    global.houseWallet = houseWallet;

    console.log("🤖 Referee Bot Online!");
    console.log("Listening for bets on wallet:", houseWallet.publicKey.toString());

} catch (err) {
    console.error("❌ Wallet Key Error:", err.message);
    process.exit(1);
}

// Helper: Fetch Price from DexScreener
async function getCurrentPrice(coinSymbol) {
    try {
        // --- EXPANDED ADDRESS MAP ---
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
            'JUP': 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
            'SLERF': '7BgBvyjr2HDURj8nddpGTLJ0pmzVf1f1k3tgEAg1pump',
            'WEN': 'WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk',
            'MANEKI': '25hAyBQfoDhfWx9ay6rarbgvWGwDdNqcHsXS3jQ3mUAj',
            'MICHI': '5mbK36SZ7J19An8jFco7R446d8Wq4t4q2vWqK16pump',
            'BILLY': '3B5wuUrMEi5y1D8BAu2e71rUUGxxTmgk7c06VvRjJ7m7',
            'MOTHER': '3S8qX1MsMqRqeW4govDEWQKz4zwoTncWuQK60G37pump',
            'PONKE': '5z3EqYQo9HiCEs3R84RCDMy256X9lFcwZh279qksfthp',
            'GIGACHAD': '63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGq5tiJxcqj9'
        };

        const cleanSymbol = coinSymbol.toUpperCase().replace('$', '');
        const address = ADDRESS_MAP[cleanSymbol];
        
        if (!address) {
            console.log(`⚠️ Unknown coin: ${cleanSymbol}`);
            return null;
        }

        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
        const data = await response.json();
        
        const pair = data.pairs?.find(p => p.quoteToken.symbol === 'SOL') || data.pairs?.[0];
        
        return pair ? parseFloat(pair.priceUsd) : null;
    } catch (e) {
        console.error("Price fetch error:", e.message);
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
        console.error("Payout failed:", e.message);
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

    if (error) {
        console.error("Supabase Error:", error.message);
        return;
    }
    
    if (!bets || bets.length === 0) return;

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

            console.log(`Entry: ${bet.entry_price} | Current: ${currentPrice} -> ${won ? "WIN" : "LOSS"}`);

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