import { Web3Wrapper } from '@0x/web3-wrapper';
import Torus from '@toruslabs/torus-embed';
import Authereum from 'authereum';
import UniLogin from '@unilogin/provider';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3Modal from 'web3modal';
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
        walletconnect: {
            package: WalletConnectProvider, // required
            options: {
                infuraId: '27e484dcd9e3efcfd25a83a78777cdf1', // required
            },
        },
    };

    web3Modal = new Web3Modal({
        providerOptions, // required
        theme: 'dark',
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
