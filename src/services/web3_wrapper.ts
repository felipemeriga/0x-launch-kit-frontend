import { Web3Wrapper } from '@0x/web3-wrapper';
import Torus from "@toruslabs/torus-embed";
import Web3 from "web3";

import { sleep } from '../util/sleep';

let web3Wrapper: Web3Wrapper | null = null;

export const isMetamaskInstalled = (): boolean => {
    return true;
};

export const initializeWeb3Wrapper = async (): Promise<Web3Wrapper | null> => {
    if (web3Wrapper) {
        return web3Wrapper;
    }

    const reload = () => {
        console.log('happened')
        // window.location.reload();
    }

    if (localStorage.getItem("tokenizer-web3wrapper") === "true") {
        const torus = new Torus({});

        await torus.init({});
        const web3 = new Web3(torus.provider as any);
        web3Wrapper = new Web3Wrapper(web3.currentProvider as any);

        (torus.provider as any).on('chainChanged', reload);
        (torus.provider as any).on('accountsChanged', reload);

        (torus.provider as any).on('disconnect', () => {
            localStorage.removeItem("tokenizer-web3wrapper");
            (torus.provider as any).removeListener('accountsChanged', reload);
            (torus.provider as any).removeListener('chainChanged', reload);
            reload();
        });

        return web3Wrapper;
    }

    const torus = new Torus({});
    await torus.init({});
    await torus.login({});
    const web3 = new Web3(torus.provider as any);
    web3Wrapper = new Web3Wrapper(web3.currentProvider as any);
    localStorage.setItem("tokenizer-web3wrapper", "true");

    (torus.provider as any).on('chainChanged', reload);
    (torus.provider as any).on('accountsChanged', reload);
    (torus.provider as any).on('disconnect', () => {
        localStorage.removeItem("tokenizer-web3wrapper");
        (torus.provider as any).removeListener('accountsChanged', reload);
        (torus.provider as any).removeListener('chainChanged', reload);
        reload();
    });

    return web3Wrapper;
};

export const getWeb3Wrapper = async (): Promise<Web3Wrapper> => {
    while (!web3Wrapper) {
        // if web3Wrapper is not set yet, wait and retry
        await sleep(100);
    }

    return web3Wrapper;
};
