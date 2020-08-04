import React from 'react';
import {connect} from 'react-redux';
import TradingViewWidget, { Themes } from 'react-tradingview-widget';
import styled from 'styled-components';

import {Card} from '../../common/card';

const ChartCard = styled(Card)`

`;

const ItemsMainContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 56vh;
    flex-grow: 1;
    justify-content: center;
    min-height: fit-content;
    position: relative;
    z-index: 1;
`;

class TradingView extends React.Component {
    public render = () => {

        let content: React.ReactNode;
        content = (
            <ItemsMainContainer>
                <TradingViewWidget
                    symbol="ETHUSD "
                    theme={Themes.DARK}
                    locale="en"
                    autosize={true}
                />
            </ItemsMainContainer>

        );
        return <ChartCard title="Chart">{content}</ChartCard>;
    }
}

const TradingViewContainer = (TradingView);

export { TradingView, TradingViewContainer };
