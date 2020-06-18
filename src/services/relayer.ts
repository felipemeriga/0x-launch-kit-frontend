import { HttpClient, OrderConfigRequest, OrderConfigResponse, SignedOrder } from '@0x/connect';
import { assetDataUtils, AssetProxyId } from '@0x/order-utils';
import { Orderbook } from '@0x/orderbook';
import { BigNumber } from '@0x/utils';
import { RateLimit } from 'async-sema';

import {
    RELAYER_RPS,
    RELAYER_TOKENIZER_URL,
    RELAYER_TOKENIZER_WS_URL,
    RELAYER_URL,
    RELAYER_WS_URL,
} from '../common/constants';
import { tokenAmountInUnitsToBigNumber } from '../util/tokens';
import { Token } from '../util/types';

export class Relayer {
    private readonly _client: HttpClient;
    private readonly _tokenizerClient: HttpClient;
    private readonly _rateLimit: () => Promise<void>;
    private readonly _orderbook: Orderbook;
    private readonly _tokenizerOrderbook: Orderbook;

    constructor(options: { rps: number }) {
        this._orderbook = Orderbook.getOrderbookForWebsocketProvider({
            httpEndpoint: RELAYER_URL,
            websocketEndpoint: RELAYER_WS_URL,
        });
        this._tokenizerOrderbook = Orderbook.getOrderbookForWebsocketProvider({
            httpEndpoint: RELAYER_TOKENIZER_URL,
            websocketEndpoint: RELAYER_TOKENIZER_WS_URL,
        });
        this._client = new HttpClient(RELAYER_URL);
        this._tokenizerClient = new HttpClient(RELAYER_TOKENIZER_URL);
        this._rateLimit = RateLimit(options.rps); // requests per second
    }

    public async getAllOrdersAsync(
        baseTokenAssetData: string,
        quoteTokenAssetData: string,
        tokenizerFlag: boolean,
    ): Promise<SignedOrder[]> {
        const [sellOrders, buyOrders] = await Promise.all([
            this._getOrdersAsync(tokenizerFlag, baseTokenAssetData, quoteTokenAssetData),
            this._getOrdersAsync(tokenizerFlag, quoteTokenAssetData, baseTokenAssetData),
        ]);
        return [...sellOrders, ...buyOrders];
    }

    public async getOrderConfigAsync(
        orderConfig: OrderConfigRequest,
        tokenizerFlag: boolean,
    ): Promise<OrderConfigResponse> {
        await this._rateLimit();

        if (tokenizerFlag) {
            return this._tokenizerClient.getOrderConfigAsync(orderConfig);
        }
        return this._client.getOrderConfigAsync(orderConfig);
    }

    public async getUserOrdersAsync(
        account: string,
        baseTokenAssetData: string,
        quoteTokenAssetData: string,
        tokenizerFlag: boolean,
    ): Promise<SignedOrder[]> {
        const [sellOrders, buyOrders] = await Promise.all([
            this._getOrdersAsync(tokenizerFlag, baseTokenAssetData, quoteTokenAssetData, account),
            this._getOrdersAsync(tokenizerFlag, quoteTokenAssetData, baseTokenAssetData, account),
        ]);

        return [...sellOrders, ...buyOrders];
    }

    // This function here is used to get the current currency pair price, and it's called in every x seconds, in
    // order to update the store, and send the liquidity to the exchange dashboard, also has been a change in that
    // function to check whether the token is from Tokenizer, if it's from tokenizer it will get the prices from the
    // Tokenizer backend
    public async getCurrencyPairPriceAsync(baseToken: Token, quoteToken: Token): Promise<BigNumber | null> {
        let tokenizerFlag = false;

        if (baseToken.name === 'Tokenizer') {
            tokenizerFlag = true;
        }

        const asks = await this._getOrdersAsync(
            tokenizerFlag,
            assetDataUtils.encodeERC20AssetData(baseToken.address),
            assetDataUtils.encodeERC20AssetData(quoteToken.address),
        );

        if (asks.length) {
            const lowestPriceAsk = asks[0];

            const { makerAssetAmount, takerAssetAmount } = lowestPriceAsk;
            const takerAssetAmountInUnits = tokenAmountInUnitsToBigNumber(takerAssetAmount, quoteToken.decimals);
            const makerAssetAmountInUnits = tokenAmountInUnitsToBigNumber(makerAssetAmount, baseToken.decimals);
            return takerAssetAmountInUnits.div(makerAssetAmountInUnits);
        }

        return null;
    }

    public async getSellCollectibleOrdersAsync(
        collectibleAddress: string,
        wethAddress: string,
    ): Promise<SignedOrder[]> {
        await this._rateLimit();
        const result = await this._client.getOrdersAsync({
            makerAssetProxyId: AssetProxyId.ERC721,
            takerAssetProxyId: AssetProxyId.ERC20,
            makerAssetAddress: collectibleAddress,
            takerAssetAddress: wethAddress,
        });

        return result.records.map(record => record.order);
    }

    public async submitOrderAsync(order: SignedOrder, tokenizerFlag: boolean): Promise<void> {
        await this._rateLimit();

        if (tokenizerFlag) {
            return this._tokenizerClient.submitOrderAsync(order);
        }

        return this._client.submitOrderAsync(order);
    }

    private async _getOrdersAsync(
        tokenizerFlag: boolean,
        makerAssetData: string,
        takerAssetData: string,
        makerAddress?: string,
    ): Promise<SignedOrder[]> {
        let apiOrders;
        // tslint:disable-next-line:prefer-conditional-expression
        if (tokenizerFlag) {
            apiOrders = await this._tokenizerOrderbook.getOrdersAsync(makerAssetData, takerAssetData);
        } else {
            apiOrders = await this._orderbook.getOrdersAsync(makerAssetData, takerAssetData);
        }
        const orders = apiOrders.map(o => o.order);
        if (makerAddress) {
            return orders.filter(o => o.makerAddress === makerAddress);
        } else {
            return orders;
        }
    }
}

let relayer: Relayer;
export const getRelayer = (): Relayer => {
    if (!relayer) {
        relayer = new Relayer({ rps: RELAYER_RPS });
    }

    return relayer;
};
