import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { 
    PhantomWalletAdapter, 
    SolflareWalletAdapter,
    TrustWalletAdapter,
    CoinbaseWalletAdapter,
    WalletConnectWalletAdapter,
    TorusWalletAdapter,
    LedgerWalletAdapter, 
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

import '@solana/wallet-adapter-react-ui/styles.css';

export const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const network = WalletAdapterNetwork.Mainnet;
    const endpoint = "https://young-little-breeze.solana-mainnet.quiknode.pro/5331211f2de8c4faaaf53fbee387cec545065bfb/";

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
            new TrustWalletAdapter(),
            new CoinbaseWalletAdapter(),
            new TorusWalletAdapter(),
            new LedgerWalletAdapter(),
            new WalletConnectWalletAdapter({
                network,
                options: {
                    projectId: 'c02adc0acec81f5772762147caa7c366',
                    metadata: {
                        name: 'Degen Colosseum',
                        description: 'PvP Meme Battle',
                        url: 'https://degen-colosseum.vercel.app',
                        icons: ['https://degen-colosseum.vercel.app/favicon.ico']
                    },
                },
            }),
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};