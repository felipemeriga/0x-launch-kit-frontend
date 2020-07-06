import { Web3Wrapper } from '@0x/web3-wrapper';
import Torus from '@toruslabs/torus-embed';
import Authereum from 'authereum';
import UniLogin from '@unilogin/provider';
// import Fortmatic from 'fortmatic';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal, { getInjectedProviderName } from 'web3modal';
import Web3 from 'web3';

import { sleep } from '../util/sleep';

let web3Wrapper: Web3Wrapper | null = null;
let web3Modal: any = null;
let web3: any = null;

export const isMetamaskInstalled = (): boolean => {
    return false;
};

export const initializeWeb3Wrapper = async (): Promise<Web3Wrapper | null> => {
    if (web3Wrapper) {
        return web3Wrapper;
    }

    const reload = () => {
        console.log('happened');
    };

    const providerOptions = {
        torus: {
            package: Torus, // required
        },
        authereum: {
            package: Authereum,
        },
        unilogin: {
            package: UniLogin,
        },
        // fortmatic: {
        //     package: Fortmatic,
        //     options: {
        //       key: process.env.REACT_APP_FORTMATIC_KEY
        //     }
        // },
        walletconnect: {
            package: WalletConnectProvider, // required
            options: {
                infuraId: 'aa41866135a5416a87f324deb3e30da8', // required
            },
        },
    };

    web3Modal = new Web3Modal({
        providerOptions, // required
        theme: 'dark',
    });

    // Subscribe to accounts change
    web3Modal.on('accountsChanged', (accounts: string[]) => {
        console.log('accountsChanged', accounts);
    });

    // Subscribe to chainId change
    web3Modal.on('chainChanged', (chainId: number) => {
        console.log('chainChanged', chainId);
    });

    // Subscribe to provider connection
    web3Modal.on('connect', (info: { chainId: number; isTorus: any; torus: any }) => {
        console.log('connect', info);
        if (info.isTorus) {
            info.torus.showTorusButton();
        }
    });

    // Subscribe to provider disconnection
    web3Modal.on('disconnect', (error: { code: number; message: string }) => {
        console.log('disconnect', error);
    });

    const provider = await web3Modal.connect();

    web3 = new Web3(provider);
    web3Wrapper = new Web3Wrapper(web3.currentProvider as any);

    return web3Wrapper;
};

export const getWeb3Wrapper = async (): Promise<Web3Wrapper> => {
    while (!web3Wrapper) {
        // if web3Wrapper is not set yet, wait and retry
        await sleep(100);
    }

    return web3Wrapper;
};

export const getWeb3 = async (): Promise<any> => {
    while (!web3) {
        // if web3Wrapper is not set yet, wait and retry
        await sleep(100);
    }

    return web3;
};

export const getWeb3Modal = async (): Promise<any> => {
    while (!web3Modal) {
        // if web3Wrapper is not set yet, wait and retry
        await sleep(100);
    }

    return web3Modal;
};
