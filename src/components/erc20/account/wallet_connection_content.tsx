import React, { HTMLAttributes } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { getEthAccount } from '../../../store/selectors';
import { truncateAddress } from '../../../util/number_utils';
import { StoreState } from '../../../util/types';
import { WalletConnectionStatusContainer } from '../../account/wallet_connection_status';
import { CardBase } from '../../common/card_base';
import { DropdownTextItem } from '../../common/dropdown_text_item';
import { getWeb3Modal, getWeb3 } from '../../../services/web3_wrapper';

interface OwnProps extends HTMLAttributes<HTMLSpanElement> {}

interface StateProps {
    ethAccount: string;
}

type Props = StateProps & OwnProps;

const connectToWallet = async () => {
    const web3 = await getWeb3();
    if (web3 && web3.currentProvider && web3.currentProvider.close) {
        await web3.currentProvider.close();
    }
    const web3Modal = await getWeb3Modal();
    await web3Modal.clearCachedProvider();
    window.location.reload();
};

// const goToURL = () => {
//     alert('go to url');
// };

const DropdownItems = styled(CardBase)`
    box-shadow: ${props => props.theme.componentsTheme.boxShadow};
    min-width: 240px;
`;

class WalletConnectionContent extends React.PureComponent<Props> {
    public render = () => {
        const { ethAccount, ...restProps } = this.props;
        const ethAccountText = ethAccount ? `${truncateAddress(ethAccount)}` : 'Not connected';

        const content = (
            <DropdownItems>
                <CopyToClipboard text={ethAccount ? ethAccount : ''}>
                    <DropdownTextItem text="Copy Address to Clipboard" />
                </CopyToClipboard>
                <DropdownTextItem onClick={connectToWallet} text="Connect a different Wallet" />
            </DropdownItems>
        );

        return (
            <WalletConnectionStatusContainer
                walletConnectionContent={content}
                headerText={ethAccountText}
                ethAccount={ethAccount}
                {...restProps}
            />
        );
    };
}

const mapStateToProps = (state: StoreState): StateProps => {
    return {
        ethAccount: getEthAccount(state),
    };
};

const WalletConnectionContentContainer = connect(mapStateToProps, {})(WalletConnectionContent);

export { WalletConnectionContent, WalletConnectionContentContainer };
