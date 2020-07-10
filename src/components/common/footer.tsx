import React, { HTMLAttributes } from 'react';
import styled from 'styled-components';

import { ReactComponent as CoinGeckoSvg } from '../../assets/icons/coingecko.svg';
import { ReactComponent as TorusSVG } from '../../assets/icons/torus.svg';
import { ReactComponent as TkzSvg } from '../../assets/icons/toz.svg';
import { ReactComponent as ZrxSvg } from '../../assets/icons/zrx.svg';
import { GIT_COMMIT } from '../../common/constants';
import { themeDimensions } from '../../themes/commons';

interface Props extends HTMLAttributes<HTMLDivElement> {}

const FooterWrapper = styled.div`
    align-items: center;
    display: flex;
    color: #ffffff
    height: ${themeDimensions.footerHeight};
    justify-content: center;
    padding: 0 ${themeDimensions.horizontalPadding} ${themeDimensions.verticalPadding};
`;

const poweredBySVGTokenizer = () => {
    return (
        <TkzSvg/>
    );
};

const poweredBySVG0x = () => {
    return (
        <ZrxSvg/>
    );
};

const poweredBySVGCoinGecko = () => {
    return (
           <CoinGeckoSvg/>
    );
};

const poweredBySVGTorus = () => {
    return (
        <TorusSVG/>
    );
};

export const Footer: React.FC<Props> = props => {
    return (
        <FooterWrapper title={GIT_COMMIT} {...props}>
            Powered by DefiVentures   &ensp;
            <a href="https://tokenizer.cc/" target="_blank" rel="noopener noreferrer">
                {poweredBySVGTokenizer()}
            </a>
            &ensp;
            0x
            &ensp;
            <a href="https://0x.org/" target="_blank" rel="noopener noreferrer">
                {poweredBySVG0x()}
            </a>
            &ensp;
            CoinGecko
            &ensp;
            <a href="https://www.coingecko.com/en" target="_blank" rel="noopener noreferrer">
                {poweredBySVGCoinGecko()}
            </a>
            &ensp;
            Torus
            &ensp;
            <a href="https://toruswallet.io/" target="_blank" rel="noopener noreferrer">
                {poweredBySVGTorus()}
            </a>
        </FooterWrapper>
    );
};
