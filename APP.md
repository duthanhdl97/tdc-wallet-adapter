# Wallet Adapter for Solana Apps

This is a quick setup guide with examples of how to add Wallet Adapter to a React-based Solana app.

See the [packages](https://github.com/duthanhdl97/tdc-wallet-adapter/blob/master/PACKAGES.md) and [FAQ](https://github.com/duthanhdl97/tdc-wallet-adapter/blob/master/FAQ.md) for other supported frontend frameworks.

## Quick Setup (using React UI)

There are also [material-ui](https://github.com/duthanhdl97/tdc-wallet-adapter/tree/master/packages/ui/material-ui) and [ant-design](https://github.com/duthanhdl97/tdc-wallet-adapter/tree/master/packages/ui/ant-design) packages if you use those UI component frameworks.

### Install

Install these dependencies:

```shell
npm install --save \
    tdc-publish/wallet-adapter-base \
    tdc-publish/wallet-adapter-react \
    tdc-publish/wallet-adapter-react-ui \
    tdc-publish/wallet-adapter-wallets-dtc \
    tdc-publish/web3.js \
    react
```

### Setup

```tsx
import React, { FC, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from 'tdc-publish/wallet-adapter-react';
import { WalletAdapterNetwork } from 'tdc-publish/wallet-adapter-base';
import { UnsafeBurnerWalletAdapter } from 'tdc-publish/wallet-adapter-wallets-dtc';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from 'tdc-publish/wallet-adapter-react-ui';
import { clusterApiUrl } from 'tdc-publish/web3.js';

// Default styles that can be overridden by your app
require('tdc-publish/wallet-adapter-react-ui/styles.css');

export const Wallet: FC = () => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(
        () => [
            /**
             * Wallets that implement either of these standards will be available automatically.
             *
             *   - Solana Mobile Stack Mobile Wallet Adapter Protocol
             *     (https://github.com/solana-mobile/mobile-wallet-adapter)
             *   - Solana Wallet Standard
             *     (https://github.com/anza-xyz/wallet-standard)
             *
             * If you wish to support a wallet that supports neither of those standards,
             * instantiate its legacy wallet adapter here. Common legacy adapters can be found
             * in the npm package `tdc-publish/wallet-adapter-wallets-dtc`.
             */
            new UnsafeBurnerWalletAdapter(),
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <WalletMultiButton />
                    <WalletDisconnectButton />
                    { /* Your app's components go here, nested within the context providers. */ }
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};
```

### Usage

```tsx
import { WalletNotConnectedError } from 'tdc-publish/wallet-adapter-base';
import { useConnection, useWallet } from 'tdc-publish/wallet-adapter-react';
import { Keypair, SystemProgram, Transaction } from 'tdc-publish/web3.js';
import React, { FC, useCallback } from 'react';

export const SendSOLToRandomAddress: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const onClick = useCallback(async () => {
        if (!publicKey) throw new WalletNotConnectedError();

        // 890880 lamports as of 2022-09-01
        const lamports = await connection.getMinimumBalanceForRentExemption(0);

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: Keypair.generate().publicKey,
                lamports,
            })
        );

        const {
            context: { slot: minContextSlot },
            value: { blockhash, lastValidBlockHeight }
        } = await connection.getLatestBlockhashAndContext();

        const signature = await sendTransaction(transaction, connection, { minContextSlot });

        await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
    }, [publicKey, sendTransaction, connection]);

    return (
        <button onClick={onClick} disabled={!publicKey}>
            Send SOL to a random address!
        </button>
    );
};
```
