import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;

	const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (style: Record<string, number | string | undefined>): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, '');
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			});
		},
		easing: cubicOut
	};
};

let API_URL = 'http://localhost:8787';

export const getMatchingCoins = async ({
	query,
	callback
}: {
	query: string;
	callback?: () => void;
}) => {
	let searchEndpoint = `${API_URL}/search`;

	return fetch(`${searchEndpoint}?query=${query}`)
		.then((response) => {
			if (!response.ok) {
				throw new Error('Network response was not ok ' + response.statusText);
			}
			return response.json();
		})
		.then((data) => {
			return data as CoinInfo[];
		})
		.catch((error) => {
			console.error('An error occurred:', error);
			throw new Error('An error occurred:', error);
		})
		.finally(() => {
			if (callback) callback();
		});
};

export const getCoinData = async (coinId: string) => {
	let coinDataEndpoint = `${API_URL}/coin`;

	return fetch(`${coinDataEndpoint}?id=${coinId}`)
		.then((response) => {
			if (!response.ok) {
				throw new Error('Network response was not ok ' + response.statusText);
			}
			return response.json();
		})
		.then((data) => {
			return data[0] as CoinMarketData;
		})
		.catch((error) => {
			console.error('An error occurred:', error);
			throw new Error('An error occurred:', error);
		});
};

export const formatCurrency = (number: number) => {
	if (number > 0 && number < 0.001) {
		// Handle very small positive numbers with custom notation
		const exponent = Math.floor(Math.log10(number)) + 1; // Number of leading zeros
		const significantDigits = (number * Math.pow(10, -exponent)).toFixed(3).slice(2);
		return `$0.0<sup>${Math.abs(exponent) - 1}</sup>${significantDigits}`;
	} else {
		// Determine the number of decimal places
		const decimalPlaces =
			number % 1 === 0 ? 2 : number.toString().split('.')[1]?.length > 2 ? 3 : 2;

		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: decimalPlaces,
			maximumFractionDigits: decimalPlaces
		}).format(number);
	}
};

export interface CoinMarketData {
	id: string;
	symbol: string;
	name: string;
	image: string;
	current_price: number;
	ath: number;
	ath_date: string;
}

export interface CoinInfo {
	id: string;
	name: string;
	api_symbol: string;
	symbol: string;
	market_cap_rank: number;
	thumb: string;
	large: string;
}

export interface WalletCoin {
	id: string;
	symbol: string;
	name: string;
	image: string;
	current_price: number;
	ath: number;
	ath_date: string;
	quantity: number;
	current_value: number;
	ath_value: number;
}
