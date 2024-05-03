import type { AppProps } from 'next/app';
import Head from 'next/head';
import type { FC } from 'react';
import React from 'react';
import { ContextProvider } from '../components/ContextProvider';

// Use require instead of import since order matters
require('antd/dist/antd.dark.less');
require('tdc-publish/wallet-adapter-ant-design/styles.css');
require('tdc-publish/wallet-adapter-react-ui/styles.css');
require('../styles/globals.css');

const App: FC<AppProps> = ({ Component, pageProps }) => {
    return (
        <>
            <Head>
                <title>tdc-publish/wallet-adapter Example</title>
            </Head>
            <ContextProvider>
                <Component {...pageProps} />
            </ContextProvider>
        </>
    );
};

export default App;
