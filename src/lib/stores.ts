import { writable } from 'svelte/store';
import type { CoinMarketData, WalletCoin } from './utils';

export const selectedCoin = writable('');
export const selectedCoinData = writable<CoinMarketData>({} as CoinMarketData);
export const addedWalletCoins = writable<WalletCoin[]>([]);
export const editWalletCoin = writable<WalletCoin>({} as WalletCoin);
